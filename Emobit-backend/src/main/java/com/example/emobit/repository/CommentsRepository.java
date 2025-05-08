package com.example.emobit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.Comments;

@Repository
public interface CommentsRepository extends JpaRepository<Comments, Long> {
	@Query("SELECT c FROM Comments c JOIN FETCH c.board WHERE c.board.id = :boardId")
	List<Comments> customFindAllByBoardId(@Param("boardId") Long boardId);
}
