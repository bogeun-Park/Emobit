package com.example.emobit.domain;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.ConstraintMode;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
public class ChatMessage {
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_chat_message")
    @SequenceGenerator(name = "seq_chat_message", sequenceName = "SEQ_CHAT_MESSAGE", allocationSize = 1)
	@Column(name = "ID")
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CHAT_ROOM_ID", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT), nullable = false)
    private ChatRoom chatRoom;
	
	@Column(name = "SENDER", nullable = false)
	private String sender;
	
	@Column(name = "CONTENT", columnDefinition = "CLOB", nullable = false)
	private String content;
	
	@Column(name = "IS_READ", nullable = false)
	private boolean isRead = false;
	
	@CreationTimestamp
	@Column(name = "CREATED_AT", nullable = false, updatable = false)
    private Date createdAt;
}
