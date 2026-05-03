const kafka = require("./client");

const { TOPICS } = require("./constants");

async function start() {
  const admin = kafka.admin();

  await admin.connect();

  await admin.createTopics({
    topics: [
      {
        topic: TOPICS.MEDIA_EVENTS,

        numPartitions: 3,
      },

      {
        topic: TOPICS.MEDIA_RETRY,

        numPartitions: 3,
      },

      {
        topic: TOPICS.MEDIA_DLQ,

        numPartitions: 3,
      },
    ],
  });

  console.log("Kafka topics created");

  await admin.disconnect();
}

start();
