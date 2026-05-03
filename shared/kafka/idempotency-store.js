const processed = new Set();

module.exports = {
  has(eventId) {
    return processed.has(eventId);
  },

  add(eventId) {
    processed.add(eventId);
  },
};
