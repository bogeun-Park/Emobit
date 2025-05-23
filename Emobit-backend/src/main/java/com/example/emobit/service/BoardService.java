package com.example.emobit.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Member;
import com.example.emobit.dto.BoardCreateDto;
import com.example.emobit.dto.BoardUpdateDto;
import com.example.emobit.repository.BoardRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardService {
	private final BoardRepository boardRepository;
	private final MemberService memberService;
	private final OracleStorageService oracleStorageService;
	private final String defaultImageUrl = "https://objectstorage.ap-chuncheon-1.oraclecloud.com/n/axsd3bml0uow/b/EmobitBucket/o/board/8225153c-f63a-4f04-8767-15a20c7d5163.png";
	
	public List<Board> getBoardAll() {
		List<Board> boardList = boardRepository.findAll(Sort.by("id").descending());
		
		return boardList;
	}
	
	public Board getBoardById(Long id) {
		Board board = boardRepository.findById(id)
						.orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
		
		return board;
	}
	
	public void createBoard(Long createdBy, BoardCreateDto boardCreateDto) {
        String title = boardCreateDto.getTitle();
        String content = boardCreateDto.getContent();
        String imageUrl = boardCreateDto.getImageUrl();
        Member member = memberService.getMemberById(createdBy);
        
        Board board = new Board();
        board.setTitle(title);
        board.setContent(content);
        board.setImageUrl(imageUrl);
        board.setMember(member);

        boardRepository.save(board);
	}
	
	@Transactional
	public void updateBoard(Long id, BoardUpdateDto boardUpdateDto) {
		Board board = this.getBoardById(id);
		String beforeImageUrl = boardUpdateDto.getBeforeImageUrl();
		String afterImageUrl = boardUpdateDto.getAfterImageUrl();
		
		try {
			board.setTitle(boardUpdateDto.getTitle());
	        board.setContent(boardUpdateDto.getContent());
	        board.setImageUrl(afterImageUrl);

	        boardRepository.save(board);
		} catch(Exception e) {
            throw new RuntimeException("게시판 수정 실패", e);
        }
		  
		if (!beforeImageUrl.equals(defaultImageUrl)) {
            boolean bImageDeleted = oracleStorageService.deleteObject(beforeImageUrl);
            if (!bImageDeleted) {
                throw new RuntimeException("이미지 삭제 실패");
            }
        }
	}
	
	@Transactional
	public void deleteBoard(Long id) {
		Board board = this.getBoardById(id); 
        String imageUrl = board.getImageUrl();
        
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
