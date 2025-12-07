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
    const initialDrugs = [
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

    const [drugs, setDrugs] = useState(initialDrugs);

    // Hàm xác định tình trạng thuốc
    const getTinhTrang = (soLuong: number, hsd: string): string => {
        const today = new Date();
        const expiryDate = new Date(hsd);
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (soLuong === 0) return "Hết hàng";
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) return "Sắp hết HSD";
        if (soLuong <= 10) return "SL còn ít";
        return "Còn hàng";
    };

    // State bộ lọc
    const [showNameSearch, setShowNameSearch] = useState(false);
    const [nameQuery, setNameQuery] = useState("");
    const [nameInputValue, setNameInputValue] = useState("");
    const nameInputRef = useRef<HTMLInputElement | null>(null);

    const [statusArrowExpanded, setStatusArrowExpanded] = useState(false);
    const statusHeaderRef = useRef<HTMLTableHeaderCellElement | null>(null);
    const statusOptions = useMemo(() => ["Tất cả", "Còn hàng", "Hết hàng", "Sắp hết HSD", "SL còn ít"], []);
    const [selectedStatus, setSelectedStatus] = useState<string>("Tất cả");

    // State cho popup thêm mới thuốc
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [formData, setFormData] = useState({
        tenThuoc: "",
        loaiThuoc: "",
        soLuong: "",
        hsd: "",
        ngayNhap: "",
        nhaCungCap: ""
    });

    // State cho popup chỉnh sửa thuốc
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editFormData, setEditFormData] = useState({
        id: 0,
        tenThuoc: "",
        loaiThuoc: "",
        soLuong: "",
        hsd: "",
        ngayNhap: "",
        nhaCungCap: ""
    });

    // Danh sách loại thuốc
    const loaiThuocOptions = [
        "Giảm đau hạ sốt",
        "Kháng sinh",
        "Vitamin",
        "Giảm đau kháng viêm",
        "Điều trị đau dạ dày",
        "Thuốc dị ứng",
        "Điều trị tiểu đường",
        "Chống đông máu",
        "Hạ mỡ máu",
        "Thuốc hen suyễn"
    ];

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
        return drugs.filter(d => {
            const nameOk = nameQuery.trim() ? d.tenThuoc.toLowerCase().includes(nameQuery.trim().toLowerCase()) : true;
            const statusOk = selectedStatus === 'Tất cả' ? true : d.tinhTrang === selectedStatus;
            return nameOk && statusOk;
        });
    }, [drugs, nameQuery, selectedStatus]);

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

    // Handlers cho popup thêm mới thuốc
    const handleOpenAddPopup = () => {
        setFormData({
            tenThuoc: "",
            loaiThuoc: "",
            soLuong: "",
            hsd: "",
            ngayNhap: "",
            nhaCungCap: ""
        });
        setShowAddPopup(true);
    };

    const handleCloseAddPopup = () => {
        setShowAddPopup(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitAdd = () => {
        // Validate form
        if (!formData.tenThuoc || !formData.loaiThuoc || !formData.soLuong || !formData.hsd || !formData.ngayNhap || !formData.nhaCungCap) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        // Tạo thuốc mới
        const newDrug = {
            id: Math.max(...drugs.map(d => d.id), 0) + 1,
            tenThuoc: formData.tenThuoc,
            loaiThuoc: formData.loaiThuoc,
            soLuong: parseInt(formData.soLuong) || 0,
            hsd: formData.hsd,
            ngayNhap: formData.ngayNhap,
            nhaCungCap: formData.nhaCungCap,
            tinhTrang: getTinhTrang(parseInt(formData.soLuong) || 0, formData.hsd)
        };

        // Thêm vào danh sách
        setDrugs(prev => [...prev, newDrug]);
        
        handleCloseAddPopup();
        alert("Thêm thuốc mới thành công!");
    };

    // Handlers cho popup chỉnh sửa thuốc
    const handleOpenEditPopup = (drug: typeof drugs[0]) => {
        setEditFormData({
            id: drug.id,
            tenThuoc: drug.tenThuoc,
            loaiThuoc: drug.loaiThuoc,
            soLuong: drug.soLuong.toString(),
            hsd: drug.hsd,
            ngayNhap: drug.ngayNhap,
            nhaCungCap: drug.nhaCungCap
        });
        setShowEditPopup(true);
    };

    const handleCloseEditPopup = () => {
        setShowEditPopup(false);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitEdit = () => {
        // Validate form
        if (!editFormData.tenThuoc || !editFormData.loaiThuoc || !editFormData.soLuong || !editFormData.hsd || !editFormData.ngayNhap || !editFormData.nhaCungCap) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        // Cập nhật thuốc
        const updatedDrug = {
            id: editFormData.id,
            tenThuoc: editFormData.tenThuoc,
            loaiThuoc: editFormData.loaiThuoc,
            soLuong: parseInt(editFormData.soLuong) || 0,
            hsd: editFormData.hsd,
            ngayNhap: editFormData.ngayNhap,
            nhaCungCap: editFormData.nhaCungCap,
            tinhTrang: getTinhTrang(parseInt(editFormData.soLuong) || 0, editFormData.hsd)
        };

        // Cập nhật trong danh sách
        setDrugs(prev => prev.map(d => d.id === updatedDrug.id ? updatedDrug : d));
        
        handleCloseEditPopup();
        alert("Cập nhật thông tin thuốc thành công!");
    };

    return (
        <div className="drugs-page">
            {/* Tiêu đề trang */}
            <div className="page-header">
                <h2>QUẢN LÝ THUỐC</h2>
            </div>

            {/*Button*/}
            <div className="action-buttons">
                <Button variant="primary" className="me-2" onClick={handleOpenAddPopup}>THÊM MỚI THUỐC</Button>
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
                                <span className="icon-edit" title="Chỉnh sửa" onClick={() => handleOpenEditPopup(drug)}>
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

            {/* Popup Thêm mới thuốc */}
            {showAddPopup && (
                <div className="drugs-modal-overlay" onClick={handleCloseAddPopup}>
                    <div className="drugs-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Nhập thuốc</div>
                            <span className="close-x" onClick={handleCloseAddPopup} title="Đóng">×</span>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Tên thuốc:</label>
                                    <input
                                        type="text"
                                        name="tenThuoc"
                                        value={formData.tenThuoc}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên thuốc"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Loại thuốc:</label>
                                    <select
                                        name="loaiThuoc"
                                        value={formData.loaiThuoc}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">-- Chọn loại thuốc --</option>
                                        {loaiThuocOptions.map((option, index) => (
                                            <option key={index} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Số lượng:</label>
                                    <input
                                        type="number"
                                        name="soLuong"
                                        value={formData.soLuong}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số lượng"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hạn sử dụng:</label>
                                    <input
                                        type="date"
                                        name="hsd"
                                        value={formData.hsd}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Ngày nhập thuốc:</label>
                                    <input
                                        type="date"
                                        name="ngayNhap"
                                        value={formData.ngayNhap}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nhà cung cấp:</label>
                                    <input
                                        type="text"
                                        name="nhaCungCap"
                                        value={formData.nhaCungCap}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên nhà cung cấp"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-cancel" onClick={handleCloseAddPopup}>
                                Hủy
                            </button>
                            <button className="btn btn-submit" onClick={handleSubmitAdd}>
                                Thêm mới
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup Chỉnh sửa thông tin thuốc */}
            {showEditPopup && (
                <div className="drugs-edit-modal-overlay" onClick={handleCloseEditPopup}>
                    <div className="drugs-edit-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="edit-modal-title">Chỉnh sửa thông tin thuốc</h3>
                        <div className="edit-modal-body">
                            <div className="edit-form-grid">
                                <div className="edit-form-group">
                                    <label>Tên thuốc:</label>
                                    <input
                                        type="text"
                                        name="tenThuoc"
                                        value={editFormData.tenThuoc}
                                        onChange={handleEditInputChange}
                                        placeholder="Nhập tên thuốc"
                                    />
                                </div>
                                <div className="edit-form-group">
                                    <label>Loại thuốc:</label>
                                    <select
                                        name="loaiThuoc"
                                        value={editFormData.loaiThuoc}
                                        onChange={handleEditInputChange}
                                    >
                                        <option value="">-- Chọn loại thuốc --</option>
                                        {loaiThuocOptions.map((option, index) => (
                                            <option key={index} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="edit-form-grid">
                                <div className="edit-form-group">
                                    <label>Số lượng:</label>
                                    <input
                                        type="number"
                                        name="soLuong"
                                        value={editFormData.soLuong}
                                        onChange={handleEditInputChange}
                                        placeholder="Nhập số lượng"
                                        min="0"
                                    />
                                </div>
                                <div className="edit-form-group">
                                    <label>Hạn sử dụng:</label>
                                    <input
                                        type="date"
                                        name="hsd"
                                        value={editFormData.hsd}
                                        onChange={handleEditInputChange}
                                    />
                                </div>
                            </div>
                            <div className="edit-form-grid">
                                <div className="edit-form-group">
                                    <label>Ngày nhập thuốc:</label>
                                    <input
                                        type="date"
                                        name="ngayNhap"
                                        value={editFormData.ngayNhap}
                                        onChange={handleEditInputChange}
                                    />
                                </div>
                                <div className="edit-form-group">
                                    <label>Nhà cung cấp:</label>
                                    <input
                                        type="text"
                                        name="nhaCungCap"
                                        value={editFormData.nhaCungCap}
                                        onChange={handleEditInputChange}
                                        placeholder="Nhập tên nhà cung cấp"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="edit-modal-footer">
                            <button className="edit-btn-cancel" onClick={handleCloseEditPopup}>
                                Hủy
                            </button>
                            <button className="edit-btn-save" onClick={handleSubmitEdit}>
                                Lưu lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrugsPage;
