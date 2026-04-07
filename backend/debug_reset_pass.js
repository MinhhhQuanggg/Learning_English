const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./schemas/User');

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'qminh0733@gmail.com';
        const newPassword = 'Quang123@';

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.password = newPassword;
        // isEmailVerified should be true
        user.isEmailVerified = true;

        await user.save();
        console.log(`Password reset successfully for ${email} to ${newPassword}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPassword();
