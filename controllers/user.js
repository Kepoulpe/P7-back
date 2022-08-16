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
        res.status(500).json({
            data: null,
            msg: errors,
            success: false
        });
        return;
    }

    try {
        await user.save();
        res.status(201).json({
            data: null,
            msg: 'user created',
            success: true
        });
    } catch (error) {
        res.status(400).json({
            data: null,
            msg: errors,
            success: false
        });
    }
};

// controller for user login
exports.login = async (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                res.status(401).json({
                    data: null,
                    msg: 'Utilisateurs non trouvé',
                    success: false
                })
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        res.status(401).json({
                            data: null,
                            msg: 'Mot de passe incorrect',
                            success: false
                        })
                    }
                    res.status(200).json({
                        //  TODO how to make the the response payload with data
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
        .catch(error => res.status(500).json({
            data: null,
            msg: error,
            success: false
        }))
};

exports.delete = async (req, res) => {
    let user;
    try {
        user = await User.findById(req.body.userId);
    } catch (error) {
        res.status(404).json({
            data: null,
            msg: 'Utilisateur non trouvé',
            success: false
        })
        return;
    }
    try {
        await User.deleteOne({ _id: req.body.userId });
        res.status(200).json({
            data: null,
            msg: 'Utilisateur supprimé',
            success: true
        });
    } catch (error) {
        res.status(500).json({
            data: null,
            msg: 'Erreur lors de la suppression de l\'utilisateur',
            success: false
        });
    }
}