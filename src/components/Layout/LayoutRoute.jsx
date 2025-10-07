// src/components/Layout/LayoutRoute.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import AppLayout from './AppLayout';

/**
 * Componente que renderiza o AppLayout (Header/Sider/Footer) e injeta
 * o componente de rota filho (DashboardPage ou ProfilePage) no <Outlet />.
 */
const LayoutRoute = () => {
    // O AppLayout é renderizado uma única vez.
    return (
        <AppLayout>
            {/* O Outlet renderiza a rota filha correspondente (ex: ProfilePage) */}
            <Outlet />
        </AppLayout>
    );
};

export default LayoutRoute;
