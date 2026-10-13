const express = require("express");
const mongoose = require("mongoose");

const healthRouter = express.Router();

healthRouter.get("/", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  const statusCode = databaseConnected ? 200 : 503;

  return res.status(statusCode).json({
    status: databaseConnected ? "ok" : "unavailable",
    database: databaseConnected ? "connected" : "disconnected",
    requestId: req.id,
  });
});

module.exports = healthRouter;
