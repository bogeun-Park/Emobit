package com.example.emobit.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.emobit.domain.Member;
import com.example.emobit.dto.MemberAuthDto;
import com.example.emobit.dto.MemberLoginDto;
import com.example.emobit.dto.MemberRegisterDto;
import com.example.emobit.security.CustomUser;
import com.example.emobit.security.Jwtutil;
import com.example.emobit.service.MemberService;

import jakarta.servlet.http.Cookie;
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
		
		String jwt = Jwtutil.createToken(SecurityContextHolder.getContext().getAuthentication());
		
		Cookie cookie = new Cookie("jwt", jwt);
		cookie.setMaxAge(30 * 60);  // 쿠키 유지 시간 30분
		cookie.setHttpOnly(true);
		cookie.setPath("/");
		response.addCookie(cookie);
		
		Map<String, String> body = new HashMap<>();
        body.put("token", jwt);
		
		return ResponseEntity.ok(body);
	}
	
	@PostMapping("/logout")
	public ResponseEntity<?> logout(HttpServletResponse response) {
	    Cookie cookie = new Cookie("jwt", null);
	    cookie.setMaxAge(0);
	    cookie.setHttpOnly(true);
	    cookie.setPath("/");
	    response.addCookie(cookie);
	    
	    SecurityContextHolder.clearContext();
	    
	    return ResponseEntity.ok("로그아웃 성공");
	}
	
	@GetMapping("/login/auth")
	public ResponseEntity<MemberAuthDto> getCurrentUser(@AuthenticationPrincipal CustomUser customUser) {
        if (customUser == null) {
        	return ResponseEntity.ok().build();
        }
                
        Optional<Member> member = memberService.getIdMember(customUser.getId());
        if(member.isPresent()) {
			MemberAuthDto memberAuthDto = memberService.getMemberDto(member.get());
			return ResponseEntity.ok(memberAuthDto);
		}
		else {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + member.get().getId() + " not found");
		} 
    }
	
	@PostMapping("/login/register_process")
	public ResponseEntity<?> registerProcess(@RequestBody @Valid MemberRegisterDto memberRegisterDto) {
	    memberService.saveMember(memberRegisterDto);
	    
	    return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공");
	}
}
