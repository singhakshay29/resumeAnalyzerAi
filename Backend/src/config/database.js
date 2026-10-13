const mongoose = require("mongoose");
const { log } = require("../utils/logger");

let connectionPromise;

mongoose.connection.on("disconnected", () => {
  connectionPromise = undefined;
});

async function connectToDB() {
  if (mongoose.connection.readyState === 1) return;
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
  }).then((db) => {
    log("info", "database_connected");
    return db;
  }).catch((error) => {
    connectionPromise = undefined;
    log("error", "database_connection_failed", { error: error.message });
    throw error;
  });

  return connectionPromise;
}

module.exports = connectToDB;
