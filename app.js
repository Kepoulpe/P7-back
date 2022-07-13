const express = require('express');
const app = express();

app.get( "/" , (req, res) => {
    res.status(200).json({msg: 'it works', data: null});
});

module.exports = app;