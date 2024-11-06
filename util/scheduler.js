const cron = require("node-cron");
const deleteOldMessages = require("./deleteOldMessages");

// Schedule the job to run daily at midnight in the specified timezone
const timezone = "Asia/Kolkata";

cron.schedule(
  "0 0 * * *",
  () => {
    console.log("Running the scheduled job to delete old messages...");
    deleteOldMessages();
  },
  {
    scheduled: true,
    timezone: timezone,
  }
);

console.log(`Cron job scheduled to run daily at midnight in ${timezone}.`);
