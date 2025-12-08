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
  tinhTrangSucKhoe?: string;
  createdAt?: string;
};

type RangeKey = "week" | "month" | "year";

const API_BASE = "http://localhost:8000/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const numberWithSpaces = (n: number) => n.toLocaleString("vi-VN");

const daysUntil = (hsd?: string) => {
  if (!hsd) return Number.POSITIVE_INFINITY;
  const diff = new Date(hsd).getTime() - Date.now();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "week", label: "7 ngày gần nhất" },
  { key: "month", label: "1 tháng gần nhất" },
  { key: "year", label: "1 năm gần nhất" },
];

const RANGE_DAYS: Record<RangeKey, number> = {
  week: 7,
  month: 30,
  year: 365,
};

const parseDateValue = (value?: string | null): Date | null => {
  if (!value) return null;
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;
  const fallback = new Date(`${value}T00:00:00`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const filterByRange = <T,>(items: T[], getDate: (item: T) => Date | null, range: RangeKey): T[] => {
  const days = RANGE_DAYS[range];
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter(item => {
    const date = getDate(item);
    if (!date) return true;
    return date.getTime() >= threshold;
  });
};

const StatisticalPage: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [drugs, setDrugs] = React.useState<Drug[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [summaryRange, setSummaryRange] = React.useState<RangeKey>("month");
  const [chartRange, setChartRange] = React.useState<RangeKey>("year");

  const patientsForSummary = React.useMemo(
    () => filterByRange(patients, p => parseDateValue(p.createdAt ?? null), summaryRange),
    [patients, summaryRange]
  );

  const drugsForSummary = React.useMemo(
    () => filterByRange(drugs, d => parseDateValue(d.ngayNhap ?? null), summaryRange),
    [drugs, summaryRange]
  );

  const patientsForCharts = React.useMemo(
    () => filterByRange(patients, p => parseDateValue(p.createdAt ?? null), chartRange),
    [patients, chartRange]
  );

  const drugsForCharts = React.useMemo(
    () => filterByRange(drugs, d => parseDateValue(d.ngayNhap ?? null), chartRange),
    [drugs, chartRange]
  );

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [drugRes, patientRes] = await Promise.all([
          fetch(`${API_BASE}/drugs`),
          fetch(`${API_BASE}/patients`)
        ]);
        if (!drugRes.ok) throw new Error(await drugRes.text());
        if (!patientRes.ok) throw new Error(await patientRes.text());
        const drugData = await drugRes.json();
        const patientData = await patientRes.json();
        setDrugs(Array.isArray(drugData) ? drugData : []);
        setPatients(Array.isArray(patientData) ? patientData : []);
        setError(null);
      } catch (e) {
        setError("Không tải được dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totals = React.useMemo(() => {
    const patientsTotal = patientsForSummary.length;
    const inStock = drugsForSummary.reduce((s, d) => s + (d.soLuong || 0), 0);
    const suppliers = new Set(drugsForSummary.map(d => d.nhaCungCap).filter(Boolean)).size;
    return { patients: patientsTotal, inStock, suppliers };
  }, [patientsForSummary, drugsForSummary]);

  const patientChartData = React.useMemo(() => {
    const counts = new Map<string, number>();

    patientsForCharts.forEach(patient => {
      const date = parseDateValue(patient.createdAt ?? null);
      const key = date ? date.toISOString().slice(0, 10) : "unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    if (!counts.size) {
      return [{ label: "Chưa có dữ liệu", patients: 0 }];
    }

    const formatter = new Intl.DateTimeFormat("vi-VN");

    return Array.from(counts.entries())
      .map(([key, value]) => {
        if (key === "unknown") {
          return { label: "Chưa rõ ngày", patients: value, sort: Number.POSITIVE_INFINITY };
        }
        const date = new Date(`${key}T00:00:00`);
        return { label: formatter.format(date), patients: value, sort: date.getTime() };
      })
      .sort((a, b) => a.sort - b.sort)
      .map(({ sort, ...rest }) => rest);
  }, [patientsForCharts]);

  const drugStatusData = React.useMemo(() => {
    const source = drugsForCharts.length
      ? drugsForCharts
      : [{ id: -1, tenThuoc: "Chưa có dữ liệu", soLuong: 0, hsd: "", loaiThuoc: "", ngayNhap: "", nhaCungCap: "" } as Drug];

    return source.map(d => {
      const qty = d.soLuong || 0;
      const days = daysUntil(d.hsd);
      const nearExpiry = days > 0 && days <= 30 ? qty : 0;
      const expired = days <= 0 ? qty : 0;
      const inStock = days > 0 ? qty : 0;
      return { name: d.tenThuoc, inStock, nearExpiry, expired };
    });
  }, [drugsForCharts]);

  return (
    <div className="p-2">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-3">
        <h4 className="fw-semibold">THỐNG KÊ</h4>
      </motion.div>

      {error && <div style={{ color: '#dc3545', marginBottom: 12 }}>{error}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Đang tải dữ liệu...</div>}

      {/* Top summary */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-start align-items-center mb-3 flex-wrap gap-2">
            <div className="fw-semibold text-muted">Bộ lọc</div>
            <Form.Select
              size="sm"
              value={summaryRange}
              onChange={e => setSummaryRange(e.target.value as RangeKey)}
              style={{ maxWidth: 220 }}
              aria-label="Chọn khoảng thời gian tổng hợp"
            >
              {RANGE_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
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

      {/* Charts */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-start align-items-center mb-3 flex-wrap gap-2">
            <div className="fw-semibold text-muted">Bộ lọc</div>
            <Form.Select
              size="sm"
              value={chartRange}
              onChange={e => setChartRange(e.target.value as RangeKey)}
              style={{ maxWidth: 220 }}
              aria-label="Chọn khoảng thời gian biểu đồ"
            >
              {RANGE_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </Form.Select>
          </div>

          <Row>
            <Col md={6} className="mb-3">
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="fw-semibold mb-2">Số bệnh nhân theo ngày</div>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={patientChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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


