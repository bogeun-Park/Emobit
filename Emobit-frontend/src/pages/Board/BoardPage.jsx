import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function BoardPage() {
    const [boardList, setBoardList] = useState([]);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/board`)
            .then((res) => {
                setBoardList(res.data);
            })
            .catch((err) => {
                console.error('게시판 목록 불러오기 실패:', err);
            });
    }, []);

    return (
        <div>
            <h2>게시판 페이지</h2>

            <ul>
                {boardList.length > 0 ? (
                    boardList.map((board) => (
                        <li key={board.id}>
                            <Link to={`/board/read/${board.id}`}>{board.title}</Link>
                        </li>
                    ))
                ) : (
                    <li>게시글이 없습니다.</li>
                )}
            </ul>

            <Link to="/board/create">게시판작성</Link>
        </div>
    );
}

export default BoardPage;