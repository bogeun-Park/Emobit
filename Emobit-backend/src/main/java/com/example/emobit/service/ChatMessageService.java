package com.example.emobit.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.emobit.domain.ChatMessage;
import com.example.emobit.domain.ChatRoom;
import com.example.emobit.repository.ChatMessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    
    public List<ChatMessage> getChatMessageAll(ChatRoom chatRoom) {
		List<ChatMessage> chatMessageList = chatMessageRepository.findByChatRoomOrderByCreatedAtAsc(chatRoom);
		
        return chatMessageList;
    }

    public void saveChatMessage(ChatRoom chatRoom, String sender, String content) {
    	ChatMessage chatMessage = new ChatMessage();
    	chatMessage.setChatRoom(chatRoom);
    	chatMessage.setSender(sender);
    	chatMessage.setContent(content);
    	chatMessage.setRead(false);

        chatMessageRepository.save(chatMessage);
    }
}
