package com.example.emobit.dto;

import java.time.LocalDateTime;
import java.util.Date;

import com.example.emobit.domain.ChatRoom;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ChatRoomDto {
	private Long id;
	private MemberAuthDto userA;
	private MemberAuthDto userB;
	private boolean userAJoined = false;
	private boolean userBJoined = false;
	private LocalDateTime userAExitedAt;
	private LocalDateTime userBExitedAt;
    private Date createdAt;
    
    public ChatRoomDto(ChatRoom chatRoom) {
    	this.id = chatRoom.getId();
		this.userA = new MemberAuthDto(chatRoom.getUserA());
		this.userB = new MemberAuthDto(chatRoom.getUserB());
		this.userAJoined = chatRoom.isUserAJoined();
		this.userBJoined = chatRoom.isUserBJoined();
		this.userAExitedAt = chatRoom.getUserAExitedAt();
		this.userBExitedAt = chatRoom.getUserBExitedAt();
		this.createdAt = chatRoom.getCreatedAt();
    }
}
