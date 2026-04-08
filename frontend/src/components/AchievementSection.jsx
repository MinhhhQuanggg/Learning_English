import React, { useState, useEffect } from 'react';
import { Medal, Trophy, Star, Shield, Target } from 'lucide-react';
import api from '../api/axios';

const BADGE_ICONS = {
    'starter': <Target size={30} color="#f59e0b" />,
    'streak': <Star size={30} color="#ef4444" />,
    'master': <Medal size={30} color="#8b5cf6" />,
    'default': <Shield size={30} color="#3b82f6" />
};

const AchievementSection = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAchievements = async () => {
        try {
            const res = await api.get('/gamification/achievements');
            setAchievements(res.data.data);
        } catch (err) {
            console.error('Lỗi khi tải thành tựu', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-500)' }}>Đang tải Thành tựu...</div>;

    return (
        <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={24} color="#f59e0b" /> Thành tựu cá nhân
            </h3>

            {achievements.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                    {achievements.map((item, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            padding: '1.5rem',
                            borderRadius: '20px',
                            backgroundColor: item.achievedAt ? '#fffbeb' : 'var(--gray-50)',
                            border: `2px solid ${item.achievedAt ? '#fde047' : 'var(--gray-100)'}`,
                            opacity: item.achievedAt ? 1 : 0.6,
                            transition: 'all 0.2s',
                            cursor: 'default'
                        }}
                            onMouseOver={e => { if (item.achievedAt) e.currentTarget.style.transform = 'translateY(-4px)' }}
                            onMouseOut={e => { if (item.achievedAt) e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            <div style={{
                                width: '60px', height: '60px',
                                borderRadius: '50%',
                                backgroundColor: item.achievedAt ? 'white' : 'var(--gray-200)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1rem',
                                boxShadow: item.achievedAt ? '0 10px 20px rgba(245,158,11,0.2)' : 'none',
                                filter: item.achievedAt ? 'none' : 'grayscale(100%)'
                            }}>
                                {BADGE_ICONS[item.badgeType] || BADGE_ICONS['default']}
                            </div>
                            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--gray-800)', marginBottom: '0.25rem' }}>{item.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', lineHeight: '1.4' }}>{item.description}</div>
                            {item.achievedAt && (
                                <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: '700', marginTop: '0.75rem', backgroundColor: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                    Đạt được: {new Date(item.achievedAt).toLocaleDateString('vi-VN')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)', backgroundColor: 'var(--gray-50)', borderRadius: '16px' }}>
                    Chưa có thành tựu nào. Hãy học tập chăm chỉ để mở khóa nhé!
                </div>
            )}
        </div>
    );
};

export default AchievementSection;
