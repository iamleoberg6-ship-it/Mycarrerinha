// Visual do jogador de corpo inteiro: físico, uniforme (manga e caimento), roupa do dia a dia e tatuagens.
// Aqui ficam só os dados e as regras (preço, onde aparece); o desenho fica em app/visual/corpo.ts.

export type Fisico = "magro" | "atletico" | "forte";
export type Manga = "curta" | "longa";
export type Caimento = "justo" | "largo";
export type Meiao = "alto" | "baixo";
export type RoupaCasual = "camiseta" | "regata" | "moletom" | "social" | "jaqueta" | "polo" | "florida" | "agasalho" | "sueter" | "cardigan" | "camisaCurta";
export type Munhequeira = "nenhuma" | "uma" | "duas";
export type Perna = "bermuda" | "calca" | "jeans" | "jogger";
/** Segunda pele por baixo do uniforme: só o braço (manga de compressão) ou o corpo todo (braços e coxas). */
export type SegundaPele = "nenhuma" | "braco" | "corpo";
export type AreaTatuagem = "pescoco" | "antebracoE" | "antebracoD" | "pernaE" | "pernaD";

export interface Visual {
  fisico: Fisico; manga: Manga; caimento: Caimento; meiao: Meiao;
  casual: RoupaCasual; corCasual: number; perna: Perna;
  /** segunda pele em campo e a cor (índice de CORES_ROUPA) */
  segundaPele?: SegundaPele; corSegundaPele?: number;
  tatuagens: Partial<Record<AreaTatuagem, string>>;
  /** munhequeira em campo e a cor (índice de CORES_ROUPA; -1 = cor do clube) */
  munhequeira?: Munhequeira; corMunhequeira?: number;
  /** esconde os acessórios de patrocinador (óculos, relógio, fone) */
  semAcessorioPatro?: boolean;
  /** boné e blusão de marca liberados por patrocínio (ids das marcas; ficam mesmo depois que o contrato acaba)
   *  e os que o jogador escolheu usar fora de campo (sem escolha, não usa) */
  roupasGanhas?: string[]; bonePatro?: string; blusaoPatro?: string;
}
export const VISUAL_PADRAO: Visual = { fisico: "atletico", manga: "curta", caimento: "justo", meiao: "alto", casual: "camiseta", corCasual: 1, perna: "bermuda", tatuagens: {} };

export const NOME_FISICO: Record<Fisico, string> = { magro: "Magro", atletico: "Atlético", forte: "Forte" };
export const NOME_CASUAL: Record<RoupaCasual, string> = { camiseta: "Camiseta", regata: "Regata", moletom: "Moletom", social: "Camisa social", jaqueta: "Jaqueta jeans", polo: "Polo", florida: "Camisa florida", agasalho: "Agasalho", sueter: "Suéter", cardigan: "Cardigã", camisaCurta: "Camisa de botão (manga curta)" };
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
  { id: "leao", nome: "Leão", preco: 4200, areas: ["pescoco", ...MEMBROS], descricao: "Juba e olhar de quem não desiste." },
  { id: "cruz", nome: "Cruz", preco: 1400, areas: ["pescoco", ...MEMBROS], descricao: "Simples, com raios de luz." },
  { id: "mae", nome: "Escrita \"Mãe\"", preco: 1700, areas: ["pescoco", ...MEMBROS], descricao: "Com um coração do lado." },
  { id: "mandala", nome: "Mandala", preco: 3800, areas: MEMBROS, descricao: "Pontilhismo em círculos." },
  { id: "relogio", nome: "Relógio e rosa", preco: 4500, areas: MEMBROS, descricao: "O tempo que não volta." },
  { id: "trofeu", nome: "Taça", preco: 2600, areas: ["pescoco", ...MEMBROS], descricao: "Para lembrar do primeiro título." },
  { id: "lua", nome: "Lua crescente", preco: 1500, areas: ["pescoco", ...MEMBROS], descricao: "Lua com estrelinhas em volta." },
  { id: "coracao", nome: "Coração", preco: 1200, areas: ["pescoco", ...MEMBROS], descricao: "Simples, do tamanho de uma moeda." },
  { id: "ancora", nome: "Âncora", preco: 1700, areas: ["pescoco", ...MEMBROS], descricao: "Firme, para quem não sai do lugar." },
  { id: "chama", nome: "Chama", preco: 1600, areas: ["pescoco", ...MEMBROS], descricao: "Fogo que não apaga, nem no segundo tempo." },
  { id: "caveira", nome: "Caveira", preco: 2400, areas: ["pescoco", ...MEMBROS], descricao: "Olhos vazios, muita atitude." },
  { id: "espada", nome: "Espada", preco: 2300, areas: MEMBROS, descricao: "Lâmina em linha reta, com o cabo trabalhado." },
  { id: "cobra", nome: "Cobra enrolada", preco: 2600, areas: MEMBROS, descricao: "Enrolada no braço, com a cabeça de frente." },
  { id: "dragao", nome: "Dragão", preco: 5200, areas: MEMBROS, descricao: "Asa aberta e o corpo descendo pela coxa ou pelo antebraço." },
  { id: "numero", nome: "Número da camisa", preco: 1300, areas: MEMBROS, descricao: "O número do seu primeiro uniforme, num círculo." },
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
  if (area.startsWith("antebraco")) return traje === "jogo" ? v.manga === "curta" : !["moletom", "social", "jaqueta", "agasalho", "sueter", "cardigan"].includes(v.casual);
  return traje === "jogo" ? true : v.perna === "bermuda";
}
