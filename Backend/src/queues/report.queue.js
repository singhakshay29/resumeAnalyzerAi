const { Queue } = require("bullmq");
const { createRedisConnection } = require("../config/redis");
const { GENERATE_REPORT_JOB, REPORT_QUEUE_NAME } = require("./report.constants");

let reportQueue;

function getReportQueue() {
  if (!reportQueue) {
    reportQueue = new Queue(REPORT_QUEUE_NAME, {
      connection: createRedisConnection({
        connectionName: "resume-analyzer-report-queue",
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      }),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { age: 24 * 60 * 60, count: 1000 },
        removeOnFail: { age: 7 * 24 * 60 * 60, count: 5000 },
      },
    });
  }
  return reportQueue;
}

async function enqueueReportGeneration({ reportId, userId, resumeFile, selfDescription, jobDescription, requestId }) {
  if (!reportId || !userId || !selfDescription || !jobDescription) {
    throw new TypeError("reportId, userId, selfDescription, and jobDescription are required to enqueue a report");
  }

  return getReportQueue().add(GENERATE_REPORT_JOB, {
    reportId: String(reportId),
    userId: String(userId),
    resumeFile: resumeFile ? {
      contentBase64: resumeFile.buffer.toString("base64"),
      originalName: resumeFile.originalname,
      mimeType: resumeFile.mimetype,
      sizeBytes: resumeFile.size,
    } : null,
    selfDescription,
    jobDescription,
    requestId,
  }, { jobId: String(reportId) });
}

module.exports = {
  GENERATE_REPORT_JOB,
  REPORT_QUEUE_NAME,
  enqueueReportGeneration,
  getReportQueue,
};
