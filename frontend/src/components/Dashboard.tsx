import React from "react";
import { Card, Row, Col, Modal, Button, Table } from "react-bootstrap";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import DrugChart from "./DrugChart";
import "./Dashboard.css";
import CalendarCard from "./CalendarCard";

type Drug = {
  id: number;
  tenThuoc: string;
  loaiThuoc: string;
  soLuong: number;
  hsd: string;
  ngayNhap: string;
  nhaCungCap: string;
};

type Patient = {
  id: number;
  tenBenhNhan: string;
};

const API_BASE = "http://localhost:8000/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

//

const Dashboard: React.FC = () => {
  const { fullName, username, token } = useAuth();
  const navigate = useNavigate();
  const [drugs, setDrugs] = React.useState<Drug[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showStockModal, setShowStockModal] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const [drugRes, patientRes] = await Promise.all([
          fetch(`${API_BASE}/drugs`, { headers }),
          fetch(`${API_BASE}/patients`, { headers })
        ]);
        if (!drugRes.ok) throw new Error(await drugRes.text());
        if (!patientRes.ok) throw new Error(await patientRes.text());
        const drugData = await drugRes.json();
        const patientData = await patientRes.json();
        setDrugs(Array.isArray(drugData) ? drugData : []);
        setPatients(Array.isArray(patientData) ? patientData : []);
        setError(null);
      } catch (e) {
        console.error('Fetch error:', e);
        setError("Không tải được dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);
  
  React.useEffect(() => {
    const storedFullName = localStorage.getItem('fullName');
    if (storedFullName) {
      // Re-render with stored full name
      return;
    }
    // Try to fetch user info if we have username but no fullName
    const fetchUserInfo = async () => {
      try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE}/auth/user/${username}`, { headers });
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

  const handleViewPatients = () => navigate('/patients');
  const handleViewDrugs = () => navigate('/drugs');

  const totalPatients = patients.length;
  const totalQuantity = drugs.reduce((s, d) => s + (d.soLuong || 0), 0);
  const totalDrugEntries = drugs.length;

  const sortedByQty = [...drugs].sort((a, b) => (b.soLuong || 0) - (a.soLuong || 0));
  const stockItems = sortedByQty.slice(0, 5).map(d => ({ name: d.tenThuoc, qty: d.soLuong || 0 }));
  const stockTotal = stockItems.reduce((s, i) => s + i.qty, 0);

  const daysUntil = (hsd: string) => {
    if (!hsd) return Number.POSITIVE_INFINITY;
    const diff = new Date(hsd).getTime() - Date.now();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const lowStock = drugs.filter(d => (d.soLuong || 0) <= 10).slice(0, 3);
  const nearExpiry = drugs.filter(d => {
    const days = daysUntil(d.hsd);
    return days > 0 && days <= 30;
  }).slice(0, 3);
  
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

      {error && <div style={{ color: '#dc3545', marginBottom: 12 }}>{error}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Đang tải dữ liệu...</div>}

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
                  <h2 className="display-4">{totalPatients}</h2>
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
                  <h2 className="display-4">{totalQuantity.toLocaleString('vi-VN')}</h2>
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
                  <h2 className="display-4">{totalDrugEntries}</h2>
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
                {(stockItems.length ? stockItems : [{ name: 'Chưa có dữ liệu', qty: 0 }]).map((it) => {
                  const percent = stockTotal > 0 ? Math.round((it.qty/stockTotal)*100) : 0;
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
                })}
              </div>
            </Card>
          </motion.div>

          {/* Alerts, Sắp hết hạn, Hoạt động gần đây (moved up) */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.12 }}>
            <Card className="shadow-sm p-0 mt-3 alert-card">
              <Card.Body>
                <div className="card-title-compact">Cảnh báo tồn kho thấp</div>
                <ul className="list-unstyled compact-list mb-0">
                  {(lowStock.length ? lowStock : [{ id: -1, tenThuoc: 'Chưa có dữ liệu', soLuong: 0 } as Drug]).map(it => (
                    <li key={it.id} className="compact-item"><span className="item-name">{it.tenThuoc}</span><span className="badge-soft danger">Còn {it.soLuong}</span></li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.16 }}>
            <Card className="shadow-sm p-0 mt-3 alert-card">
              <Card.Body>
                <div className="card-title-compact">Sắp hết hạn</div>
                <ul className="list-unstyled compact-list mb-0">
                  {(nearExpiry.length ? nearExpiry : [{ id: -1, tenThuoc: 'Chưa có dữ liệu', hsd: '' } as Drug]).map(it => {
                    const days = daysUntil(it.hsd);
                    return (
                      <li key={it.id} className="compact-item"><span className="item-name">{it.tenThuoc}</span><span className="badge-soft warn">Còn {days} ngày</span></li>
                    );
                  })}
                </ul>
              </Card.Body>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card className="shadow-sm p-0 mt-3">
              <Card.Body>
                <div className="card-title-compact">Hoạt động gần đây</div>
                <ul className="list-unstyled activity-list mb-0">
                  {(drugs.slice(0, 5).map(d => (
                    <li key={d.id}><span className="dot dot-edit"></span> Cập nhật {d.tenThuoc}</li>
                  ))).concat(drugs.length === 0 ? [<li key="empty"><span className="dot"></span> Chưa có dữ liệu</li>] : [])}
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
              {(stockItems.length ? stockItems : [{ name: 'Chưa có dữ liệu', qty: 0 }]).map((it, idx) => {
                const percent = stockTotal > 0 ? Math.round((it.qty/stockTotal)*100) : 0;
                return (
                  <tr key={it.name + idx}>
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
