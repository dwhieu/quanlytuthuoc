import React from "react";
import { Card, Row, Col, Modal, Button, Table } from "react-bootstrap";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import DrugChart from "./DrugChart";
import "./Dashboard.css";
import CalendarCard from "./CalendarCard";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

//

const Dashboard: React.FC = () => {
  const { fullName, username } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const storedFullName = localStorage.getItem('fullName');
    if (storedFullName) {
      // Re-render with stored full name
      return;
    }
    // Try to fetch user info if we have username but no fullName
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/auth/user/${username}`);
        if (response.ok) {
          const userData = await response.json();
          if (userData.fullName) {
            localStorage.setItem('fullName', userData.fullName);
            window.location.reload(); // Force refresh to update display
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    
    if (username && !fullName) {
      fetchUserInfo();
    }
  }, [username, fullName]);

  // Get the last word (name) from the full name
  const getLastName = (name: string | null | undefined): string => {
    if (!name) return 'Người dùng';
    // Remove any trailing spaces and split by spaces
    const names = name.trim().split(' ');
    // Get the last word (last name)
    return names[names.length - 1];
  };

  const handleViewPatients = () => {
    navigate('/patients');
  };

  const handleViewDrugs = () => {
    navigate('/drugs');
  };
  // Modal hiển thị đầy đủ thông tin thuốc trong kho
  const [showStockModal, setShowStockModal] = React.useState(false);
  const stockItems = [
    { name: 'Paracetamol 500mg', qty: 300 },
    { name: 'Amoxicillin 250mg', qty: 250 },
    { name: 'Vitamin C 1000mg', qty: 210 },
    { name: 'Ibuprofen 200mg', qty: 160 },
    { name: 'Cefixime 100mg', qty: 130 },
  ];
  const stockTotal = stockItems.reduce((s,i)=>s+i.qty,0);
  
  return (
    <div className="p-4">
      {/* Welcome Message */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-4"
      >
        <Card className="bg-primary text-white p-4 welcome-card">
          <h2 className="mb-2">Xin chào {getLastName(fullName)}</h2>
          <h4>Chào mừng quay trở lại!</h4>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-sm h-100 stat-card">
              <Card.Body className="d-flex flex-column">
                <Card.Title>Số lượng bệnh nhân</Card.Title>
                <div className="text-center my-3">
                  <h2 className="display-4">50</h2>
                </div>
                <div className="mt-auto text-end">
                  <Card.Link 
                    onClick={handleViewPatients} 
                    style={{ cursor: 'pointer' }} 
                    className="text-primary"
                  >
                    Xem chi tiết
                  </Card.Link>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col md={4}>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-sm h-100 stat-card">
              <Card.Body className="d-flex flex-column">
                <Card.Title>Tổng số lượng thuốc trong kho</Card.Title>
                <div className="text-center my-3">
                  <h2 className="display-4">5000</h2>
                </div>
                <div className="mt-auto text-end">
                  <Card.Link 
                    onClick={handleViewDrugs} 
                    style={{ cursor: 'pointer' }} 
                    className="text-primary"
                  >
                    Xem chi tiết
                  </Card.Link>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col md={4}>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-sm h-100 stat-card">
              <Card.Body className="d-flex flex-column">
                <Card.Title>Số lượng thuốc đã nhập</Card.Title>
                <div className="text-center my-3">
                  <h2 className="display-4">10.00</h2>
                </div>
                <div className="mt-auto text-end">
                  <Card.Link 
                    onClick={handleViewDrugs} 
                    style={{ cursor: 'pointer' }} 
                    className="text-primary"
                  >
                    Xem chi tiết
                  </Card.Link>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Hàng lịch + biểu đồ (đẩy lên trên) */}
      <Row className="g-3">
        <Col md={7}>
          {/* Thuốc trong kho (moved up) */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.08 }}>
            <Card className="shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="card-title-compact">Thuốc trong kho</div>
                <button className="btn btn-link p-0 small" onClick={() => setShowStockModal(true)}>Xem tất cả</button>
              </div>
              <div className="ts-list">
                {(() => {
                  const total = stockTotal;
                  return stockItems.map((it) => {
                    const percent = Math.round((it.qty/total)*100);
                    return (
                      <div key={it.name} className="ts-item">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="item-name">{it.name}</span>
                          <span className="small text-muted">{percent}%</span>
                        </div>
                        <div className="ts-progress">
                          <div className="ts-bar" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>
          </motion.div>

          {/* Alerts, Sắp hết hạn, Hoạt động gần đây (moved up) */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.12 }}>
            <Card className="shadow-sm p-0 mt-3 alert-card">
              <Card.Body>
                <div className="card-title-compact">Cảnh báo tồn kho thấp</div>
                <ul className="list-unstyled compact-list mb-0">
                  <li className="compact-item"><span className="item-name">Paracetamol 500mg</span><span className="badge-soft danger">Còn 12</span></li>
                  <li className="compact-item"><span className="item-name">Amoxicillin 250mg</span><span className="badge-soft warn">Còn 28</span></li>
                  <li className="compact-item"><span className="item-name">Vitamin C 1000mg</span><span className="badge-soft okay">Còn 55</span></li>
                </ul>
              </Card.Body>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.16 }}>
            <Card className="shadow-sm p-0 mt-3 alert-card">
              <Card.Body>
                <div className="card-title-compact">Sắp hết hạn</div>
                <ul className="list-unstyled compact-list mb-0">
                  <li className="compact-item"><span className="item-name">Cefixime 100mg</span><span className="badge-soft warn">Còn 15 ngày</span></li>
                  <li className="compact-item"><span className="item-name">Siro ho Prospan</span><span className="badge-soft danger">Còn 5 ngày</span></li>
                  <li className="compact-item"><span className="item-name">Omeprazole 20mg</span><span className="badge-soft okay">Còn 5 ngày</span></li>
                </ul>
              </Card.Body>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card className="shadow-sm p-0 mt-3">
              <Card.Body>
                <div className="card-title-compact">Hoạt động gần đây</div>
                <ul className="list-unstyled activity-list mb-0">
                  <li><span className="dot dot-in"></span> Nhập 200 hộp Paracetamol • 10:20</li>
                  <li><span className="dot dot-out"></span> Xuất 30 vỉ Vitamin C • 09:05</li>
                  <li><span className="dot dot-edit"></span> Cập nhật giá Amoxicillin • Hôm qua</li>
                </ul>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={5}>
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <CalendarCard />
          </motion.div>
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
            <div className="mt-3">
              <DrugChart />
            </div>
          </motion.div>
        </Col>
      </Row>



      {/* Modal xem tất cả thuốc trong kho */}
      <Modal
        show={showStockModal}
        onHide={() => setShowStockModal(false)}
        size="lg"
        centered
        dialogClassName="stock-modal-dialog"
        contentClassName="stock-modal-content"
      >
        <Modal.Header closeButton>
          <Modal.Title>Danh sách thuốc trong kho</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="text-muted small">Tổng số lượng: {stockTotal.toLocaleString('vi-VN')}</div>
          </div>
          <Table hover responsive size="sm" className="align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên thuốc</th>
                <th className="text-end">Số lượng</th>
                <th className="text-end">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((it, idx) => {
                const percent = Math.round((it.qty/stockTotal)*100);
                return (
                  <tr key={it.name}>
                    <td className="text-muted">{idx+1}</td>
                    <td className="drug-name">{it.name}</td>
                    <td className="text-end num">{it.qty.toLocaleString('vi-VN')}</td>
                    <td className="text-end"><span className="ratio-chip">{percent}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStockModal(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default Dashboard;
