/**
 * Migra dados do localStorage (navegador) para o Supabase.
 *
 * COMO USAR:
 * 1. Acesse o painel admin logado (https://my-project-rho-sooty.vercel.app/admin)
 * 2. Abra o Console do navegador (F12 → Console)
 * 3. Cole TODO o conteúdo deste arquivo e dê Enter
 *
 * O script vai:
 * - Ler todos os sistemas que você já tem no localStorage
 * - Para cada sistema, criar uma entrada na tabela `sistemas` do Supabase
 * - Para cada sistema com dadosRegistro (email/senha do cliente), criar entrada em `clientes`
 * - Reportar progresso no console
 *
 * RODE APENAS 1 VEZ. Depois disso, todos os dados novos vão direto pro Supabase.
 */
(async () => {
  const ADMIN_PREFIX = "zapfacil_admin_";
  const AUTH_KEY = "zapfacil_auth";

  console.log("=== Migração localStorage → Supabase ===");

  // 1. Ler sistemas do localStorage
  const sistemasRaw = localStorage.getItem(`${ADMIN_PREFIX}sistemas`);
  if (!sistemasRaw) {
    console.warn("⚠️  Nenhum sistema encontrado no localStorage.");
    return;
  }

  let sistemas;
  try {
    sistemas = JSON.parse(sistemasRaw);
  } catch (e) {
    console.error("❌ Erro ao parsear sistemas:", e);
    return;
  }

  console.log(`📋 ${sistemas.length} sistema(s) encontrado(s).`);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < sistemas.length; i++) {
    const s = sistemas[i];
    console.log(`\n[${i + 1}/${sistemas.length}] Migrando: ${s.empresa} (${s.email || "sem email"})`);

    // Verificar se tem dadosRegistro (login do cliente)
    let clienteId = null;

    if (s.dadosRegistro && s.dadosRegistro.email) {
      // 2a. Criar cliente no Supabase
      try {
        const resCliente = await fetch("/api/auth/registrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: s.dadosRegistro.email,
            senha: s.dadosRegistro.senha,
            nomeEmpresa: s.dadosRegistro.nomeEmpresa || s.empresa,
            nomeResponsavel: s.dadosRegistro.usuario || s.responsavel,
            telefone: s.dadosRegistro.telefone || s.telefone || "",
          }),
        });

        const dataCliente = await resCliente.json();

        if (resCliente.ok && dataCliente.ok) {
          clienteId = dataCliente.cliente.id;
          console.log(`  ✅ Cliente criado: ${dataCliente.cliente.email}`);
        } else {
          // Provavelmente email já existe — tentar login para pegar ID
          console.warn(`  ⚠️  Cliente não criado: ${dataCliente.error}. Pulando.`);
        }
      } catch (e) {
        console.error(`  ❌ Erro ao criar cliente:`, e);
      }
    }

    // 2b. Criar sistema no Supabase
    try {
      const resSistema = await fetch("/api/sistemas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa: s.empresa,
          responsavel: s.responsavel,
          telefone: s.telefone,
          email: s.email || s.dadosRegistro?.email || "",
          cidade: s.cidade,
          dataInstalacao: s.dataInstalacao,
          dataVencimento: s.dataVencimento,
          status: s.status,
          plano: s.plano,
          tipoLicenca: s.tipoLicenca,
          valorMensal: s.valorMensal,
          valorAquisicao: s.valorAquisicao,
          taxaInstalacao: s.taxaInstalacao,
          observacoes: s.observacoes,
          zapbotAtivo: !!s.zapbotAtivo,
          disparoAtivo: !!s.disparoAtivo,
          funilAtivo: !!s.funilAtivo,
          fluxosAtivo: !!s.fluxosAtivo,
        }),
      });

      const dataSistema = await resSistema.json();

      if (resSistema.ok && dataSistema.ok) {
        console.log(`  ✅ Sistema criado no Supabase`);
        success++;
      } else {
        console.error(`  ❌ Erro ao criar sistema:`, dataSistema.error);
        errors++;
      }
    } catch (e) {
      console.error(`  ❌ Erro ao criar sistema:`, e);
      errors++;
    }

    // Pequena pausa para não estourar rate limit
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n=== Migração concluída ===`);
  console.log(`✅ Sucesso: ${success}`);
  console.log(`⚠️  Pulados: ${skipped}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`\n📌 Próximo passo: faça logout e login novamente no admin para ver os dados sincronizados.`);
})();
