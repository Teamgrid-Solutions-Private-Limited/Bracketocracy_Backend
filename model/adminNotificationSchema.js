const mongoose = require("mongoose");

const adminNotificationSchema = new mongoose.Schema({
  notificationTitle: {
    type: String,
    required: true,
  },
  notificationText: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    default: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
 
  updated: {
    type: Date,
    default: Date.now,
  },
});

const admin = mongoose.model("adminnotifications", adminNotificationSchema);
module.exports = admin;
