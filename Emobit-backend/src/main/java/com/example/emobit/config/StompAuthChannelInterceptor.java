package com.example.emobit.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.example.emobit.domain.ChatRoom;
import com.example.emobit.security.CustomUser;
import com.example.emobit.security.Jwtutil;
import com.example.emobit.service.ChatRoomService;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

// STOMP CONNECT 시점에 jwt 쿠키(핸드셰이크 단계에서 세션 속성에 저장해둔 값)를 검증해서
// 세션에 인증 정보를 붙이고, SUBSCRIBE 시점에는 그 세션의 인증 정보로
// "본인 채널/본인이 속한 채팅방"만 구독 가능하도록 제한한다.
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {
	private final ChatRoomService chatRoomService;

	@Override
	public Message<?> preSend(Message<?> message, MessageChannel channel) {
		StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

		if (accessor == null) {
			return message;
		}

		if (StompCommand.CONNECT.equals(accessor.getCommand())) {
			accessor.setUser(authenticate(accessor));
		} else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
			authorizeSubscribe(accessor);
		}

		return message;
	}

	private Authentication authenticate(StompHeaderAccessor accessor) {
		Object jwtAttr = accessor.getSessionAttributes() != null ? accessor.getSessionAttributes().get("jwt") : null;

		if (jwtAttr == null) {
			throw new AuthenticationCredentialsNotFoundException("WebSocket 연결에는 로그인이 필요합니다.");
		}

		try {
			Claims claims = Jwtutil.extractToken((String) jwtAttr);

			List<GrantedAuthority> authorities = Arrays.stream(claims.get("authorities").toString().split(","))
				.map(a -> (GrantedAuthority) new SimpleGrantedAuthority(a))
				.toList();

			CustomUser user = new CustomUser(claims.get("username").toString(), "none", authorities);
			user.setDisplayName(claims.get("displayName").toString());
			user.setId(Long.parseLong(claims.get("id").toString()));

			return new UsernamePasswordAuthenticationToken(user, "", authorities);
		} catch (Exception e) {
			throw new AuthenticationCredentialsNotFoundException("유효하지 않은 인증 정보입니다.");
		}
	}

	private void authorizeSubscribe(StompHeaderAccessor accessor) {
		String destination = accessor.getDestination();
		Authentication auth = (Authentication) accessor.getUser();

		if (destination == null || auth == null || !(auth.getPrincipal() instanceof CustomUser user)) {
			throw new AuthenticationCredentialsNotFoundException("구독 권한이 없습니다.");
		}

		if (destination.startsWith("/topic/chatRoom/")) {
			Long roomId = Long.parseLong(destination.substring("/topic/chatRoom/".length()));
			ChatRoom chatRoom = chatRoomService.getChatRoomById(roomId);

			boolean isParticipant = chatRoom.getMemberA().getId().equals(user.getId())
				|| chatRoom.getMemberB().getId().equals(user.getId());

			if (!isParticipant) {
				throw new AuthenticationCredentialsNotFoundException("해당 채팅방에 접근할 수 없습니다.");
			}
		} else if (destination.startsWith("/topic/chatRoomList/")
				|| destination.startsWith("/topic/notification/new/")
				|| destination.startsWith("/topic/notification/delete/")) {
			Long targetId = Long.parseLong(destination.substring(destination.lastIndexOf('/') + 1));

			if (!targetId.equals(user.getId())) {
				throw new AuthenticationCredentialsNotFoundException("본인 채널만 구독할 수 있습니다.");
			}
		}
	}
}
