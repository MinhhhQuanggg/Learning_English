const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema(
    {
        word: {
            type: String,
            required: [true, 'Vui lòng nhập từ vựng'],
            trim: true
        },
        meaning: {
            type: String,
            required: [true, 'Vui lòng nhập nghĩa của từ'],
            trim: true
        },
        pronunciation: {
            type: String,
            trim: true
        },
        example: {
            type: String,
            trim: true
        },
        lessonId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Lesson',
            required: [true, 'Từ vựng phải thuộc về một bài học']
        },
        questionId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Question'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Vocabulary', vocabularySchema);
