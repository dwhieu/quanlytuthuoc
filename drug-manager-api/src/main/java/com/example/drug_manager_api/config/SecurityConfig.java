package com.example.drug_manager_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;
import java.util.List;

// Đảm bảo bạn đã thêm dependency Spring Security vào build.gradle/pom.xml nếu chưa
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Đây là Bean đã được sử dụng trong AuthService.java
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Bean chính để cấu hình các quy tắc bảo mật
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Vô hiệu hóa CSRF (Cần thiết cho API non-browser)
            .csrf(AbstractHttpConfigurer::disable) 
            
            // 2. Vô hiệu hóa cơ chế form login mặc định
            .formLogin(AbstractHttpConfigurer::disable)
            
            // 3. Cấu hình cho phép CorsConfig.java hoạt động
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 4. Cấu hình quyền truy cập (Authorization)
            .authorizeHttpRequests(authorize -> authorize
                // Cho phép tất cả mọi người truy cập API Đăng ký và Đăng nhập
                .requestMatchers("/api/auth/**").permitAll()
                // Tất cả các request khác yêu cầu xác thực (authenticated)
                .anyRequest().authenticated()
            );

        return http.build();
    }

    // Khai báo lại cấu hình CORS để Spring Security biết và áp dụng
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    // Cho phép truy cập từ http://localhost:3000 và http://localhost:3001 (React Frontend dev)
    configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}