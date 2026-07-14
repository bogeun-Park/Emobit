package com.example.emobit.exception;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
	// 폼이나 json 형식, 조건 등의 유효성 검사(@Vaild) 실패 처리
	@ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getAllErrors().stream()
            .map(error -> error.getDefaultMessage())
            .collect(Collectors.toList());

        log.warn("입력값 검증 실패: {}", errors);

        return ResponseEntity.badRequest().body(errors);
    }

	@ExceptionHandler(BoardException.class)
	public ResponseEntity<String> handleBoardException(BoardException e) {
		log.warn("BoardException: {}", e.getMessage());
	    return ResponseEntity.status(e.getStatus()).body(e.getMessage());
	}

	@ExceptionHandler(MemberException.class)
	public ResponseEntity<String> handleMemberException(MemberException e) {
		log.warn("MemberException: {}", e.getMessage());
	    return ResponseEntity.status(e.getStatus()).body(e.getMessage());
	}

	@ExceptionHandler(ChatRoomException.class)
	public ResponseEntity<String> handleChatRoomException(ChatRoomException e) {
		log.warn("ChatRoomException: {}", e.getMessage());
	    return ResponseEntity.status(e.getStatus()).body(e.getMessage());
	}
}
