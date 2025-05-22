package com.example.emobit.domain;

import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
	
	// 이미지 URL 기본값 설정
    @PrePersist
    public void prePersist() {
        if (this.imageUrl == null || this.imageUrl.isEmpty()) {
            this.imageUrl = "https://axsd3bml0uow.objectstorage.ap-chuncheon-1.oci.customer-oci.com/n/axsd3bml0uow/b/EmobitBucket/o/board%2Fde7e0f0e-c177-4aba-8410-940eed5af456.png";
        }
    }
}
