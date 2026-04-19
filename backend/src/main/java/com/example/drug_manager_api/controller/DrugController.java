package com.example.drug_manager_api.controller;

import com.example.drug_manager_api.model.Drug;
import com.example.drug_manager_api.service.DrugService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;
import java.util.Objects;

// API quản lý thuốc
@RestController
@RequestMapping("/api/drugs")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class DrugController {

    @Autowired
    private DrugService drugService;

    // Lấy danh sách thuốc
    @GetMapping
    public List<Drug> getAll() {
        return drugService.findAll();
    }

    // Lấy thông tin 1 loại thuốc theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Drug> getOne(@PathVariable Long id) {
        return drugService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Thêm mới thuốc
    @PostMapping
    public ResponseEntity<Drug> create(@RequestBody Drug drug) {
        Drug saved = drugService.create(drug);
        URI location = URI.create("/api/drugs/" + saved.getId());
        Objects.requireNonNull(location);
        return ResponseEntity.created(location).body(saved);
    }

    // Cập nhật thông tin thuốc
    @PutMapping("/{id}")
    public ResponseEntity<Drug> update(@PathVariable Long id, @RequestBody Drug drug) {
        return drugService.update(id, drug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Xóa thuốc khỏi kho
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        drugService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
