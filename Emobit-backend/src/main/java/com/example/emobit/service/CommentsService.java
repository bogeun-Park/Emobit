package com.example.emobit.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Comments;
import com.example.emobit.domain.Member;
import com.example.emobit.domain.Notification;
import com.example.emobit.dto.CommentsCreateDto;
import com.example.emobit.dto.CommentsUpdateDto;
import com.example.emobit.enums.NotificationType;
import com.example.emobit.repository.CommentsRepository;
import com.example.emobit.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentsService {
	private final CommentsRepository commentsRepository;
	private final MemberService memberService;
	private final BoardService boardService;
	private final NotificationRepository notificationRepository;
	
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
		
		Member sender = memberService.getMemberById(createdBy);
		Board board = boardService.getBoardById(boardId);
		
		Comments comment = new Comments();
		comment.setContent(content);
		comment.setMember(sender);
		comment.setBoard(board);
		
		commentsRepository.save(comment);
		
		// --- 알림 생성 부분 ---
		Member receiver = board.getMember();

	    // 게시글 작성자가 댓글 작성자가 아닐 경우에만 알림 생성 (자기 알림 방지)
	    if (!receiver.getId().equals(createdBy)) {
	        Notification notification = new Notification();
	        notification.setReceiver(receiver);
	        notification.setSender(sender);
	        notification.setType(NotificationType.COMMENT);
	        notification.setTargetId(board.getId());
	        notification.setContent(content);

	        notificationRepository.save(notification);
	    }
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
