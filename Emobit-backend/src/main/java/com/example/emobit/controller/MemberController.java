package com.example.emobit.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.emobit.service.MemberService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MemberController {
	private final MemberService memberService;
	
	@PostMapping("/login/register_process")
	public ResponseEntity<String> registerProcess(@RequestBody Map<String, String> formData) {
	    memberService.saveMember(formData);
	    
	    return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공");
	}
}
