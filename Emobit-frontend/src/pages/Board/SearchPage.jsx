import '../../styles/BoardPage.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { Eye } from 'lucide-react';
import { useParams } from 'react-router-dom';

function SearchPage() {
    const axios = useAxios();
    const { keyword } = useParams();

    const [boardList, setBoardList] = useState([]);

    useEffect(() => {
        axios.get(`/board/search/${keyword}`)
            .then((response) => {
                setBoardList(response.data);
            })
            .catch((error) => {
                console.error('검색 목록 불러오기 실패:', error);
            });
    }, [keyword]);

    return (
        <div className="board-container">
            <h2 className="board-title">#{keyword}</h2>

            <div className="board-grid">
                {boardList.length > 0 ? (
                    boardList.map((board) => (
                        <Link className="board-card" to={`/board/read/${board.id}`} key={board.id}>
                            <img src={board.imageUrl} alt="" />
                            <div className="board-card-overlay">
                                <div className="board-card-overlay-content">
                                    <div className="board-overlay-row">
                                        <span className="board-title-text">{board.title}</span>
                                    </div>
                                    <div className="board-overlay-row">
                                        <span>{board.memberUsername} · {board.memberDisplayName}</span>
                                        <span><Eye size={12} style={{ verticalAlign: 'middle' }} /> {board.viewCount}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="board-empty">게시글이 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default SearchPage;