require("dotenv").config();

const amqp = require("amqplib");

module.exports = async function () {
  return await amqp.connect(process.env.RABBITMQ_URL);
};
