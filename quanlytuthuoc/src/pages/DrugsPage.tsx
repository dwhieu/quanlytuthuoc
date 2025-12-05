import React, { useMemo, useRef, useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import { FaEdit, FaTrash, FaSearch, FaAngleRight, FaAngleDown } from "react-icons/fa";
import '../styles/DrugsPage.css';

// Cast icons to component types to satisfy TypeScript
const FaEditIcon = FaEdit as unknown as React.ComponentType<any>;
const FaTrashIcon = FaTrash as unknown as React.ComponentType<any>;
const FaSearchIcon = FaSearch as unknown as React.ComponentType<any>;
const FaAngleRightIcon = FaAngleRight as unknown as React.ComponentType<any>;
const FaAngleDownIcon = FaAngleDown as unknown as React.ComponentType<any>;

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
        },
        {
            id: 11,
            tenThuoc: "Salbutamol 100mcg",
            loaiThuoc: "Thuốc hen suyễn",
            soLuong: 90,
            hsd: "2025-10-10",
            ngayNhap: "2024-03-05",
            nhaCungCap: "Công ty Dược phẩm Hà Nội",
            tinhTrang: "Còn hàng"
        }
    ];

    // State bộ lọc
    const [showNameSearch, setShowNameSearch] = useState(false);
    const [nameQuery, setNameQuery] = useState("");
    const [nameInputValue, setNameInputValue] = useState("");
    const nameInputRef = useRef<HTMLInputElement | null>(null);

    const [statusArrowExpanded, setStatusArrowExpanded] = useState(false);
    const statusHeaderRef = useRef<HTMLTableHeaderCellElement | null>(null);
    const statusOptions = useMemo(() => ["Tất cả", "Còn hàng", "Hết hàng", "Sắp hết HSD", "SL còn ít"], []);
    const [selectedStatus, setSelectedStatus] = useState<string>("Tất cả");

    useEffect(() => { if (showNameSearch) nameInputRef.current?.focus(); }, [showNameSearch]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!statusArrowExpanded) return;
            const target = e.target as HTMLElement;
            const headerEl = statusHeaderRef.current;
            if (headerEl && target && !headerEl.contains(target)) {
                setStatusArrowExpanded(false);
            }
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, [statusArrowExpanded]);

    const filteredDrugs = useMemo(() => {
        return sampleDrugs.filter(d => {
            const nameOk = nameQuery.trim() ? d.tenThuoc.toLowerCase().includes(nameQuery.trim().toLowerCase()) : true;
            const statusOk = selectedStatus === 'Tất cả' ? true : d.tinhTrang === selectedStatus;
            return nameOk && statusOk;
        });
    }, [sampleDrugs, nameQuery, selectedStatus]);

    // Handlers
    const toggleNameSearch = () => {
        setShowNameSearch(prev => !prev);
        if (showNameSearch) {
            setNameInputValue("");
        } else {
            setNameInputValue(nameQuery);
        }
    };
    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setNameQuery(nameInputValue.trim());
            setShowNameSearch(false);
            setNameInputValue("");
        }
    };
    const handleNameBlur = () => {
        setShowNameSearch(false);
        setNameInputValue("");
    };

    const toggleStatusArrow = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setStatusArrowExpanded(prev => !prev);
    };
    const handleSelectStatus = (opt: string) => {
        setSelectedStatus(opt);
        setStatusArrowExpanded(false);
    };

    return (
        <div className="drugs-page">
            {/* Tiêu đề trang */}
            <div className="page-header">
                <h2>QUẢN LÝ THUỐC</h2>
            </div>

            {/*Button*/}
            <div className="action-buttons">
                <Button variant="primary" className="me-2">THÊM MỚI THUỐC</Button>
                {/*<Button variant="secondary">Bộ Lọc</Button>*/}
            </div>

            {/* Bảng danh sách thuốc */}
            <Table bordered hover>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th className="th-with-popup">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <span>Tên Thuốc</span>
                                <span className="search-icon" onClick={toggleNameSearch} title="Tìm tên thuốc">
                                    <FaSearchIcon />
                                </span>
                            </div>
                            {showNameSearch && (
                                <div className="search-popup" onMouseDown={e => e.preventDefault()}>
                                    <input
                                        ref={nameInputRef}
                                        type="text"
                                        placeholder="Tìm tên thuốc"
                                        value={nameInputValue}
                                        onChange={e => setNameInputValue(e.target.value)}
                                        onKeyDown={handleNameKeyDown}
                                        onBlur={handleNameBlur}
                                        className="search-input"
                                    />
                                </div>
                            )}
                        </th>
                        <th>Loại Thuốc</th>
                        <th>Số lượng</th>
                        <th>HSD</th>
                        <th>Ngày Nhập thuốc</th>
                        <th>Nhà Cung Cấp</th>
                        <th className="th-with-popup" ref={statusHeaderRef}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={toggleStatusArrow} title="Lọc tình trạng">
                                <span>Tình Trạng thuốc</span>
                                <span style={{ cursor: 'pointer', display: 'inline-flex' }}>
                                    {statusArrowExpanded ? <FaAngleDownIcon /> : <FaAngleRightIcon />}
                                </span>
                            </div>
                            {statusArrowExpanded && (
                                <ul className="health-filter-popup" onMouseDown={e => e.preventDefault()}>
                                    {statusOptions.map(opt => (
                                        <li key={opt} className="health-filter-item" onClick={() => handleSelectStatus(opt)}>{opt}</li>
                                    ))}
                                </ul>
                            )}
                        </th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDrugs.map((drug, index) => (
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
                    {filteredDrugs.length === 0 && (
                        <tr>
                            <td colSpan={9} style={{ textAlign: 'center', color: '#888' }}>Không có dữ liệu phù hợp</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default DrugsPage;
