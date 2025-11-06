import React from "react";
import { Button, Table } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import '../styles/PatientsPage.css';

// Cast icons to component types to satisfy TypeScript
const FaEditIcon = FaEdit as unknown as React.ComponentType<any>;
const FaTrashIcon = FaTrash as unknown as React.ComponentType<any>;

const PatientsPage: React.FC = () => {
    //Data bệnh nhân mẫu
    const samplePatients = [
        { 
            id: 1,
            tenBenhNhan: "Nguyễn Văn A",
            tuoi: 35,
            sdt: "0901234567",
            diaChi: "123 Đường ABC, Q.1, TP.HCM",
            tinhTrangSucKhoe: "Ổn định",
            thuocDangSuDung: "Paracetamol, Vitamin C"
        },
        {
            id: 2,
            tenBenhNhan: "Trần Thị B",
            tuoi: 42,
            sdt: "0912345678",
            diaChi: "456 Đường XYZ, Q.3, TP.HCM",
            tinhTrangSucKhoe: "Cần theo dõi",
            thuocDangSuDung: "Amoxicillin"
        },
        {
            id: 3,
            tenBenhNhan: "Lê Văn C",
            tuoi: 28,
            sdt: "0923456789",
            diaChi: "789 Đường DEF, Q.5, TP.HCM",
            tinhTrangSucKhoe: "Ổn định",
            thuocDangSuDung: "Ibuprofen"
        }
    ];

    return (
        <div className="patients-page">
            {/* Tiêu đề trang */}
            <div className="page-header">
                <h2>QUẢN LÍ BỆNH NHÂN</h2>
            </div>

            {/*Button*/}
            <div className="action-buttons">
                <Button variant="primary" className="me-2">Thêm mới</Button>
                <Button variant="secondary">Bộ lọc</Button>
            </div>

            {/* Bảng danh sách bệnh nhân */}
            <Table bordered hover>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên bệnh nhân</th>
                        <th>Tuổi</th>
                        <th>SĐT</th>
                        <th>Địa chỉ</th>
                        <th>Tình trạng sức khỏe</th>
                        <th>Thuốc đang sử dụng</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {samplePatients.map((patient, index) => (
                        <tr key={patient.id}>
                            <td>{index + 1}</td>
                            <td>{patient.tenBenhNhan}</td>
                            <td>{patient.tuoi}</td>
                            <td>{patient.sdt}</td>
                            <td>{patient.diaChi}</td>
                            <td>
                                <span className={`status-badge ${
                                    patient.tinhTrangSucKhoe === "Ổn định" ? 'status-stable' : 
                                    patient.tinhTrangSucKhoe === "Cần theo dõi" ? 'status-warning' : ''
                                }`}>
                                    {patient.tinhTrangSucKhoe}
                                </span>
                            </td>
                            <td>{patient.thuocDangSuDung}</td>
                            <td className="action-icons">
                                <span className="icon-edit" title="Chỉnh sửa">
                                    <FaEditIcon />
                                </span>
                                <span className="icon-delete" title="Xóa">
                                    <FaTrashIcon />
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default PatientsPage;

