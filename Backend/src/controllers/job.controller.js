const mongoose = require("mongoose");
const { Job } = require("bullmq");
const interviewReportModel = require("../models/interview.modal");
const { getReportQueue } = require("../queues/report.queue");
const { log } = require("../utils/logger");

const MAX_MANUAL_RETRIES = 2;

async function getJobStatus(req, res) {
  const { jobId } = req.params;
  if (!mongoose.isValidObjectId(jobId)) {
    return res.status(400).json({ success: false, message: "Invalid job ID" });
  }

  try {
    const report = await interviewReportModel.findOne({ _id: jobId, user: req.user.id })
      .select("_id status processingError processingFailureCode retryCount createdAt updatedAt");
    if (!report) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        jobId: String(report.id),
        reportId: String(report.id),
        status: report.status,
        error: report.status === "failed" ? report.processingError : undefined,
        failureCode: report.status === "failed" ? report.processingFailureCode : undefined,
        retryCount: report.retryCount || 0,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    });
  } catch (error) {
    log("error", "job_status_fetch_failed", { requestId: req.id, jobId, error: error.message });
    return res.status(500).json({ success: false, message: "Failed to fetch job status" });
  }
}

async function retryJob(req, res) {
  const { jobId } = req.params;
  if (!mongoose.isValidObjectId(jobId)) {
    return res.status(400).json({ success: false, message: "Invalid job ID" });
  }

  let report;
  try {
    report = await interviewReportModel.findOne({ _id: jobId, user: req.user.id });
    if (!report) return res.status(404).json({ success: false, message: "Job not found" });
    if (report.status !== "failed") {
      return res.status(409).json({ success: false, message: "Only failed jobs can be retried" });
    }
    if ((report.retryCount || 0) >= MAX_MANUAL_RETRIES) {
      return res.status(409).json({ success: false, message: "This job has reached its manual retry limit" });
    }

    const queue = getReportQueue();
    const queuedJob = await Job.fromId(queue, report.queueJobId || String(report.id));
    if (!queuedJob || await queuedJob.getState() !== "failed") {
      return res.status(409).json({
        success: false,
        message: "The failed job is no longer available to retry. Submit a new report instead.",
      });
    }

    const updatedReport = await interviewReportModel.findOneAndUpdate(
      { _id: jobId, user: req.user.id, status: "failed" },
      {
        $set: { status: "queued", title: "Interview report in progress" },
        $unset: { processingError: 1, processingFailureCode: 1, processingCompletedAt: 1 },
        $inc: { retryCount: 1 },
      },
      { new: true },
    );
    if (!updatedReport) {
      return res.status(409).json({ success: false, message: "This job is already being retried" });
    }

    try {
      await queuedJob.retry("failed", { resetAttemptsMade: true, resetAttemptsStarted: true });
    } catch (error) {
      await interviewReportModel.updateOne(
        { _id: jobId, user: req.user.id, status: "queued" },
        {
          $set: {
            status: "failed",
            title: "Interview report failed",
            processingError: "Report processing could not be restarted",
            processingFailureCode: "QUEUE_RETRY_FAILED",
          },
        },
      );
      throw error;
    }

    return res.status(202).json({
      success: true,
      jobId: String(updatedReport.id),
      data: {
        jobId: String(updatedReport.id),
        reportId: String(updatedReport.id),
        status: "queued",
        retryCount: updatedReport.retryCount,
      },
    });
  } catch (error) {
    log("error", "job_retry_failed", { requestId: req.id, jobId, error: error.message });
    return res.status(503).json({ success: false, message: "Could not retry this job right now" });
  }
}

module.exports = { getJobStatus, retryJob };
