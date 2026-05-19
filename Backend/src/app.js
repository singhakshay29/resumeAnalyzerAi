const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors");
const authRoute = require("./routes/auth.route");
const interviewRoute = require("./routes/ai.route");

const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use("/api/auth", authRoute);
app.use("/api/interview", interviewRoute);

module.exports = app;
