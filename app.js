require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const path = require('path');
const createAdminUser = require('./admin-helper');

const app = express();

if (process.env.NODE_ENV != "test") {
  // connection to mongodb data
  mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('connected to db success');
    createAdminUser();
  })
  .catch(error => {
    console.error(error);
    console.error('connected to db error');
  });
}

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
); 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, Postman-Token');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Accept', ['application/json', 'multipart/form-data']);
    next();
});

app.get( "/" , (req, res) => {
    res.status(200).json({msg: 'it works', data: null});
});

app.use('/api/auth', userRoutes);

app.use('/api/posts', postRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;