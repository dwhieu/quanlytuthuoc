import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This page will be used as a lightweight handler when using Google Identity Services
// It expects the parent window (popup) to call `window.opener.postMessage({ idToken }, origin)`
// after sign-in. The popup should then close itself.

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithToken } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        // If this window was opened as a popup by the app, Google will redirect here with an
        // id_token in the URL fragment (e.g. #id_token=...&scope=...)
        const hash = window.location.hash || '';
        const params = new URLSearchParams(hash.replace(/^#/, ''));
        const idToken = params.get('id_token');
        if (!idToken) {
          // Nothing to do; wait for manual postMessage fallback
          return;
        }

        // Post the idToken back to the opener (main app) so it can call backend.
        if (window.opener) {
          window.opener.postMessage({ idToken }, window.location.origin);
          window.close();
          return;
        }

        // Fallback: if no opener (user opened callback directly), call backend here
        const backend = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const resp = await fetch(`${backend}/api/auth/oauth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        const text = await resp.text();
        if (!resp.ok) throw new Error(text || 'OAuth failed');
        let data;
        try { data = JSON.parse(text); } catch { data = { token: null, username: text }; }
        if (data.token) {
          try { localStorage.setItem('token', data.token); } catch {}
          try { localStorage.setItem('isLoggedIn', 'true'); } catch {}
          if (data.avatar) try { localStorage.setItem('avatar', data.avatar); window.dispatchEvent(new Event('avatarChanged')); } catch {}
          if (loginWithToken) loginWithToken(data.token, data.username); else if (data.username) login(data.username);
        }
        navigate('/');
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        const msg = err && err.message ? err.message : String(err);
        alert('Lỗi khi xử lý OAuth callback: ' + msg + '\nKiểm tra console (F12) để biết thêm chi tiết.');
      }
    })();
  }, [login, navigate]);

  return (
    <div style={{ padding: 24 }}>
      <h3>Đang xử lý đăng nhập...</h3>
      <p>Vui lòng chờ, hoặc đóng cửa sổ nếu bạn được chuyển hướng tự động.</p>
    </div>
  );
};

export default OAuthCallback;
