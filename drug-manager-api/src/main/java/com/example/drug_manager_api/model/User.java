package com.example.drug_manager_api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String dob;
    private String homeTown;
    private String phoneNumber;
    private String email;

    @Column(unique = true)
    private String username;

    private String password;
}
