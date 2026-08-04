package com.example.emobit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.emobit.domain.Member;
import com.example.emobit.domain.Notification;
import com.example.emobit.enums.NotificationType;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
	@Query("SELECT n FROM Notification n JOIN FETCH n.sender WHERE n.receiver = :receiver ORDER BY n.createdAt DESC")
	List<Notification> findByReceiverOrderByCreatedAtDescWithSender(@Param("receiver") Member receiver);

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
