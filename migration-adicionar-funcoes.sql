-- Adicionar novas funções ao ENUM funcao_freelancer
-- Execute este script no SQL Editor do Supabase

-- Adicionar 'garcom' e 'recepcao' ao ENUM existente
ALTER TYPE funcao_freelancer ADD VALUE 'garcom';
ALTER TYPE funcao_freelancer ADD VALUE 'recepcao';

-- Verificar os valores do ENUM
-- SELECT enum_range(NULL::funcao_freelancer);

