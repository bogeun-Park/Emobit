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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
@Table(name = "FOLLOW", uniqueConstraints = { @UniqueConstraint(columnNames = {"FOLLOWER", "FOLLOWING"}) })
public class Follow {
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_follow")
    @SequenceGenerator(name = "seq_follow", sequenceName = "SEQ_FOLLOW", allocationSize = 1)
	@Column(name = "ID")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "FOLLOWER", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT), nullable = false)
	private Member follower; // 팔로우 하는 사람

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "FOLLOWING", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT), nullable = false)
	private Member following; // 팔로우 당하는 사람

	@CreationTimestamp
	@Column(name = "CREATED_AT", nullable = false, updatable = false)
    private Date createdAt;
}
