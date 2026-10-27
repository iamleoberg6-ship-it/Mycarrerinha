// Patrocinadores: marcas-paródia (nome e cores lembram a real; logo e slogan são nossos) e os contratos que oferecem.
// Uma marca por categoria (exclusividade), até quatro patrocinadores ao mesmo tempo.
import { RNG } from "./rng.js";

export type Categoria = "banco" | "refrigerante" | "cerveja" | "energetico" | "carro" | "celular" | "material" | "comida" | "oculos" | "relogio" | "fone";
/** O que a marca de acessório põe no jogador (aparece no visual enquanto o contrato durar). */
export type AcessorioMarca =
  | { tipo: "oculos"; modelo: "aviador" | "esportivo" | "quadrado"; armacao: string; lente: string }
  | { tipo: "relogio"; pulseira: string; mostrador: string }
  | { tipo: "fone"; cor: string; detalhe: string };
export type Simbolo = "onda" | "circulo" | "pera" | "coroa" | "guardaChuva" | "chama" | "raio" | "folha" | "gota" | "estrela" | "oval" | "escudo" | "pontos" | "batata" | "asa" | "balanca" | "quadrado" | "chifre" | "garra" | "engrenagem" | "letra";
export interface Marca {
  id: string; nome: string; categoria: Categoria; cores: [string, string, string]; simbolo: Simbolo; slogan: string;
  /** força da marca: quanto paga em relação às outras (0,5 a 2) */
  peso: number; famaMin: number;
  /** estilo da letra do logo */
  letra: "redonda" | "pesada" | "fina" | "italica";
  /** marcas de acessório só procuram quem já é muito seguido */
  seguidoresMin?: number; acessorio?: AcessorioMarca;
}

export const NOME_CATEGORIA: Record<Categoria, string> = {
  banco: "Banco", refrigerante: "Refrigerante", cerveja: "Cerveja", energetico: "Energético", carro: "Carro", celular: "Celular", material: "Material esportivo", comida: "Lanchonete", oculos: "Óculos", relogio: "Relógio", fone: "Fone de ouvido",
};

export const MARCAS: Marca[] = [
  // bancos
  { id: "nobanco", nome: "Nobanco", categoria: "banco", cores: ["#820AD1", "#FFFFFF", "#C79BF2"], simbolo: "onda", slogan: "Sem tarifa, sem marcação.", peso: 1.2, famaMin: 25, letra: "redonda" },
  { id: "itao", nome: "Itaó", categoria: "banco", cores: ["#EC7000", "#003399", "#FFFFFF"], simbolo: "quadrado", slogan: "Feito pra quem decide o jogo.", peso: 1.4, famaMin: 40, letra: "pesada" },
  { id: "brodesco", nome: "Brodesco", categoria: "banco", cores: ["#CC092F", "#FFFFFF", "#7A0019"], simbolo: "folha", slogan: "Presença no seu campo.", peso: 1.3, famaMin: 35, letra: "fina" },
  { id: "caixinha", nome: "Caixinha Econômica", categoria: "banco", cores: ["#005CA9", "#F39200", "#FFFFFF"], simbolo: "letra", slogan: "Vale a pena torcer.", peso: 0.8, famaMin: 15, letra: "pesada" },
  { id: "bbr", nome: "Banco do Brasileiro", categoria: "banco", cores: ["#FCFC30", "#465EFF", "#FFFFFF"], simbolo: "pontos", slogan: "Todo brasileiro tem um craque na conta.", peso: 1.0, famaMin: 20, letra: "pesada" },
  // refrigerantes
  { id: "kokakolla", nome: "Koka-Kolla", categoria: "refrigerante", cores: ["#F40009", "#FFFFFF", "#8B0000"], simbolo: "gota", slogan: "Abra o placar.", peso: 1.8, famaMin: 55, letra: "italica" },
  { id: "gororo", nome: "Gororó Antártica", categoria: "refrigerante", cores: ["#00843D", "#E30613", "#FFFFFF"], simbolo: "folha", slogan: "O sabor da virada.", peso: 1.1, famaMin: 30, letra: "italica" },
  { id: "pepsy", nome: "Pepsy", categoria: "refrigerante", cores: ["#004B93", "#E32934", "#FFFFFF"], simbolo: "circulo", slogan: "Pede um no intervalo.", peso: 1.3, famaMin: 40, letra: "redonda" },
  // cervejas (só maiores de idade)
  { id: "skull", nome: "Skull", categoria: "cerveja", cores: ["#FFD200", "#E30613", "#1A1A1A"], simbolo: "raio", slogan: "Desce redondo, de bicicleta.", peso: 1.2, famaMin: 35, letra: "pesada" },
  { id: "brahmo", nome: "Brahmo", categoria: "cerveja", cores: ["#C8102E", "#FFFFFF", "#F2C200"], simbolo: "escudo", slogan: "A número 1 da arquibancada.", peso: 1.3, famaMin: 40, letra: "fina" },
  { id: "heinekao", nome: "Heinekão", categoria: "cerveja", cores: ["#00843D", "#FFFFFF", "#C8102E"], simbolo: "circulo", slogan: "Garrafa verde, camisa suada.", peso: 1.5, famaMin: 55, letra: "redonda" },
  // energéticos
  { id: "redboi", nome: "Red Boi", categoria: "energetico", cores: ["#1E2B5F", "#E1001A", "#F2C200"], simbolo: "chifre", slogan: "Te dá asas na pequena área.", peso: 1.4, famaMin: 45, letra: "pesada" },
  { id: "monstrao", nome: "Monstrão", categoria: "energetico", cores: ["#111111", "#7AC943", "#FFFFFF"], simbolo: "garra", slogan: "Libere a fera dos 90 minutos.", peso: 1.1, famaMin: 30, letra: "pesada" },
  // carros
  { id: "fordi", nome: "Fordi", categoria: "carro", cores: ["#003478", "#FFFFFF", "#9BB7D4"], simbolo: "oval", slogan: "Força para ir até o fim.", peso: 1.1, famaMin: 35, letra: "italica" },
  { id: "teslo", nome: "Teslo", categoria: "carro", cores: ["#111111", "#E82127", "#FFFFFF"], simbolo: "raio", slogan: "Aceleração de contra-ataque. Zero emissão.", peso: 1.7, famaMin: 65, letra: "fina" },
  { id: "toiota", nome: "Toiota", categoria: "carro", cores: ["#EB0A1E", "#FFFFFF", "#5A5A5A"], simbolo: "oval", slogan: "Resistência de volante.", peso: 1.3, famaMin: 45, letra: "fina" },
  { id: "fiato", nome: "Fiato", categoria: "carro", cores: ["#8E1B2E", "#FFFFFF", "#C0C0C0"], simbolo: "escudo", slogan: "O carro de quem começou de baixo.", peso: 0.7, famaMin: 15, letra: "pesada" },
  // celulares
  { id: "apel", nome: "Apel", categoria: "celular", cores: ["#F5F5F7", "#1D1D1F", "#86868B"], simbolo: "pera", slogan: "Pense diferente. Chute colocado.", peso: 2.0, famaMin: 75, letra: "fina" },
  { id: "samsong", nome: "Samsong", categoria: "celular", cores: ["#1428A0", "#FFFFFF", "#6E8BFF"], simbolo: "oval", slogan: "Câmera de 200 megapixels para o seu golaço.", peso: 1.5, famaMin: 50, letra: "fina" },
  { id: "xiaome", nome: "Xiaomé", categoria: "celular", cores: ["#FF6900", "#FFFFFF", "#1A1A1A"], simbolo: "quadrado", slogan: "Muito celular por pouco dinheiro.", peso: 0.9, famaMin: 25, letra: "redonda" },
  { id: "motorolo", nome: "Motorolo", categoria: "celular", cores: ["#001428", "#5BC2E7", "#FFFFFF"], simbolo: "asa", slogan: "Alô, alô, artilheiro.", peso: 0.8, famaMin: 15, letra: "redonda" },
  // material esportivo
  { id: "naiki", nome: "Naiki", categoria: "material", cores: ["#111111", "#FF5A1F", "#FFFFFF"], simbolo: "chama", slogan: "Só vai.", peso: 2.0, famaMin: 60, letra: "italica" },
  { id: "adidaz", nome: "Adidaz", categoria: "material", cores: ["#000000", "#FFFFFF", "#9A9A9A"], simbolo: "pontos", slogan: "Nada é impossível, nem de letra.", peso: 1.9, famaMin: 55, letra: "pesada" },
  { id: "pumba", nome: "Pumba", categoria: "material", cores: ["#000000", "#E4002B", "#FFFFFF"], simbolo: "raio", slogan: "Mais rápido que a zaga.", peso: 1.4, famaMin: 40, letra: "pesada" },
  { id: "novabalanca", nome: "Nova Balança", categoria: "material", cores: ["#CF0A2C", "#FFFFFF", "#2B2B2B"], simbolo: "balanca", slogan: "Equilíbrio de quem joga bonito.", peso: 1.3, famaMin: 35, letra: "pesada" },
  { id: "mizumo", nome: "Mizumo", categoria: "material", cores: ["#001E62", "#FFFFFF", "#5B8BD6"], simbolo: "onda", slogan: "Chuteira de artesão.", peso: 1.0, famaMin: 20, letra: "fina" },
  { id: "umbrela", nome: "Umbrela", categoria: "material", cores: ["#1A1A1A", "#FFFFFF", "#2E7D4F"], simbolo: "guardaChuva", slogan: "Faça chuva ou sol, faça gol.", peso: 0.8, famaMin: 10, letra: "pesada" },
  { id: "penalte", nome: "Penaltê", categoria: "material", cores: ["#FFFFFF", "#003DA5", "#F2C200"], simbolo: "estrela", slogan: "Na marca da cal.", peso: 0.6, famaMin: 0, letra: "italica" },
  // lanchonetes
  { id: "macdonaldo", nome: "MacDonaldo", categoria: "comida", cores: ["#DA291C", "#FFC72C", "#FFFFFF"], simbolo: "batata", slogan: "Amo muito tudo isso, menos perder.", peso: 1.5, famaMin: 50, letra: "redonda" },
  { id: "burguerrei", nome: "Burguer Rei", categoria: "comida", cores: ["#F5EBDC", "#D62300", "#502314"], simbolo: "coroa", slogan: "Rei da área, rei do lanche.", peso: 1.2, famaMin: 35, letra: "redonda" },
  // acessórios (só para quem é muito seguido; o produto aparece no visual)
  { id: "reiban", nome: "Rei-Ban", categoria: "oculos", cores: ["#B5121B", "#FFFFFF", "#1A1A1A"], simbolo: "letra", slogan: "Nunca escondeu o olhar do goleiro.", peso: 1.6, famaMin: 55, letra: "italica", seguidoresMin: 15e6, acessorio: { tipo: "oculos", modelo: "aviador", armacao: "#C9A24D", lente: "#2F4A36" } },
  { id: "ouclei", nome: "Ouclei", categoria: "oculos", cores: ["#111111", "#E8E8E8", "#1F6FB0"], simbolo: "oval", slogan: "Feito para o sol das três da tarde.", peso: 1.4, famaMin: 50, letra: "pesada", seguidoresMin: 8e6, acessorio: { tipo: "oculos", modelo: "esportivo", armacao: "#E8E8E8", lente: "#1F6FB0" } },
  { id: "chilibins", nome: "Chili Bins", categoria: "oculos", cores: ["#E30613", "#111111", "#FFFFFF"], simbolo: "chama", slogan: "Óculos com pimenta.", peso: 1.0, famaMin: 40, letra: "redonda", seguidoresMin: 3e6, acessorio: { tipo: "oculos", modelo: "quadrado", armacao: "#1A1A1A", lente: "#2A2A2A" } },
  { id: "rolecs", nome: "Rolécs", categoria: "relogio", cores: ["#006039", "#C9A24D", "#FFFFFF"], simbolo: "coroa", slogan: "Cada minuto conta. Principalmente os acréscimos.", peso: 2.0, famaMin: 75, letra: "fina", seguidoresMin: 40e6, acessorio: { tipo: "relogio", pulseira: "#C9A24D", mostrador: "#0F3D2A" } },
  { id: "taguer", nome: "Tague Roier", categoria: "relogio", cores: ["#111111", "#E30613", "#FFFFFF"], simbolo: "escudo", slogan: "Não ceda à pressão.", peso: 1.5, famaMin: 60, letra: "pesada", seguidoresMin: 15e6, acessorio: { tipo: "relogio", pulseira: "#B9BDC4", mostrador: "#1A1A1A" } },
  { id: "casiu", nome: "Casiu", categoria: "relogio", cores: ["#1A1A1A", "#6E8BFF", "#FFFFFF"], simbolo: "quadrado", slogan: "Aguenta tombo, aguenta carrinho.", peso: 0.9, famaMin: 40, letra: "pesada", seguidoresMin: 2e6, acessorio: { tipo: "relogio", pulseira: "#2B2B2B", mostrador: "#9FB7A0" } },
  { id: "bitz", nome: "Bitz", categoria: "fone", cores: ["#E30613", "#FFFFFF", "#111111"], simbolo: "circulo", slogan: "Entra em campo no seu ritmo.", peso: 1.5, famaMin: 55, letra: "redonda", seguidoresMin: 10e6, acessorio: { tipo: "fone", cor: "#F2F0EA", detalhe: "#E30613" } },
  { id: "jbla", nome: "JBLá", categoria: "fone", cores: ["#FF5A00", "#FFFFFF", "#1A1A1A"], simbolo: "pontos", slogan: "O som do vestiário.", peso: 1.0, famaMin: 40, letra: "pesada", seguidoresMin: 3e6, acessorio: { tipo: "fone", cor: "#1A1A1A", detalhe: "#FF5A00" } },
  { id: "habibao", nome: "Habibão", categoria: "comida", cores: ["#E30613", "#FFD200", "#FFFFFF"], simbolo: "engrenagem", slogan: "Esfiha de campeão.", peso: 0.7, famaMin: 15, letra: "pesada" },
];
export const MARCA: Record<string, Marca> = Object.fromEntries(MARCAS.map((m) => [m.id, m]));

// ------------------------------------------------------------------ contratos
export type TipoContrato = "fixo" | "desempenho" | "longo";
export const NOME_CONTRATO: Record<TipoContrato, { nome: string; texto: string }> = {
  fixo: { nome: "Valor fixo", texto: "O mesmo valor todo mês, jogue bem ou mal." },
  desempenho: { nome: "Por desempenho", texto: "Fixo menor e bônus por gol, assistência e nota alta." },
  longo: { nome: "Longo prazo", texto: "Menos por mês, mas por muitos anos, com luvas na assinatura." },
};
export interface OfertaPatrocinio { tipo: TipoContrato; mensal: number; meses: number; luvas: number; bonusGol: number; bonusAssist: number; bonusNota: number }
export interface ContratoPatrocinio extends OfertaPatrocinio { marca: string; restantes: number; desde: number }
export interface PropostaPatrocinio { marca: string; opcoes: OfertaPatrocinio[]; expira: number }

/** Quanto a imagem do jogador vale por mês para uma marca de peso 1 (R$). */
export const valorDeImagem = (fama: number, seguidores: number) => 1500 * Math.exp(fama / 14) * (0.8 + 0.1 * Math.log10(Math.max(1e3, seguidores) / 1e3));

const redondo = (v: number) => (v >= 1e5 ? Math.round(v / 1e4) * 1e4 : v >= 1e4 ? Math.round(v / 1e3) * 1e3 : Math.round(v / 100) * 100);
export function ofertasDaMarca(rng: RNG, m: Marca, fama: number, seguidores: number): OfertaPatrocinio[] {
  const v = valorDeImagem(fama, seguidores) * m.peso * rng.range(0.85, 1.15);
  return [
    { tipo: "fixo", mensal: redondo(v), meses: rng.pick([12, 18, 24]), luvas: 0, bonusGol: 0, bonusAssist: 0, bonusNota: 0 },
    { tipo: "desempenho", mensal: redondo(v * 0.45), meses: 12, luvas: 0, bonusGol: redondo(v * 0.16), bonusAssist: redondo(v * 0.08), bonusNota: redondo(v * 0.1) },
    { tipo: "longo", mensal: redondo(v * 0.75), meses: rng.pick([36, 48]), luvas: redondo(v * 2), bonusGol: 0, bonusAssist: 0, bonusNota: 0 },
  ];
}

/** Uma marca interessada (de categoria livre, que caiba na fama e na idade do jogador). */
export function marcaInteressada(rng: RNG, fama: number, idade: number, ativos: ContratoPatrocinio[], recusadas: string[], seguidores = 0): Marca | undefined {
  const ocupadas = new Set(ativos.map((c) => MARCA[c.marca]?.categoria));
  const pool = MARCAS.filter((m) => !ocupadas.has(m.categoria) && fama >= m.famaMin && seguidores >= (m.seguidoresMin ?? 0) && (m.categoria !== "cerveja" || idade >= 18) && !recusadas.includes(m.id));
  if (!pool.length) return undefined;
  // marca grande tem preferência quando o jogador já é grande
  const pesos = pool.map((m) => 1 + (fama - m.famaMin) / 40 + m.peso);
  let x = rng.next() * pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { x -= pesos[i]; if (x <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

/** Acessórios que o jogador está usando por contrato (um por tipo). */
export function acessoriosAtivos(ativos: ContratoPatrocinio[] | undefined): Partial<Record<AcessorioMarca["tipo"], AcessorioMarca>> {
  const out: Partial<Record<AcessorioMarca["tipo"], AcessorioMarca>> = {};
  for (const k of ativos ?? []) { const a = MARCA[k.marca]?.acessorio; if (a) out[a.tipo] = a; }
  return out;
}

/** Bônus do mês de um contrato por desempenho. */
export const bonusDoMes = (c: ContratoPatrocinio, mes: { gols: number; assist: number; notas8: number }) => c.bonusGol * mes.gols + c.bonusAssist * mes.assist + c.bonusNota * mes.notas8;
