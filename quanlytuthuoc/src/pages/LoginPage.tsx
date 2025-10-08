// src/pages/LoginPage.tsx
import React, { useState } from 'react';
// Nếu dùng thư viện react-icons
import { FaUser, FaLock, FaFacebook, FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import CSS dành riêng cho Login (nếu có)
import '../styles/LoginPage.css'; 
import logo from '../components/Logo.png';

// Cast icons to ComponentType to fix TS2786 (after imports)
const FaUserIcon = FaUser as unknown as React.ComponentType<any>;
const FaLockIcon = FaLock as unknown as React.ComponentType<any>;
const FaFacebookIcon = FaFacebook as unknown as React.ComponentType<any>;
const FaGoogleIcon = FaGoogle as unknown as React.ComponentType<any>;

const LoginPage: React.FC = () => {
    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // *** ĐÃ THÊM TỪ KHÓA ASYNC ***
    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();
        
        if (!username || !password) {
            alert('Vui lòng nhập đầy đủ thông tin!');
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
            const message = await response.text(); 

            if (response.ok) { 
                // Xử lý thành công (hiện backend trả message, chưa có token JWT)
                // Không lưu message làm token; lưu một cờ đơn giản nếu cần
                // lưu username để lấy profile
                localStorage.setItem('isLoggedIn', 'true');
                login(username);
                alert(message || 'Đăng nhập thành công!');
                navigate('/'); 
            } else {
                // Xử lý lỗi từ API (ví dụ: "Mật khẩu không đúng!")
                alert(`Đăng nhập thất bại: ${message}`);
            }
        } catch (error) {
            console.error('Lỗi kết nối API:', error);
            alert('Lỗi kết nối! Vui lòng kiểm tra máy chủ Java đang chạy trên Port 8000.');
        }
    };

    // If already logged in, redirect to home
    React.useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
    }, [isLoggedIn, navigate]);


    return (
        // Thẻ bao ngoài cùng, tạo hiệu ứng nền '+' lớn
        <div className="login-background"> 
            {/* Box chứa form đăng nhập */}
            <div className="login-card"> 
                {/* Logo y tế (Sử dụng thẻ <img> hoặc SVG) */}
                <div className="logo-container">
                    {/* Thay bằng component Logo.png của bạn */}
                    <img src={logo} alt="Logo" className="app-logo" />
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

                {/* Hoặc đăng nhập với */}
                <p className="social-text">HOẶC ĐĂNG NHẬP VỚI</p>
                <div className="social-login">
                    {/* Các nút Social Login (Facebook, Google) */}
                     <button className="social-icon facebook-icon"><FaFacebookIcon /></button>
                    <button className="social-icon google-icon"><FaGoogleIcon /></button>
                </div>

                {/* Đăng ký */}
                <div className="register-link">
                    Chưa có tài khoản? <a href="/register">**Đăng kí tại đây**</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;