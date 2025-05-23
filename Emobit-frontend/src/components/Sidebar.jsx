import '../styles/Sidebar.css'
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../contexts/AxiosContext';
import { useDispatch, useSelector } from 'react-redux';
import { authAction } from '../redux/Slice/authSlice';
import { menuAction } from '../redux/Slice/menuSlice';
import { Home, Search, BookOpen, MessageCircle, Bell, PlusCircle, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

function Header() {
    const axios = useAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const active = useSelector(state => state.menu.active);
    const location = useLocation();

    const menuImgSize = 26;

    useEffect(() => {
        const curPath = location.pathname;

        // 경로에 따라 menu 상태 업데이트
        if (curPath === '/') dispatch(menuAction.setActiveMenu('home'));
        else if (curPath === '/search') dispatch(menuAction.setActiveMenu('search'));
        else if (curPath === '/board') dispatch(menuAction.setActiveMenu('board'));
        else if (curPath === '/message') dispatch(menuAction.setActiveMenu('message'));
        else if (curPath === '/alarm') dispatch(menuAction.setActiveMenu('alarm'));
        else if (curPath === '/board/create') dispatch(menuAction.setActiveMenu('create'));
        else if (curPath === '/profile') dispatch(menuAction.setActiveMenu('profile'));
        else if (curPath === '/login') dispatch(menuAction.setActiveMenu('login'));
    }, [location.pathname, dispatch]);

    function handlelogout() {
        axios.post('/logout')
            .then(response => {
                console.log(response);

                dispatch(authAction.logout());

                handleMenuClick('/login', 'login');
            })
            .catch(error => {
                console.error('Failed to fetch user data:', error);
            });
    }

    function handleMenuClick(path, action) {
        dispatch(menuAction.setActiveMenu(action));
        navigate(path);
    }

    return (
        <aside className="sidebar">
            <Link to="/" className="logo" onClick={() => handleMenuClick('/', 'home')}>
                Emobit
            </Link>

            <nav className="menu">
                <div className="menu-top">
                    <button className={active === 'home' ? 'active' : ''} onClick={() => handleMenuClick('/', 'home')}>
                        <Home size={menuImgSize} /> 홈
                    </button>

                    <button className={active === 'search' ? 'active' : ''} onClick={() => handleMenuClick('/search', 'search')}>
                        <Search size={menuImgSize} /> 검색
                    </button>

                    <button className={active === 'board' ? 'active' : ''} onClick={() => handleMenuClick('/board', 'board')}>
                        <BookOpen size={menuImgSize} /> 일기
                    </button>

                    {auth.isAuthenticated && 
                        <>
                            <button className={active === 'message' ? 'active' : ''} onClick={() => handleMenuClick('/message', 'message')}>
                                <MessageCircle size={menuImgSize} /> 메시지
                            </button>

                            <button className={active === 'alarm' ? 'active' : ''} onClick={() => handleMenuClick('/alarm', 'alarm')}>
                                <Bell size={menuImgSize} /> 알림
                            </button>

                            <button className={active === 'create' ? 'active' : ''} onClick={() => handleMenuClick('/board/create', 'create')}>
                                <PlusCircle size={menuImgSize} /> 작성하기
                            </button>
                        </>
                    }
                </div>

                <div className="menu-bottom">
                    {!auth.isAuthenticated ? (
                        <button className={active === 'login' ? 'active' : ''} onClick={() => handleMenuClick('/login', 'login')}>
                            로그인
                        </button>
                    ) : (
                        <>
                            <button className={active === 'profile' ? 'active' : ''} onClick={() => handleMenuClick('/profile', 'profile')}>
                                <User size={menuImgSize} /> 프로필
                            </button>
                            
                            <button onClick={handlelogout}>로그아웃</button>
                        </>
                    )}
                </div>
            </nav>
        </aside>
    );
}

export default Header;
