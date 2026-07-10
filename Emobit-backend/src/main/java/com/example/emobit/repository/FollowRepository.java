package com.example.emobit.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.emobit.domain.Follow;
import com.example.emobit.domain.Member;

public interface FollowRepository extends JpaRepository<Follow, Long> {
	Optional<Follow> findByFollowerAndFollowing(Member follower, Member following);
	boolean existsByFollowerAndFollowing(Member follower, Member following);
	long countByFollowing(Member following);
	long countByFollower(Member follower);
}
