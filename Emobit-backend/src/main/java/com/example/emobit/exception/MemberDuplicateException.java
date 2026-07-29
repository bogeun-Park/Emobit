package com.example.emobit.exception;

import org.springframework.http.HttpStatus;

public class MemberDuplicateException extends MemberException {
	private static final long serialVersionUID = 1L;

	public MemberDuplicateException(String message) {
		super(message, HttpStatus.CONFLICT);
    }
}
