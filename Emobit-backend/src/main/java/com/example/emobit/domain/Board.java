package com.example.emobit.domain;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.example.emobit.util.Constant;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
public class Board {
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_board")
    @SequenceGenerator(name = "seq_board", sequenceName = "SEQ_BOARD", allocationSize = 1)
	@Column(name = "ID")
	private Long id;
	
	@Column(name = "TITLE", nullable = false)
	private String title;
	
	@Column(name = "CONTENT", columnDefinition = "CLOB", nullable = false)
	private String content;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CREATED_BY", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT), nullable = false)
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
	@JsonBackReference  // member 자체 값을 안보내고 BoardDto에서 createdBy로 바꿔서 보냄
	private Member member;
	
	@Column(name = "IMAGE_PATH")
	private String imagePath = Constant.BOARD_DEFAULT_IMAGE_PATH;
	
	@Column(name = "VIEW_COUNT", nullable = false)
	private int viewCount = 0;
	
	@CreationTimestamp
	@Column(name = "CREATED_AT", nullable = false, updatable = false)
    private Date createdAt;
	
	@UpdateTimestamp
	@Column(name = "UPDATED_AT")
	private Date updatedAt;
	
	@ToString.Exclude
	@OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonBackReference
	private List<Comments> comments = new ArrayList<>();
	
	// 이미지 URL 기본값 설정
    @PrePersist
    public void prePersist() {
        if (this.imagePath == null || this.imagePath.isEmpty()) {
            this.imagePath = Constant.BOARD_DEFAULT_IMAGE_PATH;
        }
    }
}
