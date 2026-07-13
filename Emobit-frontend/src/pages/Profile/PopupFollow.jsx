import '../../styles/PopupFollow.css';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { Search, UserPlus, X } from 'lucide-react';

function PopupFollow({ mode, targetId, setShowFollowPopup, onFollowerCountChange, onFollowingCountChange }) {
    const axios = useAxios();
    const navigate = useNavigate();
    const auth = useSelector(state => state.auth);
    const [members, setMembers] = useState([]);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        axios.get(`/follow/${mode}/${targetId}`)
            .then((response) => {
                setMembers(response.data);
            })
            .catch((error) => {
                console.error('에러 발생:', error);
            });
    }, [mode, targetId]);

    // ESC키 입력시 팝업 닫히게 하는 이벤트 리스너 설정
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowFollowPopup(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [setShowFollowPopup]);

    const handleMoveProfile = (username) => {
        navigate(`/${username}`);
        setShowFollowPopup(false);
    };

    const handleToggleFollow = (memberId) => {
        axios.post('/follow/toggle', { targetId: memberId })
            .then((response) => {
                setMembers(prev => prev.map(member =>
                    member.id === memberId ? { ...member, isFollow: response.data.isFollow } : member
                ));

                // 내 팔로잉 목록에서 언팔/재팔로우한 경우, 프로필 페이지의 팔로잉 카운트도 즉시 반영
                if (mode === 'following' && auth.id === targetId) {
                    onFollowingCountChange?.(response.data.isFollow ? 1 : -1);
                }
            })
            .catch((error) => {
                console.error('에러 발생:', error);
            });
    };

    const handleRemoveFollower = (memberId) => {
        const confirmed = window.confirm('팔로워를 삭제하시겠습니까?');
        if (!confirmed) return;

        axios.delete(`/follow/remove/${memberId}`)
            .then((response) => {
                setMembers(prev => prev.filter(member => member.id !== memberId));
                onFollowerCountChange?.(response.data);
            })
            .catch((error) => {
                console.error('에러 발생:', error);
            });
    };

    // 로그인한 내가 내 팔로워 목록을 보고 있는 경우에만 삭제 기능 사용
    const isOwnFollowersList = mode === 'followers' && auth.id === targetId;

    const trimmedKeyword = keyword.trim().toLowerCase();
    const filteredMembers = trimmedKeyword
        ? members.filter(member =>
            member.username.toLowerCase().includes(trimmedKeyword) ||
            member.displayName.toLowerCase().includes(trimmedKeyword)
        )
        : members;

    return (
        <div className="popup-follow-overlay" onClick={() => setShowFollowPopup(false)}>
            <div className="popup-follow" onClick={e => e.stopPropagation()}>
                <h3>{mode === 'followers' ? '팔로워' : '팔로잉'}</h3>
                <div className="close-button" onClick={() => setShowFollowPopup(false)}>
                    <X size={26} color="#000" />
                </div>

                <div className="follow-search-wrapper">
                    <Search className="follow-search-icon" />
                    <input
                        type="text"
                        placeholder="검색"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    {keyword && (
                        <button className="follow-search-clear" onClick={() => setKeyword('')}>
                            <X size={12} strokeWidth={2} />
                        </button>
                    )}
                </div>

                {members.length === 0 ? (
                    <div className="follow-empty-state">
                        <span className="follow-empty-icon-wrapper">
                            <UserPlus className="follow-empty-icon" size={52} strokeWidth={1} />
                        </span>
                        <div className="follow-empty-title">
                            {mode === 'followers' ? '팔로워' : '회원님이 팔로우하는 사람'}
                        </div>
                        <div className="follow-empty-subtitle">
                            {mode === 'followers'
                                ? '회원님을 팔로우하는 모든 사람이 여기에 표시됩니다.'
                                : '회원님이 팔로우하는 사람들이 여기에 표시됩니다.'}
                        </div>
                    </div>
                ) : (
                    <ul>
                        {filteredMembers.map(member => (
                            <li key={member.id} className="follow-member-item">
                                <div className="member-info">
                                    <img
                                        src={member.imageUrl}
                                        alt={member.username}
                                        onClick={() => handleMoveProfile(member.username)}
                                    />
                                    <div className="member-wrapper" onClick={() => handleMoveProfile(member.username)}>
                                        <span className="member-username">{member.username}</span>
                                        <span className="member-displayName">{member.displayName}</span>
                                    </div>
                                </div>

                                {isOwnFollowersList ? (
                                    <button
                                        className="follow-button following"
                                        onClick={() => handleRemoveFollower(member.id)}
                                    >
                                        삭제
                                    </button>
                                ) : (
                                    auth.username !== member.username && (
                                        <button
                                            className={`follow-button ${member.isFollow ? 'following' : ''}`}
                                            onClick={() => handleToggleFollow(member.id)}
                                        >
                                            {member.isFollow ? '팔로잉' : '팔로우'}
                                        </button>
                                    )
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default PopupFollow;
