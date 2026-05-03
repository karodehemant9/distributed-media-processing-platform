const kafka = require("./client");

const producer = kafka.producer();

let connected = false;

async function connect() {
  if (connected) {
    return;
  }

  await producer.connect();

  connected = true;

  console.log("Kafka producer connected");
}

module.exports = {
  producer,

  connect,
};
