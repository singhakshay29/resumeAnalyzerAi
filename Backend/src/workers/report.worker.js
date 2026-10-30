const { UnrecoverableError, Worker } = require("bullmq");
const pdfParse = require("pdf-parse");
const { createRedisConnection } = require("../config/redis");
const { GENERATE_REPORT_JOB, REPORT_QUEUE_NAME } = require("../queues/report.constants");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interview.modal");
const { log } = require("../utils/logger");

const configuredPageLimit = Number(process.env.MAX_RESUME_PDF_PAGES || 20);
const MAX_RESUME_PDF_PAGES = Number.isInteger(configuredPageLimit) && configuredPageLimit > 0
  ? configuredPageLimit
  : 20;

async function processReportGeneration(job) {
  if (job.name !== GENERATE_REPORT_JOB) {
    throw new Error(`Unsupported interview report job: ${job.name}`);
  }

  const { reportId, userId, resumeFile, selfDescription, jobDescription, requestId } = job.data;
  const reportFilter = { _id: reportId, user: userId };

  try {
    await interviewReportModel.updateOne(reportFilter, {
      $set: { status: "processing", processingStartedAt: new Date() },
      $unset: { processingError: 1, processingFailureCode: 1 },
    });

    let resumeText = "";
    if (resumeFile?.contentBase64) {
      const resumeBuffer = Buffer.from(resumeFile.contentBase64, "base64");
      const pdfMetadata = await pdfParse(resumeBuffer, { max: 1 });
      if (pdfMetadata.numpages > MAX_RESUME_PDF_PAGES) {
        const pageLimitError = new UnrecoverableError(`Resume PDF exceeds the ${MAX_RESUME_PDF_PAGES}-page limit`);
        pageLimitError.userMessage = `Resume PDF must have ${MAX_RESUME_PDF_PAGES} pages or fewer.`;
        pageLimitError.failureCode = "RESUME_TOO_MANY_PAGES";
        throw pageLimitError;
      }
      const resumeContent = await pdfParse(resumeBuffer);
      resumeText = resumeContent.text;
      await interviewReportModel.updateOne(reportFilter, { $set: { resumeText } });
    }

    // generateInterviewReport parses the model output against the report Zod schema.
    const report = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    });

    const savedReport = await interviewReportModel.findOneAndUpdate(reportFilter, {
      $set: {
        ...report,
        resumeText,
        status: "completed",
        processingCompletedAt: new Date(),
      },
      $unset: { processingError: 1, processingFailureCode: 1 },
    }, { new: true, runValidators: true });

    if (!savedReport) throw new Error("Queued interview report record was not found");

    log("info", "interview_report_job_completed", { jobId: job.id, reportId, requestId });
    return { reportId };
  } catch (error) {
    const maxAttempts = Number(job.opts.attempts || 1);
    if (error instanceof UnrecoverableError || job.attemptsMade + 1 >= maxAttempts) {
      await interviewReportModel.updateOne(reportFilter, {
        $set: {
          status: "failed",
          title: "Interview report failed",
          processingError: error.userMessage || "Report analysis failed. Please try again.",
          processingFailureCode: error.failureCode || "REPORT_PROCESSING_FAILED",
        },
      });
    }
    throw error;
  }
}

function createReportWorker({ concurrency = Number(process.env.REPORT_WORKER_CONCURRENCY || 2) } = {}) {
  const worker = new Worker(REPORT_QUEUE_NAME, processReportGeneration, {
    connection: createRedisConnection({ connectionName: "resume-analyzer-report-worker" }),
    concurrency,
  });

  worker.on("completed", (job) => log("info", "interview_report_job_succeeded", { jobId: job.id }));
  worker.on("failed", (job, error) => log("error", "interview_report_job_failed", {
    jobId: job && job.id,
    requestId: job && job.data.requestId,
    error: error.message,
  }));
  worker.on("error", (error) => log("error", "report_worker_error", { error: error.message }));

  return worker;
}

module.exports = { createReportWorker, processReportGeneration };
