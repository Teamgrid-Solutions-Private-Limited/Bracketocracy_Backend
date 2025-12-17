const express = require("express");
const MatchController = require("../controllers/matchController");

const router = express.Router();

router.post("/match/create", MatchController.createMatch);

// Create next round matches
router.post("/create-next-round", MatchController.createNextRound);

// Update final scores
router.put("/final-scores/:id", MatchController.finalScores);

// Get match by ID
router.get("/match/:id", MatchController.getMatchById);

// Delete match
router.delete("/match/:id", MatchController.deleteMatch);

// Update match
router.put("/match/:id", MatchController.updateMatch);

// Get all matches
router.get("/matches", MatchController.getMatch);

module.exports = router;
