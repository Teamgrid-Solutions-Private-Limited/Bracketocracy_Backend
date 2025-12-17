const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  profilePhoto: { type: String },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "roles",
  },
  active: {
    type: String,
    enum: ["yes", "no"], // Only allow 'yes' or 'no'
    default: "yes",
  },
  authType: {
    type: String,
    default: "email",
  },
  socialMediaId: {
    type: String,
  },
  score: {
    type: Number,
    index: -1,
    default: 0,
  },
  rank:{
    type: Number,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  fcmToken: { type: String },
});

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
