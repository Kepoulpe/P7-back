const Post = require('../models/post');
const fs = require('fs');

// user can create one post in the database mongoDb

exports.createPost = (req, res, next) => {
    
    const postObject = JSON.parse(req.body.post);
    delete postObject._id;

    const post = new Post({
        ...postObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    post.save()
        .then(() => res.status(201)
            .json({ msg: 'post created' }))
        .catch(error => res.status(400)
            .json({ error }))
}