// Patrocínios do clube no modo técnico: quatro cotas para vender (master no peito, fornecedor de material, manga e
// naming rights da arena). Cada cota recebe ofertas de marcas da região; o técnico pede o valor que quiser e a marca
// aceita até um teto que não mostra. Arenas que já têm nome de marca (Allianza, Nubanco, Neo Fármaco...) não são vendáveis.
import { RNG, clamp } from "../rng.js";
import { MARCA, MARCAS, CLUBE_DA_MARCA, regiaoDoPais, forteEm, type Categoria, type Marca } from "../marcas.js";
import type { PacoteDados } from "../liga.js";
import { mundo, infoClube } from "../mundo.js";
import { valorBrl } from "../moeda.js";
import { abrirMesaPatro, proporPatro, aceitarMesa, textoPatro, type MesaPatro, type PacotePatro } from "../negociacao-patro.js";

export type Cota = "master" | "fornecedor" | "manga" | "arena";
export interface ContratoClube { marca: string; valor: number; /** última temporada do contrato */ ate: number; /** cor do logo/nome na camisa */ cor?: string; /** nome da arena */ nome?: string;
  /** cláusulas negociadas */ bonusTitulo?: number; bonusVaga?: number; rebaixamento?: boolean; renovacao?: boolean; anos?: number }
export interface OfertaClube { marca: string; valor: number; anos: number; /** teto escondido */ max: number; recusou?: boolean }
export interface PatrociniosClube {
  /** quanto o clube vale comercialmente por mês (as cotas são frações disso) */ base: number;
  master?: ContratoClube; fornecedor?: ContratoClube; manga?: ContratoClube; arena?: ContratoClube;
  ofertas: Partial<Record<Cota, OfertaClube[]>>; geradas: number;
  /** mesas de negociação abertas (cota|marca) */ mesas?: Record<string, MesaPatro>;
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
  // clube de alcance internacional (os gigantes) também atrai as marcas grandes de outras regiões
  const alcance = forca >= 80;
  return MARCAS.filter((m) => COTAS[cota].cats.includes(m.categoria) && fama >= m.famaMin - 10 && (!m.regioes || forteEm(m, reg) || (alcance && m.peso >= 1.4)) && !(m.categoria === "cerveja" && reg === "GOLFO"))
    // a marca da casa vem primeiro: regional pesa mais que a global do mesmo tamanho
    .sort((a, b) => (b.peso + (b.regioes && forteEm(b, reg) ? 0.8 : 0)) - (a.peso + (a.regioes && forteEm(a, reg) ? 0.8 : 0)));
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
/** Chance de título e de vaga em copa pelo tamanho do clube na liga (a marca faz essa conta). */
function chances(pacote: PacoteDados, s: SaveMin): { titulo: number; vaga: number } {
  const w = mundo(pacote), meu = w.clube[s.clubeId], l = meu ? w.liga[meu.ligaId] : undefined;
  const rank = l ? 1 + l.clubes.filter((c) => c.forca > (meu?.forca ?? 0)).length : 10;
  return { titulo: clamp(0.45 - (rank - 1) * 0.09, 0.02, 0.45), vaga: clamp(0.85 - (rank - 1) * 0.1, 0.05, 0.85) };
}
/** A mesa de negociação com uma marca (abre na primeira vez, a partir da oferta dela). */
export function mesaPatro(pacote: PacoteDados, s: SaveMin, cota: Cota, marca: string): MesaPatro | undefined {
  const p = patrociniosDe(pacote, s), of = p.ofertas[cota]?.find((o) => o.marca === marca);
  const k = `${cota}|${marca}`, ja = p.mesas?.[k];
  if (ja) return ja;
  if (!of) return undefined;
  const ch = chances(pacote, s), divisao = infoClube(pacote, s.clubeId) ? 1 : 1;
  const m = abrirMesaPatro(`${s.semente}|${p.geradas}|${cota}`, marca, of.valor, of.anos, of.max, ch.titulo, ch.vaga, divisao > 0);
  (p.mesas ??= {})[k] = m;
  return m;
}
/** Uma rodada de negociação (ou aceitar a proposta da marca). Fechando, devolve as luvas para entrar no caixa. */
export function negociarPatro(pacote: PacoteDados, s: SaveMin, cota: Cota, marca: string, pac: PacotePatro | "aceitar", extra?: { cor?: string; nome?: string }): { ok: boolean; msg: string; luvas?: number } {
  const p = patrociniosDe(pacote, s), m = mesaPatro(pacote, s, cota, marca), mk = MARCA[marca];
  if (!m || !mk) return { ok: false, msg: "Essa oferta não está mais na mesa." };
  if (!livre(p, cota, s.temporada)) return { ok: false, msg: "A cota já tem contrato." };
  const r = pac === "aceitar" ? aceitarMesa(m) : proporPatro(m, pac);
  if (r.status === "saiu") { p.ofertas[cota] = (p.ofertas[cota] ?? []).filter((o) => o.marca !== marca); return { ok: false, msg: `${mk.nome} saiu da negociação.` }; }
  if (r.status === "contra") return { ok: false, msg: `${mk.nome}: ${r.texto.replace(/^A marca fez uma contraproposta: /, "contraproposta: ")}` };
  const c = m.contra, atual = p[cota], nome = cota === "arena" ? (extra?.nome || `${mk.nome} Arena`) : undefined;
  p[cota] = { marca, valor: c.fixo, ate: (atual && atual.ate >= s.temporada ? atual.ate : s.temporada) + c.anos, anos: c.anos, ...(c.bonusTitulo ? { bonusTitulo: c.bonusTitulo } : {}), ...(c.bonusVaga ? { bonusVaga: c.bonusVaga } : {}), ...(c.rebaixamento ? { rebaixamento: true } : {}), ...(c.renovacao ? { renovacao: true } : {}), ...(extra?.cor ? { cor: extra.cor } : {}), ...(nome ? { nome } : {}) };
  delete p.ofertas[cota];
  for (const k of Object.keys(p.mesas ?? {})) if (k.startsWith(`${cota}|`)) delete p.mesas![k];
  return { ok: true, msg: `Fechado com ${mk.nome} (${COTAS[cota].nome.toLowerCase()}): ${textoPatro(c)}.`, luvas: c.luvas };
}
/** Fim de temporada: bônus por título e por vaga; cláusula de rebaixamento corta 40%. */
export function bonusPatroTemporada(pacote: PacoteDados, s: SaveMin, campeao: boolean, vaga: boolean): { total: number; avisos: string[] } {
  const p = patrociniosDe(pacote, s), av: string[] = []; let total = 0;
  for (const cota of ORDEM_COTAS) {
    const c = p[cota]; if (!c) continue;
    const nm = MARCA[c.marca]?.nome ?? c.marca;
    if (campeao && c.bonusTitulo) { total += c.bonusTitulo; av.push(`${nm} paga ${valorBrl(c.bonusTitulo)} de bônus pelo título.`); }
    if (vaga && c.bonusVaga) { total += c.bonusVaga; av.push(`${nm} paga ${valorBrl(c.bonusVaga)} de bônus pela vaga em copa continental.`); }
  }
  return { total, avisos: av };
}
export function rebaixamentoPatro(pacote: PacoteDados, s: SaveMin): string[] {
  const p = patrociniosDe(pacote, s), av: string[] = [];
  for (const cota of ORDEM_COTAS) { const c = p[cota]; if (c?.rebaixamento) { c.valor = Math.round(c.valor * 0.6); c.rebaixamento = false; av.push(`Cláusula de rebaixamento: ${MARCA[c.marca]?.nome ?? c.marca} passa a pagar ${valorBrl(c.valor)}/mês.`); } }
  return av;
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
  for (const cota of ORDEM_COTAS) {
    const c = p[cota];
    if (!c || c.ate >= s.temporada) continue;
    if (c.renovacao) { c.ate = s.temporada + (c.anos ?? 2) - 1; c.valor = Math.round(c.valor * 1.06); av.push(`Preferência na renovação: ${MARCA[c.marca]?.nome ?? c.marca} renovou a ${COTAS[cota].nome.toLowerCase()} por mais ${c.anos ?? 2} anos, com 6% de aumento.`); continue; }
    av.push(`Acabou o contrato de ${COTAS[cota].nome.toLowerCase()} com ${MARCA[c.marca]?.nome ?? c.marca}. A cota está livre para vender.`); delete p[cota];
  }
  p.mesas = {};
  p.geradas = -99;
  return av;
}
