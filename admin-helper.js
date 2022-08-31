const bcrypt = require('bcrypt');
const User = require('./models/user');

const createAdminUser = async () => {
    try {
        const hash = await bcrypt.hash("ADMIN_PASSWORD", 10);
        const user = new User({
            email: "admin@groupomania.com",
            userName: "admin",
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