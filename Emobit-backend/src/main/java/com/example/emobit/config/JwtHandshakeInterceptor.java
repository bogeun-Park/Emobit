package com.example.emobit.config;

import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

// WebSocket(SockJS) 핸드셰이크 시점(아직 STOMP 세션이 아닌 순수 HTTP 요청 단계)에
// jwt 쿠키를 꺼내서 WebSocket 세션 속성에 저장해둔다. STOMP CONNECT 단계에서
// StompAuthChannelInterceptor가 이 값을 읽어 실제 인증을 수행한다.
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

	@Override
	public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
									WebSocketHandler wsHandler, Map<String, Object> attributes) {
		if (request instanceof ServletServerHttpRequest servletRequest) {
			HttpServletRequest httpRequest = servletRequest.getServletRequest();
			Cookie[] cookies = httpRequest.getCookies();

			if (cookies != null) {
				for (Cookie cookie : cookies) {
					if (cookie.getName().equals("jwt")) {
						attributes.put("jwt", cookie.getValue());
						break;
					}
				}
			}
		}

		return true;
	}

	@Override
	public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
								WebSocketHandler wsHandler, Exception exception) {
	}
}
