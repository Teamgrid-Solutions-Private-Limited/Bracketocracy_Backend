const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  userIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  errorDetails: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      error: { type: String },
    },
  ],
});

const Notification = mongoose.model("notifications", notificationSchema);
module.exports = Notification;
