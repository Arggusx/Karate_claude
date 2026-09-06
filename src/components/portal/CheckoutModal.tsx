"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

interface CobrancaPix {
  cobranca_id: number;
  valor_centavos: number;
  expira_em: string | null;
  pix_qr_code: string;
  pix_qr_code_base64: string | null;
}

type Etapa = "escolha" | "gerando" | "pix" | "pago" | "erro";

/** Bandeiras aceitas no checkout de cartão (Stripe · Brasil). */
const BANDEIRAS = ["Visa", "Mastercard", "Elo", "Amex", "Hipercard"];

/** Como o provedor gravado na cobrança aparece para o aluno. */
const FORMA_DE_PAGAMENTO: Record<string, string> = {
  mercadopago: "PIX",
  stripe: "cartão de crédito",
  manual: "baixa manual no dojo",
};

/** "Mensalidade já paga via PIX em 06/09/2026." */
function textoJaPaga(dados: {
  provedor?: string | null;
  pago_em?: string | null;
}): string {
  const forma = dados.provedor
    ? (FORMA_DE_PAGAMENTO[dados.provedor] ?? dados.provedor)
    : null;
  const data = dados.pago_em
    ? new Date(dados.pago_em).toLocaleDateString("pt-BR")
    : null;

  return [
    "Mensalidade deste mês já paga",
    forma ? ` via ${forma}` : "",
    data ? ` em ${data}` : "",
    ". Nenhuma cobrança foi gerada.",
  ].join("");
}

/**
 * Checkout do aluno: gera o PIX no Mercado Pago, mostra o QR Code com o
 * copia e cola e faz polling do status a cada 5s até o webhook confirmar.
 */
export function CheckoutModal({
  aberto,
  onClose,
  usuario,
  valorCentavos,
  onPago,
}: {
  aberto: boolean;
  onClose: () => void;
  usuario: string;
  valorCentavos: number;
  onPago?: () => void;
}) {
  const toast = useToast();
  const [etapa, setEtapa] = useState<Etapa>("escolha");
  const [cobranca, setCobranca] = useState<CobrancaPix | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [restante, setRestante] = useState<number | null>(null);
  const copiaTimeout = useRef<number | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Reinicia ao fechar para o próximo checkout começar limpo.
  useEffect(() => {
    if (!aberto) {
      setEtapa("escolha");
      setCobranca(null);
      setErro(null);
      setRestante(null);
      setCopiado(false);
    }
  }, [aberto]);

  const gerarPix = useCallback(async () => {
    setEtapa("gerando");
    setErro(null);

    try {
      const resposta = await fetch("/api/payments/mercadopago/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        // 409: a competência já estava quitada antes deste clique. Não é uma
        // confirmação de pagamento — avisa no toast como já foi paga e fecha.
        if (dados.status === "approved") {
          toast(textoJaPaga(dados));
          onPago?.();
          onClose();
          return;
        }
        throw new Error(dados.erro ?? "Falha ao gerar o PIX.");
      }

      setCobranca(dados);
      setEtapa("pix");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao gerar o PIX.");
      setEtapa("erro");
    }
  }, [usuario, onPago, onClose, toast]);

  async function abrirStripe() {
    setEtapa("gerando");
    setErro(null);

    try {
      const resposta = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario }),
      });
      const dados = await resposta.json();

      if (!resposta.ok || !dados.checkout_url) {
        throw new Error(dados.erro ?? "Falha ao abrir o checkout.");
      }
      window.location.href = dados.checkout_url;
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Falha ao abrir o checkout.",
      );
      setEtapa("erro");
    }
  }

  // Polling do status a cada 5s enquanto o PIX está na tela.
  useEffect(() => {
    if (etapa !== "pix" || !cobranca) return;

    const id = window.setInterval(async () => {
      try {
        const resposta = await fetch(
          `/api/payments/${cobranca.cobranca_id}/status`,
          { cache: "no-store" },
        );
        const dados = await resposta.json();

        if (dados.pago) {
          setEtapa("pago");
          toast("Pagamento confirmado! Sua matrícula está ativa.");
          onPago?.();
        } else if (dados.status === "expired" || dados.status === "cancelled") {
          setErro("Este PIX expirou. Gere um novo código.");
          setEtapa("erro");
        }
      } catch {
        // Falha de rede momentânea: a próxima tentativa resolve.
      }
    }, 5000);

    return () => window.clearInterval(id);
  }, [etapa, cobranca, toast, onPago]);

  // Contagem regressiva da validade do PIX.
  useEffect(() => {
    if (etapa !== "pix" || !cobranca?.expira_em) return;

    const alvo = new Date(cobranca.expira_em).getTime();
    const atualizar = () =>
      setRestante(Math.max(0, Math.floor((alvo - Date.now()) / 1000)));

    atualizar();
    const id = window.setInterval(atualizar, 1000);
    return () => window.clearInterval(id);
  }, [etapa, cobranca]);

  useEffect(() => {
    return () => {
      if (copiaTimeout.current) window.clearTimeout(copiaTimeout.current);
    };
  }, []);

  async function copiarCodigo() {
    if (!cobranca) return;
    try {
      await navigator.clipboard.writeText(cobranca.pix_qr_code);
      setCopiado(true);
      toast("Código PIX copiado.");
      copiaTimeout.current = window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast("Não foi possível copiar. Selecione o código manualmente.", "erro");
    }
  }

  const valor = (valorCentavos / 100).toFixed(2).replace(".", ",");
  // Piso da Stripe para BRL. Abaixo disso só o PIX aceita a cobrança.
  const MINIMO_CARTAO_CENTAVOS = 50;
  const cartaoDisponivel = valorCentavos >= MINIMO_CARTAO_CENTAVOS;

  return (
    <Modal open={aberto} onClose={onClose} titulo="Pagamento da mensalidade">
      {etapa === "escolha" ? (
        <div className="space-y-4">
          <div className="rounded-md border border-line bg-canvas p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Mensalidade · valor único</span>
              <span className="font-medium text-fg">R$ {valor}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
              <span className="text-xs font-medium text-fg">Total</span>
              <span className="text-sm font-semibold tabular-nums text-fg">
                R$ {valor}
              </span>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted">
            Escolha a forma de pagamento. No PIX a confirmação é automática em
            poucos segundos.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={gerarPix}>
              Pagar com Pix
            </Button>
            {cartaoDisponivel ? (
              <Button size="sm" variant="secondary" onClick={abrirStripe}>
                Cartão de crédito
              </Button>
            ) : null}
          </div>

          {cartaoDisponivel ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-2xs text-subtle">Bandeiras aceitas:</span>
              {BANDEIRAS.map((bandeira) => (
                <span
                  key={bandeira}
                  className="rounded border border-line px-1.5 py-0.5 text-2xs font-medium text-muted"
                >
                  {bandeira}
                </span>
              ))}
            </div>
          ) : null}

          {!cartaoDisponivel ? (
            <p className="text-2xs text-subtle">
              Cartão indisponível para valores abaixo de R$ 0,50 — limite da
              operadora. O PIX aceita qualquer valor.
            </p>
          ) : null}
        </div>
      ) : null}

      {etapa === "gerando" ? (
        <div className="space-y-3">
          <Skeleton className="mx-auto h-44 w-44" />
          <Skeleton className="h-9 w-full" />
          <p className="text-center text-xs text-muted">
            Gerando cobrança no provedor…
          </p>
        </div>
      ) : null}

      {etapa === "pix" && cobranca ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge tone="warn">Aguardando pagamento</Badge>
            {restante !== null ? (
              <span className="text-2xs tabular-nums text-muted">
                Expira em {formatarTempo(restante)}
              </span>
            ) : null}
          </div>

          <div className="flex justify-center">
            {cobranca.pix_qr_code_base64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/png;base64,${cobranca.pix_qr_code_base64}`}
                alt="QR Code do PIX"
                className="h-44 w-44 rounded-md border border-line bg-white p-1.5"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-md border border-dashed border-line-strong text-2xs text-muted">
                QR Code indisponível — use o copia e cola
              </div>
            )}
          </div>

          <div>
            <p className="label">PIX copia e cola</p>
            <div className="mt-1 flex gap-2">
              <input
                readOnly
                value={cobranca.pix_qr_code}
                onFocus={(evento) => evento.currentTarget.select()}
                className="input font-mono text-2xs"
                aria-label="Código PIX copia e cola"
              />
              <Button size="sm" className="shrink-0" onClick={copiarCodigo}>
                {copiado ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>

          <p className="text-2xs leading-relaxed text-subtle">
            Abra o app do banco, escolha PIX › Pagar com QR Code ou cole o
            código. A tela atualiza sozinha quando o pagamento for aprovado.
          </p>
        </div>
      ) : null}

      {etapa === "pago" ? (
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-status-ok/40 bg-status-ok/10 text-status-ok">
            ✓
          </div>
          <p className="text-sm font-medium text-fg">Pagamento confirmado</p>
          <p className="text-xs text-muted">
            Sua mensalidade está quitada e a matrícula consta como ativa.
          </p>
          <Button size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      ) : null}

      {etapa === "erro" ? (
        <div className="space-y-3">
          <p className="rounded-md border border-status-bad/40 bg-status-bad/10 px-3 py-2 text-xs text-status-bad">
            {erro}
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={gerarPix}>
              Tentar de novo
            </Button>
            <Button size="sm" variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function formatarTempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${String(resto).padStart(2, "0")}`;
}
