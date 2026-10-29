import { LUXO, type ItemLuxo } from "./estilo.js";
// A casa do jogador: imobiliária com vários imóveis por faixa, móveis posicionados livremente no chão,
// estilos de decoração, cores por móvel e revestimentos de parede e piso por cômodo.
// Unidade do chão: ladrilho de meio metro. x corre ao longo da parede da direita (y=0), y ao longo da parede da esquerda (x=0).

// ------------------------------------------------------------------ efeitos
export interface Efeitos { recuperacao: number; moral: number; lesao: number; evolucao: number; fama: number }
export const EFEITOS_ZERO: Efeitos = { recuperacao: 0, moral: 0, lesao: 0, evolucao: 0, fama: 0 };
export const NOMES_EFEITO: Record<keyof Efeitos, string> = { recuperacao: "Recuperação", moral: "Moral", lesao: "Proteção contra lesão", evolucao: "Evolução", fama: "Fama" };
/** A casa ajuda, mas não substitui treino e descanso: cada efeito tem um teto. */
export const TETO: Efeitos = { recuperacao: 15, moral: 20, lesao: 25, evolucao: 20, fama: 10 };

// ------------------------------------------------------------------ estilos
export type Estilo = "basico" | "moderno" | "rustico" | "classico" | "gamer" | "brasileiro";
export interface InfoEstilo { nome: string; fator: number; tecido: string[]; madeira: string[]; metal: string[]; detalhe: string }
export const ESTILOS: Record<Estilo, InfoEstilo> = {
  basico: { nome: "Básico", fator: 0.8, tecido: ["#8E9AA6", "#B5524A", "#3E6FA8", "#7A8B6A"], madeira: ["#C49A6C", "#E2CFB0", "#8A6A48"], metal: ["#9BA4A8", "#F2F2F2", "#2A2A2A"], detalhe: "#DDDDDD" },
  moderno: { nome: "Moderno", fator: 1.3, tecido: ["#B8BEC4", "#3C4048", "#E9E4DA", "#4F6B5A", "#C7A27C"], madeira: ["#D9C2A3", "#F2EFEA", "#2B2B2B"], metal: ["#2B2B2B", "#E9E9E9", "#B9BEC2"], detalhe: "#111111" },
  rustico: { nome: "Rústico", fator: 1.1, tecido: ["#C8A879", "#7B4A2A", "#5E6B4A", "#A0522D"], madeira: ["#8A5A35", "#6B4A30", "#A87B50"], metal: ["#4A3B2E", "#7A6A5A"], detalhe: "#5E3B22" },
  classico: { nome: "Clássico", fator: 1.6, tecido: ["#7A2A34", "#1F3A5F", "#2F4F3A", "#E9E1D3"], madeira: ["#5A3424", "#3B2418", "#F1ECE2"], metal: ["#C9A04A", "#EDEAE4", "#2C2C2C"], detalhe: "#C9A04A" },
  gamer: { nome: "Gamer", fator: 1.4, tecido: ["#111111", "#C0392B", "#1ABC9C", "#8E44AD"], madeira: ["#1E1E24", "#2A2A33"], metal: ["#1E1E24", "#F2F2F2"], detalhe: "#18E0C8" },
  brasileiro: { nome: "Brasileiro raiz", fator: 1.0, tecido: ["#F2B705", "#D7263D", "#1B98E0", "#2E7D4F", "#F08A24"], madeira: ["#B0703A", "#E8C27A"], metal: ["#2E7D4F", "#F2B705", "#D7263D"], detalhe: "#F2B705" },
};

// ------------------------------------------------------------------ tipos de móvel
export type Ambiente = "interno" | "externo" | "garagem";
export type Camada = "chao" | "tapete" | "parede" | "piscina";
export type Categoria = "dormir" | "sala" | "cozinha" | "banheiro" | "lazer" | "treino" | "decoracao" | "externo" | "garagem" | "conquistas";
export const CATEGORIAS: Record<Categoria, string> = {
  dormir: "Quarto", sala: "Sala", cozinha: "Cozinha", banheiro: "Banheiro", lazer: "Lazer", treino: "Treino",
  decoracao: "Decoração", externo: "Área externa", garagem: "Garagem", conquistas: "Conquistas",
};
export type TipoMovel =
  | "beliche" | "cama" | "criado" | "armario" | "comoda" | "rede"
  | "sofa" | "poltrona" | "mesaCentro" | "tv" | "som" | "estante" | "luminaria"
  | "geladeira" | "fogao" | "bancada" | "mesaJantar"
  | "vaso" | "pia" | "chuveiro" | "banheira"
  | "videogame" | "sinuca" | "pebolim" | "fliperama" | "piano" | "aquario"
  | "esteira" | "pesos" | "maca" | "gelo"
  | "tapete" | "planta" | "quadro" | "escultura" | "trofeus"
  | "piscina" | "espreguicadeira" | "churrasqueira" | "mesaExterna" | "trave" | "jacuzzi" | "fogueira"
  | "carro" | "moto" | "mesa"
  | "camisaRel" | "bolaRel" | "trofeuRel";

interface InfoTipo { nome: string; categoria: Categoria; w: number; d: number; camada: Camada; ambientes: Ambiente[]; base: number; efeito: Partial<Efeitos>; corDe: "tecido" | "madeira" | "metal"; encosta?: boolean; comodos: TipoComodo[]; instalacao?: boolean }
const I: Ambiente[] = ["interno"], E: Ambiente[] = ["externo"], IE: Ambiente[] = ["interno", "externo"], G: Ambiente[] = ["garagem"];
const t = (nome: string, categoria: Categoria, w: number, d: number, base: number, efeito: Partial<Efeitos>, corDe: InfoTipo["corDe"], o: Partial<InfoTipo> = {}): InfoTipo =>
  ({ nome, categoria, w, d, camada: "chao", ambientes: I, base, efeito, corDe, comodos: [], ...o });
export const TIPOS: Record<TipoMovel, InfoTipo> = {
  beliche: t("Beliche", "dormir", 2, 4, 700, { recuperacao: 1 }, "tecido", { encosta: true }),
  cama: t("Cama", "dormir", 4, 5, 900, { recuperacao: 2 }, "tecido", { encosta: true }),
  criado: t("Criado-mudo", "dormir", 1, 1, 250, { moral: 1 }, "madeira", { encosta: true }),
  armario: t("Guarda-roupa", "dormir", 3, 1, 600, { moral: 1 }, "madeira", { encosta: true }),
  comoda: t("Cômoda", "dormir", 2, 1, 450, { moral: 1 }, "madeira", { encosta: true }),
  rede: t("Rede", "lazer", 4, 2, 300, { recuperacao: 1, moral: 1 }, "tecido", { ambientes: IE }),
  sofa: t("Sofá", "sala", 4, 2, 1500, { moral: 1 }, "tecido"),
  poltrona: t("Poltrona", "sala", 2, 2, 600, { moral: 1 }, "tecido"),
  mesaCentro: t("Mesa de centro", "sala", 2, 2, 300, { moral: 1 }, "madeira"),
  tv: t("TV", "sala", 3, 1, 1200, { moral: 1 }, "madeira", { encosta: true }),
  som: t("Som", "sala", 2, 1, 250, { moral: 1 }, "metal", { encosta: true }),
  estante: t("Estante", "sala", 3, 1, 500, { moral: 1 }, "madeira", { encosta: true }),
  luminaria: t("Luminária", "decoracao", 1, 1, 150, { recuperacao: 1 }, "tecido"),
  geladeira: t("Geladeira", "cozinha", 2, 2, 900, { lesao: 1 }, "metal", { encosta: true }),
  fogao: t("Fogão", "cozinha", 2, 2, 450, { lesao: 1 }, "metal", { encosta: true }),
  bancada: t("Pia da cozinha", "cozinha", 3, 2, 600, { lesao: 1 }, "madeira", { encosta: true }),
  mesaJantar: t("Mesa de jantar", "cozinha", 4, 3, 800, { moral: 1 }, "madeira"),
  vaso: t("Vaso sanitário", "banheiro", 1, 2, 300, { lesao: 1 }, "metal", { encosta: true }),
  pia: t("Pia do banheiro", "banheiro", 2, 1, 300, { lesao: 1 }, "madeira", { encosta: true }),
  chuveiro: t("Chuveiro", "banheiro", 2, 2, 500, { recuperacao: 1 }, "metal", { encosta: true }),
  banheira: t("Banheira", "banheiro", 2, 4, 2500, { recuperacao: 2 }, "metal", { encosta: true }),
  videogame: t("Videogame", "lazer", 2, 2, 1500, { moral: 2, recuperacao: -1 }, "tecido"),
  sinuca: t("Sinuca", "lazer", 4, 6, 2500, { moral: 2 }, "tecido"),
  pebolim: t("Pebolim", "lazer", 2, 3, 900, { moral: 1 }, "madeira"),
  fliperama: t("Fliperama", "lazer", 2, 1, 2000, { moral: 1 }, "tecido", { encosta: true }),
  piano: t("Piano", "lazer", 3, 3, 3000, { moral: 1, fama: 1 }, "madeira", { encosta: true }),
  aquario: t("Aquário", "decoracao", 2, 1, 1200, { moral: 1 }, "madeira", { encosta: true }),
  esteira: t("Cardio", "treino", 2, 4, 2000, { evolucao: 1 }, "metal"),
  pesos: t("Musculação", "treino", 3, 2, 1000, { evolucao: 1 }, "metal"),
  maca: t("Maca de massagem", "treino", 2, 4, 1800, { recuperacao: 2 }, "tecido"),
  gelo: t("Banheira de gelo", "treino", 2, 2, 1500, { recuperacao: 1, lesao: 1 }, "metal", { ambientes: IE }),
  tapete: t("Tapete", "decoracao", 4, 3, 300, { moral: 1 }, "tecido", { camada: "tapete" }),
  planta: t("Planta", "decoracao", 1, 1, 80, { moral: 1 }, "tecido", { ambientes: IE }),
  quadro: t("Quadro", "decoracao", 2, 0, 60, { moral: 1 }, "tecido", { camada: "parede" }),
  escultura: t("Escultura", "decoracao", 1, 1, 800, { moral: 1 }, "metal", { ambientes: IE }),
  trofeus: t("Troféus", "decoracao", 4, 1, 2000, { moral: 1, fama: 1 }, "madeira", { encosta: true }),
  piscina: t("Piscina", "externo", 6, 5, 2000, { recuperacao: 2, moral: 1 }, "tecido", { camada: "piscina", ambientes: E }),
  espreguicadeira: t("Espreguiçadeira", "externo", 2, 4, 600, { moral: 1 }, "tecido", { ambientes: E }),
  churrasqueira: t("Churrasqueira", "externo", 2, 2, 300, { moral: 1 }, "metal", { ambientes: E, encosta: true }),
  mesaExterna: t("Mesa externa", "externo", 3, 3, 400, { moral: 1 }, "tecido", { ambientes: E }),
  trave: t("Trave de treino", "externo", 6, 2, 900, { evolucao: 1 }, "metal", { ambientes: E }),
  jacuzzi: t("Jacuzzi", "externo", 3, 3, 4000, { recuperacao: 2 }, "metal", { ambientes: IE }),
  fogueira: t("Fogueira", "externo", 2, 2, 600, { moral: 1 }, "metal", { ambientes: E }),
  carro: t("Carro", "garagem", 4, 7, 0, { moral: 1 }, "metal", { ambientes: G }),
  moto: t("Moto", "garagem", 2, 4, 0, { moral: 1 }, "metal", { ambientes: G }),
  mesa: t("Escrivaninha", "sala", 3, 2, 400, { moral: 1 }, "madeira", { encosta: true }),
  // relíquias: ganhas em campo, nunca à venda
  camisaRel: t("Camisa emoldurada", "conquistas", 2, 0, 0, { moral: 1 }, "tecido", { camada: "parede", ambientes: [...I, ...G] }),
  bolaRel: t("Bola no expositor", "conquistas", 1, 1, 0, { moral: 1 }, "tecido", { ambientes: [...IE, ...G] }),
  trofeuRel: t("Troféu", "conquistas", 1, 1, 0, { moral: 1 }, "metal", { ambientes: [...IE, ...G] }),
};

// Onde cada tipo pode ficar. Instalações (hidráulica e obra) só entram, saem ou mudam de lugar em imóvel próprio.
const QUARTO: TipoComodo[] = ["quarto", "kitnet"], ESTAR: TipoComodo[] = ["sala", "kitnet", "jogos", "escritorio", "trofeus"];
const INTERNOS: TipoComodo[] = ["quarto", "kitnet", "sala", "escritorio", "jogos", "trofeus", "academia"];
const ONDE: Record<TipoMovel, TipoComodo[]> = {
  beliche: QUARTO, cama: QUARTO, criado: QUARTO, armario: QUARTO, comoda: [...QUARTO, "escritorio"], rede: [...QUARTO, "sala", "externo"],
  sofa: ESTAR, poltrona: [...ESTAR, "quarto"], mesaCentro: ["sala", "kitnet", "jogos", "trofeus"], tv: ["sala", "kitnet", "quarto", "jogos", "academia"],
  som: ["sala", "kitnet", "quarto", "jogos", "academia"], estante: [...ESTAR, "quarto"], luminaria: [...ESTAR, "quarto"], mesa: [...QUARTO, "escritorio"],
  geladeira: ["cozinha", "kitnet"], fogao: ["cozinha", "kitnet"], bancada: ["cozinha", "kitnet"], mesaJantar: ["cozinha", "sala", "kitnet"],
  vaso: ["banheiro"], pia: ["banheiro"], chuveiro: ["banheiro"], banheira: ["banheiro"],
  videogame: ["quarto", "kitnet", "sala", "jogos"], sinuca: ["sala", "jogos"], pebolim: ["sala", "jogos"], fliperama: ["quarto", "kitnet", "sala", "jogos"],
  piano: ["sala", "escritorio", "jogos"], aquario: ["sala", "quarto", "kitnet", "escritorio"],
  esteira: ["academia", "quarto", "kitnet"], pesos: ["academia", "quarto", "kitnet"], maca: ["academia", "quarto"], gelo: ["academia", "banheiro", "externo"],
  tapete: INTERNOS, planta: [...INTERNOS, "cozinha", "banheiro", "externo"], quadro: [...INTERNOS, "cozinha", "banheiro"], escultura: ["sala", "escritorio", "trofeus", "jogos", "externo"],
  trofeus: ["sala", "trofeus", "escritorio", "jogos"],
  piscina: ["externo"], espreguicadeira: ["externo"], churrasqueira: ["externo"], mesaExterna: ["externo"], trave: ["externo"], jacuzzi: ["externo", "banheiro"], fogueira: ["externo"],
  carro: ["garagem"], moto: ["garagem"],
  // relíquias vão em qualquer cômodo
  camisaRel: [...INTERNOS, "cozinha", "banheiro", "garagem"], bolaRel: [...INTERNOS, "cozinha", "banheiro", "garagem", "externo"], trofeuRel: [...INTERNOS, "cozinha", "banheiro", "garagem", "externo"],
};
for (const [k, v] of Object.entries(ONDE)) TIPOS[k as TipoMovel].comodos = v;
for (const k of ["vaso", "pia", "chuveiro", "banheira", "bancada", "piscina", "jacuzzi"] as TipoMovel[]) TIPOS[k].instalacao = true;
export const NOME_COMODO: Record<TipoComodo, string> = {
  quarto: "quarto", kitnet: "kitnet", sala: "sala", cozinha: "cozinha", banheiro: "banheiro", escritorio: "escritório",
  academia: "academia", jogos: "sala de jogos", trofeus: "sala de troféus", externo: "área externa", garagem: "garagem",
};

/** "no quarto", "na sala"... */
export const noComodo = (t: TipoComodo) => `${t === "quarto" || t === "escritorio" || t === "banheiro" ? "no" : "na"} ${NOME_COMODO[t]}`;

// ------------------------------------------------------------------ catálogo
export interface Item {
  id: string; tipo: TipoMovel; estilo: Estilo; forma: number; nivel: number; nome: string;
  preco: number; efeitos: Partial<Efeitos>; cores: string[]; aVenda: boolean;
  /** só nas relíquias: o que foi conquistado, quando e com que cara */
  rel?: Reliquia;
}
/** Lembrança conquistada na carreira: camisa, bola ou troféu. Vive no save e vira item da casa. */
export interface Reliquia {
  id: string; chave: string; tipo: "camisa" | "bola" | "trofeu"; /** camisa: clube de origem (escolhe a fonte do número) */ clubeId?: string;
  nome: string; legenda: string; ano: number;
  /** camisa: cores do clube; bola: cores da bola da competição; troféu: metal (ouro, prata, bronze) */
  cores: [string, string];
  /** camisa: lisa, listras, faixa, metade · bola: desenho da competição · troféu: taca, bola, chuteira, estrela, placa, prato */
  modelo: string;
  numero?: string;
}
const MULT = [0, 1, 5, 22, 90];
const redondo = (v: number) => { if (v < 100) return Math.round(v / 10) * 10; const p = 10 ** (Math.floor(Math.log10(v)) - 1); return Math.round(v / p) * p; };
const escala = (v: number, nivel: number) => { const r = Math.round(Math.abs(v) * (1 + (nivel - 1) * 0.75)); return v < 0 ? -r : r; };

type Linha = [Estilo, number, number, string, Partial<{ preco: number; efeitos: Partial<Efeitos>; cores: string[]; venda: boolean }>?];
const PRODUTOS: Partial<Record<TipoMovel, Linha[]>> = {
  beliche: [["basico", 1, 1, "Beliche de madeira"]],
  cama: [["basico", 4, 1, "Colchão de solteiro no chão", { preco: 150, efeitos: { recuperacao: 1 } }], ["basico", 1, 1, "Cama de solteiro"], ["brasileiro", 1, 1, "Cama de solteiro com colcha de chita"], ["basico", 2, 2, "Cama de casal"],
    ["rustico", 2, 2, "Cama de casal de madeira maciça"], ["moderno", 2, 3, "Cama box de casal"], ["gamer", 2, 3, "Cama gamer com LED"],
    ["classico", 3, 4, "Cama king capitonê"], ["moderno", 3, 4, "Cama king flutuante"]],
  criado: [["basico", 1, 1, "Criado-mudo"], ["rustico", 1, 2, "Criado-mudo de demolição"], ["moderno", 2, 2, "Mesa de cabeceira suspensa"],
    ["gamer", 2, 2, "Cabeceira com carregador e LED"], ["classico", 3, 3, "Mesa de cabeceira com puxador dourado"], ["brasileiro", 1, 1, "Banquinho de feira"]],
  armario: [["basico", 1, 1, "Arara de roupas"], ["brasileiro", 1, 1, "Arara com cortina de chita"], ["basico", 2, 2, "Guarda-roupa de três portas"],
    ["rustico", 2, 2, "Guarda-roupa de madeira maciça"], ["gamer", 2, 3, "Guarda-roupa preto com LED"], ["moderno", 3, 3, "Guarda-roupa com porta de espelho"],
    ["classico", 3, 4, "Closet planejado com dourado"]],
  comoda: [["basico", 1, 1, "Cômoda de quatro gavetas"], ["rustico", 1, 2, "Cômoda de peroba"], ["moderno", 2, 2, "Aparador laqueado"], ["classico", 2, 3, "Cômoda com pés torneados"]],
  rede: [["brasileiro", 1, 1, "Rede de algodão no suporte"], ["brasileiro", 2, 2, "Rede de casal colorida"], ["rustico", 2, 2, "Rede com suporte de madeira"]],
  sofa: [["basico", 1, 1, "Sofá de dois lugares"], ["brasileiro", 1, 1, "Sofá com manta de crochê"], ["basico", 2, 2, "Sofá retrátil"],
    ["rustico", 2, 2, "Sofá de couro rústico"], ["moderno", 2, 3, "Sofá de linhas retas"], ["gamer", 2, 3, "Sofá gamer reclinável"],
    ["classico", 3, 4, "Sofá Chesterfield"], ["moderno", 3, 4, "Sofá modular de veludo"]],
  poltrona: [["basico", 1, 1, "Poltrona simples"], ["brasileiro", 2, 1, "Cadeira de balanço"], ["rustico", 1, 2, "Poltrona de couro"],
    ["moderno", 3, 3, "Poltrona de design"], ["classico", 1, 3, "Poltrona bergère"], ["gamer", 4, 3, "Cadeira gamer"]],
  mesaCentro: [["basico", 1, 1, "Mesa de centro"], ["brasileiro", 3, 1, "Caixote de feira"], ["rustico", 3, 2, "Mesa de tronco"],
    ["moderno", 2, 2, "Mesa de centro de vidro"], ["classico", 1, 3, "Mesa de centro de mármore"]],
  tv: [["basico", 1, 1, "TV de 32 na mesinha"], ["brasileiro", 4, 1, "TV de tubo da vó"], ["basico", 2, 2, "Smart TV de 55 no rack"],
    ["moderno", 2, 3, "TV de 65 em rack suspenso"], ["gamer", 3, 3, "Monitor gigante com LED"], ["classico", 3, 4, "Telão de 85 com home theater"],
    ["moderno", 3, 4, "TV OLED de 77"]],
  som: [["basico", 1, 1, "Caixinha de som"], ["brasileiro", 4, 1, "Rádio antigo"], ["moderno", 2, 2, "Soundbar"], ["gamer", 2, 2, "Soundbar com subwoofer RGB"],
    ["rustico", 3, 3, "Caixas acústicas de madeira"], ["classico", 4, 3, "Vitrola com discos"]],
  estante: [["basico", 1, 1, "Estante de livros"], ["rustico", 1, 2, "Estante de demolição"], ["brasileiro", 2, 2, "Estante com camisas trocadas", { efeitos: { moral: 2, fama: 1 } }],
    ["gamer", 3, 3, "Painel com bolas de hat-trick", { efeitos: { moral: 2, fama: 2 } }], ["classico", 1, 3, "Biblioteca de nogueira"], ["moderno", 2, 2, "Nichos com camisas emolduradas", { efeitos: { moral: 2, fama: 1 } }]],
  luminaria: [["basico", 1, 1, "Abajur"], ["brasileiro", 1, 1, "Luminária de palha"], ["moderno", 2, 2, "Luminária de piso"], ["rustico", 2, 2, "Luminária de tripé"],
    ["gamer", 2, 2, "Luminária de LED colorido"], ["classico", 3, 3, "Luminária de arco dourada"], ["moderno", 3, 3, "Luminária de arco"]],
  geladeira: [["basico", 1, 1, "Frigobar"], ["brasileiro", 1, 1, "Frigobar com ímã de time"], ["basico", 2, 2, "Geladeira duplex"],
    ["rustico", 4, 2, "Geladeira retrô"], ["moderno", 3, 3, "Geladeira inox de quatro portas"], ["classico", 3, 4, "Geladeira embutida com adega"]],
  fogao: [["basico", 1, 1, "Fogão de duas bocas"], ["brasileiro", 4, 2, "Fogão a lenha"], ["rustico", 4, 2, "Fogão a lenha de ferro"],
    ["moderno", 2, 2, "Cooktop com forno embutido"], ["moderno", 3, 3, "Ilha com cooktop de indução"], ["classico", 3, 4, "Ilha gourmet de mármore"]],
  bancada: [["basico", 1, 1, "Pia com gabinete"], ["brasileiro", 1, 1, "Pia de granito com filtro de barro"], ["rustico", 2, 2, "Bancada de madeira com cuba de cobre"],
    ["moderno", 2, 3, "Bancada de quartzo"], ["classico", 2, 4, "Bancada de mármore com armários"]],
  mesaJantar: [["basico", 1, 1, "Mesa de quatro lugares"], ["brasileiro", 1, 1, "Mesa de fórmica com cadeiras de bar"], ["rustico", 2, 2, "Mesa de fazenda para seis"],
    ["moderno", 2, 3, "Mesa de vidro para seis"], ["classico", 3, 4, "Mesa de mármore para dez"]],
  vaso: [["basico", 1, 1, "Vaso sanitário"], ["moderno", 2, 2, "Vaso suspenso"], ["classico", 2, 3, "Vaso com acabamento dourado"]],
  pia: [["basico", 1, 1, "Pia de coluna"], ["rustico", 1, 2, "Pia de pedra"], ["moderno", 2, 2, "Cuba de apoio"], ["classico", 2, 3, "Bancada de mármore com cuba"]],
  chuveiro: [["basico", 1, 1, "Box com chuveiro elétrico"], ["brasileiro", 1, 1, "Chuveiro elétrico com cortina"], ["moderno", 2, 3, "Box de vidro com ducha"], ["classico", 2, 3, "Ducha dourada"]],
  banheira: [["basico", 1, 1, "Banheira simples"], ["moderno", 1, 2, "Banheira de imersão"], ["classico", 2, 3, "Banheira vitoriana"]],
  videogame: [["basico", 1, 1, "Videogame usado e um pufe"], ["brasileiro", 1, 1, "Videogame antigo de fita"], ["moderno", 2, 2, "Console com poltrona"],
    ["gamer", 2, 2, "Console novo e cadeira gamer"], ["gamer", 3, 3, "Setup gamer para lives", { efeitos: { moral: 4, recuperacao: -2, fama: 1 } }]],
  sinuca: [["brasileiro", 1, 1, "Mesa de bilhar de bar"], ["rustico", 1, 2, "Mesa de sinuca de madeira"], ["classico", 2, 3, "Mesa de sinuca profissional"], ["moderno", 2, 3, "Mesa de sinuca de design"]],
  pebolim: [["basico", 1, 1, "Pebolim"], ["brasileiro", 1, 1, "Pebolim de boteco"], ["gamer", 1, 2, "Pebolim de torneio"]],
  fliperama: [["brasileiro", 1, 1, "Fliperama de boteco"], ["gamer", 1, 2, "Fliperama retrô"]],
  piano: [["classico", 1, 2, "Piano de armário"], ["classico", 2, 3, "Piano de meia cauda"], ["moderno", 2, 3, "Piano de cauda branco"]],
  aquario: [["basico", 1, 1, "Aquário pequeno"], ["moderno", 1, 2, "Aquário de água doce"], ["classico", 1, 3, "Aquário marinho"]],
  esteira: [["basico", 1, 1, "Bicicleta ergométrica"], ["moderno", 2, 2, "Esteira profissional"], ["gamer", 2, 2, "Esteira com tela"], ["moderno", 3, 4, "Esteira antigravidade", { efeitos: { evolucao: 3, lesao: 2 } }]],
  pesos: [["basico", 1, 1, "Halteres e banco"], ["brasileiro", 1, 1, "Peso de lata de cimento"], ["moderno", 2, 2, "Estação de musculação"],
    ["rustico", 3, 3, "Gaiola de agachamento"], ["moderno", 3, 4, "Academia de clube em casa", { efeitos: { evolucao: 3, recuperacao: 1 } }]],
  maca: [["basico", 1, 1, "Maca de massagem"], ["moderno", 1, 2, "Maca com aquecimento"], ["classico", 1, 3, "Maca de spa"]],
  gelo: [["brasileiro", 1, 1, "Tonel com gelo"], ["moderno", 2, 3, "Banheira de crioterapia"]],
  tapete: [["basico", 1, 1, "Tapete de algodão"], ["brasileiro", 4, 1, "Tapete de retalhos"], ["rustico", 1, 2, "Tapete de sisal"],
    ["moderno", 2, 2, "Tapete felpudo"], ["gamer", 2, 2, "Tapete com escudo do clube"], ["classico", 3, 3, "Tapete persa"]],
  planta: [["basico", 1, 1, "Vaso de suculenta"], ["brasileiro", 2, 1, "Samambaia"], ["moderno", 2, 2, "Costela-de-adão"],
    ["rustico", 3, 2, "Bananeira no vaso"], ["classico", 3, 3, "Oliveira em vaso de cerâmica"]],
  quadro: [["basico", 1, 1, "Pôster do clube do coração"], ["brasileiro", 1, 1, "Pôster da seleção"], ["rustico", 2, 2, "Quadro de paisagem"],
    ["gamer", 4, 2, "Camisa autografada emoldurada", { efeitos: { moral: 1, fama: 1 } }], ["moderno", 3, 3, "Obra de arte abstrata"], ["classico", 2, 4, "Pintura a óleo com moldura dourada", { efeitos: { moral: 3, fama: 1 } }]],
  escultura: [["brasileiro", 1, 1, "Bola de capotão no pedestal"], ["moderno", 2, 2, "Escultura abstrata"], ["classico", 3, 3, "Busto de mármore", { efeitos: { moral: 2, fama: 1 } }]],
  trofeus: [["basico", 1, 1, "Prateleira de troféus"], ["rustico", 1, 2, "Prateleira de madeira de lei"], ["moderno", 2, 3, "Vitrine iluminada"], ["classico", 3, 4, "Galeria de troféus"]],
  piscina: [["basico", 1, 3, "Piscina de fibra"], ["moderno", 2, 4, "Piscina aquecida com luz"], ["classico", 3, 4, "Piscina com hidro e banheira de gelo", { efeitos: { recuperacao: 5, lesao: 3, moral: 2 } }]],
  espreguicadeira: [["brasileiro", 1, 1, "Cadeira de praia listrada"], ["rustico", 2, 2, "Espreguiçadeira de madeira"], ["moderno", 2, 2, "Espreguiçadeira de alumínio"], ["classico", 3, 3, "Daybed com cobertura"]],
  churrasqueira: [["basico", 1, 1, "Churrasqueira portátil"], ["brasileiro", 2, 2, "Churrasqueira de alvenaria"], ["rustico", 2, 2, "Churrasqueira de tijolo à vista"], ["moderno", 3, 3, "Espaço gourmet"]],
  mesaExterna: [["brasileiro", 1, 1, "Mesa de plástico com guarda-sol"], ["rustico", 2, 2, "Mesa de madeira de demolição"], ["moderno", 2, 3, "Mesa de jardim com ombrelone"]],
  trave: [["basico", 1, 2, "Trave de treino"], ["moderno", 2, 3, "Gol com rede de finalização"]],
  jacuzzi: [["moderno", 1, 3, "Jacuzzi para seis"]],
  fogueira: [["rustico", 1, 2, "Fogueira de pedra"], ["moderno", 2, 3, "Lareira externa a gás"]],
  moto: [
    ["basico", 1, 1, "Moto de entregador", { preco: 15000, efeitos: { moral: 1 }, cores: ["#C0392B", "#2C2C2C"] }],
    ["gamer", 2, 2, "Moto esportiva", { preco: 90000, efeitos: { moral: 1, fama: 1 }, cores: ["#18E0C8", "#C0392B", "#111111"] }],
  ],
  mesa: [["basico", 1, 1, "Escrivaninha simples"], ["rustico", 1, 2, "Escrivaninha de madeira maciça"], ["moderno", 2, 2, "Mesa com notebook para ver jogos", { efeitos: { evolucao: 1 } }],
    ["gamer", 3, 3, "Central de análise de vídeo", { efeitos: { evolucao: 3 } }]],
};

export const CATALOGO: Item[] = [];
for (const [tipo, linhas] of Object.entries(PRODUTOS) as [TipoMovel, Linha[]][]) {
  const info = TIPOS[tipo];
  linhas.forEach(([estilo, forma, nivel, nome, o = {}]) => {
    const preco = o.preco ?? redondo(info.base * MULT[nivel] * ESTILOS[estilo].fator);
    const efeitos = o.efeitos ?? Object.fromEntries(Object.entries(info.efeito).map(([k, v]) => [k, escala(v as number, nivel)]));
    const id = `${tipo}-${estilo}-${forma}-${nivel}`;
    CATALOGO.push({ id, tipo, estilo, forma, nivel, nome, preco, efeitos, cores: o.cores ?? ESTILOS[estilo][info.corDe], aVenda: o.venda ?? tipo !== "beliche" });
  });
}
const TIPO_REL: Record<Reliquia["tipo"], TipoMovel> = { camisa: "camisaRel", bola: "bolaRel", trofeu: "trofeuRel" };
export const itemDaReliquia = (r: Reliquia): Item => ({
  id: r.id, tipo: TIPO_REL[r.tipo], estilo: "basico", forma: 1, nivel: 2, nome: r.nome, preco: 0,
  efeitos: { ...TIPOS[TIPO_REL[r.tipo]].efeito }, cores: [r.cores[0], r.cores[1]], aVenda: false, rel: r,
});
/** Itens do catálogo e relíquias registradas. Relíquia ainda não registrada (save recém-aberto) vira um genérico, sem quebrar nada. */
export const ITENS: Record<string, Item> = new Proxy(Object.fromEntries(CATALOGO.map((i) => [i.id, i])) as Record<string, Item>, {
  get(alvo, k) {
    if (typeof k !== "string" || alvo[k] || !k.startsWith("rel-")) return alvo[k as string];
    const tipo = (k.split("-")[1] ?? "bola") as Reliquia["tipo"];
    return itemDaReliquia({ id: k, chave: k, tipo: TIPO_REL[tipo] ? tipo : "bola", nome: "Relíquia", legenda: "", ano: 0, cores: ["#E3B341", "#F4F1EA"], modelo: "" });
  },
});
/** Coloca as relíquias do save no registro de itens (chamar ao abrir um save). */
export function registrarReliquias(e: EstadoCasa) { for (const r of e.reliquias ?? []) ITENS[r.id] = itemDaReliquia(r); }
export const ehReliquia = (itemId: string) => itemId.startsWith("rel-");
export const itemPorNome = (nome: string) => CATALOGO.find((i) => i.nome === nome)!;

// ------------------------------------------------------------------ revestimentos de parede e piso
export interface Revestimento { id: string; nome: string; lugar: "parede" | "piso"; ambientes: Ambiente[]; padrao: string; cores: string[]; nomesCores?: string[]; precoM2: number; qualidade: number }
const rv = (id: string, nome: string, lugar: "parede" | "piso", ambientes: Ambiente[], cores: string[], precoM2: number, qualidade: number, nomesCores?: string[]): Revestimento =>
  ({ id, nome, lugar, ambientes, padrao: id, cores, precoM2, qualidade, nomesCores });
export const REVESTIMENTOS: Revestimento[] = [
  rv("pintura", "Pintura", "parede", ["interno", "garagem"], ["#F1EFEA", "#E8DCC4", "#D9DCDA", "#B9C9B0", "#BFD7E6", "#D99A78", "#F2D98A", "#E3B9B4", "#2F4560", "#3E5E48", "#4A4D52", "#6E2E3A"], 25, 1,
    ["Branco gelo", "Areia", "Cinza claro", "Verde sálvia", "Azul céu", "Terracota", "Amarelo", "Rosa antigo", "Azul marinho", "Verde floresta", "Grafite", "Vinho"]),
  rv("descascada", "Pintura descascada", "parede", ["interno"], ["#D9D2BE", "#C9CFC0"], 10, 1),
  rv("faixa", "Pintura com faixa", "parede", ["interno"], ["#CFDCCB", "#E8DCC4", "#D9DCDA"], 35, 1),
  rv("listras", "Papel listrado", "parede", ["interno"], ["#E8DCC4", "#BFD7E6", "#B9C9B0", "#E3B9B4"], 60, 2),
  rv("floral", "Papel floral", "parede", ["interno"], ["#F3EAD8", "#DCE8D6", "#2F4560"], 80, 3),
  rv("geometrico", "Papel geométrico", "parede", ["interno"], ["#1E1E1E", "#F1EFEA", "#2F4560"], 90, 3),
  rv("tijolinho", "Tijolinho à vista", "parede", ["interno", "garagem"], ["#B5603F", "#EDE6DC", "#5A5A5A"], 120, 3, ["Tijolo", "Branco", "Grafite"]),
  rv("concreto", "Concreto aparente", "parede", ["interno", "garagem"], ["#A9ABA7"], 150, 3),
  rv("azulejo", "Azulejo português", "parede", ["interno"], ["#2B5BA8", "#2E7D4F", "#B5603F"], 180, 4),
  rv("ripado", "Madeira ripada", "parede", ["interno"], ["#B98E5F", "#6B4A30", "#2B2B2B"], 220, 4, ["Carvalho", "Nogueira", "Preto"]),
  rv("boiserie", "Boiserie", "parede", ["interno"], ["#F1EFEA", "#5E7A66", "#2F4560"], 300, 5),
  rv("marmoreP", "Mármore", "parede", ["interno"], ["#EFEBE4", "#2A2A2A", "#E3D3BE"], 450, 5, ["Carrara", "Nero", "Travertino"]),
  rv("muro", "Muro pintado", "parede", ["externo"], ["#E8DCC4", "#F1EFEA", "#D99A78", "#B9C9B0"], 30, 1),
  rv("cerca", "Cerca viva", "parede", ["externo"], ["#4E8F44", "#3B6E35"], 90, 3),
  rv("vidro", "Guarda-corpo de vidro", "parede", ["externo"], ["#BFE3F2"], 400, 4),
  rv("pedra", "Muro de pedra", "parede", ["externo"], ["#9C9488", "#7A6E62"], 160, 3),
  rv("cimento", "Cimento queimado", "piso", ["interno", "garagem"], ["#9EA19A", "#B9B6AE", "#6F7270"], 40, 1),
  rv("ceramica", "Cerâmica", "piso", ["interno"], ["#E3D9C6", "#C9CCC8", "#B87A5A"], 60, 2),
  rv("taco", "Taco de madeira", "piso", ["interno"], ["#B98E5F", "#8A5A35"], 110, 3),
  rv("madeira", "Assoalho de madeira", "piso", ["interno"], ["#D2B48C", "#8A5A35", "#5A3B26"], 180, 3, ["Carvalho", "Nogueira", "Ipê"]),
  rv("carpete", "Carpete", "piso", ["interno"], ["#C8BBA3", "#7D8288", "#2F4560", "#6E2E3A"], 90, 3),
  rv("hidraulico", "Ladrilho hidráulico", "piso", ["interno"], ["#2E7D4F", "#2B5BA8", "#B5524A"], 200, 4),
  rv("porcelanato", "Porcelanato", "piso", ["interno", "garagem"], ["#DDD8CF", "#B9BBB8", "#F4F2EE", "#3A3A3A"], 160, 4),
  rv("marmore", "Mármore", "piso", ["interno"], ["#EFEBE4", "#E3D3BE", "#2A2A2A"], 600, 5, ["Carrara", "Travertino", "Nero"]),
  rv("epoxi", "Epóxi", "piso", ["garagem"], ["#8E9592", "#2E2E2E", "#2B5BA8"], 120, 3),
  rv("grama", "Grama", "piso", ["externo"], ["#86B86A", "#6FA35A"], 30, 2),
  rv("deck", "Deck de madeira", "piso", ["externo"], ["#B98E5F", "#8A5A35"], 250, 4),
  rv("pedraPiso", "Pedra", "piso", ["externo"], ["#C9C1B3", "#9C9488"], 140, 3),
  rv("porcelanatoExt", "Porcelanato externo", "piso", ["externo"], ["#E6E1D6", "#B9BBB8"], 180, 4),
];
export const REVEST: Record<string, Revestimento> = Object.fromEntries(REVESTIMENTOS.map((r) => [r.id, r]));
export interface Acabamento { id: string; cor: number }

// ------------------------------------------------------------------ imóveis
export type CategoriaImovel = "alojamento" | "kitnet" | "apartamento" | "casa" | "mansao";
export const CATEGORIAS_IMOVEL: Record<CategoriaImovel, string> = { alojamento: "Alojamentos", kitnet: "Kitnets", apartamento: "Apartamentos", casa: "Casas", mansao: "Mansões" };
export type Vista = "ct" | "rua" | "cidade" | "condominio" | "mar" | "campo";
export type TipoComodo = "quarto" | "sala" | "cozinha" | "banheiro" | "escritorio" | "academia" | "jogos" | "trofeus" | "externo" | "garagem" | "kitnet";
export interface Janela { parede: "esq" | "dir"; pos: number; largura: number }
export interface Incluso { item: string; x: number; y: number; rot?: number; parede?: "esq" | "dir" }
export interface Comodo {
  id: string; nome: string; tipo: TipoComodo; ambiente: Ambiente; w: number; d: number; alturaParede?: number;
  janelas: Janela[]; parede: Acabamento; piso: Acabamento; inclusos?: Incluso[];
  escudo?: { parede: "esq" | "dir"; pos: number }; // escudo do clube pintado na parede (alojamentos)
}
export interface Imovel {
  id: string; categoria: CategoriaImovel; nome: string; local: string; descricao: string;
  aluguel: number; compra?: number; vista: Vista; comodos: Comodo[];
}

const ac = (id: string, cor = 0): Acabamento => ({ id, cor });
const cm = (id: string, nome: string, tipo: TipoComodo, w: number, d: number, o: Partial<Comodo> = {}): Comodo => {
  const ambiente: Ambiente = tipo === "externo" ? "externo" : tipo === "garagem" ? "garagem" : "interno";
  const padraoPiso = ambiente === "externo" ? ac("grama") : ambiente === "garagem" ? ac("cimento") : ac("ceramica");
  const padraoParede = ambiente === "externo" ? ac("muro") : ambiente === "garagem" ? ac("pintura", 2) : ac("pintura");
  return { id, nome, tipo, ambiente, w, d, janelas: [], parede: padraoParede, piso: padraoPiso, ...o };
};
const jn = (parede: "esq" | "dir", pos: number, largura = 2.4): Janela => ({ parede, pos, largura });
const BANHEIRO_BASICO: Incluso[] = [{ item: "vaso-basico-1-1", x: 0, y: 0 }, { item: "pia-basico-1-1", x: 2, y: 0 }, { item: "chuveiro-basico-1-1", x: 0, y: 3, rot: 1 }];
const BANHEIRO_LUXO = (e: "moderno" | "classico"): Incluso[] => e === "moderno"
  ? [{ item: "vaso-moderno-2-2", x: 0, y: 0 }, { item: "pia-moderno-2-2", x: 2, y: 0 }, { item: "chuveiro-moderno-2-3", x: 0, y: 3, rot: 1 }, { item: "banheira-moderno-1-2", x: 5, y: 0 }]
  : [{ item: "vaso-classico-2-3", x: 0, y: 0 }, { item: "pia-classico-2-3", x: 2, y: 0 }, { item: "chuveiro-classico-2-3", x: 0, y: 3, rot: 1 }, { item: "banheira-classico-2-3", x: 5, y: 0 }];
const banheiro = (w: number, d: number, o: Partial<Comodo> = {}) => cm("banheiro", "Banheiro", "banheiro", w, d, { parede: ac("azulejo"), piso: ac("ceramica", 1), inclusos: BANHEIRO_BASICO, ...o });
const PIA = (x = 0, y = 0, item = "bancada-basico-1-1"): Incluso[] => [{ item, x, y }];

export const IMOVEIS: Imovel[] = [
  // ---------------- alojamentos
  { id: "aloj-kitnet", categoria: "alojamento", nome: "Kitnet paga pelo clube", local: "Rua de trás do estádio", vista: "rua", aluguel: 0,
    descricao: "O clube não tem alojamento. Paga uma kitnet apertada: colchão no chão, parede descascada e um banheiro onde mal cabe você.",
    comodos: [cm("kitnet", "Kitnet", "kitnet", 8, 7, { parede: ac("descascada"), piso: ac("cimento", 2), janelas: [jn("esq", 5, 1.6)],
      inclusos: [{ item: "cama-basico-4-1", x: 0, y: 0 }, { item: "geladeira-basico-1-1", x: 4, y: 0 }, { item: "fogao-basico-1-1", x: 6, y: 0 }, { item: "quadro-basico-1-1", x: 2, y: 0, parede: "esq" }] }),
      cm("banheiro", "Banheiro", "banheiro", 4, 5, { parede: ac("descascada", 1), piso: ac("cimento", 2), inclusos: [{ item: "vaso-basico-1-1", x: 0, y: 0 }, { item: "pia-basico-1-1", x: 2, y: 0 }, { item: "chuveiro-basico-1-1", x: 0, y: 3, rot: 1 }] })] },
  { id: "aloj-vila", categoria: "alojamento", nome: "Alojamento de clube pequeno", local: "CT do interior", vista: "ct", aluguel: 0,
    descricao: "Quatro garotos num quarto, dois beliches e um armário de metal. Banheiro no fim do corredor.",
    comodos: [cm("quarto", "Quarto", "quarto", 10, 8, { parede: ac("faixa"), piso: ac("cimento"), janelas: [jn("dir", 8)], escudo: { parede: "esq", pos: 2.6 },
      inclusos: [{ item: "beliche-basico-1-1", x: 0, y: 0 }, { item: "beliche-basico-1-1", x: 3, y: 0 }, { item: "armario-basico-2-2", x: 0, y: 5, rot: 1 }] })] },
  { id: "aloj-ct", categoria: "alojamento", nome: "Alojamento de CT profissional", local: "CT de clube grande", vista: "ct", aluguel: 0,
    descricao: "Quarto para dois, cama de verdade e banheiro próprio. O colega de quarto é o goleiro do sub-17.",
    comodos: [cm("quarto", "Quarto", "quarto", 11, 9, { parede: ac("faixa", 2), piso: ac("porcelanato", 1), janelas: [jn("esq", 6)], escudo: { parede: "dir", pos: 5.5 },
      inclusos: [{ item: "cama-basico-1-1", x: 0, y: 0 }, { item: "cama-basico-1-1", x: 6, y: 0 }, { item: "criado-basico-1-1", x: 4, y: 0 }] }),
      banheiro(6, 6)] },
  { id: "aloj-individual", categoria: "alojamento", nome: "Quarto individual no CT", local: "CT de clube rico", vista: "ct", aluguel: 0,
    descricao: "Quarto só seu, cama de casal, TV e banheiro próprio. O roupeiro do clube lava a sua roupa.",
    comodos: [cm("quarto", "Quarto", "quarto", 11, 9, { parede: ac("faixa", 2), piso: ac("madeira"), janelas: [jn("esq", 4)], escudo: { parede: "dir", pos: 9.6 },
      inclusos: [{ item: "cama-basico-2-2", x: 0, y: 0 }, { item: "criado-basico-1-1", x: 4, y: 0 }, { item: "armario-basico-2-2", x: 5, y: 0 }, { item: "mesa-basico-1-1", x: 8, y: 0 }, { item: "tv-basico-2-2", x: 0, y: 6, rot: 1 }] }),
      banheiro(6, 6)] },
  { id: "aloj-elite", categoria: "alojamento", nome: "Residência de atletas", local: "CT de clube de elite", vista: "ct", aluguel: 0,
    descricao: "Suíte grande, banheiro de hotel e uma sala de convivência com sinuca e pebolim. Parece concentração de seleção.",
    comodos: [cm("quarto", "Suíte", "quarto", 13, 10, { parede: ac("faixa", 2), piso: ac("madeira", 1), janelas: [jn("esq", 3.5, 3)], escudo: { parede: "dir", pos: 7.2 },
      inclusos: [{ item: "criado-moderno-2-2", x: 0, y: 0 }, { item: "cama-moderno-3-4", x: 1, y: 0 }, { item: "criado-moderno-2-2", x: 5, y: 0 }, { item: "armario-moderno-3-3", x: 9, y: 0 },
        { item: "tv-moderno-2-3", x: 0, y: 6, rot: 1 }, { item: "videogame-gamer-2-2", x: 3, y: 7 }, { item: "mesa-moderno-2-2", x: 10, y: 4, rot: 1 }] }),
      banheiro(8, 7, { inclusos: BANHEIRO_LUXO("moderno"), parede: ac("marmoreP"), piso: ac("porcelanato", 2) }),
      cm("convivencia", "Sala de convivência", "jogos", 12, 9, { parede: ac("faixa", 2), piso: ac("carpete", 1), escudo: { parede: "esq", pos: 4.5 },
        inclusos: [{ item: "sofa-moderno-2-3", x: 0, y: 0 }, { item: "tv-moderno-2-3", x: 5, y: 0 }, { item: "pebolim-basico-1-1", x: 10, y: 0 }, { item: "sinuca-moderno-2-3", x: 4, y: 2 }] })] },
  { id: "aloj-familia", categoria: "alojamento", nome: "Casa de família anfitriã", local: "Bairro perto do CT", vista: "rua", aluguel: 0,
    descricao: "O clube paga uma família para te receber. Quarto dos fundos, comida da dona Cida e hora para chegar.",
    comodos: [cm("quarto", "Quarto dos fundos", "quarto", 9, 8, { parede: ac("floral"), piso: ac("taco"), janelas: [jn("dir", 6.5)],
      inclusos: [{ item: "cama-brasileiro-1-1", x: 0, y: 0 }, { item: "armario-basico-2-2", x: 0, y: 5, rot: 1 }, { item: "quadro-basico-1-1", x: 3, y: 0, parede: "esq" }] })] },
  // ---------------- kitnets
  { id: "kit-ct", categoria: "kitnet", nome: "Kitnet perto do CT", local: "Vila Operária", vista: "rua", aluguel: 1200,
    descricao: "Um cômodo só, mas é seu. Dá para ir a pé ao treino.",
    comodos: [cm("kitnet", "Kitnet", "kitnet", 11, 9, { piso: ac("ceramica"), janelas: [jn("esq", 4)], inclusos: PIA(8, 0) }), banheiro(5, 6)] },
  { id: "kit-centro", categoria: "kitnet", nome: "Studio no centro", local: "Centro", vista: "cidade", aluguel: 2400,
    descricao: "Prédio novo, varandinha com vista para a cidade e muito barulho na sexta.",
    comodos: [cm("kitnet", "Studio", "kitnet", 12, 9, { parede: ac("pintura", 2), piso: ac("porcelanato"), janelas: [jn("esq", 6, 3)], inclusos: PIA(9, 0) }),
      banheiro(5, 6, { parede: ac("pintura") }), cm("varanda", "Varanda", "externo", 7, 4, { piso: ac("porcelanatoExt"), parede: ac("vidro") })] },
  { id: "kit-republica", categoria: "kitnet", nome: "Quarto em república", local: "Perto da faculdade", vista: "rua", aluguel: 800,
    descricao: "Barato e animado. Cozinha dividida com três estudantes e uma geladeira com nomes nos potes.",
    comodos: [cm("quarto", "Quarto", "quarto", 8, 8, { parede: ac("pintura", 6), piso: ac("taco", 1), janelas: [jn("dir", 5)] }),
      cm("cozinha", "Cozinha dividida", "cozinha", 9, 7, { parede: ac("azulejo", 1), piso: ac("hidraulico"), janelas: [jn("esq", 4)],
        inclusos: [{ item: "geladeira-basico-2-2", x: 0, y: 0 }, { item: "fogao-basico-1-1", x: 2, y: 0 }, { item: "bancada-brasileiro-1-1", x: 4, y: 0 }, { item: "mesaJantar-brasileiro-1-1", x: 3, y: 3 }] })] },
  { id: "kit-loft", categoria: "kitnet", nome: "Loft industrial", local: "Antiga fábrica", vista: "cidade", aluguel: 3200,
    descricao: "Pé-direito alto, tijolinho e janelão de ferro. Cabe muita coisa.",
    comodos: [cm("kitnet", "Loft", "kitnet", 14, 10, { alturaParede: 6.8, parede: ac("tijolinho"), piso: ac("cimento", 2), janelas: [jn("esq", 5, 4), jn("dir", 7, 4)], inclusos: PIA(11, 0) }),
      banheiro(6, 6, { parede: ac("concreto"), piso: ac("cimento", 2) })] },
  // ---------------- apartamentos
  { id: "ap-2q", categoria: "apartamento", nome: "Apartamento de dois quartos", local: "Bairro residencial", vista: "cidade", aluguel: 6000, compra: 750000,
    descricao: "Sala, cozinha, varanda, um quarto e um escritório. Uma vaga na garagem do prédio.",
    comodos: [cm("quarto", "Quarto", "quarto", 10, 8, { piso: ac("madeira"), janelas: [jn("esq", 6.5)] }), cm("escritorio", "Escritório", "escritorio", 8, 7, { piso: ac("madeira"), janelas: [jn("dir", 5)] }),
      cm("sala", "Sala", "sala", 11, 9, { piso: ac("madeira"), janelas: [jn("esq", 6, 3)] }), cm("cozinha", "Cozinha", "cozinha", 8, 7, { janelas: [jn("dir", 6, 2)], inclusos: PIA() }),
      banheiro(6, 6), cm("varanda", "Varanda", "externo", 8, 4, { piso: ac("deck"), parede: ac("vidro") }), cm("garagem", "Garagem", "garagem", 6, 9)] },
  { id: "ap-garden", categoria: "apartamento", nome: "Apartamento garden", local: "Térreo com jardim", vista: "condominio", aluguel: 8000, compra: 1100000,
    descricao: "Térreo com um jardim só seu. Dá para fazer churrasco sem incomodar o vizinho de cima.",
    comodos: [cm("quarto", "Quarto", "quarto", 10, 8, { piso: ac("porcelanato"), janelas: [jn("esq", 6.5)] }), cm("sala", "Sala", "sala", 12, 9, { piso: ac("porcelanato"), janelas: [jn("esq", 6, 4)] }),
      cm("cozinha", "Cozinha", "cozinha", 8, 7, { janelas: [jn("dir", 6, 2)], inclusos: PIA() }), banheiro(6, 6),
      cm("jardim", "Jardim", "externo", 11, 8, { parede: ac("cerca") }), cm("garagem", "Garagem", "garagem", 6, 9)] },
  { id: "ap-mar", categoria: "apartamento", nome: "Apartamento de frente para o mar", local: "Orla", vista: "mar", aluguel: 14000, compra: 2200000,
    descricao: "Acorda com o mar na janela. Varanda gourmet e duas vagas.",
    comodos: [cm("quarto", "Suíte", "quarto", 11, 9, { piso: ac("porcelanato", 2), janelas: [jn("esq", 6, 4)] }), cm("sala", "Sala", "sala", 13, 9, { piso: ac("porcelanato", 2), janelas: [jn("esq", 5, 5), jn("dir", 9, 3)] }),
      cm("cozinha", "Cozinha", "cozinha", 9, 7, { janelas: [jn("dir", 6, 2)], inclusos: PIA() }), banheiro(7, 6, { parede: ac("pintura") }),
      cm("varanda", "Varanda gourmet", "externo", 11, 5, { piso: ac("porcelanatoExt"), parede: ac("vidro") }), cm("garagem", "Garagem", "garagem", 11, 9)] },
  { id: "ap-alto", categoria: "apartamento", nome: "Apartamento alto padrão", local: "Bairro nobre", vista: "cidade", aluguel: 12000, compra: 1800000,
    descricao: "Suíte, closet, sala ampla e porteiro que já pediu foto. Duas vagas.",
    comodos: [cm("quarto", "Suíte", "quarto", 11, 9, { piso: ac("madeira", 1), janelas: [jn("esq", 6, 3)] }), cm("escritorio", "Closet e escritório", "escritorio", 9, 7, { piso: ac("madeira", 1) }),
      cm("sala", "Sala", "sala", 13, 10, { piso: ac("madeira", 1), janelas: [jn("esq", 6, 5)] }), cm("cozinha", "Cozinha", "cozinha", 9, 8, { piso: ac("porcelanato"), janelas: [jn("dir", 6.5, 2.4)], inclusos: PIA() }),
      banheiro(7, 6, { parede: ac("marmoreP"), piso: ac("porcelanato", 2) }), cm("varanda", "Varanda", "externo", 9, 4, { piso: ac("deck"), parede: ac("vidro") }), cm("garagem", "Garagem", "garagem", 11, 9)] },
  // ---------------- casas
  { id: "casa-cond", categoria: "casa", nome: "Casa em condomínio", local: "Condomínio fechado", vista: "condominio", aluguel: 22000, compra: 2500000,
    descricao: "Quintal grande, academia em casa e garagem para dois carros. A família pode vir morar junto.",
    comodos: [cm("quarto", "Suíte", "quarto", 11, 9, { piso: ac("porcelanato"), janelas: [jn("esq", 6.5, 3)] }), cm("sala", "Sala", "sala", 12, 10, { piso: ac("porcelanato"), janelas: [jn("esq", 6.5, 4)] }),
      cm("cozinha", "Cozinha", "cozinha", 9, 8, { janelas: [jn("dir", 6.5)], inclusos: PIA(0, 0, "bancada-moderno-2-3") }), banheiro(7, 6), cm("academia", "Academia", "academia", 9, 8, { piso: ac("cimento", 2), janelas: [jn("esq", 5.5, 3)] }),
      cm("quintal", "Quintal", "externo", 13, 11, { parede: ac("cerca") }), cm("garagem", "Garagem", "garagem", 11, 9)] },
  { id: "casa-praia", categoria: "casa", nome: "Casa pé na areia", local: "Litoral", vista: "mar", aluguel: 30000, compra: 3800000,
    descricao: "Deck de madeira de frente para o mar e piscina já construída. Chinelo é obrigatório.",
    comodos: [cm("quarto", "Suíte", "quarto", 11, 9, { parede: ac("pintura", 4), piso: ac("madeira"), janelas: [jn("esq", 6, 4)] }),
      cm("sala", "Sala", "sala", 12, 10, { parede: ac("ripado"), piso: ac("madeira"), janelas: [jn("esq", 6, 5)] }), cm("cozinha", "Cozinha", "cozinha", 9, 7, { parede: ac("azulejo"), janelas: [jn("dir", 6)], inclusos: PIA(0, 0, "bancada-moderno-2-3") }),
      banheiro(7, 6), cm("deck", "Deck", "externo", 15, 10, { piso: ac("deck"), parede: ac("vidro"), inclusos: [{ item: "piscina-basico-1-3", x: 5, y: 3 }] }), cm("garagem", "Garagem", "garagem", 6, 9)] },
  { id: "casa-sobrado", categoria: "casa", nome: "Sobrado na cidade", local: "Bairro tradicional", vista: "rua", aluguel: 15000, compra: 1800000,
    descricao: "Dois andares, dois quartos, quintal de pedra e garagem para dois.",
    comodos: [cm("quarto", "Quarto", "quarto", 10, 9, { piso: ac("taco"), janelas: [jn("esq", 6)] }), cm("quarto2", "Quarto de hóspedes", "quarto", 9, 8, { piso: ac("taco"), janelas: [jn("dir", 5)] }),
      cm("sala", "Sala", "sala", 12, 9, { piso: ac("taco"), janelas: [jn("esq", 6, 3)] }), cm("cozinha", "Cozinha", "cozinha", 9, 8, { piso: ac("hidraulico", 2), janelas: [jn("dir", 6)], inclusos: PIA(0, 0, "bancada-moderno-2-3") }),
      banheiro(6, 6), cm("quintal", "Quintal", "externo", 9, 7, { piso: ac("pedraPiso"), parede: ac("muro", 2) }), cm("garagem", "Garagem", "garagem", 11, 9)] },
  { id: "casa-sitio", categoria: "casa", nome: "Sítio no interior", local: "Interior", vista: "campo", aluguel: 18000, compra: 2800000,
    descricao: "Varandão, fogão a lenha, campinho no gramado e galpão para a picape.",
    comodos: [cm("quarto", "Quarto", "quarto", 10, 9, { parede: ac("pintura", 1), piso: ac("taco", 1), janelas: [jn("esq", 6)] }),
      cm("sala", "Sala", "sala", 12, 10, { parede: ac("tijolinho"), piso: ac("taco", 1), janelas: [jn("esq", 6, 3)] }),
      cm("cozinha", "Cozinha caipira", "cozinha", 10, 8, { parede: ac("azulejo", 1), piso: ac("hidraulico", 2), janelas: [jn("dir", 7)], inclusos: [{ item: "fogao-brasileiro-4-2", x: 0, y: 0 }, { item: "bancada-rustico-2-2", x: 2, y: 0 }] }),
      banheiro(6, 6), cm("varandao", "Varandão", "externo", 13, 5, { piso: ac("pedraPiso", 1), parede: ac("muro") }),
      cm("gramado", "Gramado", "externo", 16, 12, { parede: ac("cerca", 1) }), cm("garagem", "Galpão", "garagem", 7, 9, { parede: ac("tijolinho") })] },
  // ---------------- mansões
  { id: "man-moderna", categoria: "mansao", nome: "Mansão moderna", local: "Condomínio de luxo", vista: "cidade", aluguel: 90000, compra: 15000000,
    descricao: "Vidro, concreto e piscina de borda infinita. Sala de jogos e garagem para quatro.",
    comodos: [cm("quarto", "Suíte master", "quarto", 12, 10, { parede: ac("concreto"), piso: ac("madeira", 1), janelas: [jn("esq", 6.5, 5)] }),
      cm("sala", "Sala", "sala", 14, 11, { parede: ac("pintura"), piso: ac("porcelanato", 1), janelas: [jn("esq", 6, 6), jn("dir", 9, 4)] }),
      cm("cozinha", "Cozinha gourmet", "cozinha", 10, 8, { parede: ac("marmoreP", 1), piso: ac("porcelanato", 1), janelas: [jn("dir", 7.5, 3)], inclusos: PIA(0, 0, "bancada-classico-2-4") }),
      banheiro(9, 7, { inclusos: BANHEIRO_LUXO("moderno"), parede: ac("marmoreP"), piso: ac("porcelanato", 2) }), cm("jogos", "Sala de jogos", "jogos", 12, 10, { parede: ac("pintura", 10), piso: ac("carpete", 1) }),
      cm("academia", "Academia", "academia", 10, 8, { piso: ac("cimento", 2), janelas: [jn("esq", 5.5, 4)] }),
      cm("piscina", "Área da piscina", "externo", 16, 12, { piso: ac("porcelanatoExt"), parede: ac("vidro") }), cm("garagem", "Garagem", "garagem", 21, 9, { piso: ac("epoxi", 1) })] },
  { id: "man-classica", categoria: "mansao", nome: "Mansão clássica", local: "Bairro histórico", vista: "condominio", aluguel: 75000, compra: 12000000,
    descricao: "Boiserie, mármore e lustre. Biblioteca, sala de troféus e jardim francês.",
    comodos: [cm("quarto", "Suíte master", "quarto", 12, 10, { parede: ac("boiserie"), piso: ac("madeira", 2), janelas: [jn("esq", 6.5, 3)] }),
      cm("sala", "Salão", "sala", 14, 11, { parede: ac("boiserie", 1), piso: ac("marmore"), janelas: [jn("esq", 4, 3), jn("esq", 9, 3)] }),
      cm("cozinha", "Cozinha", "cozinha", 10, 8, { parede: ac("azulejo"), piso: ac("hidraulico", 1), janelas: [jn("dir", 7)], inclusos: PIA(0, 0, "bancada-classico-2-4") }),
      banheiro(8, 7, { inclusos: BANHEIRO_LUXO("classico"), parede: ac("marmoreP"), piso: ac("marmore") }), cm("trofeus", "Sala de troféus", "trofeus", 11, 8, { parede: ac("ripado", 1), piso: ac("carpete", 3) }),
      cm("escritorio", "Biblioteca", "escritorio", 10, 8, { parede: ac("ripado", 1), piso: ac("madeira", 1), janelas: [jn("dir", 7)] }),
      cm("jardim", "Jardim", "externo", 15, 12, { parede: ac("cerca"), piso: ac("grama", 1) }), cm("garagem", "Garagem", "garagem", 16, 9, { piso: ac("porcelanato", 1) })] },
  { id: "man-cobertura", categoria: "mansao", nome: "Cobertura triplex", local: "Topo do prédio mais alto", vista: "cidade", aluguel: 110000, compra: 18000000,
    descricao: "Três andares no alto da cidade, terraço com piscina e sala de jogos.",
    comodos: [cm("quarto", "Suíte master", "quarto", 12, 10, { parede: ac("geometrico", 1), piso: ac("madeira", 2), janelas: [jn("esq", 6.5, 6)] }),
      cm("sala", "Sala", "sala", 15, 11, { parede: ac("pintura", 10), piso: ac("porcelanato", 3), janelas: [jn("esq", 5.5, 7), jn("dir", 8, 6)] }),
      cm("cozinha", "Cozinha", "cozinha", 10, 8, { parede: ac("marmoreP", 1), piso: ac("porcelanato", 3), inclusos: PIA(0, 0, "bancada-classico-2-4") }), banheiro(8, 7, { inclusos: BANHEIRO_LUXO("moderno"), parede: ac("marmoreP", 1), piso: ac("porcelanato", 3) }),
      cm("jogos", "Sala de jogos", "jogos", 12, 10, { parede: ac("tijolinho", 2), piso: ac("madeira", 2) }),
      cm("terraco", "Terraço", "externo", 15, 11, { piso: ac("deck", 1), parede: ac("vidro") }), cm("garagem", "Garagem", "garagem", 16, 9, { piso: ac("epoxi", 1) })] },
  { id: "man-mar", categoria: "mansao", nome: "Mansão à beira-mar", local: "Praia particular", vista: "mar", aluguel: 140000, compra: 25000000,
    descricao: "Areia na porta, piscina, academia, sala de troféus e garagem para a coleção.",
    comodos: [cm("quarto", "Suíte master", "quarto", 13, 10, { parede: ac("pintura", 4), piso: ac("madeira"), janelas: [jn("esq", 6.5, 6)] }),
      cm("sala", "Sala", "sala", 15, 11, { parede: ac("ripado"), piso: ac("marmore", 1), janelas: [jn("esq", 7, 8)] }),
      cm("cozinha", "Cozinha gourmet", "cozinha", 11, 8, { parede: ac("azulejo"), piso: ac("marmore", 1), janelas: [jn("dir", 7.5, 3)], inclusos: PIA(0, 0, "bancada-classico-2-4") }),
      banheiro(9, 7, { inclusos: BANHEIRO_LUXO("moderno"), parede: ac("marmoreP", 2), piso: ac("marmore", 1) }), cm("academia", "Academia", "academia", 10, 8, { piso: ac("cimento", 2), janelas: [jn("esq", 5.5, 4)] }),
      cm("trofeus", "Sala de troféus", "trofeus", 11, 8, { parede: ac("pintura", 10), piso: ac("carpete", 2) }),
      cm("piscina", "Área da piscina", "externo", 17, 12, { piso: ac("deck"), parede: ac("vidro") }), cm("garagem", "Garagem", "garagem", 21, 9, { piso: ac("epoxi") })] },
];
export const IMOVEL: Record<string, Imovel> = Object.fromEntries(IMOVEIS.map((m) => [m.id, m]));
export const areaM2 = (m: Imovel) => Math.round(m.comodos.reduce((s, c) => s + c.w * c.d * 0.25, 0));

// ------------------------------------------------------------------ estado
export interface Objeto { uid: string; item: string; cor: number; comodo: string; x: number; y: number; rot: number; parede?: "esq" | "dir"; incluso?: boolean }
export interface Guardado { uid: string; item: string; cor: number }
export interface ClubeCasa { id: string; nome: string; apelido: string; cores: string[]; forca: number }
export interface EstadoCasa {
  saldo: number; imovel: string; proprios: string[];
  clube?: ClubeCasa;
  removidos: string[]; // itens do imóvel que o dono vendeu (não voltam)
  objetos: Objeto[]; deposito: Guardado[];
  acabamentos: Record<string, { parede: Acabamento; piso: Acabamento }>; // "imovel.comodo"
  mes: number; seq: number;
  /** camisas, bolas e troféus conquistados (podem estar na casa ou no depósito) */
  reliquias?: Reliquia[];
  /** carros comprados na loja de luxo: moram na garagem da casa */
  carros?: ItemLuxo[];
  /** casas próprias que você alugou para outra pessoa (renda mensal) */
  alugadas?: string[];
}
export type Resultado = { ok: true; msg: string; uid?: string; comodo?: string } | { ok: false; msg: string };

/** Clube grande tem CT com quarto para dois; clube menor, quarto coletivo. Todo clube também indica uma família anfitriã. */
/** Estrutura do clube, de 1 (pobre) a 5 (elite), pela força do elenco. Decide o alojamento que ele oferece. */
export const ESTRUTURAS = ["", "Pobre", "Modesta", "Média", "Rica", "Elite"];
const ALOJ_POR_NIVEL = ["", "aloj-kitnet", "aloj-vila", "aloj-ct", "aloj-individual", "aloj-elite"];
export function estruturaDoClube(c: ClubeCasa): number {
  return c.forca >= 76 ? 5 : c.forca >= 73 ? 4 : c.forca >= 71 ? 3 : c.forca >= 68 ? 2 : 1;
}
export function alojamentosDoClube(clube?: ClubeCasa): string[] {
  if (!clube) return [...ALOJ_POR_NIVEL.slice(1), "aloj-familia"];
  if (/^(V|HS|NC)-/.test(clube.id)) return ["aloj-familia"]; // várzea (casa dos pais), colégio e universidade nos EUA
  return [ALOJ_POR_NIVEL[estruturaDoClube(clube)], "aloj-familia"];
}
export function nomeImovel(e: EstadoCasa, m: Imovel): string {
  if (m.categoria !== "alojamento" || !e.clube) return m.nome;
  const n = e.clube.nome;
  if (m.id === "aloj-familia") {
    if (e.clube.id.startsWith("V-")) return "Casa dos pais";
    if (e.clube.id.startsWith("HS-")) return "Casa de família anfitriã em Miami";
    if (e.clube.id.startsWith("NC-")) return `Dormitório da universidade (${n})`;
    if (e.clube.id.startsWith("US-")) return `Casa da família perto do CT do ${e.clube.apelido}`;
  }
  return ({ "aloj-familia": `Casa de família indicada pelo ${e.clube.apelido}`, "aloj-kitnet": `Kitnet paga pelo ${n}`, "aloj-vila": `Alojamento coletivo do ${n}`,
    "aloj-ct": `Alojamento do ${n}`, "aloj-individual": `Quarto individual no CT do ${n}`, "aloj-elite": `Residência de atletas do ${n}` } as Record<string, string>)[m.id] ?? m.nome;
}
/** Cor principal do clube para pintar o alojamento (pula o branco). */
export function coresDoClube(c?: ClubeCasa): [string, string] | undefined {
  if (!c) return;
  const forte = c.cores.find((x) => x.toUpperCase() !== "#FFFFFF") ?? "#2E7D4F";
  const outra = c.cores.find((x) => x !== forte) ?? "#FFFFFF";
  return [forte, outra];
}

export const ehDono = (e: EstadoCasa) => e.proprios.includes(e.imovel);
/** Item do imóvel só se mexe se o imóvel for seu. */
export const travado = (e: EstadoCasa, o: Objeto) => !!o.incluso && !ehDono(e);
const instalacao = (item: string) => !!TIPOS[ITENS[item].tipo].instalacao;

export function novoEstado(saldo = 3000, imovel = "aloj-vila", clube?: ClubeCasa): EstadoCasa {
  if (clube && IMOVEL[imovel].categoria === "alojamento" && !alojamentosDoClube(clube).includes(imovel)) imovel = alojamentosDoClube(clube)[0];
  const e: EstadoCasa = { saldo, imovel, proprios: [], clube, removidos: [], objetos: [], deposito: [], acabamentos: {}, mes: 0, seq: 0 };
  colocarInclusos(e);
  return e;
}
const novoUid = (e: EstadoCasa) => `o${++e.seq}`;
export const imovelAtual = (e: EstadoCasa) => IMOVEL[e.imovel];
export const comodoDe = (e: EstadoCasa, id: string) => imovelAtual(e).comodos.find((c) => c.id === id)!;

export function acabamento(e: EstadoCasa, comodo: string): { parede: Acabamento; piso: Acabamento } {
  const c = comodoDe(e, comodo);
  return e.acabamentos[`${e.imovel}.${comodo}`] ?? { parede: c.parede, piso: c.piso };
}

function colocarInclusos(e: EstadoCasa) {
  for (const c of imovelAtual(e).comodos) for (const inc of c.inclusos ?? []) {
    const uid = `inc-${e.imovel}-${c.id}-${inc.x}-${inc.y}`;
    if (!e.removidos.includes(uid)) e.objetos.push({ uid, item: inc.item, cor: 0, comodo: c.id, x: inc.x, y: inc.y, rot: inc.rot ?? 0, parede: inc.parede, incluso: true });
  }
}

/** Retângulo ocupado no chão (rot ímpar troca largura e fundo). Para itens de parede, x é a posição ao longo da parede. */
export function area(o: { item: string; x: number; y: number; rot: number }) {
  const t = TIPOS[ITENS[o.item].tipo];
  return o.rot % 2 ? { x: o.x, y: o.y, w: t.d, d: t.w } : { x: o.x, y: o.y, w: t.w, d: t.d };
}
const cruza = (a: { x: number; y: number; w: number; d: number }, b: typeof a) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.d && b.y < a.y + a.d;
const comprimentoParede = (c: Comodo, p: "esq" | "dir") => (p === "esq" ? c.d : c.w);

/** Diz se um objeto cabe onde está, ignorando a si mesmo. */
export function cabe(e: EstadoCasa, o: Objeto): boolean {
  const c = imovelAtual(e).comodos.find((x) => x.id === o.comodo);
  if (!c) return false;
  const tipo = TIPOS[ITENS[o.item].tipo];
  if (!tipo.comodos.includes(c.tipo)) return false;
  const outros = e.objetos.filter((x) => x.comodo === o.comodo && x.uid !== o.uid);
  if (tipo.camada === "parede") {
    if (!o.parede || c.ambiente === "externo") return false;
    const L = comprimentoParede(c, o.parede), a0 = o.x - tipo.w / 2, a1 = o.x + tipo.w / 2;
    if (a0 < 0.3 || a1 > L - 0.3) return false;
    for (const j of c.janelas) if (j.parede === o.parede && a0 < j.pos + j.largura / 2 + 0.1 && j.pos - j.largura / 2 - 0.1 < a1) return false;
    for (const x of outros) if (TIPOS[ITENS[x.item].tipo].camada === "parede" && x.parede === o.parede) {
      const w = TIPOS[ITENS[x.item].tipo].w;
      if (a0 < x.x + w / 2 && x.x - w / 2 < a1) return false;
    }
    return true;
  }
  const a = area(o);
  if (a.x < 0 || a.y < 0 || a.x + a.w > c.w || a.y + a.d > c.d) return false;
  for (const x of outros) {
    const cx = TIPOS[ITENS[x.item].tipo].camada;
    if (cx === "parede") continue;
    const conflito = tipo.camada === "piscina" || cx === "piscina" || tipo.camada === cx;
    if (conflito && cruza(a, area(x))) return false;
  }
  return true;
}

/** Procura o primeiro lugar livre no cômodo: encostado na parede quando o móvel pede, senão em qualquer canto. */
export function acharLugar(e: EstadoCasa, item: string, comodo: string, uid = "?"): Objeto | undefined {
  const c = comodoDe(e, comodo), tipo = TIPOS[ITENS[item].tipo];
  const tenta = (o: Objeto) => (cabe(e, o) ? o : undefined);
  if (tipo.camada === "parede") {
    for (const p of ["dir", "esq"] as const) for (let x = 1.5; x < comprimentoParede(c, p); x += 0.5) {
      const r = tenta({ uid, item, cor: 0, comodo, x, y: 0, rot: 0, parede: p }); if (r) return r;
    }
    return;
  }
  const rots = tipo.camada === "piscina" || ITENS[item].tipo === "carro" || ITENS[item].tipo === "moto" ? [0] : [0, 1];
  if (tipo.encosta) {
    for (let x = 0; x < c.w; x++) { const r = tenta({ uid, item, cor: 0, comodo, x, y: 0, rot: 0 }); if (r) return r; }
    for (let y = 0; y < c.d; y++) { const r = tenta({ uid, item, cor: 0, comodo, x: 0, y, rot: 1 }); if (r) return r; }
  }
  // o resto: do meio para fora, para não colar tudo nas paredes
  const pos: [number, number][] = [];
  for (let y = 0; y < c.d; y++) for (let x = 0; x < c.w; x++) pos.push([x, y]);
  const cx = c.w / 2, cy = c.d / 2;
  if (!tipo.encosta && tipo.camada !== "chao") pos.sort((p, q) => Math.hypot(p[0] + tipo.w / 2 - cx, p[1] + tipo.d / 2 - cy) - Math.hypot(q[0] + tipo.w / 2 - cx, q[1] + tipo.d / 2 - cy));
  for (const rot of rots) for (const [x, y] of pos) { const r = tenta({ uid, item, cor: 0, comodo, x, y, rot }); if (r) return r; }
}

/** Cômodos onde o item pode ir, começando pelo preferido e depois pelos do mesmo tipo de ambiente. */
function comodosPara(e: EstadoCasa, item: string, preferido?: string): string[] {
  const ok = TIPOS[ITENS[item].tipo].comodos, cs = imovelAtual(e).comodos.filter((c) => ok.includes(c.tipo)).map((c) => c.id);
  return preferido && cs.includes(preferido) ? [preferido, ...cs.filter((c) => c !== preferido)] : cs;
}

/** Por que um item não pode entrar nesta casa (ou vazio se pode). */
export function motivoNaoCabe(e: EstadoCasa, itemId: string): string {
  const t = TIPOS[ITENS[itemId].tipo];
  if (t.instalacao && !ehDono(e)) return imovelAtual(e).categoria === "alojamento" ? "No alojamento não dá para instalar nada." : "Instalação: só em imóvel próprio.";
  if (!imovelAtual(e).comodos.some((c) => t.comodos.includes(c.tipo))) return `Esta casa não tem ${t.comodos.map((c) => NOME_COMODO[c]).filter((x, i, a) => a.indexOf(x) === i).slice(0, 3).join(" nem ")} para isso.`;
  return "";
}

export function comprar(e: EstadoCasa, itemId: string, cor: number, comodo: string): Resultado {
  const it = ITENS[itemId];
  if (!it || !it.aVenda) return { ok: false, msg: "Esse item não está à venda." };
  const motivo = motivoNaoCabe(e, itemId);
  if (motivo) return { ok: false, msg: motivo };
  if (e.saldo < it.preco) return { ok: false, msg: `Falta ${dinheiro(it.preco - e.saldo)} para comprar.` };
  e.saldo -= it.preco;
  const uid = novoUid(e);
  for (const cid of comodosPara(e, itemId, comodo)) {
    const lugar = acharLugar(e, itemId, cid, uid);
    if (lugar) { e.objetos.push({ ...lugar, cor }); return { ok: true, msg: `Comprou: ${it.nome}.`, uid, comodo: cid }; }
  }
  e.deposito.push({ uid, item: itemId, cor });
  return { ok: true, msg: `Comprou: ${it.nome}. Não coube na casa, foi para o depósito.` };
}

export function mover(e: EstadoCasa, uid: string, pos: { x: number; y: number; parede?: "esq" | "dir"; rot?: number }): Resultado {
  const o = e.objetos.find((x) => x.uid === uid);
  if (!o) return { ok: false, msg: "Objeto não encontrado." };
  if (travado(e, o)) return { ok: false, msg: "Esse é do imóvel e não sai do lugar." };
  if (instalacao(o.item) && !ehDono(e)) return { ok: false, msg: "Instalação só se mexe em imóvel próprio." };
  const novo = { ...o, ...pos, rot: pos.rot ?? o.rot };
  if (!cabe(e, novo)) return { ok: false, msg: "Não cabe aí." };
  Object.assign(o, novo);
  return { ok: true, msg: "" };
}

/** Gira 90°; se não couber no mesmo canto, tenta deslizar um pouco. */
export function girar(e: EstadoCasa, uid: string): Resultado {
  const o = e.objetos.find((x) => x.uid === uid);
  if (!o || travado(e, o)) return { ok: false, msg: "Esse não dá para girar." };
  if (TIPOS[ITENS[o.item].tipo].camada === "parede") return { ok: false, msg: "Quadros ficam na parede." };
  const rot = (o.rot + 1) % 4;
  for (const [dx, dy] of [[0, 0], [-1, 0], [0, -1], [-1, -1], [1, 0], [0, 1], [-2, 0], [0, -2], [-2, -2]]) {
    const r = mover(e, uid, { x: o.x + dx, y: o.y + dy, rot });
    if (r.ok) return r;
  }
  return { ok: false, msg: "Não tem espaço para girar aqui." };
}

export function guardar(e: EstadoCasa, uid: string): Resultado {
  const i = e.objetos.findIndex((x) => x.uid === uid);
  if (i < 0 || e.objetos[i].incluso) return { ok: false, msg: "Esse é do imóvel: dá para mover ou vender, não para guardar." };
  if (instalacao(e.objetos[i].item) && !ehDono(e)) return { ok: false, msg: "Instalação só sai em imóvel próprio." };
  const [o] = e.objetos.splice(i, 1);
  e.deposito.push({ uid: o.uid, item: o.item, cor: o.cor });
  return { ok: true, msg: `Guardado: ${ITENS[o.item].nome}.` };
}

export function tirarDoDeposito(e: EstadoCasa, uid: string, comodo: string): Resultado {
  const i = e.deposito.findIndex((x) => x.uid === uid);
  if (i < 0) return { ok: false, msg: "Item não encontrado." };
  const g = e.deposito[i];
  const motivo = motivoNaoCabe(e, g.item);
  if (motivo) return { ok: false, msg: motivo };
  for (const cid of comodosPara(e, g.item, comodo)) {
    const lugar = acharLugar(e, g.item, cid, g.uid);
    if (lugar) { e.deposito.splice(i, 1); e.objetos.push({ ...lugar, cor: g.cor }); return { ok: true, msg: `De volta: ${ITENS[g.item].nome}.`, uid: g.uid, comodo: cid }; }
  }
  return { ok: false, msg: "Não tem espaço para esse item nesta casa." };
}

export const MAX_RELIQUIAS_COMODO = 4;
const reliquiasNoComodo = (e: EstadoCasa, comodo: string) => e.objetos.filter((o) => o.comodo === comodo && ehReliquia(o.item));
/** Arruma a casa: fora da sala de troféus, cada cômodo fica com as relíquias mais recentes; as outras vão para o depósito. */
export function arrumarReliquias(e: EstadoCasa): Resultado {
  const ano = (id: string) => e.reliquias?.find((r) => r.id === id)?.ano ?? 0;
  let n = 0;
  for (const c of imovelAtual(e).comodos) {
    if (c.tipo === "trofeus") continue;
    const rs = reliquiasNoComodo(e, c.id).sort((a, b) => ano(b.item) - ano(a.item));
    for (const o of rs.slice(MAX_RELIQUIAS_COMODO)) {
      e.objetos.splice(e.objetos.indexOf(o), 1);
      e.deposito.push({ uid: o.uid, item: o.item, cor: o.cor });
      n++;
    }
  }
  return n ? { ok: true, msg: `${n} ${n === 1 ? "relíquia guardada" : "relíquias guardadas"} no depósito. Cada cômodo ficou com as ${MAX_RELIQUIAS_COMODO} mais recentes.` } : { ok: false, msg: "A casa já está arrumada." };
}
/** Uma relíquia nova vai direto para a casa: sala de troféus, sala, quarto... ou depósito, se não couber. */
export function ganharReliquia(e: EstadoCasa, r: Reliquia): Resultado {
  e.reliquias ??= [];
  if (e.reliquias.some((x) => x.id === r.id)) return { ok: false, msg: "Já conquistada." };
  e.reliquias.push(r); ITENS[r.id] = itemDaReliquia(r);
  const uid = novoUid(e), ordem: TipoComodo[] = ["trofeus", "sala", "escritorio", "jogos", "kitnet", "quarto"];
  const cs = [...imovelAtual(e).comodos].sort((a, b) => (ordem.indexOf(a.tipo) + 1 || 99) - (ordem.indexOf(b.tipo) + 1 || 99));
  for (const c of cs) {
    if (!TIPOS[ITENS[r.id].tipo].comodos.includes(c.tipo)) continue;
    // fora da sala de troféus, no máximo algumas relíquias por cômodo (o resto vai para o depósito, sem lotar a casa)
    if (c.tipo !== "trofeus" && reliquiasNoComodo(e, c.id).length >= MAX_RELIQUIAS_COMODO) continue;
    const lugar = acharLugar(e, r.id, c.id, uid);
    if (lugar) { e.objetos.push({ ...lugar, cor: 0 }); return { ok: true, msg: `${r.nome}, já ${noComodo(c.tipo)}.`, uid, comodo: c.id }; }
  }
  e.deposito.push({ uid, item: r.id, cor: 0 });
  return { ok: true, msg: `${r.nome}, guardada no depósito (falta espaço na casa).`, uid };
}

export const VALOR_REVENDA = 0.3;
export function vender(e: EstadoCasa, uid: string): Resultado {
  const i = e.objetos.findIndex((x) => x.uid === uid), j = e.deposito.findIndex((x) => x.uid === uid);
  const ref = i >= 0 ? e.objetos[i] : e.deposito[j];
  if (!ref || (i >= 0 && travado(e, e.objetos[i]))) return { ok: false, msg: "Esse é do imóvel e não é seu para vender." };
  if (ehReliquia(ref.item)) return { ok: false, msg: "Relíquia não se vende: é a sua história." };
  if (i >= 0 && instalacao(ref.item) && !ehDono(e)) return { ok: false, msg: "Instalação só sai em imóvel próprio." };
  if (i >= 0 && e.objetos[i].incluso) e.removidos.push(ref.uid);
  if (i >= 0) e.objetos.splice(i, 1); else e.deposito.splice(j, 1);
  const v = Math.round(ITENS[ref.item].preco * VALOR_REVENDA);
  e.saldo += v;
  return { ok: true, msg: `Vendido por ${dinheiro(v)}.` };
}

export const precoTrocaCor = (itemId: string) => Math.max(20, redondo(ITENS[itemId].preco * 0.1));
export function trocarCor(e: EstadoCasa, uid: string, cor: number): Resultado {
  const o = e.objetos.find((x) => x.uid === uid);
  if (!o || travado(e, o)) return { ok: false, msg: "Esse não dá para trocar a cor." };
  if (ehReliquia(o.item)) return { ok: false, msg: "Relíquia fica do jeito que foi conquistada." };
  if (o.cor === cor) return { ok: false, msg: "Já está dessa cor." };
  const p = precoTrocaCor(o.item);
  if (e.saldo < p) return { ok: false, msg: `Falta ${dinheiro(p - e.saldo)} para a reforma.` };
  e.saldo -= p; o.cor = cor;
  return { ok: true, msg: `Cor trocada por ${dinheiro(p)}.` };
}

// ------------------------------------------------------------------ reforma
export type RegraReforma = "nada" | "parede" | "tudo";
export function podeReformar(e: EstadoCasa): RegraReforma {
  const m = imovelAtual(e);
  if (m.categoria === "alojamento") return "nada";
  return e.proprios.includes(m.id) ? "tudo" : "parede";
}
export function precoAcabamento(c: Comodo, lugar: "parede" | "piso", revId: string): number {
  const r = REVEST[revId];
  const m2 = lugar === "piso" ? c.w * c.d * 0.25 : (c.w + c.d) * 0.5 * ((c.alturaParede ?? (c.ambiente === "externo" ? 1.6 : 5.6)) * 0.5);
  return redondo(Math.max(100, m2 * r.precoM2));
}
export function reformar(e: EstadoCasa, comodo: string, lugar: "parede" | "piso", revId: string, cor: number): Resultado {
  const c = comodoDe(e, comodo), r = REVEST[revId], regra = podeReformar(e);
  if (regra === "nada") return { ok: false, msg: "No alojamento não dá para reformar." };
  if (lugar === "piso" && regra !== "tudo") return { ok: false, msg: "Trocar o piso só em imóvel próprio." };
  if (!r || r.lugar !== lugar || !r.ambientes.includes(c.ambiente)) return { ok: false, msg: "Esse acabamento não serve aqui." };
  const atual = acabamento(e, comodo);
  if (atual[lugar].id === revId && atual[lugar].cor === cor) return { ok: false, msg: "Já está assim." };
  const p = precoAcabamento(c, lugar, revId);
  if (e.saldo < p) return { ok: false, msg: `Falta ${dinheiro(p - e.saldo)} para a reforma.` };
  e.saldo -= p;
  e.acabamentos[`${e.imovel}.${comodo}`] = { ...atual, [lugar]: { id: revId, cor } };
  return { ok: true, msg: `Reforma feita por ${dinheiro(p)}.` };
}

// ------------------------------------------------------------------ mudança e mês
/** Vagas da garagem: cada 45 unidades de área da garagem cabem um veículo (no mínimo um). Casa sem garagem não tem vaga. */
export const vagasGaragem = (e: EstadoCasa) => imovelAtual(e).comodos.filter((c) => c.tipo === "garagem").reduce((a, c) => a + Math.max(1, Math.round((c.w * c.d) / 45)), 0);
/** Carros e motos que ocupam vaga: os da loja de luxo e as motos da casa (no cômodo ou no depósito). */
export const veiculosDaCasa = (e: EstadoCasa) => (e.carros?.length ?? 0) + [...e.objetos.map((o) => o.item), ...e.deposito.map((d) => d.item)].filter((id) => ITENS[id]?.tipo === "moto").length;
/** Antes de comprar um carro: precisa de garagem com vaga livre. */
export function podeTerCarro(e: EstadoCasa): Resultado {
  const total = vagasGaragem(e), ocupadas = veiculosDaCasa(e);
  if (!total) return { ok: false, msg: "Sua casa não tem garagem. Carro precisa de vaga." };
  if (ocupadas >= total) return { ok: false, msg: `A garagem está cheia: ${ocupadas} de ${total} vagas. Venda um veículo antes.` };
  return { ok: true, msg: "" };
}
/** Valor de revenda de uma casa própria vendida (fração do preço de compra). */
export const VALOR_REVENDA_IMOVEL = 0.6;
export const rendaMinima = (m: Imovel) => m.aluguel * 3;
export function podeMudar(e: EstadoCasa, id: string, modo: "alugar" | "comprar", salario: number): Resultado {
  const m = IMOVEL[id];
  if (!m) return { ok: false, msg: "Imóvel não encontrado." };
  if (id === e.imovel) return { ok: false, msg: "Você já mora aqui." };
  if (m.categoria === "alojamento" && !alojamentosDoClube(e.clube).includes(id)) return { ok: false, msg: "Esse alojamento é de outro clube." };
  if (e.proprios.includes(id)) return { ok: true, msg: "É seu: volta sem pagar nada." };
  if (modo === "comprar") {
    if (!m.compra) return { ok: false, msg: "Não está à venda." };
    if (e.saldo < m.compra) return { ok: false, msg: `Falta ${dinheiro(m.compra - e.saldo)}.` };
    return { ok: true, msg: "" };
  }
  if (salario < rendaMinima(m)) return { ok: false, msg: `O dono pede renda de ${dinheiro(rendaMinima(m))} por mês.` };
  if (e.saldo < m.aluguel) return { ok: false, msg: `Precisa de ${dinheiro(m.aluguel)} para o depósito.` };
  return { ok: true, msg: "" };
}

/** Muda de imóvel. Tudo o que você comprou vai junto e é arrumado em cômodos do mesmo tipo; o que não couber vai para o depósito. */
export function mudar(e: EstadoCasa, id: string, modo: "alugar" | "comprar", salario: number, antiga?: "vender" | "alugar"): Resultado {
  const ok = podeMudar(e, id, modo, salario);
  if (!ok.ok) return ok;
  const m = IMOVEL[id];
  const saindoDeCasaPropria = id !== e.imovel && e.proprios.includes(e.imovel);
  if (saindoDeCasaPropria && !antiga) return { ok: false, msg: "Você é dono da casa atual: escolha vender ou alugar a casa antiga." };
  let avisoAntiga = "";
  if (saindoDeCasaPropria) {
    const velha = IMOVEL[e.imovel];
    if (antiga === "vender") {
      const v = Math.round((velha.compra ?? 0) * VALOR_REVENDA_IMOVEL);
      e.proprios = e.proprios.filter((x) => x !== velha.id); e.saldo += v;
      avisoAntiga = ` A casa antiga foi vendida por ${dinheiro(v)}.`;
    } else {
      e.alugadas = [...(e.alugadas ?? []), velha.id];
      avisoAntiga = ` A casa antiga está alugada: ${dinheiro(velha.aluguel)} por mês.`;
    }
  }
  e.alugadas = (e.alugadas ?? []).filter((x) => x !== id);
  if (!e.proprios.includes(id)) {
    if (modo === "comprar") { e.saldo -= m.compra!; e.proprios.push(id); } else e.saldo -= m.aluguel;
  }
  const antigo = imovelAtual(e);
  const tipoDe = (cid: string) => antigo.comodos.find((c) => c.id === cid)?.tipo;
  const levar = e.objetos.filter((o) => !o.incluso).map((o) => ({ uid: o.uid, item: o.item, cor: o.cor, tipo: tipoDe(o.comodo) }));
  const guardados = e.deposito.map((g) => ({ ...g, tipo: undefined as TipoComodo | undefined }));
  e.imovel = id; e.objetos = []; e.deposito = [];
  colocarInclusos(e);
  const area0 = (it: string) => TIPOS[ITENS[it].tipo].w * TIPOS[ITENS[it].tipo].d;
  for (const g of [...levar, ...guardados].sort((a, b) => area0(b.item) - area0(a.item) || ITENS[b.item].preco - ITENS[a.item].preco)) {
    const pref = m.comodos.find((c) => c.tipo === g.tipo || (g.tipo === "kitnet" && c.tipo === "quarto") || (g.tipo === "quarto" && c.tipo === "kitnet"))?.id;
    let posto = false;
    if (!motivoNaoCabe(e, g.item)) for (const cid of comodosPara(e, g.item, pref)) {
      const lugar = acharLugar(e, g.item, cid, g.uid);
      if (lugar) { e.objetos.push({ ...lugar, cor: g.cor }); posto = true; break; }
    }
    if (!posto) e.deposito.push({ uid: g.uid, item: g.item, cor: g.cor });
  }
  const vendidos = ajustarVeiculos(e);
  return { ok: true, msg: `Mudança feita: ${nomeImovel(e, m)}.${e.deposito.length ? ` ${e.deposito.length} ${e.deposito.length > 1 ? "itens foram" : "item foi"} para o depósito.` : ""}${avisoAntiga}${vendidos.map((v) => ` Sem vaga na garagem nova, ${v} foi vendido.`).join("")}` };
}
/** Garagem nova com menos vagas: os veículos que sobram são vendidos (os mais baratos primeiro). Devolve os nomes vendidos. */
function ajustarVeiculos(e: EstadoCasa): string[] {
  const vendidos: string[] = [];
  let sobra = veiculosDaCasa(e) - vagasGaragem(e);
  while (sobra > 0) {
    const carros = [...(e.carros ?? [])].sort((a, b) => a.valor - b.valor);
    if (carros.length) {
      const c = carros[0];
      e.carros = (e.carros ?? []).filter((x) => x.uid !== c.uid); e.saldo += c.valor;
      vendidos.push(LUXO[c.tipo].nome); sobra--; continue;
    }
    const lista = [...e.objetos.map((o) => ({ o, obj: true })), ...e.deposito.map((o) => ({ o, obj: false }))];
    const k = lista.find((x) => ITENS[x.o.item]?.tipo === "moto");
    if (!k) break;
    if (k.obj) e.objetos = e.objetos.filter((o) => o.uid !== k.o.uid); else e.deposito = e.deposito.filter((o) => o.uid !== k.o.uid);
    e.saldo += Math.round(ITENS[k.o.item].preco * VALOR_REVENDA);
    vendidos.push(ITENS[k.o.item].nome); sobra--;
  }
  return vendidos;
}

/** Custo de manter o que é seu: imóveis próprios (condomínio, IPTU, funcionários) e veículos (seguro, IPVA, revisão). */
export function manutencaoMensal(e: EstadoCasa): { nome: string; valor: number }[] {
  const imoveis = e.proprios.reduce((a, id) => a + (IMOVEL[id]?.compra ?? 0) * 0.0035, 0);
  const veiculos = [...e.objetos.map((o) => o.item), ...e.deposito.map((d) => d.item)].filter((id) => ["carro", "moto"].includes(ITENS[id]?.tipo)).reduce((a, id) => a + ITENS[id].preco * 0.012, 0) + (e.carros ?? []).reduce((a, c) => a + c.valor * 0.012, 0);
  return [{ nome: "Imóveis próprios (condomínio, IPTU, funcionários)", valor: Math.round(imoveis) }, { nome: "Veículos (seguro, IPVA, revisão)", valor: Math.round(veiculos) }];
}

export function fecharMes(e: EstadoCasa, salario: number): { aluguel: number; renda: number } {
  const aluguel = e.proprios.includes(e.imovel) ? 0 : imovelAtual(e).aluguel;
  const renda = (e.alugadas ?? []).reduce((a, id) => a + (IMOVEL[id]?.aluguel ?? 0), 0);
  e.saldo += salario - aluguel + renda;
  e.mes++;
  return { aluguel, renda };
}

// ------------------------------------------------------------------ efeitos, estilo e conforto
export interface BonusEstilo { comodo: string; estilo: Estilo; itens: number; moral: number }
/** Cômodo com 4 ou mais itens do mesmo estilo ganha moral; com 7 ou mais, ganha mais. */
export function bonusDeEstilo(e: EstadoCasa): BonusEstilo[] {
  const r: BonusEstilo[] = [];
  for (const c of imovelAtual(e).comodos) {
    const cont: Partial<Record<Estilo, number>> = {};
    for (const o of e.objetos) if (o.comodo === c.id && !o.incluso) { const s = ITENS[o.item].estilo; if (s !== "basico") cont[s] = (cont[s] ?? 0) + 1; }
    for (const [s, n] of Object.entries(cont) as [Estilo, number][]) if (n >= 4) r.push({ comodo: c.id, estilo: s, itens: n, moral: n >= 7 ? 2 : 1 });
  }
  return r;
}

export function efeitosDaCasa(e: EstadoCasa): { total: Efeitos; bruto: Efeitos } {
  const b = { ...EFEITOS_ZERO };
  for (const o of e.objetos) for (const [k, v] of Object.entries(ITENS[o.item].efeitos)) b[k as keyof Efeitos] += v as number;
  for (const x of bonusDeEstilo(e)) b.moral += x.moral;
  const total = { ...b };
  for (const k of Object.keys(TETO) as (keyof Efeitos)[]) total[k] = Math.min(TETO[k], b[k]);
  return { total, bruto: b };
}

/** 0 a 100: quanto a casa está montada e bem acabada, ponderado pelo tamanho de cada cômodo. */
export function conforto(e: EstadoCasa): number {
  let soma = 0, peso = 0;
  const bonus = bonusDeEstilo(e);
  for (const c of imovelAtual(e).comodos) {
    const a = c.w * c.d, alvo = Math.max(4, a / 9);
    const pts = e.objetos.filter((o) => o.comodo === c.id).reduce((s, o) => s + (ITENS[o.item].tipo === "beliche" ? 0.5 : ITENS[o.item].nivel), 0);
    const acab = acabamento(e, c.id), q = (REVEST[acab.parede.id].qualidade + REVEST[acab.piso.id].qualidade) / 10;
    const est = bonus.some((b) => b.comodo === c.id) ? 1 : 0;
    const nota = 0.65 * Math.min(1, pts / alvo) + 0.25 * q + 0.1 * est;
    soma += nota * a; peso += a;
  }
  return Math.round((100 * soma) / peso);
}

export function patrimonio(e: EstadoCasa): number {
  const moveis = [...e.objetos.filter((o) => !o.incluso), ...e.deposito].reduce((s, o) => s + ITENS[o.item].preco * VALOR_REVENDA, 0);
  const imoveis = e.proprios.reduce((s, id) => s + (IMOVEL[id].compra ?? 0), 0);
  return Math.round(e.saldo + moveis + imoveis);
}

export function dinheiro(v: number): string {
  const a = Math.abs(v), sinal = v < 0 ? "−" : "";
  if (a >= 1e6) return `${sinal}R$ ${(a / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: a >= 1e7 ? 1 : 2 })} mi`;
  if (a >= 1e4) return `${sinal}R$ ${Math.round(a / 1e3).toLocaleString("pt-BR")} mil`;
  return `${sinal}R$ ${Math.round(a).toLocaleString("pt-BR")}`;
}
