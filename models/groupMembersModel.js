const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const GroupMembers = sequelize.define("group_member", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    default: false,
  },
});

module.exports = GroupMembers;
