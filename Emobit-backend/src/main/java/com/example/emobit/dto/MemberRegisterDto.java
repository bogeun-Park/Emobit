package com.example.emobit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MemberRegisterDto {
	@NotBlank(message = "Display name is required")
	String displayName;
	
    @NotBlank(message = "Username is required")
    String username;
	
    @NotBlank(message = "Password is required")
    String password;
}
