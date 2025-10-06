// src/components/Layout/AppFooter.jsx

import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter = () => (
    <Footer style={{ textAlign: 'center', padding: '12px 50px' }}>
        Integrador MDE ©{new Date().getFullYear()} Criado por devdscn
    </Footer>
);

export default AppFooter;
