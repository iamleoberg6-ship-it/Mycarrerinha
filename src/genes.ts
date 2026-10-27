// Genética simplificada dos filhos: cada traço vem do pai, da mãe ou de uma mistura dos dois, com as regras de herança
// que todo mundo reconhece (olho escuro e cabelo escuro costumam ganhar, cacho costuma aparecer, a pele fica entre as
// dos pais). Sempre igual para o mesmo filho: o sorteio usa uma semente fixa.
import { RNG } from "./rng.js";

/** Textura do cabelo, do mais liso ao mais crespo. */
export type Textura = "liso" | "ondulado" | "cacheado" | "crespo";
export const TEXTURAS: Textura[] = ["liso", "ondulado", "cacheado", "crespo"];
/** Traços de um dos pais, na escala do jogo:
 *  pele 0 (mais clara) a 7 (mais escura); corCabelo 0 preto, 1 castanho-escuro, 2 castanho, 3 castanho-claro, 4 loiro-escuro,
 *  5 loiro, 6 ruivo; olhos 0 castanho-escuro, 1 castanho, 2 mel, 3 verde, 4 azul. */
export interface Tracos { pele: number; textura: Textura; corCabelo: number; olhos: number; sardas: boolean; olhoPuxado?: boolean; covinha?: boolean }
export interface GenesFilho extends Tracos {
  /** de quem puxou cada coisa (para a tela contar: "o cabelo é do pai, os olhos são da mãe") */
  puxou: { pele: "pai" | "mae" | "os dois"; cabelo: "pai" | "mae"; olhos: "pai" | "mae"; textura: "pai" | "mae" };
}
const clara = (o: number) => o >= 2 && o <= 4;
/** Escuridão do cabelo (ruivo é à parte). */
const escuro = (c: number) => (c === 6 ? 2.5 : 6 - c);

export function cruzar(pai: Tracos, mae: Tracos, semente: string): GenesFilho {
  const r = new RNG(`genes|${semente}`);
  // pele: entre as dos dois, puxando um pouco mais para um lado
  const t = r.range(0.25, 0.75), pele = Math.max(0, Math.min(7, Math.round(pai.pele * (1 - t) + mae.pele * t)));
  const pPele = Math.abs(pai.pele - mae.pele) <= 1 ? "os dois" : t < 0.45 ? "pai" : t > 0.55 ? "mae" : "os dois";
  // cor do cabelo: o mais escuro ganha na maioria das vezes; ruivo precisa vir dos dois (ou ter sorte)
  const ruivo = (pai.corCabelo === 6 && mae.corCabelo === 6) || ((pai.corCabelo === 6 || mae.corCabelo === 6) && r.chance(0.22));
  const maisEscuro = escuro(pai.corCabelo) >= escuro(mae.corCabelo) ? "pai" : "mae";
  const cabelo: "pai" | "mae" = r.chance(0.68) ? maisEscuro : maisEscuro === "pai" ? "mae" : "pai";
  let corCabelo = ruivo ? 6 : (cabelo === "pai" ? pai : mae).corCabelo;
  if (corCabelo === 6 && !ruivo) corCabelo = 3;
  // pele bem escura quase sempre vem com cabelo escuro
  if (pele >= 5 && corCabelo >= 3 && corCabelo !== 6 && r.chance(0.8)) corCabelo = r.pick([0, 1]);
  // olhos: escuro domina; claro só se os dois têm (ou uma chance pequena se só um tem)
  let olhos: number, pOlhos: "pai" | "mae";
  if (clara(pai.olhos) && clara(mae.olhos)) { pOlhos = r.chance(0.5) ? "pai" : "mae"; olhos = (pOlhos === "pai" ? pai : mae).olhos; }
  else if (clara(pai.olhos) || clara(mae.olhos)) { const quem = clara(pai.olhos) ? "pai" : "mae"; if (r.chance(0.25)) { pOlhos = quem; olhos = (quem === "pai" ? pai : mae).olhos; } else { pOlhos = quem === "pai" ? "mae" : "pai"; olhos = (pOlhos === "pai" ? pai : mae).olhos; } }
  else { pOlhos = r.chance(0.5) ? "pai" : "mae"; olhos = (pOlhos === "pai" ? pai : mae).olhos; }
  // textura: o cacho costuma aparecer (metade das vezes vem a mais crespa; senão, algo entre as duas)
  const ia = TEXTURAS.indexOf(pai.textura), ib = TEXTURAS.indexOf(mae.textura), lo = Math.min(ia, ib), hi = Math.max(ia, ib);
  const it = r.chance(0.5) ? hi : r.int(lo, hi), textura = TEXTURAS[it];
  const pTextura: "pai" | "mae" = ia === ib ? (r.chance(0.5) ? "pai" : "mae") : Math.abs(it - ia) <= Math.abs(it - ib) ? "pai" : "mae";
  return {
    pele, textura, corCabelo, olhos,
    sardas: (pai.sardas || mae.sardas) && pele <= 2 && r.chance(0.55),
    olhoPuxado: (pai.olhoPuxado && mae.olhoPuxado) || ((pai.olhoPuxado || mae.olhoPuxado) && r.chance(0.6)),
    covinha: r.chance(0.3),
    puxou: { pele: pPele, cabelo, olhos: pOlhos, textura: pTextura },
  };
}
