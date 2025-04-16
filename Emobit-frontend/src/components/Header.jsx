import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css'

function Header() {
    return (
        <header>
            <h3><Link to="/">Emobit</Link></h3>

            <form>
                <input type="text" placeholder="검색어를 입력하세요" />
                <button type="submit">검색</button>
            </form>

            <nav>
                <Link to="/login">로그인</Link>
            </nav>
        </header>
    );
}

export default Header;
