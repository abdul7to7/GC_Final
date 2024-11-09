const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const GroupMessageArchive = sequelize.define("group_message_archive", {
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
});

module.exports = GroupMessageArchive;
