const Users = require("../models/userModel");
const bcrypt = require('bcrypt')

const signUp = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        status: 'Error',
        message: "Invalid Input fields"
      });
    }

    if (!/^[a-zA-Z ]*$/.test(name)) {
      return res.status(400).json({
        status: 'Error',
        message: "Invalid name entered"
      });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({
        status: 'Error',
        message: "Invalid email entered"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: 'Error',
        message: "Password is too short"
      });
    }

    // Check if the user already exists
    const existingUser = await Users.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        status: 'Error',
        message: "User already exists"
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
      status: 'Ok',
      payload: [newUser]
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({
      status: 'Error',
      message: "Internal server error"
    });
  }
};

module.exports = { signUp };
