const mongoose = require("mongoose");
const { MONGO_URL } = require("../secret");

const connectDB = async (options={}) => {
  try {
    await mongoose.connect(MONGO_URL,options);
    console.log('Connected to DB')

    mongoose.connection.on('error', (error) => {
        console.error(`DB connection error: ${error}`)
    })
  } catch (error) {
    console.error(`Could not connected to DB: ${error}`)
  }
};

module.exports = connectDB;