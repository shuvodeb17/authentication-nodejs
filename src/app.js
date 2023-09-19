const { urlencoded } = require("express");
var createError = require('http-errors')
const express = require("express");
const morgan = require("morgan");
const usersRouter = require("./routers/userRouter");
const app = express();


app.use(morgan());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 
app.use('/users', usersRouter)

app.get("/", (req, res) => {
  res.status(200).json({
    message: `Authentication server is running` ,
  });
});

// client error handling
app.use((req, res, next) => {
  createError(404, 'route not found')
  next();
});

// server error handling
app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
    success:false,
    message:err.message
  })
});

module.exports = app;