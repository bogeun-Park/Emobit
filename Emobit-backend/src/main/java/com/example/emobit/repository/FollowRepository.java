package com.example.emobit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.emobit.domain.Follow;
import com.example.emobit.domain.Member;

public interface FollowRepository extends JpaRepository<Follow, Long> {
	Optional<Follow> findByFollowerAndFollowing(Member follower, Member following);
	boolean existsByFollowerAndFollowing(Member follower, Member following);
	long countByFollowing(Member following);
	long countByFollower(Member follower);

	@Query("SELECT f.follower FROM Follow f WHERE f.following = :member")
	List<Member> findFollowersByMember(@Param("member") Member member);

	@Query("SELECT f.following FROM Follow f WHERE f.follower = :member")
	List<Member> findFollowingsByMember(@Param("member") Member member);
}
