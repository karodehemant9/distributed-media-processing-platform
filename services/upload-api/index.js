require("dotenv").config();

const express = require("express");

const fs = require("fs");

const path = require("path");

const logger = require("../../shared/logger");

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
        logger.info({
          message: "Upload complete",
        });

        res.send("uploaded");
      },
    );
  },
);

app.listen(
  process.env.PORT,

  () => {
    logger.info({
      message: "Upload API started",
    });
  },
);
