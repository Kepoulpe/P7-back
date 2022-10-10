const express = require('express');
const usersCtlr = require("./../controllers/user");
const {authMiddleware} = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post(
    '/signup', 
    body('email').isEmail(),
    body('password')
        .isLength({ min: 8 })
        .custom(pwd => {
            let re = new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&_*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&_*]', 'g');
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

router.post(
    '/login', 
    body('email').notEmpty(),
    body('password').notEmpty(),
    usersCtlr.login
);

router.post('/delete', authMiddleware, usersCtlr.delete);

router.get(
    '/',
    authMiddleware,
    (req, res) => {
        res.status(200).json({ msg : "Auth is valid" })
    }
)

router.get(
    '/:id',
    authMiddleware,
    usersCtlr.getOneUser
)


module.exports = router;