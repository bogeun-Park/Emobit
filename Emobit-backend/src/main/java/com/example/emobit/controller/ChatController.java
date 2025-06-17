package com.example.emobit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
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
    
    @GetMapping("/chat/getRooms")
    public ResponseEntity<?> getRooms(@AuthenticationPrincipal CustomUser customUser) {
    	if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
    	
    	List<ChatRoom> chatRoomList = chatRoomService.getUserChatRoomAll(customUser.getUsername());
    	
        return ResponseEntity.ok(chatRoomList);
    }

    @GetMapping("/chat/{chatRoomId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable("chatRoomId") Long chatRoomId,
    									 @AuthenticationPrincipal CustomUser customUser) {
    	if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
    	
        ChatRoom chatRoom = chatRoomService.getChatRoomById(chatRoomId);
        String username = customUser.getUsername();
 
        if (!chatRoom.getUserA().equals(username) && !chatRoom.getUserB().equals(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 채팅방에 접근할 수 없습니다.");
        }
        
        List<ChatMessage> chatMessageList = chatMessageService.getChatMessageAll(chatRoom); 
        
        return ResponseEntity.ok(chatMessageList);
    }
    
    @PostMapping("/chat/createRoom")
    public ResponseEntity<?> createRoom(@RequestParam("userA") String userA, 
    									@RequestParam("userB") String userB,
    									@AuthenticationPrincipal CustomUser customUser) {
    	if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
    	
    	if (!memberService.existsByUsername(userA) || !memberService.existsByUsername(userB)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("존재하지 않는 사용자가 포함되어 있습니다.");
        }
    	
    	if (!customUser.getUsername().equals(userA) && !customUser.getUsername().equals(userB)) {
    	    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("자신이 포함된 대화만 생성할 수 있습니다.");
    	}
    	
    	ChatRoom chatRoom = chatRoomService.createOrGetChatRoom(userA, userB); 
    	
        return ResponseEntity.ok(chatRoom);
    }
    
    @MessageMapping("/chat.send")  // 클라이언트에서 "/app/chat.send"로 보냄
    @SendTo("/topic/public")       // 모든 구독자에게 브로드캐스트
    public ChatMessage sendMessage(ChatMessage chatMessage) {
    	ChatRoom chatRoom = chatRoomService.getChatRoomById(chatMessage.getChatRoom().getId());
        chatMessageService.saveChatMessage(chatRoom, chatMessage.getSender(), chatMessage.getContent());
        
        return chatMessage;
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
}
