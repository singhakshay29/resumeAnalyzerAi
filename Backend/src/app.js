const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors");
const authRoute = require("./routes/auth.route");
const interviewRoute = require("./routes/ai.route");
const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);
const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin:[
    "http://localhost:5173",
    "https://resume-analyzer-ai-lime-nine.vercel.app",
  ],
  credentials: true,
}));

app.use("/api/auth", authRoute);
app.use("/api/interview", interviewRoute);

module.exports = app;
