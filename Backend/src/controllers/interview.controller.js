const pdfParse=require('pdf-parse');
const mongoose = require("mongoose");
const {generateInterviewReport} = require('../services/ai.service');
const interviewReportModal = require('../models/interview.modal');
const generateInterviewPdf = require('../utils/generate');
const { log } = require('../utils/logger');

async function generateInterviewReportController(req,res){ 
    try {
        const {selfDescription,jobDescription}=req.body;
        if (!selfDescription || !jobDescription) {
            return res.status(400).json({
              success: false,
              message: "selfDescription and jobDescription are required",
            });
          }
          let resumeText = "";
          if (req.file) {
            const resumeContent = await pdfParse(req.file.buffer);
            resumeText = resumeContent.text;
          }    
        
        
        const interviewReportByAi =await generateInterviewReport({
            resume:resumeText,
            selfDescription,
            jobDescription
        })
        
        const interviewReport = await interviewReportModal.create({
            user:req.user.id,
            resumeText:  resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        })
        res.status(200).json({
            success:true,
            data:interviewReport
        })
    } catch (error) {
        log("error", "interview_report_generation_failed", {
            requestId: req.id,
            error: error.message,
        });
        res.status(500).json({
            success:false,
            message:"Failed to generate interview report"
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
