import '../styles/Layout.css'
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PanelSearch from './PanelSearch';
import PanelNotification from './PanelNotification';
import { useDispatch, useSelector } from 'react-redux';
import { useAxios } from '../contexts/AxiosContext';
import { messageAction } from '../redux/Slice/messageSlice';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function Layout() {
    const axios = useAxios();
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!auth.isAuthenticated) return;

        axios.get(`/chat/getRooms`)
            .then(response => {
                const sortedChatRooms = [...response.data].sort((a, b) => {
                    const timeA = new Date(a.lastMessageTime || 0).getTime();
                    const timeB = new Date(b.lastMessageTime || 0).getTime();
                    return timeB - timeA;
                });
                
                dispatch(messageAction.setChatRooms(sortedChatRooms));
            })
            .catch(error => {
                console.error('에러 발생:', error);
            })
    }, [auth]);

    useEffect(() => {
        if (!auth.isAuthenticated) return;

        const socket = new SockJS(process.env.REACT_APP_WEBSOCKET_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(`/topic/chatRoomList/${auth.id}`, (message) => {
                    const updatedRoom = JSON.parse(message.body);

                    dispatch((dispatch, getState) => {
                        const prevChatRooms = getState().message.chatRooms;
                        const exists = prevChatRooms.some(chatRoom => chatRoom.id === updatedRoom.id);
                        let newChatRooms;

                        // 기존 방 목록에서 변경된 방 업데이트 혹은 새로 추가
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

                        dispatch(messageAction.setChatRooms(newChatRooms));
                    });
                });
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [auth]);

    return (
        <div className="layout-container">
            <Sidebar />
            <PanelSearch />
            <PanelNotification />

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
