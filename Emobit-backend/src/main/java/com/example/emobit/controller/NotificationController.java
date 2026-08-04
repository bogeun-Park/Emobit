package com.example.emobit.controller;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Comments;
import com.example.emobit.domain.Notification;
import com.example.emobit.dto.NotificationDto;
import com.example.emobit.enums.NotificationType;
import com.example.emobit.security.CustomUser;
import com.example.emobit.service.BoardService;
import com.example.emobit.service.CommentsService;
import com.example.emobit.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificationController {
	private final NotificationService notificationService;
	private final BoardService boardService;
	private final CommentsService commentsService;
	
	@GetMapping("/notification")
	public ResponseEntity<?> getNotificationAll(@AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
		
		List<Notification> notificationList = notificationService.getNotificationByReceiver(customUser.getId());

		// 알림마다 댓글/게시글을 개별 조회하면 N+1이 나므로, 타입별로 id를 모아 한 번에 조회 후 메모리에서 매칭
		Set<Long> commentIds = notificationList.stream()
			.filter(notification -> notification.getType() == NotificationType.COMMENT)
			.map(Notification::getTargetId)
			.collect(Collectors.toSet());

		Set<Long> boardIds = notificationList.stream()
			.filter(notification -> notification.getType() == NotificationType.LIKE)
			.map(Notification::getTargetId)
			.collect(Collectors.toSet());

		Map<Long, Comments> commentById = commentsService.getCommentsByIds(commentIds).stream()
			.collect(Collectors.toMap(Comments::getId, comment -> comment));

		Map<Long, Board> boardById = boardService.getBoardsByIds(boardIds).stream()
			.collect(Collectors.toMap(Board::getId, board -> board));

		List<NotificationDto> notificationListDto = notificationList.stream()
	        .map(notification -> {
	            Board board = null;
	            Comments comment = null;
	            if (notification.getType() == NotificationType.COMMENT) {
	            	comment = commentById.get(notification.getTargetId());
	                board = (comment != null) ? comment.getBoard() : null;
	            } else if (notification.getType() == NotificationType.LIKE) {
	                board = boardById.get(notification.getTargetId());
	            }

	            return new NotificationDto(notification, board, comment);
	        })
	        .toList();
		
		return ResponseEntity.ok(notificationListDto);
	}
	
	@PostMapping("/notification/readAll")
    public ResponseEntity<?> readAllNotifications(@AuthenticationPrincipal CustomUser customUser) {
        if (customUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        notificationService.updateAllToRead(customUser.getId());
        
        return ResponseEntity.ok().build();
    }
	
	@DeleteMapping("/notification/delete_all_process")
	public ResponseEntity<String> notificationDeleteAllProcess(@AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
		}
		
		notificationService.notificationDeleteAllProcess(customUser.getId());
		
		return ResponseEntity.status(200).body("알림이 성공적으로 삭제되었습니다.");
	}
}
