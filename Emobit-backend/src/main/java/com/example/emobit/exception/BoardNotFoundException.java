package com.example.emobit.exception;

import org.springframework.http.HttpStatus;

public class BoardNotFoundException extends BoardException {
	private static final long serialVersionUID = 1L;

	public BoardNotFoundException(String message) {
		super(message, HttpStatus.NOT_FOUND);
    }
}
