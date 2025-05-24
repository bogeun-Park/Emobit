package com.example.emobit.domain;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
	
	@Column(name = "CREATED_BY", nullable = false)
	private Long createdBy;
	
	@Column(name = "IMAGEURL")
	private String imageUrl;
	
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
	@JsonManagedReference  // 무한 순환 참조 방지 : comments는 json 데이터로 넘어감
	private List<Comments> comments = new ArrayList<>();
	
	// 이미지 URL 기본값 설정
    @PrePersist
    public void prePersist() {
        if (this.imageUrl == null || this.imageUrl.isEmpty()) {
            this.imageUrl = "https://objectstorage.ap-chuncheon-1.oraclecloud.com/n/axsd3bml0uow/b/EmobitBucket/o/board/8225153c-f63a-4f04-8767-15a20c7d5163.png";
        }
    }
}
