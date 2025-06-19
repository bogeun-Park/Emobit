package com.example.emobit.service;

import java.time.LocalDateTime;
import java.util.List;

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

        // receiver의 참여 표시
        if (sender.equals(memberA.getUsername())) {
            chatRoom.setMemberBJoined(true);
        } else if (sender.equals(memberB.getUsername())) {
            chatRoom.setMemberAJoined(true);
        }

        chatRoomRepository.save(chatRoom);
        chatMessageRepository.save(chatMessage);
        
        return chatMessage;
    }
}
