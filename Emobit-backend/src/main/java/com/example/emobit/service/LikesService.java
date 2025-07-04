package com.example.emobit.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.emobit.domain.Board;
import com.example.emobit.domain.Likes;
import com.example.emobit.domain.Member;
import com.example.emobit.enums.LikeType;
import com.example.emobit.enums.NotificationType;
import com.example.emobit.repository.LikesRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LikesService {
	private final LikesRepository likesRepository;
	private final MemberService memberService;
	private final BoardService boardService;
	private final NotificationService notificationService;
	
	public List<Member> getLikeSenders(LikeType type, Long targetId) {
		List<Member> senders = likesRepository.findSendersByTypeAndTargetId(type, targetId);
		
		return senders;
	}
	
	public boolean isLikeByUser(Long senderId, LikeType type, Long targetId) {
		Member sender = memberService.getMemberById(senderId);
		boolean isLike = likesRepository.existsBySenderAndTypeAndTargetId(sender, type, targetId);
		
	    return isLike;
	}
	
	@Transactional
	public boolean toggleLike(Long senderId, LikeType type, Long targetId) {
        Member sender = memberService.getMemberById(senderId);
        Optional<Likes> existingLike = likesRepository.findBySenderAndTypeAndTargetId(sender, type, targetId);

        if (existingLike.isPresent()) {  // 좋아요가 있으면 삭제 (좋아요 취소)
            likesRepository.delete(existingLike.get());
            
            if (type == LikeType.BOARD) {
                Board board = boardService.getBoardById(targetId);
                Member receiver = board.getMember();

                // 상대방이 좋아요 알림을 읽지 않은 경우 알림 삭제
                if (!receiver.getId().equals(sender.getId())) {
                    notificationService.deleteNotificationIfUnread(receiver, sender, NotificationType.LIKE, targetId);
                }
            }
            
            return false;
        } else {  // 없으면 좋아요 추가
            Likes like = new Likes();
            like.setSender(sender);
            like.setType(type);
            like.setTargetId(targetId);
            
            likesRepository.save(like);
            
            if (type == LikeType.BOARD) {
                Board board = boardService.getBoardById(targetId);
                Member receiver = board.getMember();
                
                // 좋아요가 자신이 작성한 게시글이 아닌 경우에만 알림 생성 (자기 알림 방지)
                if (!receiver.getId().equals(sender.getId())) {
                    notificationService.createNotification(receiver, sender, NotificationType.LIKE, targetId, null);
                }
            }
            
            return true;
        }
    }
}
