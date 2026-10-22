// Visual do jogador de corpo inteiro: físico, uniforme (manga e caimento), roupa do dia a dia e tatuagens.
// Aqui ficam só os dados e as regras (preço, onde aparece); o desenho fica em app/visual/corpo.ts.

export type Fisico = "esguio" | "magro" | "atletico" | "forte" | "troncudo";
export type Manga = "curta" | "longa";
export type Caimento = "justo" | "largo";
export type Meiao = "alto" | "baixo";
export type RoupaCasual = "camiseta" | "regata" | "moletom" | "social" | "jaqueta";
export type Perna = "bermuda" | "calca";
export type AreaTatuagem = "pescoco" | "antebracoE" | "antebracoD" | "pernaE" | "pernaD";

export interface Visual {
  fisico: Fisico; manga: Manga; caimento: Caimento; meiao: Meiao;
  casual: RoupaCasual; corCasual: number; perna: Perna;
  tatuagens: Partial<Record<AreaTatuagem, string>>;
}
export const VISUAL_PADRAO: Visual = { fisico: "atletico", manga: "curta", caimento: "justo", meiao: "alto", casual: "camiseta", corCasual: 1, perna: "bermuda", tatuagens: {} };

export const NOME_FISICO: Record<Fisico, string> = { esguio: "Esguio", magro: "Magro", atletico: "Atlético", forte: "Forte", troncudo: "Troncudo" };
export const NOME_CASUAL: Record<RoupaCasual, string> = { camiseta: "Camiseta", regata: "Regata", moletom: "Moletom", social: "Camisa social", jaqueta: "Jaqueta jeans" };
export const NOME_AREA: Record<AreaTatuagem, string> = { pescoco: "Pescoço", antebracoE: "Antebraço esquerdo", antebracoD: "Antebraço direito", pernaE: "Coxa esquerda", pernaD: "Coxa direita" };

/** "no pescoço", "na coxa direita"... */
export const noArea = (a: AreaTatuagem) => `${a.startsWith("perna") ? "na" : "no"} ${NOME_AREA[a].toLowerCase()}`;
export interface Tatuagem { id: string; nome: string; preco: number; areas: AreaTatuagem[]; descricao: string }
const MEMBROS: AreaTatuagem[] = ["antebracoE", "antebracoD", "pernaE", "pernaD"];
export const TATUAGENS: Tatuagem[] = [
  { id: "estrelas", nome: "Estrelas", preco: 1500, areas: ["pescoco", ...MEMBROS], descricao: "Três estrelas pequenas." },
  { id: "rosa", nome: "Rosa", preco: 3500, areas: ["pescoco", ...MEMBROS], descricao: "Rosa vermelha com folhas." },
  { id: "terco", nome: "Terço", preco: 2800, areas: MEMBROS, descricao: "Contas e cruz descendo pelo braço." },
  { id: "tribal", nome: "Tribal", preco: 2500, areas: ["pescoco", ...MEMBROS], descricao: "Traços pretos de ponta." },
  { id: "escrita", nome: "Escrita \"Família\"", preco: 2000, areas: MEMBROS, descricao: "A palavra mais tatuada do futebol." },
  { id: "coroa", nome: "Coroa", preco: 2200, areas: ["pescoco", ...MEMBROS], descricao: "Para o rei da área." },
  { id: "asas", nome: "Asas", preco: 3000, areas: ["pescoco", ...MEMBROS], descricao: "Um par de asas abertas." },
  { id: "data", nome: "Data em romanos", preco: 1800, areas: MEMBROS, descricao: "O dia do nascimento de alguém." },
  { id: "bola", nome: "Bola", preco: 1600, areas: ["pescoco", ...MEMBROS], descricao: "Uma bola, claro." },
  { id: "fechada", nome: "Fechamento completo", preco: 18000, areas: MEMBROS, descricao: "O antebraço ou a coxa inteira desenhada. Várias sessões." },
];
export const TATUAGEM: Record<string, Tatuagem> = Object.fromEntries(TATUAGENS.map((t) => [t.id, t]));
/** Tirar com laser custa o dobro e demora. */
export const custoRemocao = (id: string) => (TATUAGEM[id]?.preco ?? 2000) * 2;

export const visualDe = (j: { visual?: Visual }): Visual => {
  j.visual ??= { ...VISUAL_PADRAO, tatuagens: {} };
  return j.visual;
};

/** Onde a tatuagem aparece com a roupa escolhida. */
export function tatuagemVisivel(area: AreaTatuagem, v: Visual, traje: "jogo" | "casual"): boolean {
  if (area === "pescoco") return true;
  if (area.startsWith("antebraco")) return traje === "jogo" ? v.manga === "curta" : !["moletom", "social"].includes(v.casual);
  return traje === "jogo" ? true : v.perna === "bermuda";
}
