package com.example.emobit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.Board;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long>{
	@Modifying
	@Query("UPDATE Board b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
	void incrementViewCount(@Param("id") Long id);
	
	// n-gram 기법으로 성능 최적화 할 수 있음
	@Query(value = "SELECT * FROM board " +
		           "WHERE LOWER(title) LIKE LOWER('%' || :keyword || '%') " +
		           "OR LOWER(content) LIKE LOWER('%' || :keyword || '%') " +
		           "ORDER BY id DESC",
		   nativeQuery = true)
	List<Board> getBoardByTitleOrContent(@Param("keyword") String keyword);
}
