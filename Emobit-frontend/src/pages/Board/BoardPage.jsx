import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';

function BoardPage() {
    const axios = useAxios();
    
    const [boardList, setBoardList] = useState([]);
    
    useEffect(() => {
        axios.get('/board')
            .then((response) => {
                setBoardList(response.data);
            })
            .catch((error) => {
                console.error('게시판 목록 불러오기 실패:', error);
            });
    }, []);

    return (
        <div>
            <h2>게시판 페이지</h2>

            {boardList.length > 0 && (
                <ul>
                    {boardList.map((board) => (
                        <li key={board.id}>
                            <Link to={`/board/read/${board.id}`}>{board.title}</Link>
                            <div>
                                <span>{board.memberUsername}</span>
                                <span>({board.memberDisplayName})</span>
                                <span>조회수 : {board.viewCount}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default BoardPage;