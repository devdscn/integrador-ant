// src/pages/DashboardPage.jsx (Atualizado)

import React, { useState } from 'react';
import { Layout, theme, Grid } from 'antd';
import AppHeader from '../components/Layout/AppHeader';
import AppSider from '../components/Layout/AppSider';
import AppFooter from '../components/Layout/AppFooter';
import { useAuth } from '../components/AuthProvider';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const DashboardPage = () => {
    const screens = useBreakpoint();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Controla o estado de colapso do menu lateral
    const [collapsed, setCollapsed] = useState(screens.lg ? false : true); // Inicia colapsado em telas pequenas

    // Função para alternar o colapso
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Menu Lateral Responsivo */}
            <AppSider collapsed={collapsed} onCollapse={setCollapsed} />

            {/* Conteúdo Principal + Header/Footer */}
            <Layout
                style={{
                    marginLeft: screens.lg && !collapsed ? 200 : 0,
                    transition: 'all 0.2s',
                }}
            >
                {/* Header com Switch de Tema e Dropdown de Usuário */}
                <AppHeader
                    collapsed={collapsed}
                    toggleCollapsed={toggleCollapsed}
                />

                {/* Conteúdo Principal */}
                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: '70vh',
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <h1>Bem-vindo ao Dashboard!</h1>
                        <p>
                            O Layout está pronto. Tente redimensionar a tela
                            para ver o menu lateral colapsar!
                        </p>
                    </div>
                </Content>

                {/* Footer */}
                <AppFooter />
            </Layout>
        </Layout>
    );
};

export default DashboardPage;
