package com.example.emobit.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.emobit.domain.ChatRoom;
import com.example.emobit.domain.Member;
import com.example.emobit.repository.ChatRoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
	private final ChatRoomRepository chatRoomRepository;
	private final MemberService memberService;;
	
	public List<ChatRoom> getUserChatRoomAll(String username) {
		Member member = memberService.getMemberByUsername(username);
		List<ChatRoom> chatRoomList = chatRoomRepository.findByMember(member);
		
        return chatRoomList;
    }

    public ChatRoom getChatRoomById(Long id) {
    	ChatRoom chatRoom =	chatRoomRepository.findByIdWithUsers(id)
                				.orElseThrow(() -> new RuntimeException("채팅방이 존재하지 않습니다.")); 
        return chatRoom;
    }
    
    public ChatRoom createOrGetChatRoom(String sender, String receiver) {
    	Member userA = memberService.getMemberByUsername(sender);
    	Member userB = memberService.getMemberByUsername(receiver);

    	// sender와 receiver를 id 순으로 정렬(DB중복 저장 방지)
    	if (userA.getId().compareTo(userB.getId()) > 0) {
    		Member temp = userA;
            userA = userB;
            userB = temp;
        }
    	
    	// 기존에 채팅방이 있는지 확인
    	Optional<ChatRoom> existingRoom = chatRoomRepository.findByUserAAndUserB(userA, userB);
        if (existingRoom.isPresent()) {
            ChatRoom chatRoom = existingRoom.get();

            if (sender.equals(chatRoom.getUserA().getUsername()) && !chatRoom.isUserAJoined()) {
                chatRoom.setUserAJoined(true);
                chatRoomRepository.save(chatRoom);
            } else if (sender.equals(chatRoom.getUserB().getUsername()) && !chatRoom.isUserBJoined()) {
                chatRoom.setUserBJoined(true);
                chatRoomRepository.save(chatRoom);
            }

            return chatRoom;
        }

        // 없으면 새로 생성
        ChatRoom newChatRoom = new ChatRoom();
        newChatRoom.setUserA(userA);
        newChatRoom.setUserB(userB);
        
        // 새로운 채팅방 생성시 sender의 참여 표시(상대는 아직 미참여)
        if (sender.equals(userA.getUsername())) {
            newChatRoom.setUserAJoined(true);
        } else {
            newChatRoom.setUserBJoined(true);
        }
        
        chatRoomRepository.save(newChatRoom);
        
        return newChatRoom;
    }
    
    @Transactional
    public void exitChatRoom(Long chatRoomId, String username) {
        ChatRoom chatRoom = this.getChatRoomById(chatRoomId);
        LocalDateTime now = LocalDateTime.now();

        // 사용자의 퇴장 표시 설정 및 퇴장 시간 기록
        if (username.equals(chatRoom.getUserA().getUsername())) {
            chatRoom.setUserAJoined(false);
            chatRoom.setUserAExitedAt(now);
        } else if (username.equals(chatRoom.getUserB().getUsername())) {
            chatRoom.setUserBJoined(false);
            chatRoom.setUserBExitedAt(now);
        }

        // 둘 다 퇴장했으면 방 삭제
        if (!chatRoom.isUserAJoined() && !chatRoom.isUserBJoined()) {
            chatRoomRepository.delete(chatRoom);
        } else {
            chatRoomRepository.save(chatRoom);
        }
    }
}
