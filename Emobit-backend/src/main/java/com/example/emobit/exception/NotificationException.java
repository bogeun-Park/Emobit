package com.example.emobit.exception;

import org.springframework.http.HttpStatus;

public abstract class NotificationException extends RuntimeException {
	private static final long serialVersionUID = 1L;
	private final HttpStatus status;

    public NotificationException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
