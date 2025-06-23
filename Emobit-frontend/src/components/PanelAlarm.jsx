import '../styles/PanelAlarm.css';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { menuAction } from '../redux/Slice/menuSlice';

function PanelAlarm() {
    const panelMenu = useSelector(state => state.menu.panelMenu);
    const dispatch = useDispatch();
    const panelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const curPanel = panelRef.current;
            const sidebar = document.querySelector('.sidebar-container');

            if (curPanel && !curPanel.contains(event.target) && sidebar && !sidebar.contains(event.target)) {
                dispatch(menuAction.setPanelMenu(null));
            }
        };

        if (panelMenu === 'alarm') {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [panelMenu, dispatch]);

    return (
        <div className={`panel-alarm-container ${panelMenu == 'alarm' ? 'open' : ''}`} ref={panelRef} >
            알람패널
        </div>
    );
}

export default PanelAlarm;
