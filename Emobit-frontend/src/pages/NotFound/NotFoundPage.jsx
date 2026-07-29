import '../../styles/NotFoundPage.css';
import React, { useEffect, useState } from 'react';
import { menuAction } from '../../redux/Slice/menuSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CircleAlert } from 'lucide-react';
import { loadingBar } from '../../utils/loadingBar';

function NotFoundPage() {
    const dispatch = useDispatch();
    const active = useSelector(state => state.menu.active);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dispatch(menuAction.setActiveMenu(''));
    }, [active, dispatch]);

    useEffect(() => {
        loadingBar.waitForIdle().then(() => setLoading(false));
    }, []);

    if (loading) return null;

    return (
        <div className="notfound-container">
            <div className="notfound-box">
                <div className="notfound-icon-wrapper">
                    <CircleAlert className="notfound-icon" size={26}/>
                </div>
                
                <div className="notfound-text1">이 페이지는 존재하지 않습니다.</div>
                <div className="notfound-text2">링크가 잘못되었거나 프로필이 삭제되었을 수 있습니다.</div>
                
                <Link to="/" className="notfound-button">홈으로 돌아가기</Link>
            </div>
        </div>
    );
}

export default NotFoundPage;
