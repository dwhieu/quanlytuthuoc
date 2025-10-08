import React from "react";
import { Table, Button, Form } from "react-bootstrap";
import { motion } from "framer-motion";

const DrugTable: React.FC = () => {
  const drugs = [
    { name: "Paracetamol", exp: "2024-12-30", supplier: "MedCorp" },
    { name: "Amoxicillin Z", exp: "2025-12-15", supplier: "MedCorp" },
    { name: "Vitamin C", exp: "2025-10-10", supplier: "NutriHealth" },
  ];

  return (
    <div className="bg-white p-3 rounded-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Form.Control type="text" placeholder="Tìm kiếm..." style={{ width: "60%" }} />
        <Button variant="primary">Thêm thuốc mới</Button>
      </div>
      <Table hover responsive bordered>
        <thead className="table-primary">
          <tr>
            <th>Tên thuốc</th>
            <th>Hạn sử dụng</th>
            <th>Nhà cung cấp</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {drugs.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>{d.exp}</td>
              <td>{d.supplier}</td>
              <td>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-outline-primary btn-sm me-2"
                >
                  Sửa
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-outline-danger btn-sm"
                >
                  Xóa
                </motion.button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DrugTable;
