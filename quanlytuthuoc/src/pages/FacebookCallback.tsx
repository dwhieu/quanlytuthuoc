import React, { useEffect } from 'react';

const FacebookCallback: React.FC = () => {
  useEffect(() => {
    // Facebook returns access_token in URL hash
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken = params.get('access_token');
    if (accessToken && window.opener) {
      window.opener.postMessage({ facebookAccessToken: accessToken }, window.location.origin);
      window.close();
    }
  }, []);
  return (
    <div style={{ padding: 24 }}>
      <h3>Đang xử lý đăng nhập Facebook...</h3>
      <p>Nếu không được chuyển hướng tự động, hãy đóng cửa sổ này.</p>
    </div>
  );
};
export default FacebookCallback;
