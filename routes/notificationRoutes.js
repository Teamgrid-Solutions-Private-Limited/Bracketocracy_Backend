const express = require("express");
const getUserNotifications = require("../controllers/notificationController");

const router = express.Router();

router.get("/all-notifications", getUserNotifications);

module.exports = router;
