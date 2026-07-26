"use client";

import { useERPStore } from "@/hooks/use-erp-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, Plus, ImageOff, Download, Upload, Trash2 } from "lucide-react";
import { TIPOS_CHAVE_PIX } from "@/types";
import { validarChavePix, obterChavePixLimpa } from "@/lib/utils-erp";
import { useRef, useCallback } from "react";

export function EmpresaPanel() {
  const {
    empresa,
    chavesPix,
    atualizarEmpresa,
    salvarLogo,
    removerLogo,
    adicionarChavePix,
    definirChavePixAtiva,
    removerChavePix,
    exportarBackup,
    importarBackup,
  } = useERPStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Maximo 5MB.");
        return;
      }
      // Redimensiona para garantir qualidade minima no cupom/WhatsApp
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 800;
        let w = img.width;
        let h = img.height;
        if (w > MAX_SIZE || h > MAX_SIZE) {
          if (w > h) { h = Math.round((h / w) * MAX_SIZE); w = MAX_SIZE; }
          else { w = Math.round((w / h) * MAX_SIZE); h = MAX_SIZE; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL("image/png", 1.0);
        salvarLogo(base64);
        toast.success("Logo salva com sucesso!");
      };
      img.src = URL.createObjectURL(file);
    },
    [salvarLogo]
  );

  const handleAdicionarChave = useCallback(() => {
    const input = document.getElementById("novaChavePix") as HTMLInputElement;
    const tipoSelect = document.getElementById("tipoChavePix") as HTMLSelectElement;
    const valor = input?.value?.trim();
    const tipo = tipoSelect?.value || "CPF";

    if (!valor) {
      toast.error("Digite a chave PIX.");
      return;
    }
    if (!validarChavePix(tipo, valor)) {
      toast.error("Chave PIX inválida para o tipo selecionado.");
      return;
    }
    const ok = adicionarChavePix(tipo, valor);
    if (ok) {
      toast.success("Chave PIX adicionada!");
      if (input) input.value = "";
    }
  }, [adicionarChavePix]);

  const handleExportarBackup = useCallback(() => {
    const json = exportarBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zapfacil_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado com sucesso!");
  }, [exportarBackup]);

  const handleImportarBackup = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const json = ev.target?.result as string;
        const ok = importarBackup(json);
        if (ok) {
          toast.success("Dados importados! A página será recarregada...");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error("Arquivo de backup inválido.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [importarBackup]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-primary" />
            Dados da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Logo */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase">
              Logomarca
            </Label>
            <div className="flex gap-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-9"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-3 w-3 mr-1" />
                Arquivo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              {empresa.logoBase64 && (
                <div className="flex items-center gap-2">
                  <img
                    src={empresa.logoBase64}
                    alt="Logo"
                    className="h-9 w-9 rounded object-contain border"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 h-9 w-9 p-0"
                    onClick={() => {
                      removerLogo();
                      toast.success("Logo removida.");
                    }}
                  >
                    <ImageOff className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Campos Empresa */}
          <Input
            placeholder="Nome da Empresa"
            value={empresa.nome}
            onChange={(e) => atualizarEmpresa({ nome: e.target.value })}
            className="text-sm h-9"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Endereço"
              value={empresa.endereco}
              onChange={(e) => atualizarEmpresa({ endereco: e.target.value })}
              className="text-sm h-9"
            />
            <Input
              placeholder="Telefone"
              value={empresa.telefone}
              onChange={(e) => atualizarEmpresa({ telefone: e.target.value })}
              className="text-sm h-9"
            />
          </div>
          <Input
            placeholder="Link Base Mercado Pago (Opcional)"
            value={empresa.linkBaseMercadoPago}
            onChange={(e) =>
              atualizarEmpresa({ linkBaseMercadoPago: e.target.value })
            }
            className="text-sm h-9 border-amber-300 bg-amber-50/30 dark:bg-amber-950/20"
          />
        </CardContent>
      </Card>

      {/* PIX Keys */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            Chaves PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-1.5">
            <Select defaultValue="CPF">
              <SelectTrigger className="w-[90px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_CHAVE_PIX.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="novaChavePix"
              placeholder="Digite a chave"
              className="flex-1 text-xs h-9"
              onKeyDown={(e) => e.key === "Enter" && handleAdicionarChave()}
            />
            <Button
              size="sm"
              className="h-9 px-3 bg-primary hover:bg-primary/90"
              onClick={handleAdicionarChave}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {chavesPix.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {chavesPix.map((chave) => (
                <div
                  key={chave.id}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    chave.ativa
                      ? "border-primary/20 bg-primary/5 dark:bg-primary/20"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => definirChavePixAtiva(chave.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {chave.ativa && (
                      <Badge
                        variant="default"
                        className="bg-primary text-[10px] px-1.5 py-0 shrink-0"
                      >
                        ATIVA
                      </Badge>
                    )}
                    <span className="font-mono text-[11px] truncate">
                      {chave.tipo}: {obterChavePixLimpa(`${chave.tipo}: ${chave.valor}`)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removerChavePix(chave.id);
                      toast.success("Chave removida.");
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!chavesPix.length && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Nenhuma chave PIX cadastrada.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Backup/Restore */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9"
              onClick={handleExportarBackup}
            >
              <Download className="h-3 w-3 mr-1" />
              Exportar Backup
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9"
              onClick={() => backupInputRef.current?.click()}
            >
              <Upload className="h-3 w-3 mr-1" />
              Importar Backup
            </Button>
            <input
              ref={backupInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportarBackup}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}