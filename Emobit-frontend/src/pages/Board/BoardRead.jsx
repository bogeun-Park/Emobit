import '../../styles/BoardRead.css'
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams  } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { useSelector } from 'react-redux';

function BoardRead() {
    const axios = useAxios();
    const navigate = useNavigate();
    const auth = useSelector(state => state.auth);
    
    const { boardId } = useParams();
    const [board, setBoard] = useState(null);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');

    const [commentEditId, setCommentEditId] = useState(null);
    const [commentEditContent, setCommentEditContent] = useState('');
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

    const fetchBoard = async () => {
        try {
            const response = await axios.get(`/board/read/${boardId}`);
            setBoard(response.data);
        } catch (error) {
            console.error('게시글을 가져오는 데 실패했습니다:', error);
            navigate('/board');
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

    useEffect(() => {
        fetchBoard();
        fetchComment();
    }, [boardId]);

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
            second: '2-digit',
            hour12: false // 24시간 형식
        };
        const formattedTime = new Intl.DateTimeFormat('ko-KR', timeOptions).format(date).replace(':', ':');  // "16:11:34"

        return `${formattedDate} ${formattedTime}`;
    };

    if (!board) return null;

    return (
        <div className="boardRead-container">
            <img src={board.imageUrl} alt="" style={{ width: '300px', height: '300px', objectFit: 'cover' }}/>
            <h2>{board.title}</h2>
            <p>{board.content}</p>

            {auth.id === board.createdBy && (
                <>
                    <button onClick={() => navigate(`/board/update/${boardId}`)}>수정</button>
                    <button onClick={handleDelete}>삭제</button>
                </>
            )}

            <ul>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <li key={comment.id}>
                            {comment.memberDisplayName}({comment.memberUsername}) {customDate(comment.updatedAt)}
                            <br/>

                            {commentEditId === comment.id ? (
                                <>
                                    <textarea value={commentEditContent} onChange={(e) => setCommentEditContent(e.target.value)}/>
                                    <button onClick={handleUpdateComment}>저장</button>
                                    <button onClick={cancelEditing}>취소</button>
                                </>
                            ) : (
                                <>
                                    {comment.content}
                                    {auth.id === comment.createdBy && (
                                        <>
                                            <button onClick={() => startEditing(comment)}>수정</button>
                                            <button onClick={() => handleDeleteComment(comment.id)}>삭제</button>
                                        </>
                                    )}
                                </>
                            )}                  
                        </li>
                    ))
                ) : (
                    <li>댓글이 없습니다.</li>
                )}
            </ul>

            <form onSubmit={handleCreateComment}>                
                <div style={{ display: 'flex' }}>
                    <label htmlFor="content">댓글</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
                </div>

                <button type="submit">등록</button>
            </form>
        </div>
    );
}

export default BoardRead;