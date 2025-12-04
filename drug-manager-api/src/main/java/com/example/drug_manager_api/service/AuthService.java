package com.example.drug_manager_api.service;

import com.example.drug_manager_api.model.User;
import com.example.drug_manager_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private final PasswordEncoder passwordEncoder;
    
    // In-memory storage for OTP (email -> OTP info)
    private final Map<String, OtpInfo> otpStore = new HashMap<>();

    public AuthService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    // Helper class to store OTP and expiration
    private static class OtpInfo {
        String otp;
        long expiryTime;
        
        OtpInfo(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
        
        boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }

    public String register(User user) {
        if (userRepository.existsByUsername(user.getUsername()))
            return "Tên đăng nhập đã tồn tại!";
        if (userRepository.existsByEmail(user.getEmail()))
            return "Email đã được sử dụng!";

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // registration via form -> local provider
        user.setAuthProvider("local");
        userRepository.save(user);
        return "Đăng ký tài khoản thành công!";
    }

    public String login(String username, String password) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null)
            return "Tài khoản không tồn tại!";
        if (!passwordEncoder.matches(password, user.getPassword()))
            return "Mật khẩu không đúng!";
        return "Đăng nhập thành công!";
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public User updateUser(String username, User newData) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return null;
        // if email changed, ensure it's not used by another account
        if (newData.getEmail() != null && !newData.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(newData.getEmail())) {
                throw new IllegalArgumentException("Email đã được sử dụng!");
            }
        }
        // update allowed fields
        if (newData.getFullName() != null) user.setFullName(newData.getFullName());
        if (newData.getDob() != null) user.setDob(newData.getDob());
        if (newData.getHomeTown() != null) user.setHomeTown(newData.getHomeTown());
        if (newData.getPhoneNumber() != null) user.setPhoneNumber(newData.getPhoneNumber());
        if (newData.getEmail() != null) user.setEmail(newData.getEmail());
    if (newData.getAvatarUrl() != null) user.setAvatarUrl(newData.getAvatarUrl());

        userRepository.save(user);
        // don't return password
        user.setPassword(null);
        return user;
    }

    /**
     * Change the password for an existing user.
     * @param username the username
     * @param currentPassword the user's current plain password
     * @param newPassword the new plain password
     * @return true if changed successfully, false if user not found or current password wrong
     */
    public boolean changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return false;
        // verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) return false;
        // encode and set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    /**
     * Request password reset by generating and storing OTP
     * @param email the user's email
     * @return message indicating result
     */
    public String requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return "Email không tồn tại trong hệ thống";
        }
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        long expiryTime = System.currentTimeMillis() + (10 * 60 * 1000); // 10 minutes
        
        otpStore.put(email, new OtpInfo(otp, expiryTime));
        
        // Send OTP via email
        try {
            emailService.sendOtpEmail(email, otp);
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("Email sending failed: " + e.getMessage());
        }
        
        return "OTP đã được gửi";
    }

    /**
     * Verify OTP provided by user
     * @param email the user's email
     * @param otp the OTP provided by user
     * @return true if OTP is valid and not expired
     */
    public boolean verifyOtp(String email, String otp) {
        OtpInfo otpInfo = otpStore.get(email);
        if (otpInfo == null) {
            return false;
        }
        
        if (otpInfo.isExpired()) {
            otpStore.remove(email);
            return false;
        }
        
        return otpInfo.otp.equals(otp);
    }

    /**
     * Reset password with valid OTP
     * @param email the user's email
     * @param otp the OTP to verify
     * @param newPassword the new password
     * @return message indicating result
     */
    public String resetPassword(String email, String otp, String newPassword) {
        // Verify OTP first
        if (!verifyOtp(email, otp)) {
            return "Mã OTP không hợp lệ hoặc đã hết hạn";
        }
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return "Tài khoản không tồn tại";
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Send confirmation email
        try {
            emailService.sendPasswordResetConfirmation(email, user.getUsername());
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("Confirmation email sending failed: " + e.getMessage());
        }
        
        // Remove used OTP
        otpStore.remove(email);
        
        return "Mật khẩu đã được đặt lại";
    }
}
