package com.example.emobit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.emobit.domain.Board;

public interface BoardRepository extends JpaRepository<Board, Long>{
	@Modifying
	@Query("UPDATE Board b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
	void incrementViewCount(@Param("id") Long id);

	@Query("SELECT b FROM Board b JOIN FETCH b.member ORDER BY b.id DESC")
	List<Board> findAllWithMember();

	// n-gram 기법으로 성능 최적화 할 수 있음
	@Query("SELECT b FROM Board b JOIN FETCH b.member " +
		   "WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
		   "OR LOWER(b.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
		   "ORDER BY b.id DESC")
	List<Board> getBoardByTitleOrContent(@Param("keyword") String keyword);
}
