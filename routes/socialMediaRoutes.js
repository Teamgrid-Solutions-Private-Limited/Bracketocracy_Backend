const express = require('express');
const router = express.Router();
 
const {addSocial, showAll, socialDelete, updateSocial, searchSocial} = require('../controllers/socialmediaController');



 

router.post('/socialmedia/create',addSocial);
router.get('/socialmedia/view',showAll);
router.get('/socialmedia/viewBy/:id', searchSocial);
router.put('/socialmedia/update/:id',updateSocial);
router.delete('/socialmedia/delete/:id',socialDelete);

module.exports = router;