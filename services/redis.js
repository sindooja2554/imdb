const redis = require("redis");
require("dotenv").config();
let logger = require("../config/winston");
// const client = redis.createClient(process.env.REDIS_PORT);

class RedisServerClass {
  constructor() {
    this.client = redis.createClient({
      port: 6379,
      host: process.env.HOST,
    });
  }

  connect() {
    // eslint-disable-next-line no-unused-expressions
    this.client;
    this.monitor();
  }

  set(redisKey, value, callback) {
    this.client.set(redisKey, value, (error, data) => {
      if (error) {
        console.log("--", error);
        return callback(error);
      } else {
        return callback(data);
      }
    });
  }

  get(redisKey, callback) {
    this.client.get(redisKey, (error, response) => {
      if (error) {
        console.log(error);
        return callback(error);
      } else {
        console.log(response);
        return callback(response);
      }
    });
  }

  monitor() {
    this.client.on("connect", function () {
      console.log("Redis client connected");
      logger.info("Redis client connected successfully");
    });

    this.client.on("reconnecting", function () {
      logger.info("Redis client is reconnecting..");
    });

    this.client.on("warning", function () {
      logger.info("Redis client is emmiting some deprecating warnings..");
    });

    this.client.on("error", function (err) {
      logger.error("Something went wrong " + err);
    });

    this.client.on("end", function () {
      logger.log("Redis client disconnected");
    });
    this.client.on("ready", function () {
      logger.info("Redis client is ready now..");
    });
  }
}
module.exports = new RedisServerClass();
