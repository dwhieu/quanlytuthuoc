# Quick Setup Guide - Hướng Dẫn Cấu Hình Nhanh

## 1️⃣ Backend Setup (Java)

### Bước 1: Cập nhật Database
Chạy SQL command để set role cho user hiện tại:

```sql
-- Connect to your database first
-- Update existing user to admin
UPDATE users SET role = 'admin' WHERE username = 'your_admin_username';

-- Or insert new admin (nếu cần)
INSERT INTO users (full_name, username, password, role, auth_provider, email) 
VALUES ('Admin User', 'admin', 'your_hashed_password', 'admin', 'local', 'admin@example.com');
```

### Bước 2: Compile & Run
```bash
cd drug-manager-api

# Clean and compile
mvn clean compile

# Run the application
mvn spring-boot:run

# Server should start on port 8000
# You should see: "Started DrugManagerApiApplication in X seconds"
```

## 2️⃣ Frontend Setup (React)

### Bước 1: Install Dependencies
```bash
cd quanlytuthuoc

npm install
# or
npm i
```

### Bước 2: Start Development Server
```bash
npm start

# App should open in browser at http://localhost:3000
```

## 3️⃣ Test the Implementation

### Test Case 1: Admin Access ✓
1. Open http://localhost:3000
2. Click "Đăng nhập"
3. Enter admin credentials:
   - Username: `admin` (or your admin account)
   - Password: `your_admin_password`
4. Expected: Redirected to `/dashboard` (Admin Panel)
5. Can access: Dashboard, Drugs, Patients, Profile, Statistical

### Test Case 2: User Access ✓
1. Open http://localhost:3000
2. Click "Đăng nhập"
3. Enter user credentials:
   - Username: `user` (or any non-admin account)
   - Password: `user_password`
4. Expected: Redirected to `/user-dashboard` (User Dashboard)
5. Cannot access admin pages

### Test Case 3: Unauthorized Access ✓
1. Logged out or not logged in
2. Try to access http://localhost:3000/dashboard
3. Expected: Redirected to `/login`

### Test Case 4: Non-Admin User Protection ✓
1. Login as regular user
2. Try to access http://localhost:3000/dashboard
3. Expected: Redirected back to `/user-dashboard`

## 📁 File Structure After Implementation

```
quanlytuthuoc/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.tsx ✨ NEW
│   │   ├── Dashboard.tsx
│   │   ├── Layout.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── UserDashboard.tsx ✨ NEW
│   │   ├── LoginPage.tsx (UPDATED)
│   │   ├── OAuthCallback.tsx (UPDATED)
│   │   └── ...
│   ├── styles/
│   │   ├── UserDashboard.css ✨ NEW
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.tsx (UPDATED)
│   ├── AppRouter.tsx (UPDATED)
│   └── ...
└── ...

drug-manager-api/
├── src/
│   └── main/
│       ├── java/com/example/drug_manager_api/
│       │   ├── model/User.java (UPDATED)
│       │   ├── controller/AuthController.java (UPDATED)
│       │   └── ...
│       └── resources/
│           └── setup_admin.sql ✨ NEW
└── ...
```

## 🔍 Debugging Tips

### If Admin cannot access dashboard:
1. Check localStorage: Open DevTools → Application → Local Storage
2. Verify role value: `role: "admin"`
3. Check browser console for errors (F12)
4. Verify backend returns role in response (Network tab)

### If User is redirected to dashboard:
1. Check database: Is user role = "admin"?
2. Verify API response includes role
3. Clear localStorage and login again

### If login fails:
1. Verify Java backend is running on port 8000
2. Check Network tab in DevTools
3. Look for CORS errors (should be allowed for localhost:3000)

## 📊 Database Verification

To check current roles in database:
```sql
-- Check all users and their roles
SELECT id, username, full_name, role, auth_provider FROM users;

-- Check only admins
SELECT id, username, full_name FROM users WHERE role = 'admin';

-- Check only regular users
SELECT id, username, full_name FROM users WHERE role = 'user';
```

## 🎨 Customization

### Change Admin Redirect Destination
File: `src/pages/LoginPage.tsx`
```typescript
if (userRole === 'admin' || userRole === 'ADMIN') {
    navigate('/dashboard');  // Change this path
} else {
    navigate('/user-dashboard');
}
```

### Add More User Roles
File: `src/components/ProtectedRoute.tsx`
```typescript
// Extend to support more roles
const requiredRoles = ['admin', 'manager'];
if (requireAdmin && !requiredRoles.includes(role?.toLowerCase())) {
    return <Navigate to="/user-dashboard" replace />;
}
```

### Modify UserDashboard UI
File: `src/pages/UserDashboard.tsx`
- Change sidebar menu items
- Add more sections
- Integrate with backend API

## ✅ Checklist Before Production

- [ ] Admin role configured in database
- [ ] Backend compiled and running
- [ ] Frontend dependencies installed
- [ ] No console errors on login
- [ ] Admin can access all pages
- [ ] User cannot access admin pages
- [ ] Logout works correctly
- [ ] OAuth (Google/Facebook) works with role
- [ ] Session persists after page reload
- [ ] Role-based redirect works

## 📞 Support

If you encounter issues:
1. Check the error logs in browser console (F12)
2. Check Java backend logs for API errors
3. Verify database has role field and values
4. Clear browser cache/localStorage and try again
5. Check CORS configuration if you get network errors

---

**Last Updated**: December 2, 2025
**Version**: 1.0
