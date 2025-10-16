-- 20251015161923_setup_auth_metadata_trigger.sql
-- Configura o mecanismo para injetar tenant_id e role nos metadados do usuário (Auth Hook)

------------------------------------------------------------
-- 1. CRIAÇÃO DA FUNÇÃO DE TRIGGER CORRIGIDA
------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_user_tenant_change()
RETURNS trigger
LANGUAGE plpgsql
-- SECURITY DEFINER é crucial para rodar com permissões elevadas e acessar auth.users
SECURITY DEFINER 
AS $$
DECLARE
    -- A variável não é estritamente necessária, mas ajuda a clareza
    _updated_app_metadata jsonb; 
BEGIN
    -- Determina os valores a serem injetados com base na operação (INSERT ou UPDATE)
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        
        -- Constrói o novo objeto JSON a ser mesclado/inserido nos metadados
        _updated_app_metadata := jsonb_build_object(
            'tenant_id', NEW.tenant_id,
            'user_role', NEW.role
        );
        
        -- Executa a atualização na tabela auth.users. 
        -- Usa o operador '||' (concatenação JSONB) para MERGE os novos dados com os antigos.
        UPDATE auth.users
        SET 
            raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || _updated_app_metadata,
            updated_at = NOW()
        WHERE id = NEW.user_id;

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        -- Você pode adicionar lógica aqui para limpar os metadados em caso de exclusão da ligação,
        -- mas é mais complexo e não é necessário para o fluxo inicial.
        RETURN OLD;
    END IF;

    -- Em caso de outros TG_OP, apenas retorna
    RETURN NULL;
END;
$$;

------------------------------------------------------------
-- 2. CRIAÇÃO DO TRIGGER (Dispara a função em cada mudança)
------------------------------------------------------------

-- Este trigger será disparado SEMPRE que um registro for inserido ou atualizado 
-- na nossa tabela de ligação user_tenants.
-- Se já existe, garante que a nova versão da função será usada.
CREATE OR REPLACE TRIGGER on_user_tenant_change
AFTER INSERT OR UPDATE ON public.user_tenants
FOR EACH ROW EXECUTE FUNCTION public.handle_user_tenant_change();

-- 3. GARANTIR PERMISSÕES
-- A permissão para o usuário 'supabase_auth' (que executa a função) já é dada pelo 
-- SECURITY DEFINER, mas você pode precisar confirmar que o usuário de migração tem 
-- permissão para criar funções e triggers.
-- Para garantir a segurança, NÃO conceda SELECT ou UPDATE na auth.users para o PUBLIC.