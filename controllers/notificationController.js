const NotificationMessage = require("../model/notificationSchema");

const getUserNotifications = async (req, res) => {
  try {
    // Retrieve all notifications from the database
    const notifications = await NotificationMessage.find().sort({ sentAt: -1 }); // Sort by the most recent notifications

    if (notifications.length === 0) {
      return res.status(404).send({ message: "No notifications found." });
    }

    res.status(200).send({
      message: "All notifications retrieved successfully",
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).send({
      error: "Failed to fetch notifications",
      details: error.message,
    });
  }
};
module.exports = getUserNotifications;
