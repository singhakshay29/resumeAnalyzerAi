const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors");
const path = require("path");
const authRoute = require("./routes/auth.route");
const interviewRoute = require("./routes/ai.route");
const healthRoute = require("./routes/health.route");
const { log } = require("./utils/logger");
const { randomUUID } = require("crypto");
const { rateLimit } = require("express-rate-limit");

const app = express();

app.set("trust proxy", 1);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, message: "Too many authentication attempts. Try again later." }),
});

const reportGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, message: "Report generation limit reached. Try again later." }),
});

app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  const startedAt = Date.now();
  res.on("finish", () => {
    log("info", "http_request", {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl.split("?")[0],
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
});


app.use(cookieParser())
app.use(express.static("public"));
app.use(cors());

app.use((req, res, next) => {
  if (req.is("multipart/form-data")) {
    return next();
  }
  express.json({ limit: "1mb" })(req, res, next);
});


app.use("/api/health", healthRoute);
app.use("/api/auth", authLimiter);
app.use("/api/interview", (req, res, next) => {
  if (req.method === "POST" && req.path === "/") return reportGenerationLimiter(req, res, next);
  return next();
});
app.use("/api/auth", authRoute);
app.use("/api/interview", interviewRoute);

app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found", requestId: req.id });
});

app.use((error, req, res, next) => {
  log("error", "unhandled_request_error", {
    requestId: req.id,
    error: error.message,
  });
  if (res.headersSent) return next(error);
  const statusCode = error.status === 413 ? 413 : 500;
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 413 ? "Request body is too large" : "Internal server error",
    requestId: req.id,
  });
});

app.use(
  express.static(
    path.join(__dirname, "../public")
  )
);

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "../public", "index.html")
  );
});

module.exports = app;
