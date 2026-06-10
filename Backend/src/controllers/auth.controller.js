const userModal = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const tokenblacklistModal = require("../models/blacklist.model");
async function registerUserController(req, res) {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    const isUserAlreadyExist = await userModal.findOne({
      $or: [{ userName }, { email }],
    });

    if (isUserAlreadyExist) {
      return res.status(409).json({
        success: false,
        message:
        isUserAlreadyExist.email === email
            ? "Email is already registered"
            : "Username is already taken",
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
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("registerUserController error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create account. Please try again later.",
    });
  }
}

async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModal.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, userName: user.userName },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("loginUserController error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to login. Please try again later.",
    });
  }
}

async function logoutUserController(req, res) {
  try {
    const { token } = req.cookies;
    if (token) {
      await tokenblacklistModal.create({ token });
    }
    res.clearCookie("token");
    res.status(200).json({
      message: "User Logged out Successfully",
    });
  } catch (error) {
    console.error("logoutUserController error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getUserInfoController(req, res) {
  try {
    const user = await userModal.findById(req.user.id);
    res.status(200).json({
      message: "user info fetched successfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("getUserInfoController error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
 
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getUserInfoController,
};
