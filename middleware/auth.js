const jwt = require('jsonwebtoken');

exports.sendUnauthorizedRes = (res) => {
    res.status(401).json({
        data: null,
        msg: "Utilisateur non valide",
        success: false
    });
};

exports.verifyJwtToken = (req) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.RANDOM_SECRET_TOKEN);
        return decodedToken;
    } catch (error) {
        return false;
    }
};

exports.authMiddleware = async (req, res, next) => {
    let authorized = true;
    try {
        const decodedToken = this.verifyJwtToken(req);
        const userId = decodedToken.userId;
        const isAdmin = decodedToken.isAdmin;
        authorized = (req.body.userId && req.body.userId === userId) // checking the user id specified in the token against the one in the token 
            // if user admin status is verified in the token then he's authorized
            || isAdmin
            /**
             * for requests without a JSON body that need authentication,
             * for instance DELETE requests or multipart/form-data requests;
             * we delegate to the controller or a specialized middleware (e.g. multer)
             * the task to verify auth
             */
            || !req.body.userId;
    } catch (err) {
        console.error("AUTH ERROR", err);
    } finally {
        if (!authorized) {
            this.sendUnauthorizedRes(res);
        } else {
            next();
        }
    }
};
