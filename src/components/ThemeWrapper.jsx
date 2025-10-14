import { ConfigProvider, Empty } from 'antd';
import ptBR from 'antd/lib/locale/pt_BR';
import { useAuth } from './AuthProvider';

const ThemeWrapper = ({ children }) => {
    const { themeAlgorithm } = useAuth();

    const customizeRenderEmpty = () => (
        <Empty image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg" />
    );

    return (
        <ConfigProvider
            theme={{ algorithm: themeAlgorithm }}
            locale={ptBR}
            renderEmpty={customizeRenderEmpty}
        >
            {children}
        </ConfigProvider>
    );
};

export default ThemeWrapper;
