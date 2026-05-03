const createConsumer = require("../../../shared/kafka/consumer");

const { TOPICS } = require("../../../shared/kafka/constants");

const consumer = createConsumer("analytics-group");

const stats = {
  validated: 0,

  thumbnails: 0,

  compressed: 0,

  scanned: 0,
};

async function start() {
  await consumer.connect();

  await consumer.subscribe({
    topic: TOPICS.MEDIA_EVENTS,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      switch (event.type) {
        case "video.validated":
          stats.validated++;

          break;

        case "thumbnail.created":
          stats.thumbnails++;

          break;

        case "compression.completed":
          stats.compressed++;

          break;

        case "virus.scan.completed":
          stats.scanned++;

          break;
      }

      console.clear();

      console.table(stats);
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
