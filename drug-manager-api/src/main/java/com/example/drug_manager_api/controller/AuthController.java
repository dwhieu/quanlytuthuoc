package com.example.drug_manager_api.controller;

import com.example.drug_manager_api.model.User;
import com.example.drug_manager_api.model.ErrorResponse;
import com.example.drug_manager_api.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private com.example.drug_manager_api.util.JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        String message = authService.register(user);
        if (message != null && message.toLowerCase().contains("thành công")) {
            return ResponseEntity.ok(message);
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(message);
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<?> oauthGoogle(@RequestBody IdTokenRequest req) {
        if (req == null || req.getIdToken() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Missing idToken"));
        }
        try {
            String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + req.getIdToken();
            java.net.URL url = new java.net.URL(tokenInfoUrl);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            int code = conn.getResponseCode();
            if (code != 200) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid ID token");
            }

            java.io.InputStream is = conn.getInputStream();
            java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(is));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
            String body = sb.toString();

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> map = mapper.readValue(body, java.util.Map.class);

            String email = (String) map.get("email");
            String name = (String) map.get("name");
            String picture = map.get("picture") != null ? (String) map.get("picture") : null;
            logger.info("Google OAuth: email='{}' name='{}' picture='{}'", email, name, picture);

            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("ID token missing email");
            }

            String username = email;
            User u = authService.createOrGetUserFromOAuth(username, name, email, picture, "google");
            String token = jwtUtil.generateToken(u.getUsername());
            java.util.Map<String, String> resp = new java.util.HashMap<>();
            resp.put("token", token);
            resp.put("username", u.getUsername());
            if (u.getAvatarUrl() != null) resp.put("avatar", u.getAvatarUrl());
            return ResponseEntity.ok(mapper.writeValueAsString(resp));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error validating token");
        }
    }

    @PostMapping("/oauth/facebook")
    public ResponseEntity<?> oauthFacebook(@RequestBody FacebookTokenRequest req) {
        if (req == null || req.getAccessToken() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Missing accessToken"));
        }
        try {
            // request picture with reasonable size
            String graphUrl = "https://graph.facebook.com/me?fields=id,name,email,picture.width(480){url}&access_token=" + req.getAccessToken();
            java.net.URL url = new java.net.URL(graphUrl);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            int code = conn.getResponseCode();
            if (code != 200) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Facebook access token");
            }
            java.io.InputStream is = conn.getInputStream();
            java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(is));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
            String body = sb.toString();

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> map = mapper.readValue(body, java.util.Map.class);

            String email = (String) map.get("email");
            String name = (String) map.get("name");
            String id = (String) map.get("id");
            // extract picture url from nested map: picture -> data -> url
            String pictureUrl = null;
            try {
                Object picObj = map.get("picture");
                if (picObj instanceof java.util.Map) {
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, Object> picMap = (java.util.Map<String, Object>) picObj;
                    Object dataObj = picMap.get("data");
                    if (dataObj instanceof java.util.Map) {
                        @SuppressWarnings("unchecked")
                        java.util.Map<String, Object> dataMap = (java.util.Map<String, Object>) dataObj;
                        Object urlObj = dataMap.get("url");
                        if (urlObj instanceof String) pictureUrl = (String) urlObj;
                    }
                }
            } catch (Exception ignored) {}
            if (id == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Facebook token missing id");
            }

            String username = email != null ? email : "fb_" + id;
            User u = authService.createOrGetUserFromOAuth(username, name, email, pictureUrl, "facebook");
            String token = jwtUtil.generateToken(u.getUsername());
            java.util.Map<String, String> resp = new java.util.HashMap<>();
            resp.put("token", token);
            resp.put("username", u.getUsername());
            if (u.getAvatarUrl() != null) resp.put("avatar", u.getAvatarUrl());
            return ResponseEntity.ok(mapper.writeValueAsString(resp));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error validating Facebook token");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User loginRequest) {
        String message = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (message == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi máy chủ");
        }
        if (message.equals("Đăng nhập thành công!")) {
            return ResponseEntity.ok(message);
        }
        if (message.equals("Tài khoản không tồn tại!")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(message);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(message);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUser(@PathVariable String username) {
        User user = authService.getByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại");
        }
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/user/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User user) {
        try {
            User updated = authService.updateUser(username, user);
            if (updated == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại");
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi máy chủ");
        }
    }

    @PutMapping("/user/{username}/password")
    public ResponseEntity<String> changePassword(@PathVariable String username, @RequestBody PasswordChangeRequest req) {
        if (req == null || req.getCurrentPassword() == null || req.getNewPassword() == null) {
            return ResponseEntity.badRequest().body("Yêu cầu không hợp lệ");
        }
        boolean ok = authService.changePassword(username, req.getCurrentPassword(), req.getNewPassword());
        if (!ok) {
            if (authService.getByUsername(username) == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại");
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mật khẩu hiện tại không đúng");
        }
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }

    public static class PasswordChangeRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class IdTokenRequest {
        private String idToken;

        public String getIdToken() { return idToken; }
        public void setIdToken(String idToken) { this.idToken = idToken; }
    }

    public static class FacebookTokenRequest {
        private String accessToken;
        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    }
}
