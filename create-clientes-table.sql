-- Script de criação da tabela de clientes
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50),
  cpf_cnpj VARCHAR(20),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  data_nascimento DATE,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para performance
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);

-- Habilitar Row Level Security
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Criar política RLS
CREATE POLICY "Permitir acesso completo para usuários autenticados"
  ON clientes FOR ALL
  USING (auth.role() = 'authenticated');

-- Adicionar coluna de referência ao cliente na tabela festas
ALTER TABLE festas 
ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;

-- Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_festas_cliente ON festas(cliente_id);

-- Comentários sobre as colunas
COMMENT ON TABLE clientes IS 'Tabela de clientes do buffet com histórico de festas';
COMMENT ON COLUMN clientes.nome IS 'Nome completo do cliente';
COMMENT ON COLUMN clientes.telefone IS 'Telefone principal do cliente (obrigatório)';
COMMENT ON COLUMN clientes.whatsapp IS 'WhatsApp do cliente (se diferente do telefone)';
COMMENT ON COLUMN clientes.ativo IS 'Indica se o cliente está ativo no sistema';
COMMENT ON COLUMN festas.cliente_id IS 'Referência ao cliente (null para festas antigas)';
