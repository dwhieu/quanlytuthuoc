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
}
