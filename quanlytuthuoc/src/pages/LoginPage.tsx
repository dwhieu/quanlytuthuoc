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

    const FACEBOOK_APP_ID = '772096055995000';

        // Social login handler: redirect to backend OAuth endpoints.
        // Adjust the base URL if your backend exposes different paths.
        const handleSocialLogin = async (provider: 'google' | 'facebook') => {
            const frontendBase = window.location.origin;
            if (provider === 'google') {
                // Nếu provider là google, xây dựng URL Google OIDC trực tiếp (luồng client-side sử dụng id_token)
                const GOOGLE_CLIENT_ID = '723305304425-0hjernqciq63ibj3ga0vctn7tuaulhgq.apps.googleusercontent.com';
                const redirectUri = `${frontendBase}/oauth/callback`;

                const params = new URLSearchParams({
                    client_id: GOOGLE_CLIENT_ID,
                    redirect_uri: redirectUri,
                    response_type: 'id_token', // yêu cầu một ID token (OIDC)
                    scope: 'openid email profile',
                    nonce: Math.random().toString(36).substring(2),
                    prompt: 'select_account',
                });
                const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

                // Mở trong một cửa sổ popup để người dùng có thể quay lại ứng dụng dễ dàng.
                const width = 600;
                const height = 700;
                const left = window.screenX + (window.innerWidth - width) / 2;
                const top = window.screenY + (window.innerHeight - height) / 2;
                const popup = window.open(
                    url,
                    `oauth-${provider}`,
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                // Lắng nghe thông điệp từ popup cho biết thành công
                const messageHandler = (e: MessageEvent) => {
                    // đảm bảo cùng một nguồn gốc
                    if (e.origin !== window.location.origin) return;
                        // handle Google popup: receive idToken and call backend from main window
                        if (e.data && e.data.idToken) {
                            (async () => {
                                try {
                                    const backend = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                                    const resp = await fetch(`${backend}/api/auth/oauth/google`, {
                                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: e.data.idToken })
                                    });
                                    const text = await resp.text();
                                    if (!resp.ok) { alert('Đăng nhập Google thất bại: ' + text); return; }
                                    let data;
                                    try { data = JSON.parse(text); } catch { data = {}; }
                                    if (data.token) try { localStorage.setItem('token', data.token); } catch {}
                                    try { localStorage.setItem('isLoggedIn', 'true'); } catch {}
                                    if (data.username) login(data.username);
                                    if (data.avatar) { try { localStorage.setItem('avatar', data.avatar); } catch {} window.dispatchEvent(new Event('avatarChanged')); }
                                    window.removeEventListener('message', messageHandler);
                                    try { popup?.close(); } catch {}
                                    navigate('/');
                                } catch (err) { alert('Lỗi kết nối Google OAuth: ' + err); }
                            })();
                            return;
                        }
                        if (e.data && e.data.oauthSuccess) {
                            // tùy chọn sử dụng tên người dùng
                            const username = e.data.username as string | undefined;
                            try { localStorage.setItem('isLoggedIn', 'true'); } catch {}
                            if (username) login(username);
                            window.removeEventListener('message', messageHandler);
                            // Đóng popup nếu vẫn còn mở
                            try { popup?.close(); } catch {}
                            // Điều hướng đến bảng điều khiển
                            navigate('/');
                        }
                };

                window.addEventListener('message', messageHandler);

                // Nếu popup bị chặn hoặc không mở được, quay lại chuyển hướng đầy đủ
                if (!popup) {
                    window.location.href = url;
                }
            } else if (provider === 'facebook') {
                // Luồng Facebook OAuth 2.0
                const redirectUri = `${frontendBase}/oauth/facebook-callback`;
                const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email,public_profile`;
                // Mở đăng nhập Facebook trong popup
                const width = 600;
                const height = 700;
                const left = window.screenX + (window.innerWidth - width) / 2;
                const top = window.screenY + (window.innerHeight - height) / 2;
                const popup = window.open(
                    fbAuthUrl,
                    'facebook-oauth',
                    `width=${width},height=${height},left=${left},top=${top}`
                );
                // Lắng nghe thông điệp từ popup
                const messageHandler = async (e: MessageEvent) => {
                    if (e.origin !== frontendBase) return;
                    if (e.data && e.data.facebookAccessToken) {
                        // Gửi mã thông báo truy cập đến backend
                        try {
                            const resp = await fetch('http://localhost:8000/api/auth/oauth/facebook', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ accessToken: e.data.facebookAccessToken })
                            });
                            const text = await resp.text();
                            if (resp.ok) {
                                let data;
                                try { data = JSON.parse(text); } catch { data = {}; }
                                if (data.token) try { localStorage.setItem('token', data.token); } catch {}
                                try { localStorage.setItem('isLoggedIn', 'true'); } catch {}
                                if (data.username) login(data.username);
                                if (data.avatar) {
                                    try { localStorage.setItem('avatar', data.avatar); } catch {}
                                    window.dispatchEvent(new Event('avatarChanged'));
                                }
                                window.removeEventListener('message', messageHandler);
                                popup?.close();
                                navigate('/');
                            } else {
                                alert('Đăng nhập Facebook thất bại: ' + text);
                            }
                        } catch (err) {
                            alert('Lỗi kết nối Facebook: ' + err);
                        }
                    }
                };
                window.addEventListener('message', messageHandler);
            }
        };

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
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            className="social-icon facebook-icon"
                            aria-label="Đăng nhập bằng Facebook"
                        >
                            <FaFacebookIcon />
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="social-icon google-icon"
                            aria-label="Đăng nhập bằng Google"
                        >
                            <FaGoogleIcon />
                        </button>
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