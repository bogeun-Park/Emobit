import '../../styles/MessagePage.css'; // 공통 스타일만 유지
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { useSelector } from 'react-redux';
import NotFoundPage from '../NotFound/NotFoundPage';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import PopupNewChat from './PopupNewChat';

function MessagePage() {
    const axios = useAxios();    
    const { chatRoomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const chatRooms = useSelector(state => state.message.chatRooms);
    const prevChatRoomId = useRef(null);

    const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showNewChatPopup, setshowNewChatPopup] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (chatRoomId && chatRooms.length > 0) {
            setSelectedChatRoomId(Number(chatRoomId));
        } else if (!chatRoomId) {
            setSelectedChatRoomId(null);
        }
    }, [chatRoomId, chatRooms]);

    useEffect(() => {
        // 현재 경로가 /message/:id 인지 검사
        const match = location.pathname.match(/^\/message\/(\d+)$/);
        const currentChatRoomId = match ? Number(match[1]) : null;

        // 이전 채팅방이 있고, 이전 채팅방과 현재 채팅방이 다르면 leaveRoom 호출
        if (prevChatRoomId.current && prevChatRoomId.current !== currentChatRoomId) {
            axios.post(`/chat/leaveRoom/${prevChatRoomId.current}`).catch(console.error);
        }

        prevChatRoomId.current = currentChatRoomId;

        // 컴포넌트 언마운트 시에도 leaveChatRoom 호출
        return () => {
            if (prevChatRoomId.current) {
                axios.post(`/chat/leaveRoom/${prevChatRoomId.current}`)
                    .catch(console.error);

                prevChatRoomId.current = null;
            }
        };
    }, [location.pathname]);

    if (chatRoomId !== undefined && !/^\d+$/.test(chatRoomId)) {  // chatRoomId가 숫자로만 이루어져 있는지 확인
        return <NotFoundPage />;
    }

    return (
        <div className="message-container">
            {(isMobile && !chatRoomId) || !isMobile ? (
                <ChatList
                    selectedChatRoomId={selectedChatRoomId}
                    setshowNewChatPopup={setshowNewChatPopup}
                    navigate={navigate}
                />
            ) : null}

            {(isMobile && chatRoomId) || !isMobile ? (
                <ChatWindow
                    selectedChatRoomId={selectedChatRoomId}
                    setshowNewChatPopup={setshowNewChatPopup}
                    navigate={navigate}
                />
            ) : null}

            {showNewChatPopup && (
                <PopupNewChat setshowNewChatPopup={setshowNewChatPopup} navigate={navigate} />
            )}
        </div>
    );
}

export default MessagePage;
