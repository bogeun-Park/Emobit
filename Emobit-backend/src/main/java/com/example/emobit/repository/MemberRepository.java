package com.example.emobit.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.Member;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long>{
	Optional<Member> findByUsername(String username);  // Derived query methods
	boolean existsByUsername(String username);
}
