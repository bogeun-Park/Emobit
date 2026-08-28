import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../contexts/AxiosContext';
import { messageAction } from '../redux/Slice/messageSlice';

export function useSendMessage() {
    const axios = useAxios();
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return (targetUsername) => {
        if (!auth.isAuthenticated) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        axios.post('/chat/createRoom', null, {
            params: {
                memberA: auth.username,
                memberB: targetUsername,
            },
        }).then(response => {
            const newChatRoom = response.data;

            dispatch(messageAction.addChatRoom(newChatRoom));
            navigate(`/message/${newChatRoom.id}`);
        }).catch(error => {
            console.error('에러 발생:', error);
            if (error.response?.status === 401) {
                alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else {
                alert('채팅방을 불러오는 중 오류가 발생했습니다.');
            }
        });
    };
}
