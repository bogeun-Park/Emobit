import React, { useEffect, useState } from 'react';
import { useNavigate, useParams  } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';

function BoardRead() {
    const axios = useAxios();
    const navigate = useNavigate();
    
    const { boardId } = useParams();
    const [board, setBoard] = useState(null);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');

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
            navigate('/board');
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
                    alert('게시글 작성 중 오류가 발생했습니다.');
                }
            });
    };

    const handleSubmit = (e) => {
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
        <div>
            <img src={board.imageUrl} alt="" style={{ width: '300px', height: '300px', objectFit: 'cover' }}/>
            <h2>{board.title}</h2>
            <p>{board.content}</p>

            <button onClick={() => navigate(`/board/update/${boardId}`)}>
                수정
            </button>
            <button onClick={handleDelete}>삭제</button>

            <br /><br />
            <ul>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <li key={comment.id}>
                            {comment.member.displayName}({comment.member.username}) {customDate(comment.createdAt)}<br/>
                            {comment.content}                            
                        </li>
                    ))
                ) : (
                    <li>댓글이 없습니다.</li>
                )}
            </ul>

            <form onSubmit={handleSubmit}>                
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