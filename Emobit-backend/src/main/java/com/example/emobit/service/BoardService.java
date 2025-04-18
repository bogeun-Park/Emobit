package com.example.emobit.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.emobit.domain.Board;
import com.example.emobit.dto.BoardCreateDto;
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
	
	public void saveBoard(BoardCreateDto boardCreateDto) {
        String title = boardCreateDto.getTitle();
        String content = boardCreateDto.getContent();
        String strCreatedBy = boardCreateDto.getCreatedBy();
        
        Long createdBy = null;
        if (strCreatedBy != null && !strCreatedBy.isEmpty()) {
        	createdBy = Long.parseLong(strCreatedBy);
        }

        Board board = new Board();
        board.setTitle(title);
        board.setContent(content);
        board.setCreatedBy(createdBy);

        boardRepository.save(board);
	}
}
