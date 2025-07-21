import '../../styles/ChatWindow.css';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAxios } from '../../contexts/AxiosContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MessageCirclePlus } from 'lucide-react';
import { messageAction } from '../../redux/Slice/messageSlice';

function ChatWindow({ selectedChatRoomId, setshowNewChatPopup, navigate }) {
    const auth = useSelector(state => state.auth);
    const chatRooms = useSelector(state => state.message.chatRooms);
    const axios = useAxios();
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [targetMember, setTargetMember] = useState(null);
    const [chatWindowLoading, setChatWindowLoading] = useState(true);

    // 메시지 불러오기
    useEffect(() => {
        if (!selectedChatRoomId || chatRooms.length === 0) {
            setChatWindowLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const messagesRes = await axios.get(`/chat/${selectedChatRoomId}/messages`);
                setMessages(messagesRes.data);

                const chatRoom = chatRooms.find(room => room.id === selectedChatRoomId);
                if (!chatRoom) {
                    setTargetMember(null);
                    setChatWindowLoading(false);
                    return;
                }

                // 읽음 처리
                const updatedRooms = chatRooms.map(room =>
                    room.id === selectedChatRoomId ? { ...room, unreadCount: 0 } : room
                );
                dispatch(messageAction.setChatRooms(updatedRooms));

                const target = chatRoom.memberA.username === auth.username
                    ? chatRoom.memberB.username
                    : chatRoom.memberA.username;

                const profileRes = await axios.get(`/profile/${target}`);
                setTargetMember(profileRes.data.member);
            } catch (error) {
                console.error('에러 발생:', error);
                if (error.response?.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('채팅을 불러오는 중 오류가 발생했습니다.');
                }
            } finally {
                setChatWindowLoading(false);
            }
        };

        setChatWindowLoading(true);
        fetchData();
    }, [selectedChatRoomId]);

    // WebSocket 연결
    useEffect(() => {
        const socket = new SockJS(process.env.REACT_APP_WEBSOCKET_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                if (selectedChatRoomId) {
                    client.subscribe(`/topic/chatRoom/${selectedChatRoomId}`, message => {
                        const receivedMessage = JSON.parse(message.body);
                        
                        // 대화창 세팅
                        setMessages(prevMessages => [...prevMessages, receivedMessage]);
                    });
                }
            }
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, [selectedChatRoomId]);

    // 자동 스크롤
    useEffect(() => {
        const timeout = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
        return () => clearTimeout(timeout);
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !stompClient) return;

        const message = {
            sender: auth.username,
            content: newMessage,
            chatRoomId: selectedChatRoomId,
            createdAt: new Date().toISOString()
        };

        stompClient.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(message)
        });

        setNewMessage('');

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleExitChat = () => {
        const confirmed = window.confirm('채팅방을 나가시겠습니까?');
        if (!confirmed || !selectedChatRoomId) return;

        axios.delete(`/chat/exitRoom/${selectedChatRoomId}`)
            .then(() => {                
                dispatch(messageAction.exitChatRoom(selectedChatRoomId));
                navigate('/message');
            })
            .catch(error => {
                console.error('에러 발생', error);
                if (error.response?.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('채팅방 나가기 중 오류가 발생했습니다.');
                }
            });
    };

    const showTime = (msg, idx) => {
        const currentTime = customMsgWindowDate(msg.createdAt);
        const previousMsg = messages[idx - 1];

        // 이전 메시지가 없으면 시간 출력
        if (!previousMsg) return true;

        // 보낸 사람이 같을 때만 시간 중복을 체크
        const sameSender = previousMsg.sender === msg.sender;
        const previousTime = customMsgWindowDate(previousMsg.createdAt);
        const bDisplay = !sameSender || currentTime !== previousTime;

        return bDisplay;
    };

    const showDateDivider = (msg, idx) => {
        const currentDate = new Date(msg.createdAt).toDateString();
        const previousDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toDateString() : null;
        const bDisplay = currentDate !== previousDate;

        return bDisplay;
    };

    const customMsgWindowDate = (dateString) => {
        const date = new Date(dateString);

        return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: 'numeric', hour12: true });
    }

    const getDateDividerText = (dateString) => {
        const date = new Date(dateString);

        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    }

    const handleChangeMessage = (e) => {
        setNewMessage(e.target.value);

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const maxHeight = 20 * 4;
            textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
        }
    };

    return (
        <div className="chat-window-container">
            {chatWindowLoading ? null : selectedChatRoomId ? (
                <>
                    {targetMember && (
                        <div className="chat-header">
                            <div className="chat-header-profile-wrapper" onClick={() => navigate(`/${targetMember.username}`)}>
                                <img src={targetMember.imageUrl} alt="" />
                                <div className="chat-header-profile">
                                    <span className="target-username">{targetMember.username}</span>
                                    <span className="target-displayName">{targetMember.displayName}</span>
                                </div>
                            </div>

                            <div className="chat-header-buttons">
                                <button onClick={handleExitChat}>나가기</button>
                            </div>
                        </div>
                    )}

                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <React.Fragment key={idx}>
                                {showDateDivider(msg, idx) && (
                                    <div className="date-divider"><span>{getDateDividerText(msg.createdAt)}</span></div>
                                )}
                                <div className={msg.sender === auth.username ? 'my-message-wrapper' : 'their-message-wrapper'}>
                                    {msg.sender === auth.username && showTime(msg, idx) && (
                                        <span className="message-time">{customMsgWindowDate(msg.createdAt)}</span>
                                    )}

                                    <div className={msg.sender === auth.username ? 'my-message' : 'their-message'}>
                                        <span className="message-content">{msg.content}</span>
                                    </div>

                                    {msg.sender !== auth.username && showTime(msg, idx) && (
                                        <span className="message-time">{customMsgWindowDate(msg.createdAt)}</span>
                                    )}
                                </div>
                            </React.Fragment>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-wrapper">
                        <div className="chat-input">
                            <textarea value={newMessage} rows={1} placeholder="메시지를 입력하세요..." ref={textareaRef}
                                onChange={handleChangeMessage}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />

                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="start-chat-container">
                    <div className="chat-empty-icon">
                        <div className="chat-icon-circle">
                            <MessageCirclePlus size={55} strokeWidth={1} />
                        </div>
                    </div>
                    <h2 className="chat-empty-title">내 메시지</h2>
                    <p className="chat-empty-subtitle">친구에게 나만의 메시지를 보내보세요</p>
                    <button className="start-chat-button" onClick={() => setshowNewChatPopup(true)}>메시지 보내기</button>
                </div>
            )}
        </div>
    );
}

export default ChatWindow;
