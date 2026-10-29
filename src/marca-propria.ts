// Marca de roupa do jogador: o nome (com sugestões), o logo (fonte, tamanho e cor) e as peças (blusão, camiseta, boné,
// calça, tênis), cada uma na sua cor. Só desenho e dados: a empresa e as vendas ficam em negocios.ts.
import type { RNG } from "./rng.js";

export type PecaMarca = "blusao" | "camiseta" | "bone" | "calca" | "tenis";
export const PECAS: Record<PecaMarca, { nome: string; valor: number }> = {
  blusao: { nome: "Blusão", valor: 320 }, camiseta: { nome: "Camiseta", valor: 140 }, bone: { nome: "Boné", valor: 90 },
  calca: { nome: "Calça", valor: 260 }, tenis: { nome: "Tênis", valor: 420 },
};
export const ORDEM_PECAS: PecaMarca[] = ["camiseta", "blusao", "calca", "bone", "tenis"];
export const FONTES = [
  { nome: "Clássica", css: "'Big Shoulders Display', Barlow, sans-serif", peso: 900, estilo: "normal" },
  { nome: "Limpa", css: "Barlow, sans-serif", peso: 700, estilo: "normal" },
  { nome: "Serifada", css: "Georgia, serif", peso: 700, estilo: "normal" },
  { nome: "Itálica", css: "Barlow, sans-serif", peso: 800, estilo: "italic" },
];
export const TAMANHOS = [{ nome: "Pequeno", tam: 9 }, { nome: "Médio", tam: 13 }, { nome: "Grande", tam: 17 }];
export const CORES_PALETA = ["#FFFFFF", "#0A0A0A", "#E3B341", "#C8102E", "#2B6CB0", "#2F8F5B"];

export interface DesignMarca {
  nome: string;
  /** índice em FONTES */
  fonte: number;
  /** tamanho da letra em unidades do desenho (6 a 24); valores 0 a 2 são o jeito antigo (pequeno, médio, grande) */
  tamanho: number;
  /** cor do logo (qualquer cor) */
  cor: string;
  /** inclinação da letra, em graus (-30 a 30) */
  inclinacao: number;
  /** deslocamento do logo a partir do lugar padrão da peça (-40 a 40 em cada eixo) */
  posX: number; posY: number;
  /** peças da coleção: cada uma com a cor do tecido (qualquer cor) */
  pecas: { peca: PecaMarca; cor: string }[];
  /** atletas amigos que toparam divulgar a marca */
  embaixadores?: string[];
  /** semana (absoluta) do último convite, para não convidar duas vezes na mesma semana */
  ultimoConvite?: number;
}
export const DESIGN_PADRAO = { tamanho: 13, inclinacao: 0, posX: 0, posY: 0 };

const MOLDES = ["{A} Original", "{A} Wear", "{A} Club", "Coleção {N}", "{A} Street", "Nº{N} by {A}", "{A} Atelier", "Bloco {A}", "{A} Sport", "{A} Life"];
/** Sugestões de nome para a marca, sorteadas com a semente do jogo (sempre as mesmas para a mesma carreira). */
export function sugerirNomes(rng: RNG, apelido: string, numero: string, quantos = 6): string[] {
  const embaralhados = [...MOLDES];
  for (let i = embaralhados.length - 1; i > 0; i--) { const j = rng.int(0, i); [embaralhados[i], embaralhados[j]] = [embaralhados[j], embaralhados[i]]; }
  return embaralhados.slice(0, quantos).map((m) => m.replace("{A}", apelido.toUpperCase()).replace("{N}", numero));
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const SILUETA: Record<PecaMarca, { d: string; logo: [number, number]; extra?: string }> = {
  camiseta: { d: "M60 30 L30 50 L10 85 L40 100 L50 85 L50 180 L150 180 L150 85 L160 100 L190 85 L170 50 L140 30 Q100 50 60 30 Z", logo: [100, 105] },
  blusao: { d: "M60 30 L30 50 L12 150 L40 160 L52 95 L52 180 L148 180 L148 95 L160 160 L188 150 L170 50 L140 30 Q100 50 60 30 Z", logo: [100, 110], extra: `<path d="M100 52 V180" stroke="#00000055" stroke-width="2"/>` },
  bone: { d: "M30 120 Q30 45 100 45 Q170 45 170 120 Z", logo: [100, 105], extra: `<path d="M18 118 Q100 96 182 118 Q170 142 100 142 Q30 142 18 118 Z" fill="#00000033"/>` },
  calca: { d: "M50 20 L150 20 L160 185 L108 185 L100 80 L92 185 L40 185 Z", logo: [100, 70] },
  tenis: { d: "M20 120 L20 60 L70 60 L80 100 L150 110 Q180 115 180 140 L180 150 L20 150 Z", logo: [100, 128], extra: `<rect x="18" y="150" width="166" height="12" rx="4" fill="#00000044"/>` },
};

/** Desenho de uma peça com o logo aplicado (SVG 200 x 200). */
export function pecaSvg(peca: PecaMarca, cor: string, marca: Pick<DesignMarca, "nome" | "fonte" | "cor"> & Partial<Pick<DesignMarca, "tamanho" | "inclinacao" | "posX" | "posY">>): string {
  const f = FONTES[marca.fonte] ?? FONTES[0], s = SILUETA[peca];
  const tam = marca.tamanho === undefined ? DESIGN_PADRAO.tamanho : marca.tamanho <= 2 ? TAMANHOS[marca.tamanho].tam : marca.tamanho;
  const x = s.logo[0] + (marca.posX ?? 0), y = s.logo[1] + (marca.posY ?? 0), inc = marca.inclinacao ?? 0;
  const escuro = cor.toLowerCase() === "#0a0a0a";
  return `<svg class="peca-svg" viewBox="0 0 200 200" role="img" aria-label="${esc(PECAS[peca].nome)} ${esc(marca.nome)}">
    <path d="${s.d}" fill="${cor}" stroke="${escuro ? "#444" : "#0A0A0A55"}" stroke-width="2" stroke-linejoin="round"/>${s.extra ?? ""}
    <text x="${x}" y="${y}" text-anchor="middle" font-family="${esc(f.css)}" font-weight="${f.peso}" font-style="${f.estilo}" font-size="${tam}" fill="${marca.cor}" letter-spacing=".5" transform="rotate(${inc} ${x} ${y})">${esc(marca.nome.toUpperCase())}</text></svg>`;
}
/** Vitrine da coleção: cada peça à venda (até cinco) e cada atleta que divulga (até quatro) puxam a venda mensal. */
export const bonusVitrine = (d?: DesignMarca) => (d ? 1 + 0.12 * Math.min(5, d.pecas.length) + 0.06 * Math.min(4, d.embaixadores?.length ?? 0) : 1);
