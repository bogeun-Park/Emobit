package com.example.emobit.dto;

import java.util.Date;

import com.example.emobit.domain.Comments;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CommentsDto {
	private Long id;
	private String content;
	private Long boardId;
	private Date createdAt;
	private Date updatedAt;
	private Long createdBy;
	private String memberUsername;
	private String memberDisplayName;
	private String memberImageUrl;
	
	public CommentsDto(Comments comment) {
		this.id = comment.getId();
		this.content = comment.getContent();
		this.boardId = comment.getBoard().getId();
		this.createdAt = comment.getCreatedAt();
		this.updatedAt = comment.getUpdatedAt();
		this.createdBy = comment.getMember().getId();
		this.memberUsername = comment.getMember().getUsername();
		this.memberDisplayName = comment.getMember().getDisplayName();
		this.memberImageUrl = comment.getMember().getImageUrl();
	}
}
