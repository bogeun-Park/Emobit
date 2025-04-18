package com.example.emobit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.emobit.domain.Board;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long>{

}
