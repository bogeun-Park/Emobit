package com.example.emobit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.Member;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long>{
	Optional<Member> findByUsername(String username);  // Derived query methods
	
	boolean existsByUsername(String username);
	
	// n-gram 기법으로 성능 최적화 할 수 있음
	@Query(value = "SELECT * FROM Member " +
		           "WHERE LOWER(username) LIKE LOWER('%' || :keyword || '%') " +
		           "OR LOWER(displayName) LIKE LOWER('%' || :keyword || '%') ",
		   nativeQuery = true)
	List<Member> getMembersByUsernameOrDisplayName(@Param("keyword") String keyword);
}
