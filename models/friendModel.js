const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const Friend = sequelize.define(
  "friend",
  {
    id: {
      type: Sequelize.INTEGER,
      nullAllowed: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users", // the name of the User table
        key: "id", // the primary key in the User table
      },
    },
    friendId: {
      type: Sequelize.INTEGER,
      nullAllowed: false,
      references: {
        model: "users", // the name of the User table
        key: "id", // the primary key in the User table
      },
    },
    isFriends: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: Sequelize.ENUM("available", "requested", "pending", "accepted"),
      defaultValue: "available",
    },
    requestedBy: {
      type: Sequelize.STRING,
      allowedNull: false,
    },
  },
  {
    tableName: "friends",
  }
);
module.exports = Friend;
