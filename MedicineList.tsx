import React, { useContext, useState } from "react";
import MedicineContext from "../context/MedicineContext";
import MedicineForm from "../components/MedicineForm";

const MedicineList = () => {
  const { state, dispatch } = useContext(MedicineContext);
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_MEDICINE", payload: id });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý thuốc</h2>

      <button onClick={() => { setEditData(null); setOpenForm(true); }}>
        Nhập thuốc
      </button>

      <table border={1} style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên thuốc</th>
            <th>Loại thuốc</th>
            <th>Số lượng</th>
            <th>HSD</th>
            <th>Ngày nhập</th>
            <th>Nhà cung cấp</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {state.medicines.map((m, index) => (
            <tr key={m.id}>
              <td>{index + 1}</td>
              <td>{m.name}</td>
              <td>{m.type}</td>
              <td>{m.quantity}</td>
              <td>{m.expiry}</td>
              <td>{m.importDate}</td>
              <td>{m.supplier}</td>
              <td>
                <button onClick={() => { setEditData(m); setOpenForm(true); }}>✏️</button>
                <button onClick={() => handleDelete(m.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {openForm && (
        <MedicineForm
          editData={editData}
          onClose={() => setOpenForm(false)}
        />
      )}
    </div>
  );
};

export default MedicineList;
