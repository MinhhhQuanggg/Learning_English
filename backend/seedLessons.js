const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('./schemas/Lesson');

dotenv.config();

const lessons = [
    {
        title: 'Số đếm 1-10 & Cơ bản',
        description: 'Học cách đếm số và các câu chào hỏi cơ bản nhất trong tiếng Anh.',
        level: 'Thấp',
        type: 'Vocabulary',
        xpAwarded: 50,
        duration: 10,
        order: 1,
        content: `
            <h3>1. Số đếm cơ bản</h3>
            <p>Trong tiếng Anh, các số từ 1 đến 10 rất quan trọng:</p>
            <ul>
                <li>1: One</li>
                <li>2: Two</li>
                <li>3: Three</li>
                <li>4: Four</li>
                <li>5: Five</li>
                <li>6: Six</li>
                <li>7: Seven</li>
                <li>8: Eight</li>
                <li>9: Nine</li>
                <li>10: Ten</li>
            </ul>
        `,
        questions: [
            { type: 'reading_passage', passage: 'Hello, my name is John. I am 20 years old.\nI live in London and I love eating pizza.', question: 'Where does John live?', options: ['London', 'Paris', 'Hanoi', 'New York'], correctAnswer: 'London', explanation: 'He says: "I live in London".' },
            { type: 'fill_blank', question: 'Từ tiếng Anh mang nghĩa số Không là ___ (cố lên)', correctAnswer: 'Zero', explanation: 'Zero nghĩa là số 0.' },
            { type: 'sort_sentence', question: 'Sắp xếp câu: "Một Hai Ba"', options: ['Two', 'Three', 'One'], correctAnswer: 'One,Two,Three', explanation: 'Thứ tự đúng là One, Two, Three.' },
            { type: 'multiple_choice', question: 'Từ nào nghĩa là "Xin chào"?', options: ['Goodbye', 'Hello', 'Thanks', 'Sorry'], correctAnswer: 'Hello', explanation: 'Hello là xin chào.' },
            { type: 'writing', question: 'Viết từ tiếng Anh tương đương với số Mười:', correctAnswer: 'Ten', explanation: 'Ten là số mười.' },
            { type: 'multiple_choice', question: 'Số 5 trong tiếng Anh là gì?', options: ['Six', 'Five', 'Seven', 'Eight'], correctAnswer: 'Five', explanation: 'Five nghĩa là số năm.' },
            { type: 'fill_blank', question: 'Số 8 trong tiếng Anh là? (Viết tiếng Anh)', correctAnswer: 'Eight', explanation: 'Eight nghĩa là số tám.' },
            { type: 'sort_sentence', question: 'Sắp xếp câu: "Năm Sáu Bảy"', options: ['Seven', 'Five', 'Six'], correctAnswer: 'Five,Six,Seven', explanation: 'Thứ tự đúng là Five, Six, Seven.' },
            { type: 'multiple_choice', question: 'Từ nào dùng để cảm ơn?', options: ['Thank you', 'Please', 'Excuse me', 'Hello'], correctAnswer: 'Thank you', explanation: 'Thank you dùng để bày tỏ sự biết ơn.' },
            { type: 'writing', question: 'Dịch "Tạm biệt" sang tiếng Anh:', correctAnswer: 'Goodbye', explanation: 'Goodbye dùng khi chào tạm biệt.' }
        ]
    },
    {
        title: 'Giới thiệu bản thân',
        description: 'Học cách nói tên, tuổi và quê quán của mình.',
        level: 'Thấp',
        type: 'Listening',
        xpAwarded: 50,
        duration: 10,
        order: 2,
        content: `
            <h3>Luyện nghe giao tiếp cơ bản</h3>
            <p>Nghe đoạn hội thoại và điền từ hoặc sắp xếp từ thích hợp.</p>
        `,
        questions: [
            { type: 'true_false', mediaUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_226c6d2679.mp3', question: 'Người trong Audio vừa nói "Hello", đúng hay sai?', correctAnswer: 'True', explanation: 'Audio rõ ràng phát ra tiếng Hello.' },
            { type: 'fill_blank', mediaUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_226c6d2679.mp3', question: 'Tên bạn là gì trong tiếng Anh: What is ___ name?', correctAnswer: 'your', explanation: 'Your name = tên của bạn.' },
            { type: 'sort_sentence', mediaUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_226c6d2679.mp3', question: 'Sắp xếp câu giới thiệu đến từ Việt Nam:', options: ['Vietnam', 'I', 'from', 'am'], correctAnswer: 'I,am,from,Vietnam', explanation: 'I am from Vietnam.' },
            { type: 'writing', mediaUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_226c6d2679.mp3', question: 'Dịch câu "Rất vui được gặp bạn" sang tiếng Anh:', correctAnswer: 'Nice to meet you', explanation: 'Nice to meet you là câu dùng khi mới quen ai đó.' },
            { type: 'multiple_choice', mediaUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_226c6d2679.mp3', question: 'Câu trả lời cho "How old are you?"', options: ['I am fine', 'I am 20 years old', 'My name is Peter', 'Yes, I am'], correctAnswer: 'I am 20 years old', explanation: 'Hỏi tuổi dùng I am + số.' },
            { type: 'fill_blank', mediaUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_226c6d2679.mp3', question: '"I ___ a student." Điền từ còn thiếu?', correctAnswer: 'am', explanation: 'Chủ ngữ I đi với am.' },
            { type: 'multiple_choice', mediaUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_226c6d2679.mp3', question: 'Câu hỏi "Ai đây?" trong tiếng Anh?', options: ['Who are you?', 'How are you?', 'What is your name?', 'Where are you?'], correctAnswer: 'Who are you?', explanation: 'Đây là câu hỏi người.' },
            { type: 'sort_sentence', mediaUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_226c6d2679.mp3', question: 'Sắp xếp câu: "Tôi 20 tuổi"', options: ['years', 'old', '20', 'I', 'am'], correctAnswer: 'I,am,20,years,old', explanation: 'I am 20 years old.' },
            { type: 'writing', mediaUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_226c6d2679.mp3', question: 'Ghi lại dạng viết tắt của "I am"', correctAnswer: "I'm", explanation: "I'm là dạng viết tắt của I am." },
            { type: 'true_false', mediaUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_226c6d2679.mp3', question: 'Câu hỏi "Where are you from?" dùng để hỏi Tuổi, đúng hay sai?', correctAnswer: 'False', explanation: 'Where dùng để hỏi nơi chốn (Từ đâu đến).' }
        ]
    },
    {
        title: 'Thì Hiện tại đơn (Cơ bản)',
        description: 'Học cách sử dụng thì hiện tại đơn với động từ "to be" và động từ thường.',
        level: 'Trung',
        type: 'Listening',
        xpAwarded: 100,
        duration: 15,
        order: 3,
        content: `
            <h3>Luyện nghe thì hiện tại đơn</h3>
            <p>Nghe và chọn hoặc viết lại câu chính xác về thói quen diễn ra ở hiện tại.</p>
        `,
        questions: [
            { type: 'multiple_choice', mediaUrl: 'https://actions.google.com/sounds/v1/human_voices/human_male_hello.ogg', question: 'Người nói có thể đang chia động từ ở ngôi thứ mấy?', options: ['Ngôi 1', 'Ngôi 2', 'Ngôi 3'], correctAnswer: 'Ngôi 1', explanation: 'Ví dụ nghe.' },
            { type: 'fill_blank', question: 'She ___ a doctor.', correctAnswer: 'is', explanation: 'She đi với is.' },
            { type: 'multiple_choice', question: 'They ___ football every Sunday.', options: ['play', 'plays', 'playing', 'played'], correctAnswer: 'play', explanation: 'Số nhiều dùng play.' },
            { type: 'sort_sentence', question: 'Sắp xếp câu:', options: ['like', 'apples', 'I', 'do', 'not'], correctAnswer: 'I,do,not,like,apples', explanation: 'I do not like apples.' },
            { type: 'fill_blank', question: '___ he speak English? (Viết hoa chữ đầu)', correctAnswer: 'Does', explanation: 'He dùng Does.' },
            { type: 'writing', question: 'Chuyển câu "Tôi là học sinh" sang tiếng Anh', correctAnswer: 'I am a student', explanation: 'I am a student.' },
            { type: 'multiple_choice', question: 'We ___ students.', options: ['am', 'is', 'are', 'be'], correctAnswer: 'are', explanation: 'We đi với are.' },
            { type: 'fill_blank', question: 'He ___ to school by bus. (Động từ GO)', correctAnswer: 'goes', explanation: 'He + V(es) vì tận cùng là o.' },
            { type: 'sort_sentence', question: 'Sắp xếp câu: "Con mèo thích cá"', options: ['like', 'Cats', 'fish'], correctAnswer: 'Cats,like,fish', explanation: 'Chủ ngữ danh từ số nhiều.' },
            { type: 'writing', question: 'Does she ___ coffee? (Động từ LIKE)', correctAnswer: 'like', explanation: 'Sau trợ động từ Does, động từ về nguyên mẫu.' }
        ]
    },
    {
        title: 'Từ vựng Công việc & Văn phòng',
        description: 'Mở rộng vốn từ vựng về môi trường làm việc.',
        level: 'Trung',
        type: 'Vocabulary',
        xpAwarded: 100,
        duration: 15,
        order: 4,
        content: `
            <h3>Từ vựng trọng tâm</h3>
            <p>Manager, Colleague, Deadline...</p>
        `,
        questions: [
            { type: 'multiple_choice', question: 'Ai là người quản lý?', options: ['Manager', 'Staff', 'Intern', 'Client'], correctAnswer: 'Manager', explanation: 'Manager là quản lý.' },
            { type: 'fill_blank', question: 'Thời hạn cuối cùng để hoàn thành công việc là gì?', correctAnswer: 'Deadline', explanation: 'Deadline là hạn chót.' },
            { type: 'sort_sentence', question: 'Sắp xêp câu:', options: ['a', 'have', 'I', 'meeting'], correctAnswer: 'I,have,a,meeting', explanation: 'I have a meeting.' },
            { type: 'writing', question: 'Từ "Tiền lương" trong tiếng Anh là gì?', correctAnswer: 'Salary', explanation: 'Salary là lương.' },
            { type: 'multiple_choice', question: '"Apply ___ a job". Điền giới từ?', options: ['for', 'to', 'with', 'in'], correctAnswer: 'for', explanation: 'Apply for something.' },
            { type: 'multiple_choice', question: '"Colleague" nghĩa là gì?', options: ['Bạn thân', 'Đồng nghiệp', 'Đối thủ', 'Khách hàng'], correctAnswer: 'Đồng nghiệp', explanation: 'Đồng nghiệp cùng công ty.' },
            { type: 'fill_blank', question: '"Overtime" nghĩa là gì?', correctAnswer: 'Làm thêm giờ', explanation: 'Overtime là làm thêm giờ.' },
            { type: 'writing', question: 'Tên tiếng Anh của từ "Sơ yếu lý lịch" là gì?', correctAnswer: 'Resume', explanation: 'Resume là hồ sơ/sơ yếu lý lịch.' },
            { type: 'sort_sentence', question: 'Sắp xếp câu: "Tôi là nhân viên"', options: ['an', 'am', 'I', 'employee'], correctAnswer: 'I,am,an,employee', explanation: 'I am an employee.' },
            { type: 'multiple_choice', question: 'Ai là người mua hàng?', options: ['Boss', 'Employee', 'Customer', 'Partner'], correctAnswer: 'Customer', explanation: 'Khách hàng là Customer.' }
        ]
    },
    {
        title: 'Cấu trúc Điều kiện (Nâng cao)',
        description: 'Câu điều kiện loại 1 và 2.',
        level: 'Cao',
        type: 'Listening',
        xpAwarded: 200,
        duration: 20,
        order: 5,
        content: `
            <h3>Luyện nghe câu điều kiện</h3>
            <p>Nghe Audio và chọn đáp án đúng để hoàn thành câu Điều kiện.</p>
        `,
        questions: [
            { type: 'multiple_choice', mediaUrl: 'https://actions.google.com/sounds/v1/human_voices/human_male_hello.ogg', question: 'Lắng nghe và chọn. Anh ta nói gì?', options: ['Hello', 'Hi', 'How are you'], correctAnswer: 'Hello', explanation: 'Âm thanh phát ra tiếng Hello.' },
            { type: 'fill_blank', question: 'If it rains, we ___ at home.', correctAnswer: 'will stay', explanation: 'Loại 1 (có thể xảy ra).' },
            { type: 'sort_sentence', question: 'Sắp xếp câu loại 2:', options: ['were', 'would', 'I', 'If', 'you', 'study'], correctAnswer: 'If,I,were,you,I,would,study', explanation: 'If I were you I would study.' },
            { type: 'writing', question: 'Dịch "Nếu tôi có tiền, tôi sẽ mua xe bus":', correctAnswer: 'If I had money, I would buy a bus', explanation: 'Điều kiện loại 2 giả định trái hiện tại.' },
            { type: 'multiple_choice', question: 'I would buy a car if I ___ enough money.', options: ['have', 'has', 'had', 'will have'], correctAnswer: 'had', explanation: 'Vế If của loại 2 dùng quá khứ đơn.' },
            { type: 'fill_blank', question: 'If they ___ (phủ định, hiện tại) hurry, they will miss the train.', correctAnswer: 'do not', explanation: 'Phủ định hiện tại đơn đi với they.' },
            { type: 'multiple_choice', question: 'If she ___ time, she will visit us.', options: ['has', 'have', 'had', 'will have'], correctAnswer: 'has', explanation: 'Vế If dùng hiện tại đơn (Loại 1).' },
            { type: 'sort_sentence', question: 'Sắp xếp: "Bạn sẽ làm gì nếu bạn trúng số?"', options: ['won', 'you', 'do', 'if', 'the', 'lottery', 'would', 'What', 'you'], correctAnswer: 'What,would,you,do,if,you,won,the,lottery', explanation: 'Sắp xếp từ thành câu hỏi loại 2.' },
            { type: 'fill_blank', question: 'If you eat too much, you ___ weight.', correctAnswer: 'will gain', explanation: 'Câu điều kiện loại 1.' },
            { type: 'writing', question: 'Ghi lại giới từ "cho tất cả các ngôi" của To be ở Điều kiện loại 2:', correctAnswer: 'were', explanation: 'To be luôn là were.' }
        ]
    },
    {
        title: 'Màu sắc & Thời trang',
        description: 'Học các màu sắc cơ bản và từ vựng về trang phục thông dụng.',
        level: 'Thấp',
        type: 'Vocabulary',
        xpAwarded: 50,
        duration: 10,
        order: 3,
        content: `
            <h3>1. Màu sắc (Colors)</h3>
            <ul>
                <li>Red: Đỏ | Blue: Xanh dương | Green: Xanh lá</li>
                <li>Yellow: Vàng | Black: Đen | White: Trắng</li>
            </ul>
            <h3>2. Trang phục (Clothing)</h3>
            <ul>
                <li>Shirt: Áo sơ mi | T-shirt: Áo thun | Pants: Quần dài</li>
                <li>Dress: Váy | Shoes: Giày | Hat: Mũ</li>
            </ul>
        `,
        questions: [
            { question: 'Màu "Red" là màu gì?', options: ['Xanh', 'Đỏ', 'Vàng', 'Tím'], correctAnswer: 'Đỏ', explanation: 'Red nghĩa là màu đỏ.' },
            { question: 'Từ nào nghĩa là "Áo thun"?', options: ['Shirt', 'T-shirt', 'Pants', 'Hat'], correctAnswer: 'T-shirt', explanation: 'T-shirt là áo thun/áo phông.' },
            { question: 'Màu của bầu trời thường được gọi là gì?', options: ['Red', 'Green', 'Blue', 'Black'], correctAnswer: 'Blue', explanation: 'Blue là màu xanh dương.' },
            { question: '"Shoes" dùng để đi ở đâu?', options: ['Trên đầu', 'Trên tay', 'Dưới chân', 'Trên cổ'], correctAnswer: 'Dưới chân', explanation: 'Shoes nghĩa là đôi giày.' },
            { question: 'Màu "Green" giống màu của vật nào?', options: ['Lá cây', 'Mặt trời', 'Than đá', 'Máu'], correctAnswer: 'Lá cây', explanation: 'Green là màu xanh lá cây.' },
            { question: 'Khi trời nắng, bạn nên đội gì?', options: ['Shoes', 'Pants', 'Hat', 'Socks'], correctAnswer: 'Hat', explanation: 'Hat nghĩa là cái mũ/nón.' },
            { question: '"White" là màu gì?', options: ['Đen', 'Trắng', 'Xám', 'Nâu'], correctAnswer: 'Trắng', explanation: 'White nghĩa là màu trắng.' },
            { question: '"Pants" nghĩa là gì?', options: ['Áo khoác', 'Quần dài', 'Váy', 'Khăn quàng'], correctAnswer: 'Quần dài', explanation: 'Pants là quần dài.' },
            { question: 'Màu "Yellow" là màu gì?', options: ['Cam', 'Vàng', 'Hồng', 'Xanh'], correctAnswer: 'Vàng', explanation: 'Yellow nghĩa là màu vàng.' },
            { question: '"Dress" là trang phục thường dành cho ai?', options: ['Nam giới', 'Nữ giới', 'Trẻ sơ sinh', 'Người già'], correctAnswer: 'Nữ giới', explanation: 'Dress nghĩa là váy liền thân/đầm.' }
        ]
    },
    {
        title: 'Gia đình của tôi',
        description: 'Học từ vựng về các thành viên gia đình và tính từ sở hữu.',
        level: 'Thấp',
        type: 'Vocabulary',
        xpAwarded: 50,
        duration: 12,
        order: 4,
        content: `
            <h3>1. Thành viên gia đình</h3>
            <p>Father: Bố | Mother: Mẹ | Brother: Anh/em trai | Sister: Chị/em gái</p>
            <h3>2. Tính từ sở hữu (Possessive Adjectives)</h3>
            <ul>
                <li>My: Của tôi | Your: Của bạn</li>
                <li>His: Của anh ấy | Her: Của cô ấy</li>
            </ul>
        `,
        questions: [
            { question: '"Father" nghĩa là gì?', options: ['Mẹ', 'Bố', 'Chú', 'Ông'], correctAnswer: 'Bố', explanation: 'Father là bố/cha.' },
            { question: '"My book" nghĩa là gì?', options: ['Sách của bạn', 'Sách của tôi', 'Sách của cô ấy', 'Sách của họ'], correctAnswer: 'Sách của tôi', explanation: 'My là tính từ sở hữu của I (tôi).' },
            { question: 'Em gái hoặc chị gái trong tiếng Anh là gì?', options: ['Brother', 'Sister', 'Mother', 'Cousin'], correctAnswer: 'Sister', explanation: 'Sister là chị hoặc em gái.' },
            { question: '"His name is Tom." Từ "His" nghĩa là gì?', options: ['Của tôi', 'Của cô ấy', 'Của anh ấy', 'Của bạn'], correctAnswer: 'Của anh ấy', explanation: 'His là tính từ sở hữu của He.' },
            { question: '"Mother" nghĩa là gì?', options: ['Bà', 'Dì', 'Bố', 'Mẹ'], correctAnswer: 'Mẹ', explanation: 'Mother là mẹ.' },
            { question: 'Để nói "Tên của bạn là gì?", ta dùng?', options: ['What is my name?', 'What is your name?', 'What is his name?', 'What is her name?'], correctAnswer: 'What is your name?', explanation: 'Your nghĩa là của bạn.' },
            { question: 'Con trai của bố mẹ bạn là ___ của bạn?', options: ['Sister', 'Brother', 'Uncle', 'Father'], correctAnswer: 'Brother', explanation: 'Brother là anh hoặc em trai.' },
            { question: '"Her hat" nghĩa là gì?', options: ['Mũ của cô ấy', 'Mũ của anh ấy', 'Mũ của tôi', 'Mũ của bạn'], correctAnswer: 'Mũ của cô ấy', explanation: 'Her là tính từ sở hữu của She.' },
            { question: 'Ông bà trong tiếng Anh thường bắt đầu bằng từ?', options: ['Parent', 'Grand', 'Great', 'Super'], correctAnswer: 'Grand', explanation: 'Grandfather/Grandmother là ông/bà.' },
            { question: '"Parents" dùng để chỉ ai?', options: ['Anh chị em', 'Bố mẹ', 'Họ hàng', 'Bạn bè'], correctAnswer: 'Bố mẹ', explanation: 'Parents là bố và mẹ.' }
        ]
    },
    {
        title: 'Thì Quá khứ đơn',
        description: 'Cách dùng thì quá khứ đơn với động từ có quy tắc và bất quy tắc.',
        level: 'Trung',
        type: 'Grammar',
        xpAwarded: 100,
        duration: 15,
        order: 5,
        content: `
            <h3>1. Động từ có quy tắc (Regular Verbs)</h3>
            <p>Cấu trúc: V + ed (Ví dụ: Walk -> Walked)</p>
            <h3>2. Động từ bất quy tắc (Irregular Verbs)</h3>
            <p>Phải học thuộc (Ví dụ: Go -> Went, Eat -> Ate)</p>
            <h3>3. Dấu hiệu nhận biết</h3>
            <p>Yesterday, last week, 2 days ago...</p>
        `,
        questions: [
            { question: 'Quá khứ của "go" là gì?', options: ['goed', 'gone', 'went', 'goes'], correctAnswer: 'went', explanation: 'Go là động từ bất quy tắc, quá khứ là went.' },
            { question: 'I ___ football yesterday.', options: ['play', 'played', 'playing', 'plays'], correctAnswer: 'played', explanation: 'Yesterday là dấu hiệu thì quá khứ, play là động từ có quy tắc.' },
            { question: 'Quá khứ của "eat" là gì?', options: ['eated', 'ate', 'eaten', 'eat'], correctAnswer: 'ate', explanation: 'Eat chuyển sang quá khứ là ate.' },
            { question: 'They ___ to the cinema last night.', options: ['went', 'go', 'going', 'gone'], correctAnswer: 'went', explanation: 'Last night chỉ thời gian trong quá khứ.' },
            { question: 'She ___ (not/visit) me 2 days ago.', options: ['not visited', 'didnt visit', 'wasnt visit', 'doesnt visit'], correctAnswer: 'didnt visit', explanation: 'Phủ định quá khứ đơn: did not + V nguyên mẫu.' },
            { question: '"Was" và "Were" là quá khứ của động từ nào?', options: ['do', 'have', 'be', 'go'], correctAnswer: 'be', explanation: 'Be chia ở quá khứ là was/were.' },
            { question: '___ you see the movie last Sunday?', options: ['Do', 'Did', 'Was', 'Were'], correctAnswer: 'Did', explanation: 'Câu hỏi thì quá khứ đơn dùng trợ động từ Did.' },
            { question: 'He ___ a new car last month.', options: ['buy', 'buyed', 'bought', 'buying'], correctAnswer: 'bought', explanation: 'Quá khứ của buy là bought.' },
            { question: 'We ___ happy at the party.', options: ['was', 'were', 'did', 'are'], correctAnswer: 'were', explanation: 'We đi với were ở thì quá khứ.' },
            { question: 'I ___ my homework an hour ago.', options: ['do', 'did', 'done', 'doing'], correctAnswer: 'did', explanation: 'Did là dạng quá khứ của do.' }
        ]
    },
    {
        title: 'Du lịch & Khám phá',
        description: 'Từ vựng về du lịch, phương tiện và các tình huống tại sân bay, khách sạn.',
        level: 'Trung',
        type: 'Vocabulary',
        xpAwarded: 100,
        duration: 18,
        order: 6,
        content: `
            <h3>1. Phương tiện (Transportation)</h3>
            <p>Plane (Máy bay), Train (Tàu hỏa), Bus (Xe buýt), Ship (Tàu thủy)</p>
            <h3>2. Địa điểm (Places)</h3>
            <p>Airport (Sân bay), Hotel (Khách sạn), Beach (Bãi biển)</p>
            <h3>3. Hành động</h3>
            <p>Check-in (Làm thủ tục), Book a room (Đặt phòng), Buy a ticket (Mua vé)</p>
        `,
        questions: [
            { question: 'Nơi bạn đến để đi máy bay?', options: ['Station', 'Airport', 'Port', 'Bus stop'], correctAnswer: 'Airport', explanation: 'Airport là sân bay.' },
            { question: '"Book a room" nghĩa là gì?', options: ['Đọc sách trong phòng', 'Mua phòng', 'Đặt phòng', 'Dọn phòng'], correctAnswer: 'Đặt phòng', explanation: 'To book something nghĩa là đặt trước.' },
            { question: 'Phương tiện nào đi trên đường ray?', options: ['Plane', 'Ship', 'Train', 'Car'], correctAnswer: 'Train', explanation: 'Train là tàu hỏa.' },
            { question: '"Suitcase" dùng để làm gì?', options: ['Để mặc', 'Để đựng hành lý', 'Để lái', 'Để ăn'], correctAnswer: 'Để đựng hành lý', explanation: 'Suitcase là va li.' },
            { question: 'Bạn cần cái gì để lên máy bay?', options: ['Ticket', 'Book', 'Phone', 'Knife'], correctAnswer: 'Ticket', explanation: 'Ticket là vé (Boarding pass).' },
            { question: 'Nơi bạn ở khi đi du lịch?', options: ['Office', 'School', 'Hotel', 'Hospital'], correctAnswer: 'Hotel', explanation: 'Hotel là khách sạn.' },
            { question: '"Passport" là gì?', options: ['Thẻ thư viện', 'Hộ chiếu', 'Bằng lái xe', 'Thẻ học sinh'], correctAnswer: 'Hộ chiếu', explanation: 'Passport dùng để xuất nhập cảnh.' },
            { question: 'Làm gì khi vừa đến khách sạn?', options: ['Check-out', 'Check-in', 'Payment', 'Cleaning'], correctAnswer: 'Check-in', explanation: 'Check-in là thủ tục nhận phòng.' },
            { question: '"Souvenir" là vật gì?', options: ['Đồ ăn sáng', 'Quà lưu niệm', 'Vé máy bay', 'Bản đồ'], correctAnswer: 'Quà lưu niệm', explanation: 'Souvenir là quà lưu niệm.' },
            { question: 'Từ nào nghĩa là "Kỳ nghỉ"?', options: ['Work', 'Study', 'Vacation', 'Test'], correctAnswer: 'Vacation', explanation: 'Vacation hoặc Holiday nghĩa là kỳ nghỉ.' }
        ]
    },
    {
        title: 'Thì Hiện tại hoàn thành',
        description: 'Học cấu trúc Have/Has + V3 và cách phân biệt với Quá khứ đơn.',
        level: 'Cao',
        type: 'Grammar',
        xpAwarded: 150,
        duration: 20,
        order: 7,
        content: `
            <h3>1. Cấu trúc</h3>
            <p>S + have/has + V3/ed</p>
            <h3>2. Sử dụng</h3>
            <p>Hành động vừa mới xảy ra, hoặc xảy ra trong quá khứ nhưng không rõ thời gian và còn liên quan đến hiện tại.</p>
            <h3>3. Dấu hiệu</h3>
            <p>Just, recently, already, yet, since, for, never, ever.</p>
        `,
        questions: [
            { question: 'I ___ (live) here since 2010.', options: ['lived', 'have lived', 'has lived', 'am living'], correctAnswer: 'have lived', explanation: 'Since + mốc thời gian là dấu hiệu Hiện tại hoàn thành.' },
            { question: 'She ___ her homework already.', options: ['did', 'has done', 'have done', 'does'], correctAnswer: 'has done', explanation: 'She đi với has.' },
            { question: 'Have you ___ seen a lion?', options: ['never', 'ever', 'just', 'yet'], correctAnswer: 'ever', explanation: 'Ever dùng trong câu hỏi nghi vấn Hiện tại hoàn thành.' },
            { question: 'We ___ (not/meet) him recently.', options: ['didnt meet', 'havent met', 'hasnt met', 'dont meet'], correctAnswer: 'havent met', explanation: 'Recently là dấu hiệu Hiện tại hoàn thành.' },
            { question: 'They ___ (visit) Paris 3 times.', options: ['visited', 'have visited', 'has visited', 'visit'], correctAnswer: 'have visited', explanation: 'Nói về số lần trải nghiệm dùng Hiện tại hoàn thành.' },
            { question: 'V3 của "see" là gì?', options: ['saw', 'seen', 'seed', 'sees'], correctAnswer: 'seen', explanation: 'See -> Saw -> Seen.' },
            { question: 'Phân biệt: I ___ (lose) my key (vừa mới mất).', options: ['lost', 'have lost', 'had lost', 'lose'], correctAnswer: 'have lost', explanation: 'Mất khóa để lại hậu quả ở hiện tại (không vào được nhà).' },
            { question: 'He has worked here ___ 5 years.', options: ['since', 'for', 'ago', 'in'], correctAnswer: 'for', explanation: 'For + khoảng thời gian.' },
            { question: 'Has she ___ arrived?', options: ['just', 'yet', 'never', 'ever'], correctAnswer: 'just', explanation: 'Just diễn tả hành động vừa mới xảy ra.' },
            { question: 'I ___ (finish) the report yet.', options: ['havent finished', 'hasnt finished', 'didnt finish', 'not finish'], correctAnswer: 'havent finished', explanation: 'Yet dùng trong câu phủ định Hiện tại hoàn thành.' }
        ]
    },
    {
        title: 'Môi trường & Xã hội',
        description: 'Từ vựng nâng cao về biến đổi khí hậu, bảo vệ môi trường và các vấn đề xã hội.',
        level: 'Cao',
        type: 'Vocabulary',
        xpAwarded: 200,
        duration: 25,
        order: 8,
        content: `
            <h3>1. Biến đổi khí hậu (Climate Change)</h3>
            <p>Global warming, greenhouse effect, carbon footprint.</p>
            <h3>2. Bảo vệ môi trường</h3>
            <p>Recycle (Tái chế), Renewable energy (Năng lượng tái tạo), Sustainability (Sự bền vững).</p>
            <h3>3. Vấn đề xã hội</h3>
            <p>Poverty (Nghèo đói), Inequality (Bất bình đẳng), Overpopulation (Bùng nổ dân số).</p>
        `,
        questions: [
            { question: '"Global warming" là gì?', options: ['Trái đất lạnh đi', 'Nóng lên toàn cầu', 'Bão lũ', 'Động đất'], correctAnswer: 'Nóng lên toàn cầu', explanation: 'Sự tăng nhiệt độ trung bình của Trái đất.' },
            { question: 'Hành động chuyển rác thải thành vật liệu mới?', options: ['Reuse', 'Recycle', 'Reduce', 'Replace'], correctAnswer: 'Recycle', explanation: 'Recycle là tái chế.' },
            { question: 'Nguồn năng lượng từ mặt trời, gió gọi là gì?', options: ['Fossil fuels', 'Renewable energy', 'Nuclear energy', 'Coal'], correctAnswer: 'Renewable energy', explanation: 'Năng lượng tái tạo.' },
            { question: '"Deforestation" gây ra hậu quả gì?', options: ['Mất rừng', 'Nhiều cây hơn', 'Sạch không khí', 'Mưa nhiều'], correctAnswer: 'Mất rừng', explanation: 'Deforestation là sự phá rừng.' },
            { question: '"Pollution" nghĩa là gì?', options: ['Trong lành', 'Ô nhiễm', 'Xanh hóa', 'Phát triển'], correctAnswer: 'Ô nhiễm', explanation: 'Sự làm bẩn môi trường.' },
            { question: 'Từ nào chỉ sự nghèo đói?', options: ['Wealth', 'Poverty', 'Health', 'Luxury'], correctAnswer: 'Poverty', explanation: 'Poverty là tình trạng nghèo khổ.' },
            { question: '"Carbon footprint" đo lường cái gì?', options: ['Dấu chân', 'Lượng khí thải CO2', 'Độ sạch của nước', 'Chiều cao'], correctAnswer: 'Lượng khí thải CO2', explanation: 'Lượng khí nhà kính do cá nhân/tổ chức tạo ra.' },
            { question: '"Sustainability" có nghĩa là gì?', options: ['Sự nhanh chóng', 'Sự bền vững', 'Sự yếu ớt', 'Sự tạm thời'], correctAnswer: 'Sự bền vững', explanation: 'Phát triển đáp ứng hiện tại mà không hại tương lai.' },
            { question: 'Vấn đề có quá nhiều người sống ở một khu vực?', options: ['Migration', 'Overpopulation', 'Diversity', 'Poverty'], correctAnswer: 'Overpopulation', explanation: 'Quá tải/Bùng nổ dân số.' },
            { question: 'Hành động "Reuse" nghĩa là gì?', options: ['Vứt bỏ', 'Dùng lại', 'Mua mới', 'Đốt đi'], correctAnswer: 'Dùng lại', explanation: 'Reuse là tái sử dụng.' }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        await Lesson.deleteMany({});
        console.log('Old lessons cleared.');

        await Lesson.insertMany(lessons);
        console.log('New lessons seeded with 10 questions each!');

        process.exit();
    } catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
};

seedDB();
