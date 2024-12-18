const { getDB } = require("../config/db");
const bcrypt = require("bcryptjs");

const findUserByEmail = async (email) => {
    const db = getDB();
    return db.collection("users").findOne({ email });
};

const createUser = async (user) => {
    const db = getDB();
    user.password = await bcrypt.hash(user.password, 10);
    return db.collection("users").insertOne(user);
};

module.exports = { findUserByEmail, createUser };

