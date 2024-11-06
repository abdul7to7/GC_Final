const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const User = sequelize.define(
  "user",
  {
    id: {
      type: Sequelize.INTEGER,
      nullAllowed: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: Sequelize.STRING,
      nullAllowed: false,
    },
    mail: {
      type: Sequelize.STRING,
      nullAllowed: false,
      unique: true,
    },
    phoneno: {
      type: Sequelize.STRING,
      nullAllowed: false,
    },
    password: {
      type: Sequelize.STRING,
      nullAllowed: false,
    },
  },
  {
    tableName: "users",
  }
);
module.exports = User;
