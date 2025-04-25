package com.example.emobit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BoardCreateDto {
	@NotBlank(message = "Title name is required")
	String title;
	
	@NotBlank(message = "Content name is required")
    String content;
	
	String imageUrl;
}
