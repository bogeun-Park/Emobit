package com.example.emobit.exception;

import org.springframework.http.HttpStatus;

public class CommentsNotFoundException extends CommentsException {
	private static final long serialVersionUID = 1L;

	public CommentsNotFoundException(String message) {
		super(message, HttpStatus.NOT_FOUND);
    }
}
