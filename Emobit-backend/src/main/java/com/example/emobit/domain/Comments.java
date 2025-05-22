package com.example.emobit.domain;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
public class Comments {
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_comments")
    @SequenceGenerator(name = "seq_comments", sequenceName = "SEQ_COMMENTS", allocationSize = 1)
	@Column(name = "ID")
	private Long id;
	
	@Column(name = "CONTENT", columnDefinition = "CLOB", nullable = false)
	private String content;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CREATED_BY", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT), nullable = false)
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
	private Member member;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "BOARD_ID", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT), nullable = false)
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
	@JsonBackReference
	private Board board;
	
	@CreationTimestamp
	@Column(name = "CREATED_AT", nullable = false, updatable = false)
    private Date createdAt;
	
	@UpdateTimestamp
	@Column(name = "UPDATED_AT")
	private Date updatedAt;
}
