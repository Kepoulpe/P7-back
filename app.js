require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const userRoutes = require('./routes/user');

const app = express();

if (process.env.NODE_ENV != "test") {
  // connection to mongodb data
  try {
      mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('connected to db success');
  } catch (error) {
      console.log(error);
      console.error('connected to db error');
  }
}

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
); 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Accept', 'application/json');
    next();
});

app.get( "/" , (req, res) => {
    res.status(200).json({msg: 'it works', data: null});
});

app.use('/api/auth', userRoutes);

module.exports = app;