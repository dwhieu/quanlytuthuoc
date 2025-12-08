package com.example.drug_manager_api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tenBenhNhan;

    @JsonIgnore
    @Column(name = "full_name")
    private String fullName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    private Integer tuoi;
    private String sdt;
    private String diaChi;
    private String tinhTrangSucKhoe;
    private String thuocDangSuDung;

    @PrePersist
    @PreUpdate
    private void syncFullName() {
        this.fullName = this.tenBenhNhan;
    }
}
