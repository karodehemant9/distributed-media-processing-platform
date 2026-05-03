const connectRabbit = require("../../../shared/events/rabbitmq");

const {
  producer,
  connect: connectKafka,
} = require("../../../shared/kafka/producer");

const { TOPICS } = require("../../../shared/kafka/constants");

const logger = require("../../../shared/logger");

const { EXCHANGES, QUEUES } = require("../../../shared/events/constants");

async function start() {
  const connection = await connectRabbit();

  await connectKafka();

  const channel = await connection.createChannel();

  channel.prefetch(1);

  await channel.assertQueue(QUEUES.THUMBNAIL);

  await channel.assertExchange(EXCHANGES.MEDIA_FANOUT, "fanout", {
    durable: true,
  });

  await channel.bindQueue(QUEUES.THUMBNAIL, EXCHANGES.MEDIA_FANOUT, "");

  channel.consume(
    QUEUES.THUMBNAIL,

    (message) => {
      const event = JSON.parse(message.content.toString());

      event.retryCount ||= 0;

      logger.info({
        worker: "thumbnail",

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
        async () => {
          try {
            await producer.send({
              topic: TOPICS.MEDIA_EVENTS,

              messages: [
                {
                  key: event.fileName,

                  value: JSON.stringify({
                    eventId: Date.now().toString(),

                    type: "thumbnail.created",

                    fileName: event.fileName,
                  }),
                },
              ],
            });

            console.log("Sent to Kafka");
          } catch (error) {
            console.error("Kafka send failed:", error.message);
          }

          logger.info({
            message: "Thumbnail generated",

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
