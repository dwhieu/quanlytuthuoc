import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, InputGroup } from "react-bootstrap";
import { FaSearch, FaBell, FaQuestionCircle, FaUser, FaSignOutAlt } from "react-icons/fa";
import "./TopBar.css";

// Cast icons to ComponentType to fix TS2786 (after imports)
const FaSearchIcon = FaSearch as unknown as React.ComponentType<any>;
const FaBellIcon = FaBell as unknown as React.ComponentType<any>;
const FaQuestionCircleIcon = FaQuestionCircle as unknown as React.ComponentType<any>;
const FaUserIcon = FaUser as unknown as React.ComponentType<any>;
const FaSignOutIcon = FaSignOutAlt as unknown as React.ComponentType<any>;

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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('avatar') || '/logo192.png') : '/logo192.png'
  );

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    // listen to avatar changes
  function onAvatarChange() { setAvatarSrc(localStorage.getItem('avatar') || '/logo192.png'); }
    window.addEventListener('avatarChanged', onAvatarChange as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('avatarChanged', onAvatarChange as EventListener);
    };
  }, []);

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

      {/* Thanh tìm kiếm */}
      <InputGroup style={{ width: "40%" }}>
        <InputGroup.Text className="bg-white border-end-0">
          <FaSearchIcon className="text-muted" />
        </InputGroup.Text>
        <Form.Control
          placeholder="Tìm kiếm tên thuốc, bệnh nhân..."
          className="border-start-0"
        />
      </InputGroup>

      {/* Icon bên phải */}
      <div className="d-flex align-items-center gap-3">
        <div className="position-relative">
          <FaBellIcon size={18} className="text-muted cursor-pointer" />
          <span className="badge bg-danger position-absolute top-0 start-100 translate-middle p-1 rounded-circle">
            &nbsp;
          </span>
        </div>
        <FaQuestionCircleIcon size={18} className="text-muted cursor-pointer" />

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
