import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin, Layout } from 'antd';
import SpinComponent from './components/SpinComponent';
import ProtectedRoute from './components/ProtectedRoute';
import LayoutRoute from './components/Layout/LayoutRoute';
import ErrorBoundary from './components/ErrorBoundary';

// 1. Lazy Loading para as páginas (continuamos usando Lazy Loading)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));

const AppLoadingFallback = () => (
    <div>
        <SpinComponent />
    </div>
);

function App() {
    return (
        <Suspense fallback={<AppLoadingFallback />}>
            <ErrorBoundary>
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
                        {/* rota para editar outro usuário (admin) */}
                        <Route
                            path="/users/edit/:id"
                            element={<ProfilePage />}
                        />
                        {/* rota para editar próprio perfil permanece */}
                        <Route path="/profile/edit" element={<ProfilePage />} />

                        {/* Outras rotas protegidas que usam o mesmo Layout */}
                    </Route>

                    {/* Redireciona qualquer coisa para o login se for desconhecido (para o teste) */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </ErrorBoundary>
        </Suspense>
    );
}

export default App;
