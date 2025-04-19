import '../styles/Header.css'
import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../contexts/AxiosContext';
import { useDispatch, useSelector } from 'react-redux';
import { authAction } from '../redux/Slice/authSlice';

function Header() {
    const axios = useAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    function handlelogout() {
        axios.post('/logout')
            .then(response => {
                console.log(response);

                dispatch(authAction.logout());

                navigate('/login');
            })
            .catch(error => {
                console.error('Failed to fetch user data:', error);
            });
    }

    const auth = useSelector(state => state.auth);
    const handleGetUser = () => {
        console.log(auth);
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
                <button onClick={handlelogout}>로그아웃</button>
                <button onClick={handleGetUser}>유저정보</button>
            </nav>
        </header>
    );
}

export default Header;
