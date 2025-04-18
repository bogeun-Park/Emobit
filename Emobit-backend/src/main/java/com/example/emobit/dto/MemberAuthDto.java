package com.example.emobit.dto;

import com.example.emobit.domain.Member;
import com.example.emobit.security.Role;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MemberAuthDto {
	private Long id;
	private String displayName;
	private String username;
	
	@Enumerated(EnumType.STRING)
	private Role role;
	
	public MemberAuthDto(Member member) {
		this.id = member.getId();
		this.displayName = member.getDisplayName();
		this.username = member.getUsername();
		this.role = member.getRole();
	}
}
