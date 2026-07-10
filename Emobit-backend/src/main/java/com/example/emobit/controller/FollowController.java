package com.example.emobit.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.emobit.dto.FollowRequestDto;
import com.example.emobit.dto.FollowStatsDto;
import com.example.emobit.security.CustomUser;
import com.example.emobit.service.FollowService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FollowController {
	private final FollowService followService;

	@PostMapping("/follow/toggle")
	public ResponseEntity<?> toggleFollow(@RequestBody @Valid FollowRequestDto followRequestDto,
										  @AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }

		boolean isFollow = followService.toggleFollow(customUser.getId(), followRequestDto.getTargetId());
		long followerCount = followService.getFollowerCount(followRequestDto.getTargetId());
		long followingCount = followService.getFollowingCount(followRequestDto.getTargetId());

		FollowStatsDto followStatsDto = new FollowStatsDto(followerCount, followingCount, isFollow);

		return ResponseEntity.ok(followStatsDto);
    }
}
