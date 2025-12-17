const express=require('express');
const { updateCount, countDelete, searchById, viewAll, addCountdown } = require('../controllers/countdownController');
 


const router = express.Router();
router.post('/countdown/create',addCountdown);
router.get('/countdown/show',viewAll);
router.get('/countdown/search/:id',searchById);
router.delete('/countdown/delete/:id',countDelete);
router.put('/countdown/update/:id',updateCount);


module.exports=router;