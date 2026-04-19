package com.example.drug_manager_api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

// Model thông tin thuốc trong kho
@Entity
@Table(name = "drugs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Drug {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tenThuoc;
    private String loaiThuoc;
    private Integer soLuong;
    private LocalDate hsd;
    private LocalDate ngayNhap;
    private String nhaCungCap;
    private String tinhTrang; // Trạng thái: Còn hàng, SL còn ít, Sắp hết HSD, Hết hàng
}
