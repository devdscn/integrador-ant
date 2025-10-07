// src/App.jsx (Com Rotas Aninhadas e Componentes Lazy-Loaded)

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin, Layout } from 'antd';

import ProtectedRoute from './components/ProtectedRoute';
import LayoutRoute from './components/Layout/LayoutRoute'; // <--- Importação do novo layout

// 1. Lazy Loading para as páginas (continuamos usando Lazy Loading)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));

const { Content } = Layout;

// ... Componente AppLoadingFallback (mantém o mesmo código)
const AppLoadingFallback = () => (
    <Layout
        style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Content>
            <Spin size="large" tip="Carregando aplicativo..." />
        </Content>
    </Layout>
);

function App() {
    return (
        <Suspense fallback={<AppLoadingFallback />}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                {/* 2. Rota Pai Protegida: O AppLayout é carregado AQUI uma vez */}
                <Route
                    element={
                        <ProtectedRoute>
                            <LayoutRoute />
                        </ProtectedRoute>
                    }
                >
                    {/* 3. Rotas Filhas (INDEX e /profile) */}
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/users" element={<UsersPage />} />

                    {/* Outras rotas protegidas que usam o mesmo Layout */}
                </Route>

                {/* Redireciona qualquer coisa para o login se for desconhecido (para o teste) */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}

export default App;
