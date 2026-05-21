const mongoose = require("mongoose");

let isConnected = false;

async function connectToDB() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    isConnected = db.connections[0].readyState;

    console.log("Connected to Database");
  } catch (error) {
    console.log("DB ERROR:", error);
    throw error;
  }
}

module.exports = connectToDB;