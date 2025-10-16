// src/hooks/useProfile.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from '../components/AuthProvider';

const ORGANIZATION_KEY = 'currentOrganization';
const ORGANIZATIONS_TABLE = 'organizations';

// =========================================================================
// 1. QUERY: Buscar os dados da Organização (Tenant)
// =========================================================================
const fetchOrganization = async (tenantId) => {
    if (!tenantId) return null;

    const { data, error } = await supabase
        .from(ORGANIZATIONS_TABLE)
        .select(
            `
            id,
            nome,
            nome_fantasia,
            documento,
            numero_telefone,
            cep,
            numero,
            complemento,
            cidade,
            estado
        `
        )
        .eq('id', tenantId)
        .single();

    if (error) {
        if (error.code !== 'PGRST406') {
            console.error('Erro ao buscar organização:', error);
        }
        throw error;
    }
    return data;
};

// =========================================================================
// 2. MUTATION: Atualizar os dados da Organização (organizations)
// =========================================================================
const updateOrganization = async (updates) => {
    const { id, ...updatePayload } = updates;

    const { error } = await supabase
        .from(ORGANIZATIONS_TABLE)
        .update(updatePayload)
        .eq('id', id);

    if (error) throw error;
};

// =========================================================================
// 3. MUTATION: Atualizar os dados Pessoais (auth.users metadados)
// =========================================================================
const updatePersonalProfile = async (updates) => {
    const authUpdatePayload = {};
    const metadataUpdatePayload = {};

    if (updates.display_name !== undefined) {
        metadataUpdatePayload.display_name = updates.display_name;
    }
    if (updates.phone !== undefined) {
        metadataUpdatePayload.phone = updates.phone;
    }

    if (Object.keys(metadataUpdatePayload).length > 0) {
        authUpdatePayload.data = metadataUpdatePayload;
    }

    const { error } = await supabase.auth.updateUser(authUpdatePayload);
    if (error) throw error;
};

// =========================================================================
// 4. HOOK PRINCIPAL (useProfile)
// =========================================================================
export const useProfile = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const tenantId = user?.user_metadata?.tenant_id;
    const userRole = user?.user_metadata?.user_role;
    const displayName = user?.user_metadata?.display_name || '';
    const personalPhone = user?.user_metadata?.phone || '';

    // Query para os dados da Organização
    const organizationQuery = useQuery({
        queryKey: [ORGANIZATION_KEY, tenantId],
        queryFn: () => fetchOrganization(tenantId),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 5,
    });

    // Mutação para a Organização
    const organizationMutation = useMutation({
        mutationFn: updateOrganization,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: [ORGANIZATION_KEY, variables.id],
            });
        },
    });

    // Mutação para o Perfil Pessoal (CORRIGIDO: REMOVIDO o invalidateQueries desnecessário)
    const personalProfileMutation = useMutation({
        mutationFn: updatePersonalProfile,
        onSuccess: () => {
            // A atualização do estado 'user' (no useAuth) é delegada ao listener onAuthStateChange do Supabase.
            // Nenhuma invalidação de cache do TanStack Query é necessária aqui.
        },
    });

    return {
        // Dados Pessoais (diretamente do user_metadata)
        personalProfile: {
            display_name: displayName,
            email: user?.email,
            phone: personalPhone,
            user_id: user?.id,
        },
        userRole: userRole,

        organization: organizationQuery.data,
        isLoadingOrganization: organizationQuery.isLoading,

        updatePersonalProfile: personalProfileMutation.mutateAsync,
        isUpdatingPersonal: personalProfileMutation.isPending,

        updateOrganization: organizationMutation.mutateAsync,
        isUpdatingOrganization: organizationMutation.isPending,
    };
};
