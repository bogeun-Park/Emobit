package com.example.emobit.domain;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;

import com.example.emobit.enums.NotificationType;

import jakarta.persistence.Column;
import jakarta.persistence.ConstraintMode;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
public class Notification {
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_notification")
    @SequenceGenerator(name = "seq_notification", sequenceName = "SEQ_NOTIFICATION", allocationSize = 1)
	@Column(name = "ID")
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "RECEIVER", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT), nullable = false)
	private Member receiver; // 알림을 받을 사용자
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "SENDER", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT), nullable = false)
	private Member sender; // 알림을 보낸 사용자
	
	@Enumerated(EnumType.STRING)
    @Column(name = "TYPE", nullable = false)
	private NotificationType type;
    
	@Column(name = "TARGET_ID", nullable = false)
	private Long targetId;
	
	@Column(name = "CONTENT")
	private String content;
	
	@Column(name = "IS_READ", nullable = false)
	private boolean isRead = false;
	
	@CreationTimestamp
	@Column(name = "CREATED_AT", nullable = false, updatable = false)
    private Date createdAt;
}
