"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Sparkles,
  Download,
  Instagram,
  Facebook,
  Loader2,
  RotateCcw,
  Image,
  Palette,
  Store,
  Wand2,
} from "lucide-react";

const TIPOS_NEGOCIO = [
  "Salao de Beleza",
  "Barbearia",
  "Restaurante",
  "Lanchonete",
  "Padaria",
  "Loja de Roupas",
  "Loja de Calcados",
  "Farmacia",
  "Pet Shop",
  "Academia",
  "Clinica Estetica",
  "Clinica Odontologica",
  "Oficina Mecanica",
  "Auto Eletrica",
  "Mercado / Supermercado",
  "Deposito de Materiais",
  "Loja de Presentes",
  "Floricultura",
  "Outro",
];

const ESTILOS = [
  { valor: "moderno-vibrante", label: "Moderno e Vibrante" },
  { valor: "elegante-premium", label: "Elegante e Premium" },
  { valor: "minimalista-limpo", label: "Minimalista e Limpo" },
  { valor: "divertido-colorido", label: "Divertido e Colorido" },
  { valor: "neon-esportivo", label: "Neon e Esportivo" },
  { valor: "vintage-retro", label: "Vintage e Retro" },
  { valor: "luxo-sofisticado", label: "Luxo e Sofisticado" },
  { valor: "pop-criativo", label: "Pop e Criativo" },
];

interface StoryGerado {
  imagem: string;
  mimeType: string;
}

export function GeradorStories() {
  const [tipoNegocio, setTipoNegocio] = useState("");
  const [outroTipo, setOutroTipo] = useState("");
  const [promocao, setPromocao] = useState("");
  const [estilo, setEstilo] = useState("");
  const [plataforma, setPlataforma] = useState<"instagram" | "facebook">("instagram");
  const [gerando, setGerando] = useState(false);
  const [story, setStory] = useState<StoryGerado | null>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const negocioFinal = tipoNegocio === "Outro" ? outroTipo : tipoNegocio;

  const podeGerar =
    negocioFinal.trim().length >= 2 &&
    promocao.trim().length >= 5 &&
    estilo &&
    !gerando;

  const handleGerar = useCallback(async () => {
    if (!podeGerar) return;

    setGerando(true);
    setStory(null);

    try {
      const res = await fetch("/api/gerar-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promocao: promocao.trim(),
          tipoNegocio: negocioFinal.trim(),
          tomEstilo:
            ESTILOS.find((e) => e.valor === estilo)?.label || estilo,
          plataforma,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro || "Erro ao gerar o story.");
        return;
      }

      if (data.imagem) {
        setStory({ imagem: data.imagem, mimeType: data.mimeType });
        toast.success("Story gerado com sucesso!");
      } else {
        toast.error("A API nao retornou uma imagem. Tente novamente.");
      }
    } catch {
      toast.error("Erro de conexao. Verifique sua internet.");
    } finally {
      setGerando(false);
    }
  }, [podeGerar, promocao, negocioFinal, estilo, plataforma]);

  const handleDownload = useCallback(() => {
    if (!story || !downloadRef.current) return;
    downloadRef.current.href = `data:${story.mimeType};base64,${story.imagem}`;
    downloadRef.current.download = `story-${plataforma}-${Date.now()}.png`;
    downloadRef.current.click();
  }, [story, plataforma]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Gerador de Stories
          </h2>
          <p className="text-xs text-gray-500">
            Crie artes profissionais para Instagram e Facebook com IA
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-5 space-y-4">
            {/* Plataforma */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Image className="h-3.5 w-3.5 text-gray-400" />
                Plataforma
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlataforma("instagram")}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    plataforma === "instagram"
                      ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                  }`}
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </button>
                <button
                  type="button"
                  onClick={() => setPlataforma("facebook")}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    plataforma === "facebook"
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                  }`}
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </button>
              </div>
            </div>

            {/* Tipo de Negocio */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-gray-400" />
                Tipo de Negocio
              </Label>
              <Select
                value={tipoNegocio}
                onValueChange={setTipoNegocio}
              >
                <SelectTrigger className="text-sm h-9">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_NEGOCIO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tipoNegocio === "Outro" && (
                <Input
                  value={outroTipo}
                  onChange={(e) => setOutroTipo(e.target.value)}
                  placeholder="Digite o tipo de negocio..."
                  className="text-sm h-9 mt-2"
                />
              )}
            </div>

            {/* Promocao */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-gray-400" />
                Promocao *
              </Label>
              <Textarea
                value={promocao}
                onChange={(e) => setPromocao(e.target.value)}
                placeholder="Descreva a promocao. Ex: 30% de desconto em cortes femininos na sexta-feira, de 8h as 18h. Vagas limitadas!"
                className="text-sm min-h-[80px]"
              />
              <p className="text-[10px] text-gray-400">
                Quanto mais detalhes, melhor o resultado da arte.
              </p>
            </div>

            {/* Estilo Visual */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-gray-400" />
                Estilo Visual
              </Label>
              <Select value={estilo} onValueChange={setEstilo}>
                <SelectTrigger className="text-sm h-9">
                  <SelectValue placeholder="Selecione o estilo..." />
                </SelectTrigger>
                <SelectContent>
                  {ESTILOS.map((e) => (
                    <SelectItem key={e.valor} value={e.valor}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botao Gerar */}
            <Button
              onClick={handleGerar}
              disabled={!podeGerar}
              className="w-full h-11 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium text-sm rounded-xl disabled:opacity-50"
            >
              {gerando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando seu story...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Story com IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-4">
          <div
            className="relative mx-auto bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-2 shadow-xl"
            style={{ maxWidth: "300px" }}
          >
            {/* Moldura do celular */}
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              {/* Notch */}
              <div className="flex justify-center pt-1.5 pb-1">
                <div className="w-16 h-1 bg-gray-700 rounded-full" />
              </div>
              {/* Tela do story */}
              <div
                className="relative bg-gray-800 flex items-center justify-center overflow-hidden"
                style={{ aspectRatio: "9/16" }}
              >
                {gerando ? (
                  <div className="flex flex-col items-center gap-3 p-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 animate-pulse" />
                      <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-pink-400 animate-spin" />
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      A IA esta criando sua arte...
                      <br />
                      <span className="text-[10px] text-gray-500">
                        Isso pode levar alguns segundos
                      </span>
                    </p>
                  </div>
                ) : story ? (
                  <img
                    src={`data:${story.mimeType};base64,${story.imagem}`}
                    alt="Story gerado"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center">
                      <Image className="h-8 w-8 text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Preencha os dados ao lado
                      <br />
                      e clique em &quot;Gerar Story&quot;
                    </p>
                  </div>
                )}
              </div>
              {/* Barra inferior */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-900">
                <div className="w-8 h-8 rounded-full bg-gray-800" />
                <div className="flex gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gray-800" />
                  <div className="w-6 h-6 rounded-full bg-gray-800" />
                  <div className="w-6 h-6 rounded-full bg-gray-800" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-800" />
              </div>
            </div>
          </div>

          {/* Acoes abaixo do preview */}
          {story && (
            <div className="flex gap-2 justify-center" style={{ maxWidth: "300px", margin: "0 auto" }}>
              <Button
                onClick={handleGerar}
                disabled={gerando}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Gerar Outro
              </Button>
              <Button
                onClick={handleDownload}
                size="sm"
                className="flex-1 text-xs bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Baixar Imagem
              </Button>
              <a
                ref={downloadRef}
                className="hidden"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
