const cron = require("node-cron");
const Message = require("../models/messageModel");
const MessageArchive = require("../models/messageArchiveModel");
const GroupMessage = require("../models/groupMessageModel");
const GroupMessageArchive = require("../models/groupMessageArchiveModel");
const { deleteAllFilesFromBucket } = require("../controllers/fileControllers");

const timezone = "Asia/Kolkata";

cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("Running the scheduled job to archive old messages...");
    try {
      MessageArchive.sync();

      const records = await Message.findAll({ raw: true });
      if (records.length > 0) {
        const newRecords = records.map(({ id, ...rest }) => ({ ...rest }));
        await MessageArchive.bulkCreate(newRecords);
        await Message.destroy({
          truncate: true,
        });
        console.log(
          "Private chat successfully archived and original table truncated."
        );
      } else {
        console.log("No data found to archive.");
      }
    } catch (error) {
      console.error("Error archiving data:", error);
    }
    try {
      GroupMessageArchive.sync();
      const g_records = await GroupMessage.findAll({ raw: true });
      if (g_records.length > 0) {
        const g_newRecords = g_records.map(({ id, ...rest }) => ({ ...rest }));
        await GroupMessageArchive.bulkCreate(g_newRecords);
        await GroupMessage.destroy({
          truncate: true,
        });
        console.log(
          "group chat successfully archived and original table truncated."
        );
      } else {
        console.log("No data found to archive.");
      }
    } catch (error) {
      console.error("Error archiving data:", error);
    }
    try {
      await deleteAllFilesFromBucket();
    } catch (error) {
      console.error("Error archiving data:", error);
    }
  },
  {
    scheduled: true,
    timezone: timezone,
  }
);

console.log(`Cron job scheduled to run daily at midnight in ${timezone}.`);
