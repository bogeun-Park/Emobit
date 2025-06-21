import '../styles/NoLayout.css'
import React from 'react';
import { Outlet } from 'react-router-dom';

function NoLayout() {
    return (
        <div className="no-layout-container">
            <Outlet />
        </div>
    );
}

export default NoLayout;
