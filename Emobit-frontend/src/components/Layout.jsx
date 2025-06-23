import '../styles/Layout.css'
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PanelSearch from './PanelSearch';
import PanelAlarm from './PanelAlarm';

function Layout() {
    return (
        <div className="layout-container">
            <Sidebar />
            <PanelSearch />
            <PanelAlarm />

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
