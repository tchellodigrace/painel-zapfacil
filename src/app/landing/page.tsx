"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Zap,
  Bot,
  Users,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  ArrowRight,
  Check,
  Star,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Clock,
  Globe,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const NAV_LINKS = [
  { label: "Recursos", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Planos", href: "#planos" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Contato", href: "#contato" },
];

const RECURSOS = [
  {
    icon: Bot,
    titulo: "Chatbot Inteligente",
    descricao:
      "Crie menus automáticos, respostas rápidas e fluxos de atendimento 24/7 sem programar nada. Seu cliente recebe resposta na hora, de dia ou de noite.",
    cor: "from-blue-500 to-blue-600",
  },
  {
    icon: Zap,
    titulo: "Disparo em Massa",
    descricao:
      "Envie mensagens para milhares de contatos de uma vez, com personalização por variável. Agende disparos e acompanhe métricas em tempo real.",
    cor: "from-cyan-500 to-blue-500",
  },
  {
    icon: Users,
    titulo: "Funil de Leads",
    descricao:
      "Acompanhe cada oportunidade do primeiro contato até o fechamento. Arraste e solte cards entre etapas, atribua responsáveis e nunca mais perca venda.",
    cor: "from-violet-500 to-purple-600",
  },
  {
    icon: BarChart3,
    titulo: "Fluxos de Automação",
    descricao:
      "Construa jornadas completas: boas-vindas, recuperação de carrinho, follow-up automático. Tudo visual, com gatilhos e condições poderosas.",
    cor: "from-amber-500 to-orange-500",
  },
  {
    icon: Calendar,
    titulo: "Agendamento Integrado",
    descricao:
      "Cliente marca horário direto pelo WhatsApp, com lembrete automático antes do horário. Reduz faltas em até 70%.",
    cor: "from-emerald-500 to-teal-500",
  },
  {
    icon: ShieldCheck,
    titulo: "Segurança e LGPD",
    descricao:
      "Dados criptografados, backups automáticos e conformidade com a LGPD. Você no controle total das informações dos seus clientes.",
    cor: "from-rose-500 to-pink-500",
  },
];

const DEPOIMENTOS = [
  {
    nome: "João Silva",
    empresa: "Barbearia do João",
    foto: "JS",
    texto:
      "Depois que comecei a usar o ZapBot Pro, meus faturamento cresceu 40% em 3 meses. Os clientes marcam horário pelo WhatsApp sozinhos, sem precisar de atendente.",
    estrelas: 5,
  },
  {
    nome: "Marina Costa",
    empresa: "Clínica Vida Bela",
    foto: "MC",
    texto:
      "O disparo em massa é perfeito. Aviso todos os pacientes sobre promoções e campanhas de vacinação em segundos. Antes levava dias para contato todos.",
    estrelas: 5,
  },
  {
    nome: "Carlos Eduardo",
    empresa: "Auto Peças CE",
    foto: "CE",
    texto:
      "O funil de leads me ajudou a organizar tudo. Hoje sei exatamente em que etapa está cada cliente e quando preciso dar um retorno. Recomendo demais.",
    estrelas: 5,
  },
];

const PLANOS = [
  {
    nome: "Trial",
    preco: "Grátis",
    periodo: "7 dias",
    descricao: "Teste todos os recursos sem compromisso",
    recursos: [
      "Todas as funcionalidades liberadas",
      "1 número de WhatsApp",
      "Até 100 disparos por dia",
      "Suporte por e-mail",
      "Sem cartão de crédito",
    ],
    cta: "Começar grátis",
    destaque: false,
  },
  {
    nome: "PRO",
    preco: "R$ 97",
    periodo: "/mês",
    descricao: "Para pequenas e médias empresas crescerem",
    recursos: [
      "Todas as funcionalidades",
      "1 número de WhatsApp",
      "Disparos ilimitados",
      "Funil de leads completo",
      "Fluxos de automação",
      "Suporte prioritário",
      "Relatórios avançados",
    ],
    cta: "Assinar PRO",
    destaque: true,
  },
  {
    nome: "Enterprise",
    preco: "R$ 297",
    periodo: "/mês",
    descricao: "Para times que precisam de escala",
    recursos: [
      "Tudo do PRO",
      "Até 5 números de WhatsApp",
      "Múltiplos usuários",
      "API de integração",
      "Gerente de conta dedicado",
      "Onboarding personalizado",
      "SLA de 99,9%",
    ],
    cta: "Falar com vendas",
    destaque: false,
  },
];

export default function LandingPage() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ====== HEADER ====== */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass border-b border-border shadow-sticky"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/landing" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">
                ZapBot Pro
              </span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Ações */}
            <div className="flex items-center gap-2">
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Link href="/" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/" className="hidden sm:block">
                <Button size="sm">
                  Começar grátis
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>

              {/* Menu mobile */}
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="md:hidden p-2 text-foreground hover:bg-secondary rounded-md"
              >
                {menuAberto ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile aberto */}
        {menuAberto && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuAberto(false)}
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"
                >
                  {link.label}
                </a>
              ))}
              <Link href="/" className="block pt-2">
                <Button className="w-full" size="sm">
                  Começar grátis
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ====== HERO ====== */}
      <section className="relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-info/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,147,206,0.08),transparent_60%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">
                Novo: IA generativa para respostas automáticas
              </span>
            </div>

            {/* Título */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
              Automatize seu{" "}
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                WhatsApp
              </span>{" "}
              e dobre suas vendas
            </h1>

            {/* Subtítulo */}
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Chatbot inteligente, disparo em massa, funil de leads e fluxos de
              automação em um só painel. Comece grátis em 2 minutos, sem cartão
              de crédito.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto h-12 px-6 text-base">
                  Começar grátis agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-6 text-base"
                >
                  Ver como funciona
                </Button>
              </a>
            </div>

            {/* Trust signals */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" />
                <span>7 dias grátis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" />
                <span>Cancelamento a qualquer momento</span>
              </div>
            </div>

            {/* Preview mockup */}
            <div className="mt-16 relative">
              <div className="relative rounded-2xl border border-border bg-card shadow-card-hover overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-secondary/50">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-3 text-xs text-muted-foreground font-mono">
                    painel.zapbotpro.com.br
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 text-left">
                  {[
                    { label: "Mensagens hoje", valor: "1.247", delta: "+12%" },
                    { label: "Disparos enviados", valor: "8.453", delta: "+34%" },
                    { label: "Taxa de abertura", valor: "92%", delta: "+5%" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-4 rounded-lg border border-border bg-background"
                    >
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stat.valor}
                      </p>
                      <p className="text-xs text-success mt-1">{stat.delta}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== LOGOS / STATS ====== */}
      <section className="border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { valor: "+5.000", label: "Empresas ativas" },
              { valor: "+2M", label: "Mensagens enviadas/mês" },
              { valor: "98%", label: "Satisfação dos clientes" },
              { valor: "24/7", label: "Suporte disponível" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-primary">
                  {stat.valor}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== RECURSOS ====== */}
      <section id="recursos" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Tudo que você precisa para{" "}
              <span className="text-primary">escalar seu atendimento</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Uma plataforma completa, fácil de usar e poderosa o suficiente para
              substituir dezenas de ferramentas caras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RECURSOS.map((recurso) => (
              <div
                key={recurso.titulo}
                className="group p-6 rounded-xl border border-border bg-card hover:shadow-card-hover hover:border-primary/40 transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${recurso.cor} flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform`}
                >
                  <recurso.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {recurso.titulo}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {recurso.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== COMO FUNCIONA ====== */}
      <section
        id="como-funciona"
        className="py-20 sm:py-28 bg-secondary/30 border-y border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Comece em <span className="text-primary">3 passos simples</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Do cadastro ao primeiro disparo em menos de 5 minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                passo: "01",
                titulo: "Crie sua conta",
                descricao:
                  "Cadastre-se grátis em 2 minutos. Sem cartão de crédito, sem burocracia.",
                icon: Users,
              },
              {
                passo: "02",
                titulo: "Conecte seu WhatsApp",
                descricao:
                  "Escaneie o QR code e seu número estará conectado. Mantemos a sessão ativa 24/7.",
                icon: MessageCircle,
              },
              {
                passo: "03",
                titulo: "Configure e dispare",
                descricao:
                  "Crie fluxos, dispare mensagens e acompanhe resultados em tempo real no painel.",
                icon: Zap,
              },
            ].map((step, idx) => (
              <div key={step.passo} className="relative">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-px border-t border-dashed border-border" />
                )}
                <div className="relative flex flex-col items-start">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-sm mb-4">
                    {step.passo}
                  </div>
                  <step.icon className="h-6 w-6 text-primary mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PLANOS ====== */}
      <section id="planos" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Planos{" "}
              <span className="text-primary">simples e transparentes</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Escolha o plano ideal para o seu momento. Troque ou cancele quando
              quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {PLANOS.map((plano) => (
              <div
                key={plano.nome}
                className={`relative p-6 rounded-2xl border bg-card transition-all duration-200 ${
                  plano.destaque
                    ? "border-primary shadow-card-hover scale-105 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:shadow-card-hover"
                }`}
              >
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Mais popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-foreground">
                  {plano.nome}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {plano.descricao}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plano.preco}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plano.periodo}
                  </span>
                </div>
                <Link href="/" className="block mt-6">
                  <Button
                    variant={plano.destaque ? "default" : "outline"}
                    className="w-full"
                  >
                    {plano.cta}
                  </Button>
                </Link>
                <ul className="mt-6 space-y-3">
                  {plano.recursos.map((recurso) => (
                    <li
                      key={recurso}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span>{recurso}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== DEPOIMENTOS ====== */}
      <section
        id="depoimentos"
        className="py-20 sm:py-28 bg-secondary/30 border-y border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Empresas que{" "}
              <span className="text-primary">cresceram com a gente</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Mais de 5.000 negócios já automatizaram seu WhatsApp com o ZapBot
              Pro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map((dep) => (
              <div
                key={dep.nome}
                className="p-6 rounded-xl border border-border bg-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: dep.estrelas }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-warning text-warning"
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">
                  &quot;{dep.texto}&quot;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {dep.foto}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {dep.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dep.empresa}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA FINAL ====== */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-info p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Pronto para automatizar seu WhatsApp?
              </h2>
              <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
                Junte-se a mais de 5.000 empresas que já economizam tempo e
                vendem mais com o ZapBot Pro.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 px-8 text-base bg-white text-primary hover:bg-white/90"
                  >
                    Começar grátis agora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#contato">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 text-base border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50"
                  >
                    Falar com especialista
                  </Button>
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Setup em 5 minutos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  <span>Funciona em qualquer país</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CONTATO ====== */}
      <section id="contato" className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Fale com a{" "}
                <span className="text-primary">nossa equipe</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Tire dúvidas, peça uma demonstração ou conheça nossos planos
                personalizados para grandes operações.
              </p>
              <div className="mt-8 space-y-4">
                <a
                  href="mailto:contato@zapbotpro.com.br"
                  className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">E-mail</p>
                    <p className="text-sm font-medium">
                      contato@zapbotpro.com.br
                    </p>
                  </div>
                </a>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <p className="text-sm font-medium">(11) 99999-9999</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Formulário */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-card">
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Nome
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    className="mt-1.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="voce@empresa.com"
                    className="mt-1.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Mensagem
                  </label>
                  <textarea
                    placeholder="Como podemos ajudar?"
                    rows={4}
                    className="mt-1.5 w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Enviar mensagem
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-base font-bold text-foreground">
                  ZapBot Pro
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                A plataforma completa para automatizar seu WhatsApp e escalar
                seu atendimento sem contratar mais gente.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Produto
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#recursos"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Recursos
                  </a>
                </li>
                <li>
                  <a
                    href="#planos"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Planos
                  </a>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Painel admin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Empresa
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#contato"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Contato
                  </a>
                </li>
                <li>
                  <a
                    href="#depoimentos"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clientes
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Carreiras
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} ZapBot Pro. Todos os direitos
              reservados.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Privacidade
              </a>
              <a
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Termos
              </a>
              <a
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
