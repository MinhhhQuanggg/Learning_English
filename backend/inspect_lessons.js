const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('./schemas/Lesson');

const Category = require('./schemas/Category');

dotenv.config();

const inspectLessons = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const lessons = await Lesson.find({});
        console.log(`Total lessons found: ${lessons.length}`);

        const summary = {};
        lessons.forEach(l => {
            summary[l.level] = (summary[l.level] || 0) + 1;
            console.log(`- [${l.level}] ${l.title} (ID: ${l._id})`);
        });

        console.log('\nLevel Summary:', summary);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectLessons();
