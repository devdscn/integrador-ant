// src/components/Layout/AppHeader.jsx (Ajuste de Alinhamento)

import React from 'react';
import {
    Layout,
    Dropdown,
    Space,
    Switch,
    Button,
    theme,
    Grid,
    Spin,
    Typography,
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
import { useProfile } from '../../hooks/useProfile';

const { Header } = Layout;
const { useBreakpoint } = Grid;
const { useToken } = theme;

const AppHeader = ({ collapsed, toggleCollapsed }) => {
    const { logout, currentTheme, toggleTheme } = useAuth();
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const { token } = useToken();

    const { data: profile, isLoading: isProfileLoading } = useProfile();
    const isDark = currentTheme === 'dark';

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <SettingOutlined />,
            label: 'Meu Perfil',
            onClick: () => navigate('/profile'),
        },
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sair',
            danger: true,
            onClick: handleLogout,
        },
    ];

    // Define o Label do Usuário
    let userLabelContent;

    if (isProfileLoading) {
        userLabelContent = <Spin size="small" />;
    } else if (profile) {
        const displayName = profile.nome || profile.apelido;
        const displayRole = profile.role ? profile.role.toUpperCase() : 'N/A';

        // 1. ALTERAÇÃO PRINCIPAL: Alinha o texto à esquerda (flex-start)
        userLabelContent = (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start', // Alinha as duas linhas de texto à esquerda
                    lineHeight: 1.2,
                }}
            >
                <Typography.Text strong style={{ fontSize: '14px' }}>
                    {displayName}
                </Typography.Text>
                <Typography.Text
                    type="secondary"
                    style={{ fontSize: '11px', marginTop: -2 }}
                >
                    {displayRole}
                </Typography.Text>
            </div>
        );
    } else {
        userLabelContent = 'Completar Perfil';
    }

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
                        style={{ fontSize: '16px', width: 64, height: 64 }}
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
                        {/* 2. ALTERAÇÃO PRINCIPAL: Alinha verticalmente no centro */}
                        <Space size={8} align="center">
                            <UserOutlined style={{ fontSize: '18px' }} />
                            {userLabelContent}
                        </Space>
                    </a>
                </Dropdown>
            </Space>
        </Header>
    );
};

export default AppHeader;
