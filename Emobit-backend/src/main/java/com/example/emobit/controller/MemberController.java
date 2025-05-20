package com.example.emobit.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.emobit.domain.Member;
import com.example.emobit.dto.MemberAuthDto;
import com.example.emobit.dto.MemberLoginDto;
import com.example.emobit.dto.MemberRegisterDto;
import com.example.emobit.security.CustomUser;
import com.example.emobit.security.Jwtutil;
import com.example.emobit.service.MemberService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MemberController {
	private final MemberService memberService;
	private final AuthenticationManagerBuilder authenticationManagerBuilder;
	
	@PostMapping("/login")
	public ResponseEntity<?> loginJwt(@RequestBody @Valid MemberLoginDto memberLoginDto, HttpServletResponse response) {
		var authToken = new UsernamePasswordAuthenticationToken(memberLoginDto.getUsername(), memberLoginDto.getPassword());
		Authentication auth = authenticationManagerBuilder.getObject().authenticate(authToken);
		SecurityContextHolder.getContext().setAuthentication(auth);		
		
		String accessToken = Jwtutil.createAccessToken(SecurityContextHolder.getContext().getAuthentication());
		String refreshToken = Jwtutil.createRefreshToken(auth);
		
		// Access Token 쿠키
		Cookie accessCookie  = new Cookie("jwt", accessToken);
		accessCookie.setMaxAge(30 * 60);  // 쿠키 유지 시간 30분
		accessCookie.setHttpOnly(true);
		accessCookie.setPath("/");
		response.addCookie(accessCookie);
		
		// Refresh Token 쿠키
	    Cookie refreshCookie = new Cookie("refresh", refreshToken);
	    refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
	    refreshCookie.setHttpOnly(true);
	    refreshCookie.setPath("/");
	    response.addCookie(refreshCookie);
		
		Map<String, String> body = new HashMap<>();
        body.put("token", accessToken);
		
		return ResponseEntity.ok(body);
	}
	
	@PostMapping("/logout")
	public ResponseEntity<?> logout(HttpServletResponse response) {
		// Access Token 삭제
		Cookie accessCookie = new Cookie("jwt", null);
		accessCookie.setMaxAge(0);
		accessCookie.setHttpOnly(true);
		accessCookie.setPath("/");
		response.addCookie(accessCookie);
	    
	    // Refresh Token 삭제
	    Cookie refreshCookie = new Cookie("refresh", null);
	    refreshCookie.setMaxAge(0);
	    refreshCookie.setHttpOnly(true);
	    refreshCookie.setPath("/");
	    response.addCookie(refreshCookie);
	    
	    SecurityContextHolder.clearContext();
	    
	    return ResponseEntity.ok("로그아웃 성공");
	}
	
	@GetMapping("/login/auth")
	public ResponseEntity<MemberAuthDto> getCurrentUser(@AuthenticationPrincipal CustomUser customUser) {
        if (customUser == null) {
        	return ResponseEntity.ok().build();
        }
                
        Member member = memberService.getIdMember(customUser.getId());
		MemberAuthDto memberAuthDto = memberService.getMemberDto(member);
		
		return ResponseEntity.ok(memberAuthDto);
    }
	
	@PostMapping("/login/register_process")
	public ResponseEntity<?> registerProcess(@RequestBody @Valid MemberRegisterDto memberRegisterDto) {
	    memberService.registerMember(memberRegisterDto);
	    
	    return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공");
	}
	
	@GetMapping("/refresh")
	public ResponseEntity<?> refreshJwt(HttpServletRequest request, HttpServletResponse response) {
	    String refreshToken = null;

	    Cookie[] cookies = request.getCookies();
	    if (cookies != null) {
	        for (Cookie cookie : cookies) {
	            if ("refresh".equals(cookie.getName())) {
	                refreshToken = cookie.getValue();
	            }
	        }
	    }

	    if (refreshToken == null) {
	    	return ResponseEntity.noContent().build();
	    }

	    Claims claims;
	    try {
	        claims = Jwtutil.extractToken(refreshToken);
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
	    }

	    // AccessToken 재발급
	    var authorities = Arrays.stream(claims.get("authorities").toString().split(","))
	        .map(SimpleGrantedAuthority::new)
	        .toList();

	    CustomUser user = new CustomUser(claims.get("username").toString(), "none", authorities);
	    user.setDisplayName(claims.get("displayName").toString());
	    user.setId(Long.parseLong(claims.get("id").toString()));

	    Authentication newAuth = new UsernamePasswordAuthenticationToken(user, "", authorities);
	    String newAccessToken = Jwtutil.createAccessToken(newAuth);

	    Cookie newAccessCookie = new Cookie("jwt", newAccessToken);
	    newAccessCookie.setMaxAge(30 * 60);
	    newAccessCookie.setHttpOnly(true);
	    newAccessCookie.setPath("/");
	    response.addCookie(newAccessCookie);

	    Map<String, String> body = new HashMap<>();
        body.put("token", newAccessToken);
		
		return ResponseEntity.ok(body);
	}
}
