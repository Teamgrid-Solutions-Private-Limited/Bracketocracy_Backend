const express = require("express");
const { registerDeviceToken } = require("../controllers/deviceController");

const router = express.Router();

// Route for registering push token
router.post("/registerPushToken", registerDeviceToken);

module.exports = router;
