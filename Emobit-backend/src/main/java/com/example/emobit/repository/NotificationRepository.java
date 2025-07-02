package com.example.emobit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.Member;
import com.example.emobit.domain.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
	List<Notification> findByReceiverOrderByCreatedAtDesc(Member receiver);

	List<Notification> findByReceiverAndIsReadFalse(Member receiver);
}
