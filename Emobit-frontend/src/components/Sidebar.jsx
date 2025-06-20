import '../styles/Sidebar.css'
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAxios } from '../contexts/AxiosContext';
import { useDispatch, useSelector } from 'react-redux';
import { authAction } from '../redux/Slice/authSlice';
import { menuAction } from '../redux/Slice/menuSlice';
import { Home, Search, BookOpen, Send, Bell, PlusCircle, User, LogIn, LogOut } from 'lucide-react';

function Sidebar() {
    const axios = useAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const active = useSelector(state => state.menu.active);
    const location = useLocation();

    const menuImgSize = 26;

    useEffect(() => {
        const curPath = location.pathname;

        if (curPath === '/') {
            dispatch(menuAction.setActiveMenu('home'));
        } else if (curPath === '/search') {
            dispatch(menuAction.setActiveMenu('search'));
        } else if (curPath === '/board' || /^\/board\/read\/\d+$/.test(curPath)) {
            dispatch(menuAction.setActiveMenu('board'));
        } else if (curPath === '/message' || /^\/message\/\d+$/.test(curPath)) {
            dispatch(menuAction.setActiveMenu('message'));
        } else if (curPath === '/alarm') {
            dispatch(menuAction.setActiveMenu('alarm'));
        } else if (curPath === '/board/create') {
            dispatch(menuAction.setActiveMenu('create'));
        } else if (auth.username && curPath === `/${auth.username}`) {
            dispatch(menuAction.setActiveMenu('profile'));
        } else if (curPath === '/login') {
            dispatch(menuAction.setActiveMenu('login'));
        } else {
            dispatch(menuAction.setActiveMenu(''));
        }
    }, [location.pathname, dispatch, auth]);

    useEffect(() => {
        const sidebar = document.querySelector('.sidebar');
        const updateSidebarWidth = () => {
            const width = sidebar.offsetWidth;
            document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
        };

        updateSidebarWidth();

        const resizeObserver = new ResizeObserver(updateSidebarWidth);
        resizeObserver.observe(sidebar);

        window.addEventListener('resize', updateSidebarWidth);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateSidebarWidth);
        };
    }, []);

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
                E<span className="menu-label">mobit</span>
            </Link>

            <nav className="menu">
                <div className="menu-top">
                    <button className={active === 'home' ? 'active' : ''} onClick={() => navigate('/')}>
                        <Home size={menuImgSize} />
                        <span className="menu-label">홈</span>
                    </button>

                    <button className={active === 'search' ? 'active' : ''} onClick={() => navigate('/search')}>
                        <Search size={menuImgSize} />
                        <span className="menu-label">검색</span>
                    </button>

                    <button className={active === 'board' ? 'active' : ''} onClick={() => navigate('/board')}>
                        <BookOpen size={menuImgSize} />
                        <span className="menu-label">일기</span>
                    </button>

                    {auth.isAuthenticated && 
                        <>
                            <button className={active === 'message' ? 'active' : ''} onClick={() => navigate('/message')}>
                                <Send size={menuImgSize} />
                                <span className="menu-label">메시지</span>
                            </button>

                            <button className={active === 'alarm' ? 'active' : ''} onClick={() => navigate('/alarm')}>
                                <Bell size={menuImgSize} />
                                <span className="menu-label">알림</span>
                            </button>

                            <button className={active === 'create' ? 'active' : ''} onClick={() => navigate('/board/create')}>
                                <PlusCircle size={menuImgSize} />
                                <span className="menu-label">작성하기</span>
                            </button>

                            <button className={active === 'profile' ? 'active' : ''} onClick={() => navigate(`/${auth.username}`)}>
                                <User size={menuImgSize} />
                                <span className="menu-label">프로필</span>
                            </button>
                        </>
                    }
                </div>

                <div className="menu-bottom">
                    {!auth.isAuthenticated ? (
                        <button className={active === 'login' ? 'active' : ''} onClick={() => navigate('/login')}>
                            <LogIn size={menuImgSize} />
                            <span className="menu-label">로그인</span>
                        </button>
                    ) : (
                        <button onClick={handlelogout}>
                            <LogOut size={menuImgSize} />
                            <span className="menu-label">로그아웃</span>
                        </button>
                    )}
                </div>
            </nav>
        </aside>
    );
}

export default Sidebar;
