package com.example.drug_manager_api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

// Model người dùng hệ thống
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private LocalDate dob;
    private String homeTown;
    private String phoneNumber;
    private String email;

    @Column(unique = true)
    private String username;

    private String password;
    private String avatarUrl; // Ảnh đại diện
    private String authProvider; // Nhà cung cấp (local/google)
    @Builder.Default
    private String role = "user"; // Vai trò (admin/user)
}
