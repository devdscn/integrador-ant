-- migration: Adiciona a coluna 'logradouro' à tabela organizations

BEGIN;

-- 1. ADICIONA A COLUNA COM UM VALOR PADRÃO E SEM A RESTRIÇÃO NOT NULL TEMPORARIAMENTE
-- Isso é feito para evitar falhas em tabelas grandes que já possuem dados.
ALTER TABLE public.organizations
    ADD COLUMN logradouro character varying(50) DEFAULT 'Rua não informada';

-- 2. ATUALIZA LINHAS EXISTENTES
-- Garante que todas as linhas que por algum motivo ficaram com logradouro NULL (o que não deve acontecer
-- com o DEFAULT, mas é uma boa prática) recebam o valor padrão antes de aplicar o NOT NULL.
UPDATE public.organizations
SET logradouro = 'Rua não informada'
WHERE logradouro IS NULL;


-- 3. APLICA A RESTRIÇÃO NOT NULL
-- Agora que todas as linhas têm um valor (padrão ou fornecido), a restrição pode ser aplicada.
ALTER TABLE public.organizations
    ALTER COLUMN logradouro SET NOT NULL;


-- 4. REMOVE O VALOR PADRÃO
-- O valor padrão não é mais necessário depois de aplicar o NOT NULL (opcional, mas recomendado para limpeza).
-- ALTER TABLE public.organizations
--     ALTER COLUMN logradouro DROP DEFAULT;


COMMIT;