import React, { useMemo, useRef, useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import { FaEdit, FaTrash, FaSearch, FaAngleRight, FaAngleDown } from "react-icons/fa";
import '../styles/DrugsPage.css';

type Drug = {
    id: number;
    tenThuoc: string;
    loaiThuoc: string;
    soLuong: number;
    hsd: string;
    ngayNhap: string;
    nhaCungCap: string;
    tinhTrang: string;
};

const API_BASE = "http://localhost:8000/api";

// Cast icons to component types to satisfy TypeScript
const FaEditIcon = FaEdit as unknown as React.ComponentType<any>;
const FaTrashIcon = FaTrash as unknown as React.ComponentType<any>;
const FaSearchIcon = FaSearch as unknown as React.ComponentType<any>;
const FaAngleRightIcon = FaAngleRight as unknown as React.ComponentType<any>;
const FaAngleDownIcon = FaAngleDown as unknown as React.ComponentType<any>;

const DrugsPage: React.FC = () => {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        const loadDrugs = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/drugs`);
                if (!res.ok) {
                    throw new Error(await res.text());
                }
                const data = await res.json();
                setDrugs(Array.isArray(data) ? data : []);
                setError(null);
            } catch (err) {
                setError('Không tải được dữ liệu thuốc');
            } finally {
                setLoading(false);
            }
        };
        loadDrugs();
    }, []);

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

    const handleSubmitAdd = async () => {
        if (!formData.tenThuoc || !formData.loaiThuoc || !formData.soLuong || !formData.hsd || !formData.ngayNhap || !formData.nhaCungCap) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        const payload = {
            tenThuoc: formData.tenThuoc,
            loaiThuoc: formData.loaiThuoc,
            soLuong: parseInt(formData.soLuong) || 0,
            hsd: formData.hsd,
            ngayNhap: formData.ngayNhap,
            nhaCungCap: formData.nhaCungCap
        };

        try {
            const res = await fetch(`${API_BASE}/drugs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            const created: Drug = await res.json();
            setDrugs(prev => [...prev, created]);
            handleCloseAddPopup();
            alert("Thêm thuốc mới thành công!");
        } catch (err) {
            alert("Không thể thêm thuốc. Vui lòng thử lại.");
        }
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

    const handleSubmitEdit = async () => {
        if (!editFormData.tenThuoc || !editFormData.loaiThuoc || !editFormData.soLuong || !editFormData.hsd || !editFormData.ngayNhap || !editFormData.nhaCungCap) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        const payload = {
            tenThuoc: editFormData.tenThuoc,
            loaiThuoc: editFormData.loaiThuoc,
            soLuong: parseInt(editFormData.soLuong) || 0,
            hsd: editFormData.hsd,
            ngayNhap: editFormData.ngayNhap,
            nhaCungCap: editFormData.nhaCungCap
        };

        try {
            const res = await fetch(`${API_BASE}/drugs/${editFormData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            const updated: Drug = await res.json();
            setDrugs(prev => prev.map(d => d.id === updated.id ? updated : d));
            handleCloseEditPopup();
            alert("Cập nhật thông tin thuốc thành công!");
        } catch (err) {
            alert("Không thể cập nhật thuốc. Vui lòng thử lại.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Xóa thuốc này?")) return;
        try {
            const res = await fetch(`${API_BASE}/drugs/${id}`, { method: 'DELETE' });
            if (!res.ok && res.status !== 204) {
                throw new Error('Delete failed');
            }
            setDrugs(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            alert("Không thể xóa thuốc. Vui lòng thử lại.");
        }
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

            {error && <div style={{ color: '#dc3545', marginBottom: 12 }}>{error}</div>}
            {loading && <div style={{ marginBottom: 12 }}>Đang tải dữ liệu...</div>}

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
                                <span className="icon-delete" title="Xóa" onClick={() => handleDelete(drug.id)}>
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
