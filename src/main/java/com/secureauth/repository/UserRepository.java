package com.secureauth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.secureauth.entity.Role;
import com.secureauth.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
	
	Optional<User> findByEmail(String email);
	
	boolean existsByEmail(String email);
	boolean existsByUsernameIgnoreCase(String username);
	
	long countByRole(Role role);
}
