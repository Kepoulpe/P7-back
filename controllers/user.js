const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// controller for user signup

exports.signup = async (req, res, next) => {

    let user;
    try {
        const hash = await bcrypt.hash(req.body.password, 10);
        user = new User({
            email: req.body.email,
            userName: req.body.userName,
            password: hash,
            isAdmin: req.body.isAdmin ?? false
        });
    } catch (error) {
        console.error("ERROR FROM BCRYPT", error);
        res
            .status(500)
            .json({ error });
        return;
    }

    try {
        await user.save();
        res
            .type("json")
            .status(201)
            .json({ msg: 'user created' });
    } catch (error) {
        console.error("ERROR FROM 400", error);
        res
            .status(400)
            .json({ error });
    }
};

// controller for user login
exports.login = async (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                res.status(401).json({ error: 'Utilisateur non trouvé' })
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        res.status(401).json({ error: 'Mot de passe incorrect' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.RANDOM_SECRET_TOKEN,
                            { expiresIn: '24h' }
                        ),
                        isAdmin: user.isAdmin
                    });
                })
        })
        .catch(err => res.status(500).json({ err }))
};

exports.delete = async (req, res) => {
    let user;
    try {
        user = await User.findById(req.body.userId);
    } catch (error) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
        return;
    }
    try {
        await User.deleteOne({ _id: req.body.userId });
        res.status(200).json({ msg: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
}