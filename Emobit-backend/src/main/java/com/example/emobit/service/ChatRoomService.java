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
    	Member memberA = memberService.getMemberByUsername(sender);
    	Member memberB = memberService.getMemberByUsername(receiver);

    	// sender와 receiver를 id 순으로 정렬(DB중복 저장 방지)
    	if (memberA.getId().compareTo(memberB.getId()) > 0) {
    		Member temp = memberA;
    		memberA = memberB;
    		memberB = temp;
        }
    	
    	// 기존에 채팅방이 있는지 확인
    	Optional<ChatRoom> existingRoom = chatRoomRepository.findByMemberAAndMemberB(memberA, memberB);
        if (existingRoom.isPresent()) {
            ChatRoom chatRoom = existingRoom.get();

            if (sender.equals(chatRoom.getMemberA().getUsername()) && !chatRoom.isMemberAJoined()) {
                chatRoom.setMemberAJoined(true);
                chatRoomRepository.save(chatRoom);
            } else if (sender.equals(chatRoom.getMemberA().getUsername()) && !chatRoom.isMemberBJoined()) {
                chatRoom.setMemberBJoined(true);
                chatRoomRepository.save(chatRoom);
            }

            return chatRoom;
        }

        // 없으면 새로 생성
        ChatRoom newChatRoom = new ChatRoom();
        newChatRoom.setMemberA(memberA);
        newChatRoom.setMemberB(memberB);
        
        // 새로운 채팅방 생성시 sender의 참여 표시(상대는 아직 미참여)
        if (sender.equals(memberA.getUsername())) {
            newChatRoom.setMemberAJoined(true);
        } else {
            newChatRoom.setMemberBJoined(true);
        }
        
        chatRoomRepository.save(newChatRoom);
        
        return newChatRoom;
    }
    
    @Transactional
    public void exitChatRoom(Long chatRoomId, String username) {
        ChatRoom chatRoom = this.getChatRoomById(chatRoomId);
        LocalDateTime now = LocalDateTime.now();

        // 사용자의 퇴장 표시 설정 및 퇴장 시간 기록
        if (username.equals(chatRoom.getMemberA().getUsername())) {
            chatRoom.setMemberAJoined(false);
            chatRoom.setMemberAExitedAt(now);
        } else if (username.equals(chatRoom.getMemberB().getUsername())) {
            chatRoom.setMemberBJoined(false);
            chatRoom.setMemberBExitedAt(now);
        }

        // 둘 다 퇴장했으면 방 삭제
        if (!chatRoom.isMemberAJoined() && !chatRoom.isMemberBJoined()) {
            chatRoomRepository.delete(chatRoom);
        } else {
            chatRoomRepository.save(chatRoom);
        }
    }
}
