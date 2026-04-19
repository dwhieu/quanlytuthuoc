# Drug Manager API

Hệ thống quản lý tủ thuốc cá nhân và quản lý bệnh nhân tích hợp trừ kho tự động.

## Công nghệ sử dụng
- Java 17
- Spring Boot 3.x
- Spring Data JPA (MySQL)
- Spring Security (JWT)
- Lombok

## Chức năng chính
- Quản lý danh mục thuốc: Thêm, sửa, xóa, theo dõi tồn kho và hạn sử dụng.
- Quản lý bệnh nhân: Lưu trữ thông tin bệnh nhân và đơn thuốc đang sử dụng.
- Tự động trừ kho: Khi thêm/sửa bệnh nhân, hệ thống tự động trừ số lượng thuốc tương ứng trong kho.
- Xác thực người dùng: Đăng ký, đăng nhập JWT, đổi mật khẩu và khôi phục qua OTP Email.

## Cấu hình
1. Cấu hình cơ sở dữ liệu MySQL trong file `src/main/resources/application.properties`.
2. Cấu hình SMTP Email để sử dụng tính năng gửi mã OTP.
3. Chạy lệnh `mvn spring-boot:run` để khởi động ứng dụng.

## API Endpoints
- Auth: `/api/auth/**`
- Thuốc: `/api/drugs/**`
- Bệnh nhân: `/api/patients/**`
