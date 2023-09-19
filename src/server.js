require("dotenv").config({ path: "../.env" });
const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./secret");

app.listen(PORT, () => {
  console.log(`Authentication server is running on PORT ${PORT}`);
  connectDB();
});
