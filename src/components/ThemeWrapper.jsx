// src/components/ThemeWrapper.jsx
import React from 'react';
import { ConfigProvider } from 'antd';
import { useAuth } from './AuthProvider'; // Ajuste o caminho se necessário

const ThemeWrapper = ({ children }) => {
    const { themeAlgorithm } = useAuth();

    return (
        <ConfigProvider theme={{ algorithm: themeAlgorithm }}>
            {children}
        </ConfigProvider>
    );
};

export default ThemeWrapper;
