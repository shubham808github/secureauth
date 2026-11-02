package com.secureauth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.secureauth.entity.RefreshToken;
import com.secureauth.entity.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByToken(String token);

    void deleteByUser(User user);
}