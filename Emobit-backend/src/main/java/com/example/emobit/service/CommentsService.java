package com.example.emobit.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Comments;
import com.example.emobit.domain.Member;
import com.example.emobit.dto.CommentsCreateDto;
import com.example.emobit.dto.CommentsUpdateDto;
import com.example.emobit.repository.CommentsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentsService {
	private final CommentsRepository commentsRepository;
	private final MemberService memberService;
	private final BoardService boardService;
	
	public List<Comments> getCommentByBoardId(Long boardId) {
		List<Comments> comment = commentsRepository.customFindAllByBoardId(boardId);
		
		return comment;
	}
	
	public Comments getCommentById(Long id) {
		Comments comment = commentsRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));
		
		return comment;
	}
	
	public void createComment(Long createdBy, CommentsCreateDto commentsCreateDto) {
		String content = commentsCreateDto.getContent();
		Long boardId = commentsCreateDto.getBoardId();
		
		Member member = memberService.getMemberById(createdBy);
		Board board = boardService.getBoardById(boardId);
		
		Comments comment = new Comments();
		comment.setContent(content);
		comment.setMember(member);
		comment.setBoard(board);
		
		commentsRepository.save(comment);
	}
	
	public void updateBoard(Long id, CommentsUpdateDto commentsUpdateDto) {
		String content = commentsUpdateDto.getContent();
		
		Comments comment = this.getCommentById(id);
		comment.setContent(content);
		
		commentsRepository.save(comment);
	}
	
	public void deleteBoard(Long id) {
		commentsRepository.deleteById(id);
	}
}
