package com.example.emobit.domain;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;

import com.example.emobit.enums.LikeType;

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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
@Table(name = "LIKES", uniqueConstraints = { @UniqueConstraint(columnNames = {"SENDER", "TYPE", "TARGET_ID"}) })
public class Likes {
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_likes")
    @SequenceGenerator(name = "seq_likes", sequenceName = "SEQ_LIKES", allocationSize = 1)
	@Column(name = "ID")
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "SENDER", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT), nullable = false)
	private Member sender;
	
	@Enumerated(EnumType.STRING)
    @Column(name = "TYPE", nullable = false)
	private LikeType type;
	
	@Column(name = "TARGET_ID", nullable = false)
	private Long targetId;
	
	@CreationTimestamp
	@Column(name = "CREATED_AT", nullable = false, updatable = false)
    private Date createdAt;
}
