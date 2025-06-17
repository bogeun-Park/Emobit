package com.example.emobit.domain;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
	
	@Column(name = "USER_A_JOINED", nullable = false)
	private boolean userAJoined = false;

	@Column(name = "USER_B_JOINED", nullable = false)
	private boolean userBJoined = false;
	
	@CreationTimestamp
	@Column(name = "CREATED_AT", nullable = false, updatable = false)
    private Date createdAt;
	
	@ToString.Exclude
	@OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonBackReference
	private List<ChatMessage> chatMessages = new ArrayList<>();
}
