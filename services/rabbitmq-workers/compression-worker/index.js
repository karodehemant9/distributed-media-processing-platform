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

  await channel.assertQueue(QUEUES.COMPRESSION);

  await channel.bindQueue(
    QUEUES.COMPRESSION,

    EXCHANGES.MEDIA_FANOUT,

    "",
  );

  channel.consume(
    QUEUES.COMPRESSION,

    (message) => {
      const event = JSON.parse(message.content.toString());

      logger.info({
        worker: "compression",

        file: event.fileName,
      });

      channel.ack(message);
    },
  );
}

start();
