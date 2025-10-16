// src/hooks/useUsers.js

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

// Nome da chave de cache
export const USERS_KEY = 'profiles';

// =========================================================================
// QUERY: Chamar a função get_admin_profiles()
// =========================================================================

const fetchUsers = async () => {
    // 1. Chama a função RPC (Remote Procedure Call) no Supabase
    // A segurança (RLS) é aplicada DENTRO da função get_admin_profiles() no PostgreSQL
    const { data, error } = await supabase.rpc('get_admin_profiles');

    if (error) {
        throw new Error(
            error.message || 'Erro ao carregar a lista de usuários.'
        );
    }

    // Retorna a lista de perfis visíveis para o usuário logado
    return data;
};

export const useUsers = () => {
    return useQuery({
        queryKey: [USERS_KEY],
        queryFn: fetchUsers,
        staleTime: 0,
    });
};
