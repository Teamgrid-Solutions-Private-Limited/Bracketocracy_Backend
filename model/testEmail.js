const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
 
  emails: [{
    type: String,
    required: true,
  
  }],
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
   
});

const testModel = mongoose.model("test_emails", testSchema);
module.exports = testModel;
