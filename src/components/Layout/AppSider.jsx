import { Layout, Menu, Grid } from 'antd'; // Adicionado theme e Grid
import {
    DashboardOutlined,
    TeamOutlined, // Ícone para Usuários e o SubMenu Controle
    SettingOutlined, // Ícone para Meu Perfil
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom'; // Adicionado useLocation

const { Sider } = Layout;
const { useBreakpoint } = Grid; // Adicionado useBreakpoint

// =========================================================================
// ITENS DO MENU LATERAL
// =========================================================================
const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },

    // NOVO: SubMenu 'Controle'
    {
        key: 'controle', // Chave única para o SubMenu
        icon: <TeamOutlined />,
        label: 'Controle',
        children: [
            {
                key: '/users', // Item: Usuários
                icon: <TeamOutlined />,
                label: 'Usuários',
            },
            {
                key: '/profile', // Item: Meu Perfil
                icon: <SettingOutlined />,
                label: 'Meu Perfil',
            },
        ],
    },
];
// =========================================================================

const AppSider = ({ collapsed, onCollapse }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Fix: Define location
    const screens = useBreakpoint(); // Fix: Define screens para responsividade

    // Calcula a chave selecionada com base na rota atual
    const selectedKeys = [location.pathname];
    // Define quais submenus devem estar abertos
    const openKeys = menuItems
        .filter((item) => item.children)
        .map((item) => item.key);

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            // Configurações para responsividade:
            breakpoint="lg"
            // 80px em desktop, 0px em mobile
            collapsedWidth={screens.lg ? 80 : 0}
            // Lógica de fechamento automático em telas pequenas (mantida do seu arquivo)
            onBreakpoint={(broken) => {
                onCollapse(broken);
            }}
            style={{
                height: '100vh',
                position: 'fixed',
                left: 0,
                zIndex: 100,
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
                theme="dark" // Mantido tema 'dark' do seu arquivo
                mode="inline"
                defaultOpenKeys={openKeys} // Abre o SubMenu 'Controle' por padrão
                selectedKeys={selectedKeys}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
            />
        </Sider>
    );
};

export default AppSider;
