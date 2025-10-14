// src/hooks/useProfile.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from '../components/AuthProvider';

// Nome da chave de cache
const PROFILE_KEY = 'profile';

// =========================================================================
// 1. QUERY: Buscar o perfil do usuário logado
// =========================================================================

const fetchProfile = async (userId) => {
    // 1. Busca o perfil na tabela 'profiles' baseado no ID do usuário logado (userId = auth.uid())
    const { data, error, status } = await supabase
        .from('profiles')
        .select(
            `id, apelido, nome, telefone, role, created_at, 
                 endereco, numero, bairro, cidade, uf, cep, cpf, cnh`
        )
        .eq('id', userId)
        .single(); // Espera um único resultado

    if (error && status !== 406) {
        // status 406 é quando .single() não encontra (pode ser o caso inicial)
        throw new Error(error.message || 'Erro ao carregar o perfil.');
    }

    // Se o perfil não existir (usuário acabou de se cadastrar), retorna null, não um erro
    return data;
};

export const useProfile = () => {
    const { user } = useAuth(); // Obtém o user do AuthProvider
    const userId = user?.id; // ID do usuário logado

    return useQuery({
        queryKey: [PROFILE_KEY, userId],
        queryFn: () => fetchProfile(userId),
        enabled: !!userId, // Apenas executa a query se houver um userId (usuário logado)
        staleTime: 1000 * 60, // Perfil não muda com frequência
    });
};

// =========================================================================
// 2. MUTATION: Atualizar o perfil
// =========================================================================

const updateProfile = async ({ userId, updates }) => {
    // 1. Insere ou Atualiza (upsert) na tabela 'profiles'
    // A RLS garantirá que apenas o próprio usuário possa fazer isso.
    const { data, error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const userId = user?.id;

    return useMutation({
        mutationFn: (updates) => updateProfile({ userId, updates }),

        // No sucesso, invalida a chave de cache do perfil para forçar o refetch e atualizar a UI
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROFILE_KEY, userId] });
        },
    });
};
