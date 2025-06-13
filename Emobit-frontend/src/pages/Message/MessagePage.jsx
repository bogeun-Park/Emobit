import '../../styles/MessagePage.css';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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

    useEffect(() => {
        if (auth.isAuthenticated) {
            axios.get(`/chat/getRooms/${auth.username}`)
                .then(response => setChatRooms(response.data))
                .catch(error => console.error(error));
        }
    }, [auth]);

    useEffect(() => {
        if (selectedChatRoomId) {
            axios.get(`/chat/${selectedChatRoomId}/messages`)
                .then(response => setMessages(response.data))
                .catch(error => console.error(error));
        }
    }, [selectedChatRoomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const socket = new SockJS(process.env.REACT_APP_WEBSOCKET_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe('/topic/public', message => {
                    const receivedMessage = JSON.parse(message.body);
                    if (receivedMessage.chatRoom.id === selectedChatRoomId) {
                        setMessages(prev => [...prev, receivedMessage]);
                    }
                });
            },
            // debug: str => console.log(str),
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
            chatRoom: { id: selectedChatRoomId }
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
                userA: auth.username,
                userB: targetUsername
            }
        }).then(res => {
            const newRoom = res.data;
            setSelectedChatRoomId(newRoom.id);
            setChatRooms(prev => [...prev, newRoom]); // 목록에 추가
        }).catch(err => {
            console.error('채팅방 생성 실패', err);
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
                            {chatRoom.userA === auth.username ? chatRoom.userB : chatRoom.userA}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="chat-window">
                {selectedChatRoomId ? (
                    <>
                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={msg.sender === auth.username ? 'my-message' : 'their-message'}>
                                    <span>{msg.content}</span>
                                </div>
                            ))}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input">
                            <input type="text" value={newMessage} 
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="메시지를 입력하세요..."
                            />
                            <button onClick={handleSendMessage}>전송</button>
                        </div>
                    </>
                ) : (
                    <>
                        <input type="text" placeholder="대화할 상대 이름" value={targetUsername} onChange={e => setTargetUsername(e.target.value)}/>
                        <button onClick={handleCreateChatRoom}>채팅 시작</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default MessagePage;
