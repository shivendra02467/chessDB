const express = require('express');
const {
    getChallenges,
    getChallenge,
    postChallenge,
    acceptChallengeHandler,
    getGamesByKeywords
} = require('../controllers/challengeController');
const { authMiddleware } = require('./auth');

const router = express.Router();

router.get('/', authMiddleware, getChallenges);
router.get('/:id', authMiddleware, getChallenge);
router.post('/', authMiddleware, postChallenge);
router.post('/:id/accept', authMiddleware, acceptChallengeHandler);
router.post('/me', authMiddleware, getGamesByKeywords);

module.exports = router;
