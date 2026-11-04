// Modo técnico — modelo: atletas com atributos, formações, tática, força do time em campo, comissão técnica e dinheiro.
// O mundo (ligas, clubes, jogadores, transferências entre os outros clubes) é o mesmo do modo jogador; o elenco do
// clube do técnico fica no save e é ele quem manda nele.
import { RNG, clamp } from "../rng.js";
import { ATRIBUTOS, ovr as ovrAtributos, peso, type Atributo, type Atributos, type Posicao } from "../atributos.js";
import { valorMercado, CAMBIO } from "../mercado.js";
import type { JogadorNPC } from "../liga.js";
import { extrasIniciais, type Extras } from "../detalhes.js";
import { idiomasIniciais, nivelEm, fatorComunicacao, type Idiomas } from "../idiomas.js";
import { FUNCAO, encaixe, melhorFuncao, type Funcao as FuncaoJogo } from "../funcoes.js";
import type { CursoTecnico } from "../licencas.js";

export type PosT = Posicao | "GOL";
export const POS_T: PosT[] = ["GOL", "ZAG", "LAT", "VOL", "MEI", "PON", "ATA"];
export const NOME_POS_T: Record<PosT, string> = { GOL: "Goleiro", ZAG: "Zagueiro", LAT: "Lateral", VOL: "Volante", MEI: "Meia", PON: "Ponta", ATA: "Atacante" };
export const SIGLA_POS_T: Record<PosT, string> = { GOL: "GOL", ZAG: "ZAG", LAT: "LAT", VOL: "VOL", MEI: "MEI", PON: "PON", ATA: "ATA" };
export const NOME_AT: Record<Atributo, string> = { VEL: "Velocidade", RES: "Resistência", FOR: "Força", PAS: "Passe", CRU: "Cruzamento", DRI: "Drible", FIN: "Finalização", CAB: "Cabeceio", MAR: "Marcação", VIS: "Visão", POS: "Posicionamento", COM: "Compostura" };
/** Para o goleiro, os mesmos números com o nome do que eles medem embaixo das traves. */
export const NOME_AT_GOL: Partial<Record<Atributo, string>> = { VEL: "Reflexos", POS: "Colocação", COM: "Frieza", FOR: "Saída do gol", CAB: "Jogo aéreo", PAS: "Reposição" };

const PESO_GOL: Partial<Record<Atributo, number>> = { POS: 3, COM: 3, VEL: 3, FOR: 2, CAB: 2, PAS: 1 };
/** OVR numa posição (goleiro tem pesos próprios). */
export function ovrPos(at: Atributos, pos: PosT): number {
  if (pos !== "GOL") return ovrAtributos(at, pos);
  let s = 0, w = 0;
  for (const a of ATRIBUTOS) { const p = PESO_GOL[a] ?? 0.3; s += p * at[a]; w += p; }
  return s / w;
}
const pesoNa = (pos: PosT, a: Atributo) => (pos === "GOL" ? PESO_GOL[a] ?? 0.3 : peso(pos, a));

/** Atributos coerentes com um OVR e uma posição: fortes onde a posição pede, fracos no resto; o OVR fecha no alvo. */
export function gerarAtributos(rng: RNG, pos: PosT, alvo: number): Atributos {
  const at = {} as Atributos;
  for (const a of ATRIBUTOS) {
    const p = pesoNa(pos, a), off = p >= 3 ? 5 : p >= 2 ? 1 : pos === "GOL" ? -14 : -6;
    at[a] = alvo + off + rng.normal(0, 4);
  }
  for (let k = 0; k < 6; k++) { const d = alvo - ovrPos(at, pos); for (const a of ATRIBUTOS) at[a] += d; }
  for (const a of ATRIBUTOS) at[a] = clamp(Math.round(at[a]), 20, 99);
  return at;
}

// ------------------------------------------------------------------ atletas
export interface Atleta {
  id: string; nome: string; pos: PosT; /** pontas e laterais: lado preferido */ lado?: Lado; idade: number; nac: string; at: Atributos; pot: number; numero: number;
  /** 0 a 100 */ moral: number; /** 0 a 100 */ condicao: number;
  /** semanas fora */ lesao: number; lesaoTipo?: string; /** jogos de suspensão */ suspenso: number; amarelos: number;
  /** R$ por mês */ salario: number; /** última temporada do contrato (índice da carreira) */ contratoAte: number;
  /** 1 a 20 */ prof: number; /** 1 a 20: quanto mais alto, mais explode */ temp: number;
  /** relação com o técnico, 0 a 100 */ relacao: number;
  notas: number[]; jogos: number; gols: number; assist: number; amarelosT: number; vermelhosT: number;
  /** semanas seguidas sem entrar em campo */ semJogar: number;
  /** prometeu titularidade: jogos que ainda pode ficar fora antes de se sentir enganado */ promessa?: number;
  /** já conversou com ele nesta semana */ conversa?: number;
  /** subiu da base do clube */ base?: boolean;
  /** pediu para sair (moral no chão) */ querSair?: boolean;
  /** temporada em que chegou */ desde: number;
  /** atributos detalhados (bola parada e mentais), idiomas, aulas pagas pelo clube e o curso de técnico recomendado */
  ex?: Extras; idiomas?: Idiomas; aulas?: { lingua: string; ate: number }; curso?: CursoTecnico;
}
/** Detalhados e idiomas: quem ainda não tem ganha na primeira leitura (sempre os mesmos para o mesmo jogador). */
export const exDe = (a: Atleta): Extras => (a.ex ??= extrasIniciais(a.id, a.at, { profissionalismo: a.prof, temperamento: a.temp }, a.idade));
export const idiomasDe = (a: Atleta): Idiomas => (a.idiomas ??= idiomasIniciais(a.id, a.nac, a.idade));
export const ovrDe = (a: Atleta) => Math.round(ovrPos(a.at, a.pos));
export const formaDe = (a: Atleta) => (a.notas.length ? a.notas.slice(-5).reduce((x, y) => x + y, 0) / Math.min(5, a.notas.length) : 6.5);
export const disponivel = (a: Atleta) => a.lesao <= 0 && a.suspenso <= 0;

/** Salário justo (R$/mês) de um jogador para um clube: valor de mercado, força financeira do clube e da liga. */
export function salarioJusto(ovr: number, idade: number, fLiga: number, fSalario: number, fClube: number): number {
  const vm = valorMercado(ovr, idade, 3, fLiga);
  const piso = fLiga >= 0.9 ? 25_000 : fLiga >= 0.6 ? 8_000 : 3_000;
  return Math.round(Math.max(piso, (0.09 * vm * CAMBIO * fClube * fSalario) / 12) / 100) * 100;
}
/** Valor de mercado em reais. */
export const valorAtleta = (a: Atleta, fLiga: number, temporada: number) => valorMercado(ovrDe(a), a.idade, Math.max(0, a.contratoAte - temporada + 1), fLiga) * CAMBIO;

/** Jogador do mundo vira atleta do elenco (atributos coerentes com o OVR, personalidade e contrato). */
export function atletaDoMundo(j: JogadorNPC, semente: string, clubeId: string, t: number, sal: (ovr: number, idade: number) => number): Atleta {
  const rng = new RNG(`${semente}|atleta|${j.nome}`), pos = j.posicao as PosT;
  const at = gerarAtributos(rng, pos, j.ovr);
  const pot = Math.max(j.ovr, j.pot ?? Math.round(j.ovr + Math.max(0, (24 - j.idade) * rng.range(0.8, 2.2))));
  return {
    id: `${clubeId}|${j.nome}`, nome: j.nome, pos, idade: j.idade, nac: j.nacionalidade, at, pot: clamp(pot, j.ovr, 96), numero: j.numero ?? 0,
    moral: rng.int(58, 76), condicao: 100, lesao: 0, suspenso: 0, amarelos: 0, salario: sal(j.ovr, j.idade), contratoAte: t + rng.int(0, 3),
    prof: rng.int(4, 20), temp: rng.int(1, 20), relacao: 50, notas: [], jogos: 0, gols: 0, assist: 0, amarelosT: 0, vermelhosT: 0, semJogar: 0, desde: t,
    ...(j.base ? { base: true } : {}),
  };
}

// ------------------------------------------------------------------ formações
export interface Vaga { pos: PosT; x: number; y: number; rot: string }
const G: Vaga = { pos: "GOL", x: 50, y: 92, rot: "GOL" };
const LE: Vaga = { pos: "LAT", x: 12, y: 70, rot: "LE" }, LD: Vaga = { pos: "LAT", x: 88, y: 70, rot: "LD" };
export const FORMACOES: Record<string, Vaga[]> = {
  "4-3-3": [G, LE, { pos: "ZAG", x: 37, y: 76, rot: "ZAG" }, { pos: "ZAG", x: 63, y: 76, rot: "ZAG" }, LD,
    { pos: "VOL", x: 50, y: 57, rot: "VOL" }, { pos: "MEI", x: 30, y: 44, rot: "MC" }, { pos: "MEI", x: 70, y: 44, rot: "MC" },
    { pos: "PON", x: 15, y: 20, rot: "PE" }, { pos: "ATA", x: 50, y: 13, rot: "CA" }, { pos: "PON", x: 85, y: 20, rot: "PD" }],
  "4-4-2": [G, LE, { pos: "ZAG", x: 37, y: 76, rot: "ZAG" }, { pos: "ZAG", x: 63, y: 76, rot: "ZAG" }, LD,
    { pos: "PON", x: 12, y: 44, rot: "ME" }, { pos: "VOL", x: 38, y: 50, rot: "VOL" }, { pos: "MEI", x: 62, y: 48, rot: "MC" }, { pos: "PON", x: 88, y: 44, rot: "MD" },
    { pos: "ATA", x: 38, y: 16, rot: "CA" }, { pos: "ATA", x: 62, y: 16, rot: "CA" }],
  "4-2-3-1": [G, LE, { pos: "ZAG", x: 37, y: 76, rot: "ZAG" }, { pos: "ZAG", x: 63, y: 76, rot: "ZAG" }, LD,
    { pos: "VOL", x: 37, y: 58, rot: "VOL" }, { pos: "VOL", x: 63, y: 58, rot: "VOL" },
    { pos: "PON", x: 15, y: 32, rot: "PE" }, { pos: "MEI", x: 50, y: 35, rot: "MEI" }, { pos: "PON", x: 85, y: 32, rot: "PD" }, { pos: "ATA", x: 50, y: 12, rot: "CA" }],
  "3-5-2": [G, { pos: "ZAG", x: 26, y: 75, rot: "ZAG" }, { pos: "ZAG", x: 50, y: 78, rot: "ZAG" }, { pos: "ZAG", x: 74, y: 75, rot: "ZAG" },
    { pos: "LAT", x: 8, y: 47, rot: "ALA" }, { pos: "VOL", x: 50, y: 58, rot: "VOL" }, { pos: "MEI", x: 31, y: 43, rot: "MC" }, { pos: "MEI", x: 69, y: 43, rot: "MC" }, { pos: "LAT", x: 92, y: 47, rot: "ALA" },
    { pos: "ATA", x: 38, y: 15, rot: "CA" }, { pos: "ATA", x: 62, y: 15, rot: "CA" }],
  "5-3-2": [G, { pos: "LAT", x: 8, y: 64, rot: "ALA" }, { pos: "ZAG", x: 28, y: 76, rot: "ZAG" }, { pos: "ZAG", x: 50, y: 79, rot: "ZAG" }, { pos: "ZAG", x: 72, y: 76, rot: "ZAG" }, { pos: "LAT", x: 92, y: 64, rot: "ALA" },
    { pos: "VOL", x: 50, y: 54, rot: "VOL" }, { pos: "MEI", x: 28, y: 42, rot: "MC" }, { pos: "MEI", x: 72, y: 42, rot: "MC" },
    { pos: "ATA", x: 38, y: 15, rot: "CA" }, { pos: "ATA", x: 62, y: 15, rot: "CA" }],
};
export const NOMES_FORMACAO = Object.keys(FORMACOES);

/** Lado de ponta e lateral: esquerdo ou direito (fixo por atleta; quem não tem no save, sorteia pelo id). */
export type Lado = "E" | "D";
const hashL = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
export const ladoDe = (a: Pick<Atleta, "id" | "pos"> & { lado?: Lado }): Lado | undefined => (a.pos === "PON" || a.pos === "LAT" ? a.lado ?? (hashL(`lado|${a.id}`) % 100 < 52 ? "D" : "E") : undefined);
/** Vaga de um lado do campo (pontas, meias abertos, laterais e alas). */
export const ladoDaVaga = (v: Vaga): Lado | undefined => (v.pos === "PON" || v.pos === "LAT" ? (v.x < 50 ? "E" : v.x > 50 ? "D" : undefined) : undefined);
/** Rótulo da posição com o lado: PE/PD para pontas, LE/LD para laterais. */
export const rotuloPos = (a: Pick<Atleta, "id" | "pos"> & { lado?: Lado }) => { const l = ladoDe(a); return a.pos === "PON" ? (l === "E" ? "PE" : "PD") : a.pos === "LAT" ? (l === "E" ? "LE" : "LD") : a.pos; };
/** Posições parecidas: quem joga numa rende quase igual na outra. */
const AFIM: Record<PosT, PosT[]> = { GOL: [], ZAG: ["VOL", "LAT"], LAT: ["ZAG", "PON"], VOL: ["ZAG", "MEI"], MEI: ["VOL", "PON", "ATA"], PON: ["LAT", "MEI", "ATA"], ATA: ["PON", "MEI"] };
/** OVR do atleta numa vaga: a conta dos atributos naquela posição, com desconto para quem não é dali. */
export function ovrNaVaga(a: Atleta, pos: PosT, lado?: Lado): number {
  const base = ovrPos(a.at, pos);
  // lado trocado: ponta rende um pouco menos (pode virar invertido); lateral sente mais
  if (a.pos === pos) return base - (lado && ladoDe(a) && ladoDe(a) !== lado ? (pos === "LAT" ? 4 : 2) : 0);
  if (pos === "GOL" || a.pos === "GOL") return base - 25;
  return base - (AFIM[a.pos].includes(pos) ? 3 : 9);
}
export const rotuloEncaixe = (a: Atleta, pos: PosT, lado?: Lado) => (a.pos === pos ? (lado && ladoDe(a) && ladoDe(a) !== lado ? "lado trocado" : "") : pos === "GOL" || a.pos === "GOL" ? "fora de posição" : AFIM[a.pos].includes(pos) ? "improvisado" : "fora de posição");

// ------------------------------------------------------------------ tática
export interface Tatica {
  formacao: string;
  /** 0 muito defensiva · 1 defensiva · 2 equilibrada · 3 ofensiva · 4 muito ofensiva */
  mentalidade: number;
  /** 0 baixa · 1 média · 2 alta */
  pressao: number; ritmo: number; linha: number; largura: number;
  contraAtaque: boolean;
}
export const taticaPadrao = (): Tatica => ({ formacao: "4-3-3", mentalidade: 2, pressao: 1, ritmo: 1, linha: 1, largura: 1, contraAtaque: false });
export const NOME_MENTALIDADE = ["Muito defensiva", "Defensiva", "Equilibrada", "Ofensiva", "Muito ofensiva"];
export const NOME_NIVEL3 = { pressao: ["Recuada", "Média", "Alta"], ritmo: ["Cadenciado", "Normal", "Acelerado"], linha: ["Baixa", "Média", "Alta"], largura: ["Fechado", "Normal", "Aberto"] };

export interface Escalacao { titulares: (string | null)[]; reservas: string[]; capitao?: string; batedor?: string;
  /** função de cada jogador (id do atleta → id da função); sem escolha, vale a que ele rende mais na vaga */
  funcoes?: Record<string, string> }
/** A função do atleta na vaga: a escolhida (se for da posição da vaga) ou a que ele encaixa melhor. */
export function funcaoNaVaga(esc: Escalacao, a: Atleta, pos: PosT): FuncaoJogo | undefined {
  const f = FUNCAO[esc.funcoes?.[a.id] ?? ""];
  return f && f.pos === pos ? f : melhorFuncao(a.at, exDe(a), pos);
}

/** Melhor escalação para uma formação: preenche primeiro as vagas mais difíceis, com quem está disponível. */
export function melhorEscalacao(elenco: Atleta[], formacao: string, nReservas = 9): Escalacao {
  const vagas = FORMACOES[formacao] ?? FORMACOES["4-3-3"];
  const livres = elenco.filter(disponivel), usados = new Set<string>(), tit: (string | null)[] = vagas.map(() => null);
  const efetivo = (a: Atleta, v: Vaga) => ovrNaVaga(a, v.pos, ladoDaVaga(v)) * (0.85 + 0.15 * a.condicao / 100);
  // ordem: goleiro, depois as posições com menos opções naturais
  const ordem = vagas.map((v, i) => ({ v, i, n: livres.filter((a) => a.pos === v.pos).length })).sort((a, b) => (a.v.pos === "GOL" ? -1 : b.v.pos === "GOL" ? 1 : a.n - b.n));
  for (const { v, i } of ordem) {
    const m = livres.filter((a) => !usados.has(a.id)).sort((a, b) => efetivo(b, v) - efetivo(a, v))[0];
    if (m) { tit[i] = m.id; usados.add(m.id); }
  }
  // banco: um goleiro e o resto por qualidade, cobrindo as posições
  const resto = livres.filter((a) => !usados.has(a.id)).sort((a, b) => ovrDe(b) - ovrDe(a)), reservas: string[] = [];
  const gol = resto.find((a) => a.pos === "GOL"); if (gol) reservas.push(gol.id);
  for (const p of ["ZAG", "LAT", "VOL", "MEI", "PON", "ATA"] as PosT[]) { const x = resto.find((a) => a.pos === p && !reservas.includes(a.id)); if (x && reservas.length < nReservas) reservas.push(x.id); }
  for (const a of resto) if (reservas.length < nReservas && !reservas.includes(a.id)) reservas.push(a.id);
  const lider = tit.map((id) => elenco.find((a) => a.id === id)).filter(Boolean).sort((a, b) => b!.idade + b!.prof - (a!.idade + a!.prof))[0];
  const batedor = tit.map((id) => elenco.find((a) => a.id === id)).filter(Boolean).sort((a, b) => b!.at.FIN + b!.at.COM - (a!.at.FIN + a!.at.COM))[0];
  const funcoes: Record<string, string> = {};
  vagas.forEach((v, i) => { const a = elenco.find((x) => x.id === tit[i]); const f = a && melhorFuncao(a.at, exDe(a), v.pos); if (a && f) funcoes[a.id] = f.id; });
  return { titulares: tit, reservas, capitao: lider?.id, batedor: batedor?.id, funcoes };
}

export interface ForcaTime { defesa: number; meio: number; ataque: number; geral: number }
/** Força do time em campo: o OVR de cada um na vaga, a condição, a moral, o entrosamento e a tática. */
export function forcaDoTime(elenco: Atleta[], esc: Escalacao, tat: Tatica, entrosamento: number, lingua?: string): ForcaTime {
  const vagas = FORMACOES[tat.formacao] ?? FORMACOES["4-3-3"], por = new Map(elenco.map((a) => [a.id, a]));
  const grupo = { defesa: [0, 0], meio: [0, 0], ataque: [0, 0] }, papel = { ataque: 0, meio: 0, defesa: 0 };
  const somar = (g: keyof typeof grupo, v: number, w: number) => { grupo[g][0] += v * w; grupo[g][1] += w; };
  const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
  const naVaga: { a: Atleta; v: Vaga }[] = [];
  vagas.forEach((v, i) => {
    const a = por.get(esc.titulares[i] ?? "");
    let ef = a && disponivel(a) ? ovrNaVaga(a, v.pos, ladoDaVaga(v)) * (0.8 + 0.2 * a.condicao / 100) * (0.94 + 0.12 * a.moral / 100) : 32;
    if (a && disponivel(a)) {
      // a função: quem encaixa bem rende acima do OVR, quem não encaixa rende abaixo; e ela puxa o time para um lado
      const fn = funcaoNaVaga(esc, a, v.pos), base = ovrPos(a.at, v.pos);
      if (fn) {
        const enc = encaixe(a.at, exDe(a), fn), forca = clamp(enc / Math.max(40, base), 0.6, 1.3);
        ef += clamp((enc - base) * 0.25, -5, 5);
        papel.ataque += (fn.efeito.ataque ?? 0) * forca; papel.meio += (fn.efeito.meio ?? 0) * forca; papel.defesa += (fn.efeito.defesa ?? 0) * forca;
        if (fn.contra && tat.contraAtaque) papel.ataque += 0.006;
      }
      // quem não fala a língua do clube se comunica pior em campo
      if (lingua) ef *= 0.975 + 0.025 * fatorComunicacao(nivelEm(idiomasDe(a), lingua));
    }
    if (a) naVaga.push({ a, v });
    switch (v.pos) {
      case "GOL": somar("defesa", ef, 2.2); break;
      case "ZAG": somar("defesa", ef, 1.2); break;
      case "LAT": somar("defesa", ef, 0.9); somar("meio", ef, 0.3); somar("ataque", ef, 0.25); break;
      case "VOL": somar("defesa", ef, 0.6); somar("meio", ef, 1); break;
      case "MEI": somar("meio", ef, 1); somar("ataque", ef, 0.5); break;
      case "PON": somar("meio", ef, 0.4); somar("ataque", ef, 1); break;
      case "ATA": somar("ataque", ef, 1.3); break;
    }
  });
  let defesa = grupo.defesa[0] / Math.max(1, grupo.defesa[1]), meio = grupo.meio[0] / Math.max(1, grupo.meio[1]), ataque = grupo.ataque[0] / Math.max(1, grupo.ataque[1]);
  const ent = 0.95 + 0.05 * entrosamento / 100;
  defesa *= 1 + papel.defesa; meio *= 1 + papel.meio; ataque *= 1 + papel.ataque;
  // concentração da defesa: menos erros
  const conc = naVaga.filter((x) => x.v.pos === "GOL" || x.v.pos === "ZAG" || x.v.pos === "LAT").map((x) => exDe(x.a).CON);
  if (conc.length) defesa *= 1 + clamp((media(conc) - 60) / 1500, -0.015, 0.015);
  defesa *= ent; meio *= ent; ataque *= ent;
  const m = tat.mentalidade - 2;
  ataque *= 1 + 0.022 * m; defesa *= 1 - 0.018 * m;
  meio *= 1 + 0.012 * (tat.pressao - 1);
  ataque *= 1 + 0.006 * (tat.ritmo - 1);
  // linha alta só funciona com zagueiros rápidos; largura rende com quem cruza bem
  const zags = naVaga.filter((x) => x.v.pos === "ZAG").map((x) => x.a.at.VEL), abertos = naVaga.filter((x) => x.v.pos === "LAT" || x.v.pos === "PON").map((x) => x.a.at.CRU);
  if (tat.linha === 2) defesa *= media(zags) >= 70 ? 1.012 : 0.975;
  if (tat.linha === 0) { defesa *= 1.01; meio *= 0.99; }
  if (tat.largura !== 1) ataque *= 1 + (tat.largura - 1) * clamp((media(abertos) - 62) / 400, -0.03, 0.03);
  const rapidos = naVaga.filter((x) => x.v.pos === "ATA" || x.v.pos === "PON").map((x) => x.a.at.VEL);
  if (tat.contraAtaque && tat.mentalidade <= 2 && media(rapidos) >= 70) ataque *= 1.025;
  return { defesa, meio, ataque, geral: (defesa + meio + ataque) / 3 };
}

// ------------------------------------------------------------------ comissão técnica
export type Funcao = "auxiliar" | "preparador" | "goleiros" | "medico" | "base" | "olheiro";
export const FUNCOES: Funcao[] = ["auxiliar", "preparador", "goleiros", "medico", "base", "olheiro"];
export const NOME_FUNCAO: Record<Funcao, string> = { auxiliar: "Auxiliar técnico", preparador: "Preparador físico", goleiros: "Treinador de goleiros", medico: "Médico", base: "Coordenador da base", olheiro: "Olheiro" };
export const EFEITO_FUNCAO: Record<Funcao, string> = {
  auxiliar: "O time pega a tática mais rápido e as conversas rendem mais.",
  preparador: "Recuperação física mais rápida e menos lesões.",
  goleiros: "Os goleiros evoluem mais.",
  medico: "Lesões mais curtas.",
  base: "Garotos melhores na base todo começo de temporada.",
  olheiro: "Mostra o potencial dos agentes livres e acha nomes melhores.",
};
export interface Membro { nome: string; nac: string; idade: number; nivel: number; salario: number; /** ex-atleta do clube, formado técnico */ ex?: boolean }
export const salarioStaff = (nivel: number, fLiga: number) => Math.round((14_000 * Math.pow(nivel, 1.7) * Math.max(0.25, fLiga * fLiga)) / 100) * 100;

// ------------------------------------------------------------------ dinheiro
/** Preço médio do ingresso (R$) pela força da liga. */
export const precoIngresso = (fLiga: number) => Math.round(30 + 90 * fLiga * fLiga);
/** Custo de cada obra pedida à diretoria (R$), pela força da liga. */
export const custoObra = (tipo: "estadio" | "ct" | "base", nivel: number, fLiga: number, lugares = 0) =>
  Math.round((tipo === "estadio" ? lugares * 3_500 : tipo === "ct" ? 9e6 * nivel : 4.5e6 * nivel) * Math.max(0.35, fLiga) / 1e5) * 1e5;
