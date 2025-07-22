package com.example.emobit.service;

import java.util.List;
import java.util.Optional;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Comments;
import com.example.emobit.domain.Member;
import com.example.emobit.domain.Notification;
import com.example.emobit.dto.NotificationDeleteDto;
import com.example.emobit.dto.NotificationDto;
import com.example.emobit.enums.NotificationType;
import com.example.emobit.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
	private final NotificationRepository notificationRepository;
	private final MemberService memberService;
	private final SimpMessagingTemplate messagingTemplate;
	
	public List<Notification> getNotificationByReceiver(Long receiverId) {
		Member receiver = memberService.getMemberById(receiverId);
		List<Notification> notificationList = notificationRepository.findByReceiverOrderByCreatedAtDesc(receiver);
		
		return notificationList;
	}
	
	public Notification getNotificationById(Long id) {
		Notification notification = notificationRepository.findById(id)
										.orElseThrow(() -> new RuntimeException("알림을 찾을 수 없습니다."));
		
		return notification;
	}
	
	public void createNotification(Member receiver, Member sender, NotificationType type, Long targetId, Board board, Comments comment) {
        Notification notification = new Notification();
        notification.setReceiver(receiver);
        notification.setSender(sender);
        notification.setType(type);
        notification.setTargetId(targetId);
        notification.setBoardId(board.getId());

        notificationRepository.save(notification);

        // 알림이 DB에 정상적으로 커밋 된 이후 WebSocket으로 실시간 알림 보냄 
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
            	Notification savedNotification = notificationRepository.findById(notification.getId()).orElseThrow();
                NotificationDto notificationDto = new NotificationDto(savedNotification, board, comment);
                
                messagingTemplate.convertAndSend("/topic/notification/new/" + receiver.getId(), notificationDto);
            }
        });
    }
	
	public void updateAllToRead(Long receiverId) {
	    Member receiver = memberService.getMemberById(receiverId);
	    List<Notification> unreadNotifications = notificationRepository.findByReceiverAndIsReadFalse(receiver);
	    
	    for (Notification notification : unreadNotifications) {
	        notification.setRead(true);
	    }
	    
	    notificationRepository.saveAll(unreadNotifications);
	}
	
	public void deleteNotificationIfUnread(Member receiver, Member sender, NotificationType type, Long targetId) {
		Optional<Notification> existingNotification = notificationRepository
			.findByReceiverAndSenderAndTypeAndTargetIdAndIsReadFalse(receiver, sender, type, targetId);
		
		if (existingNotification.isPresent()) {
			Notification notification = existingNotification.get();
			Long deletedId = notification.getId();
			
			notificationRepository.delete(notification);
			
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
	            @Override
	            public void afterCommit() {
	                messagingTemplate.convertAndSend("/topic/notification/delete/" + receiver.getId(), deletedId);
	            }
	        });
		}
	}
	
	public void deleteCommentNotification(Member receiver, Member sender, Long targetId) {
		Optional<Notification> existingNotification = notificationRepository
			.findByReceiverAndSenderAndTypeAndTargetId(receiver, sender, NotificationType.COMMENT, targetId);
		
		if (existingNotification.isPresent()) {
			Notification notification = existingNotification.get();
			Long deletedId = notification.getId();
			
			notificationRepository.delete(notification);
			
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
	            @Override
	            public void afterCommit() {
	                messagingTemplate.convertAndSend("/topic/notification/delete/" + receiver.getId(), deletedId);
	            }
	        });
		}
	}
	
	public void deleteLikeNotification(Long boardId) {
		List<Notification> notifications = notificationRepository.findByBoardId(boardId);
		
		List<NotificationDeleteDto> notificationDeleteListDto = notifications.stream()
			.map(notification -> new NotificationDeleteDto(notification.getReceiver().getId(), notification.getId()))
			.toList();
		
		notificationRepository.deleteAll(notifications);
		
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
            	notificationDeleteListDto.forEach((NotificationDeleteDto notificationDeleteDto) -> {
            		messagingTemplate.convertAndSend("/topic/notification/delete/" + notificationDeleteDto.getReceiverId(),
							 														 notificationDeleteDto.getDeletedId());
            	});
            }
        });
	}
	
	@Transactional
	public void notificationDeleteAllProcess(Long receiverId) {
		Member receiver = memberService.getMemberById(receiverId);
		
		notificationRepository.deleteAllByReceiver(receiver);
	}
}
