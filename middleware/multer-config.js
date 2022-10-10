const multer = require('multer');
const { verifyJwtToken } = require('./auth');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name +Date.now() + '.' + extension);
    }
});

module.exports = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const token = req.body.userId;
        const userVerified = verifyJwtToken(req);
        // passing along the fact that the user is not authed in the request
        if (!userVerified) {
            req.authError = true;
        }
        // depending on the user token verification, file will get written on disk or not
        cb(null, userVerified);
    }
}).single('imageUrl');