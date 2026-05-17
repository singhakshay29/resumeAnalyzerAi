const mongoose = require("mongoose");

const technicalQuestionsSchema = new mongoose.Schema(
  {
    question: { type: String, required: [true, "Question is required"] },
    intention: { type: String, required: [true, "intention is required"] },
    answer: { type: String, required: [true, "Answer is required"] },
  },
  { _id: false }
);

const behaviourQuestionsSchema = new mongoose.Schema(
  {
    question: { type: String, required: [true, "Question is required"] },
    intention: { type: String, required: [true, "intention is required"] },
    answer: { type: String, required: [true, "Answer is required"] },
  },
  { _id: false }
);

const skillgapSchema = new mongoose.Schema(
  {
    skill: { type: String, required: [true, "Skill is required"] },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: [true, "Severity is required"],
    },
  },
  { _id: false }
);

const preparationPlanSchema = new mongoose.Schema(
  {
    day: { type: Number, required: [true, "Day is required"] },
    focus: { type: String, required: [true, "Focus is required"] },
    task: [{ type: String, required: [true, "Task is required"] }],
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
    },
    resumeText: { type: String },
    selfDescription: { type: String },
    matchScore: { type: Number, min: 0, max: 100 },
    technicalQuestions: [technicalQuestionsSchema],
    behaviourQuestions: [behaviourQuestionsSchema],
    skillGaps: [skillgapSchema],
    preparationPlan: [preparationPlanSchema],
    user:{type:mongoose.Schema.Types.ObjectId,ref:"users",required:true}
  },
  { timestamps: true }
);

const interviewReportModal = mongoose.model("InterviewReport", interviewSchema);

module.exports = interviewReportModal;
