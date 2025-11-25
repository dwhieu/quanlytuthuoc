import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaUser, FaSignOutAlt, FaCheckDouble } from "react-icons/fa";
import "./TopBar.css";

// Cast icons to ComponentType to fix TS2786 (after imports)
const FaBellIcon = FaBell as unknown as React.ComponentType<any>;
const FaUserIcon = FaUser as unknown as React.ComponentType<any>;
const FaSignOutIcon = FaSignOutAlt as unknown as React.ComponentType<any>;
const FaCheckDoubleIcon = FaCheckDouble as unknown as React.ComponentType<any>;

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { username, logout } = useAuth();
  const onProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };
  const onLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>(() => {
    // Chỉ sử dụng avatar từ localStorage nếu user đã đăng nhập
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedAvatar = localStorage.getItem('avatar');
    return isLoggedIn && savedAvatar ? savedAvatar : '/logo192.png';
  });

  // Sample notifications data
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Thuốc sắp hết hạn', message: 'Paracetamol sẽ hết hạn trong 7 ngày', time: '10 phút trước', unread: true },
    { id: 2, title: 'Đơn hàng mới', message: 'Bệnh nhân Nguyễn Văn A đã đặt đơn hàng', time: '1 giờ trước', unread: true },
    { id: 3, title: 'Cập nhật hệ thống', message: 'Hệ thống đã được cập nhật phiên bản mới', time: '2 giờ trước', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    // listen to avatar changes
  function onAvatarChange() {
      try {
        const key = username ? `avatar:${username}` : 'avatar';
        const value = localStorage.getItem(key) || localStorage.getItem('avatar') || '/logo192.png';
        setAvatarSrc(value);
      } catch {
        setAvatarSrc('/logo192.png');
      }
    }
    window.addEventListener('avatarChanged', onAvatarChange as EventListener);
    // initial load for current user
    onAvatarChange();
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('avatarChanged', onAvatarChange as EventListener);
    };
  }, [username]);

  return (
    <div className="topbar d-flex align-items-center justify-content-between bg-white shadow-sm px-4 py-2">
      {/* Logo và tiêu đề */}
      <div className="d-flex align-items-center">
    <img
      src={'/logo192.png'}
      alt="logo"
      style={{ width: "38px", marginRight: "10px" }}
    />
        <div className="fw-bold text-primary">
          PHARMACY INVENTORY
          <div className="text-muted small fw-normal">MANAGEMENT SYSTEM</div>
        </div>
      </div>

      {/* Icon bên phải */}
      <div className="d-flex align-items-center gap-3">
        {/* Notification Bell with Dropdown */}
        <div className="position-relative" ref={notificationRef}>
          <div 
            className="notification-bell-wrapper cursor-pointer"
            onClick={() => setNotificationOpen(v => !v)}
          >
            <FaBellIcon size={18} className="text-muted" />
            {unreadCount > 0 && (
              <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                {unreadCount}
              </span>
            )}
          </div>
          
          {/* Notification Dropdown */}
          <div className={`notification-dropdown shadow ${notificationOpen ? 'show' : ''}`}>
            <div className="notification-header px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
              <strong className="d-flex align-items-center">
                Thông báo
                {unreadCount > 0 && (
                  <span className="notification-badge ms-2">{unreadCount}</span>
                )}
              </strong>
              {unreadCount > 0 && (
                <button 
                  className="mark-read-btn"
                  onClick={markAllAsRead}
                  title="Đánh dấu tất cả đã đọc"
                >
                  <FaCheckDoubleIcon size={14} />
                </button>
              )}
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-item text-center text-muted py-4">
                  Không có thông báo
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${notif.unread ? 'unread' : ''}`}
                  >
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-time">{notif.time}</div>
                  </div>
                ))
              )}
            </div>
            <div className="notification-footer px-3 py-2 border-top text-center">
              <button 
                className="btn btn-link text-decoration-none small p-0"
                onClick={() => setNotificationOpen(false)}
              >
                Xem thêm
              </button>
            </div>
          </div>
        </div>

        {/* Avatar + hover dropdown */}
        <div className="position-relative" ref={wrapperRef}>
          <div className="avatar-area d-flex align-items-center cursor-pointer" onClick={() => setDropdownOpen(v => !v)}>
            <img src={avatarSrc} alt="avatar" className="user-avatar" />
            {username && <span className="ms-2 small text-muted">{username}</span>}
          </div>
          <div className={`avatar-dropdown shadow-sm ${dropdownOpen ? 'show' : ''}`}>
            <div className="dropdown-item d-flex align-items-center" onClick={onProfileClick}>
              <FaUserIcon className="me-2 text-muted dropdown-icon" />
              <span>{username || 'Thông tin cá nhân'}</span>
            </div>
            <div className="dropdown-item d-flex align-items-center text-danger" onClick={onLogout}>
              <FaSignOutIcon className="me-2 text-danger dropdown-icon" />
              <span>Đăng xuất</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
