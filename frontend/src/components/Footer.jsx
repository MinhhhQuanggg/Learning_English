import React from 'react';
import { Mail, MessageCircle, Facebook, Users } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: '#4a90e2', // Màu xanh chủ đạo của Mochi
            color: 'white',
            padding: '4rem 2rem',
            marginTop: '4rem'
        }}>
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

                    <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Liên hệ</h4>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', opacity: '0.9' }}>
                        <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} /> qminh0733@gmail.com
                        </li>
                        <li style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageCircle size={16} /> Nhắn tin cho EngPath
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            SĐT: 0868410577
                        </li>
                    </ul>
                </div>

                {/* Câu hỏi thường gặp */}
                <div>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Câu hỏi thường gặp</h4>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', opacity: '0.9' }}>
                        <li style={{ marginBottom: '1rem' }}>EngPath hoạt động như thế nào?</li>
                        <li style={{ marginBottom: '1rem' }}>EngPath có miễn phí không?</li>
                        <li style={{ marginBottom: '1rem' }}>Hướng dẫn thanh toán EngPath</li>
                        <li style={{ marginBottom: '1rem' }}>Đăng ký mua EngPath</li>
                        <li>Adaptive Learning là gì?</li>
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
