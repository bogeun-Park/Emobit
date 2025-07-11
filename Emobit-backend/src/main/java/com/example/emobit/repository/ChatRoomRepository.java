package com.example.emobit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.ChatRoom;
import com.example.emobit.domain.Member;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
	// memberA, memberB는 지연 로딩(lazy loading) 되어 나중에 접근할 때 추가 쿼리가 발생하므로
	// 특정 id 값을 가진 ChatRoom을 조회할 때, 해당 채팅방에 속한 두 사용자(memberA, memberB)를 한 번의 쿼리로 함께 가져오도록 함
	@Query("SELECT cr FROM ChatRoom cr JOIN FETCH cr.memberA JOIN FETCH cr.memberB WHERE cr.id = :id")
	Optional<ChatRoom> findByIdWithUsers(@Param("id") Long id);
	
	@Query("SELECT c FROM ChatRoom c " +
	       "WHERE (c.memberA = :username AND c.memberAJoined = true) " +
	       "OR (c.memberB = :username AND c.memberBJoined = true)")
	List<ChatRoom> findByMember(@Param("username") Member member);

	Optional<ChatRoom> findByMemberAAndMemberB(Member memberA, Member memberB);  // 두 사용자의 채팅방을 찾는다
}
