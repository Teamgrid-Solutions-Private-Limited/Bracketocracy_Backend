// routes.js
const express = require("express");
const {
  addZone,
  viewAll,
  zoneDelete,
  updateZone,
  searchZone,
  searchZoneBySlug,
} = require("../controllers/zoneController");
const router = express.Router();

router.post("/zone/create", addZone);
router.get("/zone/viewz", viewAll);
router.delete("/zone/delete/:id", zoneDelete);
router.put("/zone/update/:id", updateZone);
router.get("/zone/viewByid/:id", searchZone);
router.get("/zone/viewByslug/:slug", searchZoneBySlug);

module.exports = router;
