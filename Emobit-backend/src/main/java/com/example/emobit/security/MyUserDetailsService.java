package com.example.emobit.security;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.emobit.domain.Member;
import com.example.emobit.enums.MemberRole;
import com.example.emobit.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyUserDetailsService implements UserDetailsService {
	private final MemberRepository memberRepository;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Optional<Member> res = memberRepository.findByUsername(username);
		Member member;
		
		if(res.isPresent()) {
			member = res.get();
		} else {
			throw new UsernameNotFoundException("해당 아이디는 존재하지 않습니다.");
		}
		
		List<GrantedAuthority> authority = new ArrayList<>();
		if(member.getRole().equals(MemberRole.ADMIN)) { 
			authority.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
		} else {
			authority.add(new SimpleGrantedAuthority("ROLE_USER"));
		}
		
		CustomUser user = new CustomUser(member.getUsername(), member.getPassword(), authority);
		user.setId(member.getId());
		user.setDisplayName(member.getDisplayName());
		
		return user;
	}
}
