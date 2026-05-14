const jwt = require("jsonwebtoken");
const tokenblacklistModal = require("../models/blacklist.model");

async function authUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const blacklistToken = await tokenblacklistModal.findOne({ token });
  
  if(blacklistToken){
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { authUser };
