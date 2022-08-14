const Post = require('../models/post');
const fs = require('fs');

// user can create one post in the database mongoDb
exports.createPost = (req, res, next) => {
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
                .then(posts => res.status(201).json({
                    data: posts,
                    msg: "Post créé",
                    success: true
                }))
                .catch(error => res.status(400).json({
                    data: null,
                    msg: 'Erreur lors de la création du post',
                    success: true
                }));
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
        res.status(500).json({
            data: null,
            msg: 'Erreur lors de la création du post',
            success: true
        })
    }
};

// delete one post on the data base mongoDB
exports.deletePost = (req, res, next) => {
    // find the right file and the picture link to this file
    Post.findOne({ _id: req.params.id })
        .then(post => {
            const filename = post.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Post.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({
                        data : null, 
                        msg: 'Post supprimé !',
                        success: true
                     }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
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
            .catch(error => res.status(404).json({
                data: null,
                msg: 'Pas de posts à afficher',
                success: true
            }))
    } catch (error) {
        res.status(500).json({
            data: null,
            msg: 'Erreur veuillez réessayer ultérieurement',
            success: true
        });
    }
};

// like dislike for one post
exports.likeDislikePost = async (req, res, next) => {

    let postRecord;

    // 1) we check if the Post to update exists
    try {
        postRecord = await Post.findOne({_id: req.params.id});
    } catch (error) {
        res.status(404).json({
            data: null,
            msg: 'Post non trouvé',
            success: true
        });
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