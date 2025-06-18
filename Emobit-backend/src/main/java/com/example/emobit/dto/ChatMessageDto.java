package com.example.emobit.dto;

import java.util.Date;

import com.example.emobit.domain.ChatMessage;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ChatMessageDto {
	private Long id;
	private Long chatRoomId;
	private String sender;
	private String content;	
	private boolean isRead = false;
    private Date createdAt;
    
    public ChatMessageDto(ChatMessage chatMessage) {
    	this.id =  chatMessage.getId();
    	this.chatRoomId = chatMessage.getChatRoom().getId();
    	this.sender = chatMessage.getSender();
    	this.content = chatMessage.getContent();
    	this.isRead = chatMessage.isRead();
    	this.createdAt = chatMessage.getCreatedAt();
    }
}
