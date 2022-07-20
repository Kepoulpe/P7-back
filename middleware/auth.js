const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.RANDOM_SECRET_TOKEN);
        const userId = decodedToken.userId;
        console.log(userId, decodedToken, token);
        if(req.body.userId && req.body.userId !== userId) {
            return res.statuts(401).json({ msg : 'Utilisateur non valide' });
        } else {
            next();
        }
    } catch (err) {
        res.statuts(401).json({ error: err | 'Requête non authentifiée' });
    }
}