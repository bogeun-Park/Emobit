package com.example.emobit.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Comments;
import com.example.emobit.domain.Member;
import com.example.emobit.dto.CommentsCreateDto;
import com.example.emobit.dto.CommentsUpdateDto;
import com.example.emobit.enums.NotificationType;
import com.example.emobit.repository.CommentsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentsService {
	private final CommentsRepository commentsRepository;
	private final MemberService memberService;
	private final BoardService boardService;
	private final NotificationService notificationService;
	
	public List<Comments> getCommentByBoardId(Long boardId) {
		List<Comments> comments = commentsRepository.customFindAllByBoardId(boardId);
		
		return comments;
	}
	
	public Comments getCommentById(Long id) {
		Comments comment = commentsRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));
		
		return comment;
	}
	
	@Transactional
	public void createComment(Long createdBy, CommentsCreateDto commentsCreateDto) {
		String content = commentsCreateDto.getContent();
		Long boardId = commentsCreateDto.getBoardId();
		
		Board board = boardService.getBoardById(boardId);
		Member receiver = board.getMember();
		Member sender = memberService.getMemberById(createdBy);
		
		Comments comment = new Comments();
		comment.setContent(content);
		comment.setMember(sender);
		comment.setBoard(board);
		
		commentsRepository.save(comment);
	    	    
    	// 댓글이 자신이 작성한 게시글이 아닌 경우에만 알림 생성 (자기 알림 방지)
	    if (!receiver.getId().equals(sender.getId())) {
	    	notificationService.createNotification(receiver, sender, NotificationType.COMMENT, comment.getId(), board, comment);
	    }
        
	}
	
	public void updateComment(Long id, CommentsUpdateDto commentsUpdateDto) {
		String content = commentsUpdateDto.getContent();
		
		Comments comment = this.getCommentById(id);
		comment.setContent(content);
		
		commentsRepository.save(comment);
	}
	
	@Transactional
	public void deleteComment(Long id, Long senderId) {
		Comments comment = this.getCommentById(id);
		Board board = comment.getBoard();
        Member receiver = board.getMember();
        Member sender = memberService.getMemberById(senderId);
        
		commentsRepository.delete(comment);
		
		// 댓글 삭제시 해당 알림도 같이 삭제
        if (!receiver.getId().equals(sender.getId())) {
            notificationService.deleteCommentNotification(receiver, sender, id);
        }
	}
}
