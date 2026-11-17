// Patrocínios dos clubes do mundo (modo jogador): cada clube tem master no peito, fornecedor de material e manga, com
// contrato até uma temporada. Quando acaba, renova ou troca de marca, e a marca combina com o tamanho do clube: gigante só
// fecha com marca grande (e pode atrair marca global); clube pequeno fecha com marca regional menor.
// Clubes de marca (os da Red Boi) têm o master para sempre e não aceitam outra bebida ou energético na manga. Os que já
// tinham patrocinador fixo (Emiratez, Etihade) mantêm a marca até uma data, e depois o mercado decide.
// Guardado no save só para os clubes que já apareceram (o resto é montado quando aparecer pela primeira vez).
import { RNG, clamp } from "./rng.js";
import type { PacoteDados } from "./liga.js";
import { mundo, infoClube } from "./mundo.js";
import { MARCA, MARCAS, CLUBE_DA_MARCA, regiaoDoPais, forteEm, type Categoria, type Marca } from "./marcas.js";

export type CotaMundo = "master" | "fornecedor" | "manga";
export const COTAS_MUNDO: CotaMundo[] = ["master", "fornecedor", "manga"];
const CATS: Record<CotaMundo, Categoria[]> = {
  master: ["banco", "aerea", "aposta", "carro", "celular", "tecnologia", "seguro", "cripto", "cerveja", "energetico"],
  fornecedor: ["material"],
  manga: ["aposta", "tecnologia", "cripto", "seguro", "banco", "carro", "celular", "refrigerante", "comida", "energetico", "aerea"],
};
const BEBIDAS: Categoria[] = ["energetico", "refrigerante", "cerveja"];
export interface ContratoMundo { marca: string; /** última temporada do contrato */ ate: number }
export type PatroClubeMundo = Partial<Record<CotaMundo, ContratoMundo>> & { visto?: number };
export type EstadoPatroMundo = Record<string, PatroClubeMundo>;

const hash = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
/** O tamanho comercial do clube: força, nível da liga e se é gigante. */
function tamanho(pacote: PacoteDados, id: string): { forca: number; alvo: number; gigante: boolean; fama: number } {
  const forca = mundo(pacote).clube[id]?.forca ?? 60;
  return { forca, alvo: clamp(0.75 + (forca - 55) / 28, 0.7, 2.1), gigante: forca >= 82, fama: clamp((forca - 55) * 2.4, 0, 100) };
}
/** Marcas que topam a cota desse clube, da mais adequada para a menos. */
export function marcasPara(pacote: PacoteDados, id: string, cota: CotaMundo, outras: string[], semente: string): Marca[] {
  const info = infoClube(pacote, id), reg = regiaoDoPais(info?.pais), t = tamanho(pacote, id), dono = CLUBE_DA_MARCA[id];
  const usadasCat = new Set(outras.map((m) => MARCA[m]?.categoria));
  const r = new RNG(`${semente}|pmOrdem|${id}|${cota}`);
  return MARCAS.filter((m) => CATS[cota].includes(m.categoria) && !outras.includes(m.id) && (cota === "fornecedor" || !usadasCat.has(m.categoria))
    && t.fama >= m.famaMin - 12 && (!m.regioes || forteEm(m, reg) || (t.gigante && m.peso >= 1.4))
    && !(m.categoria === "cerveja" && reg === "GOLFO") && !(dono === "redboi" && BEBIDAS.includes(m.categoria))
    // gigante não fecha com marca pequena; clube pequeno não alcança a marca gigante
    && !(t.gigante && m.peso < 1.2) && !(t.forca < 66 && m.peso > 1.6))
    .map((m) => ({ m, nota: -Math.abs(m.peso - t.alvo) * 2 + (m.regioes && forteEm(m, reg) ? 0.7 : 0) + r.next() * 0.9 }))
    .sort((a, b) => b.nota - a.nota).map((x) => x.m);
}
/** Os patrocínios do clube agora (cria na primeira vez; renova ou troca o que venceu). Devolve também as assinaturas novas. */
export function patroDoClube(pacote: PacoteDados, estado: EstadoPatroMundo, semente: string, id: string, temporada: number): { pc: PatroClubeMundo; novos: { cota: CotaMundo; marca: string; renovou: boolean; ate: number }[] } {
  const novos: { cota: CotaMundo; marca: string; renovou: boolean; ate: number }[] = [];
  if (!mundo(pacote).clube[id] || id.startsWith("NAT")) return { pc: {}, novos };
  const primeira = !estado[id], pc = (estado[id] ??= {}), dono = CLUBE_DA_MARCA[id];
  for (const cota of COTAS_MUNDO) {
    const atual = pc[cota];
    if (atual && atual.ate >= temporada) continue;
    const r = new RNG(`${semente}|pm|${id}|${temporada}|${cota}`);
    // a marca dona do clube nunca sai do peito
    if (cota === "master" && dono === "redboi") { pc.master = { marca: dono, ate: temporada + 99 }; continue; }
    if (primeira && cota === "master" && dono) { pc.master = { marca: dono, ate: temporada + 1 + (hash(`${semente}|${id}|dono`) % 4) }; continue; }
    const outras = COTAS_MUNDO.filter((c) => c !== cota).map((c) => pc[c]?.marca).filter((x): x is string => !!x);
    const lista = marcasPara(pacote, id, cota, outras, `${semente}|${temporada}`);
    if (!lista.length) { delete pc[cota]; continue; }
    const anos = cota === "fornecedor" ? r.int(4, 8) : r.int(2, 5);
    // na primeira vez o contrato já está andando (acaba em 0 a 3 temporadas); depois, renova se a marca ainda combina
    const fica = !primeira && atual && lista.slice(0, 6).some((m) => m.id === atual.marca) && r.chance(cota === "fornecedor" ? 0.65 : 0.5);
    const marca = fica ? atual!.marca : primeira ? r.pick(lista.slice(0, 3)).id : r.pick(lista.slice(0, 4).filter((m) => m.id !== atual?.marca).concat(lista.slice(0, 1))).id;
    const ate = primeira ? temporada + r.int(0, cota === "fornecedor" ? 4 : 3) : temporada + anos - 1;
    pc[cota] = { marca, ate };
    if (!primeira) novos.push({ cota, marca, renovou: !!fica, ate });
  }
  pc.visto = temporada;
  return { pc, novos };
}
export const NOME_COTA_MUNDO: Record<CotaMundo, string> = { master: "patrocinador master", fornecedor: "fornecedor de material", manga: "patrocinador de manga" };
