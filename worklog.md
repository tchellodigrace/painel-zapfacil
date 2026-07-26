
---
Task ID: 8
Agent: Super Z (main)
Task: Integrar Supabase para autenticação multi-device

Work Log:
- Coletou credenciais Supabase do usuário (URL + publishable key)
- Instalou @supabase/supabase-js e bcryptjs (+ @types/bcryptjs)
- Criou supabase/schema.sql com 4 tabelas (clientes, sistemas, cobrancas, recuperacoes_senha) + RLS policies + triggers updated_at
- Criou src/lib/supabase.ts (client singleton server-side + client-side)
- Criou 5 API routes: /api/auth/login, /api/auth/registrar, /api/auth/recuperar, /api/sistemas (CRUD completo), /api/cobrancas (CRUD), /api/recuperacoes, /api/cliente/sistema (busca flags por email)
- Reescreveu tela-login.tsx: handleCriarConta, handleLogin, handleRecuperarSenha agora chamam APIs em vez de localStorage (UI mantida idêntica)
- Atualizou use-admin-store.ts: adicionou sincronizarDoSupabase() que busca sistemas/cobrancas do Supabase e mantém cache no localStorage
- Atualizou painel-admin.tsx: chama sincronizarDoSupabase() ao montar e ao ganhar foco da janela; handleSalvarNovo/Edicao/Remover agora sincronizam com Supabase
- Atualizou page.tsx (painel cliente): substituiu polling de localStorage (2s) por busca de feature flags no Supabase (15s) usando email do cliente logado
- Criou scripts/migrar-para-supabase.js (roda no console do navegador para migrar dados existentes)
- Build Next.js passou com sucesso (10 paginas, 9 rotas API)
- Commit + push para origin/main

Stage Summary:
- 13 arquivos criados/modificados
- 7 novas API routes
- 4 tabelas SQL com RLS
- Autenticação agora é multi-device (qualquer dispositivo acessa mesma conta)
- Senhas hasheadas com bcrypt (10 rounds)
- AGUARDANDO USUÁRIO: rodar schema.sql no Supabase + adicionar env vars no Vercel
