package com.secureauth.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.secureauth.dto.AdminStatsResponse;
import com.secureauth.dto.UpdateRoleRequest;
import com.secureauth.dto.UserResponse;
import com.secureauth.entity.Role;
import com.secureauth.entity.User;
import com.secureauth.repository.RefreshTokenRepository;
import com.secureauth.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AdminController(UserRepository userRepository,
                           RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        long admins = userRepository.countByRole(Role.ADMIN);
        long users = userRepository.countByRole(Role.USER);
        return new AdminStatsResponse(userRepository.count(), admins, users);
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @PutMapping("/users/{id}/role")
    public UserResponse updateRole(@PathVariable Long id,
                                   @Valid @RequestBody UpdateRoleRequest request,
                                   Authentication authentication) {
        User user = findUser(id);
        ensureNotSelf(user, authentication, "You cannot change your own role");

        user.setRole(request.getRole());
        return toResponse(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id,
                                                          Authentication authentication) {
        User user = findUser(id);
        ensureNotSelf(user, authentication, "You cannot delete your own account");

        refreshTokenRepository.deleteByUser(user);   // remove sessions first (foreign key)
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    // ---------- helpers ----------
    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void ensureNotSelf(User target, Authentication auth, String message) {
        if (target.getEmail().equalsIgnoreCase(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getEmail(), u.getRole().name());
    }
}