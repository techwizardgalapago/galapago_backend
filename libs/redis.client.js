const { createClient } = require("redis");
const { config } = require("../config/config");
console.log("Redis URL: ", config.redis.url);

const DEFAULT_EXPIRATION = 30;

let redisClient = null;

async function initializeRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: config.redis.url,
    });
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
// if (!redisClient) {
//   redisClient = createClient("redis://127.0.0.1:6379");

//   redisClient.on("error", (err) => console.log("Redis Client Error", err));

//   redisClient.on("error", (err) => {
//     console.error("Redis Client Error", err);
//   });
//   redisClient.on("connect", () => {
//     console.log("Redis client connected");
//   });
//   redisClient.on("ready", () => {
//     console.log("Redis client is ready");
//   });
//   redisClient.on("end", () => {
//     console.log("Redis client disconnected");
//   });
//   redisClient.on("reconnecting", () => {
//     console.log("Redis client is reconnecting");
//   });
//   redisClient.on("end", () => {
//     console.log("Redis client is disconnected");
//   });
//   redisClient.on("warning", (warning) => {
//     console.warn("Redis client warning", warning);
//   });
//   redisClient.on("message", (channel, message) => {
//     console.log(`Received message from ${channel}: ${message}`);
//   });
//   redisClient.on("subscribe", (channel, count) => {
//     console.log(`Subscribed to ${channel}, count: ${count}`);
//   });
//   redisClient.on("unsubscribe", (channel, count) => {
//     console.log(`Unsubscribed from ${channel}, count: ${count}`);
//   });
//   redisClient.on("pmessage", (pattern, channel, message) => {
//     console.log(`Received message from ${pattern} ${channel}: ${message}`);
//   });
//   redisClient.on("psubscribe", (pattern, count) => {
//     console.log(`Subscribed to pattern ${pattern}, count: ${count}`);
//   });
//   redisClient.on("punsubscribe", (pattern, count) => {
//     console.log(`Unsubscribed from pattern ${pattern}, count: ${count}`);
//   });
// }

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
