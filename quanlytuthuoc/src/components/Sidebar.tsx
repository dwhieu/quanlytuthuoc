import React from "react";
import { motion } from "framer-motion";
import { FaHome, FaPills, FaNotesMedical, FaDownload, FaUser } from "react-icons/fa";
import { ListGroup } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

// cast icons to component types to satisfy TS2786
const FaHomeIcon = FaHome as unknown as React.ComponentType<any>;
const FaPillsIcon = FaPills as unknown as React.ComponentType<any>;
const FaNotesMedicalIcon = FaNotesMedical as unknown as React.ComponentType<any>;
const FaDownloadIcon = FaDownload as unknown as React.ComponentType<any>;
const FaUserIcon = FaUser as unknown as React.ComponentType<any>;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const menuItems = [
    { icon: <FaHomeIcon />, text: "Trang chủ", to: "/" },
    { icon: <FaUserIcon />, text: "Thông tin cá nhân", to: "/profile" },
    { icon: <FaPillsIcon />, text: "Quản lý Thuốc", to: "/drugs" },
    { icon: <FaNotesMedicalIcon />, text: "Quản lý Bệnh Nhân", to: "/patients" },
    { icon: <FaDownloadIcon />, text: "Xuất Thuốc", to: "/export" },
  ];

  return (
    <div className="bg-primary text-white vh-100 p-3 sidebar">
      <h5 className="mb-4 text-center fw-bold">PHARMACY INVENTORY</h5>

      <ListGroup variant="flush">
        {menuItems.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, backgroundColor: "#0b5ed7" }}
            transition={{ type: "spring", stiffness: 250 }}
          >
            <ListGroup.Item
              action
              onClick={() => item.to && navigate(item.to)}
              className="bg-primary text-white border-0 d-flex align-items-center py-2"
            >
              <span className="me-2">{item.icon}</span> {item.text}
            </ListGroup.Item>
          </motion.div>
        ))}
      </ListGroup>
    </div>
  );
};

export default Sidebar;
