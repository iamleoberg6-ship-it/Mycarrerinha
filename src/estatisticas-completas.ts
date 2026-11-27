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
  /** autores dos gols (por time), com o minuto; contra = gol contra (não conta para ninguém) */ gols?: { time: 0 | 1; min: number; autor?: string; contra?: boolean }[];
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
      const g = gols[k], autor = g?.contra ? undefined : (g?.autor && meus.find((j) => j.nome === g.autor)) || meus.filter((j) => j.gols > 0).find((j) => finalizacoes.filter((f) => f.autor === j.nome && f.resultado === "gol").length < j.gols) || sorteia();
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

// ------------------------------------------------------------------ o seu time no modo jogador
/** Gol do seu time como a partida contou: minuto, quem fez e quem passou (nome curto). passe "" = sem assistência. */
export interface GolDoTime { min: number; autor?: string; posAutor?: string; passe?: string; posPasse?: string; contra?: boolean }
export interface Troca { min: number; sai: string; entra: string }
interface Atleta { nome: string; curto: string; pos: string; ovr: number }
const PESO_ASSIST: Record<string, number> = { PON: 3, MEI: 3, LAT: 2, ATA: 1.6, VOL: 1.2, ZAG: 0.5, GOL: 0.1 };
const PESO_GOL: Record<string, number> = { ATA: 4, PON: 2.6, MEI: 1.6, VOL: 0.6, LAT: 0.4, ZAG: 0.6, GOL: 0 };
const PESO_SAIR: Record<string, number> = { ATA: 3, PON: 3, MEI: 2.5, LAT: 1.4, VOL: 1.4, ZAG: 0.5, GOL: 0 };

/**
 * Monta a escalação do seu time no modo jogador com o que o jogo contou: titulares (um 4-3-3 com os melhores de cada
 * posição), de três a cinco substituições, quem fez cada gol e quem deu o passe (quase todo gol tem assistência; pênalti,
 * falta e jogada individual não). Quem a narração cita como autor ou garçom está em campo naquele minuto.
 * O seu jogador entra, sai, marca e dá passe exatamente como a partida contou.
 */
export function escalacaoDoJogo(x: {
  semente: string; plantel: { nome: string; posicao: string; ovr: number }[]; curto: (n: string) => string;
  eu?: { nome: string; pos: string; entrada: number; saida: number; nota: number }; gols: GolDoTime[]; time: 0 | 1;
}): { jogadores: JogadorEntrada[]; trocas: Troca[]; gols: { min: number; autor?: string; contra?: boolean }[] } {
  const r = new RNG(`escalacao|${x.semente}`);
  const vagas: [string, number][] = [["GOL", 1], ["LAT", 2], ["ZAG", 2], ["VOL", 1], ["MEI", 2], ["PON", 2], ["ATA", 1]];
  const eu = x.eu && x.eu.entrada <= 90 && x.eu.saida > x.eu.entrada ? x.eu : undefined;
  const todos: Atleta[] = x.plantel.map((j) => ({ nome: j.nome, curto: x.curto(j.nome), pos: j.posicao, ovr: j.ovr }));
  const usados = new Set<string>(), onze: Atleta[] = [];
  for (const [pos, n] of vagas) {
    const vaga = n - (eu && eu.entrada === 0 && pos === eu.pos ? 1 : 0);
    for (const a of todos.filter((j) => j.pos === pos && !usados.has(j.nome)).slice(0, vaga)) { onze.push(a); usados.add(a.nome); }
  }
  // quem a narração citou e não está no plantel do mundo (lesão, base): entra na lista com a posição que a narração deu
  const achar = (n: string, pos?: string): Atleta => {
    let a = todos.find((j) => j.curto === n) ?? todos.find((j) => j.nome === n);
    if (!a) { a = { nome: n, curto: n, pos: pos ?? "MEI", ovr: 60 }; todos.push(a); }
    return a;
  };
  const em = new Map<string, number>(), fora = new Map<string, number>(); // minuto em que entrou / saiu
  for (const a of onze) em.set(a.nome, 0);
  const trocas: Troca[] = [];
  const emCampo = (min: number) => [...em.keys()].filter((n) => em.get(n)! <= min && (fora.get(n) ?? 91) > min);
  // o que cada um precisa: estar em campo no minuto do gol que fez ou passou
  const precisa = new Map<string, number[]>();
  const golsTime = [...x.gols].sort((a, b) => a.min - b.min);
  for (const g of golsTime) for (const [n, p] of [[g.autor, g.posAutor], [g.passe, g.posPasse]] as const) {
    if (!n || (eu && n === eu.nome)) continue;
    const a = achar(n, p); precisa.set(a.nome, [...(precisa.get(a.nome) ?? []), g.min]);
  }
  const ocupado = (nome: string, depois: number) => (precisa.get(nome) ?? []).some((m) => m >= depois);
  const nomeDe = (n: string) => todos.find((a) => a.nome === n);
  const trocar = (min: number, sai: string, entra: Atleta) => { fora.set(sai, min); em.set(entra.nome, min); trocas.push({ min, sai, entra: entra.nome }); };
  /** quem sai para alguém entrar: mesma posição de preferência, nunca o goleiro nem quem ainda vai participar de um gol */
  const quemSai = (min: number, pos: string, pesoPos = false): string | undefined => {
    const c = emCampo(min).filter((n) => !fora.has(n) && (!pesoPos || em.get(n) === 0) && !ocupado(n, min) && nomeDe(n)?.pos !== "GOL");
    if (!c.length) return undefined;
    const mesma = c.filter((n) => nomeDe(n)?.pos === pos);
    if (mesma.length && !pesoPos) return mesma.sort((a, b) => nomeDe(a)!.ovr - nomeDe(b)!.ovr)[0];
    const pesos = c.map((n) => PESO_SAIR[nomeDe(n)!.pos] ?? 1 + 0.01);
    let t = r.next() * pesos.reduce((s, v) => s + v, 0);
    for (let k = 0; k < c.length; k++) { t -= pesos[k]; if (t <= 0) return c[k]; }
    return c[c.length - 1];
  };
  // 1) citados que não começaram: gol no primeiro tempo = titular (no lugar do pior da posição); depois, entram antes do lance
  for (const [nome, mins] of precisa) {
    if (em.has(nome)) continue;
    const a = nomeDe(nome)!, primeiro = Math.min(...mins);
    if (primeiro <= 46) {
      const sub = onze.filter((o) => o.pos === a.pos && !precisa.has(o.nome)).sort((p, q) => p.ovr - q.ovr)[0] ?? onze.filter((o) => o.pos !== "GOL" && !precisa.has(o.nome)).sort((p, q) => p.ovr - q.ovr)[0];
      if (sub) { em.delete(sub.nome); onze.splice(onze.indexOf(sub), 1); }
      onze.push(a); em.set(a.nome, 0);
    } else {
      const min = r.int(46, Math.max(46, primeiro - 1)), sai = quemSai(min, a.pos);
      if (sai) trocar(min, sai, a); else em.set(a.nome, min);
    }
  }
  // 2) o seu jogador: entrou do banco no lugar de alguém da posição; saiu antes do fim e alguém da posição entrou
  const banco = () => todos.filter((a) => !em.has(a.nome) && a.nome !== eu?.nome);
  if (eu && eu.entrada > 0) { const sai = quemSai(eu.entrada, eu.pos); if (sai) { fora.set(sai, eu.entrada); trocas.push({ min: eu.entrada, sai, entra: eu.nome }); } }
  if (eu && eu.saida < 90) { const b = banco().filter((a) => a.pos === eu.pos)[0] ?? banco().filter((a) => a.pos !== "GOL")[0]; if (b) { em.set(b.nome, eu.saida); trocas.push({ min: eu.saida, sai: eu.nome, entra: b.nome }); } }
  // 3) as trocas do técnico até fechar de três a cinco, do intervalo em diante (mais no fim)
  const alvo = Math.min(5, Math.max(trocas.length, r.int(3, 5)));
  for (let k = 0; trocas.length < alvo && k < 20; k++) {
    const min = r.chance(0.08) ? 46 : r.int(56, 87), sai = quemSai(min, "", true);
    if (!sai) continue;
    const pos = nomeDe(sai)?.pos ?? "MEI", b = banco().filter((a) => a.pos === pos)[0] ?? banco().filter((a) => a.pos !== "GOL")[0];
    if (b) trocar(min, sai, b);
  }
  trocas.sort((a, b) => a.min - b.min);
  // 4) gols e passes: o que a narração disse; sem passe dito, quase sempre alguém em campo deu
  const gols = new Map<string, number>(), assist = new Map<string, number>(), add = (m: Map<string, number>, n: string) => m.set(n, (m.get(n) ?? 0) + 1);
  const golsSaida: { min: number; autor?: string; contra?: boolean }[] = [];
  for (const g of golsTime) {
    if (g.contra) { golsSaida.push({ min: g.min, contra: true }); continue; }
    let autor = g.autor ? (eu && g.autor === eu.nome ? eu.nome : achar(g.autor).nome) : undefined;
    if (!autor) { // a partida não disse quem fez (gol que saiu de uma decisão sua, por exemplo): alguém em campo
      const passeJa = g.passe && !(eu && g.passe === eu.nome) ? achar(g.passe).nome : g.passe;
      const c = emCampo(g.min).filter((n) => n !== passeJa && nomeDe(n)?.pos !== "GOL");
      const pesos = c.map((n) => PESO_GOL[nomeDe(n)?.pos ?? "MEI"] ?? 1);
      let t = r.next() * pesos.reduce((s, v) => s + v, 0);
      for (let k = 0; k < c.length && !autor; k++) { t -= pesos[k]; if (t <= 0) autor = c[k]; }
      autor ??= c[c.length - 1];
    }
    if (autor) add(gols, autor);
    golsSaida.push({ min: g.min, ...(autor ? { autor } : {}) });
    let passe = g.passe === undefined ? undefined : g.passe === "" ? "" : eu && g.passe === eu.nome ? eu.nome : achar(g.passe).nome;
    if (passe === undefined && r.chance(0.88)) {
      const c = emCampo(g.min).filter((n) => n !== autor && n !== eu?.nome);
      const pesos = c.map((n) => PESO_ASSIST[nomeDe(n)?.pos ?? "MEI"] ?? 1);
      let t = r.next() * pesos.reduce((s, v) => s + v, 0);
      for (let k = 0; k < c.length && passe === undefined; k++) { t -= pesos[k]; if (t <= 0) passe = c[k]; }
    }
    if (passe) add(assist, passe);
  }
  const jogadores: JogadorEntrada[] = [];
  if (eu) jogadores.push({ id: "eu", nome: eu.nome, pos: eu.pos, min: Math.max(1, Math.min(90, eu.saida) - eu.entrada), gols: gols.get(eu.nome) ?? 0, assist: assist.get(eu.nome) ?? 0, nota: eu.nota, time: x.time, eu: true });
  let ladoK = 0;
  for (const [nome, ini] of em) {
    const a = nomeDe(nome)!, min = Math.max(1, (fora.get(nome) ?? 90) - ini), g = gols.get(nome) ?? 0, as = assist.get(nome) ?? 0;
    const nota = +clamp(6.2 + r.normal(0.1, 0.5) + g * 0.8 + as * 0.45 - (ini > 0 ? 0.1 : 0), 4.5, 9.8).toFixed(1);
    jogadores.push({ id: nome, nome, pos: a.pos, ...(a.pos === "LAT" || a.pos === "PON" ? { lado: (ladoK++ % 2 ? "E" : "D") as "E" | "D" } : {}), min, gols: g, assist: as, nota, time: x.time });
  }
  return { jogadores, trocas, gols: golsSaida };
}
