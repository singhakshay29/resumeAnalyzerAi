const express = require("express");
const authMiddleware = require("../middleware/auth.middleware")
const uploadResume = require("../middleware/file.middleware");
const interviewController = require("../controllers/interview.controller");

const interviewRouter = express.Router();

interviewRouter.post('/',authMiddleware.authUser,uploadResume, interviewController.generateInterviewReportController)

interviewRouter.get('/report/:id',authMiddleware.authUser, interviewController.getInterviewReportById)

interviewRouter.get('/all_reports',authMiddleware.authUser, interviewController.getAllInterviewReportsByUser)

interviewRouter.get('/report/:id/download',authMiddleware.authUser, interviewController.downloadReport)

module.exports=interviewRouter;