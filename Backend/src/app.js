const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors");
const path = require("path");
const authRoute = require("./routes/auth.route");
const interviewRoute = require("./routes/ai.route");

const app = express();


app.use(cookieParser())
app.use(express.static("public"));
app.use(cors());

app.use((req, res, next) => {
  if (req.is("multipart/form-data")) {
    return next();
  }
  express.json()(req, res, next);
});


app.use("/api/auth", authRoute);
app.use("/api/interview", interviewRoute);

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
