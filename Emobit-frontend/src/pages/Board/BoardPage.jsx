import '../../styles/BoardPage.css'
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';

function BoardPage() {
    const axios = useAxios();
    
    const [boardList, setBoardList] = useState([]);
    
    useEffect(() => {
        axios.get('/board')
            .then((res) => {
                setBoardList(res.data);
            })
            .catch((err) => {
                console.error('게시판 목록 불러오기 실패:', err);
            });
    }, []);

    return (
        <div className="board-container">
            <h2>게시판 페이지</h2>

            {boardList.length > 0 && (
                <ul>
                    {boardList.map((board) => (
                        <li key={board.id}>
                            <Link to={`/board/read/${board.id}`}>{board.title}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default BoardPage;