const kafka = require("./client");

module.exports = function (groupId) {
  return kafka.consumer({
    groupId,
  });
};
