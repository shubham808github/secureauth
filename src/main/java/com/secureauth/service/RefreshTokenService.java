package com.secureauth.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.secureauth.entity.RefreshToken;
import com.secureauth.entity.User;
import com.secureauth.repository.RefreshTokenRepository;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public RefreshToken create(User user) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryDate(Instant.now().plusMillis(refreshExpirationMs));
        return repository.save(token);
    }

    @Transactional
    public RefreshToken verify(String value) {
        RefreshToken token = repository.findByToken(value)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (token.getExpiryDate().isBefore(Instant.now())) {
            repository.delete(token);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }
        return token;
    }

    @Transactional
    public void delete(RefreshToken token) {
        repository.delete(token);
    }

    @Transactional
    public void deleteByToken(String value) {
        repository.deleteByToken(value);
    }
}