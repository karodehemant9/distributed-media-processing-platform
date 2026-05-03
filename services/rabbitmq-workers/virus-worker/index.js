const connectRabbit = require("../../../shared/events/rabbitmq");

const logger = require("../../../shared/logger");

const { EXCHANGES, QUEUES } = require("../../../shared/events/constants");

async function start() {
  const connection = await connectRabbit();

  const channel = await connection.createChannel();

  channel.prefetch(1);

  await channel.assertQueue(QUEUES.VIRUS);

  channel.consume(
    QUEUES.VIRUS,

    (message) => {
      const event = JSON.parse(message.content.toString());

      event.retryCount ||= 0;

      logger.info({
        worker: "virus",

        file: event.fileName,
      });

      const failed = Math.random() < 0.4;

      if (failed) {
        event.retryCount++;

        if (event.retryCount >= 3) {
          channel.publish(
            EXCHANGES.DLX,

            "failed",

            Buffer.from(JSON.stringify(event)),
          );

          logger.error({
            message: "Moved to DLQ",

            event,
          });
        } else {
          channel.sendToQueue(
            QUEUES.RETRY,

            Buffer.from(JSON.stringify(event)),
          );

          logger.warn({
            message: "Retrying later",

            event,
          });
        }

        channel.ack(message);

        return;
      }

      setTimeout(
        () => {
          logger.info({
            message: "Virus scan complete",

            event,
          });

          channel.ack(message);
        },

        2000,
      );
    },
  );
}

start();
