// Estatísticas completas da partida (as dos dois modos): passes certos e errados, finalizações no campinho (gol,
// defesa, fora, bloqueada), defesas do goleiro, desarmes, interceptações, faltas, cartões, escanteios, impedimentos e o
// mapa de calor de cada jogador. Tudo derivado do jogo que aconteceu (placar, autores, posse, notas) e sempre igual para
// a mesma partida. Só mostra: não muda placar nem nota.
import { RNG, clamp } from "./rng.js";

export type PosEst = "GOL" | "ZAG" | "LAT" | "VOL" | "MEI" | "PON" | "ATA";
export interface JogadorEntrada { /** sem escalação conhecida (preenche o time) */ generico?: boolean; id: string; nome: string; pos: string; /** lado do campo (E/D) para lateral e ponta */ lado?: "E" | "D"; min: number; gols: number; assist: number; nota: number; time: 0 | 1; eu?: boolean }
export interface Ponto { x: number; y: number }
export type ResultadoChute = "gol" | "defesa" | "fora" | "bloqueado";
export interface Finalizacao extends Ponto { min: number; time: 0 | 1; resultado: ResultadoChute; xg: number; autor?: string }
export interface Passe { de: Ponto; para: Ponto; certo: boolean }
export interface EstatJogador {
  id: string; nome: string; pos: string; time: 0 | 1; min: number; nota: number; gols: number; assist: number; eu?: boolean; generico?: boolean;
  passes: number; passesCertos: number; finalizacoes: number; noAlvo: number; desarmes: number; interceptacoes: number; dribles: number; faltas: number; defesas: number;
  /** mapa de calor: grade 12 × 8 (x do próprio gol ao gol adversário), de 0 a 1 */ calor: number[];
  mapaPasses: Passe[]; mapaDesarmes: Ponto[];
}
export interface TotaisTime { posse: number; passes: number; passesCertos: number; finalizacoes: number; noAlvo: number; bloqueadas: number; xg: number; desarmes: number; interceptacoes: number; faltas: number; amarelos: number; vermelhos: number; escanteios: number; impedimentos: number; defesas: number }
export interface EstatCompleta { times: [TotaisTime, TotaisTime]; finalizacoes: Finalizacao[]; jogadores: EstatJogador[] }

export const GX = 12, GY = 8;
const pos7 = (p: string): PosEst => (["GOL", "ZAG", "LAT", "VOL", "MEI", "PON", "ATA"].includes(p) ? p as PosEst : p === "ME" || p === "MD" ? "PON" : p === "PE" || p === "PD" ? "PON" : p === "LE" || p === "LD" ? "LAT" : p === "SA" ? "ATA" : p === "MC" || p === "MO" ? "MEI" : "MEI");
/** Onde cada posição costuma ficar (x: 0 = o próprio gol, 100 = o gol adversário; y: 0 = esquerda, 100 = direita) e o quanto se espalha. */
const ZONA: Record<PosEst, { x: number; y: number; sx: number; sy: number }> = {
  GOL: { x: 5, y: 50, sx: 3, sy: 8 }, ZAG: { x: 24, y: 50, sx: 8, sy: 13 }, LAT: { x: 44, y: 10, sx: 18, sy: 6 }, VOL: { x: 40, y: 50, sx: 12, sy: 16 },
  MEI: { x: 58, y: 50, sx: 15, sy: 18 }, PON: { x: 68, y: 12, sx: 16, sy: 8 }, ATA: { x: 80, y: 50, sx: 10, sy: 14 },
};
/** Por 90 minutos: passes tentados, acerto base, finalizações (peso), desarmes, interceptações, dribles e faltas. */
const PERFIL: Record<PosEst, { passes: number; acerto: number; chute: number; des: number; inter: number; drible: number; falta: number }> = {
  GOL: { passes: 28, acerto: 0.74, chute: 0, des: 0, inter: 0.3, drible: 0, falta: 0.05 },
  ZAG: { passes: 52, acerto: 0.89, chute: 0.5, des: 2.4, inter: 2.2, drible: 0.2, falta: 1.1 },
  LAT: { passes: 46, acerto: 0.81, chute: 0.6, des: 2.2, inter: 1.3, drible: 1.0, falta: 1.0 },
  VOL: { passes: 60, acerto: 0.88, chute: 0.9, des: 3.0, inter: 1.8, drible: 0.6, falta: 1.6 },
  MEI: { passes: 54, acerto: 0.84, chute: 1.8, des: 1.4, inter: 0.9, drible: 1.6, falta: 1.0 },
  PON: { passes: 34, acerto: 0.77, chute: 2.2, des: 0.8, inter: 0.4, drible: 2.6, falta: 0.6 },
  ATA: { passes: 24, acerto: 0.71, chute: 3.4, des: 0.5, inter: 0.3, drible: 1.4, falta: 0.9 },
};
/** Time "de mentira" do adversário quando não temos a escalação dele (um 4-3-3 comum). */
const ONZE: { pos: PosEst; lado?: "E" | "D" }[] = [{ pos: "GOL" }, { pos: "LAT", lado: "D" }, { pos: "ZAG" }, { pos: "ZAG" }, { pos: "LAT", lado: "E" }, { pos: "VOL" }, { pos: "MEI" }, { pos: "MEI" }, { pos: "PON", lado: "D" }, { pos: "ATA" }, { pos: "PON", lado: "E" }];

export interface EntradaEstat {
  semente: string;
  /** posse de bola do time 0 (casa), em % */ posse: number;
  /** força dos dois times (0 a 100) */ forca: [number, number];
  placar: [number, number];
  /** autores dos gols (por time), com o minuto */ gols?: { time: 0 | 1; min: number; autor?: string }[];
  /** finalizações e no alvo já contadas (se o jogo já tinha), por time */ chutes?: [number, number]; noAlvo?: [number, number];
  cartoes?: { amarelos: [number, number]; vermelhos: [number, number] }; escanteios?: [number, number]; faltas?: [number, number];
  jogadores: JogadorEntrada[];
}
export function gerarEstatCompleta(e: EntradaEstat): EstatCompleta {
  const rng = new RNG(`estat-completa|${e.semente}`);
  const posse: [number, number] = [clamp(Math.round(e.posse), 25, 75), 0]; posse[1] = 100 - posse[0];
  // completa os times sem escalação com um 4-3-3 genérico
  const js: JogadorEntrada[] = [...e.jogadores];
  for (const t of [0, 1] as const) if (!js.some((j) => j.time === t)) ONZE.forEach((o, i) => js.push({ id: `t${t}-${i}`, nome: `${o.pos}${o.lado ? ` ${o.lado}` : ""}`, pos: o.pos, ...(o.lado ? { lado: o.lado } : {}), min: 90, gols: 0, assist: 0, nota: 6.4, time: t, generico: true }));
  // ladinhos: alterna esquerda e direita entre os laterais/pontas sem lado
  const ladoDe = (j: JogadorEntrada, i: number): "E" | "D" => j.lado ?? (i % 2 ? "E" : "D");
  // finalizações por time: as que o jogo contou, ou pela força e pela posse
  const chutes = [0, 1].map((t) => e.chutes?.[t] ?? Math.max(e.placar[t] + 2, Math.round(6 + (e.forca[t] - e.forca[1 - t]) / 4 + (posse[t] - 50) / 6 + rng.normal(0, 2)))) as [number, number];
  const noAlvo = [0, 1].map((t) => Math.max(e.placar[t], Math.min(chutes[t], e.noAlvo?.[t] ?? Math.round(chutes[t] * (0.32 + rng.next() * 0.14))))) as [number, number];
  const finalizacoes: Finalizacao[] = [];
  const jogs: EstatJogador[] = js.map((j, i) => {
    const p = pos7(j.pos), f = PERFIL[p], z = ZONA[p], m = clamp(j.min, 0, 90) / 90, r = new RNG(`${e.semente}|j|${j.id}`);
    const fPosse = posse[j.time] / 50, bom = (j.nota - 6.4) / 2;
    const passes = Math.round(f.passes * m * (0.7 + 0.3 * fPosse) * (0.85 + r.next() * 0.3));
    const acerto = clamp(f.acerto + bom * 0.05 + (posse[j.time] - 50) / 400 + r.normal(0, 0.03), 0.45, 0.97);
    const passesCertos = Math.round(passes * acerto);
    const des = Math.max(0, Math.round(f.des * m * (1.3 - 0.3 * fPosse) * (0.7 + r.next() * 0.6) + bom * 0.5));
    const inter = Math.max(0, Math.round(f.inter * m * (1.2 - 0.2 * fPosse) * (0.6 + r.next() * 0.8)));
    const dribles = Math.max(0, Math.round(f.drible * m * (0.6 + r.next() * 0.8) + bom * 0.4));
    const faltas = Math.max(0, Math.round(f.falta * m * (0.4 + r.next() * 1.2)));
    // calor: amostras em volta da zona da posição (o lado certo para lateral e ponta; quem tem a bola sobe)
    const lado = ladoDe(j, i), cy = p === "LAT" || p === "PON" ? (lado === "E" ? z.y : 100 - z.y) : p === "ZAG" ? (i % 2 ? 36 : 64) : z.y;
    const cx = z.x + (posse[j.time] - 50) / 3 + bom * 2;
    const calor = new Array(GX * GY).fill(0), amostras = Math.max(6, Math.round(160 * m));
    for (let k = 0; k < amostras; k++) {
      const x = clamp(cx + r.normal(0, z.sx), 0, 99.9), y = clamp(cy + r.normal(0, z.sy), 0, 99.9);
      calor[Math.floor(y / (100 / GY)) * GX + Math.floor(x / (100 / GX))]++;
    }
    const mx = Math.max(1, ...calor);
    const ponto = (dx = 0): Ponto => ({ x: clamp(cx + dx + r.normal(0, z.sx), 2, 98), y: clamp(cy + r.normal(0, z.sy), 2, 98) });
    const mapaPasses: Passe[] = Array.from({ length: Math.min(passes, 40) }, (_, k) => {
      const de = ponto(), certo = k < Math.round(Math.min(passes, 40) * acerto);
      const para = { x: clamp(de.x + r.normal(8, 14), 2, 98), y: clamp(de.y + r.normal(0, 18), 2, 98) };
      return { de, para, certo };
    });
    const mapaDesarmes = Array.from({ length: des + inter }, () => ponto(-6));
    return { id: j.id, nome: j.nome, pos: j.pos, time: j.time, min: j.min, nota: j.nota, gols: j.gols, assist: j.assist, ...(j.eu ? { eu: true } : {}), ...(j.generico ? { generico: true } : {}),
      passes, passesCertos, finalizacoes: 0, noAlvo: 0, desarmes: des, interceptacoes: inter, dribles, faltas, defesas: 0, calor: calor.map((c) => +(c / mx).toFixed(2)), mapaPasses, mapaDesarmes };
  });
  // finalizações: os gols com o autor certo, e o resto espalhado por quem chuta mais (atacante, ponta, meia)
  for (const t of [0, 1] as const) {
    const meus = jogs.filter((j) => j.time === t && j.min > 0), pesos = meus.map((j) => PERFIL[pos7(j.pos)].chute * (j.min / 90) + 0.05);
    const sorteia = () => { let x = rng.next() * pesos.reduce((a, b) => a + b, 0); for (let k = 0; k < meus.length; k++) { x -= pesos[k]; if (x <= 0) return meus[k]; } return meus[meus.length - 1]; };
    const gols = (e.gols ?? []).filter((g) => g.time === t);
    for (let k = 0; k < e.placar[t]; k++) {
      const g = gols[k], autor = (g?.autor && meus.find((j) => j.nome === g.autor)) || meus.filter((j) => j.gols > 0).find((j) => finalizacoes.filter((f) => f.autor === j.nome && f.resultado === "gol").length < j.gols) || sorteia();
      const xg = +(0.18 + rng.next() * 0.55).toFixed(2);
      finalizacoes.push({ min: g?.min ?? rng.int(1, 90), time: t, x: 84 + rng.next() * 12, y: 32 + rng.next() * 36, resultado: "gol", xg, ...(autor ? { autor: autor.nome } : {}) });
    }
    const resto = chutes[t] - e.placar[t], alvoResto = noAlvo[t] - e.placar[t];
    for (let k = 0; k < resto; k++) {
      const a = sorteia(), res: ResultadoChute = k < alvoResto ? "defesa" : rng.chance(0.3) ? "bloqueado" : "fora";
      const longe = rng.chance(0.38), x = longe ? 66 + rng.next() * 14 : 80 + rng.next() * 16, y = longe ? 15 + rng.next() * 70 : 28 + rng.next() * 44;
      finalizacoes.push({ min: rng.int(1, 90), time: t, x, y, resultado: res, xg: +(longe ? 0.02 + rng.next() * 0.05 : 0.06 + rng.next() * 0.3).toFixed(2), ...(a ? { autor: a.nome } : {}) });
    }
  }
  finalizacoes.sort((a, b) => a.min - b.min);
  for (const f of finalizacoes) { const j = jogs.find((x) => x.time === f.time && x.nome === f.autor); if (j) { j.finalizacoes++; if (f.resultado === "gol" || f.resultado === "defesa") j.noAlvo++; } }
  // defesas do goleiro: as finalizações no alvo do outro time que não entraram
  for (const t of [0, 1] as const) { const g = jogs.find((j) => j.time === t && pos7(j.pos) === "GOL"); if (g) g.defesas = finalizacoes.filter((f) => f.time !== t && f.resultado === "defesa").length; }
  const soma = (t: 0 | 1, k: keyof EstatJogador) => jogs.filter((j) => j.time === t).reduce((a, j) => a + (j[k] as number), 0);
  const times = [0, 1].map((t) => {
    const tt = t as 0 | 1, fs = finalizacoes.filter((f) => f.time === tt);
    return { posse: posse[tt], passes: soma(tt, "passes"), passesCertos: soma(tt, "passesCertos"), finalizacoes: fs.length, noAlvo: fs.filter((f) => f.resultado === "gol" || f.resultado === "defesa").length,
      bloqueadas: fs.filter((f) => f.resultado === "bloqueado").length, xg: +fs.reduce((a, f) => a + f.xg, 0).toFixed(2), desarmes: soma(tt, "desarmes"), interceptacoes: soma(tt, "interceptacoes"),
      faltas: e.faltas?.[tt] ?? soma(tt, "faltas"), amarelos: e.cartoes?.amarelos[tt] ?? Math.round(rng.next() * 3), vermelhos: e.cartoes?.vermelhos[tt] ?? 0,
      escanteios: e.escanteios?.[tt] ?? Math.max(0, Math.round(2 + fs.length / 3 + rng.normal(0, 1.5))), impedimentos: Math.max(0, Math.round(1 + rng.normal(0.5, 1.2))), defesas: soma(tt, "defesas") };
  }) as [TotaisTime, TotaisTime];
  return { times, finalizacoes, jogadores: jogs };
}
