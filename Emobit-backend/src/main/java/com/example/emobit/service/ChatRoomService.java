package com.example.emobit.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.emobit.domain.ChatRoom;
import com.example.emobit.repository.ChatRoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
	private final ChatRoomRepository chatRoomRepository;
	
	public List<ChatRoom> getUserChatRoomAll(String username) {
		List<ChatRoom> chatRoomList = chatRoomRepository.findByUser(username);
		
        return chatRoomList;
    }

    public ChatRoom getChatRoomById(Long id) {
    	ChatRoom chatRoom =	chatRoomRepository.findById(id)
                				.orElseThrow(() -> new RuntimeException("채팅방이 존재하지 않습니다.")); 
        return chatRoom;
    }
    
    public ChatRoom createOrGetChatRoom(String userA, String userB) {
        Optional<ChatRoom> existingRoom = chatRoomRepository.findByUserAAndUserB(userA, userB);
        if (existingRoom.isPresent()) {
            return existingRoom.get();
        }

        // userB와 userA 순서 바꾼 것도 검사
        existingRoom = chatRoomRepository.findByUserAAndUserB(userB, userA);
        if (existingRoom.isPresent()) {
            return existingRoom.get();
        }

        // 없으면 새로 생성
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setUserA(userA);
        chatRoom.setUserB(userB);
        
        chatRoomRepository.save(chatRoom);
        
        return chatRoom;
    }

}
