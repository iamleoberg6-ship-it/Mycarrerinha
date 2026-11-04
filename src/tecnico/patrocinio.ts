// Patrocínios do clube no modo técnico: quatro cotas para vender (master no peito, fornecedor de material, manga e
// naming rights da arena). Cada cota recebe ofertas de marcas da região; o técnico pede o valor que quiser e a marca
// aceita até um teto que não mostra. Arenas que já têm nome de marca (Allianza, Nubanco, Neo Fármaco...) não são vendáveis.
import { RNG, clamp } from "../rng.js";
import { MARCA, MARCAS, CLUBE_DA_MARCA, regiaoDoPais, forteEm, type Categoria, type Marca } from "../marcas.js";
import type { PacoteDados } from "../liga.js";
import { mundo, infoClube } from "../mundo.js";
import { valorBrl } from "../moeda.js";

export type Cota = "master" | "fornecedor" | "manga" | "arena";
export interface ContratoClube { marca: string; valor: number; /** última temporada do contrato */ ate: number; /** cor do logo/nome na camisa */ cor?: string; /** nome da arena */ nome?: string }
export interface OfertaClube { marca: string; valor: number; anos: number; /** teto escondido */ max: number; recusou?: boolean }
export interface PatrociniosClube {
  /** quanto o clube vale comercialmente por mês (as cotas são frações disso) */ base: number;
  master?: ContratoClube; fornecedor?: ContratoClube; manga?: ContratoClube; arena?: ContratoClube;
  ofertas: Partial<Record<Cota, OfertaClube[]>>; geradas: number;
}
export const COTAS: Record<Cota, { nome: string; texto: string; fatia: number; cats: Categoria[] }> = {
  master: { nome: "Patrocínio master", texto: "A marca no meio do peito. A cota mais cara da camisa.", fatia: 0.55, cats: ["banco", "aerea", "aposta", "carro", "celular", "tecnologia", "seguro", "cripto", "cerveja", "energetico"] },
  fornecedor: { nome: "Fornecedor de material", texto: "Faz o uniforme. O logo vai no lado direito do peito, na cor que você escolher.", fatia: 0.28, cats: ["material"] },
  manga: { nome: "Patrocínio de manga", texto: "Logo pequeno na manga esquerda.", fatia: 0.16, cats: ["aposta", "tecnologia", "cripto", "seguro", "banco", "carro", "celular", "refrigerante", "comida", "energetico", "aerea"] },
  arena: { nome: "Naming rights da arena", texto: "A marca dá nome ao estádio por alguns anos.", fatia: 0.32, cats: ["banco", "aerea", "seguro", "tecnologia", "celular", "carro", "aposta", "cripto", "cerveja"] },
};
export const ORDEM_COTAS: Cota[] = ["master", "fornecedor", "manga", "arena"];
/** Nomes de estádio que já são de uma marca (naming rights vendidos antes da sua chegada). */
const JA_TEM_MARCA = /Nubanco|MVR|Neo Fármaco|Allianza|Emirates|Banco|Bank|Mercedária|BMW|Casa Deluxe|Veltinha|Arena WW|Mewe|PayPau|Subara|Geode|Zuole|Energizado|Loja de Esportes|Saputinho|Al-Awwal|Corendon|Papara|Tüpraş|FarmArena|Ligga|Sincil|Signal|Redboi|Touro/i;

interface SaveMin { semente: string; clubeId: string; temporada: number; semana: number; clube: { patrocinio: number; torcida: number; capacidade: number }; patro?: PatrociniosClube; noticias?: unknown[] }

/** O estádio do clube: o nome, se já tem marca e se é dividido com outro clube (aí não dá para vender). */
export function arenaDoClube(pacote: PacoteDados, s: SaveMin): { nome: string; travada?: string } {
  const info = infoClube(pacote, s.clubeId), nome = info?.estadio ?? "Estádio";
  if (s.patro?.arena) return { nome: s.patro.arena.nome ?? nome };
  if (JA_TEM_MARCA.test(nome)) return { nome, travada: `O nome já é de uma marca (${nome}), com contrato longo assinado antes da sua chegada.` };
  const w = mundo(pacote), dono = Object.values(w.info).filter((i) => i.estadio === nome && i.pais === info?.pais).length;
  if (dono > 1) return { nome, travada: `O ${nome} é dividido com outro clube: o nome não é só seu para vender.` };
  return { nome };
}
const forcaDe = (pacote: PacoteDados, id: string) => mundo(pacote).clube[id]?.forca ?? 65;
/** Os patrocínios do clube (na primeira vez, divide o patrocínio antigo: parte vira "outras receitas", e o clube já
 *  chega com master e fornecedor até o fim da temporada). */
export function patrociniosDe(pacote: PacoteDados, s: SaveMin): PatrociniosClube {
  if (s.patro) return s.patro;
  const base = Math.max(1000, s.clube.patrocinio), r = new RNG(`${s.semente}|patro|${s.clubeId}`);
  const p: PatrociniosClube = { base, ofertas: {}, geradas: -99 };
  const dono = CLUBE_DA_MARCA[s.clubeId];
  const escolhe = (cota: Cota) => { const l = candidatas(pacote, s, cota); return l.length ? r.pick(l.slice(0, 5)) : undefined; };
  const m = dono ? MARCA[dono] : escolhe("master"), f = escolhe("fornecedor");
  if (m) p.master = { marca: m.id, valor: Math.round(base * COTAS.master.fatia * 0.85), ate: s.temporada + (dono ? 5 : 0) };
  if (f) p.fornecedor = { marca: f.id, valor: Math.round(base * COTAS.fornecedor.fatia * 0.85), ate: s.temporada };
  s.clube.patrocinio = Math.round(base * 0.3); // placas, parceiros menores, licenciamento
  s.patro = p;
  return p;
}
/** Marcas que topariam a cota: da categoria certa, fortes na região do clube (ou globais) e do tamanho do clube. */
function candidatas(pacote: PacoteDados, s: SaveMin, cota: Cota): Marca[] {
  const info = infoClube(pacote, s.clubeId), reg = regiaoDoPais(info?.pais), forca = forcaDe(pacote, s.clubeId);
  const fama = clamp((forca - 55) * 2.4, 0, 100);
  return MARCAS.filter((m) => COTAS[cota].cats.includes(m.categoria) && fama >= m.famaMin - 10 && (!m.regioes || forteEm(m, reg)) && !(m.categoria === "cerveja" && reg === "GOLFO"))
    // a marca da casa vem primeiro: regional pesa mais que a global do mesmo tamanho
    .sort((a, b) => (b.peso + (b.regioes ? 0.8 : 0)) - (a.peso + (a.regioes ? 0.8 : 0)));
}
/** Valor justo de uma cota por mês para uma marca (o peso da marca, a torcida e o tamanho do estádio mexem). */
function valorJusto(s: SaveMin, p: PatrociniosClube, cota: Cota, m: Marca, r: RNG): number {
  const est = cota === "arena" ? clamp(s.clube.capacidade / 40000 + 0.4, 0.5, 1.5) : 1;
  const v = p.base * COTAS[cota].fatia * (0.55 + 0.35 * m.peso) * (0.85 + s.clube.torcida / 300) * est * (0.88 + r.next() * 0.24);
  return v >= 1e5 ? Math.round(v / 1e4) * 1e4 : Math.round(v / 1e3) * 1e3;
}
const livre = (p: PatrociniosClube, cota: Cota, temporada: number) => !p[cota] || p[cota]!.ate <= temporada;
/** Ofertas da janela (mudam a cada 8 semanas): três por cota livre ou com contrato no último ano. */
export function ofertasPatro(pacote: PacoteDados, s: SaveMin): Partial<Record<Cota, OfertaClube[]>> {
  const p = patrociniosDe(pacote, s), janela = s.temporada * 60 + Math.floor(s.semana / 8) * 8;
  if (p.geradas === janela) return p.ofertas;
  p.geradas = janela; p.ofertas = {};
  for (const cota of ORDEM_COTAS) {
    if (!livre(p, cota, s.temporada)) continue;
    if (cota === "arena" && arenaDoClube(pacote, s).travada) continue;
    const r = new RNG(`${s.semente}|ofertas|${cota}|${janela}`), l = candidatas(pacote, s, cota);
    const pegas = r.shuffle(l.slice(0, 9)).slice(0, 3);
    p.ofertas[cota] = pegas.map((m) => { const valor = valorJusto(s, p, cota, m, r); return { marca: m.id, valor, anos: cota === "arena" ? r.int(3, 6) : r.int(2, 4), max: Math.round(valor * (1.04 + r.next() * 0.26)) }; });
  }
  return p.ofertas;
}
/** Fecha com a marca pelo valor pedido: se passar do teto dela, ela recusa (e a oferta some na segunda vez). */
export function assinarPatro(pacote: PacoteDados, s: SaveMin, cota: Cota, marca: string, pedido: number, extra?: { cor?: string; nome?: string }): { ok: boolean; msg: string } {
  const p = patrociniosDe(pacote, s), of = p.ofertas[cota]?.find((o) => o.marca === marca), m = MARCA[marca];
  if (!of || !m) return { ok: false, msg: "Essa oferta não está mais na mesa." };
  if (!livre(p, cota, s.temporada)) return { ok: false, msg: "A cota já tem contrato." };
  const valor = Math.round(pedido > 0 ? pedido : of.valor);
  if (valor > of.max) {
    if (of.recusou) { p.ofertas[cota] = p.ofertas[cota]!.filter((o) => o !== of); return { ok: false, msg: `${m.nome} desistiu da negociação.` }; }
    of.recusou = true; of.valor = Math.round(of.max * 0.97 / 1000) * 1000;
    return { ok: false, msg: `${m.nome} não chega a ${valorBrl(valor)}/mês. Última proposta: ${valorBrl(of.valor)}/mês.` };
  }
  const atual = p[cota];
  const nome = cota === "arena" ? (extra?.nome || `${m.nome} Arena`) : undefined;
  p[cota] = { marca, valor, ate: (atual && atual.ate >= s.temporada ? atual.ate : s.temporada) + of.anos, ...(extra?.cor ? { cor: extra.cor } : {}), ...(nome ? { nome } : {}) };
  delete p.ofertas[cota];
  return { ok: true, msg: `Fechado: ${m.nome} · ${COTAS[cota].nome.toLowerCase()} por ${valorBrl(valor)}/mês, ${of.anos} ${of.anos === 1 ? "temporada" : "temporadas"}${atual && atual.ate >= s.temporada ? " (começa quando o atual acabar)" : ""}.` };
}
/** Muda a cor do logo do fornecedor ou do nome do master (a marca deixa). */
export function corDoPatro(pacote: PacoteDados, s: SaveMin, cota: Cota, cor: string) { const c = patrociniosDe(pacote, s)[cota]; if (c) c.cor = cor; }
/** Receita do mês com os patrocínios. */
export function receitaPatro(pacote: PacoteDados, s: SaveMin): Record<string, number> {
  const p = patrociniosDe(pacote, s), out: Record<string, number> = {};
  for (const cota of ORDEM_COTAS) { const c = p[cota]; if (c && c.ate >= s.temporada) out[`${COTAS[cota].nome}: ${MARCA[c.marca]?.nome ?? c.marca}`] = c.valor; }
  return out;
}
/** Na virada: contrato vencido sai (a arena volta ao nome antigo). Devolve os avisos. */
export function viradaPatro(pacote: PacoteDados, s: SaveMin): string[] {
  const p = patrociniosDe(pacote, s), av: string[] = [];
  for (const cota of ORDEM_COTAS) { const c = p[cota]; if (c && c.ate < s.temporada) { av.push(`Acabou o contrato de ${COTAS[cota].nome.toLowerCase()} com ${MARCA[c.marca]?.nome ?? c.marca}. A cota está livre para vender.`); delete p[cota]; } }
  p.geradas = -99;
  return av;
}
