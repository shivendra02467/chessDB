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
        challenger: challengerName,
        status: 'open',
        acceptor: null,
        moves: []
    };

    const result = await getChallengesCollection().insertOne(challenge);
    return { _id: result.insertedId, ...challenge };
}

async function listOpenChallenges() {
    return getChallengesCollection()
        .find({ status: 'open' })
        .toArray();
}

async function acceptChallenge(challengeId, acceptorName) {
    const result = await getChallengesCollection().findOneAndUpdate(
        { _id: toObjectId(challengeId), status: 'open' },
        { $set: { status: 'accepted', acceptor: acceptorName } },
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
        { $push: { moves: move } }
    );
    return result.modifiedCount > 0;
}

module.exports = {
    addMoveToChallenge,
    getChallengesCollection,
    getChallengeData,
    createChallenge,
    listOpenChallenges,
    acceptChallenge
};
