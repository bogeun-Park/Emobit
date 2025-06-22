package com.example.emobit.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.emobit.domain.Member;
import com.example.emobit.dto.MemberAuthDto;
import com.example.emobit.dto.MemberRegisterDto;
import com.example.emobit.exception.MemberNotFoundException;
import com.example.emobit.repository.MemberRepository;
import com.example.emobit.util.Constant;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {
	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;
	private final OracleStorageService oracleStorageService;
	
	public Member getMemberById(Long id) {
    	Member member = memberRepository.findById(id)
    						.orElseThrow(() -> new MemberNotFoundException("회원 정보를 찾을 수 없습니다."));
    	
        return member;
    }
	
	public Member getMemberByUsername(String username) {
		Member member = memberRepository.findByUsername(username)
		        			.orElseThrow(() -> new MemberNotFoundException("회원 정보를 찾을 수 없습니다."));
				
	    return member;
	}
	
	public void registerMember(MemberRegisterDto memberRegisterDto) {
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
	
	public boolean existsByUsername(String username) {
		boolean bexists = memberRepository.existsByUsername(username);
		
		return bexists;
	}
	
	public MemberAuthDto getMemberDto(Member member) {
		MemberAuthDto memberAuthDto = new MemberAuthDto(member);
		
		return memberAuthDto;
	}
	
	@Transactional
	public void updateImagePath(Member member, String afterImagePath) {
		String beforeImagePath = member.getImagePath();
		
		try {
			member.setImagePath(afterImagePath);

	        memberRepository.save(member);
		} catch(Exception e) {
            throw new RuntimeException("이미지 수정 실패", e);
        }
		
		if (!beforeImagePath.equals(Constant.MEMBER_DEFAULT_IMAGE_PATH) && !beforeImagePath.equals(afterImagePath)) {
			boolean isImageDeleted = oracleStorageService.deleteObject(beforeImagePath);
            if (!isImageDeleted) {
            	throw new RuntimeException("이미지 삭제 실패");
            }
        }
	}
}
