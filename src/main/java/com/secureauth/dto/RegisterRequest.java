package com.secureauth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

	@NotBlank(message = "Username is required")
	@Size(min = 3, max = 100, message = "Username must be 3-100 characters")
	private String username;

	@NotBlank(message = "Email is required")
	@Email(message = "Enter a valid email")
	private String email;

	@NotBlank(message = "Password is required")
	@Size(min = 8, max = 72, message = "Password must be 8-72 characters")
	private String password;
}



