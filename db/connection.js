const mongoose = require("mongoose");

// Connection URI
const uri =process.env.MONGODB_URI;

const DB = mongoose.connect(uri);

DB.then(() => {
  console.log("Database successfully connected");
}).catch((err) => {
  console.log(err);
});

module.exports = DB;
