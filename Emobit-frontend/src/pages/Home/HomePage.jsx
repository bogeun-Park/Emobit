import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import '../../styles/HomePage.css';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <div className="intro-box">
                <h1>감성을 담은 하루, Emobit</h1>
                <p>당신의 이야기를 공유해보세요.</p>
                <button onClick={() => navigate('/board')}>
                    게시글 보러가기 <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </button>
            </div>
        </div>
    );
}

export default HomePage;
