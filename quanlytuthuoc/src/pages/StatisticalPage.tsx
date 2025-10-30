import React from "react";
import { Card, Row, Col, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type RangeKey = "7d" | "1m" | "6m" | "1y";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// Mock helpers to generate demo data based on selected range
const genPatientsByMonth = (range: RangeKey) => {
  const base = [
    { label: "01", patients: 32 },
    { label: "02", patients: 44 },
    { label: "03", patients: 51 },
    { label: "04", patients: 39 },
    { label: "05", patients: 62 },
    { label: "06", patients: 57 },
    { label: "07", patients: 48 },
    { label: "08", patients: 66 },
    { label: "09", patients: 72 },
    { label: "10", patients: 59 },
    { label: "11", patients: 63 },
    { label: "12", patients: 71 },
  ];
  if (range === "7d") return base.slice(0, 7).map((d, i) => ({ label: `D${i + 1}`, patients: d.patients }));
  if (range === "1m") return base.slice(0, 4).map((d, i) => ({ label: `W${i + 1}`, patients: d.patients }));
  if (range === "6m") return base.slice(0, 6);
  return base; // 1y
};

const genDrugStatus = (range: RangeKey) => {
  const categories = ["Paracetamol", "Amoxicillin", "Vitamin C", "Ibuprofen", "Cefixime", "Omeprazole"];
  const factor = range === "7d" ? 0.25 : range === "1m" ? 0.4 : range === "6m" ? 0.7 : 1;
  return categories.map((c, i) => ({
    name: c,
    inStock: Math.round((300 - i * 20) * factor),
    nearExpiry: Math.round((60 + (i % 3) * 10) * factor),
    expired: Math.round((15 + (i % 2) * 8) * factor),
  }));
};

const numberWithSpaces = (n: number) => n.toLocaleString("vi-VN");

const StatisticalPage: React.FC = () => {
  const [rangeTop, setRangeTop] = React.useState<RangeKey>("6m");
  const [rangeBottom, setRangeBottom] = React.useState<RangeKey>("1y");

  // Dữ liệu theo bộ lọc phía trên (dùng cho thẻ tổng quan)
  const patientsDataTop = React.useMemo(() => genPatientsByMonth(rangeTop), [rangeTop]);
  const drugStatusTop = React.useMemo(() => genDrugStatus(rangeTop), [rangeTop]);

  // Dữ liệu theo bộ lọc phía dưới (dùng cho biểu đồ bên dưới)
  const patientsDataBottom = React.useMemo(() => genPatientsByMonth(rangeBottom), [rangeBottom]);
  const drugStatusData = React.useMemo(() => genDrugStatus(rangeBottom), [rangeBottom]);

  // Tính tổng chỉ dựa trên bộ lọc phía trên
  const totals = React.useMemo(() => {
    const patients = patientsDataTop.reduce((s, d) => s + d.patients, 0);
    const inStock = drugStatusTop.reduce((s, d) => s + d.inStock, 0);
    const suppliers = 18; // demo
    return { patients, inStock, suppliers };
  }, [patientsDataTop, drugStatusTop]);

  return (
    <div className="p-2">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-3">
        <h4 className="fw-semibold">Thống kê</h4>
      </motion.div>

      {/* Top summary with filter */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="fw-semibold">Bộ lọc</div>
            <Form.Select size="sm" style={{ width: 220 }} value={rangeTop} onChange={(e) => setRangeTop(e.target.value as RangeKey)}>
              <option value="7d">7 ngày gần nhất</option>
              <option value="1m">1 tháng gần nhất</option>
              <option value="6m">6 tháng gần nhất</option>
              <option value="1y">1 năm gần nhất</option>
            </Form.Select>
          </div>

          <motion.div variants={containerStagger} initial="hidden" animate="visible">
            <Row>
              {[{ label: "Số lượng bệnh nhân", value: totals.patients }, { label: "Tổng số thuốc trong kho", value: totals.inStock }, { label: "Số lượng nhà cung cấp", value: totals.suppliers }].map((item, idx) => (
                <Col md={4} key={idx} className="mb-3">
                  <motion.div variants={fadeInUp} whileHover={{ y: -4, boxShadow: "0 6px 20px rgba(0,0,0,.12)" }}>
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="d-flex flex-column align-items-start">
                        <div className="text-muted small mb-2">{item.label}</div>
                        <motion.div
                          key={`${item.label}-${item.value}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                          className="display-6 fw-bold"
                        >
                          {numberWithSpaces(item.value)}
                        </motion.div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Card.Body>
      </Card>

      {/* Bottom charts with its own filter */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="fw-semibold">Bộ lọc</div>
            <Form.Select size="sm" style={{ width: 220 }} value={rangeBottom} onChange={(e) => setRangeBottom(e.target.value as RangeKey)}>
              <option value="7d">7 ngày gần nhất</option>
              <option value="1m">1 tháng gần nhất</option>
              <option value="6m">6 tháng gần nhất</option>
              <option value="1y">1 năm gần nhất</option>
            </Form.Select>
          </div>

          <Row>
            <Col md={6} className="mb-3">
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="fw-semibold mb-2">Biểu đồ cột thể hiện số lượng bệnh nhân</div>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={patientsDataBottom} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip cursor={{ fill: "rgba(0,0,0,.04)" }} />
                          <Legend />
                          <Bar dataKey="patients" name="Bệnh nhân" fill="#0d6efd" radius={[6, 6, 0, 0]} animationDuration={600} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            <Col md={6} className="mb-3">
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="fw-semibold mb-2">Biểu đồ cột ghép: tồn kho, hết hạn, sắp hết hạn</div>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={drugStatusData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip cursor={{ fill: "rgba(0,0,0,.04)" }} />
                          <Legend />
                          <Bar dataKey="inStock" name="Trong kho" fill="#198754" radius={[6, 6, 0, 0]} animationDuration={600} />
                          <Bar dataKey="nearExpiry" name="Sắp hết hạn" fill="#ffc107" radius={[6, 6, 0, 0]} animationDuration={600} />
                          <Bar dataKey="expired" name="Hết hạn" fill="#dc3545" radius={[6, 6, 0, 0]} animationDuration={600} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StatisticalPage;


