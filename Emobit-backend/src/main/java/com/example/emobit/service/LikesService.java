package com.example.emobit.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.emobit.domain.Likes;
import com.example.emobit.domain.Member;
import com.example.emobit.enums.LikeType;
import com.example.emobit.repository.LikesRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LikesService {
	private final LikesRepository likesRepository;
	private final MemberService memberService;
	
	public List<Member> getLikeSenders(LikeType type, Long targetId) {
		List<Member> senders = likesRepository.findSendersByTypeAndTargetId(type, targetId);
		
		return senders;
	}
	
	public boolean isLikeByUser(Long senderId, LikeType type, Long targetId) {
		Member sender = memberService.getMemberById(senderId);
		boolean isLike = likesRepository.existsBySenderAndTypeAndTargetId(sender, type, targetId);
		
	    return isLike;
	}
	
	public boolean toggleLike(Long senderId, LikeType type, Long targetId) {
        Member sender = memberService.getMemberById(senderId);
        Optional<Likes> existingLike = likesRepository.findBySenderAndTypeAndTargetId(sender, type, targetId);

        if (existingLike.isPresent()) {  // 좋아요가 있으면 삭제 (좋아요 취소)
            likesRepository.delete(existingLike.get());
            
            return false;
        } else {  // 없으면 좋아요 추가
            Likes like = new Likes();
            like.setSender(sender);
            like.setType(type);
            like.setTargetId(targetId);
            
            likesRepository.save(like);
            
            return true;
        }
    }
}
