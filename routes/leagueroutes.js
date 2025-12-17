const express=require('express');
 const   LC = require('../controllers/leagueController');
 const authmiddleware = require('../middleware/checkUser');


const router = express.Router();
router.post('/league/create',LC.addLeague);
router.get('/league/show',LC.viewAll);
router.get('/league/search/:id',LC.searchLeague);
router.delete('/league/delete/:id',LC.leagueDelete);
router.delete('/league/user',LC.deleteUser);
router.delete('/league/pending',LC.deletePendingInvites);
router.put('/league/update/:id',authmiddleware,LC.updateLeague);
router.get('/league/searchbyId/:id',LC.searchLeagueByLeagueId); // search league by league id
// router.get('/league/listPublicLeagues',LC.listPublicLeagues);
// router.post('/league/joinPublicLeague/:id',LC.joinPublicLeague);


module.exports=router;