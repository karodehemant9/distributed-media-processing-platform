const createConsumer = require("../../../shared/kafka/consumer");

const { producer } = require("../../../shared/kafka/producer");

const { TOPICS } = require("../../../shared/kafka/constants");

const store = require("../../../shared/kafka/idempotency-store");

const consumer = createConsumer("retry-group");

async function start() {
  await consumer.connect();

  await consumer.subscribe({
    topic: TOPICS.MEDIA_RETRY,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      if (store.has(event.eventId)) {
        console.log("Duplicate skipped");

        return;
      }

      store.add(event.eventId);

      event.retryCount ||= 0;

      event.retryCount++;

      const failed = Math.random() < 0.4;

      if (failed && event.retryCount >= 3) {
        await producer.send({
          topic: TOPICS.MEDIA_DLQ,

          messages: [
            {
              value: JSON.stringify(event),
            },
          ],
        });

        console.log("Moved to Kafka DLQ");

        return;
      }

      console.log("Retry success");
    },
  });
}

process.on(

  "SIGINT",

  async () => {

    console.log(
      "Shutting down..."
    );


    await consumer
      .disconnect();


    process.exit(
      0
    );
  }
);

start();
