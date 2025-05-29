package com.example.emobit.exception;

import org.springframework.http.HttpStatus;

public class MemberNotFoundException extends MemberException {
	private static final long serialVersionUID = 1L;

	public MemberNotFoundException(String message) {
		super(message, HttpStatus.NOT_FOUND);
    }
}
