package com.example.emobit.exception;

import org.springframework.http.HttpStatus;

public class ChatRoomNotFoundException extends ChatRoomException {
	private static final long serialVersionUID = 1L;

	public ChatRoomNotFoundException(String message) {
		super(message, HttpStatus.NOT_FOUND);
    }
}
