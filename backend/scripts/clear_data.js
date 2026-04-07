const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Category = require('../schemas/Category');
const Lesson = require('../schemas/Lesson');
const Question = require('../schemas/Question');
const Vocabulary = require('../schemas/Vocabulary');
const SavedVocabulary = require('../schemas/SavedVocabulary');
const Comment = require('../schemas/Comment');
const User = require('../schemas/User');
const Achievement = require('../schemas/Achievement');
const DailyTask = require('../schemas/DailyTask');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const clearData = async () => {
    try {
        await connectDB();

        console.log('Cleaning up data...');

        // Clear content collections
        await Category.deleteMany();
        console.log('Categories cleared.');

        await Lesson.deleteMany();
        console.log('Lessons cleared.');

        await Question.deleteMany();
        console.log('Questions cleared.');

        await Vocabulary.deleteMany();
        console.log('Vocabularies cleared.');

        await SavedVocabulary.deleteMany();
        console.log('Saved Vocabularies cleared.');

        await Comment.deleteMany();
        console.log('Comments cleared.');

        await Achievement.deleteMany();
        console.log('Achievements cleared.');

        await DailyTask.deleteMany();
        console.log('Daily Tasks cleared.');

        // Reset User stats
        await User.updateMany({}, {
            $set: {
                xp: 0,
                streak: 0,
                completedLessons: [],
                lastActiveDate: null
            }
        });
        console.log('User stats reset.');

        console.log('Data cleanup completed successfully!');
        process.exit();
    } catch (err) {
        console.error('Error during cleanup:', err);
        process.exit(1);
    }
};

clearData();
