import '../../styles/MessagePage.css';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MessageCirclePlus, SquarePen } from 'lucide-react';
import NotFoundPage from '../NotFound/NotFoundPage';

function MessagePage() {
    const axios = useAxios();
    const auth = useSelector(state => state.auth);
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const { chatRoomId } = useParams();
    const location = useLocation();
    const prevChatRoomId = useRef(null);

    const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [targetUsername, setTargetUsername] = useState('');
    const [showInputForm, setShowInputForm] = useState(false);
    const [targetMember, setTargetMember] = useState(null);
    const [chatRoomLoading, setChatRoomLoading] = useState(true);
    const [chatWindowLoading, setChatWindowLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
        if (!auth.isAuthenticated) return;

        setChatRoomLoading(true);
        axios.get(`/chat/getRooms`)
            .then(response => {
                const sortedChatRooms = [...response.data].sort((a, b) => {
                    const timeA = new Date(a.lastMessageTime || 0).getTime();
                    const timeB = new Date(b.lastMessageTime || 0).getTime();
                    return timeB - timeA;
                });
                
                setChatRooms(sortedChatRooms);
            })
            .catch(error => {
                console.error('에러 발생:', error);
                if (error.response?.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('채팅방을 불러오는 중 오류가 발생했습니다.');
                }
            })
            .finally(() => {
                setChatRoomLoading(false);
            });
    }, [auth]);

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

                setChatRooms(prevChatRooms =>
                    prevChatRooms.map(chatRoom => chatRoom.id === selectedChatRoomId ? { ...chatRoom, unreadCount: 0 } : chatRoom)
                );

                const targetUsername = chatRoom.memberA.username === auth.username
                    ? chatRoom.memberB.username
                    : chatRoom.memberA.username;

                const profileRes = await axios.get(`/profile/${targetUsername}`);
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

    useEffect(() => {
        const timeout = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);

        return () => clearTimeout(timeout);
    }, [messages]);

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

                client.subscribe(`/topic/chatRoomList/${auth.id}`, (message) => {
                    const updatedRoom = JSON.parse(message.body);

                    setChatRooms(prevChatRooms => {
                        // 기존 방 목록에서 변경된 방 업데이트 혹은 새로 추가
                        const exists = prevChatRooms.some(chatRoom => chatRoom.id === updatedRoom.id);
                        let newChatRooms;

                        if (exists) {
                            newChatRooms = prevChatRooms.map(chatRoom => chatRoom.id === updatedRoom.id ? updatedRoom : chatRoom);
                        } else {
                            newChatRooms = [...prevChatRooms, updatedRoom];
                        }

                        // 마지막 메시지 시간 기준 내림차순 정렬
                        newChatRooms.sort((a, b) => {
                            const timeA = new Date(a.lastMessageTime || 0).getTime();
                            const timeB = new Date(b.lastMessageTime || 0).getTime();
                            return timeB - timeA;
                        });

                        return newChatRooms;
                    });
                });
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, [selectedChatRoomId, auth]);

    useEffect(() => {
        // 현재 경로가 /message/:id 인지 검사
        const match = location.pathname.match(/^\/message\/(\d+)$/);
        const currentChatRoomId = match ? Number(match[1]) : null;

        // 이전 채팅방이 있고, 이전 채팅방과 현재 채팅방이 다르면 leaveRoom 호출
        if (prevChatRoomId.current && prevChatRoomId.current !== currentChatRoomId) {
            axios.post(`/chat/leaveRoom/${prevChatRoomId.current}`)
                .catch(console.error);
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

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !stompClient) return;

        const message = {
            sender: auth.username,
            content: newMessage,
            chatRoomId: selectedChatRoomId,
            createdAt: new Date().toISOString(),
        };

        stompClient.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(message)
        });

        setNewMessage('');
    };

    const handleCreateChatRoom = () => {
        if (!targetUsername.trim()) return;

        if (!auth.isAuthenticated) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        axios.post(`/chat/createRoom`, null, {
            params: {
                memberA: auth.username,
                memberB: targetUsername
            }
        }).then(response => {
            const newChatRoom = response.data;
            setSelectedChatRoomId(newChatRoom.id);
            
            setChatRooms(prevChatrooms => {
                const exists = prevChatrooms.some(chatRoom => chatRoom.id === newChatRoom.id);
                if (exists) return prevChatrooms;
                
                return [...prevChatrooms, newChatRoom];
            });

            setTargetUsername('');
            setShowInputForm(false);
            navigate(`/message/${newChatRoom.id}`);
        }).catch(error => {
            console.error('에러 발생', error);
            if (error.response?.status === 401) {
                alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else {
                alert('채팅방을 불러오는 중 오류가 발생했습니다.');
            }
        });
    };

    const customMsgListDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();

        const isSameDay =
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();

        let formattedTime;
        if (isSameDay) {  // 오늘일 경우: 오전/오후 00:00 형식
            formattedTime = date.toLocaleTimeString('ko-KR', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            });
        } else {  // 하루 이상 지난 경우: yyyy. MM. dd 형식
            formattedTime = date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            }).replace(/\.$/, '');
        }

        return formattedTime;
    };

    const customMsgWindowDate = (dateString) => {
        const date = new Date(dateString);
        const formattedTime = date.toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });

        return formattedTime;
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

    const getDateDividerText = (dateString) => {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
        });

        return dateStr;
    };

    const hadleChatExit = () => {
        const confirmed = window.confirm('채팅방을 나가시겠습니까?');
        if (!confirmed || !selectedChatRoomId) return;

        axios.delete(`/chat/exitRoom/${selectedChatRoomId}`)
            .then(() => {                
                setChatRooms(prev => prev.filter(room => room.id !== selectedChatRoomId));
                setSelectedChatRoomId(null);
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

        navigate('/message')
    };

    const onSelectChatRoom = (chatRoomId) => {
        setSelectedChatRoomId(chatRoomId);
        navigate(`/message/${chatRoomId}`);
    };

    if (chatRoomId !== undefined && !/^\d+$/.test(chatRoomId)) {  // chatRoomId가 문자열인 경우
        return <NotFoundPage />;
    }

    return (
        <div className="message-container">
            {(isMobile && !chatRoomId) || !isMobile ? (
                <div className="chat-list">
                    <div className="chat-list-header">
                        <span>메시지</span>
                        <SquarePen className="send-message-search" />
                    </div>

                    {chatRoomLoading ? (
                        <div></div>
                    ) : chatRooms.length === 0 ? (
                        <div className="chat-list-empty">
                            <span>메시지가 없습니다.</span>
                        </div>
                    ) : (
                        <ul>
                            {chatRooms.map(chatRoom => {
                                const chatPartner =
                                    chatRoom.memberA.username === auth.username
                                        ? chatRoom.memberB
                                        : chatRoom.memberA;
                                return (
                                    <li
                                        key={chatRoom.id}
                                        className={chatRoom.id === selectedChatRoomId ? 'active' : 'none'}
                                        onClick={() => onSelectChatRoom(chatRoom.id)}
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
            ) : null}

            {(isMobile && chatRoomId) || !isMobile ? (
                <div className="chat-window">
                    {chatWindowLoading ? (
                        <div></div>
                    ) : selectedChatRoomId ? (
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
                                        <button onClick={hadleChatExit}>나가기</button>
                                    </div>
                                </div>
                            )}

                            <div className="chat-messages">
                                {messages.map((msg, idx) => (
                                    <React.Fragment key={idx}>
                                        {showDateDivider(msg, idx) && (
                                            <div className="date-divider">
                                                <span>{getDateDividerText(msg.createdAt)}</span>
                                            </div>
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
                                
                                <div ref={messagesEndRef} />  {/* 채팅창 맨 아래로 자동 스크롤 */}    
                            </div>
                            
                            <div className="chat-input-wrapper">
                                <div className="chat-input">
                                    <textarea
                                        value={newMessage} rows={1}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {  // Shift+Enter는 기본 줄바꿈 동작을 그대로 둠
                                                e.preventDefault(); // 줄바꿈 막고
                                                handleSendMessage(); // 메시지 전송
                                            }
                                        }}
                                        placeholder="메시지를 입력하세요..."
                                    />
                                    <button onClick={handleSendMessage}>Send</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="start-chat-container">
                            {!showInputForm ? (
                                <>
                                    <div className="chat-empty-icon">
                                        <div className="chat-icon-circle">
                                            <MessageCirclePlus size={55} strokeWidth={1} />
                                        </div>
                                    </div>
                                    <h2 className="chat-empty-title">내 메시지</h2>
                                    <p className="chat-empty-subtitle">친구에게 나만의 메시지를 보내보세요</p>
                                    <button className="start-chat-button" onClick={() => setShowInputForm(true)}>메시지 보내기</button>
                                </>
                            ) : (
                                <div className="start-chat-form">
                                    <input type="text" placeholder="대화할 상대 이름" value={targetUsername}
                                        onChange={e => setTargetUsername(e.target.value)}
                                    />
                                    <button onClick={handleCreateChatRoom}>채팅 시작</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}

export default MessagePage;
