const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGODB_URL;
const TOKEN_KEY = process.env.TOKEN_KEY;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY;

module.exports = { PORT, MONGO_URL, TOKEN_KEY, TOKEN_EXPIRY };
