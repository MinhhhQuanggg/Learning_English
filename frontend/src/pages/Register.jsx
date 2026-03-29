import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, X, ShieldCheck, FileText } from 'lucide-react';
import api from '../api/axios';

const TERMS_CONTENT = `Điều khoản sử dụng dịch vụ học tiếng Anh trực tuyến

1. Chấp nhận điều khoản
Khi sử dụng nền tảng này, bạn đồng ý tuân thủ các điều khoản được nêu dưới đây. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.

2. Tài khoản người dùng
Bạn có trách nhiệm bảo mật thông tin đăng nhập. Mọi hành động thực hiện dưới tài khoản của bạn đều thuộc trách nhiệm của bạn.

3. Sử dụng đúng mục đích
Dịch vụ chỉ được sử dụng cho mục đích học tập cá nhân. Nghiêm cấm mọi hành động sao chép, chia sẻ hay phân phối nội dung học tập mà không có sự cho phép.

4. Quyền riêng tư
Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo chính sách bảo mật của nền tảng.

5. Nội dung hệ thống
Tất cả nội dung bài học, câu hỏi, và tài liệu trên hệ thống thuộc quyền sở hữu của nền tảng. Người dùng không có quyền thương mại hoá các nội dung này.

6. Chấm dứt dịch vụ
Chúng tôi có quyền tạm khóa hoặc xóa tài khoản nếu phát hiện vi phạm các điều khoản trên.`;

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
    const [agreedTerms, setAgreedTerms] = useState(false);
    const navigate = useNavigate();

    // Modal 14: OTP
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval;
        if (showOtpModal && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (showOtpModal && timer <= 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [showOtpModal, timer]);

    const handleResendOtp = async () => {
        if (!canResend) return;
        setOtpError('');
        setOtpSuccess('');
        setOtpLoading(true);
        try {
            await api.post('/auth/resend-otp', { email: registeredEmail });
            setOtpSuccess('Mã OTP mới đã được gửi vào email!');
            setTimer(60);
            setCanResend(false);
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Không thể gửi lại mã. Vui lòng thử lại sau.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Modal 15: Terms
    const [showTermsModal, setShowTermsModal] = useState(false);

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

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(formData.password)) {
            return setError('Mật khẩu phải có ít nhất 6 ký tự, bao gồm cả chữ và số');
        }

        if (!agreedTerms) {
            return setError('Bạn phải đồng ý với Điều khoản sử dụng để tiếp tục.');
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register', formData);
            setSuccess(response.data.message);
            setRegisteredEmail(formData.email);
            // Mở Modal OTP (14) thay vì chuyển trang
            setTimeout(() => {
                setShowOtpModal(true);
                setTimer(60);
                setCanResend(false);
                setOtpSuccess('');
                setOtpError('');
            }, 800);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        setOtpError('');
        setOtpSuccess('');
        try {
            await api.post('/auth/verify-email', { email: registeredEmail, code: otpCode });
            setShowOtpModal(false);
            navigate('/login');
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Mã OTP không hợp lệ. Vui lòng thử lại.');
        } finally {
            setOtpLoading(false);
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
                    <div style={{ backgroundColor: '#ecfdf5', color: 'var(--success)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
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
                            <input type={showPassword ? 'text' : 'password'} id="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                    </div>
                    <div className="input-group">
                        <label htmlFor="passwordConfirm">Xác nhận mật khẩu</label>
                        <div className="password-wrapper">
                            <input type={showPasswordConfirm ? 'text' : 'password'} id="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} placeholder="••••••••" required />
                            <span className="eye-icon" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                                {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                    </div>

                    {/* Checkbox Điều khoản - mở Modal 15 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <input type="checkbox" id="terms" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                        <label htmlFor="terms" style={{ fontSize: '0.875rem', color: 'var(--gray-500)', cursor: 'pointer', userSelect: 'none' }}>
                            Tôi đồng ý với{' '}
                            <button type="button" onClick={() => setShowTermsModal(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}>
                                Điều khoản sử dụng
                            </button>
                        </label>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    Đã có tài khoản? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Đăng nhập</Link>
                </p>
            </div >

            {/* ===== MODAL 14: Xác thực OTP ===== */}
            {showOtpModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', padding: '2.5rem', width: '420px', maxWidth: '92%', textAlign: 'center', position: 'relative', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ width: '70px', height: '70px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <ShieldCheck size={36} color="#3b82f6" />
                        </div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.4rem', marginBottom: '0.5rem', color: '#111827' }}>Xác thực tài khoản</h3>
                        <p style={{ color: '#4b5563', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Mã OTP đã được gửi tới <strong style={{ color: '#111827' }}>{registeredEmail}</strong>.<br />Vui lòng kiểm tra email và nhập mã bên dưới.
                        </p>
                        {otpError && (
                            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.6rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                {otpError}
                            </div>
                        )}
                        {otpSuccess && (
                            <div style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '0.6rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                {otpSuccess}
                            </div>
                        )}
                        <form onSubmit={handleVerifyOtp}>
                            <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                placeholder="Nhập mã OTP 6 chữ số"
                                required
                                style={{ width: '100%', padding: '1rem', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', borderRadius: '12px', border: '2px solid #d1d5db', marginBottom: '1.25rem', outline: 'none', boxSizing: 'border-box', color: '#111827', backgroundColor: '#f9fafb' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: '600', backgroundColor: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }} disabled={otpLoading}>
                                {otpLoading ? 'Đang xác thực...' : 'Xác nhận OTP'}
                            </button>
                        </form>
                        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
                            {canResend ? (
                                <>
                                    Không nhận được mã?{' '}
                                    <span
                                        style={{ color: '#3b82f6', fontWeight: '600', cursor: 'pointer' }}
                                        onClick={handleResendOtp}
                                    >
                                        Gửi lại mã
                                    </span>
                                </>
                            ) : (
                                <>
                                    Gửi lại mã sau: <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                                        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* ===== MODAL 15: Điều khoản sử dụng ===== */}
            {showTermsModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '600px', maxWidth: '92%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <FileText size={24} color="var(--primary)" />
                                <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', margin: 0 }}>Điều khoản sử dụng</h3>
                            </div>
                            <button onClick={() => setShowTermsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                                <X size={22} />
                            </button>
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1, whiteSpace: 'pre-line', color: '#374151', lineHeight: 1.8, fontSize: '0.95rem', paddingRight: '0.5rem' }}>
                            {TERMS_CONTENT}
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setAgreedTerms(false); setShowTermsModal(false); }} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}>
                                Từ chối
                            </button>
                            <button onClick={() => { setAgreedTerms(true); setShowTermsModal(false); }} className="btn btn-primary" style={{ flex: 1 }}>
                                Tôi đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Register;
