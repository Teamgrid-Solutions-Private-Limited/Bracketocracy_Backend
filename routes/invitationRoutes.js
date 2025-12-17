const express = require("express");
const IC = require("../controllers/invitationController");

const Router = express.Router();

Router.post("/invitation/invite/:leagueId",IC.addInvitation); // added by league id 
Router.get("/invitation/view",IC.showAll);
Router.delete("/invitation/delete/:id",IC.deleteInvite);
Router.get("/invitation/userInvitation/:id",IC.findInvitation);
 

module.exports = Router;
 