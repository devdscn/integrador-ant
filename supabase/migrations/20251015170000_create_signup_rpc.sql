------------------------------------------------------------
-- 1. CRIAÇÃO DA FUNÇÃO RPC: sign_up_and_create_tenant
------------------------------------------------------------
-- Esta função agrupa a criação do Tenant e a associação do primeiro Admin em uma única transação.
-- Ela deve ser executada pelo cliente APÓS o supabase.auth.signUp() ter sido bem-sucedido.

-- Parâmetros necessários:
-- org_cnpj: CNPJ da Organização
-- org_corporate_name: Razão Social da Organização
-- org_city: Cidade da Organização (mínimo obrigatório)

CREATE OR REPLACE FUNCTION public.sign_up_and_create_tenant(
    org_cnpj text,
    org_corporate_name text,
    org_city text
)
RETURNS uuid -- Retorna o ID da nova Organização (Tenant ID)
LANGUAGE plpgsql
-- SECURITY DEFINER é essencial: permite que a função acesse e modifique tabelas
-- que um usuário comum (o cliente) não teria permissão direta (ex: public.organizations).
SECURITY DEFINER
AS $$
DECLARE
    new_tenant_id uuid;
    current_user_id uuid := auth.uid();
BEGIN
    -- ------------------------------------------------------------
    -- A. VALIDAÇÕES DE SEGURANÇA E FLUXO
    -- ------------------------------------------------------------

    -- 1. Verifica se o usuário está autenticado
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado. O cadastro deve ser feito após o sucesso de auth.signUp().';
    END IF;
    
    -- 2. Evita cadastro duplo: verifica se o usuário já pertence a uma organização
    IF EXISTS (
        SELECT 1
        FROM public.user_tenants
        WHERE user_id = current_user_id
    ) THEN
        RAISE EXCEPTION 'Usuário já está associado a uma organização. Impossível criar um novo tenant.';
    END IF;

    -- ------------------------------------------------------------
    -- B. TRANSAÇÃO DE CRIAÇÃO (Atomicidade Garantida)
    -- ------------------------------------------------------------

    -- 3. Insere a nova Organização (Tenant)
    INSERT INTO public.organizations (
        cnpj,
        corporate_name,
        city,
        status -- Assume status 'active' ou outro default
    )
    VALUES (
        org_cnpj,
        org_corporate_name,
        org_city,
        'active'
    )
    RETURNING id INTO new_tenant_id;

    -- 4. Associa o usuário logado à nova Organização com a role de 'admin'
    INSERT INTO public.user_tenants (
        user_id,
        tenant_id,
        role,
        status
    )
    VALUES (
        current_user_id,
        new_tenant_id,
        'admin', -- Role inicial crucial
        'active'
    );
    
    -- NOTA: O trigger 'on_user_tenant_change' criado anteriormente
    -- irá disparar aqui e injetar o new_tenant_id e 'admin' no JWT do usuário.

    -- ------------------------------------------------------------
    -- C. FINALIZAÇÃO
    -- ------------------------------------------------------------
    
    -- Retorna o ID do Tenant criado para que o front-end possa redirecionar
    RETURN new_tenant_id;
    
END;
$$;

------------------------------------------------------------
-- 2. GARANTIR A EXECUÇÃO DA FUNÇÃO
------------------------------------------------------------

-- Concede permissão para a role 'anon' (usuários não logados, mas que acabaram de fazer Sign Up)
-- e 'authenticated' (por segurança, caso a sessão persista) executar a função RPC.
GRANT EXECUTE ON FUNCTION public.sign_up_and_create_tenant(text, text, text) TO anon, authenticated;

-- Revoga permissões desnecessárias para o público
REVOKE ALL ON FUNCTION public.sign_up_and_create_tenant(text, text, text) FROM PUBLIC;