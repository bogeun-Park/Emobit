package com.example.emobit.dto;

import java.util.List;

import com.example.emobit.domain.Member;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MemberProfileDto {
	private MemberAuthDto member;
	private List<BoardDto> boards;
	private FollowStatsDto follow;

	public MemberProfileDto(Member member, List<BoardDto> boards, FollowStatsDto follow) {
		this.member = new MemberAuthDto(member);
		this.boards = boards;
		this.follow = follow;
	}
}
