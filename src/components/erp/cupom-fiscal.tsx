"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import type { Venda } from "@/types";
import { useERPStore } from "@/hooks/use-erp-store";
import { formatarMoeda, obterChavePixLimpa } from "@/lib/utils-erp";
import { Badge } from "@/components/ui/badge";

export interface CupomFiscalHandle {
  capturarImagem: () => Promise<HTMLCanvasElement>;
  obterDados: () => Venda | null;
}

interface CupomFiscalProps {
  venda?: Venda | null;
}

const CupomFiscal = forwardRef<CupomFiscalHandle, CupomFiscalProps>(
  ({ venda }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const vendaRef = useRef<Venda | null>(venda || null);

    // Keep vendaRef updated
    if (venda) vendaRef.current = venda;

    useImperativeHandle(ref, () => ({
      capturarImagem: async () => {
        const html2canvas = (await import("html2canvas")).default;
        if (!containerRef.current) throw new Error("Cupom não encontrado");
        return html2canvas(containerRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
      },
      obterDados: () => vendaRef.current,
    }));

    if (!venda) {
      return (
        <div
          ref={containerRef}
          className="bg-white dark:bg-gray-900 p-5 shadow-md border border-gray-300 dark:border-gray-700 w-full max-w-[340px] mx-auto rounded-lg"
        >
          <div className="text-center text-xs text-muted-foreground py-12">
            <p className="text-2xl mb-2">📄</p>
            <p>Nenhum comprovante gerado ainda.</p>
            <p className="text-[10px] mt-1">
              Preencha o formulário e processe uma venda.
            </p>
          </div>
        </div>
      );
    }

    const isPago = venda.status === "PAGO";
    const chavePixLimpa = obterChavePixLimpa(venda.chavePix);

    return (
      <div
        ref={containerRef}
        className="bg-white p-4 sm:p-5 shadow-md border border-gray-300 w-full max-w-[340px] mx-auto text-gray-800 font-mono text-[11px] uppercase relative leading-relaxed text-left"
      >
        {/* Status Badge */}
        <div
          className={`text-center font-sans font-black text-[10px] py-1 rounded mb-3 tracking-widest text-white ${
            isPago ? "bg-emerald-600" : "bg-amber-500 text-amber-950"
          }`}
        >
          {isPago ? "COMPROVANTE DE PAGAMENTO" : "FATURA DE SERVIÇO"}
        </div>

        {/* Logo */}
        {venda.empresa && (
          <div className="text-center mb-2">
            {venda.logoBase64 && (
              <img
                src={venda.logoBase64}
                alt="Logo"
                className="max-h-14 max-w-[150px] object-contain mx-auto block mb-2"
              />
            )}
            <div className="font-bold text-center text-xs tracking-wide">
              {venda.empresa}
            </div>
            {venda.endereco && (
              <div className="text-center text-[9px] text-gray-500">
                {venda.endereco}
              </div>
            )}
            {venda.telefone && (
              <div className="text-center text-[9px] text-gray-500">
                TEL: {venda.telefone}
              </div>
            )}
          </div>
        )}

        <div className="border-b border-dashed border-gray-400 my-2" />

        <div className="flex justify-between text-[9px] text-gray-600">
          <span>DATA: {venda.data}</span>
          <span>HORA: {venda.hora}</span>
        </div>

        <div className="border-b border-dashed border-gray-400 my-2" />

        {/* Cliente */}
        <div className="bg-gray-50 p-2 rounded border border-gray-200 mb-2">
          <div className="text-[8px] text-gray-400">CLIENTE:</div>
          <div className="font-black text-xs text-gray-900 tracking-wide break-words">
            {venda.cliente}
          </div>
          {venda.docCliente && (
            <div className="text-[9px] text-gray-600 mt-0.5">
              DOC: {venda.docCliente}
            </div>
          )}
        </div>

        <div className="border-b border-dashed border-gray-400 my-2" />

        {/* Itens */}
        <div className="grid grid-cols-12 font-bold mb-1 gap-1 text-[9px]">
          <div className="col-span-7">DESCRIÇÃO</div>
          <div className="col-span-2 text-center">QTD</div>
          <div className="col-span-3 text-right">VALOR</div>
        </div>

        {venda.itens.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 items-start gap-1 text-[10px] pb-1"
          >
            <div className="col-span-7 break-words font-medium">
              {item.servicoNome}
            </div>
            <div className="col-span-2 text-center">{item.quantidade}x</div>
            <div className="col-span-3 text-right font-bold whitespace-nowrap">
              {formatarMoeda(item.valorTotal)}
            </div>
          </div>
        ))}

        <div className="border-b border-dashed border-gray-400 my-2" />

        {/* Totais */}
        <div className="space-y-0.5 text-gray-600 text-[10px]">
          {venda.desconto > 0 && (
            <div className="flex justify-between text-red-600">
              <span>(-) DESCONTO</span>
              <span>- {formatarMoeda(venda.desconto)}</span>
            </div>
          )}
          {venda.acrescimo > 0 && (
            <div className="flex justify-between text-blue-600">
              <span>(+) ACRÉSCIMO</span>
              <span>+ {formatarMoeda(venda.acrescimo)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-800">
            <span>PAGTO: {venda.formaPagamento}</span>
            <span>{formatarMoeda(venda.total)}</span>
          </div>

          {venda.formaPagamento === "PIX" && chavePixLimpa && (
            <div className="bg-emerald-50 text-emerald-800 p-2 rounded border border-emerald-200 my-1.5 text-[10px]">
              <span className="font-bold block text-[8px] text-emerald-600">
                CHAVE PIX:
              </span>
              <span className="font-mono break-all font-bold tracking-tight">
                {chavePixLimpa}
              </span>
            </div>
          )}

          <div className="border-t border-dashed border-gray-300 my-1" />
          <div className="flex justify-between text-xs font-black text-gray-900 pt-0.5">
            <span>TOTAL GERAL</span>
            <span className="text-sm">{formatarMoeda(venda.total)}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-gray-400 my-2" />
        <div className="text-[9px] text-center text-gray-500 space-y-0.5">
          <div>SISTEMA ZAPFÁCIL ERP PRO</div>
          <div className="font-sans text-[7px] text-gray-400">
            VERSÃO 11.0
          </div>
          <div className="font-bold text-gray-700 mt-1">
            *** OBRIGADO! ***
          </div>
        </div>
      </div>
    );
  }
);

CupomFiscal.displayName = "CupomFiscal";
export default CupomFiscal;