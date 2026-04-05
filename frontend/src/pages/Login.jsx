import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, X, Mail } from 'lucide-react';
import api from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Modal 13: Quên mật khẩu
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMsg, setForgotMsg] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotMsg('');
        try {
            await api.post('/auth/forgot-password', { email: forgotEmail });
            setForgotMsg('✅ Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư của bạn.');
        } catch (err) {
            setForgotMsg('❌ ' + (err.response?.data?.message || 'Không tìm thấy email này trong hệ thống.'));
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="container flex justify-center items-center" style={{ minHeight: '80vh' }}>
            <div className="glass-card animate-fade-in" style={{
                padding: '2.5rem', width: '100%', maxWidth: '480px',
                background: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 50%, #fef2f2 100%)',
                border: '1px solid rgba(239, 68, 68, 0.12)',
                boxShadow: '0 20px 50px rgba(239, 68, 68, 0.08), 0 8px 20px rgba(245, 158, 11, 0.06)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#dc2626' }}>Chào mừng trở lại!</h2>
                <p style={{ textAlign: 'center', color: '#92400e', marginBottom: '2rem', fontSize: '0.875rem' }}>
                    Đăng nhập để tiếp tục hành trình học tiếng Anh của bạn.
                </p>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email" style={{ color: '#9a3412' }}>Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                            style={{ borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(255,255,255,0.8)' }}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password" style={{ color: '#9a3412' }}>Mật khẩu</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(255,255,255,0.8)' }}
                            />
                            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                    </div>

                    {/* Link mở Modal 13 */}
                    <div style={{ textAlign: 'right', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                        <button type="button" onClick={() => { setShowForgotModal(true); setForgotMsg(''); setForgotEmail(''); }} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>
                            Quên mật khẩu?
                        </button>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '0.85rem', borderRadius: '12px', border: 'none',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                        color: 'white', fontWeight: '700', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
                        transition: 'all 0.3s ease', opacity: loading ? 0.7 : 1
                    }}
                        onMouseOver={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 28px rgba(239, 68, 68, 0.4)'; } }}
                        onMouseOut={e => { e.target.style.transform = ''; e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.3)'; }}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#92400e' }}>
                    Chưa có tài khoản? <Link to="/register" style={{ color: '#dc2626', fontWeight: '700', textDecoration: 'none' }}>Đăng ký ngay</Link>
                </p>
            </div>

            {/* ===== MODAL 13: Quên mật khẩu ===== */}
            {showForgotModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                    <div className="glass-card" style={{
                        padding: '2rem', width: '420px', maxWidth: '90%', position: 'relative',
                        background: 'linear-gradient(135deg, #fffbeb 0%, #fef2f2 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.1)'
                    }}>
                        <button onClick={() => setShowForgotModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                            <X size={22} />
                        </button>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #fef3c7, #fee2e2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Mail size={28} color="#dc2626" />
                            </div>
                            <h3 style={{ fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '0.5rem', color: '#dc2626' }}>Quên mật khẩu?</h3>
                            <p style={{ color: '#92400e', fontSize: '0.9rem' }}>Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu ngay.</p>
                        </div>
                        {forgotMsg && (
                            <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: forgotMsg.startsWith('✅') ? '#ecfdf5' : '#fee2e2', color: forgotMsg.startsWith('✅') ? '#047857' : '#b91c1c', fontSize: '0.875rem', textAlign: 'center' }}>
                                {forgotMsg}
                            </div>
                        )}
                        <form onSubmit={handleForgotPassword}>
                            <div className="input-group">
                                <label style={{ color: '#9a3412' }}>Email đăng ký</label>
                                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="name@example.com" required style={{ borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(255,255,255,0.8)' }} />
                            </div>
                            <button type="submit" disabled={forgotLoading} style={{
                                width: '100%', marginTop: '0.5rem', padding: '0.85rem', borderRadius: '12px', border: 'none',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                                color: 'white', fontWeight: '700', fontSize: '1rem', cursor: forgotLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
                                opacity: forgotLoading ? 0.7 : 1
                            }}>
                                {forgotLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
