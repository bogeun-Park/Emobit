package com.example.emobit.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.emobit.domain.Member;
import com.example.emobit.dto.MemberAuthDto;
import com.example.emobit.dto.MemberRegisterDto;
import com.example.emobit.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {
	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;
	
	public Optional<Member> getIdMember(Long id) {
    	Optional<Member> member = memberRepository.findById(id);
    	
        return member;
    }
	
	public void saveMember(MemberRegisterDto memberRegisterDto) {
		String displayName = memberRegisterDto.getDisplayName();
	    String username = memberRegisterDto.getUsername();
	    String password = memberRegisterDto.getPassword();
        
        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(password);

        Member member = new Member();
        member.setDisplayName(displayName);
        member.setUsername(username);
        member.setPassword(encodedPassword);

        memberRepository.save(member);
	}
	
	public MemberAuthDto getMemberDto(Member member) {
		MemberAuthDto memberAuthDto = new MemberAuthDto(member);
		
		return memberAuthDto;
	}
}
