package com.example.emobit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MemberLoginDto {
	@NotBlank(message = "Username name is required")
	private String username;
	
	@NotBlank(message = "Password name is required")
	private String password;
}
