package com.example.drug_manager_api.controller;

import com.example.drug_manager_api.model.User;
import com.example.drug_manager_api.service.AuthService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// API xác thực và quản lý tài khoản
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AuthController {

    @Autowired
    private AuthService authService;

    // Đăng ký tài khoản mới
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        String message = authService.register(user);
        if (message != null && message.toLowerCase().contains("thành công")) {
            return ResponseEntity.ok(message);
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
    }

    // Đăng nhập hệ thống và nhận JWT Token
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        com.example.drug_manager_api.model.LoginResponse response = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        
        if (response != null) {
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản hoặc mật khẩu không chính xác");
    }

    // Lấy thông tin người dùng theo username
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {
        User user = authService.getByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại");
        }
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    // Cập nhật thông tin cá nhân của người dùng
    @PutMapping("/user/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User user) {
        try {
            User updated = authService.updateUser(username, user);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại");
            }
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    // Đổi mật khẩu cho người dùng
    @PutMapping("/user/{username}/password")
    public ResponseEntity<String> changePassword(@PathVariable String username, @RequestBody PasswordChangeRequest req) {
        boolean success = authService.changePassword(username, req.getCurrentPassword(), req.getNewPassword());
        if (success) {
            return ResponseEntity.ok("Đổi mật khẩu thành công");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mật khẩu hiện tại không chính xác");
    }

    // Yêu cầu đặt lại mật khẩu bằng cách gửi mã OTP qua Email
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        String result = authService.requestPasswordReset(req.getEmail());
        if (result.equals("OTP đã được gửi")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
    }

    // Xác thực mã OTP người dùng nhập vào
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequest req) {
        boolean isValid = authService.verifyOtp(req.getEmail(), req.getOtp());
        if (isValid) {
            return ResponseEntity.ok("Mã OTP hợp lệ");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mã OTP không hợp lệ hoặc đã hết hạn");
    }

    // Đặt lại mật khẩu mới sau khi xác thực OTP thành công
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest req) {
        String result = authService.resetPassword(req.getEmail(), req.getOtp(), req.getNewPassword());
        if (result.equals("Mật khẩu đã được đặt lại")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }

    // Các DTO cho yêu cầu Auth
    @Data
    static class PasswordChangeRequest {
        private String currentPassword;
        private String newPassword;
    }

    @Data
    static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    static class VerifyOtpRequest {
        private String email;
        private String otp;
    }

    @Data
    static class ResetPasswordRequest {
        private String email;
        private String otp;
        private String newPassword;
    }
}
