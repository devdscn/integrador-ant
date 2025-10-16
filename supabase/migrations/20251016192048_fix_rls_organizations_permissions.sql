-- Garante que a RLS está habilitada na tabela
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 1. DROP POLICY (Remove políticas antigas para evitar conflitos)
DROP POLICY IF EXISTS "Super users can select all organizations" ON public.organizations;
DROP POLICY IF EXISTS "Super users can update all organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can select their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;


-- =================================================================================
-- POLÍTICAS PARA SUPER USUÁRIO (Acesso total, exceto DELETE)
-- =================================================================================

-- Super user: SELECT
-- Permite leitura de todas as organizações se a role for 'super'
CREATE POLICY "Super users can select all organizations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', TRUE)::json->'app_metadata'->>'user_role') = 'super'
  );

-- Super user: UPDATE
-- Permite edição de todas as organizações se a role for 'super'
CREATE POLICY "Super users can update all organizations"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', TRUE)::json->'app_metadata'->>'user_role') = 'super'
  )
  WITH CHECK (
    -- Garante que o super não use a política para rebaixar a própria role
    (current_setting('request.jwt.claims', TRUE)::json->'app_metadata'->>'user_role') = 'super'
  );

-- =================================================================================
-- POLÍTICAS PARA ADMINISTRADOR (Acesso restrito à própria organization, exceto DELETE)
-- =================================================================================

-- Admin: SELECT
-- Permite leitura APENAS da própria organização se a role for 'admin'
CREATE POLICY "Admins can select their organization"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', TRUE)::json->'app_metadata'->>'user_role') = 'admin'
    AND id = (current_setting('request.jwt.claims', TRUE)::json->'app_metadata'->>'tenant_id')::uuid
  );

-- Admin: UPDATE
-- Permite edição APENAS da própria organização se a role for 'admin'
CREATE POLICY "Admins can update their organization"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', TRUE)::json->'app_metadata'->>'user_role') = 'admin'
    AND id = (current_setting('request.jwt.claims', TRUE)::json->'app_metadata'->>'tenant_id')::uuid
  )
  WITH CHECK (
    -- Garante que o admin não altere o ID da Organização
    (current_setting('request.jwt.claims', TRUE)::json->'app_metadata'->>'user_role') = 'admin'
    AND id = (current_setting('request.jwt.claims', TRUE)::json->'app_metadata'->>'tenant_id')::uuid
  );