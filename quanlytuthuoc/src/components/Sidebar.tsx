import React from "react";
import { motion } from "framer-motion";
import { FaHome, FaPills, FaNotesMedical, FaUser } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import { ListGroup } from "react-bootstrap";
import { useNavigate, useLocation } from 'react-router-dom';

// cast icons to component types to satisfy TS2786
const FaHomeIcon = FaHome as unknown as React.ComponentType<any>;
const FaPillsIcon = FaPills as unknown as React.ComponentType<any>;
const FaNotesMedicalIcon = FaNotesMedical as unknown as React.ComponentType<any>;
const FaUserIcon = FaUser as unknown as React.ComponentType<any>;
const FiFileTextIcon = FiFileText as unknown as React.ComponentType<any>;


const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = [
    { icon: <FaHomeIcon />, text: "Trang chủ", to: "/dashboard" },
    { icon: <FaUserIcon />, text: "Thông tin cá nhân", to: "/profile" },
    { icon: <FaPillsIcon />, text: "Quản lý Thuốc", to: "/drugs" },
    { icon: <FaNotesMedicalIcon />, text: "Quản lý Bệnh Nhân", to: "/patients" },
    { icon: <FiFileTextIcon />, text: "Thống kê", to: "/statistical" },
  ];

  return (
    <div className="bg-primary text-white vh-100 p-3 sidebar">
      <h5 className="mb-4 text-center fw-bold">PHARMACY INVENTORY</h5>

      <ListGroup variant="flush">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.to;
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
                onClick={() => item.to && navigate(item.to)}
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
};

export default Sidebar;
