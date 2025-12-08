package com.example.drug_manager_api.service;

import com.example.drug_manager_api.model.Drug;
import com.example.drug_manager_api.model.Patient;
import com.example.drug_manager_api.repository.DrugRepository;
import com.example.drug_manager_api.repository.PatientRepository;
import com.example.drug_manager_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DrugRepository drugRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    public Optional<Patient> findById(Long id) {
        if (id == null) return Optional.empty();
        return patientRepository.findById(id);
    }

    @Transactional
    public Patient create(Patient patient) {
        if (patient == null) {
            throw new IllegalArgumentException("Patient must not be null");
        }
        enforceRequiredFields(patient);
        validateDrugsExist(patient.getThuocDangSuDung());
        patient.setFullName(patient.getTenBenhNhan());
        Map<String, Integer> newPrescription = parsePrescription(patient.getThuocDangSuDung());
        applyInventoryDelta(newPrescription);
        syncLinkedUser(patient);
        return patientRepository.save(patient);
    }

    @Transactional
    public Optional<Patient> update(Long id, Patient payload) {
        if (id == null) return Optional.empty();
        if (payload == null) {
            throw new IllegalArgumentException("Patient must not be null");
        }
        enforceRequiredFields(payload);
        validateDrugsExist(payload.getThuocDangSuDung());
        return patientRepository.findById(id).map(existing -> {
            Map<String, Integer> previousPrescription = parsePrescription(existing.getThuocDangSuDung());

            existing.setTenBenhNhan(payload.getTenBenhNhan());
            existing.setFullName(payload.getTenBenhNhan());
            existing.setTuoi(payload.getTuoi());
            existing.setSdt(payload.getSdt());
            existing.setDiaChi(payload.getDiaChi());
            existing.setTinhTrangSucKhoe(payload.getTinhTrangSucKhoe());
            existing.setThuocDangSuDung(payload.getThuocDangSuDung());

            Map<String, Integer> updatedPrescription = parsePrescription(existing.getThuocDangSuDung());
            Map<String, Integer> delta = computeDelta(updatedPrescription, previousPrescription);
            applyInventoryDelta(delta);

            syncLinkedUser(existing);
            return patientRepository.save(existing);
        });
    }

    @Transactional
    public void delete(Long id) {
        if (id == null) return;
        patientRepository.findById(id).ifPresent(patient -> {
            Map<String, Integer> previousPrescription = parsePrescription(patient.getThuocDangSuDung());
            Map<String, Integer> delta = computeDelta(Collections.emptyMap(), previousPrescription);
            applyInventoryDelta(delta);
            patientRepository.delete(patient);
        });
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

    private void syncLinkedUser(Patient patient) {
        if (patient == null) return;
        String name = patient.getTenBenhNhan();
        if (name == null || name.isBlank()) {
            patient.setLinkedUserId(null);
            return;
        }
        userRepository.findByFullNameIgnoreCase(name.trim())
                .ifPresentOrElse(
                        user -> patient.setLinkedUserId(user.getId()),
                        () -> patient.setLinkedUserId(null)
                );
    }

    public Optional<Patient> findByFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) return Optional.empty();
        return patientRepository.findByTenBenhNhanIgnoreCase(fullName.trim());
    }

    public Optional<Patient> findByUserUsername(String username) {
        if (username == null || username.isBlank()) return Optional.empty();
        return userRepository.findByUsername(username.trim())
                .flatMap(user -> {
                    if (user.getId() != null) {
                        Optional<Patient> byLink = patientRepository.findByLinkedUserId(user.getId());
                        if (byLink.isPresent()) {
                            return byLink;
                        }
                    }
                    String name = user.getFullName();
                    if (name == null || name.isBlank()) {
                        return Optional.empty();
                    }
                    Optional<Patient> byName = patientRepository.findByTenBenhNhanIgnoreCase(name.trim());
                    if (byName.isPresent() && user.getId() != null) {
                        Patient patient = byName.get();
                        if (patient.getLinkedUserId() == null || !patient.getLinkedUserId().equals(user.getId())) {
                            patient.setLinkedUserId(user.getId());
                            patientRepository.save(patient);
                        }
                    }
                    return byName;
                });
    }

    private Map<String, Integer> parsePrescription(String rawText) {
        Map<String, Integer> result = new HashMap<>();
        if (rawText == null || rawText.isBlank()) {
            return result;
        }

        String[] entries = rawText.split("[,\\n]");
        Pattern pattern = Pattern.compile("^(.*?)(?:\\((\\d+)\\))?$");

        for (String entry : entries) {
            if (entry == null) continue;
            String trimmed = entry.trim();
            if (trimmed.isEmpty()) continue;

            Matcher matcher = pattern.matcher(trimmed);
            String namePart = trimmed;
            int quantity = 1;
            if (matcher.matches()) {
                if (matcher.group(1) != null) {
                    namePart = matcher.group(1).trim();
                }
                if (matcher.group(2) != null && !matcher.group(2).isBlank()) {
                    try {
                        quantity = Integer.parseInt(matcher.group(2).trim());
                    } catch (NumberFormatException ignored) {
                        quantity = 1;
                    }
                }
            }

            quantity = quantity > 0 ? quantity : 1;
            String normalizedName = normalizeDrugName(namePart);
            if (normalizedName.isEmpty()) continue;
            final int units = quantity;
            result.merge(normalizedName, units, (existing, addition) -> existing + addition);
        }

        return result;
    }

    private Map<String, Integer> computeDelta(Map<String, Integer> updated, Map<String, Integer> previous) {
        Map<String, Integer> delta = new HashMap<>();
        Set<String> names = new HashSet<>();
        names.addAll(updated.keySet());
        names.addAll(previous.keySet());

        for (String name : names) {
            int newQty = updated.getOrDefault(name, 0);
            int oldQty = previous.getOrDefault(name, 0);
            int diff = newQty - oldQty;
            if (diff != 0) {
                delta.put(name, diff);
            }
        }

        return delta;
    }

    private void applyInventoryDelta(Map<String, Integer> delta) {
        if (delta == null || delta.isEmpty()) return;

        for (Map.Entry<String, Integer> entry : delta.entrySet()) {
            adjustDrugQuantity(entry.getKey(), entry.getValue());
        }
    }

    private void adjustDrugQuantity(String drugName, int patientDelta) {
        String normalized = normalizeDrugName(drugName);
        if (normalized.isEmpty()) return;

        Drug drug = drugRepository.findByTenThuocIgnoreCase(normalized)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Thuốc không tồn tại: " + normalized
                ));

        int currentQuantity = drug.getSoLuong() != null ? drug.getSoLuong() : 0;
        int newQuantity = currentQuantity - patientDelta;
        if (newQuantity < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thuốc '" + drug.getTenThuoc() + "' không đủ số lượng trong kho"
            );
        }

        drug.setSoLuong(newQuantity);
        drug.setTinhTrang(computeDrugStatus(newQuantity, drug.getHsd()));
        drugRepository.save(drug);
    }

    private String computeDrugStatus(int quantity, LocalDate expiryDate) {
        if (quantity <= 0) {
            return "Hết hàng";
        }
        if (expiryDate != null) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
            if (days <= 30 && days > 0) {
                return "Sắp hết HSD";
            }
        }
        if (quantity <= 10) {
            return "SL còn ít";
        }
        return "Còn hàng";
    }
}
