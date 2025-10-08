package com.example.drug_manager_api.service;

import com.example.drug_manager_api.model.User;
import com.example.drug_manager_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public AuthService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public String register(User user) {
        if (userRepository.existsByUsername(user.getUsername()))
            return "Tên đăng nhập đã tồn tại!";
        if (userRepository.existsByEmail(user.getEmail()))
            return "Email đã được sử dụng!";

        user.setPassword(passwordEncoder.encode(user.getPassword()));
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

        userRepository.save(user);
        // don't return password
        user.setPassword(null);
        return user;
    }
}
