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

// Add giao diện Popup để Thêm/Sửa bệnh nhân (thông qua DOM)
declare global { interface Window { __patientsModalsInitialized?: boolean; } }
(function setupPatientsModals() {
    if (window.__patientsModalsInitialized) return;
    window.__patientsModalsInitialized = true;

    const ADD_ID = 'patients-add-modal-overlay';
    const EDIT_ID = 'patients-edit-modal-overlay';

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
                <textarea name="tinhTrangSucKhoe" rows="3" placeholder="Mô tả tình trạng sức khỏe"></textarea>
              </div>
              <div class="form-group">
                <label>Kê đơn</label>
                <textarea name="keDon" rows="3" placeholder="Nhập các thuốc kê đơn"></textarea>
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

        return overlay as HTMLDivElement;
    };

    const openAddModal = () => {
        const overlay = ensureModal('add');
        // Reset các fields
        overlay.querySelectorAll('input, textarea').forEach((el) => ((el as HTMLInputElement).value = ''));
        overlay.classList.add('show');
    };

    const openEditModal = (data: { tenBenhNhan: string; tuoi: string; sdt: string; diaChi: string; tinhTrangSucKhoe: string }) => {
        const overlay = ensureModal('edit');
        (overlay.querySelector('input[name="tenBenhNhan"]') as HTMLInputElement).value = data.tenBenhNhan || '';
        (overlay.querySelector('input[name="tuoi"]') as HTMLInputElement).value = data.tuoi || '';
        (overlay.querySelector('input[name="sdt"]') as HTMLInputElement).value = data.sdt || '';
        (overlay.querySelector('input[name="diaChi"]') as HTMLInputElement).value = data.diaChi || '';
        (overlay.querySelector('textarea[name="tinhTrangSucKhoe"]') as HTMLTextAreaElement).value = data.tinhTrangSucKhoe || '';
        (overlay.querySelector('textarea[name="keDon"]') as HTMLTextAreaElement).value = '';
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