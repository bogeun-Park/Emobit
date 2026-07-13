package com.example.emobit.dto;

import com.example.emobit.domain.Member;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(callSuper = true)
public class FollowMemberDto extends MemberAuthDto {
	@Getter(AccessLevel.NONE)
	private boolean isFollow;

	public FollowMemberDto(Member member, boolean isFollow) {
		super(member);
		this.isFollow = isFollow;
	}

	@JsonProperty("isFollow")
	public boolean isFollow() {
		return isFollow;
	}
}
