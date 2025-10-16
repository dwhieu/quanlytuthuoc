package com.example.drug_manager_api.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret:change-this-secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms:86400000}") // 1 day
    private long expirationMs;

    private Key key;

    @PostConstruct
    public void init() {
        // If the secret is long enough, use it; otherwise derive a key
        if (secret != null && secret.length() >= 32) {
            key = Keys.hmacShaKeyFor(secret.getBytes());
        } else {
            key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }
}
