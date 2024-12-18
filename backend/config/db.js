const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

const connectDB = async () => {
    try {
        await client.connect();
        console.log("MongoDB connected...");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

const getDB = () => client.db("chessDB");

module.exports = { connectDB, getDB };