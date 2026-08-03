import '../styles/Mobilebar.css'
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLogout } from '../hooks/useLogout';
import { useMenuNavigation } from '../hooks/useMenuNavigation';
import { Home, Search, BookOpen, PlusCircle, User, Send, Bell, LogIn, LogOut, MessageCircle, Heart, UserRound } from 'lucide-react';

function Mobilebar() {
    const auth = useSelector(state => state.auth);
    const active = useSelector(state => state.menu.active);
    const senderCount = useSelector(state => state.message.senderCount);
    const notification = useSelector(state => state.notification);
    const handlelogout = useLogout();
    const { handleMenuClick, handlePanelMenuClick } = useMenuNavigation();

    const menuImgSize = 26;

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
