require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");

let connectionPromise;

module.exports = async function handler(req, res) {
  try {
    connectionPromise ??= connectToDB();
    await connectionPromise;
  } catch (error) {
    connectionPromise = undefined;
    console.error("Database connection failed:", error);
    return res.status(503).json({ message: "Database unavailable" });
  }

  return app(req, res);
};
