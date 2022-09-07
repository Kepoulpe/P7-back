const Post = require('../models/post');
const fs = require('fs');
const { likeDislikeLogic } = require('./likeDislike');

// user can create one post in the database mongoDb
exports.createPost = (req, res, next) => {
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
                    success: false
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
                .catch(error => res.status(400).json({
                    data: null,
                    msg: error,
                    success: false
                }));
        }
    } catch (error) {
        res.status(500).json({
            data: null,
            msg: 'Erreur lors de la création du post',
            success: false
        })
    }
};

// modify one post on the data base mongoDB
exports.modifyPost = (req, res, next) => {
    // check if user modify the picture
    const postObject = req.file ?
        {
            ...JSON.parse(req.body.post),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    if (req.file) {
        Post.findOne({ _id: req.params.id })
            .then((post) => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Post.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
                        .then(() => res.status(200).json({
                            data: post,
                            msg: 'Post mis à jour',
                            success: true
                        }))
                        .catch(error => res.status(400).json({
                            data: null,
                            msg: error,
                            success: false
                        }));
                })
            })
            .catch(error => res.status(500).json({
                data: null,
                msg: error,
                success: false
            }));

    } else {
        Post.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
            .then(() => res.status(200).json({
                data: null,
                msg: 'Post mis à jour',
                success: true
            }))
            .catch(error => {
                // console.error(error);
                res.status(400).json({
                    data: null,
                    msg: error,
                    success: false
                })
            });
    }
};

// delete one post on the data base mongoDB
exports.deletePost = async (req, res, next) => {

    // first we get the request post to delete
    let post;
    // is it necessary ?
    if (!req.params.id) {
        res.status(400).json({
            data: null,
            msg: "no id provided to delete post",
            success: false
        });
    }

    try {
        post = await Post.findOne({ _id: req.params.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            data: null,
            msg: error,
            success: false
        });
        return;
    }

    if (post == null) {
        res.status(404).json({
            data: null,
            msg: "no post found with that id",
            success: false
        });
        return;
    }

    /**
     * we check if there is a file associated to the post to delete,
     * if so we delete the file
     */
    const filename = post.imageUrl ? post.imageUrl.split('/images/')[1] : false;
    if (filename && fs.existsSync(filename)) {
        fs.unlinkSync(`images/${filename}`);
    }

    // we actually delete the post
    try {
        await Post.deleteOne({ _id: req.params.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            data: null,
            msg: error,
            success: false
        });
        return;
    }

    // we return the response
    res.status(204).send('');
};

// get one post in the data base mongoDB 
exports.getOnePost = (req, res, next) => {
    Post.findOne({ _id: req.params.id })
        .then(post => res.status(200).json({
            data: post,
            msg: "post fetched",
            success: true
        }))
        .catch(error => 
            res.status(404).json({
            data: null,
            msg: error,
            success: false
        }))
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
            .catch(error=> 
                res.status(404).json({
                data: null,
                msg: 'Pas de posts à afficher',
                success: false
            }))
    } catch (error) {
        res.status(500).json({
            data: null,
            msg: 'Une erreur est servenue',
            success: false
        });
    }
};

// like dislike for one post
exports.likeDislikePost = async (req, res, next) => {

    let postRecord;

    // 1) we check if the Post to update exists
    try {
        postRecord = await Post.findOne({ _id: req.params.id });
    } catch (error) {
        res.status(404).json({
            data: null,
            msg: 'Post non trouvé',
            success: false
        });
        return;
    }

    // 2) we create a formatted object from the post obtained in MongoDB from previous step
    const { userId, likes, dislikes, usersLiked, usersDisliked } = postRecord;
    postRecord._id = req.params.id;

    // 3) we get the payload that we will use to actually update like/dislike data with MongoDB
    const updateLikeDislikeObj = likeDislikeLogic(postRecord, req.body);

    // 3bis) send appropriate response if updateLikeDislikeObj is false (user tried to update likes data on his own post)
    if (!updateLikeDislikeObj) {
        res.status(403).json({
            data: null,
            msg: "Can not update like/dislike posts",
            success: false
        });
        return;
    }

    // 4) we update the post data in MongoDB
    // 5) we send a response to the user
    try {
        console.log(updateLikeDislikeObj);
        await Post.updateOne({ _id: postRecord._id }, updateLikeDislikeObj);
        res.status(200).json({
            data: postRecord,
            msg: "like/dislike posts updated",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            data: postRecord,
            msg: "like/dislike posts not updated",
            success: false
        });
    }

}