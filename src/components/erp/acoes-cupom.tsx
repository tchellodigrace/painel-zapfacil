"use client";

import { useRef } from "react";
import { useERPStore } from "@/hooks/use-erp-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Send,
  Link2,
  Printer,
  Download,
} from "lucide-react";
import type { Venda } from "@/types";
import { obterChavePixLimpa } from "@/lib/utils-erp";
import CupomFiscal, { type CupomFiscalHandle } from "./cupom-fiscal";

interface AcoesCupomProps {
  vendaAtual: Venda | null;
}

export function AcoesCupom({ vendaAtual }: AcoesCupomProps) {
  const { empresa } = useERPStore();
  const cupomRef = useRef<CupomFiscalHandle>(null);
  const chavePixAtual = vendaAtual?.chavePix || "";
  const linkPagamento =
    vendaAtual && empresa.linkBaseMercadoPago && vendaAtual.total > 0
      ? `${empresa.linkBaseMercadoPago.replace(/^(https?:\/\/)?/, "https://")}?amount=${vendaAtual.total.toFixed(2)}`
      : "";

  const handleCompartilhar = async () => {
    if (!cupomRef.current || !vendaAtual) return;
    try {
      const canvas = await cupomRef.current.capturarImagem();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "comprovante.png", { type: "image/png" });
        let legenda = "";
        if (chavePixAtual) {
          legenda = `Chave Pix para cópia:\n\n${obterChavePixLimpa(chavePixAtual)}`;
        }
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          const shareData: ShareData = { files: [file], title: "ZapFácil" };
          if (legenda) shareData.text = legenda;
          await navigator.share(shareData);
        } else {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            toast.success("Imagem copiada! Cole no WhatsApp.");
            if (legenda) {
              window.open(
                `https://api.whatsapp.com/send?text=${encodeURIComponent(legenda)}`,
                "_blank"
              );
            }
          } catch {
            const link = document.createElement("a");
            link.download = "comprovante.png";
            link.href = canvas.toDataURL();
            link.click();
          }
        }
      }, "image/png");
    } catch (err) {
      toast.error("Erro ao gerar imagem do comprovante.");
    }
  };

  const handleCopiarPix = () => {
    if (!chavePixAtual) return;
    navigator.clipboard
      .writeText(obterChavePixLimpa(chavePixAtual))
      .then(() => toast.success("Chave Pix copiada!"));
  };

  const handleCopiarLink = () => {
    if (!linkPagamento) return;
    navigator.clipboard
      .writeText(linkPagamento)
      .then(() => toast.success("Link de cobrança copiado!"));
  };

  const handleImprimir = async () => {
    if (!cupomRef.current) return;
    const canvas = await cupomRef.current.capturarImagem();
    const janela = window.open("", "_blank");
    if (!janela) return;
    janela.document.write(`
      <html><head><title>Comprovante ZapFácil</title>
      <style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff;}
      img{max-width:100%;height:auto;}</style></head>
      <body><img src="${canvas.toDataURL()}" /></body></html>
    `);
    janela.document.close();
    janela.onload = () => {
      janela.print();
    };
  };

  const handleDownload = async () => {
    if (!cupomRef.current) return;
    const canvas = await cupomRef.current.capturarImagem();
    const link = document.createElement("a");
    link.download = `comprovante_${vendaAtual?.data || "data"}_${vendaAtual?.cliente?.replace(/\s/g, "_") || "cliente"}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success("Imagem baixada!");
  };

  const isPago = vendaAtual?.status === "PAGO";
  const showPix =
    vendaAtual && chavePixAtual && vendaAtual.formaPagamento === "PIX";

  return (
    <div className="space-y-3 flex flex-col items-center">
      <CupomFiscal ref={cupomRef} venda={vendaAtual} />

      <div className="w-full max-w-[340px] space-y-2 mx-auto">
        {showPix && (
          <div className="bg-primary/5 dark:bg-primary/20 border border-primary/20 dark:border-primary/40 rounded-xl p-3 text-center">
            <span className="block text-[10px] font-bold text-primary dark:text-primary/80 uppercase mb-1">
              Chave Pix (toque para copiar)
            </span>
            <div
              className="bg-white dark:bg-gray-900 border border-primary/30 dark:border-primary/40 rounded p-2 text-xs font-mono break-all select-all font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
              onClick={handleCopiarPix}
            >
              {obterChavePixLimpa(chavePixAtual)}
            </div>
          </div>
        )}

        {linkPagamento && (
          <Button
            variant="outline"
            className="w-full bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 h-11 text-xs font-bold uppercase"
            onClick={handleCopiarLink}
          >
            <Link2 className="h-4 w-4 mr-2" />
            Copiar Link de Cobrança
          </Button>
        )}

        <Button
          className={`w-full h-11 text-xs font-bold uppercase tracking-wider ${
            vendaAtual
              ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary dark:shadow-primary"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!vendaAtual}
          onClick={handleCompartilhar}
        >
          <Send className="h-4 w-4 mr-2" />
          {isPago ? "Enviar Comprovante" : "Enviar Cobrança"}
        </Button>

        {vendaAtual && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9"
              onClick={handleImprimir}
            >
              <Printer className="h-3 w-3 mr-1" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3 mr-1" />
              Baixar PNG
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}