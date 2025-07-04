package com.example.emobit.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MemberProfileDto {
	private MemberAuthDto member;
    private List<BoardDto> boards;

    public MemberProfileDto(MemberAuthDto member, List<BoardDto> boards) {
        this.member = member;
        this.boards = boards;
    }
}
