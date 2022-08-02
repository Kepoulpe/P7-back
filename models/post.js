const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
    content: {type: String, required: true},
    imageUrl: { type: String, required: false},
    likes: { type: Number, required: true, default: 0 },
    dislikes: { type: Number, required: true, default: 0 },
    usersLiked: { type: [String], required: true, default: [] },
    usersDisliked: { type: [String], required: true, default: [] },
});


module.exports = mongoose.model('Post', postSchema);