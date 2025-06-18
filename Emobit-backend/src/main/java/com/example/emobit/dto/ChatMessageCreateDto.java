package com.example.emobit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ChatMessageCreateDto {
	@NotBlank(message = "Title name is required")
	private String sender;
	
	@NotBlank(message = "Content name is required")
    private String content;
	
	@NotNull(message = "ChatRoomId name is required")
    private Long chatRoomId;
	
	@NotBlank(message = "CreatedAt name is required")
    private String createdAt;
}
