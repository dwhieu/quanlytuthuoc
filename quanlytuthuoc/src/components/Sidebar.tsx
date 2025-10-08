import React from "react";
import { motion } from "framer-motion";
import { FaTachometerAlt, FaPills, FaNotesMedical, FaDownload } from "react-icons/fa";
import { ListGroup } from "react-bootstrap";

// Fix TS2786: cast icons to component types for JSX (after imports)
const FaTachometerAltIcon = FaTachometerAlt as unknown as React.ComponentType<any>;
const FaPillsIcon = FaPills as unknown as React.ComponentType<any>;
const FaNotesMedicalIcon = FaNotesMedical as unknown as React.ComponentType<any>;
const FaDownloadIcon = FaDownload as unknown as React.ComponentType<any>;

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: <FaTachometerAltIcon />, text: "Trang chủ" },
    { icon: <FaPillsIcon />, text: "Quản lý Thuốc" },
    { icon: <FaNotesMedicalIcon />, text: "Quản lý Bệnh Nhân" },
    { icon: <FaDownloadIcon />, text: "Xuất Thuốc" },
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