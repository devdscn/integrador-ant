// src/components/Layout/AppSider.jsx

import React from 'react';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    MenuOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

// Itens de menu fixos
const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/pedidos', icon: <ShoppingCartOutlined />, label: 'Pedidos' },
    { key: '/clientes', icon: <TeamOutlined />, label: 'Clientes' },
];

const AppSider = ({ collapsed, onCollapse }) => {
    const navigate = useNavigate();

    // Calcula a chave selecionada com base na rota atual
    const selectedKeys = [location.pathname];

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            // Configurações para responsividade:
            breakpoint="lg" // O menu colapsa (fica escondido) em telas "large" (1024px) ou menores
            collapsedWidth="0" // Ocupa 0px (desaparece) em telas pequenas
            onBreakpoint={(broken) => {
                // Ao atingir o breakpoint, automaticamente colapsa (fecha)
                onCollapse(broken);
            }}
            style={{
                height: '100vh',
                position: 'fixed',
                left: 0,
                zIndex: 100, // Garante que fique por cima do conteúdo
            }}
        >
            {/* Logo placeholder */}
            <div
                className="logo"
                style={{
                    height: '32px',
                    margin: '16px',
                    color: '#fff',
                    textAlign: 'center',
                    lineHeight: '32px',
                }}
            >
                MDE
            </div>

            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={selectedKeys}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
            />
        </Sider>
    );
};

export default AppSider;
