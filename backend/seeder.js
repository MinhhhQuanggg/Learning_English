require('dotenv').config();
const mongoose = require('mongoose');
const Lesson = require('./schemas/Lesson');

const lessons = [
    {
        title: 'Chào hỏi cơ bản',
        description: 'Học cách chào hỏi và giới thiệu bản thân bằng tiếng Anh.',
        level: 'Thấp',
        type: 'Speaking',
        xpAwarded: 20,
        duration: 10,
        order: 1,
        content: `
            <h2>Chào hỏi và giới thiệu bản thân</h2>
            <p>Trong tiếng Anh, cách chào hỏi đơn giản nhất là:</p>
            <ul>
                <li><strong>Hello!</strong> (Xin chào - dùng cho mọi trường hợp)</li>
                <li><strong>Hi!</strong> (Chào - dùng cho bạn bè, người thân)</li>
            </ul>
            <p>Để giới thiệu bản thân, bạn dùng cấu trúc:</p>
            <p><em>I am + [Tên của bạn]</em> hoặc <em>My name is + [Tên của bạn]</em></p>
        `,
        questions: [
            {
                question: "Cách nào sau đây dùng để chào hỏi trang trọng?",
                options: ["Hello", "Bye", "Fine", "Good"],
                correctAnswer: "Hello",
                explanation: "Hello là cách chào phổ biến và trang trọng nhất."
            },
            {
                question: "Cấu trúc giới thiệu tên là gì?",
                options: ["I am...", "You are...", "He is...", "They are..."],
                correctAnswer: "I am...",
                explanation: "'I am' hoặc 'My name is' dùng để giới thiệu bản thân."
            }
        ]
    },
    {
        title: 'Số đếm 1-10',
        description: 'Làm quen với các con số từ 1 đến 10.',
        level: 'Thấp',
        type: 'Vocabulary',
        xpAwarded: 15,
        duration: 8,
        order: 2,
        content: `
            <h2>Số đếm cơ bản</h2>
            <p>Hãy cùng học cách đếm từ 1 đến 5:</p>
            <ol>
                <li>One (Số 1)</li>
                <li>Two (Số 2)</li>
                <li>Three (Số 3)</li>
                <li>Four (Số 4)</li>
                <li>Five (Số 5)</li>
            </ol>
        `,
        questions: [
            {
                question: "Số 3 trong tiếng Anh là gì?",
                options: ["One", "Two", "Three", "Four"],
                correctAnswer: "Three",
                explanation: "Three nghĩa là số ba."
            }
        ]
    },
    {
        title: 'Thì Hiện tại đơn',
        description: 'Cách sử dụng thì hiện tại đơn với động từ To Be.',
        level: 'Trung',
        type: 'Grammar',
        xpAwarded: 40,
        duration: 20,
        order: 1,
        content: `
            <h2>Thì Hiện tại đơn với To Be</h2>
            <p>Động từ To Be có 3 dạng ở hiện tại:</p>
            <ul>
                <li><strong>Am</strong>: Đi với 'I'</li>
                <li><strong>Is</strong>: Đi với 'He, She, It'</li>
                <li><strong>Are</strong>: Đi với 'You, We, They'</li>
            </ul>
        `,
        questions: [
            {
                question: "Điền vào chỗ trống: I ___ a student.",
                options: ["am", "is", "are", "be"],
                correctAnswer: "am",
                explanation: "'I' luôn đi với 'am' trong thì hiện tại đơn."
            }
        ]
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        await Lesson.deleteMany();
        console.log('Old lessons removed.');

        await Lesson.insertMany(lessons);
        console.log('Sample lessons with questions seeded successfully!');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
