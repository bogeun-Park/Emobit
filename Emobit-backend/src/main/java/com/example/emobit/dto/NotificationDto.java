package com.example.emobit.dto;

import java.util.Date;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Comments;
import com.example.emobit.domain.Notification;
import com.example.emobit.enums.NotificationType;
import com.example.emobit.util.Constant;

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
	private Long boardId;
	private String imageUrl;
	private boolean isRead;
    private Date createdAt;
    
    public NotificationDto(Notification notification, Board board, Comments comment) {
    	this.id = notification.getId();
    	this.sender = new MemberAuthDto(notification.getSender());
    	this.type = notification.getType();
    	this.targetId = notification.getTargetId();
    	this.content = (comment != null) ? comment.getContent() : null;
    	this.boardId = board.getId();
    	this.imageUrl = Constant.Oracle_Storage_ORIGIN + board.getImagePath();
    	this.isRead = notification.isRead();
    	this.createdAt = notification.getCreatedAt();
    }
}
