const { Redis } = require("@upstash/redis");
const dotenv = require("dotenv");

dotenv.config();

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis;

if (url && token) {
  redis = new Redis({
    url: url,
    token: token,
  });
  console.log("Upstash Redis (REST) Client Initialized 🔥");
} else {
  console.warn("⚠️  Upstash Redis credentials missing. Performance caching disabled.");
}

// Shim for ioredis compatibility
const redisClient = {
  // Property to simulate ioredis 'ready' status
  status: (url && token) ? "ready" : "disabled",

  // Core methods
  get: async (key) => (redis ? await redis.get(key) : null),
  set: async (key, val, options) => (redis ? await redis.set(key, val, options) : null),
  del: async (key) => (redis ? await redis.del(key) : null),
  
  // Shim for ioredis setex(key, seconds, value)
  setex: async (key, seconds, value) => {
    if (!redis) return null;
    return await redis.set(key, value, { ex: seconds });
  },

  // Shim for ioredis flushdb()
  flushdb: async () => {
    if (!redis) return null;
    return await redis.flushdb();
  },

  // No-ops for REST client (stateless)
  on: (event, cb) => {
    // We can simulate 'connect' for logging purposes if we want
    if (event === "connect" && (url && token)) {
        // We delay this slighty to mimic async connection
        setTimeout(cb, 0);
    }
  },
  quit: async () => {
    // REST clients don't need to quit
    return "OK";
  },
};

module.exports = redisClient;
