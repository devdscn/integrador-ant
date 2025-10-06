// src/components/AuthProvider.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { theme } from 'antd';
import { supabase } from '../services/supabase'; // Importa o cliente Supabase

// 1. Criação do Contexto
const AuthContext = createContext(null);

// 2. Provedor de Contexto
export const AuthProvider = ({ children }) => {
    // Estado que indica se o Supabase terminou de checar o token no localStorage
    const [isInitializing, setIsInitializing] = useState(true);

    // Armazena o objeto de usuário do Supabase
    const [user, setUser] = useState(null);

    // Estado para o tema (light/dark), como antes
    const [currentTheme, setCurrentTheme] = useState('light');

    // isInitializing será setado como false apenas após a primeira checagem de sessão
    const isAuthenticated = !!user; // Autenticado se houver um objeto user

    // =========================================================================
    // LÓGICA DE CHECAGEM DE SESSÃO DO SUPABASE
    // =========================================================================
    useEffect(() => {
        // Esta função roda apenas no momento em que o componente é montado
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            // Ao receber qualquer evento de autenticação
            if (session) {
                // Se houver uma sessão, o usuário está logado
                setUser(session.user);
            } else {
                // Caso contrário, não há usuário
                setUser(null);
            }

            // Finaliza a inicialização APENAS após a primeira checagem
            if (isInitializing) {
                setIsInitializing(false);
            }
        });

        // Cleanup: remove o listener ao desmontar o componente
        return () => subscription.unsubscribe();
    }, [isInitializing]);
    // =========================================================================

    // Função para logout
    const logout = async () => {
        setIsInitializing(true); // Opcional: Mostra o loading durante o logout
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Erro ao fazer logout:', error.message);
        } else {
            setUser(null);
        }
        setIsInitializing(false);
    };

    // Função para alternar o tema
    const toggleTheme = () => {
        setCurrentTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    // Objeto de valor passado para os componentes filhos
    const value = {
        isAuthenticated,
        isInitializing, // Estado crucial para o ProtectedRoute
        user,
        logout,
        currentTheme,
        toggleTheme,
        themeAlgorithm:
            currentTheme === 'dark'
                ? theme.darkAlgorithm
                : theme.defaultAlgorithm,
        // O login (signInWithPassword) será chamado DIRETAMENTE na LoginPage
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

// 3. Hook customizado para fácil acesso ao contexto
export const useAuth = () => useContext(AuthContext);
