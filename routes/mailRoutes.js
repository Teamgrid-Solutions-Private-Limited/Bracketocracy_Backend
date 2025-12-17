 

const express = require('express');
const router = express.Router();

// Importing the instance of EmailController
const emailController = require('../controllers/emailController');

// Define route and attach sendEmail method
router.post('/mail', (req, res) => emailController.sendEmail(req, res));
router.post('/invite', (req, res) => emailController.sendInviteEmail(req, res));

module.exports = router;
