package com.example.emobit.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.ChatMessage;
import com.example.emobit.domain.ChatRoom;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
	List<ChatMessage> findByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);
	
	// createdAt > exitedAt : 채팅방을 나간 시간 이후의 메시지를 추출
	List<ChatMessage> findByChatRoomAndCreatedAtAfterOrderByCreatedAtAsc(ChatRoom chatRoom, LocalDateTime exitAt);
	
	// 채팅방의 마지막 메시지를 반환
	Optional<ChatMessage> findTopByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom);
}
