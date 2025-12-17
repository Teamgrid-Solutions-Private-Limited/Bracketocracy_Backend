const express = require("express");
const {
  createSetting,
  getSetting,
  updateSetting,
  deleteSetting,
} = require("../controllers/settingController");
const checkUser = require("../middleware/checkUser");
const checkAdmin = require("../middleware/checkAdmin");

const router = express.Router();

router.post("/setting/add", checkAdmin, createSetting);

router.get("/setting/:settingKey", checkUser, getSetting);

router.delete("/setting/delete/:settingKey", checkAdmin, deleteSetting);
router.put("/setting/update/:settingKey", checkAdmin, updateSetting);

module.exports = router;
