-- =====================================================
-- ZapFácil Pro - Schema ZapBot
-- =====================================================
-- Execute este script no SQL Editor do Supabase:
-- Dashboard → SQL Editor → New query → cole tudo → Run
-- =====================================================

-- =====================================================
-- 1. TABELA: zapbot_global_config
-- =====================================================
-- Configuração GLOBAL do servidor Evolution API.
-- Uma única linha (id=1) com URL, instância e API key.
-- O admin configura isso UMA VEZ quando sobe a Evolution API.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.zapbot_global_config (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  api_url         TEXT NOT NULL,
  instance_name   TEXT NOT NULL,
  api_key         TEXT NOT NULL DEFAULT '',
  ativo           BOOLEAN NOT NULL DEFAULT true,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT only_one_row CHECK (id = 1)
);

-- Inserir linha padrão (vazia) para garantir que sempre exista
INSERT INTO public.zapbot_global_config (id, api_url, instance_name, ativo)
VALUES (1, '', '', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. TABELA: zapbot_clientes
-- =====================================================
-- Configuração do ZapBot POR CLIENTE.
-- Uma linha por sistema/cliente. Contém:
--  - conexao (numero_conectado, conectado)
--  - mensagens (boas-vindas, fora horário)
--  - horário de atendimento
--  - menu ativo + titulo
--  - ultima mensagem recebida (log simplificado)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.zapbot_clientes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sistema_id              UUID NOT NULL REFERENCES public.sistemas(id) ON DELETE CASCADE,
  conectado               BOOLEAN NOT NULL DEFAULT false,
  numero_conectado        TEXT,
  mensagem_boas_vindas    TEXT NOT NULL DEFAULT '',
  mensagem_fora_horario   TEXT NOT NULL DEFAULT '',
  ativar_boas_vindas      BOOLEAN NOT NULL DEFAULT false,
  ativar_fora_horario     BOOLEAN NOT NULL DEFAULT false,
  horario_inicio          TEXT NOT NULL DEFAULT '08:00',
  horario_fim             TEXT NOT NULL DEFAULT '18:00',
  menu_ativo              BOOLEAN NOT NULL DEFAULT false,
  titulo_menu             TEXT NOT NULL DEFAULT 'Menu',
  ultima_mensagem         TEXT,
  ultima_mensagem_data    TIMESTAMPTZ,
  criado_em               TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unico_zapbot_por_sistema UNIQUE (sistema_id)
);

CREATE INDEX IF NOT EXISTS idx_zapbot_clientes_sistema ON public.zapbot_clientes (sistema_id);

-- =====================================================
-- 3. TABELA: zapbot_respostas
-- =====================================================
-- Respostas automáticas por palavra-chave (por cliente).
-- Ex: gatilho="preço" → resposta="Nosso valor é R$ 50"
-- =====================================================

CREATE TABLE IF NOT EXISTS public.zapbot_respostas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zapbot_cliente_id   UUID NOT NULL REFERENCES public.zapbot_clientes(id) ON DELETE CASCADE,
  gatilho             TEXT NOT NULL,
  resposta            TEXT NOT NULL,
  ativo               BOOLEAN NOT NULL DEFAULT true,
  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zapbot_respostas_cliente ON public.zapbot_respostas (zapbot_cliente_id);

-- =====================================================
-- 4. TABELA: zapbot_menu_itens
-- =====================================================
-- Itens do menu interativo (por cliente).
-- Ex: numero=1, texto="Horários", resposta="Seg-Sex 8h-18h"
-- =====================================================

CREATE TABLE IF NOT EXISTS public.zapbot_menu_itens (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zapbot_cliente_id   UUID NOT NULL REFERENCES public.zapbot_clientes(id) ON DELETE CASCADE,
  numero              INTEGER NOT NULL,
  texto               TEXT NOT NULL,
  resposta            TEXT NOT NULL,
  ativo               BOOLEAN NOT NULL DEFAULT true,
  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unico_numero_por_menu UNIQUE (zapbot_cliente_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_zapbot_menu_itens_cliente ON public.zapbot_menu_itens (zapbot_cliente_id);

-- =====================================================
-- 5. TABELA: zapbot_log_mensagens
-- =====================================================
-- Log de mensagens trocadas pelo bot (por cliente).
-- Últimas N mensagens recebidas/enviadas pelo bot.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.zapbot_log_mensagens (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zapbot_cliente_id   UUID NOT NULL REFERENCES public.zapbot_clientes(id) ON DELETE CASCADE,
  numero              TEXT NOT NULL,
  nome                TEXT,
  tipo                TEXT NOT NULL DEFAULT 'recebida' CHECK (tipo IN ('enviada', 'recebida')),
  conteudo            TEXT NOT NULL,
  data_hora           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zapbot_log_cliente ON public.zapbot_log_mensagens (zapbot_cliente_id, data_hora DESC);

-- =====================================================
-- Comentários para documentação
-- =====================================================

COMMENT ON TABLE public.zapbot_global_config IS 'Config global do servidor Evolution API (1 linha só, id=1). O admin define quando sobe a Evolution API na Oracle Cloud.';
COMMENT ON TABLE public.zapbot_clientes IS 'Config do ZapBot por cliente. 1 linha por sistema. Contém mensagens, horário, menu, status de conexão.';
COMMENT ON TABLE public.zapbot_respostas IS 'Respostas automáticas por palavra-chave (gatilho → resposta).';
COMMENT ON TABLE public.zapbot_menu_itens IS 'Itens do menu interativo (1=Horários, 2=Valores, etc).';
COMMENT ON TABLE public.zapbot_log_mensagens IS 'Log de mensagens trocadas pelo bot. Últimas N mensagens.';
