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

    private final PatientRepository patientRepository;
    private final DrugRepository drugRepository;
    private final UserRepository userRepository;

    @Autowired
    public PatientService(PatientRepository patientRepository, DrugRepository drugRepository, UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.drugRepository = drugRepository;
        this.userRepository = userRepository;
    }

    // Lấy danh sách toàn bộ bệnh nhân
    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    // Tìm kiếm một bệnh nhân theo mã định danh (ID)
    public Optional<Patient> findById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return patientRepository.findById(id);
    }

    // Thêm mới bệnh nhân và thực hiện trừ kho thuốc theo đơn
    @Transactional
    public Patient create(Patient patient) {
        if (patient == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu bệnh nhân không hợp lệ");
        }
        
        validateDrugsExist(patient.getThuocDangSuDung());
        patient.setFullName(patient.getTenBenhNhan());
        
        // Trừ số lượng thuốc trong kho
        Map<String, Integer> prescription = parsePrescription(patient.getThuocDangSuDung());
        applyInventoryDelta(prescription);
        
        syncLinkedUser(patient);
        return patientRepository.save(patient);
    }

    // Cập nhật thông tin bệnh nhân và điều chỉnh số lượng tồn kho nếu đơn thuốc thay đổi
    @Transactional
    public Optional<Patient> update(Long id, Patient payload) {
        if (id == null || payload == null) {
            return Optional.empty();
        }
        
        validateDrugsExist(payload.getThuocDangSuDung());
        
        return patientRepository.findById(id).map(existing -> {
            // Lấy danh sách thuốc cũ để tính toán chênh lệch
            Map<String, Integer> previousPrescription = parsePrescription(existing.getThuocDangSuDung());

            existing.setTenBenhNhan(payload.getTenBenhNhan());
            existing.setFullName(payload.getTenBenhNhan());
            existing.setTuoi(payload.getTuoi());
            existing.setSdt(payload.getSdt());
            existing.setDiaChi(payload.getDiaChi());
            existing.setTinhTrangSucKhoe(payload.getTinhTrangSucKhoe());
            existing.setThuocDangSuDung(payload.getThuocDangSuDung());

            // Tính toán và áp dụng chênh lệch thuốc vào kho
            Map<String, Integer> updatedPrescription = parsePrescription(payload.getThuocDangSuDung());
            Map<String, Integer> delta = computeDelta(updatedPrescription, previousPrescription);
            applyInventoryDelta(delta);

            syncLinkedUser(existing);
            return patientRepository.save(existing);
        });
    }

    // Xóa bệnh nhân khỏi hệ thống và hoàn trả lại số lượng thuốc vào kho
    @Transactional
    public void delete(Long id) {
        if (id == null) return;
        
        patientRepository.findById(id).ifPresent(patient -> {
            // Hoàn trả thuốc bằng cách tính delta âm
            Map<String, Integer> previousPrescription = parsePrescription(patient.getThuocDangSuDung());
            Map<String, Integer> delta = computeDelta(Collections.emptyMap(), previousPrescription);
            applyInventoryDelta(delta);
            
            patientRepository.delete(patient);
        });
    }

    // Kiểm tra các loại thuốc trong đơn có tồn tại trong kho không
    private void validateDrugsExist(String prescriptionText) {
        if (prescriptionText == null || prescriptionText.isBlank()) {
            return;
        }

        List<String> missing = Arrays.stream(prescriptionText.split(","))
                .map(this::normalizeDrugName)
                .filter(name -> !name.isEmpty())
                .filter(name -> !drugRepository.existsByTenThuocIgnoreCase(name))
                .collect(Collectors.toList());

        if (!missing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thuốc không tồn tại trong kho: " + String.join(", ", missing));
        }
    }

    // Loại bỏ phần thông tin số lượng (trong ngoặc) để lấy tên thuốc chuẩn
    private String normalizeDrugName(String raw) {
        if (raw == null) return "";
        String trimmed = raw.trim();
        String withoutQuantity = trimmed.replaceAll("\\s*\\([^)]*\\)\\s*$", "").trim();
        return withoutQuantity.isEmpty() ? trimmed : withoutQuantity;
    }

    // Liên kết ID người dùng nếu tên bệnh nhân trùng khớp với họ tên tài khoản
    private void syncLinkedUser(Patient patient) {
        if (patient == null || patient.getTenBenhNhan() == null) return;
        
        userRepository.findByFullNameIgnoreCase(patient.getTenBenhNhan().trim())
                .ifPresentOrElse(
                        user -> patient.setLinkedUserId(user.getId()),
                        () -> patient.setLinkedUserId(null)
                );
    }

    // Tìm kiếm bệnh nhân theo tên (không phân biệt hoa thường)
    public Optional<Patient> findByFullName(String name) {
        if (name == null || name.isBlank()) return Optional.empty();
        return patientRepository.findByTenBenhNhanIgnoreCase(name.trim());
    }

    // Tìm kiếm bệnh nhân dựa trên username của tài khoản người dùng
    public Optional<Patient> findByUserUsername(String username) {
        if (username == null || username.isBlank()) return Optional.empty();
        
        return userRepository.findByUsername(username.trim()).flatMap(user -> {
            Optional<Patient> linked = patientRepository.findByLinkedUserId(user.getId());
            if (linked.isPresent()) {
                return linked;
            }
            // Nếu chưa link ID, thử tìm theo tên
            return patientRepository.findByTenBenhNhanIgnoreCase(user.getFullName().trim());
        });
    }

    // Phân tích chuỗi đơn thuốc thành bản đồ cấu trúc: Tên thuốc -> Số lượng
    private Map<String, Integer> parsePrescription(String rawText) {
        Map<String, Integer> result = new HashMap<>();
        if (rawText == null || rawText.isBlank()) return result;

        String[] entries = rawText.split("[,\\n]");
        Pattern pattern = Pattern.compile("^(.*?)(?:\\((\\d+)\\))?$");

        for (String entry : entries) {
            String trimmed = entry.trim();
            if (trimmed.isEmpty()) continue;

            Matcher matcher = pattern.matcher(trimmed);
            String name = trimmed;
            int quantity = 1;
            
            if (matcher.matches()) {
                if (matcher.group(1) != null) name = matcher.group(1).trim();
                if (matcher.group(2) != null) {
                    try { quantity = Integer.parseInt(matcher.group(2)); } catch (Exception e) {}
                }
            }

            String normalizedName = normalizeDrugName(name);
            if (!normalizedName.isEmpty()) {
                result.merge(normalizedName, Math.max(1, quantity), Integer::sum);
            }
        }
        return result;
    }

    // Tính toán số lượng thuốc cần thay đổi (Mới - Cũ)
    private Map<String, Integer> computeDelta(Map<String, Integer> updated, Map<String, Integer> previous) {
        Map<String, Integer> delta = new HashMap<>();
        Set<String> allNames = new HashSet<>(updated.keySet());
        allNames.addAll(previous.keySet());

        for (String name : allNames) {
            int diff = updated.getOrDefault(name, 0) - previous.getOrDefault(name, 0);
            if (diff != 0) {
                delta.put(name, diff);
            }
        }
        return delta;
    }

    // Thực hiện trừ hoặc hoàn kho dựa trên bảng chênh lệch delta
    private void applyInventoryDelta(Map<String, Integer> delta) {
        if (delta == null || delta.isEmpty()) return;

        for (Map.Entry<String, Integer> entry : delta.entrySet()) {
            String name = entry.getKey();
            int qtyChange = entry.getValue();

            Drug drug = drugRepository.findByTenThuocIgnoreCase(name)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy thuốc: " + name));

            int currentQty = drug.getSoLuong() != null ? drug.getSoLuong() : 0;
            int newQty = currentQty - qtyChange;

            if (newQty < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng thuốc '" + name + "' trong kho không đủ");
            }

            drug.setSoLuong(newQty);
            drug.setTinhTrang(computeDrugStatus(newQty, drug.getHsd()));
            drugRepository.save(drug);
        }
    }

    // Tính toán trạng thái tồn kho của thuốc
    private String computeDrugStatus(int qty, LocalDate expiry) {
        if (expiry != null) {
            if (expiry.isBefore(LocalDate.now()) || expiry.isEqual(LocalDate.now())) {
                return "Hết hạn";
            }
            long daysToExpiry = ChronoUnit.DAYS.between(LocalDate.now(), expiry);
            if (daysToExpiry <= 30) {
                return "Sắp hết HSD";
            }
        }

        if (qty <= 0) return "Hết hàng";
        if (qty <= 10) return "SL còn ít";
        
        return "Còn hàng";
    }
}
