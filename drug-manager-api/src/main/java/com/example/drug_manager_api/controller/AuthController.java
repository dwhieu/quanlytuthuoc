package com.example.drug_manager_api.controller;

import com.example.drug_manager_api.model.User;
import com.example.drug_manager_api.model.ErrorResponse;
import com.example.drug_manager_api.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private com.example.drug_manager_api.util.JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        String message = authService.register(user);
        if (message != null && message.toLowerCase().contains("thành công")) {
            return ResponseEntity.ok(message);
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        String message = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (message == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi máy chủ");
        }
        if (message.equals("Đăng nhập thành công!")) {
            User user = authService.getByUsername(loginRequest.getUsername());
            if (user != null) {
                user.setPassword(null); // Don't send password back
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.ok(message);
        }
        if (message.equals("Tài khoản không tồn tại!")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(message);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(message);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {
        User user = authService.getByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại");
        }
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/user/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User user) {
        try {
            User updated = authService.updateUser(username, user);
            if (updated == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại");
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi máy chủ");
        }
    }

    @PutMapping("/user/{username}/password")
    public ResponseEntity<String> changePassword(@PathVariable String username, @RequestBody PasswordChangeRequest req) {
        if (req == null || req.getCurrentPassword() == null || req.getNewPassword() == null) {
            return ResponseEntity.badRequest().body("Yêu cầu không hợp lệ");
        }
        boolean ok = authService.changePassword(username, req.getCurrentPassword(), req.getNewPassword());
        if (!ok) {
            if (authService.getByUsername(username) == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại");
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mật khẩu hiện tại không đúng");
        }
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        if (req == null || req.getEmail() == null) {
            return ResponseEntity.badRequest().body("Email là bắt buộc");
        }
        String result = authService.requestPasswordReset(req.getEmail());
        if (result.equals("OTP đã được gửi")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequest req) {
        if (req == null || req.getEmail() == null || req.getOtp() == null) {
            return ResponseEntity.badRequest().body("Email và OTP là bắt buộc");
        }
        boolean isValid = authService.verifyOtp(req.getEmail(), req.getOtp());
        if (isValid) {
            return ResponseEntity.ok("Mã OTP hợp lệ");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mã OTP không hợp lệ hoặc đã hết hạn");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req == null || req.getEmail() == null || req.getOtp() == null || req.getNewPassword() == null) {
            return ResponseEntity.badRequest().body("Thông tin không đầy đủ");
        }
        String result = authService.resetPassword(req.getEmail(), req.getOtp(), req.getNewPassword());
        if (result.equals("Mật khẩu đã được đặt lại")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }

    public static class PasswordChangeRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class ForgotPasswordRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class VerifyOtpRequest {
        private String email;
        private String otp;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }

    public static class ResetPasswordRequest {
        private String email;
        private String otp;
        private String newPassword;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
