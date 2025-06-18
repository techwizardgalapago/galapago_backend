const { createClient } = require("redis");
const Redis = require("ioredis");
const { config } = require("../config/config");
console.log("Redis URL: ", config.redis.url);

const DEFAULT_EXPIRATION = 30;

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

async function getOrSetCache(key, cb) {
  try {
    // initializeRedisClient();

    const data = await redisClient.get(key);
    if (data != null) {
      return JSON.parse(data);
    } else {
      const freshData = await cb();
      await redisClient.set(
        key,
        JSON.stringify(freshData),
        "EX",
        DEFAULT_EXPIRATION
      );
      return freshData;
    }
  } catch (error) {
    console.log("error", error);
  }
}

module.exports = getOrSetCache;
