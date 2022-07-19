const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {

    let user;
    try {
        const hash = await bcrypt.hash(req.body.password, 10);
        user = new User ({
            email: req.body.email,
            password: hash
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
        if (process.env.NODE_ENV == "test") {
            await user.deleteOne({email: req.body.email});
        }
        res
            .type("json")
            .status(201)
            .json({ msg: 'user created'});
    } catch (error) {
        console.error("ERROR FROM 400", error);
        res
            .status(400)
            .json({ error });
    }
};