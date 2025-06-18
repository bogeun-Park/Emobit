import '../../styles/MessagePage.css';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MessageCirclePlus } from 'lucide-react';

function MessagePage() {
    const axios = useAxios();
    const auth = useSelector(state => state.auth);
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [targetUsername, setTargetUsername] = useState('');
    const [showInputForm, setShowInputForm] = useState(false);
    const [targetMember, setTargetMember] = useState(null);

    useEffect(() => {
        if (!auth.isAuthenticated) return;

        axios.get(`/chat/getRooms`)
            .then(response => {
                setChatRooms(response.data);
            })
            .catch(error => {
                console.error('에러 발생:', error);
                if (error.response?.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('채팅방을 불러오는 중 오류가 발생했습니다.');
                }
            });
    }, [auth]);

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedChatRoomId) return;

            try {
                const messagesRes = await axios.get(`/chat/${selectedChatRoomId}/messages`);
                setMessages(messagesRes.data);

                const chatRoom = chatRooms.find(room => room.id === selectedChatRoomId);
                const target = chatRoom?.memberA.username === auth.username ? chatRoom?.memberB.username : chatRoom?.memberA.username;

                if (target) {
                    const profileRes = await axios.get(`/profile/${target}`);
                    setTargetMember(profileRes.data.member);
                }
            } catch (error) {
                console.error('에러 발생:', error);
                if (error.response?.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('채팅을 불러오는 중 오류가 발생했습니다.');
                }
            }
        };

        fetchData();
    }, [selectedChatRoomId]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        return () => clearTimeout(timeout);
    }, [messages]);

    useEffect(() => {
        const socket = new SockJS(process.env.REACT_APP_WEBSOCKET_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe('/topic/public', message => {
                    const receivedMessage = JSON.parse(message.body);
                    if (receivedMessage.chatRoomId === selectedChatRoomId) {
                        setMessages(prev => [...prev, receivedMessage]);
                    }
                });
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, [selectedChatRoomId]);

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
            const newRoom = response.data;
            setSelectedChatRoomId(newRoom.id);
            
            setChatRooms(prev => {
                const exists = prev.some(room => room.id === newRoom.id);
                if (exists) return prev;
                
                return [...prev, newRoom];
            });

            setTargetUsername('');
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

    const customMsgDate = (dateString) => {
        const date = new Date(dateString);
        const formattedTime = date.toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });

        return formattedTime;
    };

    const showTime = (msg, idx) => {
        const currentTime = customMsgDate(msg.createdAt);
        const previousMsg = messages[idx - 1];

        // 이전 메시지가 없으면 시간 출력
        if (!previousMsg) return true;

        // 보낸 사람이 같을 때만 시간 중복을 체크
        const sameSender = previousMsg.sender === msg.sender;
        const previousTime = customMsgDate(previousMsg.createdAt);
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
                // UI에서 채팅방 제거
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
    };

    return (
        <div className="message-container">
            <div className="chat-list">
                <h3>채팅 목록</h3>
                <ul>
                    {chatRooms.map(chatRoom => (
                        <li
                            key={chatRoom.id}
                            className={chatRoom.id === selectedChatRoomId ? 'active' : ''}
                            onClick={() => setSelectedChatRoomId(chatRoom.id)}
                        >
                            {chatRoom.memberA.username === auth.username ? chatRoom.memberB.username : chatRoom.memberA.username}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="chat-window">
                {selectedChatRoomId ? (
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
                                            <span className="message-time">{customMsgDate(msg.createdAt)}</span>
                                        )}

                                        <div className={msg.sender === auth.username ? 'my-message' : 'their-message'}>
                                            <span className="message-content">{msg.content}</span>
                                        </div>

                                        {msg.sender !== auth.username && showTime(msg, idx) && (
                                            <span className="message-time">{customMsgDate(msg.createdAt)}</span>
                                        )}
                                    </div>
                                </React.Fragment>
                            ))}
                            
                            <div ref={messagesEndRef} />  {/* 채팅창 맨 아래로 자동 스크롤 */}    
                        </div>
                        
                        <div className="chat-input-wrapper">
                            <div className="chat-input">
                                <input type="text" value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
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
        </div>
    );
}

export default MessagePage;
