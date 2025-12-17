 

const express = require("express");
const {
  sendNotification,
  sendNotificationsToMultipleUsers,
} = require("../controllers/pushnotificationController");
const router = express.Router();
// Import the controller

// Route to send notification to a single user
router.post("/sendNotificationToUser", sendNotification);
router.post(
  "/sendNotificationToUser/multiple",
  sendNotificationsToMultipleUsers
);

module.exports = router;
