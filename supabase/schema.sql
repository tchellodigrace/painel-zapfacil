-- =====================================================
-- ZapFácil Pro - Schema Supabase
-- =====================================================
-- Execute este script no SQL Editor do Supabase:
-- Dashboard → SQL Editor → New query → cole tudo → Run
-- =====================================================

-- =====================================================
-- 1. TABELA: clientes
-- =====================================================
-- Substitui o antigo zapfacil_auth do localStorage.
-- Cada linha = 1 cliente do ERP (login do painel /).
-- =====================================================

CREATE TABLE IF NOT EXISTS public.clientes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE LOWER,
  senha_hash      TEXT NOT NULL,
  nome_empresa    TEXT NOT NULL,
  nome_responsavel TEXT NOT NULL,
  telefone        TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes (email);

-- =====================================================
-- 2. TABELA: sistemas
-- =====================================================
-- Substitui o zapfacil_admin_sistemas do localStorage.
-- Cada linha = 1 sistema/instalação visível no admin.
-- Pode ter N sistemas por cliente (multi-tenant).
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sistemas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id        UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  empresa           TEXT NOT NULL,
  responsavel       TEXT,
  telefone          TEXT,
  email             TEXT,
  cidade            TEXT DEFAULT '',
  data_instalacao   DATE,
  data_vencimento   DATE,
  status            TEXT NOT NULL DEFAULT 'TRIAL',
  plano             TEXT NOT NULL DEFAULT 'PRO',
  tipo_licenca      TEXT NOT NULL DEFAULT 'ALUGUEL',
  valor_mensal      NUMERIC(10,2) DEFAULT 0,
  valor_aquisicao   NUMERIC(10,2) DEFAULT 0,
  taxa_instalacao   NUMERIC(10,2) DEFAULT 0,
  observacoes       TEXT DEFAULT '',
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Feature flags Premium (espelha interface do admin store)
  zapbot_ativo      BOOLEAN NOT NULL DEFAULT false,
  disparo_ativo     BOOLEAN NOT NULL DEFAULT false,
  funil_ativo       BOOLEAN NOT NULL DEFAULT false,
  fluxos_ativo      BOOLEAN NOT NULL DEFAULT false,
  -- Payload livre para campos extras do admin store que não casam direto
  dados_extra       JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sistemas_email ON public.sistemas (email);
CREATE INDEX IF NOT EXISTS idx_sistemas_status ON public.sistemas (status);

-- =====================================================
-- 3. TABELA: cobrancas
-- =====================================================
-- Substitui o array cobrancas do admin store.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cobrancas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sistema_id        UUID REFERENCES public.sistemas(id) ON DELETE CASCADE,
  descricao         TEXT NOT NULL,
  tipo              TEXT NOT NULL DEFAULT 'MENSALIDADE',
  status            TEXT NOT NULL DEFAULT 'PENDENTE',
  forma_pagamento   TEXT DEFAULT '',
  valor             NUMERIC(10,2) NOT NULL DEFAULT 0,
  vencimento        DATE,
  pago_em           DATE,
  observacoes       TEXT DEFAULT '',
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cobrancas_sistema ON public.cobrancas (sistema_id);
CREATE INDEX IF NOT EXISTS idx_cobrancas_status ON public.cobrancas (status);

-- =====================================================
-- 4. TABELA: recuperacoes_senha
-- =====================================================
-- Pedidos de recuperação de senha enviados pelo cliente.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.recuperacoes_senha (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL,
  telefone          TEXT,
  resolvido         BOOLEAN NOT NULL DEFAULT false,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recuperacoes_resolvido ON public.recuperacoes_senha (resolvido);

-- =====================================================
-- 5. TRIGGER: updated_at automático
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clientes_updated ON public.clientes;
CREATE TRIGGER trg_clientes_updated
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_sistemas_updated ON public.sistemas;
CREATE TRIGGER trg_sistemas_updated
  BEFORE UPDATE ON public.sistemas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_cobrancas_updated ON public.cobrancas;
CREATE TRIGGER trg_cobrancas_updated
  BEFORE UPDATE ON public.cobrancas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Regra de ouro: a anon key (frontend) NUNCA pode ler
-- dados sensíveis. Tudo passa pelas API routes (server-side)
-- que usam a service_role key.
-- =====================================================

ALTER TABLE public.clientes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sistemas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobrancas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recuperacoes_senha  ENABLE ROW LEVEL SECURITY;

-- Políticas DENY por padrão (tudo bloqueado para anon key)
-- Operações reais acontecem server-side via service_role,
-- que ignora RLS.

-- Políticas permissivas APENAS para inserção de cliente (registro público)
-- Login/validação de senha é feito server-side.
CREATE POLICY "permite_registro_publico_clientes"
  ON public.clientes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Recuperação de senha: qualquer um pode criar pedido
CREATE POLICY "permite_criar_recuperacao"
  ON public.recuperacoes_senha
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Negar SELECT/UPDATE/DELETE para anon em todas as tabelas
-- (não criamos política = deny por padrão quando RLS está ativo)
-- A service_role bypassa RLS automaticamente.

-- =====================================================
-- 7. COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE public.clientes IS 'Clientes do ERP (login do painel /)';
COMMENT ON TABLE public.sistemas IS 'Sistemas/instalações gerenciados pelo admin';
COMMENT ON TABLE public.cobrancas IS 'Cobranças (mensalidade, aquisição, taxa, suporte)';
COMMENT ON TABLE public.recuperacoes_senha IS 'Pedidos de recuperação de senha';

-- =====================================================
-- FIM
-- =====================================================
