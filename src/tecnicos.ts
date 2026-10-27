// Técnicos: cada clube profissional tem o seu, com nome, reputação e um jeito de trabalhar. No fim de cada temporada
// quem ficou muito abaixo do esperado (ou caiu) pode ser demitido; o clube contrata um técnico livre do tamanho dele,
// ou tira um que fez boa campanha num clube menor. O técnico do clube do jogador é decidido pelos resultados reais
// (src/jogo.ts), inclusive no meio da temporada.
import { RNG, clamp } from "./rng.js";
import { gerarNome } from "./nomes.js";

export type EstiloTecnico = "ofensivo" | "defensivo" | "posse" | "jovens" | "linha-dura" | "motivador";
export const ESTILOS: EstiloTecnico[] = ["ofensivo", "defensivo", "posse", "jovens", "linha-dura", "motivador"];
export const NOME_ESTILO: Record<EstiloTecnico, [string, string]> = {
  ofensivo: ["Ofensivo", "Atacantes e pontas largam na frente na briga por posição."],
  defensivo: ["Retranqueiro", "Zagueiros, laterais, volantes e goleiros têm prioridade."],
  posse: ["Toque de bola", "Meias e volantes que passam bem ganham espaço."],
  jovens: ["Aposta na base", "Garotos de até 22 anos têm vantagem na briga por posição."],
  "linha-dura": ["Linha-dura", "Cobra muito: a relação com ele sobe e cai mais rápido."],
  motivador: ["Motivador", "O vestiário anda feliz: a moral sobe um pouco toda semana."],
};
export interface Tecnico { nome: string; nacionalidade: string; idade: number; rep: number; estilo: EstiloTecnico; desde: number; /** último clube (não volta para quem o demitiu) */ ultimo?: string }
export interface TrocaTecnico { clubeId: string; saiu?: string; entrou: string; motivo: "demitido" | "aposentou" | "levado"; de?: string; t: number }

const ESTRANGEIROS = ["POR", "ARG", "ESP", "ITA", "GER", "FRA", "NED", "URU", "BRA", "ENG"];
export function gerarTecnico(rng: RNG, rep: number, pais: string, usados: Set<string>, t: number): Tecnico {
  const nac = rng.chance(0.7) || pais === "INT" ? (pais === "INT" ? "ENG" : pais) : rng.pick(ESTRANGEIROS.filter((x) => x !== pais));
  return { nome: gerarNome(rng, nac, usados), nacionalidade: nac, idade: rng.int(38, 64), rep: Math.round(clamp(rep, 45, 95)), estilo: rng.pick(ESTILOS), desde: t };
}
/** Vantagem na briga por posição (na escala da pontuação de titular) pelo estilo do técnico. */
export function bonusDoTecnico(t: Tecnico | undefined, posicao: string, idade: number): number {
  if (!t) return 0;
  switch (t.estilo) {
    case "ofensivo": return ["ATA", "PON"].includes(posicao) ? 2 : posicao === "MEI" ? 1 : 0;
    case "defensivo": return ["ZAG", "LAT", "VOL", "GOL"].includes(posicao) ? 2 : 0;
    case "posse": return ["MEI", "VOL"].includes(posicao) ? 2 : 0;
    case "jovens": return idade <= 22 ? 3 : idade >= 31 ? -1 : 0;
    default: return 0;
  }
}
/** Chance de o técnico cair no fim da temporada: campanha (posição contra a esperada pela força), rebaixamento, tempo de casa. */
export function chanceDeDemissao(posicao: number, esperada: number, n: number, rebaixados: number, anos: number): number {
  const delta = posicao - esperada; // positivo: pior que o esperado
  let p = delta >= 3 ? 0.04 + 0.05 * delta : delta <= -3 ? 0.01 : 0.03;
  if (rebaixados && posicao > n - rebaixados) p += 0.4;
  if (posicao === 1) p = 0.01;
  if (anos >= 4) p += 0.05;
  return clamp(p, 0.01, 0.92);
}
