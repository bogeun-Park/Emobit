package com.example.emobit.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.emobit.domain.Comments;
import com.example.emobit.domain.Member;
import com.example.emobit.dto.CommentsCreateDto;
import com.example.emobit.dto.CommentsDto;
import com.example.emobit.dto.CommentsUpdateDto;
import com.example.emobit.security.CustomUser;
import com.example.emobit.service.CommentsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {
	private final CommentsService commentsService;
	
	@GetMapping("/comments/{boardId}")
	public ResponseEntity<?> getComment(@PathVariable("boardId") Long boardId) {
		List<Comments> comments = commentsService.getCommentByBoardId(boardId);
		List<CommentsDto> commentsDto = comments.stream()
			.map(comment -> new CommentsDto(comment))
			.collect(Collectors.toList());
		
		return ResponseEntity.ok(commentsDto);
	}
	
	@PostMapping("/comments/create_process")
	public ResponseEntity<?> commentCreateProcess(@RequestBody @Valid CommentsCreateDto commentsCreateDto,
												@AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
		
		commentsService.createComment(customUser.getId(), commentsCreateDto);
		
		return ResponseEntity.status(HttpStatus.CREATED).body("댓글 작성 성공");
	}
	
	@PutMapping("/comments/update_process/{id}")
	public ResponseEntity<String> commentUpdateProcess(@PathVariable("id") Long id,
													 @RequestBody @Valid CommentsUpdateDto commentsUpdateDto,
													 @AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
		
		Comments comment = commentsService.getCommentById(id);
		Member member = comment.getMember();
		
		if (!member.getId().equals(customUser.getId())) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("수정 권한이 없습니다.");
	    }
		
		commentsService.updateBoard(id, commentsUpdateDto);
		
		return ResponseEntity.ok("댓글이 성공적으로 수정되었습니다.");
	}
	
	@DeleteMapping("/comments/delete_process/{id}")
	public ResponseEntity<String> commentDeleteProcess(@PathVariable("id") Long id, 
			 										   @AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
		
		Comments comment = commentsService.getCommentById(id);
		Member member = comment.getMember();
		
		if (!member.getId().equals(customUser.getId())) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("삭제 권한이 없습니다.");
	    }
		
		commentsService.deleteBoard(id);
		
		return ResponseEntity.status(200).body("댓글이 성공적으로 삭제되었습니다.");
	}
}
