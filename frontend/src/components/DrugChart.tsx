import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Drug = {
  id: number;
  tenThuoc: string;
  loaiThuoc: string;
};

type ChartRow = { name: string; value: number };

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#ff6f61", "#6f42c1"];
const API_BASE = "http://localhost:8000/api";

const DrugChart: React.FC = () => {
  const [data, setData] = useState<ChartRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/drugs`);
        if (!res.ok) throw new Error();
        const list: Drug[] = await res.json();
        const grouped = list.reduce<Record<string, number>>((acc, item) => {
          const key = item.loaiThuoc || "Khác";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const rows = Object.entries(grouped).map(([name, value]) => ({ name, value }));
        setData(rows.length ? rows : [{ name: "Chưa có dữ liệu", value: 1 }]);
      } catch {
        setData([{ name: "Không tải được dữ liệu", value: 1 }]);
      }
    };
    load();
  }, []);

  return (
    <div className="text-center bg-white rounded-3 shadow-sm p-3">
      <h6 className="fw-bold mb-3">Biểu đồ Tỷ lệ Loại Thuốc</h6>
      <PieChart width={300} height={250}>
        <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default DrugChart;
