const Post = require('../models/post');
const fs = require('fs');

// user can create one post in the database mongoDb

exports.createPost = (req, res, next) => {
    const postObj = req.body;
    delete postObj._id;
    console.log("test");
    if (postObj.file != undefined) {
        const post = new Post({
            ...postObj,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });
        post.save()
            .then(() => res.status(201).json({ msg: 'post created' }))
            .catch(error => res.status(400).json({ error }));
    } else {
        const post = new Post({
            ...postObj,
        });
        post.save()
            .then(() => res.status(201).json({ msg: 'post created' }))
            .catch(error => res.status(400).json({ error }));
    }
};