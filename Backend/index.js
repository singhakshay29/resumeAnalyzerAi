require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");
const { log } = require("./src/utils/logger");

module.exports = async function handler(req, res) {
  try {
    await connectToDB();
  } catch (error) {
    log("error", "database_connection_failed", { requestId: req.id, error: error.message });
    return res.status(503).json({ message: "Database unavailable" });
  }

  return app(req, res);
};
