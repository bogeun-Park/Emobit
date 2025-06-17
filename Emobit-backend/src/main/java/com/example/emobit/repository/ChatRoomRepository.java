package com.example.emobit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.ChatRoom;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
	@Query("SELECT c FROM ChatRoom c " +
	       "WHERE (c.userA = :username AND c.userAJoined = true) " +
	       "OR (c.userB = :username AND c.userBJoined = true)")
	List<ChatRoom> findByUsername(@Param("username") String username);

	Optional<ChatRoom> findByUserAAndUserB(String userA, String userB);  // 두 사용자의 채팅방을 찾는다
}
