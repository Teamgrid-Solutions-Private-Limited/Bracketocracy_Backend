const express = require("express");
const { createRole, getRoles } = require("../controllers/roleController");

const Router = express.Router();

Router.post("/role/addrole", createRole);
Router.get("/role/getrole", getRoles);

module.exports = Router;
 
