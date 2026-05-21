require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

module.exports = async (req, res) => {
  try {
    await connectToDB();
    return app(req, res);
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    return res.status(500).json({ message: "Database connection failed" });
  }
  };