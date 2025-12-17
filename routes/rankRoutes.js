const express = require("express");
const {
  savedRank,
  getRank,
  getRanks,
} = require("../controllers/rankController");
 
const router = express.Router();
 
router.get("/:seasonId", getRanks);
 
module.exports = router