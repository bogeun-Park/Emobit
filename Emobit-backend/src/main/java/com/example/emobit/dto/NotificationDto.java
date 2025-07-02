package com.example.emobit.dto;

import java.util.Date;

import com.example.emobit.domain.Notification;
import com.example.emobit.enums.NotificationType;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class NotificationDto {
	private Long id;
	private MemberAuthDto sender;
	private NotificationType type;
	private Long targetId;
	private String content;
	private boolean isRead;
    private Date createdAt;
    
    public NotificationDto(Notification notification) {
    	this.id = notification.getId();
    	this.sender = new MemberAuthDto(notification.getSender());
    	this.type = notification.getType();
    	this.targetId = notification.getTargetId();
    	this.content = notification.getContent();
    	this.isRead = notification.isRead();
    	this.createdAt = notification.getCreatedAt();
    }
}
