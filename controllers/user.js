const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendUnauthorizedRes } = require('../middleware/auth');

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
            msg: error,
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
        console.error(error);
        res.status(400).json({
            data: null,
            msg: error,
            success: false
        });
    }
};

// controller for user login
exports.login = async (req, res, next) => {
    let usr;
    try {
        usr = await User.findOne({ email: req.body.email });
    } catch (error) {
        res.status(500).json({
            data: null,
            msg: 'Une erreur est servenue, merci de réessayer ultérieument',
            success: false
        });
        return;
    }
    if (!usr) {
        res.status(401).json({
            data: null,
            msg: "Utilisateur non valide",
            success: false
        });
        return res;
    }
    let isPwdValid;
    try {
        isPwdValid = await bcrypt.compare(req.body.password, usr.password);
    } catch (error) {
        res.status(500).json({
            data: null,
            msg: 'Une erreur est servenue, merci de réessayer ultérieument',
            success: false
        });
        return;
    }
    if (!isPwdValid) {
        res.status(401).json({
            data: null,
            msg: "Mot de passe incorrect",
            success: false
        });
        return res;
    }
    res.status(200).json({
        data: {
            isAdmin: usr.isAdmin,
            token: jwt.sign(
                { userId: usr._id, isAdmin: usr.isAdmin },
                process.env.RANDOM_SECRET_TOKEN,
                { expiresIn: '24h' }
            ),
            userId: usr._id
        },
        msg: 'login successful',
        success: true
    });
};

// get one user
exports.getOneUser = async (req, res, next) => {
    let usr;
    try {
        usr = await Users.findOne({ email: req.params.id });
        res.status(200).json({
            data: usr,
            msg: 'User fetched',
            success: true
        });
        console.log(usr);
    } catch (error) {
        res.status(404).json({
            data: null,
            msg: 'Utilisateur non trouvé',
            success: false
        });
    }
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