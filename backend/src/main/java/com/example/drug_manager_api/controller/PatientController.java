package com.example.drug_manager_api.controller;

import com.example.drug_manager_api.model.Patient;
import com.example.drug_manager_api.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

// API quản lý thông tin bệnh nhân và đơn thuốc
@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class PatientController {

    @Autowired
    private PatientService patientService;

    // Lấy danh sách toàn bộ bệnh nhân trong hệ thống
    @GetMapping
    public List<Patient> getAll() {
        return patientService.findAll();
    }

    // Lấy thông tin chi tiết một bệnh nhân theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getOne(@PathVariable Long id) {
        return patientService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Tìm kiếm bệnh nhân theo họ và tên
    @GetMapping("/by-full-name")
    public ResponseEntity<Patient> getByFullName(@RequestParam("name") String name) {
        return patientService.findByFullName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Tìm kiếm bệnh nhân dựa trên username của tài khoản liên kết
    @GetMapping("/by-user/{username}")
    public ResponseEntity<Patient> getByUsername(@PathVariable("username") String username) {
        return patientService.findByUserUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Thêm mới một bệnh nhân vào hệ thống
    @PostMapping
    public ResponseEntity<Patient> create(@RequestBody Patient patient) {
        Patient saved = patientService.create(patient);
        URI location = URI.create("/api/patients/" + saved.getId());
        return ResponseEntity.created(location).body(saved);
    }

    // Cập nhật thông tin chi tiết của bệnh nhân
    @PutMapping("/{id}")
    public ResponseEntity<Patient> update(@PathVariable Long id, @RequestBody Patient patient) {
        return patientService.update(id, patient)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Xóa bệnh nhân khỏi hệ thống
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
