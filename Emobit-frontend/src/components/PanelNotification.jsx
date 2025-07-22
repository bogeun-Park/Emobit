import '../styles/PanelNotification.css';
import React, { useEffect, useRef } from 'react';
import { useAxios } from '../contexts/AxiosContext';
import { useDispatch, useSelector } from 'react-redux';
import { menuAction } from '../redux/Slice/menuSlice';
import { useNavigate } from 'react-router-dom';
import { notificationAction } from '../redux/Slice/notificationSlice';
import { Heart } from 'lucide-react';

function PanelNotification() {
    const axios = useAxios();
    const panelMenu = useSelector(state => state.menu.panelMenu);
    const notifications = useSelector(state => state.notification.notifications);
    const panelRef = useRef(null);
    const dispatch = useDispatch();    
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            const curPanel = panelRef.current;
            const sidebar = document.querySelector('.sidebar-container');

            if (curPanel && !curPanel.contains(event.target) && sidebar && !sidebar.contains(event.target)) {
                dispatch(menuAction.setPanelMenu(null));
            }
        };

        if (panelMenu === 'notification') {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [panelMenu, dispatch]);

    const timeAgo = (timestamp) => {
        const now = new Date();
        const diff = (now - new Date(timestamp)) / 1000;
        if (diff < 60) return `${Math.floor(diff)}초`;
        if (diff < 3600) return `${Math.floor(diff / 60)}분`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간`;
        return `${Math.floor(diff / 86400)}일`;
    };

    const handleClick = (notification) => {
        if (notification.type == 'COMMENT' || notification.type == 'LIKE') {
            navigate(`/board/read/${notification.boardId}`);
        }
    };

    const handleDeleteAll = () => {
        const confirmed = window.confirm('알림을 모두 삭제하시겠습니까?');
        if (!confirmed) return;

        axios.delete('/notification/delete_all_process')
            .then(() => {
                dispatch(notificationAction.clearNotifications());
            })
            .catch((error) => {
                console.error('에러 발생:', error);
                if (error.response && error.response.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('알림 삭제 중 오류가 발생했습니다.');
                }
            });
    }

    return (
        <div className={`panel-notification-container ${panelMenu === 'notification' ? 'open' : ''}`} ref={panelRef}>
            <div className="notification-header">
                <span>알림</span>
                {notifications.length > 0 && <button onClick={handleDeleteAll}>모두삭제</button>}
            </div>

            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className='notification-empty'>
                        <span className="empty-icon-wrapper">
                            <Heart className="empty-icon" size={40} />
                        </span>
                        <span className="notification-label">게시물 활동</span>
                        <span className="notification-label desc">다른 사람이 회원님의 게시물을 좋아하거나 댓글을 남기면 여기에 표시됩니다.</span>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div key={notification.id} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`} 
                            onClick={() => handleClick(notification)}
                        >
                            <img className="notification-profile" src={notification.sender?.imageUrl} alt=""/>

                            <div className="notification-content">
                                <div className="notification-text">
                                    <span className="notification-username">{notification.sender?.username || '알 수 없음'}</span>
                                    {notification.type === 'COMMENT' && `님이 댓글을 남겼습니다: ${notification.content} `}
                                    {notification.type === 'LIKE' && '님이 좋아요를 눌렀습니다. '}

                                    <span className="notification-time">{timeAgo(notification.createdAt)}</span>
                                </div>
                            </div>

                            <img className="notification-board" src={notification.imageUrl} alt="" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default PanelNotification;
