const mongoose = require("mongoose");
const team = require("./teamSchema");

const matchSchema = mongoose.Schema({
  teamOneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
    required: true,
  },
  teamTwoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
    required: true,
  },
  teamOneScore: {
    type: Number,
  },
  teamTwoScore: {
    type: Number,
  },
  decidedWinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
  },
  status: { type: String, default: "upcoming" },
  roundSlug: {
    type: String,
  },
  zoneSlug: {
    type: String,
  },
  matchNo: {
    type: Number,
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seasons",
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

const matchModel = mongoose.model("matches", matchSchema);

module.exports = matchModel;
