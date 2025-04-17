package com.example.emobit.security;

import java.sql.Date;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class Jwtutil {
	static final SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(
	          "jwtpassword123jwtpassword123jwtpassword123jwtpassword123jwtpassword"));

	// JWT 만들어주는 함수
	public static String createToken(Authentication auth) {
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
			.expiration(new Date(System.currentTimeMillis() + 30 * 60 * 1000)) //유효기간 30분
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
