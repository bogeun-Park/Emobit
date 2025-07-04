package com.example.emobit.dto;

import com.example.emobit.enums.LikeType;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class LikeRequestDto {
	@NotNull(message = "LikeType name is required")
	LikeType type;
	
	@NotNull(message = "TargetId name is required")
	private Long targetId;
}
