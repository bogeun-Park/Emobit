package com.example.emobit.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.emobit.domain.Comments;

public interface CommentsRepository extends JpaRepository<Comments, Long> {
	@Query("SELECT c FROM Comments c JOIN FETCH c.member WHERE c.board.id = :boardId ORDER BY c.id ASC")
	List<Comments> customFindAllByBoardId(@Param("boardId") Long boardId);

	@Query("SELECT c FROM Comments c JOIN FETCH c.board WHERE c.id IN :ids")
	List<Comments> findAllByIdInWithBoard(@Param("ids") Collection<Long> ids);
}
