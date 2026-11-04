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
export interface Tecnico { /** ex-jogador do mundo que virou técnico */ exJogador?: boolean; nome: string; nacionalidade: string; idade: number; rep: number; estilo: EstiloTecnico; desde: number; /** último clube (não volta para quem o demitiu) */ ultimo?: string }
export interface TrocaTecnico { clubeId: string; saiu?: string; entrou: string; motivo: "demitido" | "aposentou" | "levado"; de?: string; t: number }

const ESTRANGEIROS = ["POR", "ARG", "ESP", "ITA", "GER", "FRA", "NED", "URU", "BRA", "ENG"];
export function gerarTecnico(rng: RNG, rep: number, pais: string, usados: Set<string>, t: number): Tecnico {
  const nac = rng.chance(0.7) || pais === "INT" ? (pais === "INT" ? "ENG" : pais) : rng.pick(ESTRANGEIROS.filter((x) => x !== pais));
  return { nome: gerarNome(rng, nac, usados), nacionalidade: nac, idade: rng.int(38, 64), rep: Math.round(clamp(rep, 45, 95)), estilo: rng.pick(ESTILOS), desde: t };
}
// ------------------------------------------------------------------ formação preferida
/** Quantos titulares cada formação usa em cada posição (o goleiro é sempre um). */
export const VAGAS_FORMACAO: Record<string, Record<"ZAG" | "LAT" | "VOL" | "MEI" | "PON" | "ATA", number>> = {
  "4-3-3": { ZAG: 2, LAT: 2, VOL: 1, MEI: 2, PON: 2, ATA: 1 },
  "4-4-2": { ZAG: 2, LAT: 2, VOL: 1, MEI: 1, PON: 2, ATA: 2 },
  "4-2-3-1": { ZAG: 2, LAT: 2, VOL: 2, MEI: 1, PON: 2, ATA: 1 },
  "3-5-2": { ZAG: 3, LAT: 2, VOL: 1, MEI: 2, PON: 0, ATA: 2 },
  "5-3-2": { ZAG: 3, LAT: 2, VOL: 1, MEI: 2, PON: 0, ATA: 2 },
};
export const DESC_FORMACAO: Record<string, string> = {
  "4-3-3": "Dois pontas e um centroavante, com um volante e dois meias.",
  "4-4-2": "Dois atacantes na frente, pontas fechando o meio e um meia só.",
  "4-2-3-1": "Dois volantes, um meia por trás do centroavante e pontas abertos.",
  "3-5-2": "Três zagueiros, laterais virando alas e dupla de ataque. Não usa pontas.",
  "5-3-2": "Linha de cinco atrás e dupla de ataque. Não usa pontas.",
};
/** As formações de que cada estilo gosta (o técnico escolhe uma delas e não muda). */
const PREFERIDAS: Record<EstiloTecnico, string[]> = {
  ofensivo: ["4-3-3", "4-2-3-1", "4-3-3"], defensivo: ["5-3-2", "4-4-2", "3-5-2"], posse: ["4-3-3", "4-2-3-1", "4-3-3"],
  jovens: ["4-3-3", "4-4-2", "4-2-3-1"], "linha-dura": ["4-4-2", "3-5-2", "5-3-2"], motivador: ["4-4-2", "4-2-3-1", "4-3-3"],
};
/** Formação do técnico: sai do estilo e do nome dele (a mesma a carreira inteira). */
export function formacaoDoTecnico(t: Tecnico | undefined): string {
  if (!t) return "4-3-3";
  let h = 2166136261;
  for (const ch of t.nome) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const op = PREFERIDAS[t.estilo] ?? ["4-3-3"];
  return op[h % op.length];
}
export const vagasNaFormacao = (t: Tecnico | undefined, pos: string): number => pos === "GOL" ? 1 : (VAGAS_FORMACAO[formacaoDoTecnico(t)] as Record<string, number>)[pos] ?? 0;

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
