// src/App.jsx (Com Lazy Loading e Suspense)

import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spin, Layout } from 'antd'; // Importamos o Spin do Ant Design para o fallback

// Componentes de Rota Protegida e Auxiliares
import ProtectedRoute from './components/ProtectedRoute';

// 1. Lazy Loading para as páginas
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

const { Content } = Layout;

// Componente para o fallback
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
        // 2. Envolve as Rotas com Suspense
        <Suspense fallback={<AppLoadingFallback />}>
            <Routes>
                {/* Rota Pública: Login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rotas Protegidas */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* Rota Catch-all (pode ser uma página 404 lazy-loaded) */}
                <Route
                    path="*"
                    element={
                        <h1 style={{ textAlign: 'center', marginTop: '50px' }}>
                            404 | Página Não Encontrada
                        </h1>
                    }
                />
            </Routes>
        </Suspense>
    );
}

export default App;
