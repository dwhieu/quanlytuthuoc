package com.example.drug_manager_api.service;

import com.example.drug_manager_api.model.Drug;
import com.example.drug_manager_api.repository.DrugRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

// Xử lý logic nghiệp vụ quản lý thuốc
@Service
public class DrugService {

    private final DrugRepository drugRepository;

    @Autowired
    public DrugService(DrugRepository drugRepository) {
        this.drugRepository = drugRepository;
    }

    // Lấy tất cả thuốc
    public List<Drug> findAll() {
        return drugRepository.findAll();
    }

    // Tìm thuốc theo ID
    public Optional<Drug> findById(Long id) {
        return drugRepository.findById(id);
    }

    // Tạo thuốc mới và tính toán trạng thái
    public Drug create(Drug drug) {
        drug.setTinhTrang(computeStatus(drug.getSoLuong(), drug.getHsd()));
        return drugRepository.save(drug);
    }

    // Cập nhật thuốc và tính lại trạng thái
    public Optional<Drug> update(Long id, Drug payload) {
        return drugRepository.findById(id).map(existing -> {
            existing.setTenThuoc(payload.getTenThuoc());
            existing.setLoaiThuoc(payload.getLoaiThuoc());
            existing.setSoLuong(payload.getSoLuong());
            existing.setHsd(payload.getHsd());
            existing.setNgayNhap(payload.getNgayNhap());
            existing.setNhaCungCap(payload.getNhaCungCap());
            existing.setTinhTrang(computeStatus(payload.getSoLuong(), payload.getHsd()));
            return drugRepository.save(existing);
        });
    }

    // Xóa thuốc
    public void delete(Long id) {
        drugRepository.deleteById(id);
    }

    // Logic tính toán trạng thái tồn kho và HSD
    public String computeStatus(Integer soLuong, LocalDate hsd) {
        int quantity = soLuong != null ? soLuong : 0;
        
        // Ưu tiên kiểm tra HSD trước
        if (hsd != null) {
            if (hsd.isBefore(LocalDate.now()) || hsd.isEqual(LocalDate.now())) {
                return "Hết hạn";
            }
            long days = ChronoUnit.DAYS.between(LocalDate.now(), hsd);
            if (days <= 30) {
                return "Sắp hết HSD";
            }
        }

        if (quantity == 0) return "Hết hàng";
        if (quantity <= 10) return "SL còn ít";
        
        return "Còn hàng";
    }
}
