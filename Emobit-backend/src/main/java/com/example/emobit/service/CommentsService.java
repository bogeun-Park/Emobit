package com.example.emobit.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Comments;
import com.example.emobit.domain.Member;
import com.example.emobit.dto.CommentsCreateDto;
import com.example.emobit.repository.CommentsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentsService {
	private final CommentsRepository commentsRepository;
	private final MemberService memberService;
	private final BoardService boardService;
	
	public List<Comments> findAllByBoardId(Long boardId) {
		List<Comments> comment = commentsRepository.customFindAllByBoardId(boardId);
		
		return comment;
	}
	
	public void createComments(Long createdBy, CommentsCreateDto commentsCreateDto) {
		String content = commentsCreateDto.getContent();
		Long boardId = commentsCreateDto.getBoardId();
		
		Member member = memberService.getIdMember(createdBy);
		Board board = boardService.getIdBoard(boardId);
		
		Comments comment = new Comments();
		comment.setContent(content);
		comment.setMember(member);
		comment.setBoard(board);
		
		commentsRepository.save(comment);
	}
}
