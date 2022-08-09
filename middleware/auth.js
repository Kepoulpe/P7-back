const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.RANDOM_SECRET_TOKEN);
        const userId = decodedToken.userId;
        // TODO test => given I'm an authenticated user with a valid JWT, when I send a JSON payload containing someone else's user id, then I should get a 401 and the expected payload
        if(req.body.userId && req.body.userId !== userId) {
            return res.status(401).json({
                data: null,
                msg: "Utilisateur non valide",
                success: false
            });
        } else {
            next();
        }
    } catch (err) {
        res.status(401).json({
            data: null,
            msg: "Utilisateur non valide",
            success: false
        });
    }
}