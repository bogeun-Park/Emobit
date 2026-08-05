package com.example.emobit.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
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
import com.example.emobit.dto.FollowStatsDto;
import com.example.emobit.dto.MemberAuthDto;
import com.example.emobit.dto.MemberLoginDto;
import com.example.emobit.dto.MemberProfileDto;
import com.example.emobit.dto.MemberRegisterDto;
import com.example.emobit.security.CustomUser;
import com.example.emobit.security.Jwtutil;
import com.example.emobit.service.FollowService;
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
	private final FollowService followService;
	private final AuthenticationManagerBuilder authenticationManagerBuilder;
	private final OracleStorageService oracleStorageService;

	@Value("${cookie.secure}")
	private boolean cookieSecure;

	private ResponseCookie buildCookie(String name, String value, long maxAgeSeconds) {
		return ResponseCookie.from(name, value)
			.httpOnly(true)
			.secure(cookieSecure)
			.sameSite("Strict")
			.path("/api")
			.maxAge(maxAgeSeconds)
			.build();
	}

	@PostMapping("/login")
	public ResponseEntity<?> loginJwt(@RequestBody @Valid MemberLoginDto memberLoginDto, HttpServletResponse response) {
		var authToken = new UsernamePasswordAuthenticationToken(memberLoginDto.getUsername(), memberLoginDto.getPassword());
		Authentication auth = authenticationManagerBuilder.getObject().authenticate(authToken);
		SecurityContextHolder.getContext().setAuthentication(auth);		
		
		String accessToken = Jwtutil.createAccessToken(SecurityContextHolder.getContext().getAuthentication());
		String refreshToken = Jwtutil.createRefreshToken(auth);
		
		// Access Token 쿠키 (30분)
		response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("jwt", accessToken, 30 * 60).toString());

		// Refresh Token 쿠키 (7일)
		response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("refresh", refreshToken, 7 * 24 * 60 * 60).toString());
		
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

		// 재발급 Access Token 쿠키 (30분)
	    response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("jwt", newAccessToken, 30 * 60).toString());

	    Map<String, String> body = new HashMap<>();
        body.put("token", newAccessToken);
		
		return ResponseEntity.ok(body);
	}
	
	@PostMapping("/logout")
	public ResponseEntity<?> logout(HttpServletResponse response) {
		// Access Token 삭제
		response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("jwt", "", 0).toString());

		// Refresh Token 삭제
		response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("refresh", "", 0).toString());
	    
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

		List<Board> boardList = member.getBoards();
		List<BoardDto> boardListDto = boardList.stream()
		    .map(BoardDto::new)
		    .toList();

		long followerCount = followService.getFollowerCount(member.getId());
		long followingCount = followService.getFollowingCount(member.getId());
		boolean isFollow = customUser != null && followService.isFollowing(customUser.getId(), member.getId());

		FollowStatsDto followStatsDto = new FollowStatsDto(followerCount, followingCount, isFollow);
		MemberProfileDto memberProfileDto = new MemberProfileDto(member, boardListDto, followStatsDto);

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
	public ResponseEntity<?> getPresignedUrl(@RequestParam("filename") String filename,
											 @AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }

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
