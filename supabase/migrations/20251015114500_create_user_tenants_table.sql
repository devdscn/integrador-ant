-- [TIMESTAMP]_create_user_tenants_table.sql
-- Cria a tabela de ligação entre usuários (auth.users) e organizações (organizations).

------------------------------------------------------------
-- 1. CRIAÇÃO DA TABELA user_tenants
------------------------------------------------------------

CREATE TABLE public.user_tenants (
    -- ID Primário da Tabela de Ligação (Opcional, mas útil para logs e referências)
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

    -- CHAVES ESTRANGEIRAS
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    -- NOTA: auth.users é uma tabela especial do Supabase/Postgres.

    tenant_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    -- ON DELETE CASCADE: Se a organização ou o usuário for deletado, a ligação é deletada automaticamente.

    -- METADADOS DO RELACIONAMENTO
    role text NOT NULL DEFAULT 'member',   -- Papel do Usuário dentro desta Organização ('admin', 'member', 'viewer', etc.)
    status text NOT NULL DEFAULT 'active', -- Status do Usuário na Organização ('active', 'suspended', 'invited')

    -- AUDITORIA
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    -- GARANTIR RELACIONAMENTO ÚNICO: um usuário só pode ter um registro por tenant (se for 1:N)
    -- Se você quiser permitir um usuário em MÚLTIPLAS organizações, esta CONSTRAINT é ESSENCIAL.
    -- Se você adotar o modelo 1:1 (um usuário = um tenant), você pode adicionar uma UNIQUE constraint em 'user_id' aqui.
    CONSTRAINT unique_user_per_tenant UNIQUE (user_id, tenant_id)
);


------------------------------------------------------------
-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
------------------------------------------------------------
-- O RLS nesta tabela é fundamental para o processo de injeção de claims no JWT.
ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;


-- 3. POLÍTICAS DE RLS

-- A política MAIS CRÍTICA: Permite que um usuário logado acesse APENAS os registros de user_tenants
-- onde o 'user_id' é igual ao seu próprio ID (obtido do JWT).
-- Isso garante que um usuário não possa ver o 'role' de outro usuário em sua própria ou em outras organizações.
CREATE POLICY "Users can only select their own tenant mappings"
    ON public.user_tenants
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Permite que o administrador de uma Organização insira/atualize (convide/mude o role de) outros usuários.
-- A validação precisa do 'role' deve ser feita em um Backend Function/RPC para maior segurança.
CREATE POLICY "Admins of a tenant can manage other users in their tenant"
    ON public.user_tenants
    FOR ALL
    USING (
        -- Verifica se o usuário logado (auth.uid()) está nesta mesma organização (tenant_id)
        -- E, idealmente, se o 'role' dele é 'admin' (esta última parte é mais segura via RPC)
        tenant_id IN (
            SELECT ut.tenant_id
            FROM public.user_tenants AS ut
            WHERE ut.user_id = auth.uid() AND ut.role = 'admin'
        )
    )
    WITH CHECK (
        -- Limita a inserção/atualização apenas a usuários dentro da sua tenant
        tenant_id IN (
            SELECT ut.tenant_id
            FROM public.user_tenants AS ut
            WHERE ut.user_id = auth.uid()
        )
    );