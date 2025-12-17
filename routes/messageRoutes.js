const express = require('express');
const router = express.Router();
const MC = require('../controllers/messageController');
const checkUser = require('../middleware/checkUser');

 

// Route to add a new message
router.post('/message/add/:id',MC.addMessage);

// Route to get all messages for a league
router.get('/message/show/:id', MC.showAllMessages);

 

module.exports = router;
