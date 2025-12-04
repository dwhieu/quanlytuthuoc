package com.example.drug_manager_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send OTP to user's email
     * @param to recipient email
     * @param otp the OTP code
     */
    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Mã xác thực đặt lại mật khẩu - Pharmacy Inventory");
            message.setText("Mã OTP của bạn là: " + otp + "\n\n" +
                    "Mã này sẽ hết hạn sau 10 phút.\n" +
                    "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
                    "Trân trọng,\n" +
                    "Đội ngũ Pharmacy Inventory");
            javaMailSender.send(message);
            logger.info("OTP sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to: {}", to, e);
            throw new RuntimeException("Không thể gửi email OTP");
        }
    }

    /**
     * Send password reset confirmation email
     * @param to recipient email
     * @param username the username
     */
    public void sendPasswordResetConfirmation(String to, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Mật khẩu đã được đặt lại thành công - Pharmacy Inventory");
            message.setText("Xin chào " + username + ",\n\n" +
                    "Mật khẩu của bạn đã được đặt lại thành công.\n" +
                    "Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức.\n\n" +
                    "Trân trọng,\n" +
                    "Đội ngũ Pharmacy Inventory");
            javaMailSender.send(message);
            logger.info("Password reset confirmation sent to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send confirmation email to: {}", to, e);
        }
    }
}
