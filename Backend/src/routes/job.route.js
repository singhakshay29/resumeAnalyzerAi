const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const jobController = require("../controllers/job.controller");

const jobRouter = express.Router();

jobRouter.get("/:jobId", authMiddleware.authUser, jobController.getJobStatus);
jobRouter.post("/:jobId/retry", authMiddleware.authUser, jobController.retryJob);

module.exports = jobRouter;
