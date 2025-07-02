package com.example.emobit.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.emobit.domain.Member;
import com.example.emobit.domain.Notification;
import com.example.emobit.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
	private final NotificationRepository notificationRepository;
	private final MemberService memberService;
	
	public List<Notification> getNotificationByReceiver(Long receiverId) {
		Member receiver = memberService.getMemberById(receiverId);
		List<Notification> notificationList = notificationRepository.findByReceiverOrderByCreatedAtDesc(receiver);
		
		return notificationList;
	}
}
