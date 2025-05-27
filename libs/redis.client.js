const { createClient } = require("redis");
const Redis = require("ioredis");
const { config } = require("../config/config");
console.log("Redis URL: ", config.redis.url);

const DEFAULT_EXPIRATION = 30;

let redisClient = null;

async function initializeRedisClient() {
  if (!redisClient) {
    redisClient = new Redis.Cluster([
      {
        host: config.redis.host,
        port: config.redis.port,
      },
    ]);
    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    redisClient.on("connect", () => {
      console.log("Redis client connected");
    });
    redisClient.on("ready", () => {
      console.log("Redis client is ready");
    });
    await redisClient.connect();
  }
  return redisClient;
}

async function getOrSetCache(key, cb) {
  try {
    initializeRedisClient();

    const data = await redisClient.get(key);
    if (data != null) {
      return JSON.parse(data);
    } else {
      const freshData = await cb();
      await redisClient.set(key, JSON.stringify(freshData), {
        EX: DEFAULT_EXPIRATION,
      });
      return freshData;
    }
  } catch (error) {
    console.log("error", error);
  }
}

module.exports = getOrSetCache;
