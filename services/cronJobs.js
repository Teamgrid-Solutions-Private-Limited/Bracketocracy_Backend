// jobs/cronJob.js
const cron = require("node-cron");
const PushNotificationService = require("../services/pushNotificationService");
const Device = require("../model/deviceInformationSchema");
const logger = require("../services/logger");

// Schedule the push notification task (e.g., every day at 9:00 AM)
cron.schedule("0 9 * * *", async () => {
  logger.info("Running scheduled push notification task...");

  try {
    // Fetch all device tokens
    const devices = await Device.find({});
    const deviceTokens = devices.map((device) => device.deviceToken);

    if (deviceTokens.length === 0) {
      logger.info("No devices found for scheduled notification.");
      return;
    }

    // Define the notification content
    const title = "Daily Reminder";
    const body = "This is your scheduled daily notification!";

    // Send notifications to all devices
    const response = await PushNotificationService.sendNotificationToDevices(
      deviceTokens,
      title,
      body
    );
    logger.info("Scheduled notifications sent successfully:", response);
  } catch (error) {
    logger.error("Failed to send scheduled notifications:", error.message);
  }
});
