import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'; // ADICIONADO: Outlet
import { Spin, Layout } from 'antd';
import SpinComponent from './components/SpinComponent';
import ProtectedRoute from './components/ProtectedRoute';
import LayoutRoute from './components/Layout/LayoutRoute';
import ErrorBoundary from './components/ErrorBoundary';

// 1. Lazy Loading para as páginas
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const OrganizationSettingsPage = lazy(() =>
    import('./pages/org/OrganizationSettingsPage')
);

// Componente simples para agrupar rotas que não usam o Layout principal
const PublicRoutesWrapper = () => <Outlet />;

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
                    {/* ----------------------------------------------------
                    1. ROTAS DE AUTENTICAÇÃO (PÚBLICAS)
                    ---------------------------------------------------- */}
                    {/* Rota Pai para agrupar Login e SignUp (Ex: /auth/login, /auth/signup) */}
                    <Route path="/auth" element={<PublicRoutesWrapper />}>
                        {/* Rota para o Login (anteriormente era /login) */}
                        <Route path="login" element={<LoginPage />} />

                        {/* A nova rota de cadastro */}
                        <Route path="signup" element={<SignUpPage />} />

                        {/* Redireciona a rota /auth para /auth/login */}
                        <Route
                            index
                            element={<Navigate to="login" replace />}
                        />
                    </Route>

                    {/* ----------------------------------------------------
                    2. ROTAS PROTEGIDAS (APLICAÇÃO)
                    ---------------------------------------------------- */}
                    {/* Rota Pai Protegida: O LayoutRoute é carregado AQUI uma vez */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <LayoutRoute />
                            </ProtectedRoute>
                        }
                    >
                        {/* Rotas Filhas (INDEX e /profile) */}
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route
                            path="/settings/organization"
                            element={<OrganizationSettingsPage />}
                        />
                        {/* rota para editar outro usuário (admin) */}
                        <Route
                            path="/users/edit/:id"
                            element={<ProfilePage />}
                        />
                        {/* rota para editar próprio perfil permanece */}
                        <Route path="/profile/edit" element={<ProfilePage />} />

                        {/* Outras rotas protegidas que usam o mesmo Layout */}
                    </Route>

                    {/* ----------------------------------------------------
                    3. REDIRECIONAMENTO FINAL
                    ---------------------------------------------------- */}
                    {/* Redireciona qualquer rota desconhecida para o novo caminho de login */}
                    <Route
                        path="*"
                        element={<Navigate to="/auth/login" replace />}
                    />
                </Routes>
            </ErrorBoundary>
        </Suspense>
    );
}

export default App;
