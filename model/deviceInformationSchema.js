const mongoose = require("mongoose");

const deviceInformationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  expoTokens: [
    {
      type: String,
      required: true,
    },
  ],
});

// Remove the unique index
// No need for validation as per the requirements

const DeviceInfo = mongoose.model("deviceinfos", deviceInformationSchema);
module.exports = DeviceInfo;