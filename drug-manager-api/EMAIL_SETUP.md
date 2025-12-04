# Hướng Dẫn Cấu Hình Email - Tính Năng Quên Mật Khẩu

## Tổng Quan
Tính năng quên mật khẩu hiện tại gửi OTP qua email. Bạn cần cấu hình cài đặt SMTP để kích hoạt chức năng này.

## Cài Đặt Gmail (Khuyên Dùng Cho Kiểm Tra)

### Bước 1: Bật Xác Thực 2 Bước
1. Truy cập https://myaccount.google.com/security
2. Bật Xác Thực 2 Bước

### Bước 2: Tạo Mật Khẩu Ứng Dụng
1. Truy cập https://myaccount.google.com/apppasswords
2. Chọn "Mail" và "Windows Computer"
3. Google sẽ tạo mật khẩu 16 ký tự
4. Sao chép mật khẩu này

### Bước 3: Cập Nhật application.properties
Chỉnh sửa `drug-manager-api/src/main/resources/application.properties`:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-character-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000
```

Thay thế:
- `your-email@gmail.com` bằng địa chỉ Gmail của bạn
- `your-16-character-app-password` bằng mật khẩu ứng dụng được tạo

### Bước 4: Khởi Động Lại Backend
```bash
cd drug-manager-api
mvn clean spring-boot:run
```

## Kiểm Tra

1. Truy cập trang đăng nhập → Nhấp "Quên mật khẩu?"
2. Nhập địa chỉ email (email bạn đã dùng đăng ký)
3. Kiểm tra hộp thư đến để nhận OTP
4. Nhập OTP trên trang quên mật khẩu
5. Đặt mật khẩu mới

## Khắc Phục Sự Cố

### Email không nhận được?
- Kiểm tra thư mục thư rác (Spam)
- Xác minh địa chỉ email chính xác
- Kiểm tra thông báo lỗi trong console server
- Đảm bảo mật khẩu ứng dụng Gmail được nhập đúng

### Lỗi "Less secure app access"?
- Sử dụng App Password thay vì mật khẩu Gmail (Bước 2 ở trên)
- Không bật "Less secure app access" - nó đã bị loại bỏ

### Hết thời gian kết nối?
- Kiểm tra kết nối internet
- Xác minh tường lửa cho phép SMTP trên cổng 587
- Thử cổng 465 với SSL (ít phổ biến)

## Các Nhà Cung Cấp Email Khác

### Outlook/Hotmail
```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
```

### Máy Chủ SMTP Tùy Chỉnh
```properties
spring.mail.host=your-smtp-server.com
spring.mail.port=587
spring.mail.username=your-username
spring.mail.password=your-password
```

## Ghi Chú Bảo Mật
- Không bao giờ commit thông tin xác thực email vào GitHub
- Sử dụng biến môi trường trong production:
```bash
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

Sau đó tham chiếu trong properties:
```properties
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

## Tính Năng
✅ OTP được gửi đến email người dùng
✅ OTP hết hạn sau 10 phút
✅ Email xác nhận đặt lại mật khẩu được gửi
✅ Cấu hình email an toàn
✅ Xử lý lỗi và ghi nhật ký
