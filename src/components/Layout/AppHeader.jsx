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
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { useBreakpoint } = Grid;
const { useToken } = theme;

const AppHeader = ({ collapsed, toggleCollapsed }) => {
    const { logout, currentTheme, toggleTheme, user } = useAuth();
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const { token } = useToken();

    const isDark = currentTheme === 'dark';

    // FUNÇÃO CRÍTICA DE LOGOUT
    const handleLogout = async () => {
        // 1. AGUARDA a função logout do AuthProvider (limpeza do token no Supabase e estado local)
        await logout();

        // 2. FORÇA o redirecionamento SÓ DEPOIS que a limpeza for confirmada
        navigate('/login', { replace: true });
    };

    // Menu do Dropdown de Usuário
    const userMenuItems = [
        {
            key: 'profile',
            icon: <SettingOutlined />,
            label: 'Meu Perfil',
            onClick: () => navigate('/profile'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sair',
            danger: true,
            onClick: handleLogout, // Chama a função assíncrona
        },
    ];

    const userLabel = user?.nome || user?.email || 'Usuário';

    return (
        <Header
            style={{
                padding: '0 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 64,
                backgroundColor: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
        >
            <Space size="large">
                {/* Botão de colapsar menu */}
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
                {/* Switch de Tema */}
                <Switch
                    checked={isDark}
                    onChange={toggleTheme}
                    checkedChildren={<MoonOutlined />}
                    unCheckedChildren={<SunOutlined />}
                    style={{ backgroundColor: isDark ? '#141414' : '#1890ff' }}
                />

                {/* Dropdown de Usuário */}
                <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <UserOutlined />
                            {userLabel}
                        </Space>
                    </a>
                </Dropdown>
            </Space>
        </Header>
    );
};

export default AppHeader;
