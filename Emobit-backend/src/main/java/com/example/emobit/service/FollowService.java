package com.example.emobit.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.emobit.domain.Follow;
import com.example.emobit.domain.Member;
import com.example.emobit.enums.NotificationType;
import com.example.emobit.exception.SelfFollowException;
import com.example.emobit.repository.FollowRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FollowService {
	private final FollowRepository followRepository;
	private final MemberService memberService;
	private final NotificationService notificationService;

	@Transactional
	public boolean toggleFollow(Long followerId, Long followingId) {
		if (followerId.equals(followingId)) {
			throw new SelfFollowException("자기 자신을 팔로우할 수 없습니다.");
		}

		Member follower = memberService.getMemberById(followerId);
		Member following = memberService.getMemberById(followingId);
		Optional<Follow> existingFollow = followRepository.findByFollowerAndFollowing(follower, following);

		if (existingFollow.isPresent()) {  // 팔로우가 있으면 삭제 (언팔로우)
			followRepository.delete(existingFollow.get());

			notificationService.deleteNotificationIfUnread(following, follower, NotificationType.FOLLOW, following.getId());

			return false;
		} else {  // 없으면 팔로우 추가
			Follow follow = new Follow();
			follow.setFollower(follower);
			follow.setFollowing(following);

			followRepository.save(follow);

			notificationService.createNotification(following, follower, NotificationType.FOLLOW, following.getId(), null, null);

			return true;
		}
	}

	public boolean isFollowing(Long followerId, Long followingId) {
		Member follower = memberService.getMemberById(followerId);
		Member following = memberService.getMemberById(followingId);

		return followRepository.existsByFollowerAndFollowing(follower, following);
	}

	public long getFollowerCount(Long memberId) {
		Member member = memberService.getMemberById(memberId);

		return followRepository.countByFollowing(member);
	}

	public long getFollowingCount(Long memberId) {
		Member member = memberService.getMemberById(memberId);

		return followRepository.countByFollower(member);
	}

	public List<Member> getFollowers(Long memberId) {
		Member member = memberService.getMemberById(memberId);

		return followRepository.findFollowersByMember(member);
	}

	public List<Member> getFollowings(Long memberId) {
		Member member = memberService.getMemberById(memberId);

		return followRepository.findFollowingsByMember(member);
	}

	@Transactional
	public void removeFollower(Long ownerId, Long followerId) {
		Member owner = memberService.getMemberById(ownerId);
		Member follower = memberService.getMemberById(followerId);

		followRepository.findByFollowerAndFollowing(follower, owner)
			.ifPresent(followRepository::delete);

		notificationService.deleteNotificationIfUnread(owner, follower, NotificationType.FOLLOW, owner.getId());
	}
}
