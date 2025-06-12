import '../styles/Layout.css'
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
