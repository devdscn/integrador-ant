-- [TIMESTAMP]_create_organizations_table.sql
-- Cria a tabela de organizações (tenants) com foco em dados brasileiros.

------------------------------------------------------------
-- 1. CRIAÇÃO DA TABELA
------------------------------------------------------------

CREATE TABLE public.organizations (
    -- CHAVE PRIMÁRIA (TENANT ID)
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

    -- DADOS LEGAIS E CADASTRAIS (BRASIL)
    cnpj text UNIQUE NOT NULL,                       -- Cadastro Nacional da Pessoa Jurídica (CPF para MEI/PF opcionalmente)
    corporate_name text NOT NULL,                    -- Razão Social (Nome Legal Completo)
    fancy_name text,                                 -- Nome Fantasia

    -- DADOS DE CONTATO
    email text UNIQUE,                               -- E-mail de Contato Principal da Organização
    phone_number text,                               -- Telefone Principal (Sugestão: usar o formato E.164: +5511999999999)

    -- ENDEREÇO (SIMPLIFICADO E IMPORTANTE PARA FISCAL)
    zip_code text,                                   -- CEP (Código de Endereçamento Postal)
    street text,                                     -- Logradouro (Rua, Av., etc.)
    number text,                                     -- Número do endereço
    complement text,                                 -- Complemento (Sala, Apto, Bloco)
    neighborhood text,                               -- Bairro
    city text NOT NULL,                              -- Cidade (Obrigatório para a maioria dos cadastros)
    state_code text NOT NULL,                        -- Código do Estado (UF - Ex: 'SP', 'RJ'). Usar CHECK para validar.

    -- METADADOS DO SAAS
    status text DEFAULT 'trial' NOT NULL,            -- Status da Organização ('active', 'trial', 'inactive', 'canceled')

    -- AUDITORIA (TIMESTAMPS)
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);


------------------------------------------------------------
-- 2. AJUSTES E ÍNDICES
------------------------------------------------------------

-- Índices melhoram a performance de buscas e joins.
CREATE UNIQUE INDEX ON public.organizations (cnpj);
CREATE INDEX ON public.organizations (state_code);
CREATE INDEX ON public.organizations (status);


------------------------------------------------------------
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
------------------------------------------------------------
-- ESSENCIAL para isolamento de dados no Multi-Tenant.
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;


-- 4. POLÍTICAS DE RLS (MANTENDO A TABELA PROTEGIDA)

-- Esta política garante que SOMENTE usuários com uma 'role' administrativa 
-- (ex: 'app_admin', que você injetará no JWT) possam ver a lista completa de organizações.
CREATE POLICY "Super-administrators can view all organizations"
    ON public.organizations
    FOR SELECT
    USING (
        (current_setting('request.jwt.claims', TRUE)::json->>'role') = 'app_admin'
    );

-- Esta política garante que o Administrador de uma organização possa ler e atualizar 
-- APENAS os dados da SUA PRÓPRIA organização.
CREATE POLICY "Tenant admins can view and update their own organization data"
    ON public.organizations
    FOR ALL  -- Aplica-se a SELECT, UPDATE, DELETE (mas não INSERT se for feito via backend)
    USING (
        -- O ID da linha (organização) deve ser igual ao tenant_id no JWT do usuário logado
        id = (current_setting('request.jwt.claims', TRUE)::json->>'tenant_id')::uuid
    );