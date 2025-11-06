import React from "react";
import { Button, Table } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import '../styles/DrugsPage.css';

// Cast icons to component types to satisfy TypeScript
const FaEditIcon = FaEdit as unknown as React.ComponentType<any>;
const FaTrashIcon = FaTrash as unknown as React.ComponentType<any>;

const DrugsPage: React.FC = () => {
    //Data thuốc mẫu
    const sampleDrugs = [
        { 
            id: 1,
            tenThuoc: "Paracetamol 500mg",
            loaiThuoc: "Giảm đau hạ sốt",
            soLuong: 150,
            hsd: "2025-12-31",
            ngayNhap: "2024-01-15",
            nhaCungCap: "Công ty Dược phẩm ABC",
            tinhTrang: "Còn hàng"
        },
        {
            id: 2,
            tenThuoc: "Amoxicillin 500mg",
            loaiThuoc: "Kháng sinh",
            soLuong: 8,
            hsd: "2025-06-30",
            ngayNhap: "2024-02-20",
            nhaCungCap: "Công ty Dược phẩm XYZ",
            tinhTrang: "SL còn ít"
        },
        {
            id: 3,
            tenThuoc: "Vitamin C 1000mg",
            loaiThuoc: "Vitamin",
            soLuong: 0,
            hsd: "2025-08-15",
            ngayNhap: "2023-03-10",
            nhaCungCap: "Công ty Dược phẩm 123",
            tinhTrang: "Hết hàng"
        },
        {
            id: 4,
            tenThuoc: "Ibuprofen 400mg",
            loaiThuoc: "Giảm đau kháng viêm",
            soLuong: 45,
            hsd: "2024-12-20",
            ngayNhap: "2023-11-05",
            nhaCungCap: "Công ty Dược ABC",
            tinhTrang: "Sắp hết HSD"
        },
        {
            id: 5,
            tenThuoc: "Omeprazole 20mg",
            loaiThuoc: "Điều trị đau dạ dày",
            soLuong: 120,
            hsd: "2026-03-10",
            ngayNhap: "2024-05-15",
            nhaCungCap: "Công ty Dược phẩm DEF",
            tinhTrang: "Còn hàng"
        },
        {
            id: 6,
            tenThuoc: "Cetirizine 10mg",
            loaiThuoc: "Thuốc dị ứng",
            soLuong: 5,
            hsd: "2025-09-30",
            ngayNhap: "2024-01-20",
            nhaCungCap: "Công ty Dược XYZ",
            tinhTrang: "SL còn ít"
        },
        {
            id: 7,
            tenThuoc: "Metformin 850mg",
            loaiThuoc: "Điều trị tiểu đường",
            soLuong: 200,
            hsd: "2025-11-25",
            ngayNhap: "2024-06-10",
            nhaCungCap: "Công ty Dược Việt",
            tinhTrang: "Còn hàng"
        },
        {
            id: 8,
            tenThuoc: "Aspirin 100mg",
            loaiThuoc: "Chống đông máu",
            soLuong: 80,
            hsd: "2024-12-05",
            ngayNhap: "2023-10-15",
            nhaCungCap: "Công ty Dược 123",
            tinhTrang: "Sắp hết HSD"
        },
        {
            id: 9,
            tenThuoc: "Loratadine 10mg",
            loaiThuoc: "Thuốc dị ứng",
            soLuong: 0,
            hsd: "2025-07-20",
            ngayNhap: "2023-08-01",
            nhaCungCap: "Công ty Dược ABC",
            tinhTrang: "Hết hàng"
        },
        {
            id: 10,
            tenThuoc: "Atorvastatin 20mg",
            loaiThuoc: "Hạ mỡ máu",
            soLuong: 6,
            hsd: "2026-02-15",
            ngayNhap: "2024-08-10",
            nhaCungCap: "Công ty Dược Phương Đông",
            tinhTrang: "SL còn ít"
        }
    ];

    return (
        <div className="drugs-page">
            {/* Tiêu đề trang */}
            <div className="page-header">
                <h2>QUẢN LÝ THUỐC</h2>
            </div>

            {/*Button*/}
            <div className="action-buttons">
                <Button variant="primary" className="me-2">Thêm Thuốc Mới</Button>
                <Button variant="secondary">Bộ lọc</Button>
            </div>

            {/* Bảng danh sách thuốc */}
            <Table bordered hover>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên Thuốc</th>
                        <th>Loại Thuốc</th>
                        <th>Số lượng</th>
                        <th>HSD</th>
                        <th>Ngày Nhập thuốc</th>
                        <th>Nhà Cung Cấp</th>
                        <th>Tình Trạng thuốc</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {sampleDrugs.map((drug, index) => (
                        <tr key={drug.id}>
                            <td>{index + 1}</td>
                            <td>{drug.tenThuoc}</td>
                            <td>{drug.loaiThuoc}</td>
                            <td>{drug.soLuong}</td>
                            <td>{drug.hsd}</td>
                            <td>{drug.ngayNhap}</td>
                            <td>{drug.nhaCungCap}</td>
                            <td>
                                <span className={`status-badge ${
                                    drug.tinhTrang === "Còn hàng" ? 'status-available' : 
                                    drug.tinhTrang === "Hết hàng" ? 'status-unavailable' : 
                                    drug.tinhTrang === "Sắp hết HSD" ? 'status-expiring' :
                                    drug.tinhTrang === "SL còn ít" ? 'status-low' : ''
                                }`}>
                                    {drug.tinhTrang}
                                </span>
                            </td>
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

export default DrugsPage;
                            
                           