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
            <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '480px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--primary)' }}>Chào mừng trở lại!</h2>
                <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                    Đăng nhập để tiếp tục hành trình học tiếng Anh của bạn.
                </p>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: 'var(--error)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                    </div>

                    {/* Link mở Modal 13 */}
                    <div style={{ textAlign: 'right', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                        <button type="button" onClick={() => { setShowForgotModal(true); setForgotMsg(''); setForgotEmail(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>
                            Quên mật khẩu?
                        </button>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Đăng ký ngay</Link>
                </p>
            </div >

            {/* ===== MODAL 13: Quên mật khẩu ===== */}
            {showForgotModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                    <div className="glass-card" style={{ padding: '2rem', width: '420px', maxWidth: '90%', position: 'relative' }}>
                        <button onClick={() => setShowForgotModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                            <X size={22} />
                        </button>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '60px', height: '60px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Mail size={28} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Quên mật khẩu?</h3>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu ngay.</p>
                        </div>
                        {forgotMsg && (
                            <div style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: forgotMsg.startsWith('✅') ? '#ecfdf5' : '#fee2e2', color: forgotMsg.startsWith('✅') ? '#047857' : '#b91c1c', fontSize: '0.875rem', textAlign: 'center' }}>
                                {forgotMsg}
                            </div>
                        )}
                        <form onSubmit={handleForgotPassword}>
                            <div className="input-group">
                                <label>Email đăng ký</label>
                                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="name@example.com" required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={forgotLoading}>
                                {forgotLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Login;
