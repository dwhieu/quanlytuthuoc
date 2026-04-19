import React, { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css'; 

const FaUserIcon = FaUser as unknown as React.ComponentType<any>;
const FaLockIcon = FaLock as unknown as React.ComponentType<any>;

const LoginPage: React.FC = () => {
    const { login, loginWithToken } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();
        
        if (!username || !password) {
            showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
            return;
        }

        const loginData = { username, password }; 

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            // Java Controller trả về thông báo (text) hoặc mã lỗi
            const data = await response.json();

            if (response.ok) {
                if (data.username) {
                    const tok = data.token; 
                    const userRole = data.role || 'user';
                    
                    if (tok && loginWithToken) {
                        loginWithToken(tok, data.username, data.fullName, userRole);
                    } else {
                        await login(data.username, data.fullName, userRole);
                    }

                    // Luu avatar neu backend tra ve
                    if (data.avatar) { 
                        try { localStorage.setItem(`avatar:${data.username}`, data.avatar); } catch {} 
                        window.dispatchEvent(new Event('avatarChanged')); 
                    }
                    
                    showToast('Đăng nhập thành công!', 'success');
                    // Điều hướng dựa trên role
                    setTimeout(() => {
                        if (userRole === 'admin' || userRole === 'ADMIN') {
                            navigate('/dashboard');
                        } else {
                            navigate('/user-dashboard');
                        }
                    }, 1500);
                } else {
                    await login(username, undefined, 'user');
                    showToast(data || 'Đăng nhập thành công!', 'success');
                    setTimeout(() => navigate('/user-dashboard'), 1500);
                }
            } else {
                // Xử lý lỗi từ API
                showToast(`Đăng nhập thất bại: ${typeof data === 'string' ? data : 'Lỗi không xác định'}`, 'error');
            }
        } catch (error) {
            console.error('Lỗi kết nối API:', error);
            showToast('Lỗi kết nối! Vui lòng kiểm tra máy chủ Java đang chạy trên Port 8000.', 'error');
        }
    };

    return (
        // Thẻ bao ngoài cùng, tạo hiệu ứng nền '+' lớn
        <div className="login-background">
            {/* Toast Notification */}
            {toast && (
                <div className={`login-toast ${toast.type}`}>
                    {toast.message}
                </div>
            )} 
            {/* Box chứa form đăng nhập */}
            <div className="login-card"> 
                <div className="logo-container">
                    <img src="/logo192.png" alt="Logo" className="app-logo" />
                </div>
                
                <h2>Đăng Nhập</h2>

                <form onSubmit={handleSubmit}>
                    {/* Input Tên đăng nhập */}
                    <div className="input-group">
                        <FaUserIcon className="input-icon" /> {/* Icon người dùng */}
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    {/* Input Mật khẩu */}
                    <div className="input-group">
                        <FaLockIcon className="input-icon" /> {/* Icon ổ khóa */}
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Nút Đăng Nhập (Gradient) */}
                    <button type="submit" className="login-button gradient-button">
                        Đăng Nhập
                    </button>
                </form>

                {/* Forgot Password Link */}
                <div className="forgot-password-link">
                    <a href="/forgot-password">Quên mật khẩu?</a>
                </div>

                {/* Đăng ký */}
                <div className="register-link">
                    Chưa có tài khoản? <a href="/register">Đăng kí tại đây</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
