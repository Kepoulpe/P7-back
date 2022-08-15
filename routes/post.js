const express = require('express');
const router = express.Router();

const postCtrl = require('../controllers/post');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// user can create one post in the data base mongoDB
router.post('/',
    auth,
    multer,
    postCtrl.createPost
)

// modify one specific post in the data base mongoDB
router.put('/:id',
    auth,
    multer,
    postCtrl.modifyPost
);
// user can delete one post in the data base mongoDB
router.delete('/:id',
    auth,
    postCtrl.deletePost
);

// get all post in the data base mongoDB
router.get('/',
    auth,
    postCtrl.getAllPosts
);

// get one post in the data base mongoDB
router.get('/:id',
    auth,
    postCtrl.getOnePost
);

// route for like/dislike
router.post('/:id/like',
    auth,
    postCtrl.likeDislikePost
);
module.exports = router;