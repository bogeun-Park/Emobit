package com.example.emobit.service;

import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Member;
import com.example.emobit.dto.BoardCreateDto;
import com.example.emobit.dto.BoardUpdateDto;
import com.example.emobit.exception.BoardNotFoundException;
import com.example.emobit.repository.BoardRepository;
import com.example.emobit.security.CustomUser;
import com.example.emobit.util.Constant;
import com.example.emobit.util.IpUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardService {
	private final BoardRepository boardRepository;
	private final MemberService memberService;
	private final OracleStorageService oracleStorageService;
	private final StringRedisTemplate redisTemplate;
	
	public List<Board> getBoardAll() {
		List<Board> boardList = boardRepository.findAll(Sort.by("id").descending());
		
		return boardList;
	}
	
	public Board getBoardById(Long id) {
		Board board = boardRepository.findById(id)
						.orElseThrow(() -> new BoardNotFoundException("게시글을 찾을 수 없습니다."));
		
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
		  
		if (!beforeImageUrl.equals(Constant.BOARD_DEFAULT_IMG_URL) && !beforeImageUrl.equals(afterImageUrl)) {
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
        if (!imageUrl.equals(Constant.BOARD_DEFAULT_IMG_URL)) {
            boolean imageDeleted = oracleStorageService.deleteObject(imageUrl);
            if (!imageDeleted) {
                throw new RuntimeException("이미지 삭제 실패");
            }
        }
	}
	
	@Transactional
	public void increaseViewCount(Long id, CustomUser customUser, HttpServletRequest request) {
		String key;

	    if (customUser != null) {
	        // 로그인한 사용자면 userId 기준
	        Long userId = customUser.getId();
	        key = "viewed::" + id + "::user::" + userId;
	    } else {
	        // 비로그인 사용자면 IP 기준
	        String userIp = IpUtil.getClientIp(request);
	        key = "viewed::" + id + "::ip::" + userIp;
	    }

	    if (!redisTemplate.hasKey(key)) {
	        boardRepository.incrementViewCount(id);
	        redisTemplate.opsForValue().set(key, "1", 10, TimeUnit.MINUTES);  // 조회수 종복 방지 10분
	    }
	}
}
