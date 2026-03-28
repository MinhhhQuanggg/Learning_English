import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const FAQ = () => {
    const [activeSection, setActiveSection] = useState(null);
    const location = useLocation();

    useEffect(() => {
        // If there's a hash in the URL, scroll to it
        if (location.hash) {
            const id = location.hash.substring(1); // remove '#'
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setActiveSection(id);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [location]);

    const toggleSection = (id) => {
        setActiveSection(activeSection === id ? null : id);
    };

    const faqs = [
        {
            id: 'how-it-works',
            question: 'EngPath hoạt động như thế nào?',
            answer: 'EngPath là nền tảng học tiếng Anh trực tuyến tập trung vào việc cá nhân hóa lộ trình học cho từng học viên. Chúng tôi sử dụng các bài kiểm tra đầu vào và theo dõi quá trình học tập của bạn để đề xuất các bài học, từ vựng, và bài tập phù hợp nhất với trình độ hiện tại, giúp bạn học nhanh và hiệu quả hơn.'
        },
        {
            id: 'pricing',
            question: 'EngPath có miễn phí không?',
            answer: 'EngPath cung cấp cả tính năng miễn phí và trả phí. Bạn có thể tạo tài khoản và dùng thử một số lượng bài học cơ bản và các bài kiểm tra hoàn toàn miễn phí. Để truy cập toàn bộ kho dữ liệu, lộ trình học cá nhân hóa chuyên sâu và các tính năng nâng cao khác, bạn cần nâng cấp lên tài khoản Premium.'
        },
        {
            id: 'payment-guide',
            question: 'Hướng dẫn thanh toán EngPath',
            answer: `Để thanh toán và nâng cấp tài khoản, vui lòng làm theo các bước sau:
1. Đăng nhập vào tài khoản của bạn.
2. Chọn mục "Nâng cấp" hoặc "Đăng ký mua EngPath".
3. Lựa chọn gói học phù hợp với nhu cầu.
4. Chuyển khoản đến số tài khoản: 123456789 - Ngân hàng ABC - Tên TK: EngPath Education với nội dung là Email đăng ký hoặc Tên đăng nhập của bạn.
5. Sau khi thanh toán, tài khoản sẽ được kích hoạt tự động hoặc bạn có thể liên hệ Fanpage/Email cùng biên lai để được hỗ trợ nhanh nhất.`
        },
        {
            id: 'register-buy',
            question: 'Đăng ký mua EngPath',
            answer: 'Truy cập vào trang chủ hoặc đăng nhập tài khoản của bạn để xem các gói hiện hành. Chúng tôi thường xuyên có các chương trình khuyến mãi cho học viên mới. Để được tư vấn chi tiết hơn, bạn có thể nhắn tin cho đội ngũ chăm sóc khách hàng của EngPath.'
        },
        {
            id: 'adaptive-learning',
            question: 'Adaptive Learning là gì?',
            answer: 'Adaptive Learning (Học tập thích ứng) là công nghệ giáo dục sử dụng thuật toán máy tính để điều biến mức độ tương tác, tài liệu học tập và các câu đố/bài kiểm tra cho từng cá nhân, dựa trên phản hồi và sự nắm bắt kiến thức của sinh viên đó. Điều này có nghĩa là nếu bạn giỏi về một chủ đề, hệ thống sẽ đưa ra các thử thách khó hơn, và nếu bạn gặp khó khăn, hệ thống sẽ cung cấp nhiều bài ôn tập và giải thích chi tiết hơn.'
        }
    ];

    return (
        <div style={{ minHeight: '80vh', backgroundColor: '#f9fafb', padding: '4rem 2rem' }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '3rem'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '3rem', color: '#1f2937', fontSize: '2.5rem', fontWeight: '800' }}>
                    Câu hỏi thường gặp
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {faqs.map((faq) => (
                        <div
                            key={faq.id}
                            id={faq.id}
                            style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                scrollMarginTop: '100px'
                            }}
                        >
                            <button
                                onClick={() => toggleSection(faq.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1.5rem',
                                    backgroundColor: activeSection === faq.id ? '#f3f4f6' : 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>
                                    {faq.question}
                                </span>
                                <span style={{ fontSize: '1.5rem', color: '#6b7280', transform: activeSection === faq.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                                    ↓
                                </span>
                            </button>

                            {activeSection === faq.id && (
                                <div style={{
                                    padding: '0 1.5rem 1.5rem 1.5rem',
                                    backgroundColor: '#f3f4f6',
                                    color: '#4b5563',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-line'
                                }}>
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQ;
