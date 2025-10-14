// src/App.jsx (Com Rotas Aninhadas e Componentes Lazy-Loaded)

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin, Layout } from 'antd';
import SpinComponent from './components/SpinComponent';
import ProtectedRoute from './components/ProtectedRoute';
import LayoutRoute from './components/Layout/LayoutRoute'; // <--- Importação do novo layout

// 1. Lazy Loading para as páginas (continuamos usando Lazy Loading)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));

const AppLoadingFallback = () => (
    <div
    // style={{
    //     display: 'flex',
    //     justifyContent: 'center', // Centraliza horizontalmente
    //     alignItems: 'center', // Centraliza verticalmente
    //     height: '100vh', // Ocupa a altura total da viewport
    //     width: '100%',
    //     backgroundColor: 'white', // Pode adicionar a cor de fundo desejada
    // }}
    >
        <SpinComponent />

        {/* <Spin
            tip="Carregando aplicação..."
            size="large" // Mantido o tamanho grande para visibilidade
        /> */}
    </div>
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
