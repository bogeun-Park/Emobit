import '../styles/Mobilebar.css'
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAxios } from '../contexts/AxiosContext';
import { authAction } from '../redux/Slice/authSlice';
import { menuAction } from '../redux/Slice/menuSlice';
import { searchAction } from '../redux/Slice/searchSlice';
import { Home, Search, BookOpen, LogIn, LogOut } from 'lucide-react';

function Mobilebar() {
    const axios = useAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const active = useSelector(state => state.menu.active);
    const panelMenu = useSelector(state => state.menu.panelMenu);

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

                {!auth.isAuthenticated ? (
                    <button className="mobile-auth-button" onClick={() => handleMenuClick('/login')}>
                        <LogIn size={22} />
                    </button>
                ) : (
                    <button className="mobile-auth-button" onClick={handlelogout}>
                        <LogOut size={22} />
                    </button>
                )}
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
            </nav>
        </div>
    );
}

export default Mobilebar;
