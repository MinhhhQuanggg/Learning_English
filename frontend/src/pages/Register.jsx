import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        passwordConfirm: '',
        phone: '',
        level: 'Thấp'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.passwordConfirm) {
            return setError('Mật khẩu xác nhận không khớp');
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register', formData);
            setSuccess(response.data.message);
            // Sau 1.5 giây, chuyển sang trang xác thực OTP kèm theo email
            setTimeout(() => {
                navigate('/verify-otp', { state: { email: formData.email } });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex justify-center items-center" style={{ padding: '2rem 0' }}>
            <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '550px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--primary)' }}>Tạo tài khoản mới</h2>
                <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                    Bắt đầu hành trình chinh phục tiếng Anh cùng dự án của chúng ta.
                </p>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: 'var(--error)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        backgroundColor: '#ecfdf5', color: 'var(--success)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center'
                    }}>
                        {success}
                    </div >
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="fullName">Họ và tên</label>
                        <input type="text" id="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" required />
                    </div>
                    <div className="flex" style={{ gap: '1rem' }}>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label htmlFor="phone">Số điện thoại</label>
                            <input type="text" id="phone" value={formData.phone} onChange={handleChange} placeholder="09xxxxxxx" required />
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label htmlFor="level">Trình độ mục tiêu</label>
                            <select id="level" value={formData.level} onChange={handleChange}>
                                <option value="Thấp">Mới bắt đầu</option>
                                <option value="Trung">Trung cấp</option>
                                <option value="Cao">Nâng cao</option>
                            </select>
                        </div>
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                    </div>
                    <div className="input-group">
                        <label htmlFor="passwordConfirm">Xác nhận mật khẩu</label>
                        <div className="password-wrapper">
                            <input
                                type={showPasswordConfirm ? 'text' : 'password'}
                                id="passwordConfirm"
                                value={formData.passwordConfirm}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                            <span className="eye-icon" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                                {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Đăng nhập</Link>
                </p>
            </div >
        </div >
    );
};

export default Register;
