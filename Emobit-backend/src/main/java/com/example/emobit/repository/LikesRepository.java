package com.example.emobit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.Likes;
import com.example.emobit.domain.Member;
import com.example.emobit.enums.LikeType;

@Repository
public interface LikesRepository extends JpaRepository<Likes, Long> {
	Optional<Likes> findBySenderAndTypeAndTargetId(Member sender, LikeType type, Long targetId);
	boolean existsBySenderAndTypeAndTargetId(Member sender, LikeType type, Long targetId);
	
	@Query("SELECT l.sender FROM Likes l WHERE l.type = :type AND l.targetId = :targetId")
	List<Member> findSendersByTypeAndTargetId(@Param("type") LikeType type, @Param("targetId") Long targetId);
}
