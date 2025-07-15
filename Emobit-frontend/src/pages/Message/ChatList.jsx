import '../../styles/ChatList.css';
import { useSelector } from 'react-redux';
import { SquarePen } from 'lucide-react';

function ChatList({ selectedChatRoomId, setshowNewChatPopup, navigate }) {
    const auth = useSelector(state => state.auth);
    const chatRooms = useSelector(state => state.message.chatRooms);

    const customMsgListDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const isSameDay = date.toDateString() === now.toDateString();

        return isSameDay
            ? date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: 'numeric', hour12: true })  // 오늘일 경우: 오전/오후 00:00 형식
            : date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' });  // 하루 이상 지난 경우: yyyy. MM. dd 형식
    };

    return (
        <div className="chat-list-container">
            <div className="chat-list-header">
                <span>메시지</span>
                <SquarePen className="send-message-search" onClick={() => setshowNewChatPopup(true)}/>
            </div>

            {chatRooms.length === 0 ? (
                <div className="chat-list-empty"><span>메시지가 없습니다.</span></div>
            ) : (
                <ul>
                    {chatRooms.map(chatRoom => {
                        const chatPartner = chatRoom.memberA.username === auth.username ? chatRoom.memberB : chatRoom.memberA;
                        return (
                            <li key={chatRoom.id} className={chatRoom.id === selectedChatRoomId ? 'active' : 'none'}
                                onClick={() => navigate(`/message/${chatRoom.id}`)}
                            >
                                <div className="chat-list-item">
                                    <img src={chatPartner.imageUrl} alt="" />

                                    <div className="chat-list-text">
                                        <span className="chat-list-username">{chatPartner.username}</span>
                                        <span className="chat-list-lastmessage">{chatRoom.lastMessage}</span>
                                    </div>

                                    <div className='chat-list-live'>
                                        <span className="chat-list-time">{chatRoom.lastMessageTime ? customMsgListDate(chatRoom.lastMessageTime) : ''}</span>
                                        {chatRoom.unreadCount > 0 && <span className="chat-list-unread">{chatRoom.unreadCount}</span>}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default ChatList;
