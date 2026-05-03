const createConsumer = require("../../../shared/kafka/consumer");

const { TOPICS } = require("../../../shared/kafka/constants");

const consumer = createConsumer("dlq-group");

async function start() {
  await consumer.connect();

  await consumer.subscribe({
    topic: TOPICS.MEDIA_DLQ,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      console.error({
        dlq: true,

        event,
      });
    },
  });
}

process.on(
  "SIGINT",

  async () => {
    console.log("Shutting down...");

    await consumer.disconnect();

    process.exit(0);
  },
);

start();
