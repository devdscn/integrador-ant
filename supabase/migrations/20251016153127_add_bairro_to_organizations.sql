-- migration: Adiciona a coluna 'bairro' à tabela organizations

-- 1. BEGIN TRANSACTION para garantir atomicidade
BEGIN;

-- 2. ALTER TABLE para adicionar a nova coluna
ALTER TABLE public.organizations
    ADD COLUMN bairro character varying(25) not null;

-- 3. COMMIT para finalizar a transação
COMMIT;