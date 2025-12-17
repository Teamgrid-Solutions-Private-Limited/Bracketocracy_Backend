const express = require("express");
const { createNotification, viewAll, updatedNotification, notificationDelete } = require("../controllers/adminNotificationController");

const Router = express.Router();

Router.post("/adminnotification/create",createNotification);
Router.get("/adminnotification/showall",viewAll);
Router.put("/adminnotification/update/:id",updatedNotification);
Router.delete("/adminnotification/delete/:id",notificationDelete);

module.exports = Router;
 