const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const postCtrl = require('../controllers/post');
const {authMiddleware} = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// user can create one post in the data base mongoDB
router.post('/',
    authMiddleware,
    multer,
    body('content')
        .not()
        .isEmpty()
        .trim()
        .escape(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        };
        next()
    },
    postCtrl.createPost
)

// modify one specific post in the data base mongoDB
router.put(
    '/:id',
    authMiddleware,
    multer,
    body('content')
        .not()
        .isEmpty()
        .trim()
        .escape(),
    (req, res, next) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        };
        next()
    },
    postCtrl.modifyPost,
);

// user can delete one post in the data base mongoDB
router.delete('/:id',
    postCtrl.deletePost
);

// get all post in the data base mongoDB
router.get('/',
    authMiddleware,
    postCtrl.getAllPosts
);

// get one post in the data base mongoDB
router.get('/:id',
    authMiddleware,
    postCtrl.getOnePost
);

// route for like/dislike
router.post('/:id/like',
    authMiddleware,
    postCtrl.likeDislikePost
);
module.exports = router;