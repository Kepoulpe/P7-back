const express = require('express');
const usersCtlr = require("./../controllers/user");
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post(
    '/signup', 
    body('email').isEmail(),
    body('password')
        .isLength({ min: 8 })
        .custom(pwd => {
            let re = new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]', 'g');
            if (!re.test(pwd)) {
                throw new Error('Your password must be 8 characters at least and should include letters, numbers, and symbols');
            }
            return true;
        }),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() })
        };
        next()
    },
    usersCtlr.signup
);

router.post('/login', usersCtlr.login);

router.post('/delete', usersCtlr.delete);


module.exports = router;