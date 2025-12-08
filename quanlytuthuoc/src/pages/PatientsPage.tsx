import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { FaEdit, FaTrash, FaSearch, FaAngleRight, FaAngleDown } from "react-icons/fa";
import '../styles/PatientsPage.css';

type Patient = {
    id: number;
    tenBenhNhan: string;
    tuoi: number;
    sdt: string;
    diaChi: string;
    tinhTrangSucKhoe: string;
    thuocDangSuDung: string;
    createdAt?: string;
};

type DrugOption = {
    id: number;
    tenThuoc: string;
    soLuong: number;
    tinhTrang: string;
};

const API_BASE = "http://localhost:8000/api";

// Cast icons to component types to satisfy TypeScript
const FaEditIcon = FaEdit as unknown as React.ComponentType<any>;
const FaTrashIcon = FaTrash as unknown as React.ComponentType<any>;
const FaSearchIcon = FaSearch as unknown as React.ComponentType<any>;
const FaAngleRightIcon = FaAngleRight as unknown as React.ComponentType<any>;
const FaAngleDownIcon = FaAngleDown as unknown as React.ComponentType<any>;

const PatientsPage: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [drugs, setDrugs] = useState<DrugOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const loadPatients = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/patients`);
            if (!res.ok) {
                throw new Error(await res.text());
            }
            const data = await res.json();
            setPatients(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError('Không tải được dữ liệu bệnh nhân');
        } finally {
            setLoading(false);
        }
    }, []);

    const upsertPatient = useCallback((incoming: Patient) => {
        if (!incoming || typeof incoming.id !== 'number') return;
        setPatients(prev => {
            const index = prev.findIndex(p => p.id === incoming.id);
            if (index >= 0) {
                const clone = prev.slice();
                clone[index] = incoming;
                return clone;
            }
            return [...prev, incoming];
        });
    }, []);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    useEffect(() => {
        const loadDrugs = async () => {
            try {
                const res = await fetch(`${API_BASE}/drugs`);
                if (!res.ok) {
                    throw new Error(await res.text());
                }
                const data = await res.json();
                const normalized: DrugOption[] = Array.isArray(data)
                    ? data.map((drug: any) => ({
                        id: drug.id,
                        tenThuoc: drug.tenThuoc,
                        soLuong: drug.soLuong ?? 0,
                        tinhTrang: drug.tinhTrang ?? ""
                    }))
                    : [];
                setDrugs(normalized);
            } catch (err) {
                setDrugs([]);
            }
        };
        loadDrugs();
    }, []);

    useEffect(() => {
        window.__setPatientsAvailableDrugs?.(drugs);
    }, [drugs]);

    useEffect(() => {
        return () => {
            window.__setPatientsAvailableDrugs?.([]);
        };
    }, []);

    useEffect(() => {
        window.__refreshPatientsList = loadPatients;
        return () => {
            if (window.__refreshPatientsList === loadPatients) {
                window.__refreshPatientsList = undefined;
            }
        };
    }, [loadPatients]);

    useEffect(() => {
        window.__upsertPatient = upsertPatient;
        return () => {
            if (window.__upsertPatient === upsertPatient) {
                window.__upsertPatient = undefined;
            }
        };
    }, [upsertPatient]);

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
        return patients.filter(p => {
            const nameOk = nameQuery.trim()
                ? p.tenBenhNhan.toLowerCase().includes(nameQuery.trim().toLowerCase())
                : true;
            const phoneOk = phoneQuery.trim()
                ? p.sdt.includes(phoneQuery.trim())
                : true;
            const healthOk = selectedHealthFilter === "Tất cả" ? true : p.tinhTrangSucKhoe === selectedHealthFilter;
            return nameOk && phoneOk && healthOk;
        });
    }, [patients, nameQuery, phoneQuery, selectedHealthFilter]);

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

            {error && <div style={{ color: '#dc3545', marginBottom: 12 }}>{error}</div>}
            {loading && <div style={{ marginBottom: 12 }}>Đang tải dữ liệu...</div>}

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
                        <tr key={patient.id} data-patient-id={patient.id}>
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
declare global {
    interface Window {
        __patientsModalsInitialized?: boolean;
        __setPatientsAvailableDrugs?: (drugs: DrugOption[]) => void;
        __refreshPatientsList?: () => void;
        __upsertPatient?: (patient: Patient) => void;
    }
}
(function setupPatientsModals() {
    if (window.__patientsModalsInitialized) return;
    window.__patientsModalsInitialized = true;

    let availableDrugs: DrugOption[] = [];

    const ADD_ID = 'patients-add-modal-overlay';
    const EDIT_ID = 'patients-edit-modal-overlay';

    const escapeAttribute = (value: string) => value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const escapeHtml = (value: string) => value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const renderDrugOptions = (selectEl: HTMLSelectElement) => {
        const placeholder = '<option value="">-- Chọn thuốc --</option>';
        const options = availableDrugs
            .map(drug => {
                const name = (drug.tenThuoc ?? '').toString();
                const quantity = Number.isFinite(drug.soLuong) ? drug.soLuong : 0;
                const status = (drug.tinhTrang ?? '').toString();
                const safeNameAttr = escapeAttribute(name);
                const safeStatusAttr = escapeAttribute(status);
                const safeNameText = escapeHtml(name);
                const safeStatusText = escapeHtml(status);
                return `<option value="${drug.id}" data-name="${safeNameAttr}" data-max="${quantity}" data-status="${safeStatusAttr}">${safeNameText} - Còn: ${quantity} (${safeStatusText})</option>`;
            })
            .join('');
        selectEl.innerHTML = placeholder + options;
    };

    const populateDrugSelect = (overlay: HTMLDivElement) => {
        const selectEl = overlay.querySelector('.drug-select') as HTMLSelectElement | null;
        if (!selectEl) return;
        const previousValue = selectEl.value;
        renderDrugOptions(selectEl);
        if (previousValue && Array.isArray(availableDrugs) && availableDrugs.some(drug => String(drug.id) === previousValue)) {
            selectEl.value = previousValue;
        }
    };

    window.__setPatientsAvailableDrugs = (drugs: DrugOption[]) => {
        availableDrugs = Array.isArray(drugs) ? drugs : [];
        [document.getElementById(ADD_ID), document.getElementById(EDIT_ID)]
            .forEach((overlay) => {
                if (overlay) {
                    populateDrugSelect(overlay as HTMLDivElement);
                }
            });
    };

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
                            <span class="drug-info">${escapeHtml(drug.name)} - SL: ${drug.quantity}</span>
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

        (overlay as any).__patientsSelectedDrugs = selectedDrugsMap;
        (overlay as any).__updatePatientsSelectedDrugsList = updateSelectedDrugsList;
        
        // Xử lý thêm thuốc
        overlay.querySelector('.btn-add-drug')?.addEventListener('click', () => {
            const selectEl = overlay.querySelector('.drug-select') as HTMLSelectElement;
            const quantityEl = overlay.querySelector('.quantity-input') as HTMLInputElement;
            
            const selectedOption = selectEl.options[selectEl.selectedIndex];
            const drugId = selectedOption ? selectedOption.value : '';
            const matchedDrug = availableDrugs.find(drug => String(drug.id) === drugId);
            const drugName = matchedDrug ? matchedDrug.tenThuoc : '';
            const maxQuantity = matchedDrug ? Math.max(0, matchedDrug.soLuong ?? 0) : 0;
            const quantity = parseInt(quantityEl.value);
            
            if (!drugId) {
                alert('Vui lòng chọn thuốc');
                return;
            }
            if (!matchedDrug) {
                alert('Thuốc không hợp lệ, vui lòng chọn lại');
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
                const existing = document.getElementById(overlayId) as HTMLDivElement | null;
                if (existing) return existing;

                // Handle listener để đóng popup
                const overlayElement = document.createElement('div');
                overlayElement.id = overlayId;
                overlayElement.className = 'patients-modal-overlay';
                overlayElement.innerHTML = `
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
        document.body.appendChild(overlayElement);

        populateDrugSelect(overlayElement);


        overlayElement.addEventListener('click', (ev) => {
            const t = ev.target as HTMLElement;
            if (t.classList.contains('patients-modal-overlay') || t.classList.contains('btn-cancel') || t.classList.contains('close-x')) {
                overlayElement.classList.remove('show');
            }
        });

        const submitBtn = overlayElement.querySelector('.btn-submit') as HTMLButtonElement | null;
        if (submitBtn) {
            submitBtn.addEventListener('click', async (event) => {
                event.preventDefault();
                if (submitBtn.disabled) return;

                const tenBenhNhan = (overlayElement.querySelector('input[name="tenBenhNhan"]') as HTMLInputElement)?.value.trim();
                const tuoiValue = (overlayElement.querySelector('input[name="tuoi"]') as HTMLInputElement)?.value.trim();
                const sdt = (overlayElement.querySelector('input[name="sdt"]') as HTMLInputElement)?.value.trim();
                const diaChi = (overlayElement.querySelector('input[name="diaChi"]') as HTMLInputElement)?.value.trim();
                const tinhTrangSucKhoe = (overlayElement.querySelector('select[name="tinhTrangSucKhoe"]') as HTMLSelectElement)?.value || '';
                const hiddenInput = overlayElement.querySelector('input[name="keDon"]') as HTMLInputElement | null;
                const selectedDrugsMap = (overlayElement as any).__patientsSelectedDrugs as Map<string, { name: string; quantity: number; max: number }> | undefined;

                const normalizedTuoi = tuoiValue ? parseInt(tuoiValue, 10) : undefined;
                const thuocDangSuDung = selectedDrugsMap && selectedDrugsMap.size > 0
                    ? Array.from(selectedDrugsMap.values()).map(drug => `${drug.name} (${drug.quantity})`).join(', ')
                    : (hiddenInput?.value?.trim() || '');

                if (!tenBenhNhan) {
                    alert('Vui lòng nhập tên bệnh nhân');
                    return;
                }

                if (normalizedTuoi !== undefined && (!Number.isFinite(normalizedTuoi) || normalizedTuoi <= 0)) {
                    alert('Vui lòng nhập tuổi hợp lệ');
                    return;
                }

                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang lưu...';

                try {
                    const payload: Record<string, unknown> = {
                        tenBenhNhan,
                        tuoi: Number.isFinite(normalizedTuoi as number) ? normalizedTuoi : null,
                        sdt,
                        diaChi,
                        tinhTrangSucKhoe,
                        thuocDangSuDung
                    };

                    const overlayState = overlayElement as any;
                    const patientId = overlayState.__editingPatientId as string | undefined;
                    const isEdit = type === 'edit' && patientId;

                    const response = await fetch(isEdit ? `${API_BASE}/patients/${patientId}` : `${API_BASE}/patients`, {
                        method: isEdit ? 'PUT' : 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const bodyText = await response.text();
                        const errorMessage = bodyText || `Không thể lưu bệnh nhân (HTTP ${response.status})`;
                        throw new Error(errorMessage);
                    }

                    let savedPatient: Patient | null = null;
                    const responseContentType = response.headers.get('content-type') || '';
                    if (responseContentType.includes('application/json')) {
                        try {
                            savedPatient = await response.json();
                        } catch {
                            savedPatient = null;
                        }
                    }
                    if (savedPatient) {
                        window.__upsertPatient?.(savedPatient);
                    }

                    overlayElement.classList.remove('show');
                    if (window.__refreshPatientsList) {
                        await window.__refreshPatientsList();
                    }
                } catch (error: any) {
                    const rawMessage = error?.message || 'Không thể lưu bệnh nhân';
                    alert(rawMessage);
                    console.error('Failed to save patient:', error);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = type === 'add' ? 'Thêm mới' : 'Lưu lại';
                }
            });
        }

        // Xử lý thêm thuốc vào kê đơn
        setupPrescriptionHandler(overlayElement);

        return overlayElement;
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
        populateDrugSelect(overlay as HTMLDivElement);
        const selectedMap = (overlay as any).__patientsSelectedDrugs as Map<string, { name: string; quantity: number; max: number }> | undefined;
        const updateList = (overlay as any).__updatePatientsSelectedDrugsList as (() => void) | undefined;
        if (selectedMap) selectedMap.clear();
        updateList?.();
        (overlay as any).__editingPatientId = undefined;
        overlay.classList.add('show');
    };

    const openEditModal = (data: { id?: string; tenBenhNhan: string; tuoi: string; sdt: string; diaChi: string; tinhTrangSucKhoe: string; thuocDangSuDung: string }) => {
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
        populateDrugSelect(overlay as HTMLDivElement);
        const hiddenInput = overlay.querySelector('input[name="keDon"]') as HTMLInputElement | null;
        const rawPrescription = data.thuocDangSuDung || '';
        if (hiddenInput) {
            hiddenInput.value = rawPrescription;
        }
        const selectedMap = (overlay as any).__patientsSelectedDrugs as Map<string, { name: string; quantity: number; max: number }> | undefined;
        const updateList = (overlay as any).__updatePatientsSelectedDrugsList as (() => void) | undefined;
        if (selectedMap) {
            selectedMap.clear();
            if (rawPrescription) {
                const entries = rawPrescription.split(',').map(entry => entry.trim()).filter(entry => entry.length > 0);
                entries.forEach((entry, index) => {
                    const quantityMatch = entry.match(/\((\d+)\)\s*$/);
                    const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
                    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
                    const name = quantityMatch ? entry.slice(0, quantityMatch.index).trim() : entry;
                    if (!name) return;
                    const matchedDrug = availableDrugs.find(drug => (drug.tenThuoc || '').toLowerCase() === name.toLowerCase());
                    if (matchedDrug) {
                        selectedMap.set(String(matchedDrug.id), {
                            name: matchedDrug.tenThuoc || name,
                            quantity: safeQuantity,
                            max: Math.max(0, matchedDrug.soLuong ?? safeQuantity)
                        });
                    } else {
                        selectedMap.set(`manual-${index}`, {
                            name,
                            quantity: safeQuantity,
                            max: Math.max(1, safeQuantity)
                        });
                    }
                });
            }
            updateList?.();
            if (selectedMap.size === 0) {
                if (hiddenInput) {
                    hiddenInput.value = rawPrescription;
                }
                if (listContainer && rawPrescription) {
                    listContainer.innerHTML = `<p style="color: #999; margin-top: 10px;">${escapeHtml(rawPrescription)}</p>`;
                }
            }
        } else {
            updateList?.();
        }
        (overlay as any).__editingPatientId = data.id;
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
                const id = row.getAttribute('data-patient-id') || undefined;
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
                const thuocDangSuDung = cells[6]?.textContent?.trim() || '';
                openEditModal({ id, tenBenhNhan, tuoi, sdt, diaChi, tinhTrangSucKhoe: tinhTrang, thuocDangSuDung });
            }
            return;
        }
    });
})();
