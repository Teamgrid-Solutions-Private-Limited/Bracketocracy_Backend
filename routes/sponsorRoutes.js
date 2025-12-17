const express = require('express');
const { addSponsor, deleteSponsor, updateSponsor, displayById, displayAll } = require('../controllers/sponsorController');

const router = express.Router();
router.post('/sponsor/add', addSponsor);
router.get("/sponsor/display", displayAll);
router.get("/sponsor/display/:id", displayById);
router.delete("/sponsor/delete/:id", deleteSponsor);
router.put("/sponsor/update/:id", updateSponsor);

module.exports =router;
