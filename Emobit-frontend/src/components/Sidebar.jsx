import '../styles/Sidebar.css'
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAxios } from '../contexts/AxiosContext';
import { useDispatch, useSelector } from 'react-redux';
import { authAction } from '../redux/Slice/authSlice';
import { menuAction } from '../redux/Slice/menuSlice';
import { searchAction } from '../redux/Slice/searchSlice';
import { Home, Search, BookOpen, Send, Bell, PlusCircle, User, LogIn, LogOut } from 'lucide-react';

function Sidebar() {
    const axios = useAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const active = useSelector(state => state.menu.active);
    const panelMenu = useSelector(state => state.menu.panelMenu);
    const location = useLocation();

    const menuImgSize = 26;

    useEffect(() => {
        const curPath = location.pathname;

        const createPathRegExp = (pathPattern) => {
            return new RegExp(`^${pathPattern}/?$`);
        };

        if (createPathRegExp('/').test(curPath)) {
            dispatch(menuAction.setActiveMenu('home'));
        } else if (createPathRegExp('/search/[^/]+').test(curPath)) {
            dispatch(menuAction.setActiveMenu('search'));
        } else if (createPathRegExp('/board').test(curPath) || createPathRegExp('/board/read/\\d+').test(curPath) || createPathRegExp('/board/update/\\d+').test(curPath)) {
            dispatch(menuAction.setActiveMenu('board'));
        } else if (createPathRegExp('/message').test(curPath) || createPathRegExp('/message/\\d+').test(curPath)) {
            dispatch(menuAction.setActiveMenu('message'));
        } else if (createPathRegExp('/board/create').test(curPath)) {
            dispatch(menuAction.setActiveMenu('create'));
        } else if (auth.username && createPathRegExp(`/${auth.username}`).test(curPath)) {
            dispatch(menuAction.setActiveMenu('profile'));
        } else if (createPathRegExp('/login').test(curPath)) {
            dispatch(menuAction.setActiveMenu('login'));
        } else {
            dispatch(menuAction.setActiveMenu(''));
        }
    }, [location.pathname, dispatch, auth]);
    

    useEffect(() => {
        const sidebar = document.querySelector('.sidebar-container');
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

    const handlelogout = () => {
        axios.post('/logout')
            .then(response => {
                console.log(response);

                dispatch(authAction.logout());

                setTimeout(() => {
                    dispatch(searchAction.clearSearchState())
                }, 300);

                navigate('/login');
            })
            .catch(error => {
                console.error('Failed to fetch user data:', error);
            });
    };

    const handleMenuClick = (menuName) => {
        if (panelMenu) {
            dispatch(menuAction.setPanelMenu(null));
            
            setTimeout(() => {
                dispatch(searchAction.clearSearchState())
            }, 300);
        }

        navigate(menuName);
    };

    const handlePanelMenuClick = (menuName) => {
        if (panelMenu === menuName) {
            setTimeout(() => {
                dispatch(searchAction.clearSearchState())
            }, 300);
        }

        dispatch(menuAction.setPanelMenu(menuName));
    };

    return (
        <aside className="sidebar-container">
            <Link to="/" className="logo" onClick={() => handleMenuClick('/')}>
                E<span className="menu-label">mobit</span>
            </Link>

            <nav className="menu">
                <div className="menu-top">
                    <button className={active === 'home' ? 'active' : ''} onClick={() => handleMenuClick('/')}>
                        <Home size={menuImgSize} />
                        <span className="menu-label">홈</span>
                    </button>

                    <button className={active === 'search' ? 'active' : ''} onClick={() => handlePanelMenuClick('search')}>
                        <Search size={menuImgSize} />
                        <span className="menu-label">검색</span>
                    </button>

                    <button className={active === 'board' ? 'active' : ''} onClick={() => handleMenuClick('/board')}>
                        <BookOpen size={menuImgSize} />
                        <span className="menu-label">일기</span>
                    </button>

                    {auth.isAuthenticated && 
                        <>
                            <button className={active === 'message' ? 'active' : ''} onClick={() => handleMenuClick('/message')}>
                                <Send size={menuImgSize} />
                                <span className="menu-label">메시지</span>
                            </button>

                            <button className={active === 'alarm' ? 'active' : ''} onClick={() => handlePanelMenuClick('alarm')}>
                                <Bell size={menuImgSize} />
                                <span className="menu-label">알림</span>
                            </button>

                            <button className={active === 'create' ? 'active' : ''} onClick={() => handleMenuClick('/board/create')}>
                                <PlusCircle size={menuImgSize} />
                                <span className="menu-label">작성하기</span>
                            </button>

                            <button className={active === 'profile' ? 'active' : ''} onClick={() => handleMenuClick(`/${auth.username}`)}>
                                <User size={menuImgSize} />
                                <span className="menu-label">프로필</span>
                            </button>
                        </>
                    }
                </div>

                <div className="menu-bottom">
                    {!auth.isAuthenticated ? (
                        <button className={active === 'login' ? 'active' : ''} onClick={() => handleMenuClick('/login')}>
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
