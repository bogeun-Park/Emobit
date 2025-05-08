package com.example.emobit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CommentsCreateDto {	
	@NotBlank(message = "Content name is required")
    String content;
	
	@NotNull(message = "BoardId name is required")
	Long boardId;
}
