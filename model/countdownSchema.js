const mongoose = require("mongoose");

const countdownSchema = mongoose.Schema({
  status: { type: Number,default:true },
  note: { type: String },
  date: { type: Date },
  updated: { type: Date, default: Date.now },
});

const Countdown = mongoose.model("countdowns", countdownSchema);
module.exports = Countdown;
