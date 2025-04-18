import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Header.css'

function Header() {
    const navigate = useNavigate();

    function logout() {
        axios.post(`${process.env.REACT_APP_API_URL}/logout`)
            .then(response => {
                console.log(response);
                navigate('/login');
            })
            .catch(error => {
                console.error('Failed to fetch user data:', error);
            });
    }

    const handleGetUser = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/login/auth`)
            .then(response => {
                console.log('User data:', response.data);
            })
            .catch(error => {
                console.error('Failed to fetch user data:', error);
            });
    };

    return (
        <header>
            <h3><Link to="/">Emobit</Link></h3>

            <form>
                <input type="text" placeholder="검색어를 입력하세요" />
                <button type="submit">검색</button>
            </form>

            <nav>
                <Link to="/login">로그인</Link>
                <button onClick={logout}>로그아웃</button>
                <button onClick={handleGetUser}>유저정보</button>
            </nav>
        </header>
    );
}

export default Header;
