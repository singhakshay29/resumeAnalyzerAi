require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

module.exports = async (req, res) => {
    await connectToDB();
  
    return app(req, res);
  };


module.exports = app;