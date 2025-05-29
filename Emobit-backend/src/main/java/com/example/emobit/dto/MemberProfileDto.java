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
	private Member member;
    private List<BoardDto> boards;

    public MemberProfileDto(Member member, List<BoardDto> boards) {
        this.member = member;
        this.boards = boards;
    }
}
