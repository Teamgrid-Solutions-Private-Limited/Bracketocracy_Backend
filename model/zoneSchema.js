const mongoose = require("mongoose");

const zoneSchema = mongoose.Schema({
  zoneName: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
  },
  status: {
    type: Boolean,
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

const zoneModel = mongoose.model("zones", zoneSchema);

module.exports = zoneModel;
