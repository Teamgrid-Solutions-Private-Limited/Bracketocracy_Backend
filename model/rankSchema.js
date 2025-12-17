const mongoose = require("mongoose");
 
const rankSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  rank: {
    type: Number,
    default: 1,
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seasons",
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
rankSchema.index({ seasonId: 1, rank: 1,_id: 1 });
const rankModel = mongoose.model("ranks", rankSchema);
module.exports = rankModel;