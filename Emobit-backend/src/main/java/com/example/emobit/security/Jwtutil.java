package com.example.emobit.security;

import java.sql.Date;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class Jwtutil {
	private static SecretKey key;

	@Value("${jwt.secret}")
	private String secret;

	@PostConstruct
	public void init() {
		key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
	}

	public static String createAccessToken(Authentication auth) {
	    return createToken(auth, 30 * 60 * 1000); // 30분
	}

	public static String createRefreshToken(Authentication auth) {
	    return createToken(auth, 7 * 24 * 60 * 60 * 1000); // 7일
	}

	// JWT 만들어주는 함수
	private static String createToken(Authentication auth, long expireTimeMillis) {
		CustomUser user = (CustomUser) auth.getPrincipal();
		String authorities = auth.getAuthorities().stream()
								.map(GrantedAuthority::getAuthority)  // GrantedAuthority에서 권한을 String으로 변환
								.collect(Collectors.joining(","));    // String으로 합침
		
		String jwt = Jwts.builder()
			.claim("id", user.getId().toString())
			.claim("username", user.getUsername())
			.claim("displayName", user.getDisplayName())
			.claim("authorities", authorities)
			.issuedAt(new Date(System.currentTimeMillis()))
			.expiration(new Date(System.currentTimeMillis() + expireTimeMillis))
			.signWith(key)
			.compact();
		
		return jwt;
	}

	// JWT 까주는 함수
	public static Claims extractToken(String token) {
		Claims claims = Jwts.parser().verifyWith(key).build()
			.parseSignedClaims(token).getPayload();
		
		return claims;
	}
}
