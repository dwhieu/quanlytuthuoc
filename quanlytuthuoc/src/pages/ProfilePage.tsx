import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
  id?: number;
  fullName?: string;
  dob?: string;
  homeTown?: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
}

const ProfilePage: React.FC = () => {
  const { username } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/auth/user/${encodeURIComponent(username)}`);
        if (!res.ok) {
          const txt = await res.text();
          setError(txt || 'Không thể tải thông tin người dùng');
          setProfile(null);
        } else {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        setError('Lỗi kết nối');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (!username) return <div className="p-4">Vui lòng đăng nhập để xem thông tin.</div>;

  return (
    <div className="p-4">
      <h3>Thông tin cá nhân</h3>
      {loading && <p>Đang tải...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {profile && (
        <div className="card p-3 mt-3">
          <p><b>Họ và tên:</b> {profile.fullName}</p>
          <p><b>Ngày sinh:</b> {profile.dob}</p>
          <p><b>Quê quán:</b> {profile.homeTown}</p>
          <p><b>Số điện thoại:</b> {profile.phoneNumber}</p>
          <p><b>Email:</b> {profile.email}</p>
          <p><b>Username:</b> {profile.username}</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
