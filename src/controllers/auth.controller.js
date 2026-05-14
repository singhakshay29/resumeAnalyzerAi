const userModal = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const tokenblacklistModal = require("../models/blacklist.model");
async function registerUserController(req, res) {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password) {
    return res.status(400).json({ message: "Please provide all details" });
  }

  const isUserAlreadyExist = await userModal.findOne({
    $or: [{ userName }, { email }],
  });

  if (isUserAlreadyExist) {
    return res.status(400).json({
      message: "Account already Exist",
    });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await userModal.create({ userName, email, password: hash });

  const token = jwt.sign(
    { id: user._id, userName: user.userName },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.cookie("token", token);
  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
    },
  });
}

async function loginUserController(req, res) {
  const { email, password } = req.body;

  const user = await userModal.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user._id, userName: user.userName },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token);
  res.status(200).json({
    message: "User Logged in Successfully",
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
    },
  });
}

async function logoutUserController(req, res) {
  const { token } = req.cookies;
  if (token) {
    await tokenblacklistModal.create({ token });
  }
  res.clearCookie("token");
  res.status(200).json({
    message: "User Logged out Successfully",
  });
}

async function getUserInfoController(req, res) {
  const user = await userModal.findById(req.user.id);
  res.status(200).json({
    message: "user info fetched successfully",
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
    },
  });
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getUserInfoController,
};
