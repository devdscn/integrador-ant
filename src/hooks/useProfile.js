import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from '../components/AuthProvider';
import { USERS_KEY } from './useUsers';

// Nome da chave de cache
const PROFILE_KEY = 'profile';

// =========================================================================
// 1. QUERY: Buscar o perfil do usuário (aceita userId opcional)
// =========================================================================

const fetchProfile = async (userId) => {
    if (!userId) return null;

    // 1) Tenta ler da VIEW pública que contém email (public.profile_with_email)
    try {
        const { data, error, status } = await supabase
            .from('profile_with_email')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && status !== 406) {
            throw error;
        }

        if (data) return data;
    } catch (err) {
        // Se falhar, tentamos fallback abaixo
        console.warn(
            'fetchProfile: query view failed, falling back to separate queries',
            err?.message
        );
    }

    // 2) Fallback: busca profile da tabela public.profiles e email da auth.users separadamente
    const {
        data: profileOnly,
        error: profileErr,
        status: profileStatus,
    } = await supabase
        .from('profiles')
        .select(
            `id, apelido, nome, telefone, role, created_at,
                 endereco, numero, bairro, cidade, uf, cep, cpf, cnh`
        )
        .eq('id', userId)
        .single();

    if (profileErr && profileStatus !== 406) {
        throw new Error(profileErr.message || 'Erro ao carregar o perfil.');
    }

    try {
        const { data: userRow, error: userErr } = await supabase
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();

        if (!userErr && userRow) {
            profileOnly.email = userRow.email;
        }
    } catch (e) {
        console.warn(
            'fetchProfile: failed to fetch email from users table',
            e?.message
        );
    }

    return profileOnly;
};

export const useProfile = (userIdParam) => {
    const { user } = useAuth();
    const userId = userIdParam || user?.id;

    return useQuery({
        queryKey: [PROFILE_KEY, userId],
        queryFn: () => fetchProfile(userId),
        enabled: !!userId,
        staleTime: 1000 * 60,
    });
};

// =========================================================================
// 2. MUTATION: Atualizar o perfil (faz UPDATE quando id existe, senão upsert)
// =========================================================================

const updateProfileRequest = async (updates) => {
    // se updates.id existir => UPDATE por id (evita duplicate key)
    if (updates?.id) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', updates.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    // caso não tenha id, usa upsert (onConflict id)
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
        mutationFn: (updates) => updateProfileRequest(updates),
        onSuccess: (_data, variables) => {
            const targetId = variables?.id || userId;
            if (targetId) {
                queryClient.invalidateQueries({
                    queryKey: [PROFILE_KEY, targetId],
                });
            }
            queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
        },
    });
};
