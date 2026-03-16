import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Award, Camera, Save, ChevronLeft, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        level: '',
        avatar: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/auth/me');
                const userData = res.data.data;
                setUser(userData);

                // Force form to use DB level instead of cached level
                setFormData(prev => ({
                    ...prev,
                    fullName: userData.fullName || '',
                    phone: userData.phone || '',
                    level: userData.level || '',
                    avatar: userData.avatar || ''
                }));
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (err) {
                console.error('Lỗi lấy thông tin người dùng', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Hiển thị ảnh tạm thời trên giao diện
            const tempUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, avatar: tempUrl }));

            // Tự động tải lên server
            const uploadData = new FormData();
            uploadData.append('avatar', file);

            try {
                setMessage('Đang tải lên ảnh...');
                const res = await api.post('/auth/upload-avatar', uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (res.data.success) {
                    setMessage('Đã lưu ảnh đại diện!');
                    setUser(res.data.data);
                    setFormData(prev => ({ ...prev, avatar: res.data.avatar }));
                    localStorage.setItem('user', JSON.stringify(res.data.data));
                    setTimeout(() => setMessage(''), 3000);
                }
            } catch (err) {
                setMessage(err.response?.data?.message || 'Có lỗi khi tải lên ảnh');
                setFormData(prev => ({ ...prev, avatar: user.avatar }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const res = await api.put('/auth/update-profile', formData);
            if (res.data.success) {
                setMessage('Cập nhật thông tin thành công!');
                setUser(res.data.data);
                localStorage.setItem('user', JSON.stringify(res.data.data));
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
                <div className="animate-pulse">Đang tải thông tin...</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0 5rem 0' }}>
            <button
                onClick={() => navigate('/dashboard')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--gray-500)',
                    cursor: 'pointer',
                    marginBottom: '2rem',
                    fontWeight: '600'
                }}
            >
                <ChevronLeft size={20} /> Quay lại Dashboard
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', flexWrap: 'wrap' }}>
                {/* Cột trái: Ảnh đại diện & Thông tin đăng ký */}
                <div className="animate-fade-in">
                    <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 1.5rem auto' }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '4px solid var(--white)',
                                boxShadow: 'var(--shadow)',
                                backgroundColor: 'var(--gray-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={80} style={{ color: 'var(--primary)' }} />
                                )}
                            </div>
                            <label style={{
                                position: 'absolute',
                                bottom: '5px',
                                right: '5px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                padding: '0.6rem',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                display: 'flex'
                            }}>
                                <Camera size={18} />
                                <input type="file" hidden onChange={handleAvatarChange} accept="image/*" />
                            </label>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{user.fullName}</h2>
                        <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Học viên tại EngPath</p>

                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', backgroundColor: 'rgba(74, 144, 226, 0.05)', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Mail size={18} style={{ color: 'var(--primary)' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Email đăng ký</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Phone size={18} style={{ color: 'var(--success)' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Số điện thoại</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.phone}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Award size={18} style={{ color: 'var(--secondary)' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Trình độ hiện tại</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.level}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Chỉnh sửa & Lịch sử */}
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Cài đặt tài khoản
                        </h3>

                        {message && (
                            <div style={{
                                padding: '1rem',
                                backgroundColor: message.includes('thành công') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: message.includes('thành công') ? 'var(--success)' : 'var(--error)',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <CheckCircle2 size={20} /> {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nhập họ tên đầy đủ"
                                />
                            </div>
                            <div className="input-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            <div className="input-group">
                                <label>Mục tiêu trình độ</label>
                                <select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                >
                                    <option value="Thấp">Sơ cấp (Thấp)</option>
                                    <option value="Trung">Trung cấp (Trung)</option>
                                    <option value="Cao">Cao cấp (Cao)</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '1rem' }}>
                                <button
                                    className="btn btn-primary"
                                    type="submit"
                                    disabled={saving}
                                    style={{ padding: '1rem 3rem', borderRadius: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}
                                >
                                    {saving ? 'Đang lưu...' : <><Save size={20} /> Lưu thay đổi</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="glass-card" style={{ padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Lịch sử bài học</h3>
                        {user.completedLessons && user.completedLessons.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {user.completedLessons.map((item, index) => (
                                    <div key={index} style={{ padding: '1rem', border: '1px solid var(--gray-100)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: '600' }}>{item.lesson?.title || 'Bài học đã học'}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                                            {new Date(item.completedAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)', backgroundColor: 'var(--gray-100)', borderRadius: '16px' }}>
                                Bạn chưa hoàn thành bài học nào. Hãy bắt đầu ngay nhé!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
