const { Sequelize } = require("sequelize");

async function deleteOldMessages() {
  try {
    const moment = require("moment-timezone");
    const timezone = "Asia/Kolkata"; // Specify your timezone

    // Calculate the date 1 days ago in the specified timezone
    const dateThreshold = moment().tz(timezone).subtract(1, "days").toDate();

    // Perform the deletion
    const deletedOldMessages = await Message.destroy({
      where: {
        createdAt: {
          [Sequelize.Op.lt]: dateThreshold,
        },
      },
    });
    const deletedOldGroupMessages = await GroupMessage.destroy({
      where: {
        createdAt: {
          [Sequelize.Op.lt]: dateThreshold,
        },
      },
    });
    console.log(`Deleted ${deletedOldMessages} ${deletedOldGroupMessages}`);
  } catch (error) {
    console.error("Error deleting old messages:", error);
  }
}

module.exports = deleteOldMessages;
