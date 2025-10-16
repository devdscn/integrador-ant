------------------------------------------------------------
-- MIGRATION: ATUALIZAÇÃO DA FUNÇÃO RPC sign_up_and_create_tenant
-- Assinatura atualizada para usar os novos nomes de colunas e 9 parâmetros de Organização.
------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sign_up_and_create_tenant(
    org_documento text,
    org_nome text,
    org_nome_fantasia text,
    org_numero_telefone text,
    org_cep text,
    org_numero text,
    org_complemento text,
    org_cidade text,
    org_estado text
)
RETURNS uuid -- Retorna o ID da nova Organização (Tenant ID)
LANGUAGE plpgsql
-- SECURITY DEFINER é crucial para poder escrever em tabelas com RLS e acessar auth.users
SECURITY DEFINER
AS $$
DECLARE
    new_tenant_id uuid;
    current_user_id uuid := auth.uid();
BEGIN
    -- 1. Verifica se o usuário está autenticado
    -- Se você desativou a confirmação de e-mail, auth.uid() deve funcionar após o signUp.
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado. A chamada RPC deve ocorrer somente após o sucesso de auth.signUp() e a sessão ser estabelecida.';
    END IF;
    
    -- 2. Evita cadastro duplo: verifica se o usuário já pertence a uma organização
    IF EXISTS (
        SELECT 1
        FROM public.user_tenants
        WHERE user_id = current_user_id
    ) THEN
        RAISE EXCEPTION 'Usuário já está associado a uma organização. Impossível criar um novo tenant.';
    END IF;

    -- 3. Insere a nova Organização (Tenant) com os NOVOS NOMES DE COLUNAS
    INSERT INTO public.organizations (
        documento,           -- Novo Nome
        nome,                -- Novo Nome
        nome_fantasia,       -- Novo Nome (NOT NULL)
        numero_telefone,     -- Novo Nome (NOT NULL)
        cep,                 -- Novo Nome (NOT NULL)
        numero,              -- Novo Nome (NOT NULL)
        complemento,         -- Novo Nome (NULL permitido)
        cidade,              -- Novo Nome (NOT NULL)
        estado,              -- Novo Nome (NOT NULL)
        status               -- Mantido
    )
    VALUES (
        org_documento,
        org_nome,
        org_nome_fantasia,
        org_numero_telefone,
        org_cep,
        org_numero,
        org_complemento,
        org_cidade,
        org_estado,
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
        'admin',
        'active'
    );
    
    RETURN new_tenant_id;
    
END;
$$;

------------------------------------------------------------
-- 5. GARANTIR PERMISSÃO DE EXECUÇÃO
------------------------------------------------------------
-- Garante que o usuário anon e authenticated possam executar a nova RPC
GRANT EXECUTE ON FUNCTION public.sign_up_and_create_tenant(text, text, text, text, text, text, text, text, text) TO anon, authenticated;