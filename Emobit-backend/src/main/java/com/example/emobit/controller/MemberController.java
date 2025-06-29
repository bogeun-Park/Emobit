package com.example.emobit.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Member;
import com.example.emobit.dto.BoardDto;
import com.example.emobit.dto.MemberAuthDto;
import com.example.emobit.dto.MemberLoginDto;
import com.example.emobit.dto.MemberProfileDto;
import com.example.emobit.dto.MemberRegisterDto;
import com.example.emobit.security.CustomUser;
import com.example.emobit.security.Jwtutil;
import com.example.emobit.service.MemberService;
import com.example.emobit.service.OracleStorageService;

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
	private final OracleStorageService oracleStorageService;
	
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
	    	return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token missing");
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
	public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
                
        Member member = memberService.getMemberById(customUser.getId());
		MemberAuthDto memberAuthDto = memberService.getMemberDto(member);
		
		return ResponseEntity.ok(memberAuthDto);
    }
	
	@PostMapping("/register_process")
	public ResponseEntity<?> registerProcess(@RequestBody @Valid MemberRegisterDto memberRegisterDto) {
	    memberService.registerMember(memberRegisterDto);
	    
	    return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공");
	}
	
	@GetMapping("/register/check_username/{username}")
	public ResponseEntity<?> checkUsername(@PathVariable("username") String username) {
		boolean bexists = memberService.existsByUsername(username);
		
		return ResponseEntity.ok(!bexists);
	}
	
	@GetMapping("/profile/{username}")
	public ResponseEntity<?> getMyBoards(@PathVariable("username") String username,
										 @AuthenticationPrincipal CustomUser customUser) {		
		Member member = memberService.getMemberByUsername(username);
		MemberAuthDto memberAuthDto = new MemberAuthDto(member);
		
		List<Board> boardList = member.getBoards();
		List<BoardDto> boardListDto = boardList.stream()
		    .map(BoardDto::new)
		    .toList();
		
		MemberProfileDto memberProfileDto = new MemberProfileDto(memberAuthDto, boardListDto);
		
		return ResponseEntity.ok(memberProfileDto);
	}
	
	@GetMapping("/member/search/{keyword}")
	public ResponseEntity<?> getMembersByUsernameOrDisplayName(@PathVariable("keyword") String keyword) {
		List<Member> memberList = memberService.getMembersByUsernameOrDisplayName(keyword);
		List<MemberAuthDto> memberAuthDtoList = memberList.stream()
				.map(MemberAuthDto::new)
				.toList();
		
		return ResponseEntity.ok(memberAuthDtoList);
	}
	
	@GetMapping("/member/PresignedUrl")
	public ResponseEntity<?> getPresignedUrl(@RequestParam("filename") String filename) {
	    String presignedUrl = oracleStorageService.createPresignedUrl(filename, "member");
	    
	    if (presignedUrl != null) {
	        return ResponseEntity.ok(presignedUrl);
	    } else {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Presigned URL 생성 실패");
	    }
	}
	
	@PutMapping("/member/imagePath_update/{id}")
	public ResponseEntity<?> imagePathUpdate(@PathVariable("id") Long id,
											@RequestParam("imagePath") String imagePath,
			 								@AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
		
		Member member = memberService.getMemberById(id);
		if (!member.getId().equals(customUser.getId())) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("수정 권한이 없습니다.");
	    }
		
		memberService.updateImagePath(member, imagePath);
		
		return ResponseEntity.ok("프로필 이미지가 변경되었습니다.");
	}
}
