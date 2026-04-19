package com.example.drug_manager_api.repository;

import com.example.drug_manager_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByFullNameIgnoreCase(String fullName);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
