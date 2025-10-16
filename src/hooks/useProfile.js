// src/hooks/useProfile.js
// RESPONSABILIDADE: Gerenciar a exposição e atualização dos dados do Perfil Pessoal (user_metadata)

import { useMutation } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from '../components/AuthProvider';

// =========================================================================
// 1. MUTATION: Atualizar o Perfil Pessoal (user_metadata)
// =========================================================================
const updatePersonalProfile = async (updates) => {
    // updates contém { display_name, phone }
    const { error } = await supabase.auth.updateUser({
        data: updates,
    });

    if (error) {
        console.error('Erro ao atualizar perfil pessoal:', error);
        throw error;
    }
};

// =========================================================================
// 2. HOOK PRINCIPAL
// =========================================================================
export const useProfile = () => {
    // CHAME useAuth() AQUI, NO INÍCIO DO HOOK CUSTOMIZADO (Regra do React)
    const { user } = useAuth();

    // Extrai dados do user_metadata para facilitar o uso no formulário
    const displayName =
        user?.user_metadata?.display_name || user?.email?.split('@')[0] || '';
    const personalPhone = user?.user_metadata?.phone || '';
    const userRole = user?.app_metadata?.user_role || 'Convidado'; // Exposto para componentes como AppHeader

    // Mutação para o Perfil Pessoal
    const personalProfileMutation = useMutation({
        mutationFn: updatePersonalProfile,
        onSuccess: () => {
            // A atualização do estado 'user' (no useAuth) é delegada ao listener onAuthStateChange do Supabase.
        },
    });

    // Dados de perfil no formato que o ProfilePage espera
    const personalProfile = {
        display_name: displayName,
        email: user?.email,
        phone: personalPhone,
        user_id: user?.id,
    };

    return {
        personalProfile: personalProfile,
        userRole: userRole,

        updatePersonalProfile: personalProfileMutation.mutateAsync,
        isUpdatingPersonal: personalProfileMutation.isPending,
        personalUpdateError: personalProfileMutation.error,
    };
};
