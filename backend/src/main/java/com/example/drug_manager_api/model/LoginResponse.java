package com.example.drug_manager_api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO phản hồi sau khi đăng nhập thành công
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String username;
    private String fullName;
    private String role;
    private String avatarUrl;
}
