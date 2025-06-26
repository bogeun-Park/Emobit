package com.example.emobit.controller;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.emobit.domain.ChatMessage;
import com.example.emobit.domain.ChatRoom;
import com.example.emobit.domain.Member;
import com.example.emobit.dto.ChatMessageCreateDto;
import com.example.emobit.dto.ChatMessageDto;
import com.example.emobit.dto.ChatRoomDto;
import com.example.emobit.security.CustomUser;
import com.example.emobit.service.ChatMessageService;
import com.example.emobit.service.ChatRoomService;
import com.example.emobit.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {
	private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;
    private final MemberService memberService;
    private final SimpMessagingTemplate messagingTemplate;
    
    @GetMapping("/chat/getRooms")
    public ResponseEntity<?> getRooms(@AuthenticationPrincipal CustomUser customUser) {
    	if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
    	
    	List<ChatRoom> chatRoomList = chatRoomService.getUserChatRoomAll(customUser.getUsername());
    	List<ChatRoomDto> chatRoomDtoList = chatRoomList.stream()
    		.map(chatRoom -> {
    			ChatMessage chatMessage = chatMessageService.getLastMessage(chatRoom);
                String lastMessage = chatMessage != null ? chatMessage.getContent() : null;
                Date lastMessageTime = chatMessage != null ? chatMessage.getCreatedAt() : null;
                
                ChatRoomDto chatRoomDto = new ChatRoomDto(chatRoom, lastMessage, lastMessageTime);
                
                return chatRoomDto; 
    		})
    		.toList();
    	
        return ResponseEntity.ok(chatRoomDtoList);
    }

    @GetMapping("/chat/{chatRoomId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable("chatRoomId") Long chatRoomId,
    									 @AuthenticationPrincipal CustomUser customUser) {
    	if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
    	
        ChatRoom chatRoom = chatRoomService.getChatRoomById(chatRoomId);
        String username = customUser.getUsername();
        Member member = memberService.getMemberByUsername(username);
 
        if (!chatRoom.getMemberA().equals(member) && !chatRoom.getMemberB().equals(member)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 채팅방에 접근할 수 없습니다.");
        }
        
        boolean isMemberA = member.equals(chatRoom.getMemberA());
        boolean isMemberB = member.equals(chatRoom.getMemberB());
        LocalDateTime exitedAt = null;
        
        if (isMemberA) {
        	exitedAt = chatRoom.getMemberAExitedAt();
        } else if (isMemberB) {
        	exitedAt = chatRoom.getMemberBExitedAt();
        }
        
        List<ChatMessage> chatMessageList;
        if (exitedAt == null) {  // 처음 입장하거나 나간 기록이 없으면 모든 메시지 조회            
            chatMessageList = chatMessageService.getChatMessageAll(chatRoom);
        } else {  // 나갔던 시간 이후 메시지만 조회
            chatMessageList = chatMessageService.getChatMessagesAfter(chatRoom, exitedAt);
        } 
        
        return ResponseEntity.ok(chatMessageList);
    }
    
    @PostMapping("/chat/createRoom")
    public ResponseEntity<?> createRoom(@RequestParam("memberA") String memberA, 
    									@RequestParam("memberB") String memberB,
    									@AuthenticationPrincipal CustomUser customUser) {
    	if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
    	
    	if (!memberService.existsByUsername(memberA) || !memberService.existsByUsername(memberB)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("존재하지 않는 사용자가 포함되어 있습니다.");
        }
    	
    	if (!customUser.getUsername().equals(memberA) && !customUser.getUsername().equals(memberB)) {
    	    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("자신이 포함된 대화만 생성할 수 있습니다.");
    	}
    	
    	ChatRoom chatRoom = chatRoomService.createOrGetChatRoom(memberA, memberB); 
    	
        return ResponseEntity.ok(chatRoom);
    }
    
    @DeleteMapping("/chat/exitRoom/{chatRoomId}")
    public ResponseEntity<?> exitChatRoom(@PathVariable("chatRoomId") Long chatRoomId, 
    									  @AuthenticationPrincipal CustomUser customUser) {
    	if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }

    	chatRoomService.exitChatRoom(chatRoomId, customUser.getUsername());
    	
        return ResponseEntity.status(200).body("채팅방을 나갔습니다.");
    }
    
    @MessageMapping("/chat.send")  // 클라이언트에서 "/app/chat.send"로 보냄
    public void sendMessage(ChatMessageCreateDto chatMessageCreateDto) {
    	ChatRoom chatRoom = chatRoomService.getChatRoomById(chatMessageCreateDto.getChatRoomId());
    	ChatMessage chatMessage = chatMessageService.saveChatMessage(chatRoom, chatMessageCreateDto.getSender(), chatMessageCreateDto.getContent());
    	ChatMessageDto chatMessageDto = new ChatMessageDto(chatMessage);
    	
    	// 동적으로 대상 topic에 메시지 전송
    	messagingTemplate.convertAndSend("/topic/chatRoom/" + chatRoom.getId(), chatMessageDto);
    }
}
