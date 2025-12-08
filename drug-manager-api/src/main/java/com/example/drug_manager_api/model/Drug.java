package com.example.drug_manager_api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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
    private String tinhTrang;
}
