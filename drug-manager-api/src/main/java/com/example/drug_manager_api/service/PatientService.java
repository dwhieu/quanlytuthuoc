package com.example.drug_manager_api.service;

import com.example.drug_manager_api.model.Patient;
import com.example.drug_manager_api.repository.DrugRepository;
import com.example.drug_manager_api.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DrugRepository drugRepository;

    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    public Optional<Patient> findById(Long id) {
        if (id == null) return Optional.empty();
        return patientRepository.findById(id);
    }

    public Patient create(Patient patient) {
        if (patient == null) {
            throw new IllegalArgumentException("Patient must not be null");
        }
        enforceRequiredFields(patient);
        validateDrugsExist(patient.getThuocDangSuDung());
        patient.setFullName(patient.getTenBenhNhan());
        return patientRepository.save(patient);
    }

    public Optional<Patient> update(Long id, Patient payload) {
        if (id == null) return Optional.empty();
        if (payload == null) {
            throw new IllegalArgumentException("Patient must not be null");
        }
        enforceRequiredFields(payload);
        validateDrugsExist(payload.getThuocDangSuDung());
        return patientRepository.findById(id).map(existing -> {
            existing.setTenBenhNhan(payload.getTenBenhNhan());
            existing.setFullName(payload.getTenBenhNhan());
            existing.setTuoi(payload.getTuoi());
            existing.setSdt(payload.getSdt());
            existing.setDiaChi(payload.getDiaChi());
            existing.setTinhTrangSucKhoe(payload.getTinhTrangSucKhoe());
            existing.setThuocDangSuDung(payload.getThuocDangSuDung());
            return patientRepository.save(existing);
        });
    }

    public void delete(Long id) {
        if (id == null) return;
        patientRepository.deleteById(id);
    }

    private void validateDrugsExist(String thuocDangSuDung) {
        if (thuocDangSuDung == null || thuocDangSuDung.isBlank()) return;

        List<String> requestedDrugs = Arrays.stream(thuocDangSuDung.split(","))
            .map(this::normalizeDrugName)
            .filter(name -> !name.isEmpty())
                .collect(Collectors.toList());

        if (requestedDrugs.isEmpty()) return;

        List<String> missing = requestedDrugs.stream()
                .filter(name -> !drugRepository.existsByTenThuocIgnoreCase(name))
                .collect(Collectors.toList());

        if (!missing.isEmpty()) {
            System.out.println("Missing drugs detected when saving patient: " + missing);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thuoc khong ton tai trong quan ly thuoc: " + String.join(", ", missing)
            );
        }
    }

    private String normalizeDrugName(String raw) {
        if (raw == null) return "";
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) return "";
        String withoutQuantity = trimmed.replaceAll("\\s*\\([^)]*\\)\\s*$", "").trim();
        return withoutQuantity.isEmpty() ? trimmed : withoutQuantity;
    }

    private void enforceRequiredFields(Patient patient) {
        if (patient.getTenBenhNhan() == null || patient.getTenBenhNhan().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên bệnh nhân không được để trống"
            );
        }
    }
}
