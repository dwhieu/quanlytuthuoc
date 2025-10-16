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
        // registration via form -> local provider
        user.setAuthProvider("local");
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
    if (newData.getAvatarUrl() != null) user.setAvatarUrl(newData.getAvatarUrl());

        userRepository.save(user);
        // don't return password
        user.setPassword(null);
        return user;
    }

    /**
     * Create or return an existing user based on OAuth provider info. Password is left null.
     * @param username suggested username (e.g., email)
     * @param fullName display name
     * @param email email address
     * @return existing or newly-created User
     */
    public User createOrGetUserFromOAuth(String username, String fullName, String email, String avatarUrl, String provider) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            // if OAuth provides an avatar and we don't have one (or it's different), update it
            boolean needSave = false;
            if (avatarUrl != null && (user.getAvatarUrl() == null || !avatarUrl.equals(user.getAvatarUrl()))) {
                user.setAvatarUrl(avatarUrl);
                needSave = true;
            }
            // ensure authProvider is set for existing oauth-created users
            if (user.getAuthProvider() == null) {
                user.setAuthProvider(provider != null ? provider : "google");
                needSave = true;
            }
            if (needSave) {
                userRepository.save(user);
            }
            user.setPassword(null);
            return user;
        }

        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setFullName(fullName != null ? fullName : username);
        u.setPassword(null);
        u.setAvatarUrl(avatarUrl);
        u.setAuthProvider(provider != null ? provider : "google");
        userRepository.save(u);
        u.setPassword(null);
        return u;
    }

    /**
     * Change the password for an existing user.
     * @param username the username
     * @param currentPassword the user's current plain password
     * @param newPassword the new plain password
     * @return true if changed successfully, false if user not found or current password wrong
     */
    public boolean changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return false;
        // Do not allow password changes for OAuth users
        if (user.getAuthProvider() != null && !"local".equalsIgnoreCase(user.getAuthProvider())) {
            return false;
        }
        // verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) return false;
        // encode and set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }
}
