const express = require("express");
const {viewAll, addTestEmail, updateEmail, deleteEmails } = require("../controllers/testController");

const Router = express.Router();
 
Router.get("/testEmail",viewAll );
 
Router.post("/addEmail",addTestEmail );

Router.put("/update/:id",updateEmail);


Router.delete("/delete/:id",deleteEmails);

module.exports = Router;
 