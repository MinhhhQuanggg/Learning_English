import React from 'react';
import { Mail, MessageCircle, Facebook, Users } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: '#4a90e2', // Màu xanh chủ đạo của Mochi
            color: 'white',
            padding: '4rem 2rem',
            marginTop: 'auto'
        }}>
            <style>
                {`
                    .footer-link {
                        color: rgba(255, 255, 255, 0.9);
                        text-decoration: none;
                        transition: color 0.2s, transform 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        cursor: pointer;
                    }
                    .footer-link:hover {
                        color: #ffffff;
                        transform: translateX(5px);
                    }
                `}
            </style>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '3rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Logo & Liên hệ */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <img src="/assets/opportunity.png" alt="EngPath Logo" style={{ width: '50px', height: '50px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)' }} />
                        <span style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '0.05em' }}>ENGPATH</span>
                    </div>

                    <h4 style={{ marginBottom: '1.2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>Liên hệ</h4>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '1rem' }}>
                            <a href="mailto:qminh0733@gmail.com" className="footer-link">
                                <Mail size={18} /> qminh0733@gmail.com
                            </a>
                        </li>
                        <li style={{ marginBottom: '1rem' }}>
                            <a href="https://m.me/engpath" target="_blank" rel="noreferrer" className="footer-link">
                                <MessageCircle size={18} /> Nhắn tin cho EngPath
                            </a>
                        </li>
                        <li>
                            <a href="tel:0868410577" className="footer-link">
                                <span style={{ fontWeight: 'bold' }}>SĐT:</span> 0868410577
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Câu hỏi thường gặp */}
                <div>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>Câu hỏi thường gặp</h4>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '1.2rem' }}><a href="#" onClick={(e) => { e.preventDefault(); alert("EngPath là hệ thống học tiếng Anh thông minh. Hệ thống cung cấp lộ trình cá nhân hóa, lý thuyết, bài tập trắc nghiệm và báo cáo thống kê tiến độ học. Đặc biệt, tính năng Đấu 1vs1 thời gian thực giúp bạn rèn luyện sự nhạy bén và phản xạ tiếng Anh tối đa."); }} className="footer-link">EngPath hoạt động như thế nào?</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); alert("Adaptive Learning (Học tập thích ứng) là công nghệ giáo dục tự động phân tích kết quả của bạn để điều chỉnh độ khó. Nếu trả lời đúng liên tục, câu hỏi sẽ khó hơn; nếu sai, hệ thống sẽ gợi ý lại kiến thức cũ, giúp tùy biến 100% theo đúng năng lực cá nhân."); }} className="footer-link">Adaptive Learning là gì?</a></li>
                    </ul>
                </div>

            </div>

            <div style={{
                textAlign: 'center',
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.8rem',
                opacity: '0.7'
            }}>
                © 2026 EngPath Project. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
