const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const Group = sequelize.define("group", {
  groupName: {
    type: Sequelize.STRING,
    nullAllowed: false,
  },
});

module.exports = Group;
