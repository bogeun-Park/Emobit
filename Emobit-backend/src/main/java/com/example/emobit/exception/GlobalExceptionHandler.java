package com.example.emobit.exception;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

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

	@ExceptionHandler(CommentsException.class)
	public ResponseEntity<String> handleCommentsException(CommentsException e) {
		log.warn("CommentsException: {}", e.getMessage());
	    return ResponseEntity.status(e.getStatus()).body(e.getMessage());
	}

	@ExceptionHandler(NotificationException.class)
	public ResponseEntity<String> handleNotificationException(NotificationException e) {
		log.warn("NotificationException: {}", e.getMessage());
	    return ResponseEntity.status(e.getStatus()).body(e.getMessage());
	}

	// 사전 중복 체크를 통과했더라도, 동시 요청 레이스로 DB unique 제약조건을 위반한 경우
	// (예: 회원가입 시 동시에 같은 username으로 요청) 500 대신 409로 응답
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<String> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
		log.warn("DataIntegrityViolationException: {}", e.getMessage());
		return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 사용 중이거나 중복된 값입니다.");
	}

	// 매핑되지 않은 경로 요청 시 Spring이 자동으로 던지는 예외.
	// catch-all(Exception.class)에 잡히면 500으로 나가버려서, 원래 의미에 맞는 404로 조용히 응답하도록 별도 처리
	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<String> handleNoResourceFoundException(NoResourceFoundException e) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body("요청한 리소스를 찾을 수 없습니다.");
	}

	// 위에서 잡히지 않은, 예상치 못한 예외 처리
	@ExceptionHandler(Exception.class)
	public ResponseEntity<String> handleException(Exception e) {
		log.error("처리되지 않은 예외 발생", e);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
	}
}
