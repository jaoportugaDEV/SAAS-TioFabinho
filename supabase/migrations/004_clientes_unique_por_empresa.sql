-- Unicidade de email e CPF/CNPJ por empresa (multi-tenant)
-- Permite o mesmo email/CPF em empresas diferentes; evita duplicata dentro da mesma empresa.

-- Remover constraints globais antigas (se existirem)
ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS clientes_email_unique;
ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS clientes_cpf_cnpj_unique;

-- Índice único: (empresa_id, email) — mesmo email em empresas diferentes é permitido
CREATE UNIQUE INDEX IF NOT EXISTS clientes_empresa_email_unique
  ON public.clientes (empresa_id, email)
  WHERE empresa_id IS NOT NULL AND email IS NOT NULL AND email != '';

-- Índice único: (empresa_id, cpf_cnpj) — mesmo CPF/CNPJ em empresas diferentes é permitido
CREATE UNIQUE INDEX IF NOT EXISTS clientes_empresa_cpf_cnpj_unique
  ON public.clientes (empresa_id, cpf_cnpj)
  WHERE empresa_id IS NOT NULL AND cpf_cnpj IS NOT NULL AND cpf_cnpj != '';

COMMENT ON INDEX public.clientes_empresa_email_unique IS 'Email único por empresa (multi-tenant)';
COMMENT ON INDEX public.clientes_empresa_cpf_cnpj_unique IS 'CPF/CNPJ único por empresa (multi-tenant)';
