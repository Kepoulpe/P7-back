const jwt = require('jsonwebtoken');

const checkIfAdmin = async (userId) => {
    const user = await User.findOne({ _id: userId });
    return user.isAdmin && user.isAdmin == true;
}

module.exports = async (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.RANDOM_SECRET_TOKEN);
        const userId = decodedToken.userId;
        let passes = true;
        // TODO test to write => given I'm an authenticated user with a valid JWTor if user is Admin, when I send a JSON payload containing someone else's user id and user is not valid, then I should get a 401 and the expected payload
        if(req.body.userId && req.body.userId !== userId) {
            passes = await checkIfAdmin(userId);
            if (!passes) {
                res.status(401).json({
                    data: null,
                    msg: "Utilisateur non valide",
                    success: false
                });
            }
        }
        if (passes) {
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