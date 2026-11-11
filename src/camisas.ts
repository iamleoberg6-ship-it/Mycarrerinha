// Venda de camisas: quantas camisas de cada jogador o clube vende por mês. Quem é craque, faz gol, joga lá na frente,
// acabou de chegar ou é cria da casa vende mais. Uma parte é sem nome (o torcedor compra a camisa lisa).
// Usado nos dois modos: no técnico vira linha do relatório financeiro; no jogador, ranking do elenco.
import { clamp } from "./rng.js";

export interface PerfilCamisa { id: string; nome: string; pos: string; ovr: number; idade: number; gols: number; assist: number; jogos: number; novo?: boolean; base?: boolean; fama?: number; numero?: number }
const POS: Record<string, number> = { ATA: 1.45, PON: 1.3, MEI: 1.25, VOL: 0.8, LAT: 0.82, ZAG: 0.78, GOL: 0.72 };
/** Peso de um jogador na venda (quanto mais, mais camisas com o nome dele). */
export function pesoCamisa(p: PerfilCamisa): number {
  const nivel = Math.pow(Math.max(1, p.ovr - 52), 2.1);
  const fase = 1 + p.gols * 0.045 + p.assist * 0.02 + Math.min(p.jogos, 40) * 0.006;
  const extra = (p.novo ? 1.55 : 1) * (p.base ? 1.15 : 1) * (p.idade <= 22 ? 1.1 : p.idade >= 34 ? 0.85 : 1) * (1 + clamp((p.fama ?? 0) / 100, 0, 1.5));
  return nivel * (POS[p.pos] ?? 1) * fase * extra;
}
/** Camisas que o clube vende num mês (todas), pelo tamanho do estádio, da torcida e o nível da liga. */
export function camisasDoMes(capacidade: number, torcida: number, fLiga: number, mes: number): number {
  // dezembro (fim de ano) e o lançamento da camisa nova vendem mais
  const sazonal = mes % 12 === 0 ? 1.6 : mes % 12 === 11 ? 1.35 : 1;
  return Math.round(capacidade * 0.8 * (0.45 + torcida / 100) * clamp(0.6 + fLiga * 0.5, 0.6, 1.3) * sazonal);
}
/** Divide as camisas do mês entre os jogadores (e as sem nome). */
export function dividirCamisas(total: number, elenco: PerfilCamisa[]): { porJogador: Record<string, number>; semNome: number } {
  const semNome = Math.round(total * 0.22), resto = total - semNome, pesos = elenco.map(pesoCamisa), soma = pesos.reduce((a, b) => a + b, 0) || 1;
  const porJogador: Record<string, number> = {};
  elenco.forEach((p, i) => { const n = Math.round((resto * pesos[i]) / soma); if (n > 0) porJogador[p.id] = n; });
  return { porJogador, semNome };
}
/** Preço da camisa oficial (R$), pela liga. */
export const precoCamisa = (fLiga: number) => Math.round(220 + 300 * fLiga);

export interface VendaTemporada { temporada: number; porJogador: Record<string, number>; nomes: Record<string, string>; semNome: number }
export interface HistCamisas { temporada: number; total: number; top: [string, number][] }
/** Soma as camisas do mês na temporada. */
export function somarCamisas(v: VendaTemporada, mes: { porJogador: Record<string, number>; semNome: number }, nomes: Record<string, string>) {
  for (const [id, n] of Object.entries(mes.porJogador)) v.porJogador[id] = (v.porJogador[id] ?? 0) + n;
  v.semNome += mes.semNome;
  Object.assign(v.nomes, nomes);
}
export const totalCamisas = (v: VendaTemporada) => Object.values(v.porJogador).reduce((a, b) => a + b, 0) + v.semNome;
export function rankingCamisas(v: VendaTemporada): [string, string, number][] {
  return Object.entries(v.porJogador).sort((a, b) => b[1] - a[1]).map(([id, n]) => [id, v.nomes[id] ?? id, n]);
}
export const fmtMil = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(2).replace(".", ",")} mi` : n >= 1e4 ? `${Math.round(n / 1000)} mil` : n.toLocaleString("pt-BR");
