const Post = require('../models/post');
const fs = require('fs');

// user can create one post in the database mongoDb

exports.createPost = (req, res, next) => {
    // try {
    //     await
    // } catch (error) {
    //     res.status(404).json({ error: 'Utilisateur non reconnu' });
    // }
    // TODO DRY
    try {
        const postObj = req.body;
        delete postObj._id;
        if (postObj.file != undefined) {
            const post = new Post({
                ...postObj,
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            });
            post.save()
                .then(post => res.status(201).json({
                    data: post,
                    msg: "Post créé",
                    success: true
                }))
                .catch(error => res.status(400).json({ error }));
        } else {
            const post = new Post({
                ...postObj,
            });
            post.save()
                .then(() => res.status(201).json({
                    data: post,
                    msg: "Post créé",
                    success: true
                }))
                .catch(error => res.status(400).json({ error }));
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du post' });
    }
};

// get all the posts in the data base mongoDB
exports.getAllPosts = (req, res, next) => {
    try {
        Post.find()
            .then(posts => res.status(200).json({
                data: posts,
                msg: "posts fetched",
                success: true
            }))
            .catch(error => res.status(404).json({ msg: 'Pas de posts à afficher' }));
    } catch (error) {
        res.status(500).json({ error: 'Erreur veuillez reéssayer ultérieurement' });
    }
};

// like dislike for one post
exports.likeDislikePost = async (req, res, next) => {

    let postRecord;

    // 1) we check if the Post to update exists
    try {
        postRecord = await Post.findOne({_id: req.params.id});
    } catch (error) {
        res.status(404).json({ error: "post non trouvée !" });
        return;
    }

    // 2) we create a formatted object from the post obtained in MongoDB from previous step
    const {userId, likes, dislikes, usersLiked, usersDisliked} = postRecord;
    postRecord._id = req.params.id;

    // 3) we get the payload that we will use to actually update like/dislike data with MongoDB
    const updateLikeDislikeObj = likeDislikePost(postRecord, req.body);

    // 3bis) send appropriate response if updateLikeDislikeObj is false (user tried to update likes data on his own post)
    if (!updateLikeDislikeObj) {
        res.status(403).json({error: `Cannot update post like/dislike data`});
        return;
    }

    // 4) we update the post data in MongoDB
    // 5) we send a response to the user
    try {
        console.log(updateLikeDislikeObj);
        await Post.updateOne({ _id: postRecord._id }, updateLikeDislikeObj);
        res.status(200).json({error: `Updated post like/dislike data`});
    } catch (error) {
        res.status(500).json({error: `Could not update post like/dislike data, please try again later`});
    }

}