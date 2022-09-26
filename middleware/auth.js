const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.RANDOM_SECRET_TOKEN);
        const userId = decodedToken.userId;
        const isAdmin = decodedToken.isAdmin;
        let passesAuthValidation = (req.body.userId && req.body.userId === userId) || isAdmin;
        if (!passesAuthValidation) {
            res.status(401).json({
                data: null,
                msg: "Utilisateur non valide",
                success: false
            });
        }
        else {
            next();
        }
    } catch (err) {
        res.status(401).json({
            data: err,
            msg: "Utilisateur non valide",
            success: false
        });
    }
}