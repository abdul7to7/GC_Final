const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const File = sequelize.define("file", {
  fileName: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
  fileUrl: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
  key: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
});

module.exports = File;
