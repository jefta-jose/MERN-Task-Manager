const { createClient } = require("redis");

const redisClient = createClient({
  url: 'redis://:your_secure_password@localhost:6379'
}); // localhost:6379 by default

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

// Connect when this module is first imported
(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

module.exports = redisClient;