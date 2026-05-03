const createConsumer = require("../../../shared/kafka/consumer");

const { TOPICS } = require("../../../shared/kafka/constants");

const consumer = createConsumer("audit-group");

async function start() {
  await consumer.connect();

  await consumer.subscribe({
    topic: TOPICS.MEDIA_EVENTS,
  });

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const event = JSON.parse(message.value.toString());

      console.log({
        offset: message.offset,

        partition,

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
