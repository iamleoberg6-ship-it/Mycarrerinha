// Arquivo das copas: no fim de cada temporada, cada copa vira uma linha da história dela (campeão, vice, final,
// artilheiros, assistentes, maior goleada, maior público). As copas só guardam o placar dos jogos do computador, então
// os gols de cada clube são distribuídos entre os jogadores dele pelo jeito de cada um (posição, nível); os seus gols
// entram com o número de verdade, e o resto do time divide o que sobrou.
import { RNG, clamp } from "./rng.js";
import { COPAS, type CopaId, type EstadoCopa, type JogoCopa } from "./copas.js";

/** [nome, clube, valor, idade, é você?] */
export type LinhaCopa = [string, string, number, number, 1?];
export interface JogoMarcante { casa: string; fora: string; gc: number; gf: number; fase: string; pen?: string }
export interface CopaArquivada {
  t: number; id: CopaId; nome: string; campeao?: string; vice?: string; final?: JogoMarcante[];
  art: LinhaCopa[]; ass: LinhaCopa[]; jogos: number; gols: number; clubes: number;
  goleada?: JogoMarcante; publico?: { casa: string; fora: string; estadio: string; valor: number; fase: string };
  /** os mais jovens a marcar e a jogar nesta edição (nome, clube, idade) */ jovemGol?: LinhaCopa; jovem?: LinhaCopa;
}
export interface JogadorPool { nome: string; posicao: string; ovr: number; idade: number }
export interface Eu { clubeId: string; nome: string; idade: number; jogos: number; gols: number; assist: number }

const PESO_GOL: Record<string, number> = { ATA: 1, PON: 0.65, MEI: 0.45, VOL: 0.16, LAT: 0.1, ZAG: 0.12, GOL: 0 };
const PESO_ASS: Record<string, number> = { MEI: 1, PON: 0.9, ATA: 0.55, LAT: 0.45, VOL: 0.35, ZAG: 0.08, GOL: 0.02 };
const FASE: Record<string, number> = { final: 0.3, semi: 0.18, quartas: 0.1, desafio: 0.15, derby: 0.12 };

/** Sorteia `n` gols (ou passes) entre os jogadores pelo peso de cada um. */
function distribuir(rng: RNG, n: number, pool: JogadorPool[], peso: Record<string, number>): Map<string, number> {
  const out = new Map<string, number>();
  const ws = pool.map((j) => (peso[j.posicao] ?? 0.2) * Math.pow(Math.max(40, j.ovr) / 70, 3));
  const tot = ws.reduce((a, b) => a + b, 0);
  if (!tot) return out;
  for (let k = 0; k < n; k++) {
    let x = rng.next() * tot, i = 0;
    while (i < ws.length - 1 && x > ws[i]) { x -= ws[i]; i++; }
    out.set(pool[i].nome, (out.get(pool[i].nome) ?? 0) + 1);
  }
  return out;
}

/** Guarda a edição de uma copa. `pool`: os jogadores de um clube (ou seleção) no fim da temporada. */
export function arquivarCopa(e: EstadoCopa, t: number, semente: string, nomeCopa: string, pool: (clubeId: string) => JogadorPool[],
  estadio: (clubeId: string) => { nome: string; capacidade: number; forca: number }, eu?: Eu): CopaArquivada {
  const rng = new RNG(`${semente}|arquivo-copa|${e.id}|${t}`);
  const jogados = e.jogos.filter((j) => j.gc !== undefined && j.gf !== undefined && !j.amistoso);
  const golsDo = new Map<string, number>();
  for (const j of jogados) { golsDo.set(j.casa, (golsDo.get(j.casa) ?? 0) + j.gc!); golsDo.set(j.fora, (golsDo.get(j.fora) ?? 0) + j.gf!); }
  const art = new Map<string, LinhaCopa>(), ass = new Map<string, LinhaCopa>(), jogou = new Map<string, LinhaCopa>();
  const soma = (m: Map<string, LinhaCopa>, nome: string, clube: string, v: number, idade: number, souEu = false) => {
    const x = m.get(nome) ?? [nome, clube, 0, idade, ...(souEu ? [1 as const] : [])] as LinhaCopa; x[2] += v; m.set(nome, x);
  };
  for (const [clube, g] of golsDo) {
    const p = pool(clube).sort((a, b) => b.ovr - a.ovr).slice(0, 16);
    let golsRestam = g, assRestam = Math.round(g * 0.72);
    if (eu && eu.clubeId === clube) {
      const meus = Math.min(eu.gols, g), minhas = Math.min(eu.assist, assRestam);
      if (meus) soma(art, eu.nome, clube, meus, eu.idade, true);
      if (minhas) soma(ass, eu.nome, clube, minhas, eu.idade, true);
      if (eu.jogos) soma(jogou, eu.nome, clube, 1, eu.idade, true);
      golsRestam -= meus; assRestam -= minhas;
    }
    for (const [nome, v] of distribuir(rng, golsRestam, p, PESO_GOL)) soma(art, nome, clube, v, p.find((j) => j.nome === nome)!.idade);
    for (const [nome, v] of distribuir(rng, assRestam, p, PESO_ASS)) soma(ass, nome, clube, v, p.find((j) => j.nome === nome)!.idade);
    for (const j of p.slice(0, 14)) soma(jogou, j.nome, clube, 1, j.idade);
  }
  const top = (m: Map<string, LinhaCopa>, n: number) => [...m.values()].sort((a, b) => b[2] - a[2] || a[3] - b[3]).slice(0, n);
  const maisNovo = (m: Map<string, LinhaCopa>) => [...m.values()].sort((a, b) => a[3] - b[3] || b[2] - a[2])[0];
  // final (uma ou duas pernas), vice e maior goleada
  const finais = jogados.filter((j) => j.fase === "final");
  const vice = e.campeao && finais.length ? (finais[0].casa === e.campeao ? finais[0].fora : finais[0].casa) : undefined;
  const marc = (j: JogoCopa): JogoMarcante => ({ casa: j.casa, fora: j.fora, gc: j.gc!, gf: j.gf!, fase: j.fase, ...(j.penaltis ? { pen: j.penaltis } : {}) });
  const goleada = [...jogados].sort((a, b) => Math.abs(b.gc! - b.gf!) - Math.abs(a.gc! - a.gf!) || (b.gc! + b.gf!) - (a.gc! + a.gf!))[0];
  // público: o estádio de quem joga em casa (decisão enche mais)
  let publico: CopaArquivada["publico"];
  for (const j of jogados) {
    const est = estadio(j.casa), fora = estadio(j.fora), r = new RNG(`${semente}|publico-copa|${e.id}|${t}|${j.id}`);
    const fill = clamp(0.5 + (Math.max(est.forca, fora.forca) - 62) / 55 + (FASE[j.fase] ?? 0), 0.25, 1) * r.range(0.9, 1);
    const valor = Math.round(est.capacidade * fill / 10) * 10;
    if (!publico || valor > publico.valor) publico = { casa: j.casa, fora: j.fora, estadio: est.nome, valor, fase: j.fase };
  }
  return {
    t, id: e.id, nome: nomeCopa, ...(e.campeao ? { campeao: e.campeao } : {}), ...(vice ? { vice } : {}), ...(finais.length ? { final: finais.map(marc) } : {}),
    art: top(art, 10), ass: top(ass, 5), jogos: jogados.length, gols: jogados.reduce((a, j) => a + j.gc! + j.gf!, 0), clubes: e.clubes.length,
    ...(goleada ? { goleada: marc(goleada) } : {}), ...(publico ? { publico } : {}),
    ...(art.size ? { jovemGol: maisNovo(art) } : {}), ...(jogou.size ? { jovem: maisNovo(jogou) } : {}),
  };
}

export const nomeDaCopa = (id: CopaId) => COPAS[id]?.nome ?? id;
