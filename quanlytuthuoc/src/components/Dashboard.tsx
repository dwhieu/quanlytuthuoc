import React from "react";
import DrugChart from "./DrugChart";
import DrugTable from "./DrugTable";
import { Card, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Dashboard: React.FC = () => {
  return (
    <div className="p-4">
      <Row className="mb-3">
        <Col md={4}>
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="shadow-sm p-3">
              <h6>Tổng quan tồn kho</h6>
              <p>Tổng số loại thuốc: <b>450</b></p>
              <p>Cảnh báo thiếu: <b>15 loại</b></p>
            </Card>
          </motion.div>
        </Col>
        <Col md={4}>
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card className="shadow-sm p-3">
              <h6>Cảnh báo sắp hết hạn</h6>
              <ul>
                <li>Paracetamol - 30/12/2024</li>
                <li>Amoxicillin - 15/11/2025</li>
              </ul>
            </Card>
          </motion.div>
        </Col>
        <Col md={4}>
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <Card className="shadow-sm p-3">
              <h6>Cảnh báo tồn kho thấp</h6>
              <ul>
                <li>Vitamin C - 50 hộp</li>
              </ul>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
            <DrugChart />
          </motion.div>
        </Col>
        <Col md={6}>
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.8 }}>
            <DrugTable />
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
