import '../styles/Sidebar.css'
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../contexts/AxiosContext';
import { useDispatch, useSelector } from 'react-redux';
import { authAction } from '../redux/Slice/authSlice';
import { menuAction } from '../redux/Slice/menuSlice';
import { Home, Search, BookOpen, Send, Bell, PlusCircle, User } from 'lucide-react';
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

        if (curPath === '/') dispatch(menuAction.setActiveMenu('home'));
        else if (curPath.startsWith('/search')) dispatch(menuAction.setActiveMenu('search'));        
        else if (curPath.startsWith('/board/create')) dispatch(menuAction.setActiveMenu('create'));  // 구체적인 경로를 먼저 설정
        else if (curPath.startsWith('/board')) dispatch(menuAction.setActiveMenu('board'));
        else if (curPath.startsWith('/message')) dispatch(menuAction.setActiveMenu('message'));
        else if (curPath.startsWith('/alarm')) dispatch(menuAction.setActiveMenu('alarm'));
        else if (curPath.startsWith('/profile')) dispatch(menuAction.setActiveMenu('profile'));
        else if (curPath.startsWith('/login')) dispatch(menuAction.setActiveMenu('login'));
    }, [location.pathname, dispatch]);

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

    return (
        <aside className="sidebar">
            <Link to="/" className="logo" onClick={() => navigate('/')}>
                Emobit
            </Link>

            <nav className="menu">
                <div className="menu-top">
                    <button className={active === 'home' ? 'active' : ''} onClick={() => navigate('/')}>
                        <Home size={menuImgSize} /> 홈
                    </button>

                    <button className={active === 'search' ? 'active' : ''} onClick={() => navigate('/search')}>
                        <Search size={menuImgSize} /> 검색
                    </button>

                    <button className={active === 'board' ? 'active' : ''} onClick={() => navigate('/board')}>
                        <BookOpen size={menuImgSize} /> 일기
                    </button>

                    {auth.isAuthenticated && 
                        <>
                            <button className={active === 'message' ? 'active' : ''} onClick={() => navigate('/message')}>
                                <Send size={menuImgSize} /> 메시지
                            </button>

                            <button className={active === 'alarm' ? 'active' : ''} onClick={() => navigate('/alarm')}>
                                <Bell size={menuImgSize} /> 알림
                            </button>

                            <button className={active === 'create' ? 'active' : ''} onClick={() => navigate('/board/create')}>
                                <PlusCircle size={menuImgSize} /> 작성하기
                            </button>
                        </>
                    }
                </div>

                <div className="menu-bottom">
                    {!auth.isAuthenticated ? (
                        <button className={active === 'login' ? 'active' : ''} onClick={() => navigate('/login')}>
                            로그인
                        </button>
                    ) : (
                        <>
                            <button className={active === 'profile' ? 'active' : ''} onClick={() => navigate('/profile')}>
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
