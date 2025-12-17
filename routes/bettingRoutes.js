const express = require("express");
const router = express.Router();
const {
  placeBet,
  handleMatchEnd,
  getUserBets,
  updateBet,
  deleteBet,
} = require("../controllers/bettingController");

// Route to place a bet
router.post("/bet/placebet", placeBet);

// Route to handle end of match
router.post("/bet/handle-match-end/:matchId", handleMatchEnd);

// Route to get user bets
router.get("/bet/user-bets/:userId", getUserBets);
router.put("/bet/update/:id", updateBet);
router.delete("/bet/user-bets/:id", deleteBet);

module.exports = router;
