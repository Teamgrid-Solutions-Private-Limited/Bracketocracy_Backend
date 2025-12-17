 

const {
  sendNotificationToUsers,
  sendNotificationToUser,
} = require("../services/pushNotificationService");

const sendNotification = async (req, res) => {
  const { userId, title, body } = req.body;

  if (!userId || !title || !body) {
    return res
      .status(400)
      .json({ error: "userId, title, and body are required" });
  }

  try {
    const result = await sendNotificationToUser(userId, title, body);
    if (result.success) {
      return res.status(200).json({
        message: "Notification sent successfully",
        ticket: result.tickets,
      });
    } else {
      return res
        .status(500)
        .json({ error: "Failed to send notification", details: result.error });
    }
  } catch (error) {
    console.error("Error in notification controller:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};
const sendNotificationsToMultipleUsers = async (req, res) => {
  const { userIds, title, body } = req.body;

  // Check if userIds is valid
  if (!Array.isArray(userIds) || !userIds.length) {
    return res.status(400).json({
      success: false,
      message: "User IDs must be a non-empty array",
    });
  }

  // Check if title and body are provided
  if (!title || !body) {
    return res.status(400).json({
      success: false,
      message: "Both title and body are required",
    });
  }

  try {
    const result = await sendNotificationToUsers(userIds, title, body);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Notifications sent successfully",
        details: result,
      });
    } else {
      return res.status(207).json({
        success: false,
        message: "Some notifications failed to send",
        details: result,
      });
    }
  } catch (error) {
    console.error("Error sending notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = { sendNotification, sendNotificationsToMultipleUsers };
