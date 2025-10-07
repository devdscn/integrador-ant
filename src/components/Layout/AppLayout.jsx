// src/components/Layout/AppLayout.jsx (CRITICAMENTE CORRIGIDO)

import React, { useState } from 'react';
import { Layout, theme, Grid, Spin } from 'antd';
import AppHeader from './AppHeader';
import AppSider from './AppSider';
import AppFooter from './AppFooter';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const AppLayout = ({ children }) => {
    const screens = useBreakpoint();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [collapsed, setCollapsed] = useState(screens.lg ? false : true);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    // CORREÇÃO CRÍTICA AQUI:
    // 1. Se for tela grande (desktop), a margem deve ser 200px (aberto) ou 80px (recolhido).
    // 2. Se for tela pequena (mobile), a margem é sempre 0px (o Sider é um overlay).
    const contentMarginLeft = screens.lg ? (collapsed ? 80 : 200) : 0;

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Menu Lateral Responsivo */}
            <AppSider collapsed={collapsed} onCollapse={setCollapsed} />

            {/* 2. Aplica a margem corrigida no Layout principal */}
            <Layout
                style={{
                    marginLeft: contentMarginLeft,
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
                        {children}
                    </div>
                </Content>

                {/* Footer */}
                <AppFooter />
            </Layout>
        </Layout>
    );
};

export default AppLayout;
