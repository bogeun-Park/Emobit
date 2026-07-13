package com.example.emobit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.emobit.domain.Member;
import com.example.emobit.dto.FollowMemberDto;
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

	@GetMapping("/follow/followers/{targetId}")
	public ResponseEntity<?> getFollowers(@PathVariable("targetId") Long targetId,
										  @AuthenticationPrincipal CustomUser customUser) {
		List<Member> memberList = followService.getFollowers(targetId);
		List<FollowMemberDto> memberListDto = memberList.stream()
			.map(member -> new FollowMemberDto(member, customUser != null && followService.isFollowing(customUser.getId(), member.getId())))
			.toList();

		return ResponseEntity.ok(memberListDto);
	}

	@GetMapping("/follow/following/{targetId}")
	public ResponseEntity<?> getFollowings(@PathVariable("targetId") Long targetId,
										   @AuthenticationPrincipal CustomUser customUser) {
		List<Member> memberList = followService.getFollowings(targetId);
		List<FollowMemberDto> memberListDto = memberList.stream()
			.map(member -> new FollowMemberDto(member, customUser != null && followService.isFollowing(customUser.getId(), member.getId())))
			.toList();

		return ResponseEntity.ok(memberListDto);
	}

	@DeleteMapping("/follow/remove/{followerId}")
	public ResponseEntity<?> removeFollower(@PathVariable("followerId") Long followerId,
											@AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }

		followService.removeFollower(customUser.getId(), followerId);
		long followerCount = followService.getFollowerCount(customUser.getId());

		return ResponseEntity.ok(followerCount);
	}
}
