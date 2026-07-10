package com.example.emobit.exception;

import org.springframework.http.HttpStatus;

public class SelfFollowException extends MemberException {
	private static final long serialVersionUID = 1L;

	public SelfFollowException(String message) {
		super(message, HttpStatus.BAD_REQUEST);
    }
}
