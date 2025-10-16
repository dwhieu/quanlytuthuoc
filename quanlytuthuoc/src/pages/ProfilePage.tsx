import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/ProfilePage.css';

interface UserProfile {
  id?: number;
  fullName?: string;
  dob?: string;
  homeTown?: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
  authProvider?: string;
}

const ProfilePage: React.FC = () => {
  const { username } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  // change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const editMode = query.get('edit') === 'true';

  // form state for edit mode
  const [form, setForm] = useState<UserProfile>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
          // convert dob from ISO (yyyy-mm-dd) to dd/mm/yyyy for display
          if (data && data.dob) {
            const parts = data.dob.split('-');
            if (parts.length === 3) data.dob = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
          setProfile(data);
          // populate form when profile loads
          setForm(data || {});
        }
      } catch (e) {
        setError('Lỗi kết nối');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  // keep form in sync if profile changes externally
  useEffect(() => {
    setForm(profile || {});
  }, [profile]);

  // load avatar from localStorage and listen for changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem('avatar');
      setAvatarSrc(saved);
    } catch (e) {
      setAvatarSrc(null);
    }
    const onChange = () => {
      try {
        setAvatarSrc(localStorage.getItem('avatar'));
      } catch {
        setAvatarSrc(null);
      }
    };
    window.addEventListener('avatarChanged', onChange as EventListener);
    return () => window.removeEventListener('avatarChanged', onChange as EventListener);
  }, []);

  if (!username) return <div className="p-4">Vui lòng đăng nhập để xem thông tin.</div>;

  return (
    <div className="p-4">
      {/* Top area: avatar (left) and info (right) */}
      <div className="profile-top">
        <div className="avatar-column">
          <div className="avatar-box">
            <img src={avatarSrc ?? '/logo192.png'} alt="avatar" className="profile-avatar" />
          </div>
          <div className="avatar-buttons mt-2">
            <button className="btn btn-outline-secondary mb-2 w-100" onClick={() => setShowAvatarModal(true)}>Cập nhật ảnh đại diện</button>
            <button className="btn btn-outline-primary w-100" onClick={() => navigate('/profile?edit=true')}>Cập nhật hồ sơ</button>
            {/* only show change-password if user uses local auth */}
            {(!profile || !profile.authProvider || profile.authProvider === 'local') && (
              <button className="btn btn-outline-warning mt-2 w-100" onClick={() => {
                setShowChangePassword(!showChangePassword);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}>{showChangePassword ? 'Đóng' : 'Đổi mật khẩu'}</button>
            )}
          </div>
        </div>

        <div className="info-column">
          <h3>Thông tin cá nhân</h3>
          {loading && <p>Đang tải...</p>}
          {error && <div className="alert alert-danger">{error}</div>}

          {editMode ? (
            <div className="card p-3 mt-2">
              {saveError && <div className="alert alert-danger">{saveError}</div>}
              <div className="mb-2">
                <label className="form-label">Họ và tên</label>
                <input className="form-control" value={form.fullName ?? ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Ngày sinh (dd/mm/yyyy)</label>
                <input type="text" placeholder="dd/mm/yyyy" className="form-control" value={form.dob ?? ''} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Quê quán</label>
                <input className="form-control" value={form.homeTown ?? ''} onChange={(e) => setForm({ ...form, homeTown: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Số điện thoại</label>
                <input className="form-control" value={form.phoneNumber ?? ''} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-primary" disabled={saving} onClick={async () => {
                  setSaveError(null);
                  // basic validation
                  if (!form.fullName || !form.email) { setSaveError('Họ và tên và email là bắt buộc'); return; }

                  // validate dob format (allow empty)
                  if (form.dob) {
                    const dobStr = String(form.dob).trim();
                    const dobMatch = dobStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                    if (!dobMatch) { setSaveError('Ngày sinh phải ở định dạng dd/mm/yyyy'); return; }
                    // quick logical check
                    const d = Number(dobMatch[1]), m = Number(dobMatch[2]), y = Number(dobMatch[3]);
                    const dt = new Date(y, m - 1, d);
                    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) { setSaveError('Ngày sinh không hợp lệ'); return; }
                  }

                  setSaving(true);
                  try {
                    // convert dob from dd/mm/yyyy to yyyy-mm-dd for backend
                    const payload = { ...form } as any;
                    if (payload.dob && /\d{2}\/\d{2}\/\d{4}/.test(payload.dob)) {
                      const [d, m, y] = (payload.dob as string).split('/');
                      payload.dob = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                    }

                    const headers: any = { 'Content-Type': 'application/json' };

                    console.log('Profile PUT payload:', payload);

                    const res = await fetch(`http://localhost:8000/api/auth/user/${encodeURIComponent(username || '')}`, {
                      method: 'PUT',
                      headers,
                      body: JSON.stringify(payload),
                    });

                    const text = await res.text();
                    let body: any = text;
                    try { body = JSON.parse(text); } catch {}
                    console.log('Profile PUT response', res.status, body);

                    if (!res.ok) {
                      // try to find a useful message
                      const msg = (body && (body.message || body.error || (Array.isArray(body) ? body.join('; ') : null))) || text || res.statusText;
                      setSaveError(msg || `Lỗi khi lưu (${res.status})`);
                    } else {
                      // refresh profile (backend should return updated object)
                      const updated = body;
                      // convert dob to dd/mm/yyyy for UI
                      if (updated && updated.dob && typeof updated.dob === 'string') {
                        const parts = updated.dob.split('-');
                        if (parts.length === 3) updated.dob = `${parts[2]}/${parts[1]}/${parts[0]}`;
                      }
                      setProfile(updated);
                      // leave edit mode by navigating back to /profile
                      navigate('/profile');
                    }
                  } catch (e: any) {
                    console.error('Save profile error', e);
                    setSaveError(e?.message ? `Lỗi kết nối: ${e.message}` : 'Lỗi kết nối khi lưu');
                  } finally { setSaving(false); }
                }}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/profile')}>Hủy</button>
              </div>
            </div>
          ) : (
            profile && (
              <div className="card p-3 mt-2">
                <p><b>Họ và tên:</b> {profile.fullName}</p>
                <p><b>Ngày sinh:</b> {profile.dob}</p>
                <p><b>Quê quán:</b> {profile.homeTown}</p>
                <p><b>Số điện thoại:</b> {profile.phoneNumber}</p>
                <p><b>Email:</b> {profile.email}</p>
                <p><b>Username:</b> {profile.username}</p>
                
              </div>
            )
          )}
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="avatar-modal-overlay">
          <div className="avatar-modal">
            <button className="close-btn" onClick={() => { setShowAvatarModal(false); }}>✕</button>
            <h5>Cập nhật ảnh nhận diện khuôn mặt</h5>
            <p className="muted">Cập nhật ảnh nhận diện khuôn mặt</p>
            <div className="avatar-conditions">
              <b>Điều kiện với ảnh:</b>
              <ol>
                <li>Ánh sáng: Ánh sáng đồng đều, không quá sáng hoặc quá tối.</li>
                <li>Tư thế khuôn mặt: Nhìn thẳng vào camera, giữ đầu thẳng.</li>
                <li>Khoảng cách: 40-80cm, khuôn mặt chiếm 70-80% khung hình.</li>
                <li>Yêu cầu: Không đeo khẩu trang, kính tối màu.</li>
                <li>Chất lượng: Độ phân giải tối thiểu 640x480, JPG/JPEG.</li>
              </ol>
            </div>

            <div className="avatar-controls">
              <div className="upload-actions">
                <button className="btn btn-light" onClick={() => fileRef.current?.click()}>Tải ảnh lên</button>
              </div>

              <div className="preview-column">
                <div className="avatar-preview-area">
                  {!avatarPreview && (
                    <div className="avatar-dropzone">Thêm ảnh đại diện</div>
                  )}
                  {avatarPreview && (
                    <img src={avatarPreview} alt="preview" className="avatar-preview" />
                  )}
                </div>

                <div className="modal-actions mt-3">
                  <button className="btn btn-danger" onClick={() => {
                    if (avatarPreview) {
                      try { localStorage.setItem('avatar', avatarPreview); } catch {}
                      window.dispatchEvent(new Event('avatarChanged'));
                    }
                    setShowAvatarModal(false);
                  }}>Lưu lại</button>
                  <button className="btn btn-outline-secondary" onClick={() => {
                    setShowAvatarModal(false);
                    setAvatarPreview(null);
                  }}>Hủy</button>
                </div>
              </div>
            </div>

            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const r = new FileReader(); r.onload = () => setAvatarPreview(r.result as string); r.readAsDataURL(f);
            }} />
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card p-3" style={{ width: 420, maxWidth: '90%' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="m-0">Đổi mật khẩu</h5>
              <button className="btn btn-sm btn-light" onClick={() => { setShowChangePassword(false); setPasswordError(null); setPasswordSuccess(null); }}>✕</button>
            </div>
            {passwordError && <div className="alert alert-danger">{passwordError}</div>}
            {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
            <div className="mb-2">
              <label className="form-label">Mật khẩu hiện tại</label>
              <input type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="form-label">Mật khẩu mới</label>
              <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-primary" disabled={passwordSaving} onClick={async () => {
                setPasswordError(null); setPasswordSuccess(null);
                if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError('Vui lòng điền tất cả các trường'); return; }
                if (newPassword !== confirmPassword) { setPasswordError('Mật khẩu mới và xác nhận không khớp'); return; }
                if (newPassword.length < 6) { setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự'); return; }
                setPasswordSaving(true);
                try {
                  const payload = { currentPassword, newPassword };
                  const res = await fetch(`http://localhost:8000/api/auth/user/${encodeURIComponent(username || '')}/password`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                  });
                  const text = await res.text();
                  if (!res.ok) {
                    setPasswordError(text || `Lỗi: ${res.status}`);
                  } else {
                    setPasswordSuccess('Đổi mật khẩu thành công');
                    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                    // keep modal open briefly so user sees success, then close
                    setTimeout(() => { setShowChangePassword(false); setPasswordSuccess(null); }, 900);
                  }
                } catch (e: any) {
                  setPasswordError('Lỗi kết nối');
                } finally { setPasswordSaving(false); }
              }}>{passwordSaving ? 'Đang...' : 'Lưu mật khẩu'}</button>
              <button className="btn btn-outline-secondary" onClick={() => { setShowChangePassword(false); setPasswordError(null); setPasswordSuccess(null); }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      {/* Note: profile info is shown inside the top-right column */}
    </div>
  );
};

export default ProfilePage;
