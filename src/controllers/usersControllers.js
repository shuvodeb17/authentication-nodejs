const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const { TOKEN_KEY, TOKEN_EXPIRY } = process.env;
const jwt = require("jsonwebtoken");

// Sign up
const signUp = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid Input fields",
      });
    }

    if (!/^[a-zA-Z ]*$/.test(name)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid name entered",
      });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid email entered",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: "Error",
        message: "Password is too short",
      });
    }

    // Check if the user already exists
    const existingUser = await Users.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({
        status: "Error",
        message: "User already exists",
      });
    }

    // Hash password
    const hashPassword = bcrypt.hashSync(password, 10);

    // Create a new user
    const newUser = new Users({
      name,
      username,
      email,
      password: hashPassword,
    });

    await newUser.save();

    res.status(200).json({
      status: "Ok",
      users: newUser,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({
      status: "Error",
      message: "Internal server error",
    });
  }
};

//Sign in
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json({
        message: "Input fields is empty",
      });
    }

    // check user
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }

    // hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Password does not match" });
    }

    // create user token
    const token = await jwt.sign({ userId: user._id }, TOKEN_KEY, {
      expiresIn: TOKEN_EXPIRY,
    });
    user.token = token;
    return res.status(200).json({
      message: "Sign in successful",
      user: user,
      token: token,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = { signUp, signIn };
