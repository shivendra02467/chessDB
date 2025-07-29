const {
    addMoveToChallenge,
    createChallenge,
    listOpenChallenges,
    getChallengeData,
    acceptChallenge,
    fetchGamesByKeywords
} = require('../models/challengeModel');

let ioInstance;

const setIO = (io) => {
    ioInstance = io;
};

const handleSocket = (socket) => {
    socket.on('join-lobby', () => {
        socket.join('lobby');
    });
    socket.on('join-challenge', (challengeId) => {
        socket.join(`challenge:${challengeId}`);
    });
    socket.on('make-move', async ({ challengeId, move }) => {
        await addMoveToChallenge(challengeId, move.from + move.to);
        socket.to(`challenge:${challengeId}`).emit('receive-move', move);
    });
}

const getChallenges = async (req, res) => {
    const challenges = await listOpenChallenges();
    res.json(challenges);
};

const getChallenge = async (req, res) => {
    const challenge = await getChallengeData(req.params.id);
    res.json(challenge);
};

const postChallenge = async (req, res) => {
    const challengerName = req.user.name;
    const challenge = await createChallenge(challengerName);

    ioInstance.to('lobby').emit('challenge-added', challenge);
    res.status(201).json(challenge);
};

const acceptChallengeHandler = async (req, res) => {
    const challenge = await acceptChallenge(req.params.id, req.user.name);
    if (!challenge)
        return res.status(400).json({ error: 'Challenge already accepted or not found' });

    ioInstance.to('lobby').emit('challenge-removed', req.params.id);
    ioInstance.to(`challenge:${req.params.id}`).emit('start-game', {
        challengeId: req.params.id
    });
};

async function getGamesByKeywords(req, res) {
    try {
        const { page } = req.body;
        const searchQuery = req.user.name;
        if (!searchQuery || typeof searchQuery !== "string") {
            return res.status(400).json({ message: "Invalid or missing keywords in request body" });
        }
        const games = await fetchGamesByKeywords(searchQuery, page);
        res.status(200).json({ games });
    } catch (error) {
        console.error("Error in getGamesByKeywords controller:", error);
        res.status(500).json({ message: "Failed to fetch games" });
    }
}


module.exports = {
    setIO,
    handleSocket,
    getChallenges,
    getChallenge,
    postChallenge,
    acceptChallengeHandler,
    getGamesByKeywords
};
