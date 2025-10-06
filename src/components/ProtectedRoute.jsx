// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Spin, Layout } from 'antd'; // Usamos o Spin para mostrar um loading enquanto o estado é verificado

const { Content } = Layout;

/**
 * Componente que verifica a autenticação antes de renderizar a rota filha.
 */
const ProtectedRoute = ({ children }) => {
    // 1. Obtém os estados do nosso provedor de autenticação
    const { isAuthenticated, isInitializing } = useAuth();

    // NOTA: isInitializing é crucial para evitar redirecionamento durante a primeira
    // checagem da sessão (ex: Supabase lendo tokens do localStorage)

    // 2. Mostra um spinner durante a inicialização (checa se o usuário já está logado)
    if (isInitializing) {
        return (
            <Layout
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Content>
                    <Spin size="large" tip="Carregando sessão..." />
                </Content>
            </Layout>
        );
    }

    // 3. Se não estiver autenticado, redireciona para a página de login
    if (!isAuthenticated) {
        // Redireciona e mantém o caminho original no estado de navegação
        return <Navigate to="/login" replace />;
    }

    // 4. Se estiver autenticado, renderiza o componente filho (a página protegida)
    return children;
};

export default ProtectedRoute;
