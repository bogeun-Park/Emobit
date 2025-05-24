package com.example.emobit.dto;

import java.util.Date;

import com.example.emobit.domain.Board;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BoardDto {
	private Long id;
	private String title;
	private String content;
	private Long createdBy;
	private String imageUrl;
	private int viewCount;
    private Date createdAt;
	private Date updatedAt;
	
	public BoardDto(Board board) {
		this.id = board.getId();
		this.title = board.getTitle();
		this.content = board.getContent();
		this.createdBy = board.getMember().getId();
		this.imageUrl = board.getImageUrl();
		this.viewCount = board.getViewCount();
		this.createdAt = board.getCreatedAt();
		this.updatedAt = board.getUpdatedAt();
	}
}
