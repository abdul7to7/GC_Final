const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const MessageArchive = sequelize.define("message_archive", {
  roomId: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
  message: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
  isFile: {
    type: Sequelize.BOOLEAN,
    nullAllowed: false,
  },
  fileKey: {
    type: Sequelize.STRING,
    nullAllowed: true,
  },
  receiverId: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
});

module.exports = MessageArchive;
