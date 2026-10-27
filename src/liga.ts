// Ligas, clubes e temporada. Usa o pacote de dados (Série A) e gera ligas abstratas para o resto do mundo.
import { RNG, clamp } from "./rng.js";
import type { Posicao } from "./atributos.js";
import { simularPlacar } from "./partida.js";

export interface JogadorNPC {
  nome: string;
  posicao: Posicao | "GOL";
  ovr: number;
  idade: number;
  nacionalidade: string;
  /** nascido ou formado no País Basco (o Atlético Bilbau só tem desses) */
  basco?: boolean;
  numero?: number;
  /** potencial (gerado na primeira virada de temporada, ou na criação dos garotos da base) */
  pot?: number;
  /** ainda na base do clube */
  base?: boolean;
}

export interface Clube {
  id: string;
  nome: string;
  ligaId: string;
  forca: number; // OVR médio dos titulares
  fClube: number; // capacidade financeira 0,6–1,4
  elenco: JogadorNPC[];
  pais: string;
}

export interface Liga {
  id: string;
  nome: string;
  pais: string;
  nivel: 1 | 2 | 3 | 4 | 5; // pirâmide de ligas
  fLiga: number; // fator do valor de mercado
  fSalario: number; // multiplicador de salário (ligas de alto salário)
  rebaixados: number;
  clubes: Clube[];
}

export interface PacoteDados {
  clubes: { id: string; nome: string; forca: number; f_clube: number }[];
  jogadores: { clube: string; nome: string; posicao: string; ovr_estimado: number; idade_aprox: number; nacionalidade: string }[];
}

export function forcaDoElenco(elenco: { posicao: string; ovr: number }[]): number {
  const gols = elenco.filter((j) => j.posicao === "GOL").map((j) => j.ovr).sort((a, b) => b - a);
  const linha = elenco.filter((j) => j.posicao !== "GOL").map((j) => j.ovr).sort((a, b) => b - a);
  const top = [...linha.slice(0, 10), gols[0] ?? 55];
  return top.reduce((a, b) => a + b, 0) / top.length;
}

export function ligaDoPacote(p: PacoteDados): Liga {
  const clubes: Clube[] = p.clubes.map((c) => ({
    id: c.id, nome: c.nome, ligaId: "BRA1", forca: c.forca, fClube: c.f_clube, pais: "BRA",
    elenco: p.jogadores.filter((j) => j.clube === c.id).map((j) => ({
      nome: j.nome, posicao: j.posicao as Posicao | "GOL", ovr: j.ovr_estimado, idade: j.idade_aprox, nacionalidade: j.nacionalidade,
    })),
  }));
  for (const c of clubes) c.forca = forcaDoElenco(c.elenco);
  return { id: "BRA1", nome: "Campeonato Nacional Série A", pais: "BRA", nivel: 2, fLiga: 0.7, fSalario: 1, rebaixados: 4, clubes };
}

const NAC_POR_PAIS: Record<string, string[]> = {
  BRA: ["BRA"], EUR: ["ESP", "ENG", "FRA", "ITA", "GER", "POR", "NED", "BRA", "ARG"], ARA: ["KSA", "BRA", "POR", "FRA"],
};

/** Gera um elenco plausível em torno de uma força-alvo. */
export function gerarElenco(rng: RNG, forca: number, pais: string): JogadorNPC[] {
  const composicao: [Posicao | "GOL", number][] = [["GOL", 3], ["ZAG", 4], ["LAT", 4], ["VOL", 3], ["MEI", 4], ["PON", 4], ["ATA", 3]];
  const elenco: JogadorNPC[] = [];
  const nac = NAC_POR_PAIS[pais] ?? [pais];
  for (const [pos, n] of composicao) {
    for (let i = 0; i < n; i++) {
      const titular = i < (pos === "GOL" ? 1 : pos === "VOL" || pos === "ATA" ? 1 : 2);
      const ovr = clamp(Math.round(forca + (titular ? 1 : -5) + rng.normal(0, 2.5)), 45, 92);
      elenco.push({ nome: `${pos}-${i + 1}`, posicao: pos, ovr, idade: rng.int(19, 33), nacionalidade: rng.pick(nac) });
    }
  }
  return elenco;
}

export function gerarLiga(rng: RNG, cfg: { id: string; nome: string; pais: string; nivel: Liga["nivel"]; fLiga: number; fSalario: number; n: number; fMin: number; fMax: number; fClube: [number, number] }): Liga {
  const clubes: Clube[] = [];
  for (let i = 0; i < cfg.n; i++) {
    const t = cfg.n === 1 ? 0.5 : i / (cfg.n - 1);
    const alvo = cfg.fMax - (cfg.fMax - cfg.fMin) * t + rng.normal(0, 1);
    const elenco = gerarElenco(rng, alvo, cfg.pais);
    clubes.push({
      id: `${cfg.id}-${String(i + 1).padStart(2, "0")}`, nome: `${cfg.nome} #${i + 1}`, ligaId: cfg.id, pais: cfg.pais,
      forca: forcaDoElenco(elenco), fClube: cfg.fClube[1] - (cfg.fClube[1] - cfg.fClube[0]) * t, elenco,
    });
  }
  return { id: cfg.id, nome: cfg.nome, pais: cfg.pais, nivel: cfg.nivel, fLiga: cfg.fLiga, fSalario: cfg.fSalario, rebaixados: 4, clubes };
}

/** Mundo do MVP: a Série A do pacote + ligas abstratas para o mercado (pirâmide do documento). */
export function criarMundo(rng: RNG, pacote: PacoteDados): Liga[] {
  return [
    gerarLiga(rng, { id: "EUR1", nome: "Liga Europeia Top", pais: "EUR", nivel: 1, fLiga: 1.0, fSalario: 1.3, n: 20, fMin: 73, fMax: 86, fClube: [0.9, 1.5] }),
    gerarLiga(rng, { id: "EUR2", nome: "Liga Europeia Média", pais: "EUR", nivel: 2, fLiga: 0.85, fSalario: 1.0, n: 18, fMin: 66, fMax: 78, fClube: [0.6, 1.2] }),
    ligaDoPacote(pacote),
    gerarLiga(rng, { id: "ARA1", nome: "Liga do Golfo (alto salário)", pais: "ARA", nivel: 3, fLiga: 0.7, fSalario: 2.5, n: 18, fMin: 64, fMax: 75, fClube: [0.9, 1.5] }),
    gerarLiga(rng, { id: "BRA2", nome: "Campeonato Nacional Série B", pais: "BRA", nivel: 4, fLiga: 0.5, fSalario: 0.6, n: 20, fMin: 58, fMax: 67, fClube: [0.4, 0.8] }),
  ];
}

// ---------- Temporada ----------

/** Turno e returno pelo método do círculo. Retorna rodadas com pares [casa, fora] (índices). */
export function tabelaTurnoReturno(n: number): [number, number][][] {
  const idx = Array.from({ length: n }, (_, i) => i);
  const rodadas: [number, number][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const jogos: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = idx[i], b = idx[n - 1 - i];
      jogos.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    rodadas.push(jogos);
    idx.splice(1, 0, idx.pop()!);
  }
  return [...rodadas, ...rodadas.map((j) => j.map(([a, b]) => [b, a] as [number, number]))];
}

/** Rodadas da liga: turno e returno até 20 clubes; acima disso, turno único (provisório, até o calendário com jogos no meio da semana). */
export function rodadasDaLiga(n: number): [number, number][][] {
  const t = tabelaTurnoReturno(n);
  return n <= 20 ? t : t.slice(0, n - 1);
}

export interface LinhaTabela {
  clube: string; j: number; v: number; e: number; d: number; gp: number; gc: number; pts: number;
}

export function novaTabela(liga: Liga): LinhaTabela[] {
  return liga.clubes.map((c) => ({ clube: c.id, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0 }));
}

export function registrar(t: LinhaTabela, gp: number, gc: number) {
  t.j++; t.gp += gp; t.gc += gc;
  if (gp > gc) { t.v++; t.pts += 3; } else if (gp === gc) { t.e++; t.pts += 1; } else t.d++;
}

export function ordenar(tab: LinhaTabela[]): LinhaTabela[] {
  return [...tab].sort((a, b) => b.pts - a.pts || b.v - a.v || (b.gp - b.gc) - (a.gp - a.gc) || b.gp - a.gp);
}

/** Simula uma temporada inteira sem o jogador (para validar o placar). */
export function simularTemporada(rng: RNG, liga: Liga) {
  const tab = novaTabela(liga);
  let gols = 0, jogos = 0, vitCasa = 0, empates = 0;
  for (const rodada of tabelaTurnoReturno(liga.clubes.length)) {
    for (const [a, b] of rodada) {
      const [gc, gf] = simularPlacar(rng, liga.clubes[a].forca, liga.clubes[b].forca);
      registrar(tab[a], gc, gf);
      registrar(tab[b], gf, gc);
      gols += gc + gf; jogos++;
      if (gc > gf) vitCasa++; else if (gc === gf) empates++;
    }
  }
  return { tabela: ordenar(tab), golsPorJogo: gols / jogos, vitCasa: vitCasa / jogos, empates: empates / jogos };
}
