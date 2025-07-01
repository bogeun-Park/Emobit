package com.example.emobit.domain;

import java.util.ArrayList;
import java.util.List;

import com.example.emobit.enums.MemberRole;
import com.example.emobit.util.Constant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
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
	
	@Column(name = "IMAGE_PATH")
	private String imagePath = Constant.MEMBER_DEFAULT_IMAGE_PATH;
	
	@Enumerated(EnumType.STRING)
    @Column(name = "ROLE")
    private MemberRole role = MemberRole.USER;
	
	@ToString.Exclude
	@OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	@OrderBy("id DESC")
	private List<Board> boards = new ArrayList<>();
	
	@ToString.Exclude
	@OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonBackReference
	private List<Comments> comments = new ArrayList<>();
}
