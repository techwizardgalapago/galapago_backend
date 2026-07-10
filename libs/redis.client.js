const { createClient } = require("redis");
const Redis = require("ioredis");
const { config } = require("../config/config");
console.log("Redis URL: ", config.redis.url);

const DEFAULT_EXPIRATION = 300; // 5 minutes

let redisClient = null;

if (config.env === "development") {
  redisClient = new Redis.Cluster([
    { host: "127.0.0.1", port: 6380 },
    { host: "127.0.0.1", port: 6381 },
    { host: "127.0.0.1", port: 6382 },
  ]);
} else {
  redisClient = new Redis.Cluster(
    [
      {
        host: config.redis.host,
        port: config.redis.port,
      },
    ],
    {
      dnsLookup: (address, callback) => callback(null, address),
      redisOptions: {
        tls: {},
      },
    }
  );
}

async function getOrSetCache(key, cb, ttl = DEFAULT_EXPIRATION) {
  try {
    const data = await redisClient.get(key);
    if (data != null) {
      return JSON.parse(data);
    }
    const freshData = await cb();
    await redisClient.set(key, JSON.stringify(freshData), "EX", ttl);
    return freshData;
  } catch (error) {
    console.log("cache error, falling back to direct fetch:", error.message);
    return await cb();
  }
}

async function invalidateCache(key) {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.log("cache invalidation error", error);
  }
}

module.exports = { getOrSetCache, invalidateCache };
