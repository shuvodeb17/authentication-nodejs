const { urlencoded } = require("express");
var createError = require('http-errors')
const cors = require('cors');
const express = require("express");
const morgan = require("morgan");
const usersRouter = require("./routers/userRouter");
const app = express();
const multer = require('multer');
const PDFParser = require('pdf-parse');
const path = require('path');
const fs = require('fs');






app.use(morgan());
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file || req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Invalid PDF file' });
    }

    const buffer = req.file.buffer;
    const data = await PDFParser(buffer);
    const text = data.text;

    // Save the extracted text to a JSON object
    const jsonOutput = { text };

    // Save the JSON object to a file (optional)
    fs.writeFileSync('output.json', JSON.stringify(jsonOutput, null, 2));

    return res.json(jsonOutput);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



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