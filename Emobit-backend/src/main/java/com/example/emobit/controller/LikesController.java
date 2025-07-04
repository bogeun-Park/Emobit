package com.example.emobit.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.emobit.domain.Member;
import com.example.emobit.dto.LikeRequestDto;
import com.example.emobit.dto.MemberAuthDto;
import com.example.emobit.enums.LikeType;
import com.example.emobit.security.CustomUser;
import com.example.emobit.service.LikesService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LikesController {
	private final LikesService likesService;
	
	@GetMapping("/likes/senders")
	public ResponseEntity<?> getLikeSenders(@RequestParam("type") LikeType type,
	                                        @RequestParam("targetId") Long targetId) {
		List<Member> senderList = likesService.getLikeSenders(type, targetId);
		List<MemberAuthDto> senderListDto = senderList.stream()
			.map(MemberAuthDto::new)
			.toList();
		
	    return ResponseEntity.ok(senderListDto);
	}
	
	@GetMapping("/likes/status")
	public ResponseEntity<?> getLikeStatus(@RequestParam("type") LikeType type,
	        							   @RequestParam("targetId") Long targetId,
	                                       @AuthenticationPrincipal CustomUser customUser) {
	    if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }

	    boolean isLike = likesService.isLikeByUser(customUser.getId(), type, targetId);
	    
	    return ResponseEntity.ok(isLike);
	}
	
	@PostMapping("/likes/toggle")
    public ResponseEntity<?> toggleLike(@RequestBody @Valid LikeRequestDto likeRequestDto,
    									@AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
		
		boolean isLike = likesService.toggleLike(customUser.getId(), likeRequestDto.getType(), likeRequestDto.getTargetId());
		List<Member> senderList = likesService.getLikeSenders(likeRequestDto.getType(), likeRequestDto.getTargetId());
		List<MemberAuthDto> senderListDto = senderList.stream()
			.map(MemberAuthDto::new)
			.toList();
		
		Map<String, Object> response = new HashMap<>();
	    response.put("isLike", isLike);
	    response.put("senders", senderListDto);
		
		return ResponseEntity.ok(response);
    }
}
