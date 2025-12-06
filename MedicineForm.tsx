import React, { useState, useContext } from "react";
import MedicineContext, { Medicine } from "../context/MedicineContext";

interface Props {
  onClose: () => void;
  editData?: Medicine;
}

const MedicineForm: React.FC<Props> = ({ onClose, editData }) => {
  const { dispatch } = useContext(MedicineContext);

  const [form, setForm] = useState<Medicine>(
    editData || {
      id: crypto.randomUUID(),
      name: "",
      type: "",
      quantity: 0,
      expiry: "",
      importDate: "",
      supplier: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    dispatch({
      type: editData ? "UPDATE_MEDICINE" : "ADD_MEDICINE",
      payload: form,
    });
    onClose();
  };

  return (
    <div style={{ background: "#0004", position: "fixed", inset: 0 }}>
      <div style={{ width: 500, padding: 20, background: "white", margin: "80px auto" }}>
        <h3>{editData ? "Chỉnh sửa thông tin thuốc" : "Nhập thuốc"}</h3>

        <input name="name" placeholder="Tên thuốc" value={form.name} onChange={handleChange} />
        <input name="type" placeholder="Loại thuốc" value={form.type} onChange={handleChange} />
        <input name="quantity" type="number" placeholder="Số lượng" value={form.quantity} onChange={handleChange} />
        <input name="expiry" type="date" placeholder="Hạn sử dụng" value={form.expiry} onChange={handleChange} />
        <input name="importDate" type="date" placeholder="Ngày nhập thuốc" value={form.importDate} onChange={handleChange} />
        <input name="supplier" placeholder="Nhà cung cấp" value={form.supplier} onChange={handleChange} />

        <button onClick={onClose}>Hủy</button>
        <button onClick={handleSubmit}>{editData ? "Lưu lại" : "Thêm mới"}</button>
      </div>
    </div>
  );
};

export default MedicineForm;
