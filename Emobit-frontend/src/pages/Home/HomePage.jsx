import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAxios } from '../../contexts/AxiosContext';
import { ArrowRight, Camera, Users, MessageCircle } from 'lucide-react';
import '../../styles/HomePage.css';

const features = [
    { icon: Camera, title: '기록하기', description: '하루의 순간을 기록하세요' },
    { icon: Users, title: '공유하기', description: '팔로우하고 공유하세요' },
    { icon: MessageCircle, title: '소통하기', description: '댓글과 좋아요로 마음을 나누세요' },
];

function HomePage() {
    const navigate = useNavigate();
    const axios = useAxios();
    const auth = useSelector(state => state.auth);
    const [recentBoards, setRecentBoards] = useState([]);

    useEffect(() => {
        axios.get('/board')
            .then((response) => {
                setRecentBoards(response.data.slice(0, 4));
            })
            .catch((error) => {
                console.error('최근 게시글 불러오기 실패:', error);
            });
    }, []);

    const handleCtaClick = () => {
        navigate(auth.isAuthenticated ? '/board/create' : '/board');
    };

    return (
        <div className="home-container">
            <div className="home-hero">
                <h1 className="home-logo">Emobit</h1>
                <p className="home-tagline">
                    {auth.isAuthenticated ? `${auth.username}님, 오늘 하루는 어떠셨나요?` : '감성을 담은 하루를 기록하세요'}
                </p>
                <button className="home-cta" onClick={handleCtaClick}>
                    {auth.isAuthenticated ? '글 쓰러가기' : '게시글 보러가기'} <ArrowRight size={16} className="home-cta-icon" />
                </button>
            </div>

            <div className="home-features">
                <div className="home-features-list">
                    {features.map(({ icon: Icon, title, description }) => (
                        <div className="home-feature" key={title}>
                            <div className="home-feature-heading">
                                <Icon size={15} className="home-feature-icon" strokeWidth={1.75} />
                                <span className="home-feature-title">{title}</span>
                            </div>
                            <span className="home-feature-description">{description}</span>
                        </div>
                    ))}
                </div>
            </div>

            {recentBoards.length > 0 && (
                <div className="home-recent">
                    <h2 className="home-section-title">최근 게시글</h2>
                    <div className="home-recent-grid">
                        {recentBoards.map((board) => (
                            <Link className="home-recent-item" to={`/board/read/${board.id}`} key={board.id}>
                                <img src={board.imageUrl} alt={board.title} />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <footer className="home-footer">
                <span>© {new Date().getFullYear()} Emobit</span>
            </footer>
        </div>
    );
}

export default HomePage;
