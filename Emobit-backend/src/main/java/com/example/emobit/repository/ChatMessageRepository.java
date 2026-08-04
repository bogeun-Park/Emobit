package com.example.emobit.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.emobit.domain.ChatMessage;
import com.example.emobit.domain.ChatRoom;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
	List<ChatMessage> findByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);

	// createdAt > exitedAt : 채팅방을 나간 시간 이후의 메시지를 추출
	List<ChatMessage> findByChatRoomAndCreatedAtAfterOrderByCreatedAtAsc(ChatRoom chatRoom, LocalDateTime exitAt);

	// 채팅방 목록에서 방마다 마지막 메시지를 개별 조회하지 않기 위한 일괄 조회 (방별 최신 메시지 1개씩)
	@Query("SELECT m FROM ChatMessage m WHERE m.id IN (" +
		   "SELECT MAX(m2.id) FROM ChatMessage m2 WHERE m2.chatRoom.id IN :roomIds GROUP BY m2.chatRoom.id)")
	List<ChatMessage> findLatestMessagesByChatRoomIds(@Param("roomIds") Collection<Long> roomIds);
}
