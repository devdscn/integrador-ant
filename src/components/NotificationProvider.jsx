// src/components/NotificationProvider.jsx

import React, { createContext, useContext } from 'react';
import { notification } from 'antd';

// 1. Cria o Contexto (será o valor do API de notificação)
const NotificationContext = createContext(null);

/**
 * Hook customizado para fácil acesso às funções de notificação (success, error, info, etc.).
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useNotificationAPI = () => useContext(NotificationContext);

/**
 * Componente Provedor que configura o contexto de notificação do Ant Design.
 */
export const NotificationProvider = ({ children }) => {
    // 2. Chama o hook do Ant Design. O 'api' é usado para abrir as notificações.
    // O 'contextHolder' é o elemento que precisa ser renderizado no DOM.
    const [api, contextHolder] = notification.useNotification({
        placement: 'bottomRight',
    });

    return (
        // 3. O contextHolder deve ser renderizado aqui, garantindo que ele herde
        // o ConfigProvider (tema) do Ant Design
        <NotificationContext.Provider value={api}>
            {contextHolder}
            {children}
        </NotificationContext.Provider>
    );
};
