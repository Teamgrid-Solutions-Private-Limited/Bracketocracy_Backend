// season routes.js
const express = require("express");
const SC = require("../controllers/seasonController");
const router = express.Router();

router.post("/season/create", SC.addSeason);
router.get("/season/views", SC.viewAll);
router.get("/season/viewbyid/:id", SC.searchSeason);
router.delete("/season/delete/:id", SC.seasonDelete);
router.put("/season/edit/:id", SC.updateSeason);
router.post("/season/newtournament", SC.createNewTournament);

module.exports = router;
