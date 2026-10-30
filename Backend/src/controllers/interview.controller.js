const mongoose = require("mongoose");
const { createHash } = require("crypto");
const interviewReportModal = require('../models/interview.modal');
const generateInterviewPdf = require('../utils/generate');
const { log } = require('../utils/logger');
const { enqueueReportGeneration } = require("../queues/report.queue");

async function generateInterviewReportController(req,res){ 
    try {
        const {selfDescription,jobDescription}=req.body;
        if (!selfDescription || !jobDescription) {
            return res.status(400).json({
              success: false,
              message: "selfDescription and jobDescription are required",
            });
          }
        const idempotencyKey = req.get("Idempotency-Key");
        if (!idempotencyKey || idempotencyKey.length > 128 || !/^[\w.:/-]+$/.test(idempotencyKey)) {
          return res.status(400).json({ success: false, message: "Idempotency-Key must be 1–128 letters, numbers, or . _ : / - characters" });
        }
        const requestFingerprint = createHash("sha256").update(JSON.stringify({
          selfDescription,
          jobDescription,
          resumeDigest: req.file ? createHash("sha256").update(req.file.buffer).digest("hex") : null,
        })).digest("hex");

        const sendExistingJob = (existingReport) => {
          if (existingReport.requestFingerprint !== requestFingerprint) {
            return res.status(409).json({ success: false, message: "This Idempotency-Key was already used with different report inputs" });
          }
          return res.status(202).json({
            success: true,
            jobId: String(existingReport.id),
            data: existingReport,
          });
        };

        const existingReport = await interviewReportModal.findOne({ user: req.user.id, idempotencyKey });
        if (existingReport) return sendExistingJob(existingReport);

        const interviewReport = new interviewReportModal({
            user:req.user.id,
            selfDescription,
            jobDescription,
            title: "Interview report in progress",
            status: "queued",
            idempotencyKey,
            requestFingerprint,
            resumeMetadata: req.file ? {
              originalName: req.file.originalname,
              mimeType: req.file.mimetype,
              sizeBytes: req.file.size,
            } : undefined,
        });
        interviewReport.queueJobId = String(interviewReport.id);
        try {
          await interviewReport.save();
        } catch (saveError) {
          if (saveError.code !== 11000) throw saveError;
          const duplicateReport = await interviewReportModal.findOne({ user: req.user.id, idempotencyKey });
          if (duplicateReport) return sendExistingJob(duplicateReport);
          throw saveError;
        }

        try {
          await enqueueReportGeneration({
            reportId: interviewReport.id,
            userId: req.user.id,
            resumeFile: req.file,
            selfDescription,
            jobDescription,
            requestId: req.id,
          });
        } catch (queueError) {
          await interviewReportModal.updateOne({ _id: interviewReport._id }, {
            $set: {
              status: "failed",
              title: "Interview report failed",
              processingError: "Report processing could not be started",
              processingFailureCode: "QUEUE_ENQUEUE_FAILED",
            },
          });
          throw queueError;
        }

        return res.status(202).json({
            success:true,
            jobId: String(interviewReport.id),
            data:interviewReport
        })
    } catch (error) {
        log("error", "interview_report_generation_failed", {
            requestId: req.id,
            error: error.message,
        });
        return res.status(503).json({
            success:false,
            message:"Report processing is temporarily unavailable"
        })
    }
   
    
}

async function getInterviewReportById(req,res){
    const {id}=req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Invalid report ID" });
    }
    try {
        const interviewReport = await interviewReportModal.findOne({_id:id,user:req.user.id});
        if(!interviewReport){
            return res.status(404).json({
                success:false,
                message:"Interview report not found"
            })
        }
        if (interviewReport.status === "failed") {
            return res.status(422).json({
                success: false,
                message: interviewReport.processingError || "Interview report processing failed",
                data: interviewReport,
            });
        }
        res.status(200).json({
            success:true,
            data:interviewReport
        })
    } catch (error) {
        log("error", "interview_report_fetch_failed", { requestId: req.id, error: error.message });
        res.status(500).json({
            success:false,
            message:"Failed to fetch interview report"
        })
    }
}

async function getAllInterviewReportsByUser(req,res){
    try {
        const interviewReports = await interviewReportModal.find({user:req.user.id}).sort({createdAt:-1}).select('-resumeText -selfDescription -jobDescription -__v -technicalQuestions.answer -behaviourQuestions.answer');
        res.status(200).json({
            success:true,
            data:interviewReports
        })
    } catch (error) {
        log("error", "interview_reports_fetch_failed", { requestId: req.id, error: error.message });
        res.status(500).json({
            success:false,
            message:"Failed to fetch interview reports"
        })
    }
}

async function downloadReport (req, res){
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: "Invalid report ID" });
      }
  
      const report = await interviewReportModal.findOne({ _id: id, user: req.user.id });
  
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }
  
      generateInterviewPdf(report, res);
    } catch (error) {
      log("error", "interview_report_download_failed", {
        requestId: req.id,
        error: error.message,
      });
  
      res.status(500).json({
        success: false,
        message: "Failed to generate PDF",
      });
    }
  };

async function updateSavedStatus(req, res) {
  const { saved } = req.body;
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid report ID" });
  }
  if (typeof saved !== "boolean") {
    return res.status(400).json({ success: false, message: "saved must be a boolean" });
  }

  try {
    const report = await interviewReportModal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { isSaved: saved } },
      { new: true, runValidators: true },
    ).select("_id isSaved");

    if (!report) {
      return res.status(404).json({ success: false, message: "Interview report not found" });
    }

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    log("error", "saved_job_update_failed", { requestId: req.id, error: error.message });
    return res.status(500).json({ success: false, message: "Failed to update saved job" });
  }
}

async function updatePreparationProgress(req, res) {
  const { day, taskIndex, completed } = req.body;
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid report ID" });
  }
  if (!Number.isInteger(day) || day < 1 || !Number.isInteger(taskIndex) || taskIndex < 0 || typeof completed !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "day, taskIndex, and completed must be valid values",
    });
  }

  try {
    const report = await interviewReportModal.findOne({ _id: req.params.id, user: req.user.id });
    if (!report) {
      return res.status(404).json({ success: false, message: "Interview report not found" });
    }

    const planDay = report.preparationPlan.find((item) => item.day === day);
    if (!planDay || typeof planDay.task[taskIndex] !== "string") {
      return res.status(404).json({ success: false, message: "Preparation task not found" });
    }

    const taskKey = `${day}:${taskIndex}`;
    const completedKeys = new Set(report.completedTaskKeys || []);
    if (completed) completedKeys.add(taskKey);
    else completedKeys.delete(taskKey);
    report.completedTaskKeys = [...completedKeys];
    await report.save();

    return res.status(200).json({
      success: true,
      data: { completedTaskKeys: report.completedTaskKeys },
    });
  } catch (error) {
    log("error", "preparation_progress_update_failed", { requestId: req.id, error: error.message });
    return res.status(500).json({ success: false, message: "Failed to update preparation progress" });
  }
}

module.exports={generateInterviewReportController,getInterviewReportById,getAllInterviewReportsByUser,downloadReport,updateSavedStatus,updatePreparationProgress}
