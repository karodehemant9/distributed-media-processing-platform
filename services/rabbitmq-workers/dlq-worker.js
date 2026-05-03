const connectRabbit = require("../../shared/events/rabbitmq");

const logger = require("../../shared/logger");

const { QUEUES } = require("../../shared/events/constants");

async function start() {
  const connection = await connectRabbit();

  const channel = await connection.createChannel();

  channel.consume(
    QUEUES.DLQ,

    (message) => {
      logger.error({
        message: "Dead letter received",
      });

      channel.ack(message);
    },
  );
}

start();
