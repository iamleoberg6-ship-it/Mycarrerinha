// Base e olheiro: quem enxerga o potencial dos garotos e como fica a disputa por posição no clube formador.
// O potencial exato é um serviço: só o olheiro (pai treinador que conhece a base, ou um agente experiente/superagente)
// revela a joia e a promessa. Sem ele, o garoto aparece sem rótulo, e o jogador só vê o nível de hoje.
import type { TipoAgente } from "./mercado.js";
import { nivelDoAgente } from "./agentes-banco.js";

/** Quem tem acesso ao olheiro: o pai treinador (conhece a base) e os agentes experiente e superagente. */
export const temOlheiro = (agente: TipoAgente, paiTreinador: boolean): boolean =>
  paiTreinador || nivelDoAgente(agente) >= 3;

/** Rótulo do garoto: só aparece com olheiro. Sem ele, o potencial fica oculto. */
export function rotuloPotencial(j: { ovr: number; pot?: number }, olheiro: boolean): string {
  if (!olheiro) return "potencial oculto";
  const p = j.pot ?? j.ovr;
  return p >= 86 ? "joia" : p >= 78 && p - j.ovr >= 10 ? "promessa" : "";
}

/** Disputa na posição: quantos garotos da mesma posição estão melhores que você e quem são. */
export function disputaNaPosicao<T extends { posicao: string; ovr: number; nome: string }>(base: T[], posicao: string, meuOvr: number, vagas: number) {
  const mesma = base.filter((x) => x.posicao === posicao).sort((a, b) => b.ovr - a.ovr);
  const acima = mesma.filter((x) => x.ovr > meuOvr).length;
  return { mesma, acima, titular: acima < vagas, vagas };
}
