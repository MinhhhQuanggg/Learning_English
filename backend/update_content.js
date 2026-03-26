const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('./schemas/Lesson');

dotenv.config();

const updateDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        const lessons = await Lesson.find({});
        for (let lesson of lessons) {
            let updated = false;
            let currentContent = lesson.content;

            if (currentContent.includes('Father: Bố | Mother: Mẹ')) {
                currentContent = currentContent.replace(
                    '<p>Father: Bố | Mother: Mẹ | Brother: Anh/em trai | Sister: Chị/em gái</p>',
                    '<ul><li>Father: Bố</li><li>Mother: Mẹ</li><li>Brother: Anh/em trai</li><li>Sister: Chị/em gái</li></ul>'
                );
                updated = true;
            }

            if (currentContent.includes('<li>My: Của tôi | Your: Của bạn</li>')) {
                currentContent = currentContent.replace(
                    /<li>My: Của tôi \| Your: Của bạn<\/li>\s*<li>His: Của anh ấy \| Her: Của cô ấy<\/li>/,
                    '<li>My: Của tôi</li><li>Your: Của bạn</li><li>His: Của anh ấy</li><li>Her: Của cô ấy</li>'
                );
                updated = true;
            }

            if (currentContent.includes('<li>Red: Đỏ | Blue: Xanh dương | Green: Xanh lá</li>')) {
                currentContent = currentContent.replace(
                    /<li>Red: Đỏ \| Blue: Xanh dương \| Green: Xanh lá<\/li>\s*<li>Yellow: Vàng \| Black: Đen \| White: Trắng<\/li>/,
                    '<li>Red: Đỏ</li><li>Blue: Xanh dương</li><li>Green: Xanh lá</li><li>Yellow: Vàng</li><li>Black: Đen</li><li>White: Trắng</li>'
                );
                updated = true;
            }

            if (currentContent.includes('<li>Shirt: Áo sơ mi | T-shirt: Áo thun | Pants: Quần dài</li>')) {
                currentContent = currentContent.replace(
                    /<li>Shirt: Áo sơ mi \| T-shirt: Áo thun \| Pants: Quần dài<\/li>\s*<li>Dress: Váy \| Shoes: Giày \| Hat: Mũ<\/li>/,
                    '<li>Shirt: Áo sơ mi</li><li>T-shirt: Áo thun</li><li>Pants: Quần dài</li><li>Dress: Váy</li><li>Shoes: Giày</li><li>Hat: Mũ</li>'
                );
                updated = true;
            }

            if (updated) {
                lesson.content = currentContent;
                await lesson.save();
                console.log('Updated lesson:', lesson.title);
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateDB();
