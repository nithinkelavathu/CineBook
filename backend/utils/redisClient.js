const Redis = require("ioredis");

// Use an environment variable, or fallback to sensible default for docker
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let connectionFailedLogged = false;

const redisClient = new Redis(redisUrl, {
  lazyConnect: true, // Don't connect until needed
  retryStrategy: (times) => {
    if (times > 1) {
      if (!connectionFailedLogged) {
        console.warn("⚠️  Redis (Optional) not found. Performance caching disabled.");
        connectionFailedLogged = true;
      }
      return null; // Stop retrying immediately
    }
    return 10; // Try once very quickly
  },
});

redisClient.on("connect", () => {
  console.log("Redis Connected 🔥");
});

redisClient.on("error", (err) => {
  // Silent error - we handle it with the warning in retryStrategy
});

module.exports = redisClient;
