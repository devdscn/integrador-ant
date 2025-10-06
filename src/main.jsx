import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // 1. Import do Devtools

import App from './App.jsx';
import { AuthProvider } from './components/AuthProvider.jsx';
import ThemeWrapper from './components/ThemeWrapper.jsx'; // 2. Componente importado
import 'antd/dist/reset.css'; // Estilos do Ant Design

// 3. Cria o cliente de consulta (QueryClient)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos para o dado ser considerado "velho"
            refetchOnWindowFocus: false, // Evita refetch desnecessário
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* 4. Provedor de Consultas do React Query */}
        <QueryClientProvider client={queryClient}>
            {/* 5. Provedor de Rotas */}
            <BrowserRouter>
                {/* 6. Provedor de Autenticação e Tema */}
                <AuthProvider>
                    {/* 7. Wrapper de Tema (usa useAuth para obter o algoritmo de tema) */}
                    <ThemeWrapper>
                        <App />
                    </ThemeWrapper>
                </AuthProvider>
            </BrowserRouter>

            {/* 8. Devtools do React Query - Visível apenas em ambiente de desenvolvimento */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>
);
