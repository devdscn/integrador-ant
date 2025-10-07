// src/components/AuthProvider.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { theme } from 'antd';
import { supabase } from '../services/supabase';
// REMOVIDO: import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // REMOVIDO: const navigate = useNavigate();

    const [isInitializing, setIsInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [currentTheme, setCurrentTheme] = useState('light');

    const isAuthenticated = !!user;

    // LÓGICA DE CHECAGEM DE SESSÃO DO SUPABASE
    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setUser(session.user);
            } else {
                setUser(null);
            }

            // A lógica de navegação foi movida para o AppHeader/handleLogout
            if (isInitializing) {
                setIsInitializing(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [isInitializing]);

    // FUNÇÃO DE LOGOUT: Agora assíncrona, aguarda o Supabase e limpa o estado local
    const logout = async () => {
        const { error } = await supabase.auth.signOut(); // Aguarda a limpeza do token

        // Limpa o estado local imediatamente após a chamada do Supabase.
        setUser(null);

        if (error) {
            console.error('Erro ao fazer logout:', error.message);
        }
    };

    const toggleTheme = () => {
        setCurrentTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const value = {
        isAuthenticated,
        isInitializing,
        user,
        logout,
        currentTheme,
        toggleTheme,
        themeAlgorithm:
            currentTheme === 'dark'
                ? theme.darkAlgorithm
                : theme.defaultAlgorithm,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
