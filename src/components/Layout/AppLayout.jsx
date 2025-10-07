// src/components/Layout/AppLayout.jsx

import React, { useState } from 'react';
import { Layout, theme, Grid, Spin } from 'antd';
import AppHeader from './AppHeader';
import AppSider from './AppSider';
import AppFooter from './AppFooter';

const { Content } = Layout;
const { useBreakpoint } = Grid;

/**
 * Componente Wrapper que define a estrutura visual principal da aplicação.
 * Recebe o conteúdo da página específica como 'children'.
 */
const AppLayout = ({ children }) => {
    const screens = useBreakpoint();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Controla o estado de colapso do menu lateral, inicia colapsado em telas pequenas
    const [collapsed, setCollapsed] = useState(screens.lg ? false : true);

    // Função para alternar o colapso
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    // Calcula o margin left para empurrar o conteúdo quando o Sider está aberto em telas grandes
    const contentMarginLeft = screens.lg && !collapsed ? 200 : 0;

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Menu Lateral Responsivo */}
            <AppSider collapsed={collapsed} onCollapse={setCollapsed} />

            {/* Conteúdo Principal + Header/Footer */}
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

                {/* Conteúdo Principal (Onde a página ProfilePage será renderizada) */}
                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: '70vh',
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children} {/* <--- Renderiza o conteúdo da página */}
                    </div>
                </Content>

                {/* Footer */}
                <AppFooter />
            </Layout>
        </Layout>
    );
};

export default AppLayout;
