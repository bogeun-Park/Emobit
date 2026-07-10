package com.example.emobit.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class FollowRequestDto {
	@NotNull(message = "TargetId name is required")
	private Long targetId;
}
