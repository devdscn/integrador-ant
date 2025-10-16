import {
    Layout,
    Dropdown,
    Space,
    Switch,
    Button,
    theme,
    Grid,
    Typography,
    Avatar,
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
const { Text } = Typography;

const AppHeader = ({ collapsed, toggleCollapsed }) => {
    const { logout, currentTheme, toggleTheme, user } = useAuth();
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const { token } = useToken();

    const isDark = currentTheme === 'dark';

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const displayName = user?.user_metadata?.display_name;
    const userRole = user?.app_metadata?.user_role || 'Convidado';

    const userLabelContent = displayName
        ? displayName
        : user?.email || 'Usuário';

    // 2. Componente de Rótulo Customizado
    const UserLabel = () => (
        // Removendo o style 'lineHeight: 1.2' do container para deixar o Space cuidar da centralização
        <div style={{ textAlign: 'center' }}>
            {/* Linha Principal: Display Name (Tamanho Aumentado) */}
            <Text
                style={{
                    display: 'block',
                    fontWeight: 'bold',
                    color: token.colorText,
                    fontSize: '1em',
                    padding: 0,
                    margin: 0,
                }}
            >
                {userLabelContent}
            </Text>
            {/* Linha Secundária: Role do Usuário (Vibrante e Caixa Alta) */}
            <Text
                style={{
                    display: 'block',
                    fontSize: '0.70em',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: token.colorPrimary,
                    padding: 0,
                    margin: 0,
                }}
            >
                {userRole}
            </Text>
        </div>
    );

    // 3. Itens do Menu de Dropdown
    const userMenuItems = [
        {
            key: 'profile',
            icon: <SettingOutlined />,
            label: 'Meu Perfil',
            onClick: () => navigate('/profile'),
        },
        {
            key: 'organization-settings',
            icon: <SettingOutlined />,
            label: 'Configurações da Organização',
            onClick: () => navigate('/settings/organization'),
        },
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sair',
            onClick: handleLogout,
        },
    ];

    return (
        <Header
            style={{
                padding: 0,
                background: token.colorBgContainer,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingInline: 16,
            }}
        >
            <Space>
                {/* Botão de Colapso (Visível em telas maiores) */}
                {!screens.xs && (
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
                        <Space size={8} align="center">
                            <Avatar
                                style={{ backgroundColor: '#FF4627' }}
                                size="default"
                                icon={<UserOutlined />}
                            />
                            {/* <UserOutlined style={{ fontSize: '24px' }} /> */}
                            <UserLabel />
                        </Space>
                    </a>
                </Dropdown>
            </Space>
        </Header>
    );
};

export default AppHeader;
