const mongoose = require("mongoose");

async function connectToDB() {
  try {
    if (mongoose.connections[0].readyState) {
      return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log("Connected to Database");
  } catch (error) {
    console.log("DB ERROR:", error.message);
    throw error;
  }
}

module.exports = connectToDB;
