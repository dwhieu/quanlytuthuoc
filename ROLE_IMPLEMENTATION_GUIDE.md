# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG PHÂN QUYỀN

## Tổng quan

Hệ thống hiện tại đã được cập nhật để hỗ trợ:
- **Admin Dashboard**: Chỉ admin có thể truy cập (/dashboard, /drugs, /patients, etc.)
- **User Dashboard**: User bình thường xem thông tin cá nhân (/user-dashboard)
- **Automatic Role-based Routing**: Tự động điều hướng đến trang phù hợp dựa trên role

## Thay đổi Backend (Java Spring Boot)

### 1. User Model
- Thêm field `role` với giá trị mặc định là `"user"`
- File: `drug_manager_api/src/main/java/com/example/drug_manager_api/model/User.java`

### 2. AuthController Endpoints
Tất cả endpoint auth đều trả về role:
- POST `/api/auth/login` - Trả về User object có role
- POST `/api/auth/oauth/google` - Trả về JSON với role
- POST `/api/auth/oauth/facebook` - Trả về JSON với role

## Thay đổi Frontend (React)

### 1. AuthContext (`src/context/AuthContext.tsx`)
- Thêm state `role` để lưu role người dùng
- Thêm method `isAdmin()` để kiểm tra xem user có phải admin không
- Cập nhật `login()` và `loginWithToken()` để nhận role parameter

### 2. ProtectedRoute Component (`src/components/ProtectedRoute.tsx`)
- Component mới để bảo vệ các route chỉ dành cho admin
- Redirect non-admin users đến `/user-dashboard`

### 3. UserDashboard Page (`src/pages/UserDashboard.tsx`)
- Trang mới cho user bình thường
- Hiển thị thông tin cá nhân
- Lịch sử đơn hàng (đã chuẩn bị)
- Danh sách yêu thích (đã chuẩn bị)

### 4. AppRouter Update (`src/AppRouter.tsx`)
- Thêm route mới: `/user-dashboard`
- Bọc tất cả admin routes (dashboard, drugs, patients, etc.) với ProtectedRoute

### 5. LoginPage Update (`src/pages/LoginPage.tsx`)
- Tự động điều hướng dựa trên role:
  - Admin → `/dashboard`
  - User → `/user-dashboard`

### 6. OAuth Callbacks
- Cập nhật cả Google và Facebook callbacks để xử lý role

## Thiết lập Ban Đầu

### Bước 1: Cập nhật Database
Chạy script SQL để đặt role cho user hiện tại:

```sql
UPDATE users SET role = 'admin' WHERE username = 'admin_username';
```

Hoặc tạo user admin mới (yêu cầu password được hash):

```sql
INSERT INTO users (full_name, username, password, role, auth_provider) 
VALUES ('Admin User', 'admin', '[HASHED_PASSWORD]', 'admin', 'local');
```

### Bước 2: Compile Backend
```bash
cd drug-manager-api
mvn clean compile
mvn spring-boot:run
```

### Bước 3: Start Frontend
```bash
cd quanlytuthuoc
npm start
```

## Kiểm tra Chức Năng

### Đăng nhập với Admin Account
1. Nhập username/password của admin
2. Nên được điều hướng đến `/dashboard`
3. Có thể truy cập tất cả admin pages: /drugs, /patients, /profile, /statistical

### Đăng nhập với User Account
1. Nhập username/password của user bình thường
2. Nên được điều hướng đến `/user-dashboard`
3. Nếu cố truy cập /dashboard, sẽ bị redirect về `/user-dashboard`

### Logout
1. Sau khi logout, tất cả thông tin được xóa khỏi localStorage
2. Được redirect về trang chủ
3. Các protected routes yêu cầu login lại

## Cấu trúc API Response

### Login Response (JSON)
```json
{
  "id": 1,
  "username": "admin",
  "fullName": "Administrator",
  "email": "admin@example.com",
  "role": "admin",
  "avatarUrl": "https://...",
  "authProvider": "local"
}
```

### OAuth Response (JSON)
```json
{
  "token": "jwt_token_here",
  "username": "user@example.com",
  "fullName": "User Full Name",
  "role": "user",
  "avatar": "https://..."
}
```

## Lưu Ý Quan Trọng

1. **Role Comparison**: Backend có thể trả về "admin" hoặc "ADMIN", frontend kiểm tra cả hai
2. **Default Role**: Tất cả user mới được tạo mặc định có role = "user"
3. **Token Persistence**: Role được lưu trong localStorage và khôi phục khi page reload
4. **Logout Cleanup**: Xóa role khỏi localStorage khi user logout

## Mở Rộng Sau Này

- Thêm role như: "doctor", "pharmacist", "customer" (sửa ProtectedRoute)
- Thêm permission system (admin có thể quản lý user roles)
- Thêm audit logging cho các hành động của admin
- Thêm RBAC (Role-Based Access Control) chi tiết hơn
