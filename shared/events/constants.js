module.exports = {
  EXCHANGES: {
    MEDIA_FANOUT: "media.fanout",

    DLX: "media.dlx",
  },

  QUEUES: {
    VALIDATOR: "validator.queue",

    THUMBNAIL: "thumbnail.queue",

    COMPRESSION: "compression.queue",

    VIRUS: "virus.queue",

    RETRY: "media.retry.queue",

    DLQ: "media.dlq",
  },
};
