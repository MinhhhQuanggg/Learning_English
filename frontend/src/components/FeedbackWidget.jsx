import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';
import api from '../api/axios';

const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);

    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

    useEffect(() => {
        const checkUser = () => {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (JSON.stringify(user) !== JSON.stringify(currentUser)) {
                setCurrentUser(user);
            }
        };
        const interval = setInterval(checkUser, 1000);
        return () => clearInterval(interval);
    }, [currentUser]);

    if (!currentUser) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return alert('Vui lòng nhập đầy đủ thông tin');

        setSending(true);
        try {
            await api.post('/feedback', { title, content });
            alert('Cảm ơn bạn đã gửi đóng góp!');
            setIsOpen(false);
            setTitle('');
            setContent('');
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi khi gửi góp ý');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="animate-fade-in"
                    title="Gửi góp ý/Báo lỗi"
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 90,
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <MessageSquarePlus size={24} />
                </button>
            )}

            {/* Feedback Modal */}
            {isOpen && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100, width: '380px', maxWidth: 'calc(100vw - 4rem)' }} className="animate-fade-in">
                    <div className="glass-card" style={{ padding: '0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                                <MessageSquarePlus size={20} />
                                Gửi thông báo / Góp ý
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', opacity: 0.8 }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.8}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.85rem' }}>Tiêu đề</label>
                                    <input
                                        type="text"
                                        placeholder="Vd: Lỗi giao diện, Gợi ý tính năng..."
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                        style={{ padding: '0.75rem', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.85rem' }}>Nội dung chi tiết</label>
                                    <textarea
                                        placeholder="Mô tả chi tiết lỗi hoặc góp ý của bạn..."
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        required
                                        rows="4"
                                        style={{ padding: '0.75rem', fontSize: '0.9rem', resize: 'vertical' }}
                                    />
                                </div>
                                <button disabled={sending || !title.trim() || !content.trim()} type="submit" className="btn btn-primary" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '700' }}>
                                    {sending ? 'Đang gửi...' : <><Send size={18} /> Gửi ý kiến</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FeedbackWidget;
