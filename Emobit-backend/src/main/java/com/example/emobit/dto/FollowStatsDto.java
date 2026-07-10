package com.example.emobit.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class FollowStatsDto {
	private long followerCount;
	private long followingCount;

	@Getter(AccessLevel.NONE)
	private boolean isFollow;

	public FollowStatsDto(long followerCount, long followingCount, boolean isFollow) {
		this.followerCount = followerCount;
		this.followingCount = followingCount;
		this.isFollow = isFollow;
	}

	@JsonProperty("isFollow")
	public boolean isFollow() {
		return isFollow;
	}
}
