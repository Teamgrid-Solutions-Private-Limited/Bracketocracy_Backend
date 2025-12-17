const express = require("express");
const RoundController = require("../controllers/roundController");

const router = express.Router();

router.post("/round/create", RoundController.addRound);
router.get("/round/view", RoundController.viewRound);
router.delete("/round/delete/:id", RoundController.deleteRound);
router.put("/round/editround/:id", RoundController.updateRound);
 
router.get("/round/searchslug/:slug", RoundController.searchRoundBySlug);
 
 
module.exports = router;
