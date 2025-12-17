const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema
const settingSchema = new Schema({
  settingKey: {
    type: String,
    required: true,
    unique: true,
  },
  settingValue: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
    enum: [0, 1], // Assuming status can only be 0 or 1
  },
  settingRef: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
