package com.example.emobit.domain;

import com.example.emobit.security.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
public class Member {
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_member")
    @SequenceGenerator(name = "seq_member", sequenceName = "SEQ_MEMBER", allocationSize = 1)
	@Column(name = "ID")
	private Long id;
	
	@Column(name = "DISPLAYNAME", nullable = false)
	private String displayName;
	
	@Column(name = "USERNAME", nullable = false, unique = true)
	private String username;
	
	@Column(name = "PASSWORD", nullable = false)
	private String password;
	
	@Enumerated(EnumType.STRING)
    @Column(name = "ROLE")
    private Role role = Role.USER;
}
