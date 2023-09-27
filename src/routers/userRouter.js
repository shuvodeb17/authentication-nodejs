const express = require("express");
const {
  signUp,
  signIn,
  verifyToken,
  verifyOTP,
  generateOTP,
  emailVerify
} = require("../controllers/UsersControllers");
const usersRouter = express.Router();

// POST: http://localhost:5000/users/sign-up
usersRouter.post("/sign-up", signUp);

// POST: http://localhost:5000/users/sign-in
usersRouter.post("/sign-in", signIn);

// GET: http://localhost:5000/users/private-data?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNodXZvMkBnbWFpbC5jb20iLCJ1c2VySWQiOiI2NTA5NmViZmFiNWYzMjk4MjAxZjE5YmQiLCJpYXQiOjE2OTUxMjMwMjgsImV4cCI6MTcyNjY1OTAyOH0.R5CaQWufazlotJgEcqMCJoKgZIvwKbyPEWoLscXhpac
usersRouter.get("/private-data", verifyToken);

// POST: http://localhost:5000/users/verify-otp
usersRouter.post("/verify-otp", verifyOTP);

// POST: http://localhost:5000/users/send-otp
usersRouter.post("/send-otp", generateOTP);


usersRouter.post("/email-verify", emailVerify);


module.exports = usersRouter;
