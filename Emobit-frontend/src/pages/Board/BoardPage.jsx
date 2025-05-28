import '../../styles/BoardPage.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { Eye } from 'lucide-react';

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
        <div className="board-container">
            <h2 className="board-title">Open Diary</h2>

            <div className="board-list">
                {boardList.length > 0 ? (
                    boardList.map((board) => (
                        <Link to={`/board/read/${board.id}`} key={board.id} className="board-card">
                            <h3 className="board-card-title">{board.title}</h3>
                            <div className="board-card-info">
                                <span className="board-username">@{board.memberUsername}</span>
                                <span className="board-displayName">({board.memberDisplayName})</span>
                            </div>
                            <span className="board-viewCount"><Eye size={13} />{board.viewCount}</span>
                            <span className="board-createdAt">{new Date(board.createdAt).toLocaleDateString().replace(/\.$/, '')}</span>
                        </Link>
                    ))
                ) : (
                    <p className="board-empty">게시글이 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default BoardPage;