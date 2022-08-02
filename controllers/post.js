const Post = require('../models/post');
const fs = require('fs');

// user can create one post in the database mongoDb

exports.createPost = (req, res, next) => {
    const post = new Post(req.body);
    post.save()
        .then(() => res.status(201).json({ msg: 'post created' }))
        .catch(error => res.status(400).json({ error }));
};