import '../styles/Layout.css'
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Mobilebar from './Mobilebar';
import PanelSearch from './PanelSearch';
import PanelNotification from './PanelNotification';
import { useDispatch, useSelector } from 'react-redux';
import { useAxios } from '../contexts/AxiosContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { loadingBar } from '../utils/loadingBar';
import { messageAction } from '../redux/Slice/messageSlice';
import { notificationAction } from '../redux/Slice/notificationSlice';

function Layout() {
    const axios = useAxios();
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const stompClient = useWebSocket();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        if (!auth.isAuthenticated) {
            // 현재 페이지(Outlet)가 자체적으로 부르는 요청까지 포함해서 전역 바가 끝나길 기다림
            loadingBar.waitForIdle().then(() => setLoading(false));
            return;
        }

        Promise.all([
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
                }),
            axios.get('/notification')
                .then(response => {
                    dispatch(notificationAction.setNotifications(response.data));
                })
                .catch(error => {
                    console.error('에러 발생:', error);
                }),
        ]).then(() => {
            // 사이드바용 데이터뿐 아니라, 같이 마운트된 현재 페이지의 요청까지 다 끝날 때까지 대기
            loadingBar.waitForIdle().then(() => setLoading(false));
        });
    }, [auth]);

    // Layout은 소켓 자체를 만들지 않고, WebSocketProvider가 관리하는 공유 소켓에 구독만 건다.
    // ChatWindow도 같은 소켓을 공유해서, 채팅방 전환 시 소켓을 껐다 켜지 않아도 된다.
    useEffect(() => {
        if (!stompClient || !auth.isAuthenticated) return;

        // 채팅방 목록 구독
        const chatRoomListSub = stompClient.subscribe(`/topic/chatRoomList/${auth.id}`, (message) => {
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

        // 알림 생성 구독
        const notificationNewSub = stompClient.subscribe(`/topic/notification/new/${auth.id}`, (message) => {
            const newNotification = JSON.parse(message.body);

            dispatch((dispatch, getState) => {
                const prevNotifications = getState().notification.notifications;
                const newNotifications = [newNotification, ...prevNotifications];

                dispatch(notificationAction.setNotifications(newNotifications));
            });
        });

        // 알림 삭제 구독
        const notificationDeleteSub = stompClient.subscribe(`/topic/notification/delete/${auth.id}`, (message) => {
            const deletedId = JSON.parse(message.body);

            dispatch((dispatch, getState) => {
                const prevNotifications = getState().notification.notifications;
                const newNotifications = prevNotifications.filter(prevNotification => prevNotification.id !== deletedId);

                dispatch(notificationAction.setNotifications(newNotifications));
            });
        });

        return () => {
            chatRoomListSub.unsubscribe();
            notificationNewSub.unsubscribe();
            notificationDeleteSub.unsubscribe();
        };
    }, [stompClient, auth]);

    return (
        <div className="layout-container">
            {!loading && (
                <>
                    <Sidebar />
                    <Mobilebar />
                    <PanelSearch />
                    <PanelNotification />
                </>
            )}

            <main className="main-content">
                {/* Outlet은 항상 마운트해서 현재 페이지가 자기 데이터를 바로 불러오게 두고,
                    각 페이지는 이미 자체 loading 게이트로 스스로를 숨김 */}
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
