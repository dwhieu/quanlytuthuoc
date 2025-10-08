package com.example.drug_manager_api.controller;

import com.example.drug_manager_api.model.User;
import com.example.drug_manager_api.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}) // cho phép React truy cập
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        String message = authService.register(user);
        // Nếu thông báo chứa từ khóa thành công, trả 200 OK
        if (message != null && message.toLowerCase().contains("thành công")) {
            return ResponseEntity.ok(message);
        }
        // Ngược lại trả 409 Conflict (ví dụ: username/email đã tồn tại)
        return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User loginRequest) {
        String message = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (message == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi máy chủ");
        }
        if (message.equals("Đăng nhập thành công!")) {
            return ResponseEntity.ok(message);
        }
        if (message.equals("Tài khoản không tồn tại!")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(message);
        }
        // Mật khẩu không đúng
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(message);
    }

    // Lấy thông tin user (không trả password)
    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {
        User user = authService.getByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại");
        }
        // ẩn password trước khi trả
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
}
