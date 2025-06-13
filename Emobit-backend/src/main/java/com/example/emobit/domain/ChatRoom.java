package com.example.emobit.domain;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
public class ChatRoom {
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_chat_room")
    @SequenceGenerator(name = "seq_chat_room", sequenceName = "SEQ_CHAT_ROOM", allocationSize = 1)
	@Column(name = "ID")
	private Long id;
	
	@Column(name = "USER_A", nullable = false)
	private String userA;
	
	@Column(name = "USER_B", nullable = false)
	private String userB;
	
	@CreationTimestamp
	@Column(name = "CREATED_AT", nullable = false, updatable = false)
    private Date createdAt;
}
