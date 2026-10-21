// A casa do jogador: moradias, cômodos com lugares fixos, catálogo de móveis e carros.
// Cada móvel ocupa um lugar (slot) de um tipo; comprar troca o que está lá e guarda o antigo.
// Os efeitos somados da casa entram na semana: menos cansaço, mais moral, menos lesão, mais evolução, fama.

export interface Efeitos {
  recuperacao: number; // pontos de cansaço a menos por semana
  moral: number; // pontos de moral alvo
  lesao: number; // % a menos de risco de lesão
  evolucao: number; // % a mais de evolução
  fama: number; // fama passiva
}
export const EFEITOS_ZERO: Efeitos = { recuperacao: 0, moral: 0, lesao: 0, evolucao: 0, fama: 0 };
export const NOMES_EFEITO: Record<keyof Efeitos, string> = { recuperacao: "Recuperação", moral: "Moral", lesao: "Proteção contra lesão", evolucao: "Evolução", fama: "Fama" };

export type TipoMovel =
  | "beliche" | "cama" | "armario" | "tv" | "videogame" | "sofa" | "mesa" | "tapete" | "quadro" | "planta" | "luminaria"
  | "geladeira" | "fogao" | "mesaJantar" | "som" | "esteira" | "pesos" | "espreguicadeira" | "piscina" | "churrasqueira"
  | "estante" | "trofeus" | "carro";

/** Espaço que cada tipo ocupa no chão, em ladrilhos de meio metro (largura em x, fundo em y). Quadros ficam na parede. */
export const FORMATO: Record<TipoMovel, { w: number; d: number; parede?: boolean; plano?: boolean }> = {
  beliche: { w: 2, d: 4 }, cama: { w: 4, d: 5 }, armario: { w: 3, d: 1 }, tv: { w: 3, d: 1 }, videogame: { w: 2, d: 2 },
  sofa: { w: 4, d: 2 }, mesa: { w: 3, d: 2 }, tapete: { w: 4, d: 3, plano: true }, quadro: { w: 2, d: 0, parede: true },
  planta: { w: 1, d: 1 }, luminaria: { w: 1, d: 1 }, geladeira: { w: 2, d: 2 }, fogao: { w: 2, d: 2 }, mesaJantar: { w: 4, d: 3 },
  som: { w: 2, d: 1 }, esteira: { w: 2, d: 4 }, pesos: { w: 3, d: 2 }, espreguicadeira: { w: 2, d: 4 }, piscina: { w: 6, d: 5, plano: true },
  churrasqueira: { w: 2, d: 2 }, estante: { w: 3, d: 1 }, trofeus: { w: 4, d: 1 }, carro: { w: 4, d: 7 },
};

export interface Item { id: string; tipo: TipoMovel; nivel: number; nome: string; preco: number; efeitos: Partial<Efeitos>; cor: string }

const item = (tipo: TipoMovel, nivel: number, nome: string, preco: number, efeitos: Partial<Efeitos>, cor: string): Item =>
  ({ id: `${tipo}-${nivel}`, tipo, nivel, nome, preco, efeitos, cor });

export const CATALOGO: Item[] = [
  item("beliche", 1, "Beliche do alojamento", 0, {}, "#8A6A48"),
  item("cama", 1, "Cama de solteiro", 900, { recuperacao: 2 }, "#3E6FA8"),
  item("cama", 2, "Cama de casal ortopédica", 6000, { recuperacao: 4, moral: 1 }, "#5B7C99"),
  item("cama", 3, "Cama king com colchão de molas", 35000, { recuperacao: 6, moral: 2 }, "#E9E2D3"),
  item("armario", 1, "Arara de roupas", 300, { moral: 1 }, "#9AA3A8"),
  item("armario", 2, "Guarda-roupa de três portas", 3500, { moral: 1 }, "#B58A5C"),
  item("armario", 3, "Closet planejado", 40000, { moral: 2, fama: 1 }, "#5A3C2A"),
  item("tv", 1, "TV de 32 polegadas", 1200, { moral: 1 }, "#2A2A2A"),
  item("tv", 2, "Smart TV de 55 polegadas", 4500, { moral: 2 }, "#1C1C1C"),
  item("tv", 3, "Telão de 85 com home theater", 30000, { moral: 3 }, "#111111"),
  item("videogame", 1, "Videogame usado e um pufe", 1500, { moral: 2, recuperacao: -1 }, "#7B4FA0"),
  item("videogame", 2, "Console novo e cadeira gamer", 6000, { moral: 3, recuperacao: -1 }, "#C0392B"),
  item("videogame", 3, "Setup gamer para lives", 25000, { moral: 4, recuperacao: -2, fama: 1 }, "#1ABC9C"),
  item("sofa", 1, "Sofá de dois lugares", 1500, { moral: 1 }, "#8E7F6A"),
  item("sofa", 2, "Sofá retrátil", 7000, { moral: 2, recuperacao: 1 }, "#4F6273"),
  item("sofa", 3, "Sofá de couro em L", 45000, { moral: 3, recuperacao: 1 }, "#6B3A22"),
  item("mesa", 1, "Escrivaninha simples", 400, { moral: 1 }, "#C9A27A"),
  item("mesa", 2, "Mesa com notebook para ver jogos", 5000, { evolucao: 1 }, "#7D5A3C"),
  item("mesa", 3, "Central de análise de vídeo", 30000, { evolucao: 3 }, "#2F3B45"),
  item("tapete", 1, "Tapete de algodão", 300, { moral: 1 }, "#B5524A"),
  item("tapete", 2, "Tapete felpudo", 2500, { moral: 1 }, "#D8CDB8"),
  item("tapete", 3, "Tapete persa", 18000, { moral: 2 }, "#7A2A34"),
  item("quadro", 1, "Pôster do clube do coração", 50, { moral: 1 }, "#2E7D4F"),
  item("quadro", 2, "Quadro emoldurado", 1200, { moral: 1 }, "#E3B341"),
  item("quadro", 3, "Obra de arte original", 60000, { moral: 2, fama: 1 }, "#3A7CA5"),
  item("planta", 1, "Vaso de suculenta", 80, { moral: 1 }, "#5E9C4E"),
  item("planta", 2, "Costela-de-adão", 800, { moral: 1 }, "#3F8A4A"),
  item("planta", 3, "Oliveira em vaso de cerâmica", 6000, { moral: 2 }, "#6F8E4E"),
  item("luminaria", 1, "Abajur", 150, { recuperacao: 1 }, "#F2D27A"),
  item("luminaria", 2, "Luminária de piso", 1500, { recuperacao: 1, moral: 1 }, "#E8C468"),
  item("luminaria", 3, "Luminária de design", 12000, { recuperacao: 1, moral: 2 }, "#D9A441"),
  item("geladeira", 1, "Frigobar", 900, { lesao: 1 }, "#E8E8E8"),
  item("geladeira", 2, "Geladeira cheia de comida saudável", 5000, { lesao: 3 }, "#D0D4D6"),
  item("geladeira", 3, "Geladeira inox de quatro portas", 25000, { lesao: 4, moral: 1 }, "#A9B2B8"),
  item("fogao", 1, "Fogão de duas bocas", 400, { lesao: 1 }, "#EDEDED"),
  item("fogao", 2, "Cooktop com forno embutido", 6000, { lesao: 2 }, "#3B3B3B"),
  item("fogao", 3, "Ilha gourmet", 60000, { lesao: 3, moral: 2 }, "#E6E1D6"),
  item("mesaJantar", 1, "Mesa de quatro lugares", 800, { moral: 1 }, "#C49A6C"),
  item("mesaJantar", 2, "Mesa de madeira para seis", 6000, { moral: 2 }, "#8A5A35"),
  item("mesaJantar", 3, "Mesa de mármore para dez", 50000, { moral: 3, fama: 1 }, "#EDEAE4"),
  item("som", 1, "Caixinha de som", 200, { moral: 1 }, "#2D3436"),
  item("som", 2, "Soundbar", 3000, { moral: 2 }, "#1E272E"),
  item("som", 3, "Som ambiente de estúdio", 28000, { moral: 3 }, "#3D3D3D"),
  item("esteira", 1, "Bicicleta ergométrica", 2000, { evolucao: 1 }, "#4A4A4A"),
  item("esteira", 2, "Esteira profissional", 15000, { evolucao: 2 }, "#2C3E50"),
  item("esteira", 3, "Esteira antigravidade", 120000, { evolucao: 3, lesao: 2 }, "#ECF0F1"),
  item("pesos", 1, "Halteres e banco", 1000, { evolucao: 1 }, "#555555"),
  item("pesos", 2, "Estação de musculação", 18000, { evolucao: 2 }, "#34495E"),
  item("pesos", 3, "Academia de clube em casa", 90000, { evolucao: 3, recuperacao: 1 }, "#B03A2E"),
  item("espreguicadeira", 1, "Cadeira de praia", 600, { moral: 1 }, "#E67E22"),
  item("espreguicadeira", 2, "Espreguiçadeira de madeira", 4000, { moral: 1, recuperacao: 1 }, "#A0522D"),
  item("espreguicadeira", 3, "Daybed com cobertura", 20000, { moral: 2, recuperacao: 1 }, "#F4F1EA"),
  item("piscina", 1, "Piscina de fibra", 40000, { recuperacao: 2, moral: 1 }, "#4FB3D9"),
  item("piscina", 2, "Piscina aquecida", 150000, { recuperacao: 3, moral: 2 }, "#2E9CCA"),
  item("piscina", 3, "Piscina com hidro e banheira de gelo", 450000, { recuperacao: 5, lesao: 3, moral: 2 }, "#1F8FBF"),
  item("churrasqueira", 1, "Churrasqueira portátil", 300, { moral: 1 }, "#444444"),
  item("churrasqueira", 2, "Churrasqueira de alvenaria", 8000, { moral: 2 }, "#B5651D"),
  item("churrasqueira", 3, "Espaço gourmet", 70000, { moral: 3, fama: 1 }, "#7F8C8D"),
  item("estante", 1, "Estante de livros", 500, { moral: 1 }, "#B08B5E"),
  item("estante", 2, "Estante com camisas trocadas", 5000, { moral: 1, fama: 1 }, "#6E4B2E"),
  item("estante", 3, "Painel com bolas de hat-trick", 30000, { moral: 2, fama: 1 }, "#2C2C2C"),
  item("trofeus", 1, "Prateleira de troféus", 2000, { moral: 1 }, "#9C7A4C"),
  item("trofeus", 2, "Vitrine iluminada", 25000, { moral: 2, fama: 1 }, "#5D4037"),
  item("trofeus", 3, "Galeria de troféus", 200000, { moral: 3, fama: 3 }, "#1B1B1B"),
  item("carro", 1, "Hatch popular", 90000, { moral: 1 }, "#C0392B"),
  item("carro", 2, "Sedã executivo", 280000, { moral: 1, fama: 1 }, "#2C3E50"),
  item("carro", 3, "SUV premium", 600000, { moral: 1, fama: 2 }, "#ECECEC"),
  item("carro", 4, "Superesportivo", 3000000, { moral: 2, fama: 6 }, "#F1C40F"),
];
export const ITENS: Record<string, Item> = Object.fromEntries(CATALOGO.map((i) => [i.id, i]));
export const opcoesDoTipo = (t: TipoMovel) => CATALOGO.filter((i) => i.tipo === t && i.preco > 0);

export interface Slot { id: string; tipo: TipoMovel; x: number; y: number; rot?: boolean; fixo?: string; parede?: "esq" | "dir" }
export type Ambiente = "interno" | "externo" | "garagem";
export interface Comodo { id: string; nome: string; w: number; d: number; ambiente: Ambiente; slots: Slot[]; janela?: { parede: "esq" | "dir"; pos: number; largura: number } }
export interface Moradia {
  id: string; nome: string; fase: string; descricao: string;
  aluguel: number; compra?: number; acabamento: number; // 1 a 5: piso, paredes e vista
  vista: "ct" | "rua" | "cidade" | "condominio" | "mar";
  comodos: Comodo[];
}

const s = (id: string, tipo: TipoMovel, x: number, y: number, extra: Partial<Slot> = {}): Slot => ({ id, tipo, x, y, ...extra });

export const MORADIAS: Moradia[] = [
  {
    id: "alojamento", nome: "Alojamento do clube", fase: "Base", acabamento: 1, vista: "ct", aluguel: 0,
    descricao: "Quarto dividido no CT. Beliche, armário de metal e um colega de quarto que ronca.",
    comodos: [{ id: "quarto", nome: "Quarto", w: 9, d: 8, ambiente: "interno", janela: { parede: "dir", pos: 4.5, largura: 2.4 }, slots: [
      s("beliche", "beliche", 0, 0, { fixo: "beliche-1" }),
      s("armario", "armario", 3, 0, { fixo: "armario-1" }),
      s("mesa", "mesa", 6, 0),
      s("luminaria", "luminaria", 8, 2),
      s("planta", "planta", 8, 4),
      s("tv", "tv", 0, 5, { rot: true }),
      s("videogame", "videogame", 2, 6),
      s("tapete", "tapete", 3, 3),
      s("quadro", "quadro", 0, 0, { parede: "esq", x: 5.5 }),
    ] }],
  },
  {
    id: "kitnet", nome: "Kitnet alugada", fase: "Primeiro contrato", acabamento: 2, vista: "rua", aluguel: 1500,
    descricao: "Um cômodo só, mas é seu. Cama, cozinha no canto e a TV a dois passos.",
    comodos: [{ id: "kitnet", nome: "Kitnet", w: 11, d: 9, ambiente: "interno", janela: { parede: "esq", pos: 3, largura: 2.4 }, slots: [
      s("cama", "cama", 0, 0),
      s("mesa", "mesa", 4, 0),
      s("geladeira", "geladeira", 7, 0),
      s("fogao", "fogao", 9, 0),
      s("luminaria", "luminaria", 4, 2),
      s("planta", "planta", 10, 3),
      s("tv", "tv", 0, 6, { rot: true }),
      s("videogame", "videogame", 3, 6),
      s("tapete", "tapete", 5, 4),
      s("quadro", "quadro", 0, 0, { parede: "dir", x: 5.5 }),
    ] }],
  },
  {
    id: "apartamento", nome: "Apartamento", fase: "Titular", acabamento: 3, vista: "cidade", aluguel: 8000, compra: 900000,
    descricao: "Sala, quarto, cozinha, varanda e uma vaga na garagem do prédio.",
    comodos: [
      { id: "quarto", nome: "Quarto", w: 10, d: 8, ambiente: "interno", janela: { parede: "esq", pos: 6.5, largura: 2.4 }, slots: [
        s("cama", "cama", 0, 0), s("luminaria", "luminaria", 4, 0), s("armario", "armario", 5, 0), s("planta", "planta", 9, 0),
        s("mesa", "mesa", 8, 2, { rot: true }), s("tv", "tv", 9, 5, { rot: true }), s("tapete", "tapete", 4, 4), s("quadro", "quadro", 0, 0, { parede: "dir", x: 2 }),
      ] },
      { id: "sala", nome: "Sala", w: 11, d: 9, ambiente: "interno", janela: { parede: "esq", pos: 6, largura: 3 }, slots: [
        s("planta", "planta", 0, 0), s("som", "som", 1, 0), s("tv", "tv", 4, 0), s("luminaria", "luminaria", 10, 0),
        s("tapete", "tapete", 4, 2), s("videogame", "videogame", 8, 2), s("sofa", "sofa", 4, 6), s("mesaJantar", "mesaJantar", 0, 4, { rot: true }),
        s("quadro", "quadro", 0, 0, { parede: "dir", x: 8.5 }),
      ] },
      { id: "cozinha", nome: "Cozinha", w: 8, d: 7, ambiente: "interno", janela: { parede: "dir", pos: 6, largura: 2 }, slots: [
        s("geladeira", "geladeira", 0, 0), s("fogao", "fogao", 2, 0), s("planta", "planta", 7, 0), s("mesaJantar", "mesaJantar", 3, 3),
        s("quadro", "quadro", 0, 0, { parede: "esq", x: 4 }),
      ] },
      { id: "varanda", nome: "Varanda", w: 8, d: 5, ambiente: "externo", slots: [
        s("planta", "planta", 0, 0), s("espreguicadeira", "espreguicadeira", 1, 0, { rot: true }), s("churrasqueira", "churrasqueira", 6, 0),
      ] },
      { id: "garagem", nome: "Garagem", w: 6, d: 9, ambiente: "garagem", slots: [s("vaga1", "carro", 1, 1)] },
    ],
  },
  {
    id: "casa", nome: "Casa em condomínio", fase: "Estrela", acabamento: 4, vista: "condominio", aluguel: 22000, compra: 2500000,
    descricao: "Quintal com piscina, academia em casa e garagem para dois carros. A família pode vir morar junto.",
    comodos: [
      { id: "quarto", nome: "Suíte", w: 11, d: 9, ambiente: "interno", janela: { parede: "esq", pos: 6.5, largura: 3 }, slots: [
        s("cama", "cama", 0, 0), s("luminaria", "luminaria", 4, 0), s("armario", "armario", 5, 0), s("planta", "planta", 10, 0),
        s("mesa", "mesa", 9, 2, { rot: true }), s("tv", "tv", 10, 6, { rot: true }), s("tapete", "tapete", 4, 4), s("quadro", "quadro", 0, 0, { parede: "dir", x: 2 }),
      ] },
      { id: "sala", nome: "Sala", w: 12, d: 10, ambiente: "interno", janela: { parede: "esq", pos: 6.5, largura: 4 }, slots: [
        s("planta", "planta", 0, 0), s("som", "som", 1, 0), s("tv", "tv", 5, 0), s("luminaria", "luminaria", 11, 0),
        s("tapete", "tapete", 5, 2), s("videogame", "videogame", 9, 2), s("sofa", "sofa", 5, 6), s("mesaJantar", "mesaJantar", 0, 5, { rot: true }),
        s("estante", "estante", 0, 1, { rot: true }), s("quadro", "quadro", 0, 0, { parede: "dir", x: 9.5 }),
      ] },
      { id: "cozinha", nome: "Cozinha", w: 9, d: 8, ambiente: "interno", janela: { parede: "dir", pos: 6.5, largura: 2.4 }, slots: [
        s("geladeira", "geladeira", 0, 0), s("fogao", "fogao", 2, 0), s("planta", "planta", 8, 0), s("mesaJantar", "mesaJantar", 4, 4),
        s("quadro", "quadro", 0, 0, { parede: "esq", x: 4.5 }),
      ] },
      { id: "academia", nome: "Academia", w: 9, d: 8, ambiente: "interno", janela: { parede: "esq", pos: 5.5, largura: 3 }, slots: [
        s("esteira", "esteira", 0, 0), s("pesos", "pesos", 4, 0), s("som", "som", 8, 0, { rot: true }), s("planta", "planta", 8, 3), s("tapete", "tapete", 4, 4),
      ] },
      { id: "externa", nome: "Quintal", w: 12, d: 10, ambiente: "externo", slots: [
        s("planta", "planta", 0, 0), s("churrasqueira", "churrasqueira", 10, 0), s("espreguicadeira", "espreguicadeira", 0, 3),
        s("piscina", "piscina", 3, 3), s("espreguicadeira2", "espreguicadeira", 10, 3),
      ] },
      { id: "garagem", nome: "Garagem", w: 11, d: 9, ambiente: "garagem", slots: [s("vaga1", "carro", 1, 1), s("vaga2", "carro", 6, 1)] },
    ],
  },
  {
    id: "mansao", nome: "Mansão", fase: "Lenda", acabamento: 5, vista: "mar", aluguel: 90000, compra: 15000000,
    descricao: "Vista para o mar, sala de troféus, piscina com hidro e garagem para a coleção.",
    comodos: [
      { id: "quarto", nome: "Suíte master", w: 12, d: 10, ambiente: "interno", janela: { parede: "esq", pos: 6.5, largura: 4 }, slots: [
        s("cama", "cama", 1, 0), s("luminaria", "luminaria", 0, 0), s("luminaria2", "luminaria", 5, 0), s("armario", "armario", 7, 0), s("planta", "planta", 11, 0),
        s("mesa", "mesa", 10, 2, { rot: true }), s("tv", "tv", 11, 6, { rot: true }), s("tapete", "tapete", 5, 5), s("quadro", "quadro", 0, 0, { parede: "dir", x: 3 }),
      ] },
      { id: "sala", nome: "Sala", w: 13, d: 11, ambiente: "interno", janela: { parede: "esq", pos: 7, largura: 5 }, slots: [
        s("planta", "planta", 0, 0), s("som", "som", 2, 0), s("tv", "tv", 5, 0), s("som2", "som", 9, 0), s("luminaria", "luminaria", 12, 0),
        s("tapete", "tapete", 5, 3), s("videogame", "videogame", 10, 3), s("sofa", "sofa", 5, 7), s("mesaJantar", "mesaJantar", 0, 6, { rot: true }),
        s("estante", "estante", 0, 1, { rot: true }), s("quadro", "quadro", 0, 0, { parede: "dir", x: 11 }),
      ] },
      { id: "cozinha", nome: "Cozinha gourmet", w: 10, d: 8, ambiente: "interno", janela: { parede: "dir", pos: 7.5, largura: 3 }, slots: [
        s("geladeira", "geladeira", 0, 0), s("fogao", "fogao", 3, 2), s("planta", "planta", 9, 0), s("mesaJantar", "mesaJantar", 5, 4),
        s("quadro", "quadro", 0, 0, { parede: "esq", x: 4.5 }),
      ] },
      { id: "trofeus", nome: "Sala de troféus", w: 10, d: 8, ambiente: "interno", slots: [
        s("trofeus", "trofeus", 1, 0), s("trofeus2", "trofeus", 6, 0), s("estante", "estante", 0, 2, { rot: true }), s("tapete", "tapete", 4, 3),
        s("planta", "planta", 9, 3), s("quadro", "quadro", 0, 0, { parede: "esq", x: 6.5 }),
      ] },
      { id: "academia", nome: "Academia", w: 10, d: 8, ambiente: "interno", janela: { parede: "esq", pos: 5.5, largura: 4 }, slots: [
        s("esteira", "esteira", 0, 0), s("esteira2", "esteira", 2, 0), s("pesos", "pesos", 5, 0), s("som", "som", 9, 0, { rot: true }), s("tapete", "tapete", 5, 4),
      ] },
      { id: "externa", nome: "Área da piscina", w: 14, d: 11, ambiente: "externo", slots: [
        s("planta", "planta", 0, 0), s("churrasqueira", "churrasqueira", 12, 0), s("espreguicadeira", "espreguicadeira", 0, 3), s("espreguicadeira3", "espreguicadeira", 2, 3),
        s("piscina", "piscina", 5, 3), s("espreguicadeira2", "espreguicadeira", 12, 3), s("planta2", "planta", 13, 10),
      ] },
      { id: "garagem", nome: "Garagem", w: 21, d: 9, ambiente: "garagem", slots: [s("vaga1", "carro", 1, 1), s("vaga2", "carro", 6, 1), s("vaga3", "carro", 11, 1), s("vaga4", "carro", 16, 1)] },
    ],
  },
];
export const MORADIA: Record<string, Moradia> = Object.fromEntries(MORADIAS.map((m) => [m.id, m]));

/** Retângulo ocupado por um lugar no chão (com a rotação aplicada). */
export function areaDoSlot(sl: Slot): { x: number; y: number; w: number; d: number } {
  const f = FORMATO[sl.tipo];
  return sl.rot ? { x: sl.x, y: sl.y, w: f.d, d: f.w } : { x: sl.x, y: sl.y, w: f.w, d: f.d };
}

// ------------------------------------------------------------------ estado
export interface EstadoCasa {
  saldo: number;
  moradia: string;
  propria: string[]; // moradias compradas
  instalados: Record<string, string>; // "comodo.slot" -> id do item
  guardados: string[]; // itens comprados fora de lugar
  mes: number;
}

export const chave = (comodo: string, slot: string) => `${comodo}.${slot}`;

export function novoEstado(saldo = 3000): EstadoCasa {
  const e: EstadoCasa = { saldo, moradia: "alojamento", propria: [], instalados: {}, guardados: [], mes: 0 };
  colocarFixos(e);
  return e;
}

function colocarFixos(e: EstadoCasa) {
  for (const c of MORADIA[e.moradia].comodos) for (const sl of c.slots) if (sl.fixo) e.instalados[chave(c.id, sl.id)] = sl.fixo;
}
const ehFixo = (id: string) => ITENS[id]?.preco === 0;

export function itemNoSlot(e: EstadoCasa, comodo: string, slot: string): Item | undefined {
  const id = e.instalados[chave(comodo, slot)];
  return id ? ITENS[id] : undefined;
}

export type Resultado = { ok: true; msg: string } | { ok: false; msg: string };

/** Compra um item para um lugar. O que estava lá vai para os guardados. */
export function comprar(e: EstadoCasa, comodo: string, slot: string, itemId: string): Resultado {
  const m = MORADIA[e.moradia], c = m.comodos.find((x) => x.id === comodo), sl = c?.slots.find((x) => x.id === slot), it = ITENS[itemId];
  if (!c || !sl || !it) return { ok: false, msg: "Esse lugar não existe nesta casa." };
  if (sl.fixo) return { ok: false, msg: "Esse móvel é do clube e não pode ser trocado." };
  if (it.tipo !== sl.tipo) return { ok: false, msg: "Esse item não cabe nesse lugar." };
  if (e.instalados[chave(comodo, slot)] === itemId) return { ok: false, msg: "Você já tem esse item aí." };
  if (e.saldo < it.preco) return { ok: false, msg: `Falta ${dinheiro(it.preco - e.saldo)} para comprar.` };
  e.saldo -= it.preco;
  const antigo = e.instalados[chave(comodo, slot)];
  if (antigo && !ehFixo(antigo)) e.guardados.push(antigo);
  e.instalados[chave(comodo, slot)] = itemId;
  return { ok: true, msg: `Comprou: ${it.nome}.` };
}

/** Coloca um item guardado num lugar vazio ou troca pelo que está lá. */
export function instalarGuardado(e: EstadoCasa, comodo: string, slot: string, itemId: string): Resultado {
  const i = e.guardados.indexOf(itemId);
  const c = MORADIA[e.moradia].comodos.find((x) => x.id === comodo), sl = c?.slots.find((x) => x.id === slot);
  if (i < 0 || !sl || sl.fixo || ITENS[itemId].tipo !== sl.tipo) return { ok: false, msg: "Não dá para colocar esse item aí." };
  e.guardados.splice(i, 1);
  const antigo = e.instalados[chave(comodo, slot)];
  if (antigo && !ehFixo(antigo)) e.guardados.push(antigo);
  e.instalados[chave(comodo, slot)] = itemId;
  return { ok: true, msg: `De volta ao lugar: ${ITENS[itemId].nome}.` };
}

export const VALOR_REVENDA = 0.3;
export function vender(e: EstadoCasa, itemId: string): Resultado {
  const i = e.guardados.indexOf(itemId);
  if (i < 0) return { ok: false, msg: "Item não encontrado." };
  e.guardados.splice(i, 1);
  const v = Math.round(ITENS[itemId].preco * VALOR_REVENDA);
  e.saldo += v;
  return { ok: true, msg: `Vendido por ${dinheiro(v)}.` };
}

/** Muda de casa (alugando ou comprando). Os móveis vão junto para lugares do mesmo tipo; o resto fica guardado. */
export function mudar(e: EstadoCasa, destino: string, modo: "alugar" | "comprar"): Resultado {
  const m = MORADIA[destino];
  if (!m || destino === e.moradia) return { ok: false, msg: "Você já mora aqui." };
  const jaTem = e.propria.includes(destino);
  if (modo === "comprar" && !jaTem) {
    if (!m.compra) return { ok: false, msg: "Esse lugar não está à venda." };
    if (e.saldo < m.compra) return { ok: false, msg: `Falta ${dinheiro(m.compra - e.saldo)} para comprar.` };
    e.saldo -= m.compra;
    e.propria.push(destino);
  } else if (!jaTem && e.saldo < m.aluguel * 2) {
    return { ok: false, msg: `Precisa de ${dinheiro(m.aluguel * 2)} para o depósito e o primeiro aluguel.` };
  } else if (!jaTem) {
    e.saldo -= m.aluguel; // depósito; o aluguel do mês entra no fechamento
  }
  const moveis = Object.values(e.instalados).filter((id) => !ehFixo(id));
  const comodosAntigos = Object.keys(e.instalados).reduce<Record<string, string>>((acc, k) => (acc[e.instalados[k]] ??= k.split(".")[0], acc), {});
  e.moradia = destino;
  e.instalados = {};
  colocarFixos(e);
  const sobra: string[] = [];
  // os melhores itens escolhem primeiro; tenta o mesmo cômodo, depois qualquer lugar do tipo
  for (const id of [...moveis, ...e.guardados].sort((a, b) => ITENS[b].preco - ITENS[a].preco)) {
    const tipo = ITENS[id].tipo, origem = comodosAntigos[id];
    const livres = m.comodos.flatMap((c) => c.slots.filter((sl) => sl.tipo === tipo && !sl.fixo && !e.instalados[chave(c.id, sl.id)]).map((sl) => ({ c, sl })));
    const alvo = livres.find((l) => l.c.id === origem) ?? livres[0];
    if (alvo) e.instalados[chave(alvo.c.id, alvo.sl.id)] = id; else sobra.push(id);
  }
  e.guardados = sobra;
  return { ok: true, msg: `Mudança feita: ${m.nome}.` };
}

/** Fecha o mês: entra o salário, sai o aluguel (se a casa não for sua). */
export function fecharMes(e: EstadoCasa, salario: number): { aluguel: number } {
  const aluguel = e.propria.includes(e.moradia) ? 0 : MORADIA[e.moradia].aluguel;
  e.saldo += salario - aluguel;
  e.mes++;
  return { aluguel };
}

export function efeitosDaCasa(e: EstadoCasa): Efeitos {
  const t = { ...EFEITOS_ZERO };
  for (const id of Object.values(e.instalados)) for (const [k, v] of Object.entries(ITENS[id].efeitos)) t[k as keyof Efeitos] += v as number;
  return t;
}

/** Nota de 0 a 100 que resume a casa: quanto do melhor possível nesta moradia já está montado. */
export function conforto(e: EstadoCasa): number {
  const m = MORADIA[e.moradia];
  let tem = 0, max = 0;
  for (const c of m.comodos) for (const sl of c.slots) {
    const melhor = Math.max(...CATALOGO.filter((i) => i.tipo === sl.tipo).map((i) => i.nivel));
    max += melhor;
    const it = itemNoSlot(e, c.id, sl.id);
    tem += it ? (it.preco === 0 ? 0.5 : it.nivel) : 0;
  }
  return Math.round((100 * tem) / max);
}

export function patrimonio(e: EstadoCasa): number {
  const moveis = [...Object.values(e.instalados), ...e.guardados].reduce((s, id) => s + ITENS[id].preco * VALOR_REVENDA, 0);
  const imoveis = e.propria.reduce((s, id) => s + (MORADIA[id].compra ?? 0), 0);
  return Math.round(e.saldo + moveis + imoveis);
}

export function dinheiro(v: number): string {
  const a = Math.abs(v), sinal = v < 0 ? "−" : "";
  if (a >= 1e6) return `${sinal}R$ ${(a / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: a >= 1e7 ? 1 : 2 })} mi`;
  if (a >= 1e4) return `${sinal}R$ ${Math.round(a / 1e3).toLocaleString("pt-BR")} mil`;
  return `${sinal}R$ ${Math.round(a).toLocaleString("pt-BR")}`;
}
