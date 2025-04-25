package com.example.emobit.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.emobit.domain.Board;
import com.example.emobit.dto.BoardCreateDto;
import com.example.emobit.dto.BoardUpdateDto;
import com.example.emobit.repository.BoardRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardService {
	private final BoardRepository boardRepository;
	private final OracleStorageService oracleStorageService;
	
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
        String imageUrl = boardCreateDto.getImageUrl();

        Board board = new Board();
        board.setTitle(title);
        board.setContent(content);
        board.setImageUrl(imageUrl);
        board.setCreatedBy(createdBy);

        boardRepository.save(board);
	}
	
	public void updateBoard(Long id, BoardUpdateDto boardUpdateDto) {
		Board board = this.getIdBoard(id);
		
		board.setTitle(boardUpdateDto.getTitle());
        board.setContent(boardUpdateDto.getContent());

        boardRepository.save(board);
	}
	
	@Transactional
	public void deleteBoard(Long id) {
		Board board = this.getIdBoard(id); 
        String imageUrl = board.getImageUrl();
        String defaultImageUrl = "https://objectstorage.ap-chuncheon-1.oraclecloud.com/n/axsd3bml0uow/b/EmobitBucket/o/defaultImage.png";
        
		// 게시판 삭제 작업
        try {
        	boardRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("아이템 삭제 실패", e);
        }
		
        // 이미지 삭제 작업
        if (!imageUrl.equals(defaultImageUrl)) {
            boolean imageDeleted = oracleStorageService.deleteObject(imageUrl);
            if (!imageDeleted) {
                throw new RuntimeException("이미지 삭제 실패");
            }
        }
	}
}
