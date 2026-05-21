
const mongoose = require("mongoose");

let connectionPromise = null;

async function connectToDB() {
  
  if (mongoose.connection.readyState === 1) {
    return;
  }

 
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 10000,
    })
    .then(() => {
      console.log("Connected to Database");
    })
    .catch((error) => {
      console.log("DB ERROR:", error);
      connectionPromise = null; 
      throw error;
    });

  return connectionPromise;
}

module.exports = connectToDB;