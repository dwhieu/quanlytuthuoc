// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
// Import các icon cần thiết
import { 
    FaUser, 
    FaLock, 
    FaEnvelope, 
    FaPhone, 
    FaCalendarAlt, 
    FaMapMarkerAlt,
    FaFacebook, 
    FaGoogle ,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Import CSS dùng chung cho cả Login và Register để giữ phong cách
import '../styles/LoginPage.css';
import logo from '../components/Logo.png';

// Cast icons to ComponentType to fix TS2786 (after imports)
const FaUserIcon = FaUser as unknown as React.ComponentType<any>;
const FaLockIcon = FaLock as unknown as React.ComponentType<any>;
const FaEnvelopeIcon = FaEnvelope as unknown as React.ComponentType<any>;
const FaPhoneIcon = FaPhone as unknown as React.ComponentType<any>;
const FaCalendarAltIcon = FaCalendarAlt as unknown as React.ComponentType<any>;
const FaMapMarkerAltIcon = FaMapMarkerAlt as unknown as React.ComponentType<any>;
const FaFacebookIcon = FaFacebook as unknown as React.ComponentType<any>;
const FaGoogleIcon = FaGoogle as unknown as React.ComponentType<any>;
const FaEyeIcon = FaEye as unknown as React.ComponentType<any>;
const FaEyeSlashIcon = FaEyeSlash as unknown as React.ComponentType<any>;

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    // State cho tất cả các trường thông tin
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState(''); // Date of Birth
    const [homeTown, setHomeTown] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    // *** ĐÃ THÊM TỪ KHÓA ASYNC ***
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Kiểm tra xác nhận mật khẩu
        if (password !== confirmPassword) {
            alert('Mật khẩu và xác nhận mật khẩu không khớp!');
            return;
        }

        // 2. Kiểm tra các trường bắt buộc
        if (!fullName || !dob || !homeTown || !phoneNumber || !email || !username || !password) {
            alert('Vui lòng điền đầy đủ tất cả các trường!');
            return;
        }

        const userData = {
            fullName,
            dob,
            homeTown,
            phoneNumber,
            email,
            username,
            password,
        };

        try {
            const response = await fetch('http://localhost:8000/api/auth/register', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // LƯU Ý: response.text() phải được await trước khi kiểm tra response.ok
            const message = await response.text(); 
            
            if (response.ok) { // Mã trạng thái HTTP 200-299
                alert(message); // Hiển thị thông báo "Đăng ký tài khoản thành công!"
                navigate('/login');
            } else {
                // Hiển thị lỗi từ Java Controller (ví dụ: "Tên đăng nhập đã tồn tại!")
                alert(`Đăng ký thất bại: ${message}`);
            }
        } catch (error) {
            console.error('Lỗi kết nối:', error);
            alert('Lỗi kết nối! Vui lòng kiểm tra máy chủ Java đang chạy trên Port 8000.');
        }
    };

    return (
        <div className="login-background"> {/* Dùng lại class CSS nền */}
            <div className="login-card"> {/* Dùng lại class CSS card */}
                <div className="logo-container">
                    <img src= {logo} alt="Logo" className="app-logo" />
                </div>
                
                <h2>Đăng Ký Tài Khoản Mới</h2>

                <form onSubmit={handleSubmit}>
                    {/* Họ và Tên */}
                    <div className="input-group">
                        <FaUserIcon className="input-icon" />
                        <input
                            type="text"
                            placeholder="Họ và Tên"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    {/* Ngày tháng năm sinh */}
                    <div className="input-group">
                        <FaCalendarAltIcon className="input-icon" />
                        <input
                            type="text"
                            placeholder="Ngày tháng năm sinh"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />
                    </div>

                    {/* Quê quán */}
                    <div className="input-group">
                        <FaMapMarkerAltIcon className="input-icon" />
                        <input
                            type="text"
                            placeholder="Quê quán"
                            value={homeTown}
                            onChange={(e) => setHomeTown(e.target.value)}
                        />
                    </div>

                    {/* Số điện thoại */}
                    <div className="input-group">
                        <FaPhoneIcon className="input-icon" />
                        <input
                            type="tel" // Sử dụng type="tel" cho số điện thoại
                            placeholder="Số điện thoại"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div className="input-group">
                        <FaEnvelopeIcon className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Tên đăng nhập */}
                    <div className="input-group">
                        <FaUserIcon className="input-icon" />
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    {/* Mật khẩu */}
                    <div className="input-group" style={{ position: 'relative' }}>
                        <FaLockIcon className="input-icon" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <span
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#888'
                            }}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlashIcon /> : <FaEyeIcon />}
                        </span>
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div className="input-group" style={{ position: 'relative' }}>
                        <FaLockIcon className="input-icon" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <span
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#888'
                            }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlashIcon /> : <FaEyeIcon />}
                        </span>
                    </div>

                    {/* Nút Đăng Ký */}
                    <button type="submit" className="login-button gradient-button">
                        Đăng Ký
                    </button>
                </form>

                <p className="social-text">HOẶC ĐĂNG KÝ VỚI</p>
                <div className="social-login">
                    <button className="social-icon facebook-icon"><FaFacebookIcon /></button>
                    <button className="social-icon google-icon"><FaGoogleIcon /></button>
                </div>

                <div className="register-link">
                    Đã có tài khoản? <a href="/login" onClick={() => navigate('/login')}>**Đăng nhập ngay**</a>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;