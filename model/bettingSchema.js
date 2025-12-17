const mongoose = require("mongoose");

const bettingSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "matches",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  selectedWinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
  },
  status: {
    type: Number,
    default: 0,
  },
  betScore: {       // added to check the functionality in last round user can bet
                   // the points they want to place bet it should be greater than zero and lesser than actual score
    type: Number,
    default: 0,

  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seasons", //reference from season need to create
  },
  points: {
    type:Number,
    default:0,
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

const Betting = mongoose.model("bettings", bettingSchema);

module.exports = Betting;
