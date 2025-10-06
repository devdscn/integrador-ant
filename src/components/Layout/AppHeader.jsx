// src/components/Layout/AppHeader.jsx

import React from 'react';
import {
    Layout,
    Dropdown,
    Menu,
    Space,
    Switch,
    Button,
    theme,
    Grid,
} from 'antd';
import {
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    SunOutlined,
    MoonOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuth } from '../AuthProvider'; // Importa o hook de autenticação
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { useBreakpoint } = Grid;
const { useToken } = theme;

const AppHeader = ({ collapsed, toggleCollapsed }) => {
    const { logout, currentTheme, toggleTheme } = useAuth();
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const { token } = useToken();

    const isDark = currentTheme === 'dark';

    // Menu do Dropdown de Usuário
    const userMenuItems = [
        {
            key: 'profile',
            icon: <SettingOutlined />,
            label: 'Meu Perfil',
            onClick: () => navigate('/profile'), // Você criará esta rota depois
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sair',
            danger: true,
            onClick: logout,
        },
    ];

    return (
        <Header
            style={{
                padding: '0 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 64,
                backgroundColor: token.colorBgContainer, // Pega a cor de fundo do tema AntD
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
        >
            <Space size="large">
                {/* Botão de colapsar menu visível apenas em telas pequenas/médias */}
                {(screens.xs || screens.sm || screens.md) && (
                    <Button
                        type="text"
                        icon={
                            collapsed ? (
                                <MenuUnfoldOutlined />
                            ) : (
                                <MenuFoldOutlined />
                            )
                        }
                        onClick={toggleCollapsed}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                )}

                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    Integrador MDE
                </div>
            </Space>

            <Space size="middle">
                {/* 1. Switch de Tema (Dark/Light) */}
                <Switch
                    checked={isDark}
                    onChange={toggleTheme}
                    checkedChildren={<MoonOutlined />}
                    unCheckedChildren={<SunOutlined />}
                    style={{ backgroundColor: isDark ? '#141414' : '#1890ff' }}
                />

                {/* 2. Dropdown de Usuário */}
                <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <UserOutlined />
                            Usuário
                        </Space>
                    </a>
                </Dropdown>
            </Space>
        </Header>
    );
};

export default AppHeader;
