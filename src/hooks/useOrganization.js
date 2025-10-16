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
        .select('*')
        .eq('id', tenantId)
        .single();

    if (error) {
        // CORREÇÃO: Trata PGRST116 (Cannot coerce to single JSON object) e PGRST406 (No rows returned)
        // Ambos indicam 0 linhas encontradas ou RLS negado
        if (error.code === 'PGRST116' || error.code === 'PGRST406') {
            console.warn(
                `Organização com ID ${tenantId} não encontrada ou RLS negado (0 rows).`
            );
            return null; // Retorna null para o TanStack Query, que é o comportamento esperado.
        }

        // Se for um erro real, lançamos o erro.
        console.error('Erro fatal ao buscar organização:', error);
        throw error;
    }
    return data;
};

// =========================================================================
// 2. MUTATION: Atualizar os dados da Organização (organizations)
// =========================================================================
const updateOrganization = async (updates) => {
    // updates contém id e os campos a serem atualizados (nome, telefone, etc.)
    const { id, ...updatePayload } = updates;

    // O RLS garante que o usuário só pode atualizar o próprio ID
    const { error } = await supabase
        .from(ORGANIZATIONS_TABLE)
        .update(updatePayload)
        .eq('id', id);

    if (error) {
        console.error('Erro ao atualizar organização:', error);
        throw error;
    }
};

// =========================================================================
// 3. HOOK PRINCIPAL
// =========================================================================
export const useOrganization = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Pega o tenantId do JWT (app_metadata)
    const tenantId = user?.app_metadata?.tenant_id;

    // QUERY: Busca a Organização
    const organizationQuery = useQuery({
        queryKey: [ORGANIZATION_KEY, tenantId],
        queryFn: () => fetchOrganization(tenantId),
        enabled: !!tenantId,
        staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    });

    // MUTATION: Atualiza a Organização
    const organizationMutation = useMutation({
        mutationFn: updateOrganization,
        onSuccess: (data, variables) => {
            // Invalida a query de cache para forçar o refetch dos dados
            queryClient.invalidateQueries({
                queryKey: [ORGANIZATION_KEY, variables.id],
            });
        },
    });

    return {
        organization: organizationQuery.data,
        isLoadingOrganization: organizationQuery.isLoading,

        updateOrganization: organizationMutation.mutateAsync,
        isUpdatingOrganization: organizationMutation.isPending,
        organizationUpdateError: organizationMutation.error, // Exposto para o componente de página
    };
};
