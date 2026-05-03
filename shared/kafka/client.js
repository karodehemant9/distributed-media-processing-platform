require("dotenv").config();

const { Kafka } = require("kafkajs");

module.exports = new Kafka({
  clientId: "media-platform",

  brokers: [process.env.KAFKA_BROKER],
});
