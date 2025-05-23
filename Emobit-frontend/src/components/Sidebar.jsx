import '../styles/Sidebar.css'
import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../contexts/AxiosContext';
import { useDispatch, useSelector } from 'react-redux';
import { authAction } from '../redux/Slice/authSlice';
import { Home, Search, BookOpen, MessageCircle, Bell, PlusCircle, User } from 'lucide-react';

const menuImgSize = 26;

function Header() {
    const axios = useAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);

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

    const handleGetUser = () => {
        console.log(auth);
    };

    return (
        <aside className="sidebar">
            <Link to="/" className="logo">Emobit</Link>

            <nav className="menu">
                <div className="menu-top">
                    <button onClick={() => navigate('/')}><Home size={menuImgSize} /> 홈</button>
                    <button><Search size={menuImgSize} /> 검색</button>
                    <button onClick={() => navigate('/board')}><BookOpen size={menuImgSize} /> 일기</button>
                    <button><MessageCircle size={menuImgSize} /> 메시지</button>
                    <button><Bell size={menuImgSize} /> 알림</button>
                    <button onClick={() => navigate('/board/create')}><PlusCircle size={menuImgSize} /> 작성하기</button>
                </div>

                <div className="menu-bottom">
                    {!auth.isAuthenticated ? (
                        <button onClick={() => navigate('/login')}>로그인</button>
                    ) : (
                        <>
                            <button onClick={handleGetUser}><User size={menuImgSize} /> 프로필</button>
                            <button onClick={handlelogout}>로그아웃</button>
                        </>
                    )}
                </div>
            </nav>
        </aside>
    );
}

export default Header;
