// src/pages/DashboardPage.jsx (Simplificado - Removendo AppLayout)

import React from 'react';
import { Typography } from 'antd'; //

const DashboardPage = () => {
    // Apenas o conteúdo da página!
    return (
        <>
            <Typography.Title level={1}>Dashboard Principal</Typography.Title>
            <p>Seja bem-vindo. Este é o conteúdo da sua página inicial.</p>
        </>
    );
};

export default DashboardPage;
