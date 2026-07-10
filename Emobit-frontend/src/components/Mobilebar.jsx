import '../styles/Mobilebar.css'
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAxios } from '../contexts/AxiosContext';
import { authAction } from '../redux/Slice/authSlice';
import { menuAction } from '../redux/Slice/menuSlice';
import { searchAction } from '../redux/Slice/searchSlice';
import { notificationAction } from '../redux/Slice/notificationSlice';
import { Home, Search, BookOpen, PlusCircle, User, Send, Bell, LogIn, LogOut, MessageCircle, Heart, UserRound } from 'lucide-react';

function Mobilebar() {
    const axios = useAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const active = useSelector(state => state.menu.active);
    const panelMenu = useSelector(state => state.menu.panelMenu);
    const senderCount = useSelector(state => state.message.senderCount);
    const notification = useSelector(state => state.notification);

    const menuImgSize = 26;

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

        if (menuName === 'notification' && notification.totalCount > 0) {
            axios.post('/notification/readAll')
                .then(() => {
                    dispatch(notificationAction.readNotifications());
                })
                .catch(error => {
                    console.error('Failed to fetch user data:', error);
                });
        }
    };

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

    return (
        <div className="mobilebar-container">
            <header className="mobile-topbar">
                <Link to="/" className="mobile-logo" onClick={() => handleMenuClick('/')}>
                    Emobit
                </Link>

                <div className="mobile-topbar-right">
                    {auth.isAuthenticated && (
                        <div className="mobile-notification-wrapper">
                            <button className="mobile-auth-button" onClick={() => handlePanelMenuClick('notification')}>
                                <div className="menu-icon-wrapper">
                                    <Bell size={22} />
                                    {notification.totalCount > 0 && <span className="dot-indicator" />}
                                </div>
                            </button>

                            {notification.totalCount > 0 && (
                                <div className="mobile-notification-bubble" onClick={() => handlePanelMenuClick('notification')}>
                                    {notification.commentCount > 0 && (
                                        <div className="bubble-content">
                                            <MessageCircle className='notification-icon' size={18} />
                                            <span className='notification-count'>{notification.commentCount}</span>
                                        </div>
                                    )}
                                    {notification.likeCount > 0 && (
                                        <div className="bubble-content">
                                            <Heart className='notification-icon' size={18} />
                                            <span className='notification-count'>{notification.likeCount}</span>
                                        </div>
                                    )}
                                    {notification.followCount > 0 && (
                                        <div className="bubble-content">
                                            <UserRound className='notification-icon' size={18} />
                                            <span className='notification-count'>{notification.followCount}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {auth.isAuthenticated && (
                        <button className="mobile-auth-button" onClick={() => handleMenuClick('/message')}>
                            <div className="menu-icon-wrapper">
                                <Send size={22} />
                                {senderCount > 0 && <span className="bubble-badge">{senderCount}</span>}
                            </div>
                        </button>
                    )}

                    {!auth.isAuthenticated ? (
                        <button className="mobile-auth-button" onClick={() => handleMenuClick('/login')}>
                            <LogIn size={22} />
                        </button>
                    ) : (
                        <button className="mobile-auth-button" onClick={handlelogout}>
                            <LogOut size={22} />
                        </button>
                    )}
                </div>
            </header>

            <nav className="mobile-bottombar">
                <button className={active === 'home' ? 'active' : ''} onClick={() => handleMenuClick('/')}>
                    <Home size={menuImgSize} />
                </button>

                <button className={active === 'search' ? 'active' : ''} onClick={() => handlePanelMenuClick('search')}>
                    <Search size={menuImgSize} />
                </button>

                <button className={active === 'board' ? 'active' : ''} onClick={() => handleMenuClick('/board')}>
                    <BookOpen size={menuImgSize} />
                </button>

                {auth.isAuthenticated && (
                    <button className={active === 'create' ? 'active' : ''} onClick={() => handleMenuClick('/board/create')}>
                        <PlusCircle size={menuImgSize} />
                    </button>
                )}

                {auth.isAuthenticated && (
                    <button className={active === 'profile' ? 'active' : ''} onClick={() => handleMenuClick(`/${auth.username}`)}>
                        <User size={menuImgSize} />
                    </button>
                )}
            </nav>
        </div>
    );
}

export default Mobilebar;
