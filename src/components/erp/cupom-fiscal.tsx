"use client";

import { useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Venda } from "@/types";
import { useERPStore } from "@/hooks/use-erp-store";
import { formatarMoeda, obterChavePixLimpa } from "@/lib/utils-erp";

export interface CupomFiscalHandle {
  capturarImagem: () => Promise<HTMLCanvasElement>;
  obterDados: () => Venda | null;
}

interface CupomFiscalProps {
  venda?: Venda | null;
}

function gerarPixPayloadEMV(chave: string, valor: number, nome: string): string {
  // Gera payload PIX estático simplificado (EMV) para QR Code
  // Formato: 00 02 01 - Payload Format Indicator
  // 26 - Merchant Account Information (PIX)
  //   00 14 br.gov.bcb.pix
  //   01 XX chave pix
  // 52 XX - Merchant Category Code
  // 53 03 986 - Transaction Currency (BRL)
  // 54 XX - Transaction Amount
  // 58 02 BR - Country Code
  // 59 XX - Merchant Name
  // 60 XX - Merchant City
  // 62 XX - Additional Data Field (txid)
  // 63 04 CRC16

  const valorStr = valor.toFixed(2);
  const merchantName = nome.substring(0, 25).padEnd(25);
  const merchantCity = "Brasil".padEnd(15);
  const txid = "***".padEnd(25);

  function tlv(id: string, value: string): string {
    const len = value.length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  }

  function addCrc16(payload: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
        else crc = crc << 1;
        crc &= 0xFFFF;
      }
    }
    return payload + "6304" + crc.toString(16).toUpperCase().padStart(4, "0");
  }

  const merchantAccountInfo =
    tlv("00", "br.gov.bcb.pix") + tlv("01", chave);
  const mai = tlv("26", merchantAccountInfo);

  let payload =
    tlv("00", "01") +
    mai +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", valorStr) +
    tlv("58", "BR") +
    tlv("59", merchantName) +
    tlv("60", merchantCity) +
    tlv("62", txid);

  payload = addCrc16(payload);
  return payload;
}

const CupomFiscal = forwardRef<CupomFiscalHandle, CupomFiscalProps>(
  ({ venda }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const vendaRef = useRef<Venda | null>(venda || null);

    if (venda) vendaRef.current = venda;

    const pixPayload = useMemo(() => {
      if (!venda || venda.formaPagamento !== "PIX") return "";
      const chaveLimpa = obterChavePixLimpa(venda.chavePix);
      if (!chaveLimpa) return "";
      return gerarPixPayloadEMV(chaveLimpa, venda.total, venda.empresa || "ZapFacil");
    }, [venda]);

    useImperativeHandle(ref, () => ({
      capturarImagem: async () => {
        const html2canvas = (await import("html2canvas")).default;
        if (!containerRef.current) throw new Error("Cupom nao encontrado");
        return html2canvas(containerRef.current, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
          imageTimeout: 0,
          allowTaint: true,
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
              Preencha o formulario e processe uma venda.
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
          {isPago ? "COMPROVANTE DE PAGAMENTO" : "FATURA DE SERVICO"}
        </div>

        {/* Logo */}
        {venda.empresa && (
          <div className="text-center mb-2">
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
          <div className="col-span-7">DESCRICAO</div>
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
              <span>(+) ACRESCIMO</span>
              <span>+ {formatarMoeda(venda.acrescimo)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-800">
            <span>PAGTO: {venda.formaPagamento}</span>
            <span>{formatarMoeda(venda.total)}</span>
          </div>

          <div className="border-t border-dashed border-gray-300 my-1" />
          <div className="flex justify-between text-xs font-black text-gray-900 pt-0.5">
            <span>TOTAL GERAL</span>
            <span className="text-sm">{formatarMoeda(venda.total)}</span>
          </div>
        </div>

        {/* PIX: Chave + QR Code */}
        {venda.formaPagamento === "PIX" && chavePixLimpa && (
          <>
            <div className="border-b border-dashed border-gray-400 my-2" />
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded border border-emerald-200 text-center space-y-2">
              <span className="font-bold block text-[9px] text-emerald-600">
                PAGUE VIA PIX
              </span>
              <div className="flex justify-center">
                <QRCodeSVG
                  value={pixPayload}
                  size={140}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                  includeMargin={false}
                />
              </div>
              <div className="text-[8px] text-emerald-700 font-mono break-all font-bold tracking-tight">
                {chavePixLimpa}
              </div>
            </div>
          </>
        )}

        <div className="border-b border-dashed border-gray-400 my-2" />
        <div className="text-[9px] text-center text-gray-500 space-y-0.5">
          <div>SISTEMA ZAPFACIL ERP PRO</div>
          <div className="font-sans text-[7px] text-gray-400">
            VERSAO 11.0
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