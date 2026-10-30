const IORedis = require("ioredis");
const { log } = require("../utils/logger");

function createRedisConnection({ connectionName, maxRetriesPerRequest = null, enableOfflineQueue = true } = {}) {
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest,
    enableOfflineQueue,
    enableReadyCheck: true,
    connectionName,
  });

  connection.on("error", (error) => {
    // BullMQ retries transient Redis failures; logging here keeps the service observable.
    log("error", "redis_connection_error", {
      connectionName,
      error: error.message,
    });
  });

  return connection;
}

module.exports = { createRedisConnection };
