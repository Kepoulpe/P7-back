const express = require('express');
const usersCtlr = require("./../controllers/user");

const router = express.Router();

router.post('/signup', usersCtlr.signup);

// router.post('/login');

module.exports = router;