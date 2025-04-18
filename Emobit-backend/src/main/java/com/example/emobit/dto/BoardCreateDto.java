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
	
	@NotBlank(message = "Conmtent name is required")
    String content;
    
	@NotBlank(message = "CreatedBy name is required")
    String createdBy;
}
