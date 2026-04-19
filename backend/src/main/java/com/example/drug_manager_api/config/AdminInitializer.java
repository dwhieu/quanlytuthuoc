package com.example.drug_manager_api.config;

import com.example.drug_manager_api.model.User;
import com.example.drug_manager_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Khởi tạo tài khoản Admin mặc định khi ứng dụng bắt đầu
@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra nếu chưa có tài khoản admin
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .fullName("Hệ Thống Admin")
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@example.com")
                    .role("admin")
                    .authProvider("local")
                    .build();
            
            userRepository.save(admin);
            System.out.println(">>> Tài khoản Admin mặc định đã được tạo: admin/admin123");
        } else {
            System.out.println(">>> Tài khoản Admin đã tồn tại.");
        }
    }
}
