package com.example.emobit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Member;
import com.example.emobit.dto.BoardCreateDto;
import com.example.emobit.dto.BoardDto;
import com.example.emobit.dto.BoardUpdateDto;
import com.example.emobit.security.CustomUser;
import com.example.emobit.service.BoardService;
import com.example.emobit.service.OracleStorageService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BoardController {
	private final BoardService boardService;
	private final OracleStorageService oracleStorageService;
	
	@GetMapping("/board")
	public ResponseEntity<?> getAllBoard() {
		List<Board> boardList =  boardService.getBoardAll();
		List<BoardDto> boardListDto = boardList.stream()
		    .map(BoardDto::new)
		    .toList();
		
		return ResponseEntity.ok(boardListDto);
	}
	
	@PostMapping("/board/create_process")
	public ResponseEntity<?> boardCreateProcess(@RequestBody @Valid BoardCreateDto boardCreateDto,
												@AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
		
		boardService.createBoard(customUser.getId(), boardCreateDto);
	    
	    return ResponseEntity.status(HttpStatus.CREATED).body("게시글 작성 성공");
	}
	
	@GetMapping("/board/read/{id}")
	public ResponseEntity<?> boardRead(@PathVariable("id") Long id,
									   @AuthenticationPrincipal CustomUser customUser,
									   HttpServletRequest request) {
		Board board = boardService.getBoardById(id);
		BoardDto boardDto = new BoardDto(board);
		
		boardService.increaseViewCount(id, customUser, request);
		
		return ResponseEntity.ok(boardDto);
	}
	
	@PutMapping("/board/update_process/{id}")
    public ResponseEntity<String> boardUpdateProcess(@PathVariable("id") Long id, 
    												 @RequestBody @Valid BoardUpdateDto boardUpdateDto,
    												 @AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
		
		Board board = boardService.getBoardById(id);
		Member member = board.getMember();
	    if (!member.getId().equals(customUser.getId())) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("수정 권한이 없습니다.");
	    }
	    
		boardService.updateBoard(id, boardUpdateDto);
		
        return ResponseEntity.ok("게시글이 성공적으로 수정되었습니다.");
    }
	
	@DeleteMapping("/board/delete_process/{id}")
    public ResponseEntity<String> boardDeleteProcess(@PathVariable("id") Long id, 
    												 @AuthenticationPrincipal CustomUser customUser) {
		if (customUser == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }
		
		Board board = boardService.getBoardById(id);
		Member member = board.getMember();
	    if (!member.getId().equals(customUser.getId())) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("삭제 권한이 없습니다.");
	    }
	    
		boardService.deleteBoard(id);
		
        return ResponseEntity.status(200).body("게시글이 성공적으로 삭제되었습니다.");
    }
	
	@GetMapping("/board/PresignedUrl")
	public ResponseEntity<?> getPresignedUrl(@RequestParam("filename") String filename) {
	    String presignedUrl = oracleStorageService.createPresignedUrl(filename, "board");
	    
	    if (presignedUrl != null) {
	        return ResponseEntity.ok(presignedUrl);
	    } else {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Presigned URL 생성 실패");
	    }
	}
}
