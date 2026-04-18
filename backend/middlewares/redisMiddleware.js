const redisClient = require("../utils/redisClient");

const cacheMiddleware = (durationInSeconds = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    const start = performance.now();

    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        const duration = (performance.now() - start).toFixed(2);
        console.log(`[CACHE HIT] 🚀 Serving ${key} from Redis | Time: ${duration}ms`);
        const data = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
        return res.json(data);
      }

      console.log(`[CACHE MISS] 🐢 Fetching ${key} from MongoDB`);

      // Intercept res.json to save data to cache before sending
      const originalSend = res.json;
      res.json = function (data) {
        const duration = (performance.now() - start).toFixed(2);
        console.log(`[DONE] ✅ Finished fetching ${key} | Total Time: ${duration}ms`);
        
        // ONLY cache successful 200/201 responses
        if (redisClient.status === "ready" && (res.statusCode === 200 || res.statusCode === 201)) {
          redisClient.setex(key, durationInSeconds, JSON.stringify(data)).catch(err => console.error("Redis setex error:", err));
        }
        originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Redis Cache Error:", error);
      next(); // Fail transparently if redis is down
    }
  };
};

module.exports = cacheMiddleware;
