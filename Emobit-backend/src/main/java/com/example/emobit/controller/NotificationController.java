package com.example.emobit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
		List<NotificationDto> notificationListDto = notificationList.stream()
	        .map(notification -> {
	            Board board = null;
	            Comments comment = null;
	            if (notification.getType() == NotificationType.COMMENT) {
	            	comment = commentsService.getCommentById(notification.getTargetId());
	                board = comment.getBoard();
	            } else if (notification.getType() == NotificationType.LIKE) {
	                board = boardService.getBoardById(notification.getTargetId());
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
}
