require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");
const { log } = require("./src/utils/logger");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {

    await connectToDB();

    app.listen(PORT, () => {
      log("info", "server_started", { port: PORT });
    });

  } catch (error) {
    log("error", "database_connection_failed", { error: error.message });
  }
}

startServer();
