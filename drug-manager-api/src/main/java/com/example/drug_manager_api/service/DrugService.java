package com.example.drug_manager_api.service;

import com.example.drug_manager_api.model.Drug;
import com.example.drug_manager_api.repository.DrugRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class DrugService {

    @Autowired
    private DrugRepository drugRepository;

    public List<Drug> findAll() {
        return drugRepository.findAll();
    }

    public Optional<Drug> findById(Long id) {
        return drugRepository.findById(id);
    }

    public Drug create(Drug drug) {
        drug.setTinhTrang(computeStatus(drug.getSoLuong(), drug.getHsd()));
        return drugRepository.save(drug);
    }

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

    public void delete(Long id) {
        drugRepository.deleteById(id);
    }

    private String computeStatus(Integer soLuong, LocalDate hsd) {
        int quantity = soLuong != null ? soLuong : 0;
        if (quantity == 0) return "Hết hàng";

        if (hsd != null) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), hsd);
            if (days <= 30 && days > 0) return "Sắp hết HSD";
        }

        if (quantity <= 10) return "SL còn ít";
        return "Còn hàng";
    }
}
