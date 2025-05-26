import React, { useEffect } from 'react';
import { menuAction } from '../../redux/Slice/menuSlice';
import { useDispatch, useSelector } from 'react-redux';

function NotFoundPage() {
    const dispatch = useDispatch();
    const active = useSelector(state => state.menu.active);

    useEffect(() => {
        dispatch(menuAction.setActiveMenu(''));
    }, [active, dispatch]);

    return (
        <div>
            <h3>존재하지 않는 페이지입니다.</h3>
        </div>
    );
}

export default NotFoundPage;
