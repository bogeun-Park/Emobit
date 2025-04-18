import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div>
            <h2>홈입니다!</h2>

            <Link to="/board">게시판</Link>
        </div>
    );
}

export default HomePage;
