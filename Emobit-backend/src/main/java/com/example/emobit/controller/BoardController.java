package com.example.emobit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.emobit.domain.Board;
import com.example.emobit.dto.BoardCreateDto;
import com.example.emobit.service.BoardService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BoardController {
	private final BoardService boardService;
	
	@GetMapping("/board")
	public ResponseEntity<?> getBoard() {
		List<Board> boardList =  boardService.getAllBoard();
		
		return ResponseEntity.ok(boardList);
	}
	
	@PostMapping("/board/create_process")
	public ResponseEntity<?> createProcess(@RequestBody @Valid BoardCreateDto boardCreateDto) {
		boardService.saveBoard(boardCreateDto);
	    
	    return ResponseEntity.status(HttpStatus.CREATED).body("게시글 작성 성공");
	}
}
