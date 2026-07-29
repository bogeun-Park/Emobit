import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketContext = createContext(null);

// 로그인 세션 동안 STOMP 클라이언트를 하나만 만들어서 앱 전체가 공유한다.
// Layout(채팅방 목록·알림 구독)과 ChatWindow(개별 채팅방 메시지 구독)가
// 각자 소켓을 새로 열지 않고, 이 소켓에 subscribe/unsubscribe만 하도록 하기 위함.
export const WebSocketProvider = ({ children }) => {
    const auth = useSelector(state => state.auth);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        if (!auth.isAuthenticated) {
            setStompClient(null);
            return;
        }

        const socket = new SockJS(process.env.REACT_APP_WEBSOCKET_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                setStompClient(client);
            },
            onWebSocketClose: () => {
                setStompClient(null);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
            setStompClient(null);
        };
    }, [auth.isAuthenticated, auth.id]);

    return (
        <WebSocketContext.Provider value={stompClient}>
            {children}
        </WebSocketContext.Provider>
    );
};

// 아직 연결/구독 전이면 null을 반환하니, 쓰는 쪽에서 null 체크 필요
export const useWebSocket = () => useContext(WebSocketContext);
