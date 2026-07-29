package com.example.emobit.exception;

import org.springframework.http.HttpStatus;

public class NotificationNotFoundException extends NotificationException {
	private static final long serialVersionUID = 1L;

	public NotificationNotFoundException(String message) {
		super(message, HttpStatus.NOT_FOUND);
    }
}
