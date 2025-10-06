// src/main.jsx (Atualizado com NotificationProvider)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import App from './App.jsx';
import { AuthProvider } from './components/AuthProvider.jsx';
import ThemeWrapper from './components/ThemeWrapper.jsx';
import { NotificationProvider } from './components/NotificationProvider.jsx'; // <--- Importado
import 'antd/dist/reset.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false },
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <ThemeWrapper>
                        {/* 4. Envolve o App com o Provedor de Notificação */}
                        <NotificationProvider>
                            <App />
                        </NotificationProvider>
                    </ThemeWrapper>
                </AuthProvider>
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>
);
