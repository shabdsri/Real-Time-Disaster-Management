require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser'); 
const axios = require('axios'); 

const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');

const rootRoutes = require('./routes/root');
const authRoutes = require('./routes/authRoutes');
const disasterRoutes = require('./routes/disasterRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const downloadReportRoutes = require('./routes/downloadReportRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middlewares
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '/public')));

// Application Routes
app.use('/', rootRoutes);
app.use('/auth', authRoutes); // Login/Register routes handles here
app.use(disasterRoutes);
app.use('/disasters', resourceRoutes);
app.use('/disasters', reportRoutes);
app.use('/disasters', downloadReportRoutes);

// Route to get active incidents from the CSV file (Cleaned from Python execution blocks)
app.get('/api/activeIncidents', (req, res) => {
  const results = [];
  const csvFilePath = path.join(__dirname, 'scripts', 'data', 'tweets.csv');

  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ error: 'CSV file not found' });
  }

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.json(results);
    })
    .on('error', (err) => {
      console.error(err);
      res.status(500).json({ error: 'Failed to read CSV file' });
    });
});

// Catch-all route for 404 errors
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '/views/404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not found' });
  } else {
    res.type('txt').send('404 Not found');
  }
});

// Global Error Handler
app.use(errorHandler);

// Connect to MongoDB and start the server securely
mongoose.connection.once('open', () => {
  console.log('MongoDB connected successfully');
  app.listen(port, () => console.log(`Listening on port ${port}`));
});

mongoose.connection.on('error', (err) => {
  console.log('MongoDB Connection Error:', err);
  logEvents(`${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});