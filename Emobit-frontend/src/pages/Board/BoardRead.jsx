import React, { useEffect, useState } from 'react';
import { useNavigate, useParams  } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';

function BoardRead() {
    const axios = useAxios();
    const navigate = useNavigate();
    
    const { boardId } = useParams();
    const [board, setBoard] = useState(null);

    useEffect(() => {
        axios.get(`/board/read/${boardId}`)
            .then((response) => {
                setBoard(response.data);
            })
            .catch((error) => {
                console.error('게시글을 가져오는 데 실패했습니다:', error);
                navigate('/board');
            });
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

    if (!board) return null;

    return (
        <div>
            <h2>{board.title}</h2>
            <p>{board.content}</p>

            <button onClick={() => navigate(`/board/update/${boardId}`)}>
                수정
            </button>
            <button onClick={handleDelete}>삭제</button>
        </div>
    );
}

export default BoardRead;