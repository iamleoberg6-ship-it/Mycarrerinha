// Copas continentais: Copa Libertadora (América do Sul), Champions Ligue (Europa) e Champions Asiática.
// Cada uma no formato real dela: grupos + mata-mata ida e volta + final única (Libertadora); fase de liga + playoff +
// mata-mata ida e volta + final única (Champions Ligue); fase de liga por região + oitavas ida e volta + fase final
// em jogo único (Asiática). Os jogos são na quarta-feira (semana da temporada); o jogador joga os do clube dele.
// Classificação pela tabela final da temporada anterior de cada liga; convidados completam (src/convidados.ts).
import { RNG } from "./rng.js";
import { simularPlacar } from "./partida.js";
import { tabelaTurnoReturno, novaTabela, registrar, ordenar, simularTemporada, rodadasDaLiga, type LinhaTabela, type Liga } from "./liga.js";
import { CONVIDADOS } from "./convidados.js";

// Estaduais: os campeonatos dos estados nas primeiras semanas do ano (às quartas), com os clubes do estado de todas as
// divisões (os 8 melhores; 6 nos estados menores): turno único, semifinal em jogo único na casa do mais bem colocado
// e final em ida e volta.
export type EstadualId = "PAU" | "CAR" | "MIN" | "GAU" | "PRN" | "CAT" | "BAI" | "PER" | "CEA" | "GOI";
// Copa Intercontinental (todo ano, campeões da temporada anterior, jogos únicos em campo neutro) e Mundial de Clubes
// (a cada quatro anos, 32 clubes, no fim da temporada): os participantes são definidos em src/jogo.ts (precisam do
// histórico das copas da carreira).
export type CopaId = "LIB" | "UCL" | "ACL" | "CON" | "INT" | "MUN" | EstadualId;
export interface InfoCopa { id: CopaId; nome: string; curto: string; regiao: string; cores: [string, string]; prep: "da" | "do"; uf?: string; vagas?: number }
const est = (id: EstadualId, nome: string, curto: string, uf: string, cores: [string, string], vagas = 8): InfoCopa => ({ id, nome, curto, regiao: "Brasil", cores, prep: "do", uf, vagas });
export const COPAS: Record<CopaId, InfoCopa> = {
  LIB: { id: "LIB", nome: "Copa Libertadora da América", curto: "Libertadora", regiao: "América do Sul", cores: ["#E3B341", "#1F3A5F"], prep: "da" },
  UCL: { id: "UCL", nome: "Champions Ligue", curto: "Champions", regiao: "Europa", cores: ["#0B1F5C", "#C9D3E6"], prep: "da" },
  ACL: { id: "ACL", nome: "Champions Ligue Asiática", curto: "Champions Asiática", regiao: "Ásia", cores: ["#0B6B6B", "#E3B341"], prep: "da" },
  CON: { id: "CON", nome: "Concachampions", curto: "Concachampions", regiao: "América do Norte", cores: ["#0B2F7A", "#C8102E"], prep: "da" },
  INT: { id: "INT", nome: "Copa Intercontinental", curto: "Intercontinental", regiao: "Mundo", cores: ["#C9A14A", "#1F1F1F"], prep: "da" },
  MUN: { id: "MUN", nome: "Mundial de Clubes", curto: "Mundial", regiao: "Mundo", cores: ["#C9A14A", "#0B2F7A"], prep: "do" },
  PAU: est("PAU", "Campeonato Paulista", "Paulistão", "SP", ["#C8102E", "#111111"]),
  CAR: est("CAR", "Campeonato Carioca", "Cariocão", "RJ", ["#0B3D91", "#F5C400"]),
  MIN: est("MIN", "Campeonato Mineiro", "Mineirão", "MG", ["#C8102E", "#FFFFFF"]),
  GAU: est("GAU", "Campeonato Gaúcho", "Gauchão", "RS", ["#0B7A3B", "#F5C400"]),
  PRN: est("PRN", "Campeonato Paranaense", "Paranaense", "PR", ["#0B7A3B", "#FFFFFF"]),
  CAT: est("CAT", "Campeonato Catarinense", "Catarinense", "SC", ["#C8102E", "#0B7A3B"]),
  BAI: est("BAI", "Campeonato Baiano", "Baianão", "BA", ["#0B3D91", "#C8102E"], 6),
  PER: est("PER", "Campeonato Pernambucano", "Pernambucano", "PE", ["#F5C400", "#0B3D91"], 6),
  CEA: est("CEA", "Campeonato Cearense", "Cearense", "CE", ["#0B7A3B", "#111111"]),
  GOI: est("GOI", "Campeonato Goiano", "Goianão", "GO", ["#0B7A3B", "#F5C400"]),
};
export const ehEstadual = (id: CopaId) => !!COPAS[id]?.uf;
/** Estado dos clubes das Séries A, B e C (os da Série D têm a UF no fim do id). */
const UF_CIDADE: Record<string, string> = {
  "Rio de Janeiro": "RJ", "Volta Redonda": "RJ", "São Paulo": "SP", "Santos": "SP", "Bragança Paulista": "SP", "Mirassol": "SP", "Campinas": "SP", "Ribeirão Preto": "SP",
  "Novo Horizonte": "SP", "São Bernardo do Campo": "SP", "Araraquara": "SP", "Itu": "SP", "Limeira": "SP", "Belo Horizonte": "MG", "São João del-Rei": "MG",
  "Porto Alegre": "RS", "Caxias do Sul": "RS", "Erechim": "RS", "Curitiba": "PR", "Londrina": "PR", "Ponta Grossa": "PR", "Maringá": "PR",
  "Chapecó": "SC", "Criciúma": "SC", "Florianópolis": "SC", "Brusque": "SC", "Balneário Camboriú": "SC", "Salvador": "BA", "Recife": "PE", "Fortaleza": "CE",
  "Goiânia": "GO", "Anápolis": "GO", "Belém": "PA", "Manaus": "AM", "São Luís": "MA", "Maceió": "AL", "Cuiabá": "MT", "Aracaju": "SE", "João Pessoa": "PB", "Itabaiana": "SE",
};
export const ufDoClube = (id: string, cidade: string) => (id.startsWith("D-") ? id.slice(-2) : UF_CIDADE[cidade] ?? "");
/** Vagas de cada liga (pela tabela final da temporada anterior) e convidados de cada copa. */
const VAGAS: Partial<Record<CopaId, [string, number][]>> = {
  LIB: [["BRA1", 7], ["ARG1", 6], ["URU1", 3], ["COL1", 3], ["CHI1", 3], ["PAR1", 3], ["ECU1", 3]],
  UCL: [["ENG1", 5], ["ESP1", 5], ["ITA1", 5], ["GER1", 5], ["FRA1", 4], ["POR1", 3], ["NED1", 3], ["TUR1", 1]],
  ACL: [["KSA1", 4]],
  // Concachampions: os 8 melhores da Liga MX e da MLS (os clubes do Canadá jogam a MLS)
  CON: [["MEX1", 8], ["USA1", 8]],
};
const REGIAO_CONV: Partial<Record<CopaId, string[]>> = { LIB: ["SUL"], UCL: ["EUR"], ACL: ["ASO", "ASL"] };

/** Semanas (da temporada) de cada fase; ida e volta usam duas semanas. */
/** Intercontinental: semanas livres de todas as copas. Mundial: depois da última rodada (semanas 40 a 46). */
/** Concachampions: mata-mata em ida e volta (16 clubes) e final em jogo único na casa do mais bem colocado. */
export const SEMANAS_CON = { oitavas: [5, 7], quartas: [12, 14], semi: [20, 21], final: [25] } as const;
export const SEMANAS_INT = { derby: [17], desafio: [27], final: [34] } as const;
export const SEMANAS_MUN = { grupos: [40, 41, 42], oitavas: [43], quartas: [44], semi: [45], final: [46] } as const;
export const ehMundial = (temporada: number) => temporada % 4 === 3; // 2029, 2033...
/** Confederação de um país (para o Mundial). */
export function confederacao(pais: string): string {
  if (["BRA", "ARG", "URU", "COL", "CHI", "PAR", "ECU", "PER", "BOL", "VEN"].includes(pais)) return "CONMEBOL";
  if (["MEX", "USA", "CAN"].includes(pais)) return "CONCACAF";
  if (["KSA", "UAE", "QAT", "IRN", "JPN", "KOR", "CHN", "AUS", "THA", "MAS"].includes(pais)) return "AFC";
  if (["EGY", "MAR", "TUN", "RSA", "ALG", "NGA"].includes(pais)) return "CAF";
  if (pais === "NZL") return "OFC";
  return "UEFA";
}
export const SEMANAS_ESTADUAL = { liga: [0, 1, 2, 3, 4, 6, 8], semi: [10], final: [11, 13] } as const;
export const SEMANAS_COPA = {
  LIB: { grupos: [5, 7, 9, 12, 14, 16], oitavas: [20, 21], quartas: [25, 26], semi: [30, 31], final: [36] },
  UCL: { liga: [4, 6, 8, 10, 13, 15, 18, 19], playoff: [21, 22], oitavas: [24, 25], quartas: [28, 29], semi: [32, 33], final: [37] },
  ACL: { liga: [4, 6, 8, 10, 13, 15, 18, 19], oitavas: [22, 23], quartas: [33], semi: [35], final: [37] },
} as const;
export const NOME_FASE: Record<string, string> = { derby: "Dérbi das Américas", desafio: "Desafio", turno: "Primeira fase", grupos: "Fase de grupos", liga: "Fase de liga", playoff: "Playoff", oitavas: "Oitavas de final", quartas: "Quartas de final", semi: "Semifinal", final: "Final" };

export interface JogoCopa {
  id: string; semana: number; fase: string; casa: string; fora: string;
  /** rodada da fase de grupos/liga, ou perna (1 = ida, 2 = volta) do mata-mata */
  rodada?: number; perna?: 1 | 2; serie?: string; grupo?: string; neutro?: boolean;
  gc?: number; gf?: number; penaltis?: string;
}
export interface EstadoCopa {
  id: CopaId; temporada: number; clubes: string[];
  /** tabelas: grupos "A".."H" (Libertadora), "Liga" (Champions), "Oeste"/"Leste" (Asiática) */
  tabelas: Record<string, LinhaTabela[]>;
  jogos: JogoCopa[]; fase: string; campeao?: string;
  /** até onde cada clube chegou */
  chegou: Record<string, string>;
}

// ------------------------------------------------------------------ classificação
export interface FonteTabelas {
  /** liga atual do jogador e a tabela final real dela (se já houver uma temporada jogada) */
  ligas: Record<string, Liga>; tabelaReal?: { ligaId: string; ordem: string[] };
  semente: string; temporada: number;
  /** cidade de cada clube (para saber o estado nos estaduais) */
  cidade?: (id: string) => string;
}
/** Ordem final da temporada anterior de uma liga: a real (a do jogador) ou simulada. */
export function ordemFinal(f: FonteTabelas, ligaId: string): string[] {
  if (f.tabelaReal?.ligaId === ligaId && f.tabelaReal.ordem.length) return f.tabelaReal.ordem;
  const l = f.ligas[ligaId];
  if (!l) return [];
  if (l.clubes.length > 20) { // ligas grandes (turno único): simula pela tabela da liga
    const tab = novaTabela(l), rng = new RNG(`${f.semente}|tabela-anterior|${ligaId}|${f.temporada}`);
    for (const r of rodadasDaLiga(l.clubes.length)) for (const [a, b] of r) { const [x, y] = simularPlacar(rng, l.clubes[a].forca, l.clubes[b].forca); registrar(tab[a], x, y); registrar(tab[b], y, x); }
    return ordenar(tab).map((t) => t.clube);
  }
  return simularTemporada(new RNG(`${f.semente}|tabela-anterior|${ligaId}|${f.temporada}`), l).tabela.map((t) => t.clube);
}
export function classificados(f: FonteTabelas, id: CopaId): string[] {
  const info = COPAS[id];
  if (info.uf) {
    // estadual: os clubes do estado, da Série A para baixo (dentro da divisão, os mais fortes)
    const div = ["BRA1", "BRA2", "BRA3", ..."ABCDEFGH".split("").map((g) => `BRA4${g}`)];
    const cs = div.flatMap((lid, i) => (f.ligas[lid]?.clubes ?? []).filter((c) => ufDoClube(c.id, f.cidade?.(c.id) ?? "") === info.uf).map((c) => ({ id: c.id, k: (i < 3 ? i : 3) * 100 - c.forca })));
    return cs.sort((a, b) => a.k - b.k).slice(0, info.vagas ?? 8).map((c) => c.id);
  }
  const doLigas = (VAGAS[id] ?? []).flatMap(([lid, n]) => ordemFinal(f, lid).slice(0, n));
  const conv = CONVIDADOS.filter((c) => (REGIAO_CONV[id] ?? []).includes(c.regiao)).map((c) => c.id);
  return [...doLigas, ...conv];
}

// ------------------------------------------------------------------ sorteio e calendário
const jid = (copa: CopaId, fase: string, n: number) => `${copa}-${fase}-${n}`;
/** Escolhe k rodadas do método do círculo: cada clube enfrenta k adversários diferentes, um por rodada. */
function rodadasDeLiga(rng: RNG, clubes: string[], k: number): [string, string][][] {
  const ord = rng.shuffle([...clubes]);
  const todas = tabelaTurnoReturno(ord.length).slice(0, ord.length - 1);
  const escolhidas = rng.shuffle(todas.map((_, i) => i)).slice(0, k).sort((a, b) => a - b);
  return escolhidas.map((i) => todas[i].map(([a, b]) => [ord[a], ord[b]] as [string, string]));
}

export function novaCopa(id: CopaId, temporada: number, clubes: string[], forca: (c: string) => number, paisDe: (c: string) => string, regiaoDe: (c: string) => string, semente: string): EstadoCopa {
  const rng = new RNG(`${semente}|copa|${id}|${temporada}`);
  const fase0 = id === "LIB" || id === "MUN" ? "grupos" : id === "INT" ? "derby" : ehEstadual(id) ? "turno" : "liga";
  const e: EstadoCopa = { id, temporada, clubes, tabelas: {}, jogos: [], fase: fase0, chegou: Object.fromEntries(clubes.map((c) => [c, fase0])) };
  const linha = (c: string): LinhaTabela => ({ clube: c, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0 });
  let n = 0;
  if (id === "CON") {
    // clubes: os 8 mexicanos e depois os 8 da MLS, cada lista do mais bem colocado para o pior: 1º do México × 8º da MLS...
    const mx = clubes.slice(0, 8), us = clubes.slice(8, 16);
    e.fase = "oitavas"; for (const c of clubes) e.chegou[c] = "oitavas";
    // o mais bem colocado na tabela do seu país decide em casa
    mx.forEach((c, i) => serie(e, "oitavas", `oitavas-${i + 1}`, i <= 3 ? c : us[7 - i], i <= 3 ? us[7 - i] : c, SEMANAS_CON.oitavas));
    return e;
  }
  if (id === "INT") {
    // clubes: [Concacaf (México/EUA), Libertadora, Asiática, Champions]. Dérbi: os dois americanos.
    const [nam, sul] = clubes;
    serie(e, "derby", "derby-1", sul, nam, SEMANAS_INT.derby, true);
    e.chegou[clubes[2]] = "desafio"; e.chegou[clubes[3]] = "final";
    return e;
  }
  if (id === "MUN") {
    // 4 potes de 8 pelo ranking (a lista vem em ordem); em cada grupo no máximo um clube por continente (Europa até 2)
    const potes = [0, 1, 2, 3].map((p) => clubes.slice(p * 8, p * 8 + 8));
    const sortear = () => {
      const grupos: string[][] = Array.from({ length: 8 }, () => []);
      let ok = true;
      for (const pote of potes.map((p) => rng.shuffle([...p]))) {
        const sobra = [...pote];
        for (const g of rng.shuffle([...grupos])) {
          const cabe = (c: string) => { const r = regiaoDe(c), n = g.filter((x) => regiaoDe(x) === r).length; return r === "UEFA" ? n < 2 : n < 1; };
          const i = sobra.findIndex(cabe);
          if (i < 0) ok = false;
          g.push(sobra.splice(i >= 0 ? i : 0, 1)[0]);
        }
      }
      return { grupos, ok };
    };
    let sorteio = sortear();
    for (let k = 0; k < 300 && !sorteio.ok; k++) sorteio = sortear();
    sorteio.grupos.forEach((g, gi) => {
      const nome = "ABCDEFGH"[gi];
      e.tabelas[nome] = g.map(linha);
      tabelaTurnoReturno(4).slice(0, 3).forEach((rod, r) => rod.forEach(([a, b]) => e.jogos.push({ id: jid(id, "grupos", n++), semana: SEMANAS_MUN.grupos[r], fase: "grupos", rodada: r + 1, grupo: nome, casa: g[a], fora: g[b], neutro: true })));
    });
    return e;
  }
  if (ehEstadual(id)) {
    // turno único: todos contra todos uma vez
    e.tabelas.Estadual = clubes.map(linha);
    const ord = rng.shuffle([...clubes]);
    tabelaTurnoReturno(ord.length).slice(0, ord.length - 1).forEach((rod, r) => rod.forEach(([a, b]) => e.jogos.push({ id: jid(id, "turno", n++), semana: SEMANAS_ESTADUAL.liga[r], fase: "turno", rodada: r + 1, grupo: "Estadual", casa: ord[a], fora: ord[b] })));
  } else if (id === "LIB") {
    // 4 potes de 8 por força; em cada grupo, um de cada pote, evitando dois do mesmo país
    const ord = [...clubes].sort((a, b) => forca(b) - forca(a));
    const sortear = () => {
      const grupos: string[][] = Array.from({ length: 8 }, () => []);
      let ok = true;
      for (const pote of [0, 1, 2, 3].map((p) => rng.shuffle(ord.slice(p * 8, p * 8 + 8)))) {
        const sobra = [...pote];
        for (const g of rng.shuffle([...grupos])) {
          const i = sobra.findIndex((c) => !g.some((x) => paisDe(x) === paisDe(c)));
          if (i < 0) ok = false;
          g.push(sobra.splice(i >= 0 ? i : 0, 1)[0]);
        }
      }
      return { grupos, ok };
    };
    // o sorteio refaz até não ter dois clubes do mesmo país no grupo
    let sorteio = sortear();
    for (let k = 0; k < 200 && !sorteio.ok; k++) sorteio = sortear();
    const grupos = sorteio.grupos;
    grupos.forEach((g, gi) => {
      const nome = "ABCDEFGH"[gi];
      e.tabelas[nome] = g.map(linha);
      tabelaTurnoReturno(4).forEach((rod, r) => rod.forEach(([a, b]) => e.jogos.push({ id: jid(id, "grupos", n++), semana: SEMANAS_COPA.LIB.grupos[r], fase: "grupos", rodada: r + 1, grupo: nome, casa: g[a], fora: g[b] })));
    });
  } else if (id === "UCL") {
    e.tabelas.Liga = clubes.map(linha);
    rodadasDeLiga(rng, clubes, 8).forEach((rod, r) => rod.forEach(([a, b]) => e.jogos.push({ id: jid(id, "liga", n++), semana: SEMANAS_COPA.UCL.liga[r], fase: "liga", rodada: r + 1, grupo: "Liga", casa: a, fora: b })));
  } else {
    for (const reg of ["Oeste", "Leste"]) {
      const cs = clubes.filter((c) => regiaoDe(c) === (reg === "Oeste" ? "ASO" : "ASL"));
      e.tabelas[reg] = cs.map(linha);
      rodadasDeLiga(rng, cs, 8).forEach((rod, r) => rod.forEach(([a, b]) => e.jogos.push({ id: jid(id, "liga", n++), semana: SEMANAS_COPA.ACL.liga[r], fase: "liga", rodada: r + 1, grupo: reg, casa: a, fora: b })));
    }
  }
  return e;
}

/** Série de mata-mata: ida e volta (o primeiro da lista decide em casa) ou jogo único. */
function serie(e: EstadoCopa, fase: string, nome: string, a: string, b: string, semanas: readonly number[], neutro = false) {
  const n = e.jogos.length;
  if (semanas.length === 1) e.jogos.push({ id: jid(e.id, fase, n), semana: semanas[0], fase, serie: nome, casa: a, fora: b, neutro });
  else {
    e.jogos.push({ id: jid(e.id, fase, n), semana: semanas[0], fase, serie: nome, perna: 1, casa: b, fora: a });
    e.jogos.push({ id: jid(e.id, fase, n + 1), semana: semanas[1], fase, serie: nome, perna: 2, casa: a, fora: b });
  }
}
/** Quem passou numa série (soma dos jogos; empate → pênaltis). */
export function vencedorSerie(e: EstadoCopa, nome: string): string | undefined {
  const js = e.jogos.filter((j) => j.serie === nome);
  if (!js.length || js.some((j) => j.gc === undefined)) return;
  const ultimo = js[js.length - 1];
  if (ultimo.penaltis) return ultimo.penaltis;
  const gols: Record<string, number> = {};
  for (const j of js) { gols[j.casa] = (gols[j.casa] ?? 0) + j.gc!; gols[j.fora] = (gols[j.fora] ?? 0) + j.gf!; }
  const [a, b] = [ultimo.casa, ultimo.fora];
  return gols[a] > gols[b] ? a : b;
}
const serieDe = (e: EstadoCopa, fase: string) => [...new Set(e.jogos.filter((j) => j.fase === fase).map((j) => j.serie!))];

/** Monta a próxima fase quando a atual termina. */
function proximaFase(e: EstadoCopa, forca: (c: string) => number) {
  const ord = (t: LinhaTabela[]) => ordenar(t).map((x) => x.clube);
  const marca = (cs: string[], fase: string) => cs.forEach((c) => (e.chegou[c] = fase));
  const vencedores = (fase: string) => serieDe(e, fase).map((s) => vencedorSerie(e, s)!);
  const pares = (cs: string[], fase: string, sem: readonly number[], neutro = false) => { for (let i = 0; i < cs.length; i += 2) serie(e, fase, `${fase}-${i / 2 + 1}`, cs[i], cs[i + 1], sem, neutro); };
  if (e.id === "CON") {
    const S = SEMANAS_CON, semente = (c: string) => e.clubes.indexOf(c) % 8; // posição na tabela do país (decide o mando)
    const melhorPrimeiro = (cs: string[]) => { const o: string[] = []; for (let i = 0; i < cs.length; i += 2) o.push(...(semente(cs[i]) <= semente(cs[i + 1]) ? [cs[i], cs[i + 1]] : [cs[i + 1], cs[i]])); return o; };
    if (e.fase === "oitavas") { const cs = melhorPrimeiro(vencedores("oitavas")); marca(cs, "quartas"); pares(cs, "quartas", S.quartas); e.fase = "quartas"; }
    else if (e.fase === "quartas") { const cs = melhorPrimeiro(vencedores("quartas")); marca(cs, "semi"); pares(cs, "semi", S.semi); e.fase = "semi"; }
    else if (e.fase === "semi") { const cs = melhorPrimeiro(vencedores("semi")); marca(cs, "final"); pares(cs, "final", S.final); e.fase = "final"; }
    else if (e.fase === "final") { e.campeao = vencedores("final")[0]; e.fase = "fim"; }
    return;
  }
  if (e.id === "INT") {
    // a ordem dos clubes em e.clubes: [Concacaf, Libertadora, Asiática, Champions]
    if (e.fase === "derby") { const v = vencedores("derby")[0]; marca([v, e.clubes[2]], "desafio"); serie(e, "desafio", "desafio-1", v, e.clubes[2], SEMANAS_INT.desafio, true); e.fase = "desafio"; }
    else if (e.fase === "desafio") { const v = vencedores("desafio")[0]; marca([v, e.clubes[3]], "final"); serie(e, "final", "final-1", e.clubes[3], v, SEMANAS_INT.final, true); e.fase = "final"; }
    else if (e.fase === "final") { e.campeao = vencedores("final")[0]; e.fase = "fim"; }
    return;
  }
  if (e.id === "MUN") {
    const S = SEMANAS_MUN;
    if (e.fase === "grupos") {
      const g = "ABCDEFGH".split("").map((k) => ord(e.tabelas[k]));
      const cs = [0, 2, 4, 6].flatMap((i) => [g[i][0], g[i + 1][1], g[i + 1][0], g[i][1]]); // 1ºA×2ºB, 1ºB×2ºA, 1ºC×2ºD...
      marca(cs, "oitavas"); pares(cs, "oitavas", S.oitavas, true); e.fase = "oitavas";
    } else if (e.fase === "oitavas") { const cs = vencedores("oitavas"); marca(cs, "quartas"); pares(cs, "quartas", S.quartas, true); e.fase = "quartas"; }
    else if (e.fase === "quartas") { const cs = vencedores("quartas"); marca(cs, "semi"); pares(cs, "semi", S.semi, true); e.fase = "semi"; }
    else if (e.fase === "semi") { const cs = vencedores("semi"); marca(cs, "final"); pares(cs, "final", S.final, true); e.fase = "final"; }
    else if (e.fase === "final") { e.campeao = vencedores("final")[0]; e.fase = "fim"; }
    return;
  }
  if (ehEstadual(e.id)) {
    const S = SEMANAS_ESTADUAL;
    if (e.fase === "turno") {
      // 1º×4º e 2º×3º, jogo único na casa do mais bem colocado
      const t = ord(e.tabelas.Estadual).slice(0, 4), cs = [t[0], t[3], t[1], t[2]];
      marca(cs, "semi"); pares(cs, "semi", S.semi); e.fase = "semi";
    } else if (e.fase === "semi") {
      // final em ida e volta: o mais bem colocado na primeira fase decide em casa
      const pos = ord(e.tabelas.Estadual), cs = vencedores("semi").sort((a, b) => pos.indexOf(a) - pos.indexOf(b));
      marca(cs, "final"); pares(cs, "final", S.final); e.fase = "final";
    } else if (e.fase === "final") { e.campeao = vencedores("final")[0]; e.fase = "fim"; }
  } else if (e.id === "LIB") {
    const S = SEMANAS_COPA.LIB;
    if (e.fase === "grupos") {
      const g = "ABCDEFGH".split("").map((k) => ord(e.tabelas[k]));
      // 1º de cada grupo decide em casa contra o 2º do grupo vizinho
      const cs = g.flatMap((t, i) => [t[0], g[(i + 1) % 8][1]]);
      marca(cs, "oitavas"); pares(cs, "oitavas", S.oitavas); e.fase = "oitavas";
    } else if (e.fase === "oitavas") { const cs = vencedores("oitavas"); marca(cs, "quartas"); pares(cs, "quartas", S.quartas); e.fase = "quartas"; }
    else if (e.fase === "quartas") { const cs = vencedores("quartas"); marca(cs, "semi"); pares(cs, "semi", S.semi); e.fase = "semi"; }
    else if (e.fase === "semi") { const cs = vencedores("semi"); marca(cs, "final"); pares(cs, "final", S.final, true); e.fase = "final"; }
    else if (e.fase === "final") { e.campeao = vencedores("final")[0]; e.fase = "fim"; }
  } else if (e.id === "UCL") {
    const S = SEMANAS_COPA.UCL;
    if (e.fase === "liga") {
      const t = ord(e.tabelas.Liga);
      const po = t.slice(8, 24); // 9º×24º, 10º×23º...: o mais bem colocado decide em casa
      const cs = Array.from({ length: 8 }, (_, i) => [po[i], po[15 - i]]).flat();
      marca(t.slice(0, 8), "oitavas"); marca(po, "playoff"); pares(cs, "playoff", S.playoff); e.fase = "playoff";
    } else if (e.fase === "playoff") {
      const top = ord(e.tabelas.Liga).slice(0, 8), w = vencedores("playoff"); // 1º pega o vencedor do 16º×17º...
      const cs = top.flatMap((c, i) => [c, w[7 - i]]);
      marca(w, "oitavas"); pares(cs, "oitavas", S.oitavas); e.fase = "oitavas";
    } else if (e.fase === "oitavas") { const cs = vencedores("oitavas"); marca(cs, "quartas"); pares(cs, "quartas", S.quartas); e.fase = "quartas"; }
    else if (e.fase === "quartas") { const cs = vencedores("quartas"); marca(cs, "semi"); pares(cs, "semi", S.semi); e.fase = "semi"; }
    else if (e.fase === "semi") { const cs = vencedores("semi"); marca(cs, "final"); pares(cs, "final", S.final, true); e.fase = "final"; }
    else if (e.fase === "final") { e.campeao = vencedores("final")[0]; e.fase = "fim"; }
  } else {
    const S = SEMANAS_COPA.ACL;
    if (e.fase === "liga") {
      const cs: string[] = [];
      for (const reg of ["Oeste", "Leste"]) { const t = ord(e.tabelas[reg]).slice(0, 8); cs.push(t[0], t[7], t[3], t[4], t[1], t[6], t[2], t[5]); }
      marca(cs, "oitavas"); pares(cs, "oitavas", S.oitavas); e.fase = "oitavas";
    } else if (e.fase === "oitavas") { const cs = vencedores("oitavas"); marca(cs, "quartas"); pares(cs, "quartas", S.quartas, true); e.fase = "quartas"; }
    else if (e.fase === "quartas") { const cs = vencedores("quartas"); marca(cs, "semi"); pares(cs, "semi", S.semi, true); e.fase = "semi"; }
    else if (e.fase === "semi") { const cs = vencedores("semi"); marca(cs, "final"); pares(cs, "final", S.final, true); e.fase = "final"; } // final: campeão do Oeste × campeão do Leste
    else if (e.fase === "final") { e.campeao = vencedores("final")[0]; e.fase = "fim"; }
  }
  void forca;
}

/** Joga a rodada da semana (os jogos que ainda não têm placar). placar: o do jogo do jogador, se ele jogou. */
/** No estadual o grande x pequeno é menos desigual que a força dos clubes sugere (time pequeno se fecha, joga a vida). */
export const forcaNoEstadual = (f: number) => 64 + (f - 64) * 0.6;
export function rodarSemana(e: EstadoCopa, semana: number, forcaReal: (c: string) => number, rng: RNG, meu?: { id: string; gc: number; gf: number; penaltis?: string }) {
  const forca = ehEstadual(e.id) ? (c: string) => forcaNoEstadual(forcaReal(c)) : forcaReal;
  for (const j of e.jogos) {
    if (j.semana !== semana || j.gc !== undefined) continue;
    if (meu && meu.id === j.id) { j.gc = meu.gc; j.gf = meu.gf; if (meu.penaltis) j.penaltis = meu.penaltis; }
    else {
      // campo neutro: sem vantagem de mando (sorteia quem "joga em casa" na simulação)
      const [a, b] = j.neutro && rng.chance(0.5) ? [j.fora, j.casa] : [j.casa, j.fora];
      const [x, y] = simularPlacar(rng, forca(a), forca(b));
      [j.gc, j.gf] = a === j.casa ? [x, y] : [y, x];
    }
    if (j.grupo) {
      const t = e.tabelas[j.grupo];
      registrar(t.find((x) => x.clube === j.casa)!, j.gc!, j.gf!);
      registrar(t.find((x) => x.clube === j.fora)!, j.gf!, j.gc!);
    } else if (!j.penaltis && (j.perna === 2 || !j.perna)) {
      // decidiu no empate? pênaltis
      const js = e.jogos.filter((x) => x.serie === j.serie);
      const g: Record<string, number> = {};
      for (const x of js) { g[x.casa] = (g[x.casa] ?? 0) + (x.gc ?? 0); g[x.fora] = (g[x.fora] ?? 0) + (x.gf ?? 0); }
      if (g[j.casa] === g[j.fora]) j.penaltis = penaltis(rng, j.casa, j.fora, forca);
    }
  }
  // fase terminou? monta a próxima
  const daFase = e.jogos.filter((j) => j.fase === e.fase);
  if (e.fase !== "fim" && daFase.length && daFase.every((j) => j.gc !== undefined)) {
    proximaFase(e, forca);
    for (const c of e.clubes) if (!e.chegou[c]) e.chegou[c] = "liga";
  }
}
export const penaltis = (rng: RNG, a: string, b: string, forca: (c: string) => number) => (rng.chance(0.5 + (forca(a) - forca(b)) / 120) ? a : b);

// ------------------------------------------------------------------ consultas
export const copaDoClube = (copas: Partial<Record<CopaId, EstadoCopa>> | undefined, clubeId: string) => Object.values(copas ?? {}).find((e) => e && e.clubes.includes(clubeId));
/** Jogo do clube nesta semana (ainda sem placar). */
export function jogoDoClubeNaSemana(copas: Partial<Record<CopaId, EstadoCopa>> | undefined, clubeId: string, semana: number): { copa: EstadoCopa; jogo: JogoCopa } | undefined {
  for (const e of Object.values(copas ?? {})) {
    if (!e) continue;
    const j = e.jogos.find((x) => x.semana === semana && (x.casa === clubeId || x.fora === clubeId));
    if (j) return { copa: e, jogo: j };
  }
}
/** "Fase de liga · rodada 3", "Oitavas de final · volta", "Final"... */
export function rotuloJogo(j: JogoCopa): string {
  if (j.rodada) return `${NOME_FASE[j.fase]} · rodada ${j.rodada}${j.grupo && j.grupo.length === 1 ? ` · grupo ${j.grupo}` : ""}`;
  return `${NOME_FASE[j.fase]}${j.perna ? ` · ${j.perna === 1 ? "ida" : "volta"}` : ""}`;
}
/** Ida da série (para mostrar o placar agregado na volta). */
export const idaDe = (e: EstadoCopa, j: JogoCopa) => (j.perna === 2 ? e.jogos.find((x) => x.serie === j.serie && x.perna === 1) : undefined);
/** Região do clube na Champions Asiática (os do Golfo jogam no Oeste). */
export const regiaoNaCopa = (clubeId: string) => CONVIDADOS.find((c) => c.id === clubeId)?.regiao ?? "ASO";
