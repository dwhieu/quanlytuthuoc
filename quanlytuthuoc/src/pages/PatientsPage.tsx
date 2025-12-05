import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { FaEdit, FaTrash, FaSearch, FaAngleRight, FaAngleDown } from "react-icons/fa";
import '../styles/PatientsPage.css';

// Cast icons to component types to satisfy TypeScript
const FaEditIcon = FaEdit as unknown as React.ComponentType<any>;
const FaTrashIcon = FaTrash as unknown as React.ComponentType<any>;
const FaSearchIcon = FaSearch as unknown as React.ComponentType<any>;
const FaAngleRightIcon = FaAngleRight as unknown as React.ComponentType<any>;
const FaAngleDownIcon = FaAngleDown as unknown as React.ComponentType<any>;

// Danh sách thuốc có sẵn (tất cả trừ hết hàng)
const availableDrugs = [
    { id: 1, tenThuoc: "Paracetamol 500mg", soLuong: 150, tinhTrang: "Còn hàng" },
    { id: 2, tenThuoc: "Amoxicillin 500mg", soLuong: 8, tinhTrang: "SL còn ít" },
    { id: 4, tenThuoc: "Ibuprofen 400mg", soLuong: 45, tinhTrang: "Sắp hết HSD" },
    { id: 5, tenThuoc: "Omeprazole 20mg", soLuong: 120, tinhTrang: "Còn hàng" },
    { id: 6, tenThuoc: "Cetirizine 10mg", soLuong: 5, tinhTrang: "SL còn ít" },
    { id: 7, tenThuoc: "Metformin 850mg", soLuong: 200, tinhTrang: "Còn hàng" },
    { id: 8, tenThuoc: "Aspirin 100mg", soLuong: 80, tinhTrang: "Sắp hết HSD" },
    { id: 10, tenThuoc: "Atorvastatin 20mg", soLuong: 6, tinhTrang: "SL còn ít" },
    { id: 11, tenThuoc: "Salbutamol 100mcg", soLuong: 90, tinhTrang: "Còn hàng" }
];

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

    // State bộ lọc
    const [showNameSearch, setShowNameSearch] = useState(false);
    const [showPhoneSearch, setShowPhoneSearch] = useState(false);
    const [nameQuery, setNameQuery] = useState("");
    const [phoneQuery, setPhoneQuery] = useState("");
    // Uncommitted input values
    const [nameInputValue, setNameInputValue] = useState("");
    const [phoneInputValue, setPhoneInputValue] = useState("");

    const [healthArrowExpanded, setHealthArrowExpanded] = useState(false);
    const healthOptions = useMemo(() => ["Tất cả", "Ổn định", "Cần theo dõi"], []);
    const [selectedHealthFilter, setSelectedHealthFilter] = useState<string>("Tất cả");

    const nameInputRef = useRef<HTMLInputElement | null>(null);
    const phoneInputRef = useRef<HTMLInputElement | null>(null);
    const healthHeaderRef = useRef<HTMLTableHeaderCellElement | null>(null);

    useEffect(() => {
        if (showNameSearch) nameInputRef.current?.focus();
        if (showPhoneSearch) phoneInputRef.current?.focus();
    }, [showNameSearch, showPhoneSearch]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!healthArrowExpanded) return;
            const target = e.target as HTMLElement;
            const headerEl = healthHeaderRef.current;
            if (headerEl && target && !headerEl.contains(target)) {
                setHealthArrowExpanded(false);
            }
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, [healthArrowExpanded]);

    const filteredPatients = useMemo(() => {
        return samplePatients.filter(p => {
            const nameOk = nameQuery.trim()
                ? p.tenBenhNhan.toLowerCase().includes(nameQuery.trim().toLowerCase())
                : true;
            const phoneOk = phoneQuery.trim()
                ? p.sdt.includes(phoneQuery.trim())
                : true;
            const healthOk = selectedHealthFilter === "Tất cả" ? true : p.tinhTrangSucKhoe === selectedHealthFilter;
            return nameOk && phoneOk && healthOk;
        });
    }, [samplePatients, nameQuery, phoneQuery, selectedHealthFilter]);

    // Handlers
    const handleToggleNameSearch = () => {
        setShowNameSearch(prev => !prev);
        if (showNameSearch) {
            setNameInputValue("");
        } else {
            setNameInputValue(nameQuery);
        }
    };
    const handleTogglePhoneSearch = () => {
        setShowPhoneSearch(prev => !prev);
        if (showPhoneSearch) {
            setPhoneInputValue("");
        } else {
            setPhoneInputValue(phoneQuery);
        }
    };
    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setNameQuery(nameInputValue.trim());
            // Close popup and clear input after applying filter
            setShowNameSearch(false);
            setNameInputValue("");
        }
    };
    const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setPhoneQuery(phoneInputValue.trim());
            setShowPhoneSearch(false);
            setPhoneInputValue("");
        }
    };
    const handleNameBlur = () => {
        setShowNameSearch(false);
        setNameInputValue("");
    };
    const handlePhoneBlur = () => {
        setShowPhoneSearch(false);
        setPhoneInputValue("");
    };

    const toggleHealthArrow = () => {
        setHealthArrowExpanded(prev => !prev);
    };

    const handleSelectHealth = (opt: string) => {
        setSelectedHealthFilter(opt);
        // Reset mũi tên về '>' như ban đầu
        setHealthArrowExpanded(false);
    };

    return (
        <div className="patients-page">
            {/* Tiêu đề trang */}
            <div className="page-header">
                <h2>QUẢN LÍ BỆNH NHÂN</h2>
            </div>

            {/*Button*/}
            <div className="action-buttons">
                <Button variant="primary" className="me-2">Thêm mới</Button>
                {/*<Button variant="secondary">Bộ lọc</Button>*/}
            </div>

            {/* Bảng danh sách bệnh nhân */}
            <Table bordered hover>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th className="th-with-popup">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <span>Tên bệnh nhân</span>
                                <span className="search-icon" onClick={handleToggleNameSearch} title="Tìm bệnh nhân">
                                    <FaSearchIcon />
                                </span>
                            </div>
                            {showNameSearch && (
                                <div className="search-popup" onMouseDown={e => e.preventDefault()}>
                                    <input
                                        ref={nameInputRef}
                                        type="text"
                                        placeholder="Tìm bệnh nhân"
                                        value={nameInputValue}
                                        onChange={e => setNameInputValue(e.target.value)}
                                        onKeyDown={handleNameKeyDown}
                                        onBlur={handleNameBlur}
                                        className="search-input"
                                    />
                                </div>
                            )}
                        </th>
                        <th>Tuổi</th>
                        <th className="th-with-popup">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <span>SĐT</span>
                                <span className="search-icon" onClick={handleTogglePhoneSearch} title="Tìm số điện thoại">
                                    <FaSearchIcon />
                                </span>
                            </div>
                            {showPhoneSearch && (
                                <div className="search-popup" onMouseDown={e => e.preventDefault()}>
                                    <input
                                        ref={phoneInputRef}
                                        type="text"
                                        placeholder="Tìm số điện thoại"
                                        value={phoneInputValue}
                                        onChange={e => setPhoneInputValue(e.target.value)}
                                        onKeyDown={handlePhoneKeyDown}
                                        onBlur={handlePhoneBlur}
                                        className="search-input"
                                    />
                                </div>
                            )}
                        </th>
                        <th>Địa chỉ</th>
                        <th className="th-with-popup" ref={healthHeaderRef}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                onClick={(e) => { e.stopPropagation(); toggleHealthArrow(); }}
                                title="Lọc tình trạng"
                            >
                                <span>Tình trạng sức khỏe</span>
                                <span style={{ cursor: 'pointer', display: 'inline-flex' }}>
                                    {healthArrowExpanded ? <FaAngleDownIcon /> : <FaAngleRightIcon />}
                                </span>
                            </div>
                            {healthArrowExpanded && (
                                <ul className="health-filter-popup">
                                    {healthOptions.map(opt => (
                                        <li key={opt}
                                            className="health-filter-item"
                                            onClick={(e) => { e.stopPropagation(); handleSelectHealth(opt); }}
                                        >{opt}</li>
                                    ))}
                                </ul>
                            )}
                        </th>
                        <th>Thuốc đang sử dụng</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPatients.map((patient, index) => (
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
                    {filteredPatients.length === 0 && (
                        <tr>
                            <td colSpan={8} style={{ textAlign: 'center', color: '#888' }}>Không có dữ liệu phù hợp</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default PatientsPage;

// Add giao diện Popup để Thêm/Sửa bệnh nhân (thông qua DOM)
declare global { interface Window { __patientsModalsInitialized?: boolean; } }
(function setupPatientsModals() {
    if (window.__patientsModalsInitialized) return;
    window.__patientsModalsInitialized = true;

    const ADD_ID = 'patients-add-modal-overlay';
    const EDIT_ID = 'patients-edit-modal-overlay';

    // Xử lý logic chọn thuốc kê đơn
    const setupPrescriptionHandler = (overlay: HTMLDivElement) => {
        const selectedDrugsMap = new Map<string, { name: string; quantity: number; max: number }>();
        
        const updateSelectedDrugsList = () => {
            const listContainer = overlay.querySelector('.selected-drugs-list') as HTMLElement;
            const hiddenInput = overlay.querySelector('input[name="keDon"]') as HTMLInputElement;
            
            if (selectedDrugsMap.size === 0) {
                listContainer.innerHTML = '<p style="color: #999; font-style: italic; margin-top: 10px;">Chưa có thuốc nào được chọn</p>';
                hiddenInput.value = '';
            } else {
                const drugsList = Array.from(selectedDrugsMap.entries())
                    .map(([id, drug]) => `
                        <div class="selected-drug-item" data-drug-id="${id}">
                            <span class="drug-info">${drug.name} - SL: ${drug.quantity}</span>
                            <button type="button" class="btn-remove-drug" data-drug-id="${id}">×</button>
                        </div>
                    `).join('');
                listContainer.innerHTML = drugsList;
                
                // Cập nhật hidden input
                const drugsText = Array.from(selectedDrugsMap.values())
                    .map(drug => `${drug.name} (${drug.quantity})`)
                    .join(', ');
                hiddenInput.value = drugsText;
            }
        };
        
        // Xử lý thêm thuốc
        overlay.querySelector('.btn-add-drug')?.addEventListener('click', () => {
            const selectEl = overlay.querySelector('.drug-select') as HTMLSelectElement;
            const quantityEl = overlay.querySelector('.quantity-input') as HTMLInputElement;
            
            const selectedOption = selectEl.options[selectEl.selectedIndex];
            const drugId = selectedOption.value;
            const drugName = selectedOption.getAttribute('data-name') || '';
            const maxQuantity = parseInt(selectedOption.getAttribute('data-max') || '0');
            const quantity = parseInt(quantityEl.value);
            
            if (!drugId) {
                alert('Vui lòng chọn thuốc');
                return;
            }
            if (!quantity || quantity <= 0) {
                alert('Vui lòng nhập số lượng hợp lệ');
                return;
            }
            if (quantity > maxQuantity) {
                alert('Số lượng vượt quá tồn kho (Còn: ' + maxQuantity + ')');
                return;
            }
            
            selectedDrugsMap.set(drugId, { name: drugName, quantity, max: maxQuantity });
            updateSelectedDrugsList();
            
            // Reset form
            selectEl.selectedIndex = 0;
            quantityEl.value = '';
        });
        
        // Xử lý xóa thuốc khỏi danh sách
        overlay.querySelector('.selected-drugs-list')?.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement);
            if (target.classList.contains('btn-remove-drug')) {
                const drugId = target.getAttribute('data-drug-id');
                if (drugId) {
                    selectedDrugsMap.delete(drugId);
                    updateSelectedDrugsList();
                }
            }
        });
        
        // Khởi tạo danh sách rỗng
        updateSelectedDrugsList();
    };

    const ensureModal = (type: 'add' | 'edit') => {
        const overlayId = type === 'add' ? ADD_ID : EDIT_ID;
        let overlay = document.getElementById(overlayId);
        if (overlay) return overlay as HTMLDivElement;

        // Handle listener để đóng popup
        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.className = 'patients-modal-overlay';
        overlay.innerHTML = `
          <div class="patients-modal" role="dialog" aria-modal="true">
            <div class="modal-header">
              <div class="modal-title">${type === 'add' ? 'Thêm mới bệnh nhân' : 'Chỉnh sửa thông tin bệnh nhân'}</div>
              <span class="close-x" title="Đóng">×</span>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Tên bệnh nhân</label>
                <input type="text" name="tenBenhNhan" placeholder="Nhập tên bệnh nhân" />
              </div>
              <div class="form-grid">
                <div class="col form-group">
                  <label>Tuổi</label>
                  <input type="number" name="tuoi" placeholder="Nhập tuổi" />
                </div>
                <div class="col form-group">
                  <label>SĐT</label>
                  <input type="tel" name="sdt" placeholder="Nhập số điện thoại" />
                </div>
              </div>
              <div class="form-group">
                <label>Địa chỉ</label>
                <input type="text" name="diaChi" placeholder="Nhập địa chỉ" />
              </div>
              <div class="form-group">
                <label>Tình trạng sức khỏe</label>
                <select name="tinhTrangSucKhoe" class="health-status-select">
                  <option value="">-- Chọn tình trạng --</option>
                  <option value="Ổn định">Ổn định</option>
                  <option value="Cần theo dõi">Cần theo dõi</option>
                </select>
              </div>
              <div class="form-group">
                <label>Kê đơn</label>
                <div class="prescription-selector">
                  <div class="prescription-input-group">
                    <select class="drug-select" name="selectedDrug">
                      <option value="">-- Chọn thuốc --</option>
                      ${availableDrugs.map(drug => 
                        `<option value="${drug.id}" data-name="${drug.tenThuoc}" data-max="${drug.soLuong}" data-status="${drug.tinhTrang}">
                          ${drug.tenThuoc} - Còn: ${drug.soLuong} (${drug.tinhTrang})
                        </option>`
                      ).join('')}
                    </select>
                    <input type="number" class="quantity-input" placeholder="SL" min="1" />
                    <button type="button" class="btn-add-drug">Thêm</button>
                  </div>
                  <div class="selected-drugs-list"></div>
                  <input type="hidden" name="keDon" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-cancel">Hủy</button>
              <button class="btn btn-submit">${type === 'add' ? 'Thêm mới' : 'Lưu lại'}</button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);


        overlay.addEventListener('click', (ev) => {
            const t = ev.target as HTMLElement;
            if (t.classList.contains('patients-modal-overlay') || t.classList.contains('btn-cancel') || t.classList.contains('close-x')) {
                overlay!.classList.remove('show');
            }
        });
        // Handler click cho nút .btn-submit để đóng popup
        overlay.querySelector('.btn-submit')?.addEventListener('click', () => {
            overlay!.classList.remove('show');
        });

        // Xử lý thêm thuốc vào kê đơn
        setupPrescriptionHandler(overlay as HTMLDivElement);

        return overlay as HTMLDivElement;
    };

    const openAddModal = () => {
        const overlay = ensureModal('add');
        // Reset các fields
        overlay.querySelectorAll('input, textarea').forEach((el) => ((el as HTMLInputElement).value = ''));
        // Reset all select elements
        overlay.querySelectorAll('select').forEach((el) => ((el as HTMLSelectElement).selectedIndex = 0));
        // Reset selected drugs list
        const listContainer = overlay.querySelector('.selected-drugs-list') as HTMLElement;
        if (listContainer) {
            listContainer.innerHTML = '<p style="color: #999; font-style: italic; margin-top: 10px;">Chưa có thuốc nào được chọn</p>';
        }
        overlay.classList.add('show');
    };

    const openEditModal = (data: { tenBenhNhan: string; tuoi: string; sdt: string; diaChi: string; tinhTrangSucKhoe: string }) => {
        const overlay = ensureModal('edit');
        (overlay.querySelector('input[name="tenBenhNhan"]') as HTMLInputElement).value = data.tenBenhNhan || '';
        (overlay.querySelector('input[name="tuoi"]') as HTMLInputElement).value = data.tuoi || '';
        (overlay.querySelector('input[name="sdt"]') as HTMLInputElement).value = data.sdt || '';
        (overlay.querySelector('input[name="diaChi"]') as HTMLInputElement).value = data.diaChi || '';
        
        // Set tình trạng sức khỏe (select element)
        const healthSelect = overlay.querySelector('select[name="tinhTrangSucKhoe"]') as HTMLSelectElement;
        if (healthSelect) {
            healthSelect.value = data.tinhTrangSucKhoe || '';
        }
        
        // Reset drug selector
        const selectEl = overlay.querySelector('.drug-select') as HTMLSelectElement;
        if (selectEl) selectEl.selectedIndex = 0;
        // Reset selected drugs list
        const listContainer = overlay.querySelector('.selected-drugs-list') as HTMLElement;
        if (listContainer) {
            listContainer.innerHTML = '<p style="color: #999; font-style: italic; margin-top: 10px;">Chưa có thuốc nào được chọn</p>';
        }
        overlay.classList.add('show');
    };

    // Giới hạn phạm vi click trong trang bệnh nhân
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target) return;
        const scope = target.closest('.patients-page');
        if (!scope) return;

        // Thêm mới button
        const addBtn = target.closest('.action-buttons button');
        if (addBtn && addBtn.textContent?.trim() === 'Thêm mới') {
            openAddModal();
            return;
        }

        // Edit icon
        const editIcon = target.closest('.icon-edit');
        if (editIcon) {
            const row = editIcon.closest('tr');
            if (row) {
                const cells = Array.from(row.querySelectorAll('td'));
                const tenBenhNhan = cells[1]?.textContent?.trim() || '';
                const tuoi = cells[2]?.textContent?.trim() || '';
                const sdt = cells[3]?.textContent?.trim() || '';
                const diaChi = cells[4]?.textContent?.trim() || '';
                // Tình trạng sức khỏe
                const tinhTrangContainer = cells[5];
                let tinhTrang = '';
                if (tinhTrangContainer) {
                    const span = tinhTrangContainer.querySelector('span');
                    tinhTrang = (span?.textContent || tinhTrangContainer.textContent || '').trim();
                }
                openEditModal({ tenBenhNhan, tuoi, sdt, diaChi, tinhTrangSucKhoe: tinhTrang });
            }
            return;
        }
    });
})();
