package com.example.emobit.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
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
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "MEMBER_A_ID", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT), nullable = false)
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
	private Member memberA;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "MEMBER_B_ID", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT), nullable = false)
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
	private Member memberB;
	
	@Column(name = "MEMBER_A_JOINED", nullable = false)
	private boolean memberAJoined = false;

	@Column(name = "MEMBER_B_JOINED", nullable = false)
	private boolean memberBJoined = false;
	
	@Column(name = "MEMBER_A_EXITED_AT")
	private LocalDateTime memberAExitedAt;
	
	@Column(name = "MEMBER_B_EXITED_AT")
	private LocalDateTime memberBExitedAt;
	
	@CreationTimestamp
	@Column(name = "CREATED_AT", nullable = false, updatable = false)
    private Date createdAt;
	
	@ToString.Exclude
	@OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonBackReference
	private List<ChatMessage> chatMessages = new ArrayList<>();
}
