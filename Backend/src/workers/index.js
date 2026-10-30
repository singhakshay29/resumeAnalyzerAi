require("dotenv").config();

const connectToDB = require("../config/database");
const { createReportWorker } = require("./report.worker");
const { log } = require("../utils/logger");

async function startWorker() {
  await connectToDB();
  const worker = createReportWorker();
  await worker.waitUntilReady();
  log("info", "report_worker_started", { concurrency: worker.concurrency });

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    log("info", "report_worker_shutdown_started", { signal });
    await worker.close();
    const mongoose = require("mongoose");
    await mongoose.disconnect();
    process.exit(0);
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

startWorker().catch((error) => {
  log("error", "report_worker_start_failed", { error: error.message });
  process.exitCode = 1;
});
