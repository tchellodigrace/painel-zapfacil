
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

---
Task ID: 9
Agent: Super Z (main)
Task: Substituir logo da empresa (página de login + painel do cliente) pela nova logo em https://ibb.co/J47ns36

Work Log:
- Baixou página HTML de https://ibb.co/J47ns36 e extraiu URL direta da imagem: https://i.ibb.co/J47ns36/sf.png
- Baixou imagem PNG (180x180 RGBA, 16303 bytes)
- Criou scripts/replace-logo-empresa.js para otimizar via sharp (PNG compressionLevel 9)
- Substituiu /public/logo-empresa.png (antes 1536x1024, 135069 bytes -> agora 180x180, 5357 bytes)
- Build Next.js passou com sucesso (12 paginas, 9 rotas API)
- Commit 994b982 + push para origin/main

Stage Summary:
- /public/logo-empresa.png atualizada em todos os pontos de uso:
  * tela-login.tsx (loading + painel branding desktop + mobile)
  * portal-cliente.tsx (header glass do portal do cliente)
  * app/page.tsx (header da landing admin)
  * lib/utils-erp.ts (LOGO_URL usado em canvas/PDF)
- /public/logo-admin.png mantida intacta (logo anterior ja atualizada em tarefa separada)
- Logo e quadrada 180x180 - aparece centralizada em containers retangulares via object-contain
- Deploy automatico no Vercel em andamento
