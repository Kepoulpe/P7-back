const bcrypt = require('bcrypt');
const User = require('./models/user');

const createAdminUser = async () => {
    try {
        const hash = await bcrypt.hash(process.env.PASSWORD_ADMIN_USER, 10);
        const user = new User({
            email: process.env.EMAIL_ADMIN_USER,
            userName: process.env.USERNAME_ADMIN,
            password: hash,
            isAdmin: true
        });
        await user.save();
        console.log("ADMIN USER CREATED");
    } catch (error) {
        console.error(error);
    }
};

module.exports = createAdminUser;