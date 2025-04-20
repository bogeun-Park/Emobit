package com.example.emobit.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.emobit.domain.Board;
import com.example.emobit.dto.BoardCreateDto;
import com.example.emobit.dto.BoardUpdateDto;
import com.example.emobit.repository.BoardRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardService {
	private final BoardRepository boardRepository;
	
	public List<Board> getAllBoard() {
		List<Board> boardList = boardRepository.findAll(Sort.by("id").ascending());
		
		return boardList;
	}
	
	public Board getIdBoard(Long id) {
		Board board = boardRepository.findById(id)
						.orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
		
		return board;
	}
	
	public void createBoard(Long createdBy, BoardCreateDto boardCreateDto) {
        String title = boardCreateDto.getTitle();
        String content = boardCreateDto.getContent();

        Board board = new Board();
        board.setTitle(title);
        board.setContent(content);
        board.setCreatedBy(createdBy);

        boardRepository.save(board);
	}
	
	public void updateBoard(Long id, BoardUpdateDto boardUpdateDto) {
		Board board = this.getIdBoard(id);
		
		board.setTitle(boardUpdateDto.getTitle());
        board.setContent(boardUpdateDto.getContent());

        boardRepository.save(board);
	}
	
	public void deleteBoard(Long id) {
		boardRepository.deleteById(id);
	}
}
