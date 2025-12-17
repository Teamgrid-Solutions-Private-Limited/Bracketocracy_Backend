const mongoose = require("mongoose");

const socialMediaSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  google:{
    type: String,
  },
  facebook: {
    type: String,
  },
  twitter: {
    type: String,
  },
  instagram: {
    type: String,
  },
  linkedin: {
    type: String,
  },
  apple:{
    type: String
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

const socialMediaModel = mongoose.model(
  "usersocialmedias",
  socialMediaSchema
);
module.exports = socialMediaModel;
