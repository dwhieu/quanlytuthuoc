import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaUser, FaPills } from 'react-icons/fa';
import { ListGroup } from 'react-bootstrap';
import TopBar from '../components/TopBar';
import '../styles/UserDashboard.css';

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

// Cast icons
const FaHomeIcon = FaHome as unknown as React.ComponentType<any>;
const FaUserIcon = FaUser as unknown as React.ComponentType<any>;
const FaPillsIcon = FaPills as unknown as React.ComponentType<any>;

const UserDashboard: React.FC = () => {
  const { fullName, username } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = React.useState<string>('home');
  const fileRef = useRef<HTMLInputElement | null>(null);
  
  // Profile state
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = React.useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [form, setForm] = React.useState<UserProfile>({});
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // Sample drug data
  const sampleDrugs = [
    { id: 1, name: 'Paracetamol', type: 'Hạ sốt, giảm đau', quantity: 20, expiry: '12/2025' },
    { id: 2, name: 'Amoxicillin', type: 'Kháng sinh', quantity: 10, expiry: '06/2026' },
    { id: 3, name: 'Ibuprofen', type: 'Giảm đau, hạ sốt', quantity: 15, expiry: '09/2025' },
    { id: 4, name: 'Aspirin', type: 'Hạ sốt, làm loãng máu', quantity: 30, expiry: '03/2026' },
    { id: 5, name: 'Omeprazole', type: 'Chống loét dạ dày', quantity: 25, expiry: '11/2025' },
  ];

  // Fetch profile data
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
          if (data && data.dob) {
            const parts = data.dob.split('-');
            if (parts.length === 3) data.dob = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
          setProfile(data);
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

  // Keep form in sync
  useEffect(() => {
    setForm(profile || {});
  }, [profile]);

  // Load avatar
  useEffect(() => {
    try {
      const key = username ? `avatar:${username}` : 'avatar';
      const saved = localStorage.getItem(key) || localStorage.getItem('avatar');
      setAvatarSrc(saved);
    } catch (e) {
      setAvatarSrc(null);
    }
    const onChange = () => {
      try {
        const key = username ? `avatar:${username}` : 'avatar';
        setAvatarSrc(localStorage.getItem(key) || localStorage.getItem('avatar'));
      } catch {
        setAvatarSrc(null);
      }
    };
    window.addEventListener('avatarChanged', onChange as EventListener);
    return () => window.removeEventListener('avatarChanged', onChange as EventListener);
  }, [username]);

  const menuItems = [
    { icon: <FaHomeIcon />, text: "Trang chủ", to: "/user-dashboard", id: "home" },
    { icon: <FaUserIcon />, text: "Thông tin cá nhân", to: "/user-profile", id: "profile" },
    { icon: <FaPillsIcon />, text: "Quản lí thuốc", to: "/user-drugs", id: "drugs" },
  ];

  React.useEffect(() => {
    // Determine active menu based on current route
    if (location.pathname === "/user-dashboard") setActiveMenu("home");
    else if (location.pathname === "/user-profile") setActiveMenu("profile");
    else if (location.pathname === "/user-drugs") setActiveMenu("drugs");
  }, [location.pathname]);

  // Custom Sidebar for Users
  const UserSidebar = () => (
    <div className="bg-primary text-white vh-100 p-3 sidebar">
      <h5 className="mb-4 text-center fw-bold">PharmaCare</h5>
      <ListGroup variant="flush">
        {menuItems.map((item, i) => {
          const isActive = activeMenu === item.id;
          return (
            <motion.div
              key={i}
              whileHover={{
                scale: 1.05,
                backgroundColor: isActive ? "" : "#0b5ed7",
              }}
              transition={{ type: "spring", stiffness: 250 }}
              style={{
                backgroundColor: isActive ? "#0b5ed7" : "transparent",
                borderRadius: "5px",
              }}
            >
              <ListGroup.Item
                action
                onClick={() => {
                  setActiveMenu(item.id);
                  navigate(item.to);
                }}
                className="bg-transparent text-white border-0 d-flex align-items-center py-2"
              >
                <span className="me-2 sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.text}</span>
              </ListGroup.Item>
            </motion.div>
          );
        })}
      </ListGroup>
    </div>
  );

  return (
    <div className="app-layout d-flex">
      <aside className="app-sidebar">
        <UserSidebar />
      </aside>
      <main className="app-main flex-grow-1">
        <TopBar />
        <div className="user-content-wrapper">
          {activeMenu === "home" && (
            <motion.div
              className="user-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Welcome Banner */}
              <div className="welcome-banner">
                <motion.div
                  className="banner-content"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2>Xin chào, {fullName || username}! 👋</h2>
                  <p>Mừng quay trở lại với PharmaCare</p>
                </motion.div>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <motion.div
                  className="stat-card gradient-blue"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon">📋</div>
                  <div className="stat-content">
                    <h6 className="stat-label">Đơn thuốc</h6>
                    <p className="stat-value">12</p>
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card gradient-green"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon">❤️</div>
                  <div className="stat-content">
                    <h6 className="stat-label">Sức khỏe</h6>
                    <p className="stat-value">Tốt</p>
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card gradient-purple"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon">💊</div>
                  <div className="stat-content">
                    <h6 className="stat-label">Thuốc hiện tại</h6>
                    <p className="stat-value">5 loại</p>
                  </div>
                </motion.div>

                <motion.div
                  className="stat-card gradient-orange"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <h6 className="stat-label">Đánh giá</h6>
                    <p className="stat-value">4.8/5</p>
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-section">
                <h5 className="section-title">Hành động nhanh</h5>
                <div className="quick-actions">
                  <motion.button
                    className="action-btn action-btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="action-icon">📋</span>
                    <span className="action-text">Xem đơn thuốc</span>
                  </motion.button>
                  <motion.button
                    className="action-btn action-btn-secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="action-icon">🔔</span>
                    <span className="action-text">Nhắc nhở uống thuốc</span>
                  </motion.button>
                  <motion.button
                    className="action-btn action-btn-tertiary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="action-icon">📞</span>
                    <span className="action-text">Liên hệ hỗ trợ</span>
                  </motion.button>
                </div>
              </div>

              {/* Information Cards */}
              <div className="info-cards-section">
                <div className="row">
                  <div className="col-lg-6 mb-4">
                    <motion.div
                      className="info-card"
                      whileHover={{ boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)" }}
                    >
                      <div className="card-icon">📍</div>
                      <h6 className="card-title">Địa chỉ nhà thuốc gần nhất</h6>
                      <p className="card-text">Quận 1, TP. Hồ Chí Minh</p>
                      <small className="text-muted">Cách bạn 1.2 km</small>
                    </motion.div>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <motion.div
                      className="info-card"
                      whileHover={{ boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)" }}
                    >
                      <div className="card-icon">☎️</div>
                      <h6 className="card-title">Hotline liên hệ 24/7</h6>
                      <p className="card-text">0123 456 789</p>
                      <small className="text-muted">Hỗ trợ miễn phí</small>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeMenu === "profile" && (
            <motion.div
              className="user-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Top area: avatar (left) and info (right) */}
              <div className="profile-top">
                <div className="avatar-column">
                  <div className="avatar-box">
                    <img src={avatarSrc ?? '/logo192.png'} alt="avatar" className="profile-avatar" />
                  </div>
                  <div className="avatar-buttons mt-2">
                    <button className="btn btn-outline-secondary mb-2 w-100" onClick={() => setShowAvatarModal(true)}>Cập nhật ảnh đại diện</button>
                    <button className="btn btn-outline-primary w-100" onClick={() => setActiveMenu('profile-edit')}>Cập nhật hồ sơ</button>
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

                  {profile && (
                    <div className="card p-3 mt-2">
                      <p><b>Họ và tên:</b> {profile.fullName}</p>
                      <p><b>Ngày sinh:</b> {profile.dob}</p>
                      <p><b>Quê quán:</b> {profile.homeTown}</p>
                      <p><b>Số điện thoại:</b> {profile.phoneNumber}</p>
                      <p><b>Email:</b> {profile.email}</p>
                      <p><b>Username:</b> {profile.username}</p>
                      <p><b>Chức vụ: </b>Người dùng</p>
                    </div>
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
                              try { const key = username ? `avatar:${username}` : 'avatar'; localStorage.setItem(key, avatarPreview); } catch {}
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
                    <div className="mb-3">
                      <label className="form-label">Mật khẩu hiện tại</label>
                      <input type="password" className="form-control" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Mật khẩu mới</label>
                      <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Xác nhận mật khẩu mới</label>
                      <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary" disabled={passwordSaving} onClick={async () => {
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError('Vui lòng điền đầy đủ thông tin'); return; }
                        if (newPassword !== confirmPassword) { setPasswordError('Mật khẩu mới không trùng khớp'); return; }
                        setPasswordSaving(true);
                        try {
                          const res = await fetch(`http://localhost:8000/api/auth/change-password/${encodeURIComponent(username || '')}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ currentPassword, newPassword }),
                          });
                          if (!res.ok) { const txt = await res.text(); setPasswordError(txt || 'Lỗi khi đổi mật khẩu'); } else {
                            setPasswordSuccess('Đổi mật khẩu thành công');
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                          }
                        } catch (e: any) { setPasswordError(e?.message ? `Lỗi kết nối: ${e.message}` : 'Lỗi kết nối'); } finally { setPasswordSaving(false); }
                      }}>{passwordSaving ? 'Đang lưu...' : 'Lưu'}</button>
                      <button className="btn btn-outline-secondary" onClick={() => { setShowChangePassword(false); setPasswordError(null); setPasswordSuccess(null); }}>Hủy</button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeMenu === "profile-edit" && (
            <motion.div
              className="user-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card p-3">
                <h5 className="mb-4">Chỉnh sửa thông tin cá nhân</h5>
                {saveError && <div className="alert alert-danger">{saveError}</div>}
                <div className="mb-3">
                  <label className="form-label">Họ và tên</label>
                  <input className="form-control" value={form.fullName ?? ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ngày sinh (dd/mm/yyyy)</label>
                  <input type="text" placeholder="dd/mm/yyyy" className="form-control" value={form.dob ?? ''} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Quê quán</label>
                  <input className="form-control" value={form.homeTown ?? ''} onChange={(e) => setForm({ ...form, homeTown: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Số điện thoại</label>
                  <input className="form-control" value={form.phoneNumber ?? ''} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-primary" disabled={saving} onClick={async () => {
                    setSaveError(null);
                    if (!form.fullName || !form.email) { setSaveError('Họ và tên và email là bắt buộc'); return; }
                    if (form.dob) {
                      const dobStr = String(form.dob).trim();
                      const dobMatch = dobStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                      if (!dobMatch) { setSaveError('Ngày sinh phải ở định dạng dd/mm/yyyy'); return; }
                      const d = Number(dobMatch[1]), m = Number(dobMatch[2]), y = Number(dobMatch[3]);
                      const dt = new Date(y, m - 1, d);
                      if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) { setSaveError('Ngày sinh không hợp lệ'); return; }
                    }
                    setSaving(true);
                    try {
                      const payload = { ...form } as any;
                      if (payload.dob && /\d{2}\/\d{2}\/\d{4}/.test(payload.dob)) {
                        const [d, m, y] = (payload.dob as string).split('/');
                        payload.dob = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                      }
                      const res = await fetch(`http://localhost:8000/api/auth/user/${encodeURIComponent(username || '')}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                      });
                      const text = await res.text();
                      let body: any = text;
                      try { body = JSON.parse(text); } catch {}
                      if (!res.ok) {
                        const msg = (body && (body.message || body.error || (Array.isArray(body) ? body.join('; ') : null))) || text || res.statusText;
                        setSaveError(msg || `Lỗi khi lưu (${res.status})`);
                      } else {
                        const updated = body;
                        if (updated && updated.dob && typeof updated.dob === 'string') {
                          const parts = updated.dob.split('-');
                          if (parts.length === 3) updated.dob = `${parts[2]}/${parts[1]}/${parts[0]}`;
                        }
                        setProfile(updated);
                        setActiveMenu('profile');
                      }
                    } catch (e: any) { setSaveError(e?.message ? `Lỗi kết nối: ${e.message}` : 'Lỗi kết nối khi lưu'); } finally { setSaving(false); }
                  }}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
                  <button className="btn btn-outline-secondary" onClick={() => setActiveMenu('profile')}>Hủy</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeMenu === "drugs" && (
            <motion.div
              className="user-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="drugs-container">
                {/* Header */}
                <div className="drugs-header">
                  <h2>Quản lí thuốc cá nhân</h2>
                </div>

                {/* Drug Table */}
                <div className="drugs-table-wrapper">
                  <table className="drugs-table">
                    <thead>
                      <tr>
                        <th className="col-stt">STT</th>
                        <th className="col-name">Tên thuốc</th>
                        <th className="col-type">Loại thuốc</th>
                        <th className="col-quantity">Số lượng</th>
                        <th className="col-expiry">HSD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleDrugs.map((drug, index) => (
                        <tr key={drug.id}>
                          <td>{index + 1}</td>
                          <td>{drug.name}</td>
                          <td>{drug.type}</td>
                          <td>{drug.quantity}</td>
                          <td>{drug.expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
