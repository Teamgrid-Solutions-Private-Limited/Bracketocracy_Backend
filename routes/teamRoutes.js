const express = require("express");
const upload = require("../middleware/fileUpload");
const {
  addTeam,
  displayAll,
  deleteTeam,
  updateTeam,
  displayById,
} = require("../controllers/teamController");
const router = express.Router();

router.post("/team/create", addTeam);
router.get("/team/view", displayAll);
router.get("/team/viewById/:id", displayById);
router.delete("/team/delete/:id", deleteTeam);
router.put("/team/update/:id", updateTeam);

module.exports = router;
