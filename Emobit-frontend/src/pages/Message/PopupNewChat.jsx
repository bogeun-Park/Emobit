import '../../styles/PopupNewChat.css';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAxios } from '../../contexts/AxiosContext';
import { X } from 'lucide-react';
import { messageAction } from '../../redux/Slice/messageSlice';

function PopupNewChat({ setSelectedChatRoomId, setshowNewChatPopup, navigate }) {
    const axios = useAxios();
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const inputRef = useRef();

    const [keyword, setKeyword] = useState('');
    const [searchList, setSearchList] = useState([]);
    const [loading, setLoading] = useState(false);

    // ESC키 입력시 팝업 닫히게 하는 이벤트 리스너 설정
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setshowNewChatPopup(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // 팝업이 열리면 input에 포커스
        inputRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [setshowNewChatPopup]);

    useEffect(() => {
        const trimmedKeyword = keyword.trim() ?? "";

        if (!trimmedKeyword) {
            setSearchList([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const delay = setTimeout(() => {
            axios.get(`/member/search/${keyword}`)
                .then(response => {
                    setSearchList(response.data);
                })
                .catch(error => {
                    console.error(error)
                })
                .finally(() => {
                    setLoading(false)
                });
        }, 300);

        return () => clearTimeout(delay);
    }, [keyword]);

    const handleCreateChatRoom = (targetUsername) => {
        if (!auth.isAuthenticated) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        axios.post(`/chat/createRoom`, null, {
            params: {
                memberA: auth.username,
                memberB: targetUsername,
            }
        }).then(response => {
            const newChatRoom = response.data;
            setSelectedChatRoomId(newChatRoom.id);
            
            dispatch(messageAction.addChatRoom(newChatRoom));

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

    return (
        <div className="popup-new-chat-overlay" onClick={() => setshowNewChatPopup(false)}>
            <div className="popup-new-chat" onClick={e => e.stopPropagation()}>
                <div className='popup-new-chat-header'>
                    <h3>새로운 메시지</h3>
                    <div className="close-button" onClick={() => setshowNewChatPopup(false)}>
                        <X size={26} color="#000" />
                    </div>
                </div>
                
                <div className="new-chat-search-form">
                    <label htmlFor="new-chat-member-search" className="new-chat-member-label">받는 사람 :</label>
                    <input type="text" value={keyword} id="new-chat-member-search" placeholder="검색..." autoComplete="off" ref={inputRef}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>

                {loading ? null : (
                    keyword.trim() === '' ? (                            
                        <span className="new-chat-search-text">이름이나 아이디로 검색하세요.</span>
                    ) : (
                        <ul>
                            {searchList.length === 0 ? (
                                <li className="new-chat-search-text">계정을 찾을 수 없습니다.</li>
                            ) : (
                                searchList.map(member => (
                                    <li key={member.id} className="new-chat-member-item">
                                        <div className="member-info">
                                            <img
                                                src={member.imageUrl}
                                                alt={member.username}
                                            />

                                            <div className="member-wrapper">
                                                <span className="member-username">{member.username}</span>
                                                <span className="member-displayName">{member.displayName}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    )
                )}
            </div>
        </div>
    );
}

export default PopupNewChat;