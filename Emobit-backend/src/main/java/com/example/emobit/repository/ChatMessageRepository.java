package com.example.emobit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.ChatMessage;
import com.example.emobit.domain.ChatRoom;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
	List<ChatMessage> findByChatRoomOrderByCreatedAtAsc(ChatRoom chatRoom);
}
