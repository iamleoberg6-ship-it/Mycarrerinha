// O scout: você não sabe o nível exato de quem não é seu. O mercado mostra uma faixa ("68–76") que fecha conforme o
// conhecimento que o seu departamento de scout tem da liga (cresce onde você manda os olheiros procurar), a
// qualidade dos olheiros e do chefe, e os relatórios individuais (mandar alguém observar um jogador por duas semanas).
import { RNG, clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { infoLiga, LIGAS } from "../ligas.js";
import { CARGOS, notaNoCargo, fatorChefe } from "./staff.js";
import type { SaveTecnico } from "./motor.js";

/** Focos especiais além das ligas. */
export const FOCO_JOVENS = "jovens", FOCO_LIVRES = "livres";
export interface EstadoScout {
  /** conhecimento (0 a 100) de cada liga e dos focos especiais */ con: Record<string, number>;
  /** onde os olheiros estão procurando agora */ focos: string[];
  /** relatórios pedidos: jogador (nome|clube) → semana em que fica pronto */ obs: Record<string, number>;
}
const chave = (nome: string, clubeId?: string) => `${nome}|${clubeId ?? "livre"}`;
const semanaAbsS = (s: SaveTecnico) => s.temporada * 60 + s.semana;

export function scoutInicial(s: SaveTecnico): EstadoScout {
  const pais = infoLiga(s.ligaId).pais, con: Record<string, number> = {};
  for (const l of LIGAS) con[l.id] = l.id === s.ligaId ? 55 : l.pais === pais ? 35 : 8;
  con[FOCO_JOVENS] = 10; con[FOCO_LIVRES] = 20;
  return { con, focos: [s.ligaId], obs: {} };
}
export const scoutDe = (s: SaveTecnico): EstadoScout => (s.scout ??= scoutInicial(s));

/** A força do departamento de scout: soma dos olheiros (o chefe vale meio olheiro e organiza a rede). */
export function forcaScout(s: SaveTecnico): number {
  const eq = s.deps?.scout ?? [];
  const soma = eq.reduce((a, m) => a + notaNoCargo(m, m.cargo ?? "olheiro") * (CARGOS[m.cargo ?? "olheiro"].chefe ? 0.5 : 1), 0);
  return soma * fatorChefe(s.deps, "scout");
}
/** Quantos focos ao mesmo tempo (um por pessoa do scout, no mínimo um). */
export const vagasFoco = (s: SaveTecnico) => Math.max(1, (s.deps?.scout ?? []).length);
/** Quantos relatórios individuais ao mesmo tempo. */
export const vagasObs = (s: SaveTecnico) => Math.max(1, Math.ceil((s.deps?.scout ?? []).length / 2));
/** Qualidade média de quem avalia (0 a 5): o olho do olheiro conta mesmo onde a rede já conhece bem. */
export function olhoScout(s: SaveTecnico): number {
  const eq = s.deps?.scout ?? [];
  return eq.length ? Math.max(...eq.map((m) => notaNoCargo(m, m.cargo ?? "olheiro"))) : 0;
}

/** A semana do scout: cresce o conhecimento onde há foco, cai devagar onde ninguém olha. */
export function semanaScout(s: SaveTecnico): string[] {
  const e = scoutDe(s), forca = forcaScout(s), n = Math.max(1, e.focos.length), avisos: string[] = [];
  const pais = infoLiga(s.ligaId).pais;
  for (const k of Object.keys(e.con)) {
    const piso = k === s.ligaId ? 45 : LIGAS.find((l) => l.id === k)?.pais === pais ? 25 : k === FOCO_LIVRES ? 15 : 5;
    if (e.focos.includes(k)) e.con[k] = clamp(e.con[k] + (forca * 1.15) / n * (1 - e.con[k] / 115), 0, 100);
    else e.con[k] = Math.max(piso, e.con[k] - 0.25);
  }
  e.con[s.ligaId] = Math.max(e.con[s.ligaId] ?? 0, 45);
  const ab = semanaAbsS(s);
  for (const [k, ate] of Object.entries(e.obs)) if (ate === ab) avisos.push(`Relatório pronto: ${k.split("|")[0]}.`);
  // relatórios velhos (mais de uma temporada) perdem a validade
  for (const [k, ate] of Object.entries(e.obs)) if (ab - ate > 60) delete e.obs[k];
  return avisos;
}
export function mudarFoco(s: SaveTecnico, foco: string): { ok: boolean; msg: string } {
  const e = scoutDe(s);
  if (e.focos.includes(foco)) { e.focos = e.focos.filter((f) => f !== foco); return { ok: true, msg: "Foco retirado." }; }
  if (e.focos.length >= vagasFoco(s)) return { ok: false, msg: `Seu scout só cobre ${vagasFoco(s)} ${vagasFoco(s) === 1 ? "foco" : "focos"} ao mesmo tempo (um por pessoa). Tire um foco ou contrate mais olheiros.` };
  e.focos.push(foco);
  return { ok: true, msg: "Olheiros a caminho. O conhecimento cresce semana a semana." };
}
export function observar(s: SaveTecnico, nome: string, clubeId?: string): { ok: boolean; msg: string } {
  const e = scoutDe(s), ab = semanaAbsS(s), k = chave(nome, clubeId);
  if (e.obs[k] !== undefined) return { ok: false, msg: e.obs[k] > ab ? "Já tem gente observando esse jogador." : "O relatório desse jogador já está pronto." };
  const andando = Object.values(e.obs).filter((x) => x > ab).length;
  if (!(s.deps?.scout ?? []).length) return { ok: false, msg: "Você não tem ninguém no scout. Contrate olheiros em Clube → Comissão técnica." };
  if (andando >= vagasObs(s)) return { ok: false, msg: `Seus olheiros já estão em ${andando} ${andando === 1 ? "relatório" : "relatórios"}. Espere terminar ou contrate mais gente.` };
  const semanas = olhoScout(s) >= 4 ? 1 : 2;
  e.obs[k] = ab + semanas;
  return { ok: true, msg: `Um olheiro vai acompanhar ${nome} por ${semanas === 1 ? "uma semana" : "duas semanas"}.` };
}
export function statusObs(s: SaveTecnico, nome: string, clubeId?: string): "nao" | "andando" | "pronto" {
  const v = scoutDe(s).obs[chave(nome, clubeId)];
  return v === undefined ? "nao" : v > semanaAbsS(s) ? "andando" : "pronto";
}

/** O potencial de quem é de fora (o mundo não guarda): a mesma conta para o mesmo jogador. */
export function potNpc(nome: string, ovr: number, idade: number): number {
  const r = new RNG(`pot|${nome}`);
  return Math.min(95, Math.max(ovr, Math.round(ovr + Math.max(0, 24 - idade) * r.range(0.6, 2.1))));
}
export interface Faixa { min: number; max: number; pmin: number; pmax: number; exato: boolean; con: number }
/** O que o seu scout sabe do jogador: uma faixa de OVR e de potencial (exata com relatório bom e liga conhecida). */
export function faixaDe(s: SaveTecnico, j: { nome: string; ovr: number; idade: number; pot?: number }, ligaId?: string, clubeId?: string): Faixa {
  const e = scoutDe(s), pot = j.pot ?? potNpc(j.nome, j.ovr, j.idade);
  let con = ligaId ? e.con[ligaId] ?? 5 : e.con[FOCO_LIVRES] ?? 15;
  if (j.idade <= 21) con = Math.max(con, e.con[FOCO_JOVENS] ?? 0);
  const st = statusObs(s, j.nome, clubeId), olho = olhoScout(s);
  let h = 9.5 - con / 12 - olho * 0.55;
  if (st === "pronto") h -= 4 + olho * 0.4;
  const hO = clamp(Math.round(h), 0, 9), hP = clamp(Math.round(h * 1.4 + (j.idade <= 23 ? 2 : 0)), 0, 12);
  // a faixa não fica sempre centrada: o olheiro pode puxar para cima ou para baixo (sempre contendo o real)
  const r = new RNG(`faixa|${s.semente}|${j.nome}`), dO = Math.round(r.range(-0.5, 0.5) * hO), dP = Math.round(r.range(-0.5, 0.5) * hP);
  const min = clamp(j.ovr - hO + dO, 30, 99), max = clamp(j.ovr + hO + dO, 30, 99);
  const pmin = Math.max(min, clamp(pot - hP + dP, 30, 99)), pmax = Math.max(max, clamp(pot + hP + dP, 30, 99));
  return { min, max, pmin, pmax, exato: hO === 0, con };
}
export const textoFaixa = (f: Faixa) => (f.exato ? `${f.min}` : `${f.min}–${f.max}`);
export const textoPot = (f: Faixa) => (f.pmin === f.pmax ? `${f.pmin}` : `${f.pmin}–${f.pmax}`);
/** Ligas que valem como foco (as do mercado de empregos e a sua). */
export function focosPossiveis(_pacote: PacoteDados, s: SaveTecnico, ligas: string[]): string[] {
  return [...new Set([s.ligaId, ...ligas])].filter((id) => LIGAS.some((l) => l.id === id));
}
