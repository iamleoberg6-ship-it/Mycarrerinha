// Patrocínios da seleção: no uniforme só entra o fornecedor de material (sem master, sem manga); o resto são
// patrocinadores oficiais de mídia (banco, companhia aérea, bebida, operadora...), que aparecem em propaganda, no fundo
// das entrevistas e nas placas, nunca na camisa. Os valores são altos e crescem muito com o tamanho da seleção, e as
// marcas querem contratos longos: pedir menos anos baixa o teto da marca; oferecer mais anos sobe.
import { RNG, clamp } from "../rng.js";
import { MARCA, MARCAS, regiaoDoPais, forteEm, type Categoria, type Marca } from "../marcas.js";
import type { PacoteDados } from "../liga.js";
import { mundo } from "../mundo.js";
import { valorBrl } from "../moeda.js";
import type { SaveTecnico } from "./motor.js";

export type CotaSel = "fornecedor" | "midia1" | "midia2" | "midia3";
export const COTAS_SEL: CotaSel[] = ["fornecedor", "midia1", "midia2", "midia3"];
export const NOME_COTA_SEL: Record<CotaSel, string> = { fornecedor: "Fornecedor de material", midia1: "Patrocinador oficial", midia2: "Patrocinador oficial", midia3: "Patrocinador oficial" };
const CATS_MIDIA: Categoria[] = ["banco", "aerea", "cerveja", "celular", "carro", "seguro", "refrigerante", "comida", "tecnologia", "aposta", "energetico"];
export interface ContratoSel { marca: string; valor: number; ate: number; anos: number }
export interface OfertaSelPatro { marca: string; valor: number; anos: number; max: number; recusou?: boolean }
export interface PatroSel { contratos: Partial<Record<CotaSel, ContratoSel>>; ofertas: Partial<Record<CotaSel, OfertaSelPatro[]>>; geradas: number; arrecadado: number }

const forcaNat = (pacote: PacoteDados, s: SaveTecnico) => mundo(pacote).clube[s.selecao!.id]?.forca ?? 70;
/** Quanto a cota vale por mês para uma marca média (R$): sobe muito com o tamanho da seleção. */
export function valorBaseSel(forca: number, cota: CotaSel): number {
  const f = Math.pow(clamp((forca - 60) / 26, 0.08, 1.05), 3);
  const forn = Math.max(250000, 42e6 * f);
  return cota === "fornecedor" ? forn : Math.max(60000, forn * 0.14);
}
/** Teto da marca conforme os anos: elas preferem contrato longo. */
export const fatorAnos = (anos: number, preferido: number) => clamp(1 + (anos - preferido) * 0.04, 0.8, 1.12);
function candidatas(pacote: PacoteDados, s: SaveTecnico, cota: CotaSel, ja: string[]): Marca[] {
  const reg = regiaoDoPais(s.selecao!.pais), forca = forcaNat(pacote, s), fama = clamp((forca - 55) * 2.6, 0, 100);
  const cats = cota === "fornecedor" ? (["material"] as Categoria[]) : CATS_MIDIA;
  const catsUsadas = new Set(ja.map((id) => MARCA[id]?.categoria));
  return MARCAS.filter((m) => cats.includes(m.categoria) && fama >= m.famaMin - 12 && (!m.regioes || forteEm(m, reg) || (forca >= 80 && m.peso >= 1.3)) && !(m.categoria === "cerveja" && reg === "GOLFO") && !ja.includes(m.id) && (cota === "fornecedor" || !catsUsadas.has(m.categoria)))
    .sort((a, b) => b.peso - a.peso);
}
const arred = (v: number) => (v >= 1e6 ? Math.round(v / 1e5) * 1e5 : Math.round(v / 1e4) * 1e4);
const usadas = (p: PatroSel) => Object.values(p.contratos).filter(Boolean).map((c) => c!.marca);
/** A situação da federação (na primeira vez: o fornecedor e um ou dois patrocinadores já assinados antes de você). */
export function patroSel(pacote: PacoteDados, s: SaveTecnico): PatroSel {
  const sel = s.selecao!;
  if (sel.patro) return sel.patro;
  const r = new RNG(`${s.semente}|patroSel|${sel.pais}`), forca = forcaNat(pacote, s), p: PatroSel = { contratos: {}, ofertas: {}, geradas: -99, arrecadado: 0 };
  const f = candidatas(pacote, s, "fornecedor", [])[0];
  if (f) p.contratos.fornecedor = { marca: f.id, valor: arred(valorBaseSel(forca, "fornecedor") * (0.55 + 0.35 * f.peso)), ate: s.temporada + r.int(0, 3), anos: 8 };
  for (const k of ["midia1", "midia2"] as CotaSel[]) {
    if (k === "midia2" && forca < 74) break;
    const l = candidatas(pacote, s, k, usadas(p)); const m = l.length ? r.pick(l.slice(0, 4)) : undefined;
    if (m) p.contratos[k] = { marca: m.id, valor: arred(valorBaseSel(forca, k) * (0.55 + 0.35 * m.peso)), ate: s.temporada + r.int(0, 2), anos: 4 };
  }
  sel.patro = p;
  return p;
}
const livre = (p: PatroSel, k: CotaSel, t: number) => !p.contratos[k] || p.contratos[k]!.ate <= t;
/** Ofertas (mudam a cada 12 semanas): para cota livre ou no último ano. */
export function ofertasSel(pacote: PacoteDados, s: SaveTecnico): Partial<Record<CotaSel, OfertaSelPatro[]>> {
  const p = patroSel(pacote, s), janela = s.temporada * 60 + Math.floor(s.semana / 12) * 12;
  if (p.geradas === janela) return p.ofertas;
  p.geradas = janela; p.ofertas = {};
  const forca = forcaNat(pacote, s);
  for (const k of COTAS_SEL) {
    if (!livre(p, k, s.temporada)) continue;
    const r = new RNG(`${s.semente}|ofSel|${k}|${janela}`), l = candidatas(pacote, s, k, usadas(p).filter((m) => m !== p.contratos[k]?.marca));
    p.ofertas[k] = r.shuffle(l.slice(0, 8)).slice(0, k === "fornecedor" ? 3 : 2).map((m) => {
      const anos = k === "fornecedor" ? r.int(6, 10) : r.int(4, 6), valor = arred(valorBaseSel(forca, k) * (0.55 + 0.35 * m.peso) * (0.9 + r.next() * 0.2));
      return { marca: m.id, valor, anos, max: arred(valor * (1.04 + r.next() * 0.22)) };
    });
  }
  return p.ofertas;
}
/** Fecha com a marca: você pede um valor e o número de anos; a marca aceita até o teto dela (que depende dos anos). */
export function assinarSel(pacote: PacoteDados, s: SaveTecnico, k: CotaSel, marca: string, pedido: number, anos: number): { ok: boolean; msg: string } {
  const p = patroSel(pacote, s), of = p.ofertas[k]?.find((o) => o.marca === marca), m = MARCA[marca];
  if (!of || !m) return { ok: false, msg: "Essa oferta não está mais na mesa." };
  if (!livre(p, k, s.temporada)) return { ok: false, msg: "Essa cota já tem contrato." };
  const a = clamp(Math.round(anos || of.anos), 2, 12), teto = arred(of.max * fatorAnos(a, of.anos)), valor = Math.round(pedido > 0 ? pedido : of.valor);
  if (valor > teto) {
    if (of.recusou) { p.ofertas[k] = p.ofertas[k]!.filter((o) => o !== of); return { ok: false, msg: `${m.nome} encerrou a conversa.` }; }
    of.recusou = true;
    return { ok: false, msg: `${m.nome} não chega a ${valorBrl(valor)}/mês por ${a} anos. ${a < of.anos ? "Contrato curto não interessa tanto a ela. " : ""}Tente de novo: é a última chance.` };
  }
  const atual = p.contratos[k];
  p.contratos[k] = { marca, valor, anos: a, ate: (atual && atual.ate >= s.temporada ? atual.ate : s.temporada) + a };
  delete p.ofertas[k];
  // contrato acima do valor justo agrada a federação
  const sel = s.selecao!; sel.confianca = clamp(sel.confianca + (valor > of.valor ? 4 : 2), 0, 100);
  return { ok: true, msg: `Fechado: ${m.nome} · ${NOME_COTA_SEL[k].toLowerCase()} da seleção por ${valorBrl(valor)}/mês, ${a} anos (${valorBrl(valor * 12 * a)} no total).` };
}
/** Fim do mês: a federação recebe (vai para o caixa dela; renovação boa de contrato sobe o seu salário). */
export function mesPatroSel(pacote: PacoteDados, s: SaveTecnico): number {
  if (!s.selecao) return 0;
  const p = patroSel(pacote, s);
  const v = Object.values(p.contratos).reduce((a, c) => a + (c && c.ate >= s.temporada ? c.valor : 0), 0);
  p.arrecadado += v;
  return v;
}
export function viradaPatroSel(s: SaveTecnico, tAntes: number): string[] {
  if (!s.selecao?.patro) return [];
  const p = s.selecao.patro, av: string[] = [];
  for (const k of COTAS_SEL) { const c = p.contratos[k]; if (c && c.ate <= tAntes) { av.push(`Acabou o contrato da seleção com ${MARCA[c.marca]?.nome ?? c.marca} (${NOME_COTA_SEL[k].toLowerCase()}).`); delete p.contratos[k]; } }
  p.geradas = -99;
  return av;
}
