package com.example.emobit.config;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
	private static final String REQUEST_ID_KEY = "requestId";

	@Override
	protected void doFilterInternal(HttpServletRequest request,
									HttpServletResponse response,
									FilterChain filterChain
	) throws ServletException, IOException {
		MDC.put(REQUEST_ID_KEY, UUID.randomUUID().toString().substring(0, 8));
		long startTime = System.currentTimeMillis();

		try {
			log.info(">> {} {}", request.getMethod(), request.getRequestURI());
			filterChain.doFilter(request, response);
		} finally {
			long elapsed = System.currentTimeMillis() - startTime;
			log.info("<< {} {} - {} ({}ms)", request.getMethod(), request.getRequestURI(), response.getStatus(), elapsed);
			MDC.remove(REQUEST_ID_KEY);
		}
	}
}
