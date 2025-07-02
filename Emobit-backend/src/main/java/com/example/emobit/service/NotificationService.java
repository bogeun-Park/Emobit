package com.example.emobit.service;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.example.emobit.domain.Member;
import com.example.emobit.domain.Notification;
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
	
	public void createNotification(Member receiver, Member sender, NotificationType type, Long targetId, String content) {
        Notification notification = new Notification();
        notification.setReceiver(receiver);
        notification.setSender(sender);
        notification.setType(type);
        notification.setTargetId(targetId);
        notification.setContent(content);

        notificationRepository.save(notification);

        // 알림이 DB에 정상적으로 커밋 된 이후 WebSocket으로 실시간 알림 보냄 
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
            	Notification savedNotification = notificationRepository.findById(notification.getId()).orElseThrow();
                NotificationDto notificationDto = new NotificationDto(savedNotification);
                
                messagingTemplate.convertAndSend("/topic/notification/" + receiver.getId(), notificationDto);
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
}
