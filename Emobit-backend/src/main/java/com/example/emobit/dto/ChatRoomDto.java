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
	private MemberAuthDto memberA;
	private MemberAuthDto memberB;
	private boolean memberAJoined = false;
	private boolean memberBJoined = false;
	private LocalDateTime memberAExitedAt;
	private LocalDateTime memberBExitedAt;
    private Date createdAt;
    private String lastMessage;
    private Date lastMessageTime;
    private int unreadCount;
    
    public ChatRoomDto(ChatRoom chatRoom, String lastMessage, Date lastMessageTime, int unreadCount) {
    	this.id = chatRoom.getId();
		this.memberA = new MemberAuthDto(chatRoom.getMemberA());
		this.memberB = new MemberAuthDto(chatRoom.getMemberB());
		this.memberAJoined = chatRoom.isMemberAJoined();
		this.memberBJoined = chatRoom.isMemberBJoined();
		this.memberAExitedAt = chatRoom.getMemberAExitedAt();
		this.memberBExitedAt = chatRoom.getMemberBExitedAt();
		this.createdAt = chatRoom.getCreatedAt();
		this.lastMessage = lastMessage;
		this.lastMessageTime = lastMessageTime;
		this.unreadCount = unreadCount;
    }
}
