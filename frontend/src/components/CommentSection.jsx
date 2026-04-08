import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, User } from 'lucide-react';
import api from '../api/axios';

const CommentSection = ({ lessonId, currentUser }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/comments/lesson/${lessonId}`);
            setComments(res.data.data);
        } catch (err) {
            console.error('Lỗi khi tải bình luận', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lessonId) fetchComments();
    }, [lessonId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await api.post('/comments', { lesson: lessonId, content: newComment });
            setNewComment('');
            fetchComments();
        } catch (err) {
            console.error(err);
            alert('Không thể gửi bình luận');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-500)' }}>Đang tải bình luận...</div>;

    return (
        <div className="glass-card animate-fade-in" style={{ marginTop: '2rem', padding: '2rem', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle size={22} color="var(--primary)" /> Bình luận ({comments.length})
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--gray-100)', flexShrink: 0, overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    {currentUser?.avatar ? <img src={currentUser.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="var(--gray-400)" style={{ margin: '8px' }} />}
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Thêm bình luận của bạn..."
                        style={{ width: '100%', padding: '0.8rem 3rem 0.8rem 1.25rem', borderRadius: '20px', border: '1px solid var(--gray-200)', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
                    />
                    <button type="submit" disabled={!newComment.trim()} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'var(--primary)', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newComment.trim() ? 'pointer' : 'not-allowed', opacity: newComment.trim() ? 1 : 0.5 }}>
                        <Send size={16} />
                    </button>
                </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {comments.length > 0 ? comments.map(comment => (
                    <div key={comment._id} style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--gray-100)', flexShrink: 0, overflow: 'hidden' }}>
                            {comment.user?.avatar ? <img src={comment.user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="var(--gray-400)" style={{ margin: '8px' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <strong style={{ fontSize: '0.95rem', color: 'var(--gray-800)' }}>{comment.user?.fullName || 'Người dùng'}</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{new Date(comment.createdAt).toLocaleDateString('vi-VN')} {new Date(comment.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem', color: 'var(--gray-700)', lineHeight: '1.5' }}>
                                {comment.content}
                            </p>
                        </div>
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem', fontStyle: 'italic', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '15px' }}>Chưa có bình luận nào. Hãy là người chia sẻ suy nghĩ đầu tiên của bạn!</div>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
