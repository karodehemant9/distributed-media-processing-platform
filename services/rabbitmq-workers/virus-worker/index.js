const connectRabbit = require("../../../shared/events/rabbitmq");

const logger = require("../../../shared/logger");

const { EXCHANGES, QUEUES } = require("../../../shared/events/constants");

async function start() {
  const connection = await connectRabbit();

  const channel = await connection.createChannel();

  await channel.assertExchange(
    EXCHANGES.MEDIA_FANOUT,

    "fanout",
  );

  await channel.assertQueue(QUEUES.VIRUS);

  await channel.bindQueue(
    QUEUES.VIRUS,

    EXCHANGES.MEDIA_FANOUT,

    "",
  );

  channel.consume(
    QUEUES.VIRUS,

    (message) => {
      const event = JSON.parse(message.content.toString());

      logger.info({
        worker: "virus",

        file: event.fileName,
      });

      channel.ack(message);
    },
  );
}

start();
