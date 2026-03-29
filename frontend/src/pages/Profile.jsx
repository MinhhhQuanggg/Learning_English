import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Award, Camera, Save, ChevronLeft, CheckCircle2, X, Lock, BookOpen, HelpCircle, Zap, Clock, Tag, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

const AVATAR_PRESETS = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Mia',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Charlie',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Max',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jordan',
];

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

    // Modal 9: Đổi mật khẩu
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState('');
    const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });

    // Modal 10: Cập nhật Avatar
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedPresetAvatar, setSelectedPresetAvatar] = useState('');

    // Modal chi tiết bài học đã hoàn thành
    const [showLessonDetailModal, setShowLessonDetailModal] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);

    const handleViewLessonDetail = (item) => {
        setSelectedLesson(item);
        setShowLessonDetailModal(true);
    };

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

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            return setPwMsg('❌ Mật khẩu mới và xác nhận không khớp.');
        }
        setPwLoading(true);
        setPwMsg('');
        try {
            await api.put('/auth/change-password', { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
            setPwMsg('✅ Đổi mật khẩu thành công! Đang chuyển hướng...');
            setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => {
                setShowPasswordModal(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }, 1500);
        } catch (err) {
            setPwMsg('❌ ' + (err.response?.data?.message || 'Mật khẩu cũ không đúng.'));
        } finally {
            setPwLoading(false);
        }
    };

    const handleApplyPresetAvatar = async () => {
        if (!selectedPresetAvatar) return;
        try {
            const res = await api.put('/auth/update-profile', { ...formData, avatar: selectedPresetAvatar });
            if (res.data.success) {
                setFormData(prev => ({ ...prev, avatar: selectedPresetAvatar }));
                setUser(res.data.data);
                localStorage.setItem('user', JSON.stringify(res.data.data));
                setMessage('Đã cập nhật ảnh đại diện!');
                setShowAvatarModal(false);
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            setMessage('Lỗi khi cập nhật avatar: ' + err.message);
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
                            <label
                                onClick={() => setShowAvatarModal(true)}
                                style={{ position: 'absolute', bottom: '5px', right: '5px', backgroundColor: 'var(--primary)', color: 'white', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', display: 'flex' }}
                            >
                                <Camera size={18} />
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
                            <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowPasswordModal(true); setPwMsg(''); }}
                                    style={{ padding: '0.75rem 1.5rem', borderRadius: '16px', border: '2px solid var(--primary)', backgroundColor: 'white', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Lock size={18} /> Đổi mật khẩu
                                </button>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {user.completedLessons.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleViewLessonDetail(item)}
                                        style={{
                                            padding: '1rem 1.25rem',
                                            border: '1px solid var(--gray-100)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            backgroundColor: 'white',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.backgroundColor = 'rgba(74,144,226,0.06)';
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = 'var(--gray-100)';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.lesson?.title || 'Bài học đã học'}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: '2px' }}>Nhấn để xem chi tiết</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                                                {new Date(item.completedAt).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div style={{ color: 'var(--primary)', opacity: 0.5 }}>›</div>
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

            {/* ===== MODAL 9: Đổi mật khẩu ===== */}
            {showPasswordModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '440px', maxWidth: '92%', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', position: 'relative' }}>
                        <button onClick={() => setShowPasswordModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={22} /></button>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '60px', height: '60px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Lock size={28} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '0.25rem' }}>Đổi mật khẩu</h3>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Nhập mật khẩu cũ và mật khẩu mới của bạn.</p>
                        </div>
                        {pwMsg && (
                            <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: pwMsg.startsWith('✅') ? '#ecfdf5' : '#fee2e2', color: pwMsg.startsWith('✅') ? '#047857' : '#b91c1c', fontSize: '0.875rem', textAlign: 'center' }}>{pwMsg}</div>
                        )}
                        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>Mật khẩu cũ</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showPw.old ? 'text' : 'password'}
                                        value={pwForm.oldPassword}
                                        onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                                        required
                                        style={{ paddingRight: '3rem', width: '100%' }}
                                    />
                                    <button type="button" onClick={() => setShowPw(p => ({ ...p, old: !p.old }))} style={{ position: 'absolute', right: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                                        {showPw.old ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Mật khẩu mới</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showPw.new ? 'text' : 'password'}
                                        value={pwForm.newPassword}
                                        onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                                        required
                                        style={{ paddingRight: '3rem', width: '100%' }}
                                    />
                                    <button type="button" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))} style={{ position: 'absolute', right: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                                        {showPw.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Xác nhận mật khẩu mới</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showPw.confirm ? 'text' : 'password'}
                                        value={pwForm.confirmPassword}
                                        onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                                        required
                                        style={{ paddingRight: '3rem', width: '100%' }}
                                    />
                                    <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))} style={{ position: 'absolute', right: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                                        {showPw.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                                {pwLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== MODAL 10: Chọn Avatar ===== */}
            {showAvatarModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '500px', maxWidth: '92%', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', position: 'relative' }}>
                        <button onClick={() => setShowAvatarModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={22} /></button>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '0.5rem' }}>🖼️ Chọn ảnh đại diện</h3>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Tải ảnh lên từ thiết bị hoặc chọn avatar có sẵn:</p>

                        {/* Nút Upload từ máy */}
                        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#f8fafc', color: 'var(--primary)', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', border: '2px dashed #cbd5e1', transition: 'all 0.2s', width: '100%' }}>
                                <Camera size={20} /> Tải ảnh lên từ máy
                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                                    handleAvatarChange(e);
                                    setShowAvatarModal(false);
                                }} />
                            </label>
                        </div>

                        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid #e5e7eb', zIndex: 1 }}></div>
                            <span style={{ position: 'relative', zIndex: 2, backgroundColor: 'white', padding: '0 10px', fontSize: '0.85rem', color: '#9ca3af' }}>Hoặc chọn avatar có sẵn</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            {AVATAR_PRESETS.map((url, i) => (
                                <div key={i} onClick={() => setSelectedPresetAvatar(url)} style={{ cursor: 'pointer', borderRadius: '12px', padding: '0.5rem', border: `3px solid ${selectedPresetAvatar === url ? 'var(--primary)' : '#e5e7eb'}`, transition: 'all 0.2s', display: 'flex', justifyContent: 'center', backgroundColor: selectedPresetAvatar === url ? 'var(--primary-light)' : 'white' }}>
                                    <img src={url} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowAvatarModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}>Hủy</button>
                            <button onClick={handleApplyPresetAvatar} className="btn btn-primary" style={{ flex: 1 }} disabled={!selectedPresetAvatar}>Áp dụng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL Chi tiết bài học ===== */}
            {showLessonDetailModal && selectedLesson && (
                <div
                    onClick={() => setShowLessonDetailModal(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 60, backdropFilter: 'blur(4px)' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ backgroundColor: 'white', borderRadius: '20px', padding: '0', width: '500px', maxWidth: '94%', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden', animation: 'fadeInUp 0.25s ease' }}
                    >
                        {/* Header gradient */}
                        <div style={{ background: 'linear-gradient(135deg, #4a90e2 0%, #6c63ff 100%)', padding: '1.5rem 2rem', color: 'white', position: 'relative' }}>
                            <button
                                onClick={() => setShowLessonDetailModal(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', opacity: 0.85 }}>
                                <BookOpen size={18} />
                                <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>Chi tiết bài học</span>
                            </div>
                            <h3 style={{ fontWeight: '800', fontSize: '1.25rem', lineHeight: 1.3, margin: 0 }}>
                                {selectedLesson.lesson?.title || 'Bài học đã hoàn thành'}
                            </h3>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '1.5rem 2rem' }}>

                            {/* Ngày giờ */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                                <Clock size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ngày hoàn thành</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1f2937' }}>
                                        {new Date(selectedLesson.completedAt).toLocaleString('vi-VN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Stats điểm số */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
                                <div style={{ padding: '0.875rem 0.5rem', backgroundColor: 'rgba(74,144,226,0.07)', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)' }}>
                                        {selectedLesson.score ?? '—'}%
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: '600', marginTop: '2px' }}>Số điểm</div>
                                </div>
                                <div style={{ padding: '0.875rem 0.5rem', backgroundColor: 'rgba(16,185,129,0.07)', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981' }}>
                                        {selectedLesson.correctAnswers ?? '—'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: '600', marginTop: '2px' }}>Câu đúng</div>
                                </div>
                                <div style={{ padding: '0.875rem 0.5rem', backgroundColor: 'rgba(239,68,68,0.07)', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ef4444' }}>
                                        {selectedLesson.wrongAnswers ?? '—'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: '600', marginTop: '2px' }}>Câu sai</div>
                                </div>
                                <div style={{ padding: '0.875rem 0.5rem', backgroundColor: 'rgba(245,158,11,0.07)', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f59e0b' }}>
                                        {selectedLesson.totalQuestions ?? '—'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: '600', marginTop: '2px' }}>Tổng câu</div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            {selectedLesson.totalQuestions > 0 && (
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: '600', marginBottom: '0.4rem' }}>
                                        <span>Tỷ lệ đúng</span>
                                        <span style={{ color: selectedLesson.score >= 70 ? '#10b981' : '#ef4444' }}>{selectedLesson.score}%</span>
                                    </div>
                                    <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${selectedLesson.score}%`,
                                            backgroundColor: selectedLesson.score >= 70 ? '#10b981' : '#ef4444',
                                            borderRadius: '99px',
                                            transition: 'width 0.6s ease'
                                        }} />
                                    </div>
                                </div>
                            )}

                            {/* Kết quả đánh giá */}
                            {selectedLesson.totalQuestions > 0 && (
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    marginBottom: '1.25rem',
                                    backgroundColor: selectedLesson.score >= 70 ? '#ecfdf5' : '#fef2f2',
                                    color: selectedLesson.score >= 70 ? '#047857' : '#b91c1c',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '700',
                                    fontSize: '0.9rem'
                                }}>
                                    {selectedLesson.score >= 70
                                        ? <><CheckCircle2 size={18} /> Xuất sắc! Bạn đã nắm vững bài học này.</>
                                        : <><HelpCircle size={18} /> Cần cố gắng thêm. Hãy xem lại bài học nhé!</>}
                                </div>
                            )}

                            <button
                                onClick={() => setShowLessonDetailModal(false)}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', fontWeight: '700', fontSize: '1rem' }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
