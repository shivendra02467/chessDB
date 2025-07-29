const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

function toObjectId(id) {
    if (!ObjectId.isValid(id)) {
        throw new Error('Invalid ObjectId');
    }
    return new ObjectId(id);
}

function getChallengesCollection() {
    const db = getDB();
    return db.collection('challenges');
}

async function createChallenge(challengerName) {
    const challenge = {
        White: challengerName,
        Status: 'open',
        Black: null,
        Moves: []
    };

    const result = await getChallengesCollection().insertOne(challenge);
    return { _id: result.insertedId, ...challenge };
}

async function listOpenChallenges() {
    return getChallengesCollection()
        .find({ Status: 'open' })
        .toArray();
}

async function acceptChallenge(challengeId, acceptorName) {
    const result = await getChallengesCollection().findOneAndUpdate(
        { _id: toObjectId(challengeId), Status: 'open' },
        { $set: { Status: 'accepted', Black: acceptorName } },
        { returnDocument: 'after' }
    );
    return result;
}

async function getChallengeData(challengeId) {
    const result = await getChallengesCollection().findOne(
        { _id: toObjectId(challengeId) }
    );
    return result;
}

async function addMoveToChallenge(challengeId, move) {
    const result = await getChallengesCollection().updateOne(
        { _id: toObjectId(challengeId) },
        { $push: { Moves: move } }
    );
    return result.modifiedCount > 0;
}

async function fetchGamesByKeywords(searchQuery, page) {
    try {
        const db = getDB();
        const collection = db.collection("challenges");
        const keywords = searchQuery.split(" ").map((keyword) => keyword.trim()).filter(Boolean);

        const searchConditions = keywords.map((keyword) => ({
            $or: [
                { White: { $regex: keyword, $options: "i" } },
                { Black: { $regex: keyword, $options: "i" } },
            ],
        }));

        const query = searchConditions.length > 0 ? { $and: searchConditions } : {};
        const pageNumber = parseInt(page) || 1
        const games = await collection.find(query).sort({ Date: -1 }).skip((pageNumber - 1) * 20).limit(20).toArray();
        return games;
    } catch (error) {
        console.error("Error fetching games:", error);
        throw error;
    }
}

module.exports = {
    addMoveToChallenge,
    getChallengesCollection,
    getChallengeData,
    createChallenge,
    listOpenChallenges,
    acceptChallenge,
    fetchGamesByKeywords
};
