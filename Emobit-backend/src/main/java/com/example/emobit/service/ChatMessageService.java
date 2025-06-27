package com.example.emobit.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.emobit.domain.ChatMessage;
import com.example.emobit.domain.ChatRoom;
import com.example.emobit.domain.Member;
import com.example.emobit.repository.ChatMessageRepository;
import com.example.emobit.repository.ChatRoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomService chatRoomService;
    private final StringRedisTemplate redisTemplate;
    
    public List<ChatMessage> getChatMessageAll(ChatRoom chatRoom) {
		List<ChatMessage> chatMessageList = chatMessageRepository.findByChatRoomOrderByCreatedAtAsc(chatRoom);
		
        return chatMessageList;
    }
    
    public List<ChatMessage> getChatMessagesAfter(ChatRoom chatRoom, LocalDateTime exitedAt) {
    	List<ChatMessage> chatMessageList = chatMessageRepository.findByChatRoomAndCreatedAtAfterOrderByCreatedAtAsc(chatRoom, exitedAt);
    	
        return chatMessageList;
    }
    
    public ChatMessage getLastMessage(ChatRoom chatRoom) {
    	ChatMessage chatMessage = chatMessageRepository.findTopByChatRoomOrderByCreatedAtDesc(chatRoom).orElse(null);
    	
        return chatMessage;
    }

    @Transactional
    public ChatMessage saveChatMessage(ChatRoom chatRoom, String sender, String content) {
    	ChatMessage chatMessage = new ChatMessage();
    	chatMessage.setChatRoom(chatRoom);
    	chatMessage.setSender(sender);
    	chatMessage.setContent(content);
    	
    	Member memberA = chatRoom.getMemberA();
    	Member memberB = chatRoom.getMemberB();
    	Member receiver = sender.equals(memberA.getUsername()) ? memberB : memberA;

        // receiver의 참여 표시
    	if (receiver.equals(memberA)) {
    	    chatRoom.setMemberAJoined(true);
    	} else {
    	    chatRoom.setMemberBJoined(true);
    	}

        chatRoomRepository.save(chatRoom);
        chatMessageRepository.save(chatMessage);
        
        this.setUnreadCount(chatRoom.getId(), receiver.getId());
        
        return chatMessage;
    }
    
    public void setUnreadCount(Long chatRoomId, Long userId) {
    	// 알림용 Redis 처리 ex) unread::5::user::10 = 채팅방 id 5번의 사용자 id 10번이 읽지 않는 메시지가 존재
    	String key = "unread::" + chatRoomId + "::user::" + userId;

        // 입장하지 않은 상태만 증가시킴
        if (!chatRoomService.isUserInChatRoom(chatRoomId, userId)) {
            redisTemplate.opsForValue().increment(key);
        }
    }
    
    public int getUnreadCount(Long chatRoomId, Long userId) {
        String key = "unread::" + chatRoomId + "::user::" + userId;
        String count = redisTemplate.opsForValue().get(key);
        return count != null ? Integer.parseInt(count) : 0;
    }
    
    public void resetUnreadCount(Long chatRoomId, Long userId) {
        String key = "unread::" + chatRoomId + "::user::" + userId;
        redisTemplate.delete(key);
    }
}
