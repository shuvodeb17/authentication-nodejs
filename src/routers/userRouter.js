const express = require("express");
const { signUp } = require("../controllers/UsersControllers");
const usersRouter = express.Router();

usersRouter.post("/sign-up", signUp);

module.exports = usersRouter;
