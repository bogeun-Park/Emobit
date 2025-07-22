package com.example.emobit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.Member;
import com.example.emobit.domain.Notification;
import com.example.emobit.enums.NotificationType;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
	List<Notification> findByReceiverOrderByCreatedAtDesc(Member receiver);

	List<Notification> findByReceiverAndIsReadFalse(Member receiver);
	
	// 읽지 않은 상태의 알림을 가져옴
	Optional<Notification> findByReceiverAndSenderAndTypeAndTargetIdAndIsReadFalse(Member receiver, 
																				   Member sender, 
																				   NotificationType type, 
																				   Long targetId);
	
	Optional<Notification> findByReceiverAndSenderAndTypeAndTargetId(Member receiver, 
																	 Member sender, 
																	 NotificationType type, 
																	 Long targetId);
	
	List<Notification> findByBoardId(Long boardId);
	
	void deleteAllByReceiver(Member receiver);
}
