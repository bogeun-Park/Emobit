import '../../styles/BoardReadPage.css';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams  } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { useSelector, useDispatch } from 'react-redux';
import NotFoundPage from '../NotFound/NotFoundPage';
import { Heart, Send, Eye } from 'lucide-react';
import PopupEllipsis from './PopupEllipsis';
import PopupLike from './PopupLike';
import { messageAction } from '../../redux/Slice/messageSlice';

function BoardRead() {
    const axios = useAxios();
    const navigate = useNavigate();
    const auth = useSelector(state => state.auth);    
    const dispatch = useDispatch();
    
    const { boardId } = useParams();
    const [board, setBoard] = useState(null);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [notFound, setNotFound] = useState(false);
    const [commentEditId, setCommentEditId] = useState(null);
    const [commentEditContent, setCommentEditContent] = useState('');
    const [isLike, setIsLike] = useState(null);
    const [senders, setSenders] = useState([]);
    const [showLikePopup, setShowLikePopup] = useState(false);

    useEffect(() => {
        fetchBoard();
        fetchComment();
        fetchLike();
    }, [boardId]);

    const fetchBoard = async () => {
        try {
            const response = await axios.get(`/board/read/${boardId}`);
            setBoard(response.data);
            setNotFound(false);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setNotFound(true);
            } else {
                alert('게시글 조회 중 오류가 발생했습니다.');
                navigate('/board');
            }
        }
    };

    const fetchComment = async () => {
        try {
            const response = await axios.get(`/comments/${boardId}`);
            setComments(response.data);
        } catch (error) {
            console.error('댓글을 가져오는 데 실패했습니다:', error);
        }
    };

    const fetchLike = async () => {
        axios.get('/likes/status', {
            params: {
                type: 'BOARD',
                targetId: boardId
            }
        }).then((response) => {
            setIsLike(response.data);
        }).catch(error => {
            console.error('에러 발생:', error);
        });

        axios.get('/likes/senders', {
            params: {
                type: 'BOARD',
                targetId: boardId
            }
        }).then((response) => {
            setSenders(response.data);
        }).catch(error => {
            console.error('에러 발생:', error);
        });
    };

    const startEditing = (comment) => {
        setCommentEditId(comment.id);
        setCommentEditContent(comment.content);
    };

    const cancelEditing = () => {
        setCommentEditId(null);
        setCommentEditContent('');
    };

    const handleUpdateComment = () => {
        const confirmed = window.confirm('댓글을 수정하시겠습니까?');
        if (!confirmed) return;

        axios.put(`/comments/update_process/${commentEditId}`, { 
            content: commentEditContent,
         })
            .then(() => {
                alert('댓글이 수정되었습니다!');
                fetchComment();
                cancelEditing();                
            })
            .catch(error => {
                console.error('댓글 수정 실패:', error);

                if (error.response && error.response.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('댓글 작성 중 오류가 발생했습니다.');
                }
            })
    };

    const handleDeleteComment = (id) => {
        const confirmed = window.confirm('댓글을 삭제하시겠습니까?');
        if (!confirmed) return;

        axios.delete(`/comments/delete_process/${id}`)
            .then(() => {
                alert('댓글이 삭제되었습니다!');
                fetchComment();
            })
            .catch((error) => {
                console.error('댓글 삭제 실패:', error);

                if (error.response && error.response.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('댓글 삭제 중 오류가 발생했습니다.');
                }
            });
    }

    const handleDelete = () => {
        const confirmed = window.confirm('게시글을 삭제하시겠습니까?');
        if (!confirmed) return;

        axios.delete(`/board/delete_process/${boardId}`)
            .then(() => {
                alert('게시글이 삭제되었습니다.');
                navigate('/board');
            })
            .catch((error) => {
                console.error('게시글 삭제 실패:', error);
                
                if (error.response && error.response.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('게시글 삭제 중 오류가 발생했습니다.');
                }
            });
    };

    const handleCreateComment = (e) => {
        e.preventDefault();

        const confirmed = window.confirm('댓글을 등록하시겠습니까?');
        if (!confirmed) return;

        axios.post('/comments/create_process', {
            content,
            boardId,
        })
            .then(() => {
                alert('등록되었습니다.');
                setContent('');
                fetchComment();                
            })
            .catch(error => {
                console.error('댓글 등록 실패:', error);

                if (error.response && error.response.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('댓글 작성 중 오류가 발생했습니다.');
                }
            })
    }

    const customDate = (dateString) => {
        const date = new Date(dateString);

        const dateOptions = { month: '2-digit', day: '2-digit' };
        const formattedDate = new Intl.DateTimeFormat('ko-KR', dateOptions).format(date).replace(' ', '').slice(0, -1);

        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            // second: '2-digit',
            hour12: false // 24시간 형식
        };
        const formattedTime = new Intl.DateTimeFormat('ko-KR', timeOptions).format(date).replace(':', ':');  // "16:11:34"

        return `${formattedDate} ${formattedTime}`;
    };

    const handleMoveProfile = (username) => {
        navigate(`/${username}`);
    };

    const handleSendMessageToAuthor = () => {
        if (!auth.isAuthenticated) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        if (auth.username === board.memberUsername) {
            return;
        }

        axios.post('/chat/createRoom', null, {
            params: {
                memberA: auth.username,
                memberB: board.memberUsername,
            },
        }).then(response => {
            const newChatRoom = response.data;

            dispatch(messageAction.addChatRoom(newChatRoom));
            navigate(`/message/${newChatRoom.id}`);    
        }).catch (error => {
            console.error('에러 발생:', error);
            if (error.response?.status === 401) {
                alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else {
                alert('채팅방을 불러오는 중 오류가 발생했습니다.');
            }
        })
    };

    const handleToggleLike = () => {
        if (!auth.isAuthenticated) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        axios.post('/likes/toggle', {
            type: 'BOARD',
            targetId: boardId
        }).then((response) => {
            setIsLike(response.data.isLike);
            setSenders(response.data.senders);
        }).catch(error => {
            console.error('에러 발생:', error);
        });
    };

    if (notFound) {
        return <NotFoundPage />;
    }

    if (!board) return null;

    return (
        <div className="board-read-container">
            <div className="board-left">
                <img src={board.imageUrl} alt={board.title} />
            </div>

            <div className="board-right">
                <div className="board-header">
                    <div className="board-user-header">
                        <img className="content-user-image" src={board.memberImageUrl} alt="" onClick={() => handleMoveProfile(board.memberUsername)}/>
                        <span className="content-username" onClick={() => handleMoveProfile(board.memberUsername)}>{board.memberUsername}</span>
                    </div>

                    {auth.id === board.createdBy && (
                        <div className="board-buttons">
                            <PopupEllipsis
                                onEdit={() => navigate(`/board/update/${boardId}`)}
                                onDelete={handleDelete}
                            />
                        </div>
                    )}
                </div>

                <ul className="content-list">
                    <li className="content-item">
                        <div className="content-user-info">
                            <img className="content-user-image" src={board.memberImageUrl} alt="" onClick={() => handleMoveProfile(board.memberUsername)} />
                            <div className="content-main">
                                <div className="content-header">
                                    <span className="content-username" onClick={() => handleMoveProfile(board.memberUsername)}>{board.memberUsername}</span>
                                </div>

                                <div className="content-text">{board.content}</div>
                            </div>
                        </div>
                    </li>
                    
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <li key={comment.id} className="content-item">
                                <div className="content-user-info">
                                    <img className="content-user-image" src={comment.memberImageUrl} alt="" onClick={() => handleMoveProfile(comment.memberUsername)} />
                                    <div className="content-main">
                                        <div className="content-header">
                                            <div className="content-info">
                                                <span className="content-username" onClick={() => handleMoveProfile(comment.memberUsername)}>{comment.memberUsername}</span>
                                                <span className="content-time">{customDate(comment.updatedAt)}</span>
                                                {comment.updatedAt !== comment.createdAt && <span className="edited-label"> (수정됨)</span>}
                                            </div>

                                            {auth.id === comment.createdBy && (
                                                <div className="board-buttons">
                                                    {commentEditId !== comment.id && (
                                                        <PopupEllipsis
                                                            onEdit={() => startEditing(comment)}
                                                            onDelete={() => handleDeleteComment(comment.id)}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {commentEditId === comment.id ? (
                                            <div className="comment-edit-area">
                                                <textarea
                                                    value={commentEditContent}
                                                    onChange={(e) => setCommentEditContent(e.target.value)}
                                                    rows={3}
                                                />

                                                <div className="comment-edit-buttons">
                                                    <button onClick={handleUpdateComment}>저장</button>
                                                    <button onClick={cancelEditing}>취소</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="content-text">{comment.content}</div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li></li>
                    )}
                </ul>

                <div className="board-extra-info">
                    <div className="left-side">
                        <div className="like-send-buttons">
                            <button type="button" className={`like-button ${isLike ? 'liked' : ''}`} onClick={handleToggleLike}>
                                <Heart size={24} color="#000" />
                            </button>
                            {auth.id !== board.createdBy && (
                                <button type="button" className="send-button" onClick={handleSendMessageToAuthor}>
                                    <Send size={24} color="#000" />
                                </button>
                            )}
                        </div>
                        
                        {senders.length > 0 ? (
                            <span className="like-count" onClick={() => setShowLikePopup(true)}>좋아요 {senders.length}개</span>
                        ) : (
                            <span className='like-zero'>가장 먼저 <span className='like-push' onClick={handleToggleLike}>좋아요</span>를 눌러보세요</span>
                        )}
                        
                        <span className="created-at">{new Date(board.createdAt).toLocaleDateString().replace(/\.$/, '')}</span>
                    </div>

                    <div className="right-side">
                        <span className="view-count"><Eye size={13} />{board.viewCount}</span>
                    </div>
                </div>

                <form className="comment-form" onSubmit={handleCreateComment}>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="댓글 달기..."/>
                    <button type="submit">등록</button>
                </form>

                {showLikePopup && (
                    <PopupLike senders={senders} handleMoveProfile={handleMoveProfile} setShowLikePopup={setShowLikePopup}/>
                )}
            </div>            
        </div>
    );
}

export default BoardRead;