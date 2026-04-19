package com.example.drug_manager_api.service;

import com.example.drug_manager_api.model.User;
import com.example.drug_manager_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.drug_manager_api.util.JwtUtil;
import java.util.*;

// Xử lý xác thực, đăng ký và cấp lại mật khẩu cho người dùng
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final Map<String, OtpInfo> otpStore = new HashMap<>();

    @Autowired
    public AuthService(UserRepository userRepository, EmailService emailService, 
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Thông tin mã OTP và thời gian hết hạn
    private static class OtpInfo {
        String otp;
        long expiryTime;

        OtpInfo(String otp, long expiry) {
            this.otp = otp;
            this.expiryTime = expiry;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }

    // Đăng ký tài khoản người dùng mới
    public String register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return "Tên đăng nhập đã tồn tại!";
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return "Email đã được sử dụng!";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setAuthProvider("local");
        userRepository.save(user);
        return "Đăng ký thành công!";
    }

    // Xác thực đăng nhập người dùng và trả về JWT Token
    public com.example.drug_manager_api.model.LoginResponse login(String username, String password) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return null;
        }

        String token = jwtUtil.generateToken(username);
        return com.example.drug_manager_api.model.LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    // Tìm kiếm người dùng theo tên đăng nhập
    public User getByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    // Cập nhật thông tin cá nhân của người dùng
    public User updateUser(String username, User newData) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        if (newData.getFullName() != null) user.setFullName(newData.getFullName());
        if (newData.getDob() != null) user.setDob(newData.getDob());
        if (newData.getHomeTown() != null) user.setHomeTown(newData.getHomeTown());
        if (newData.getPhoneNumber() != null) user.setPhoneNumber(newData.getPhoneNumber());
        if (newData.getAvatarUrl() != null) user.setAvatarUrl(newData.getAvatarUrl());

        userRepository.save(user);
        user.setPassword(null);
        return user;
    }

    // Đổi mật khẩu cho người dùng đang đăng nhập
    public boolean changePassword(String username, String currentPassword, String newPassword) {
        User user = getByUsername(username);
        if (user == null) {
            return false;
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    // Gửi mã OTP khôi phục mật khẩu vào Email
    public String requestPasswordReset(String email) {
        if (!userRepository.existsByEmail(email)) {
            return "Email không tồn tại trong hệ thống";
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        long expiry = System.currentTimeMillis() + 600000; // 10 phút
        otpStore.put(email, new OtpInfo(otp, expiry));

        try {
            emailService.sendOtpEmail(email, otp);
        } catch (Exception e) {
            System.err.println("Gửi Email thất bại: " + e.getMessage());
        }
        return "OTP đã được gửi";
    }

    // Kiểm tra mã OTP người dùng cung cấp
    public boolean verifyOtp(String email, String otp) {
        OtpInfo info = otpStore.get(email);
        if (info == null || info.isExpired()) {
            return false;
        }
        return info.otp.equals(otp);
    }

    // Đặt lại mật khẩu mới sau khi xác thực OTP
    public String resetPassword(String email, String otp, String newPassword) {
        if (!verifyOtp(email, otp)) {
            return "Mã OTP không hợp lệ hoặc đã hết hạn";
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return "Tài khoản không tồn tại";
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpStore.remove(email);

        try {
            emailService.sendPasswordResetConfirmation(email, user.getUsername());
        } catch (Exception e) {
            System.err.println("Gửi Email xác nhận thất bại: " + e.getMessage());
        }
        return "Mật khẩu đã được đặt lại";
    }
}
