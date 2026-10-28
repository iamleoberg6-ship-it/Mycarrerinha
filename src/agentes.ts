// Negociação com um agente do banco: a conversa de comissão, no mesmo estilo dos consultores.
// O agente abre pedindo mais que a referência; o jogador contrapõe; abaixo do piso ele desiste.
// Quanto menor a comissão fechada, menos o agente se dedica (a habilidade cai). Ver claude/conceito-banco-agentes.md.
import { RNG, clamp } from "./rng.js";
import { perfilAgente, comissaoDo, FAMILIA, type TipoAgente } from "./agentes-banco.js";

/** Comissão máxima que um agente aceita pedir (sobre salário e luvas). */
export const COMISSAO_MAX = 0.12;
/** Abaixo desta fração da comissão de referência, o agente desiste da conversa. */
export const PISO_AGENTE = 0.6;
export const MAX_RODADAS_AGENTE = 4;

export interface NegAgente { id: TipoAgente; rodada: number; pedido: number; referencia: number; reserva: number }
export type RespostaAgente = { tipo: "aceitar" } | { tipo: "recusar" } | { tipo: "contrapor"; comissao: number };
export interface ResultadoAgente { status: "fechou" | "recusou" | "continua" | "desistiu" | "erro"; msg: string; comissao?: number }

/** Abre a conversa: o agente pede 25% acima da referência (no máximo 12%). A reserva é sorteada e fica oculta. */
export function iniciarNegAgente(id: TipoAgente, rng: RNG): NegAgente {
  const ref = perfilAgente(id).comissao;
  return {
    id, rodada: 1, referencia: ref,
    pedido: Math.min(COMISSAO_MAX, Math.round(ref * 1.25 * 10000) / 10000),
    reserva: ref * (0.8 + 0.2 * rng.next()),
  };
}

/** Resposta do jogador: aceita o pedido, recusa, ou contrapõe com outra comissão. */
export function responderAgente(n: NegAgente, resp: RespostaAgente): ResultadoAgente {
  const pct = (x: number) => `${(x * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
  if (resp.tipo === "recusar") return { status: "recusou", msg: "O agente foi embora. Sem acordo." };
  const c = resp.tipo === "aceitar" ? n.pedido : resp.comissao;
  if (resp.tipo === "contrapor" && c < PISO_AGENTE * n.referencia) return { status: "desistiu", msg: "Essa comissão nem dá para conversar. Até mais." };
  if (resp.tipo === "aceitar" || c >= n.reserva) return { status: "fechou", msg: `Fechado: ${pct(c)} de comissão.`, comissao: c };
  n.rodada++;
  if (n.rodada > MAX_RODADAS_AGENTE) return { status: "desistiu", msg: "Não consigo fechar nesse nível. Tenho outros clientes. Até mais." };
  n.pedido = Math.round(((c + n.pedido) / 2) * 10000) / 10000;
  return { status: "continua", msg: `${c >= 0.8 * n.reserva ? "Estamos perto." : "Ainda longe do que eu aceito."} Minha comissão agora é ${pct(n.pedido)}.` };
}

/** Habilidade de negociação do agente, reduzida quando a comissão fechada fica abaixo da de referência. */
export function habilidadeDoAgente(t: TipoAgente, comissaoAcordada?: number): number {
  if (t === FAMILIA) return 0;
  const p = perfilAgente(t);
  const desconto = clamp(1 - comissaoDo(t, comissaoAcordada) / p.comissao, 0, 1);
  return p.habilidade * (1 - 0.5 * desconto);
}
