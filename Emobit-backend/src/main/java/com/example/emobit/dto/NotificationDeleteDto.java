package com.example.emobit.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class NotificationDeleteDto {
	Long receiverId;
	Long deletedId;
	
	public NotificationDeleteDto(Long receiverId, Long deletedId) {
		this.receiverId = receiverId;
		this.deletedId = deletedId;
	}
}
