const connectRabbit = require("../../shared/events/rabbitmq");

const { EXCHANGES, QUEUES } = require("../../shared/events/constants");

async function start() {
  const connection = await connectRabbit();

  const channel = await connection.createChannel();

  await channel.assertExchange(
    EXCHANGES.DLX,

    "direct",
  );

  await channel.assertQueue(QUEUES.DLQ);

  await channel.bindQueue(
    QUEUES.DLQ,

    EXCHANGES.DLX,

    "failed",
  );

  await channel.assertQueue(
    QUEUES.RETRY,

    {
      messageTtl: 5000,

      deadLetterExchange: EXCHANGES.MEDIA_FANOUT,
    },
  );

  console.log("Retry setup done");

  process.exit(0);
}

start();
