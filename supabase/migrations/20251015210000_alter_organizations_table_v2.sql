------------------------------------------------------------
-- MIGRATION: ALTERAÇÕES CORRIGIDAS NA TABELA public.organizations (V3)
------------------------------------------------------------

-- Inicia uma transação para garantir a atomicidade das alterações
BEGIN;

-- =========================================================
-- 1. RENAME (Renomear todas as colunas)
-- =========================================================

ALTER TABLE public.organizations RENAME COLUMN cnpj TO documento;
ALTER TABLE public.organizations RENAME COLUMN corporate_name TO nome;
ALTER TABLE public.organizations RENAME COLUMN fancy_name TO nome_fantasia;
ALTER TABLE public.organizations RENAME COLUMN phone_number TO numero_telefone;
ALTER TABLE public.organizations RENAME COLUMN zip_code TO cep;
ALTER TABLE public.organizations RENAME COLUMN number TO numero;
ALTER TABLE public.organizations RENAME COLUMN complement TO complemento;
ALTER TABLE public.organizations RENAME COLUMN city TO cidade;
ALTER TABLE public.organizations RENAME COLUMN state_code TO estado;


-- =========================================================
-- 2. DROP (Remover colunas desnecessárias)
-- =========================================================

ALTER TABLE public.organizations DROP COLUMN neighborhood;
ALTER TABLE public.organizations DROP COLUMN IF EXISTS street; 


-- =========================================================
-- 3. ALTER TYPE & SET NOT NULL (Aplicar tipos e restrições)
-- Removido o modificador de tamanho '(N)' do tipo TEXT para corrigir o erro 42601.
-- Onde o limite é importante, como em 'documento', 'numero_telefone' e 'estado', usamos VARCHAR.
-- =========================================================

-- Coluna: documento (CNPJ/CPF) -> VARCHAR(14) (Mudar para garantir o tamanho máximo)
ALTER TABLE public.organizations ALTER COLUMN documento TYPE VARCHAR(14); 

-- Coluna: nome (Razão Social) -> TEXT
ALTER TABLE public.organizations ALTER COLUMN nome TYPE TEXT; 

-- Coluna: nome_fantasia -> TEXT E torna NOT NULL
ALTER TABLE public.organizations ALTER COLUMN nome_fantasia TYPE TEXT;
ALTER TABLE public.organizations ALTER COLUMN nome_fantasia SET NOT NULL;


-- Coluna: numero_telefone -> VARCHAR(11) E torna NOT NULL
ALTER TABLE public.organizations ALTER COLUMN numero_telefone TYPE VARCHAR(11);
ALTER TABLE public.organizations ALTER COLUMN numero_telefone SET NOT NULL;


-- Coluna: cep -> torna NOT NULL (Mantém TEXT ou VARCHAR(8))
ALTER TABLE public.organizations ALTER COLUMN cep TYPE VARCHAR(8);
ALTER TABLE public.organizations ALTER COLUMN cep SET NOT NULL;


-- Coluna: numero (do endereço) -> VARCHAR(10) E torna NOT NULL
ALTER TABLE public.organizations ALTER COLUMN numero TYPE VARCHAR(10);
ALTER TABLE public.organizations ALTER COLUMN numero SET NOT NULL;


-- Coluna: complemento -> TEXT (Mantém como NULL)
ALTER TABLE public.organizations ALTER COLUMN complemento TYPE TEXT; 


-- Coluna: cidade -> TEXT (Mantém NOT NULL)
ALTER TABLE public.organizations ALTER COLUMN cidade TYPE TEXT;


-- Coluna: estado -> VARCHAR(2) (Mantém NOT NULL)
ALTER TABLE public.organizations ALTER COLUMN estado TYPE VARCHAR(2);


-- =========================================================
-- 4. CONSTRAINTS E INDEXES (Mudar a chave única de 'cnpj' para 'documento')
-- =========================================================

-- 4.1. DROP da CONSTRAINT UNIQUE antiga
ALTER TABLE public.organizations DROP CONSTRAINT organizations_cnpj_key;

-- 4.2. RECRIAÇÃO da CONSTRAINT UNIQUE na nova coluna 'documento'
ALTER TABLE public.organizations ADD CONSTRAINT organizations_documento_key UNIQUE (documento);

-- 4.3. Atualiza INDEXES
DROP INDEX IF EXISTS organizations_cnpj;
CREATE UNIQUE INDEX organizations_documento_idx ON public.organizations (documento);

DROP INDEX IF EXISTS organizations_state_code; 
CREATE INDEX organizations_estado_idx ON public.organizations (estado);


COMMIT;