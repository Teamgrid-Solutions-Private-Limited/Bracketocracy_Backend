const mongoose = require("mongoose");

const leagueInvitationSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, //reference to user collection
    ref: "users",
    required: true, // the id of the user to be added in the league
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId, //reference to user collection
    ref: "users", // the id of the user that had invited the user
    required: true,
  },
  leagueId: {
    type: mongoose.Schema.Types.ObjectId, //reference to league collection
    ref: "leagues",
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

const model = mongoose.model("leagueinvitations", leagueInvitationSchema);
module.exports = model;
