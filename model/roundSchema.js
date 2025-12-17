 

const mongoose = require("mongoose");

const roundSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true, // Ensures slugs are unique to avoid conflicts
  },
  playDate: {
    type: Date, // Use Date type instead of String for better date handling
    required: true,
  },
  biddingEndDate: {
    type: Date, // Use Date type instead of String
    required: true,
  },
  roundNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String, // Use string to represent different states
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming", // Default to upcoming
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to season collection
    ref: "seasons",
    required: true,
  },
  totalMatch: {
    type: Number,
  },
  completed: {
    type: Boolean, // To track if the round is completed
    default: false,
  },
  winnerTeamId: {
    type: mongoose.Schema.Types.ObjectId, // Optional: Store the winner of the final round (if applicable)
    ref: "teams",
  },
  archived: { type: Boolean, default: false }, // Add this field
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

const roundModel = mongoose.model("rounds", roundSchema);

module.exports = roundModel;
