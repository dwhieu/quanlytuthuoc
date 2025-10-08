import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { FaSearch, FaBell, FaQuestionCircle, FaUserCircle } from "react-icons/fa";
import "./TopBar.css";
import logo from "./Logo.png";

// Cast icons to ComponentType to fix TS2786 (after imports)
const FaSearchIcon = FaSearch as unknown as React.ComponentType<any>;
const FaBellIcon = FaBell as unknown as React.ComponentType<any>;
const FaQuestionCircleIcon = FaQuestionCircle as unknown as React.ComponentType<any>;
const FaUserCircleIcon = FaUserCircle as unknown as React.ComponentType<any>;

const TopBar: React.FC = () => {
  return (
    <div className="topbar d-flex align-items-center justify-content-between bg-white shadow-sm px-4 py-2">
      {/* Logo và tiêu đề */}
      <div className="d-flex align-items-center">
        <img
            src={logo}
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
  <FaUserCircleIcon size={22} className="text-muted cursor-pointer" />
      </div>
    </div>
  );
};

export default TopBar;
