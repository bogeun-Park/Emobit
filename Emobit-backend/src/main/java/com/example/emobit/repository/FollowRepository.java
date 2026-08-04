package com.example.emobit.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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

	// followerId가 candidateIds 중 실제로 팔로우하는 id만 골라냄 (목록마다 팔로우 여부를 건별로 조회하지 않기 위함)
	@Query("SELECT f.following.id FROM Follow f WHERE f.follower.id = :followerId AND f.following.id IN :candidateIds")
	Set<Long> findFollowingIdsIn(@Param("followerId") Long followerId, @Param("candidateIds") Collection<Long> candidateIds);
}
