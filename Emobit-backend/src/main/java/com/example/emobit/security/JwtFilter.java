package com.example.emobit.security;

import java.io.IOException;
import java.util.Arrays;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(HttpServletRequest request, 
									HttpServletResponse response, 
									FilterChain filterChain
	) throws ServletException, IOException {
		// 1. 'jwt'이름의 쿠기가 있으면 꺼낸다 
		// 2. 유효기간, 위조여부 등 확인한다
		// 3. 문제 없으면 auth 변수에 유저정보 넣어준다
		
		Cookie[] cookies = request.getCookies();
		if(cookies == null) {
			filterChain.doFilter(request, response);
			return;
		}
		
		String jwtCookie = "";
		for(int i=0; i<cookies.length; i++) {
			if(cookies[i].getName().equals("jwt")) {
				jwtCookie = cookies[i].getValue();
			}
		}
		
		Claims claim;
		try {
			claim = Jwtutil.extractToken(jwtCookie);
		} catch(Exception e) {
			filterChain.doFilter(request, response);
			return;
		}
		
		var arr = claim.get("authorities").toString().split(",");
		var authorities = Arrays.stream(arr).map(a -> new SimpleGrantedAuthority(a)).toList();
		CustomUser user = new CustomUser(claim.get("username").toString(), "none", authorities);
		user.setDisplayName(claim.get("displayName").toString());
		user.setId(Long.parseLong(claim.get("id").toString()));
		
		var authToken = new UsernamePasswordAuthenticationToken(user, "", authorities);
		authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
		SecurityContextHolder.getContext().setAuthentication(authToken);
		
		filterChain.doFilter(request, response);
	}
	
}
