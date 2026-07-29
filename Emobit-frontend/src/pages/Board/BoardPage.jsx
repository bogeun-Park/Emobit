import '../../styles/BoardPage.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { loadingBar } from '../../utils/loadingBar';
import { Eye } from 'lucide-react';

function BoardPage() {
    const axios = useAxios();

    const [boardList, setBoardList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/board')
            .then((response) => {
                setBoardList(response.data);
                // 상단 로딩바가 100%까지 채워지는 걸 기다렸다가 화면을 표시
                loadingBar.waitForIdle().then(() => setLoading(false));
            })
            .catch((error) => {
                console.error('게시판 목록 불러오기 실패:', error);
                alert('게시글 목록을 불러오는 중 오류가 발생했습니다.');
                loadingBar.waitForIdle().then(() => setLoading(false));
            });
    }, []);

    if (loading) {
        return null;
    }

    return (
        <div className="board-container">
            <h2 className="board-title">Open Diary</h2>

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

export default BoardPage;