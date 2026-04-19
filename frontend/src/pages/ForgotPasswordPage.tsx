import React, { useState } from 'react';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/ForgotPasswordPage.css';

const FaEnvelopeIcon = FaEnvelope as unknown as React.ComponentType<any>;
const FaArrowLeftIcon = FaArrowLeft as unknown as React.ComponentType<any>;

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'otp' | 'newPassword'>('email');
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Step 1: Request password reset
    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            showToast('Vui lòng nhập email!', 'error');
            return;
        }

        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Email không hợp lệ!', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                showToast('Mã OTP đã được gửi đến email của bạn!', 'success');
                setStep('otp');
            } else {
                const data = await response.text();
                showToast(data || 'Email không tồn tại trong hệ thống', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Lỗi kết nối! Vui lòng kiểm tra máy chủ.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const otpString = otp.join('');
        if (!otpString || otpString.length !== 6) {
            showToast('Vui lòng nhập đầy đủ 6 chữ số OTP!', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp: otpString }),
            });

            if (response.ok) {
                showToast('Mã OTP xác thực thành công!', 'success');
                setStep('newPassword');
            } else {
                const data = await response.text();
                showToast(data || 'Mã OTP không hợp lệ hoặc đã hết hạn', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Lỗi kết nối!', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP input change
    const handleOtpChange = (index: number, value: string) => {
        // Chỉ cho phép nhập số
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        // Tự động chuyển sang ô tiếp theo nếu nhập số
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
            nextInput?.focus();
        }
    };

    // Handle backspace
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement;
            prevInput?.focus();
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newPassword || !confirmPassword) {
            showToast('Vui lòng nhập đầy đủ mật khẩu!', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp!', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            if (response.ok) {
                showToast('Mật khẩu đã được đặt lại thành công!', 'success');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                const data = await response.text();
                showToast(data || 'Lỗi khi đặt lại mật khẩu', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Lỗi kết nối!', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="forgot-password-background">
            {/* Toast Notification */}
            {toast && (
                <div className={`forgot-password-toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            {/* Back to Login Button */}
            <button className="back-to-login-btn" onClick={handleBackToLogin} title="Quay lại đăng nhập">
                <FaArrowLeftIcon /> Quay lại
            </button>

            {/* Main Card */}
            <div className="forgot-password-card">
                {/* Logo */}
                <div className="logo-container">
                    <img src="/logo192.png" alt="PharmaCare Logo" className="app-logo" />
                </div>

                <h2>Quên Mật Khẩu</h2>

                {/* Step 1: Email Request */}
                {step === 'email' && (
                    <form onSubmit={handleRequestReset}>
                        <p className="step-description">Nhập email của bạn để nhận mã xác thực</p>
                        <div className="input-group">
                            <FaEnvelopeIcon className="input-icon" />
                            <input
                                type="email"
                                placeholder="Địa chỉ email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="forgot-password-button gradient-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <p className="step-description">Nhập mã OTP đã gửi đến email {email}</p>
                        <div className="otp-container">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-input-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    disabled={isLoading}
                                    className="otp-input-box"
                                    inputMode="numeric"
                                />
                            ))}
                        </div>
                        <button 
                            type="submit" 
                            className="forgot-password-button gradient-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xác thực...' : 'Xác thực OTP'}
                        </button>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => setStep('email')}
                            disabled={isLoading}
                        >
                            Nhập lại email
                        </button>
                    </form>
                )}

                {/* Step 3: Password Reset */}
                {step === 'newPassword' && (
                    <form onSubmit={handleResetPassword}>
                        <p className="step-description">Nhập mật khẩu mới</p>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Xác nhận mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="forgot-password-button gradient-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                        </button>
                    </form>
                )}

                {/* Login Link */}
                <div className="login-link">
                    Đã nhớ mật khẩu? <a href="/login">Đăng nhập tại đây</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
