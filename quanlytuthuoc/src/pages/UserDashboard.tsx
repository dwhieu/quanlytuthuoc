import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaUser, FaPills } from 'react-icons/fa';
import { ListGroup } from 'react-bootstrap';
import TopBar from '../components/TopBar';

// Cast icons
const FaHomeIcon = FaHome as unknown as React.ComponentType<any>;
const FaUserIcon = FaUser as unknown as React.ComponentType<any>;
const FaPillsIcon = FaPills as unknown as React.ComponentType<any>;

const UserDashboard: React.FC = () => {
  const { fullName, username } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = React.useState<string>('profile');

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
      <h5 className="mb-4 text-center fw-bold">PHARMACY USER</h5>
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
        <div className="p-4">
          {activeMenu === "home" && (
            <div className="user-content">
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card shadow-sm">
                    <div className="card-body text-center">
                      <h5 className="card-title">Xin chào {fullName || username}</h5>
                      <p className="card-text text-muted">Mừng quay trở lại!</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card shadow-sm">
                    <div className="card-body text-center">
                      <h6 className="card-title">Hôm nay bạn cần thứ nào?</h6>
                      <p className="card-text text-muted small">
                        Hotline liên hệ: <strong>0123456789</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm">
                <div className="card-body" style={{ minHeight: "250px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
                  <span>CHÈN ẢNH</span>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "profile" && (
            <div className="user-content">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-4">Thông tin tài khoản</h5>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="fw-bold">Tên tài khoản:</label>
                    </div>
                    <div className="col-md-8">
                      <p className="text-muted">{username}</p>
                    </div>
                  </div>
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <label className="fw-bold">Tên đầy đủ:</label>
                    </div>
                    <div className="col-md-8">
                      <p className="text-muted">{fullName || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm">Chỉnh sửa thông tin</button>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "drugs" && (
            <div className="user-content">
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <h6 className="text-muted">Quản lí thuốc - Chức năng đang được phát triển</h6>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
