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
  // Un fallo de Redis degrada a lectura directa. Un fallo de la fuente de
  // datos se propaga: nunca se cachea el resultado de un error.
  let cached = null;
  try {
    cached = await redisClient.get(key);
  } catch (error) {
    console.log("cache read error, falling back to direct fetch:", error.message);
  }

  if (cached != null) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      console.log("cache entry corrupta, se relee de origen:", key);
    }
  }

  const freshData = await cb();

  try {
    await redisClient.set(key, JSON.stringify(freshData), "EX", ttl);
  } catch (error) {
    console.log("cache write error:", error.message);
  }

  return freshData;
}

async function invalidateCache(key) {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.log("cache invalidation error", error);
  }
}

// Invalida varias claves a la vez. Se usa tras cada escritura para que la
// siguiente lectura no sirva la version previa durante el TTL.
async function invalidateKeys(keys = []) {
  await Promise.all(keys.filter(Boolean).map((key) => invalidateCache(key)));
}

module.exports = { getOrSetCache, invalidateCache, invalidateKeys };
