const express = require("express");
const { signUp,signIn } = require("../controllers/UsersControllers");
const usersRouter = express.Router();


// POST: http://localhost:5000/users/sign-up
usersRouter.post("/sign-up", signUp);

// POST: http://localhost:5000/users/sign-in
usersRouter.post("/sign-in", signIn);

module.exports = usersRouter;
