package com.secureauth.service;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.secureauth.dto.AuthResponse;
import com.secureauth.dto.LoginRequest;
import com.secureauth.dto.RegisterRequest;
import com.secureauth.entity.RefreshToken;
import com.secureauth.entity.Role;
import com.secureauth.entity.User;
import com.secureauth.repository.UserRepository;
import com.secureauth.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            RefreshTokenService refreshTokenService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public String register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUsername().trim();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username is already taken");
        }

        User user = new User();

        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Public registration always creates USER.
        user.setRole(Role.USER);
        user.setEnabled(true);

        userRepository.save(user);

        return "Registration successful";
    }

    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String accessToken = jwtService.generateToken(toUserDetails(user));
        String refreshToken = refreshTokenService.create(user).getToken();

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public Map<String, String> refresh(String value) {

        RefreshToken old = refreshTokenService.verify(value);
        User user = old.getUser();

        if (!user.isEnabled()) {
            refreshTokenService.delete(old);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account is disabled");
        }

        // Rotation: the old refresh token is single-use
        refreshTokenService.delete(old);
        RefreshToken fresh = refreshTokenService.create(user);

        String accessToken = jwtService.generateToken(toUserDetails(user));

        return Map.of(
                "token", accessToken,
                "refreshToken", fresh.getToken()
        );
    }

    public void logout(String value) {
        refreshTokenService.deleteByToken(value);
    }

    // Same UserDetails shape your login already used, now shared by login and refresh
    private UserDetails toUserDetails(User user) {
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .disabled(!user.isEnabled())
                .build();
    }
}