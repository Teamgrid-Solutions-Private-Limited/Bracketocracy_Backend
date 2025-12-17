const mongoose = require("mongoose");
 

const leagueSchema =  mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  
  userId:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  }],
  emails:[{
    type: String,
    ref: "users",
  }],
  pendingInvites: [{ type: String }],
  
  status: {
    type: Number,
    default:true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  allowInvitation: {
    type: Boolean,
    default: false,
  },
});

const model = mongoose.model("leagues", leagueSchema);

module.exports = model;
