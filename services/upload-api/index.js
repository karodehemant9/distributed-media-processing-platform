require("dotenv").config();

const express = require("express");

const fs = require("fs");

const path = require("path");

const logger = require("../../shared/logger");

const connectRabbit = require("../../shared/events/rabbitmq");

const { EXCHANGES } = require("../../shared/events/constants");

let channel;

const app = express();

app.post(
  "/upload",

  (req, res) => {
    const fileName = Date.now() + ".bin";

    const outputPath = path.join(
      __dirname,

      fileName,
    );

    const writeStream = fs.createWriteStream(outputPath);

    req.pipe(writeStream);

    req.on(
      "data",

      (chunk) => {
        logger.info({
          message: "Chunk received",

          size: chunk.length,
        });
      },
    );

    req.on(
      "end",

      () => {
        channel.publish(
          EXCHANGES.MEDIA_FANOUT,

          "",

          Buffer.from(
            JSON.stringify({
              fileName,
            }),
          ),
        );
      },
    );
  },
);

(async () => {
  const connection = await connectRabbit();

  channel = await connection.createChannel();

  await channel.assertExchange(
    EXCHANGES.MEDIA_FANOUT,

    "fanout",

    {
      durable: true,
    },
  );
})();

app.listen(
  process.env.PORT,

  () => {
    logger.info({
      message: "Upload API started",
    });
  },
);
