const mongoose = require("mongoose");

const sponsorSchema = mongoose.Schema({
  companyName: {
    type: String,
    required:true,
  },
  website: {
    type: String,
    required:true,
  },
  logo: {
    type: String,
    required:true,
  },
 
  status: {
    type: String,
    enum: ['yes', 'no'], // Only allow 'yes' or 'no'
    default: 'no',       // Default value set to 'no'
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

sponsorModel = mongoose.model("sponsors", sponsorSchema);
module.exports = sponsorModel;
