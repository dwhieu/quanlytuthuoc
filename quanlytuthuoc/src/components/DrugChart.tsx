import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const data = [
  { name: "Kháng sinh", value: 40 },
  { name: "Vitamin", value: 20 },
  { name: "Khác", value: 15 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const DrugChart: React.FC = () => (
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

export default DrugChart;
