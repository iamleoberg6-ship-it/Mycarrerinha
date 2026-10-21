// DNA do jogador — seção "Criação do jogador › DNA do jogador" do documento de design.
// Sem dependências de Node: roda no navegador e no motor.
import { RNG, clamp } from "./rng.js";
import { type Atributo, type Atributos, type Posicao, type Personalidade, ATRIBUTOS, atributosIniciais, ovr } from "./atributos.js";

export type EscolaId = "BRA" | "ARG_URU" | "ESP_NED" | "GER" | "ITA" | "ENG" | "FRA" | "AFO" | "JPN_KOR";
export type FormacaoId = "rua" | "futsal" | "praia" | "escolinha" | "academia" | "base_grande";
export type FamiliaId = "humilde" | "media" | "rica";
export type Pe = "direito" | "esquerdo" | "ambidestro";
export type TracoId = "ginga" | "drible_curto" | "chute_longe" | "cabeceador" | "bicicleta" | "lider_nato" | "frieza" | "velocista";

type Mods = Partial<Record<Atributo, number>>;
const FISICOS: Atributo[] = ["VEL", "RES", "FOR"];
const TECNICOS: Atributo[] = ["PAS", "CRU", "DRI", "FIN", "CAB"];
const cada = (attrs: Atributo[], v: number): Mods => Object.fromEntries(attrs.map((a) => [a, v]));

export interface PersonalidadeDNA extends Personalidade {
  carisma: number; // 1–20, novo traço oculto (redes sociais)
}

export interface Escola {
  id: EscolaId; nome: string; pais: string; nacionalidade: string; lingua: string; descricao: string;
  mods: Mods; pers?: Partial<PersonalidadeDNA>;
}
export const ESCOLAS: Escola[] = [
  { id: "BRA", nome: "Brasil", pais: "Brasil", nacionalidade: "BRA", lingua: "pt", descricao: "Drible, finalização e frieza de quem aprendeu brincando.", mods: { DRI: 4, FIN: 2, COM: 2, MAR: -2 }, pers: { carisma: 3 } },
  { id: "ARG_URU", nome: "Argentina e Uruguai", pais: "Argentina", nacionalidade: "ARG", lingua: "es", descricao: "Garra, marcação e drible de potrero.", mods: { DRI: 3, MAR: 3, COM: 2, VEL: -2 }, pers: { temperamento: 3 } },
  { id: "ESP_NED", nome: "Espanha e Holanda", pais: "Espanha", nacionalidade: "ESP", lingua: "es", descricao: "Passe, visão e jogo posicional.", mods: { PAS: 4, VIS: 3, POS: 1, FOR: -2 } },
  { id: "GER", nome: "Alemanha", pais: "Alemanha", nacionalidade: "GER", lingua: "de", descricao: "Resistência, organização e disciplina.", mods: { RES: 3, POS: 3, PAS: 2, DRI: -2 }, pers: { profissionalismo: 3 } },
  { id: "ITA", nome: "Itália", pais: "Itália", nacionalidade: "ITA", lingua: "it", descricao: "Marcação e leitura de jogo da escola defensiva.", mods: { MAR: 4, POS: 3, COM: 1, VEL: -2 } },
  { id: "ENG", nome: "Inglaterra", pais: "Inglaterra", nacionalidade: "ENG", lingua: "en", descricao: "Força, jogo aéreo e intensidade.", mods: { FOR: 3, CAB: 3, RES: 2, VIS: -2 } },
  { id: "FRA", nome: "França", pais: "França", nacionalidade: "FRA", lingua: "fr", descricao: "Velocidade e potência com técnica.", mods: { VEL: 3, FOR: 3, DRI: 2, PAS: -2 } },
  { id: "AFO", nome: "África Ocidental", pais: "Senegal", nacionalidade: "SEN", lingua: "fr", descricao: "Força física e explosão.", mods: { FOR: 4, VEL: 3, RES: 1, POS: -2 } },
  { id: "JPN_KOR", nome: "Japão e Coreia do Sul", pais: "Japão", nacionalidade: "JPN", lingua: "ja", descricao: "Velocidade, fôlego e disciplina tática.", mods: { VEL: 4, RES: 3, POS: 1, DRI: -2, FOR: -1 }, pers: { profissionalismo: 3 } },
];

export type PaisId = "BRA" | "ARG" | "URU" | "ESP" | "NED" | "GER" | "ITA" | "ENG" | "FRA" | "NGA" | "SEN" | "GHA" | "JPN" | "KOR";
/** Cada país tem a sua carta; países da mesma escola de futebol compartilham as tendências de atributos. */
export interface Pais { id: PaisId; nome: string; local: string; escola: EscolaId; nacionalidade: string; lingua: string; nota: string }
export const PAISES: Pais[] = [
  { id: "BRA", nome: "Brasil", local: "no Brasil", escola: "BRA", nacionalidade: "BRA", lingua: "pt", nota: "Terra do drible. Aqui a bola é brincadeira antes de ser profissão." },
  { id: "ARG", nome: "Argentina", local: "na Argentina", escola: "ARG_URU", nacionalidade: "ARG", lingua: "es", nota: "Potreros, garra e um país inteiro que vive o futebol." },
  { id: "URU", nome: "Uruguai", local: "no Uruguai", escola: "ARG_URU", nacionalidade: "URU", lingua: "es", nota: "Três milhões de pessoas e uma raça que não desiste." },
  { id: "ESP", nome: "Espanha", local: "na Espanha", escola: "ESP_NED", nacionalidade: "ESP", lingua: "es", nota: "Desde pequeno, a bola não pode ser perdida." },
  { id: "NED", nome: "Holanda", local: "na Holanda", escola: "ESP_NED", nacionalidade: "NED", lingua: "nl", nota: "A escola que inventou ocupar espaços." },
  { id: "GER", nome: "Alemanha", local: "na Alemanha", escola: "GER", nacionalidade: "GER", lingua: "de", nota: "Método, disciplina e treino até cansar." },
  { id: "ITA", nome: "Itália", local: "na Itália", escola: "ITA", nacionalidade: "ITA", lingua: "it", nota: "Onde defender bem é uma arte." },
  { id: "ENG", nome: "Inglaterra", local: "na Inglaterra", escola: "ENG", nacionalidade: "ENG", lingua: "en", nota: "Chuva, lama e jogo intenso desde o primeiro chute." },
  { id: "FRA", nome: "França", local: "na França", escola: "FRA", nacionalidade: "FRA", lingua: "fr", nota: "Os campos de bairro que viraram fábrica de craques." },
  { id: "NGA", nome: "Nigéria", local: "na Nigéria", escola: "AFO", nacionalidade: "NGA", lingua: "en", nota: "Campinho de terra batida e uma explosão que ninguém ensina." },
  { id: "SEN", nome: "Senegal", local: "no Senegal", escola: "AFO", nacionalidade: "SEN", lingua: "fr", nota: "Na praia de Dakar, todo fim de tarde vira jogo." },
  { id: "GHA", nome: "Gana", local: "em Gana", escola: "AFO", nacionalidade: "GHA", lingua: "en", nota: "As Estrelas Negras inspiram cada garoto da rua." },
  { id: "JPN", nome: "Japão", local: "no Japão", escola: "JPN_KOR", nacionalidade: "JPN", lingua: "ja", nota: "Escola organizada, treino diário e respeito ao coletivo." },
  { id: "KOR", nome: "Coreia do Sul", local: "na Coreia do Sul", escola: "JPN_KOR", nacionalidade: "KOR", lingua: "ko", nota: "Fôlego infinito e disciplina de sobra." },
];

export interface Formacao {
  id: FormacaoId; nome: string; descricao: string; mods: Mods; pot?: number; pers?: Partial<PersonalidadeDNA>;
  exigeFamilia?: FamiliaId[]; traco?: TracoId;
}
export const FORMACOES: Formacao[] = [
  { id: "rua", nome: "Futebol de rua e várzea", descricao: "Aprendeu no asfalto e no terrão, contra quem era mais velho.", mods: { DRI: 4, COM: 2, FOR: 2, POS: -2, PAS: -2 }, pers: { ambicao: 2 }, traco: "ginga" },
  { id: "futsal", nome: "Futsal", descricao: "Quadra pequena, pouco tempo, muita técnica.", mods: { DRI: 4, PAS: 3, COM: 2, FOR: -2, CAB: -1 }, traco: "drible_curto" },
  { id: "praia", nome: "Praia", descricao: "Areia fofa: pernas fortes e bola no alto.", mods: { RES: 3, FOR: 3, DRI: 2, PAS: -2 }, traco: "bicicleta" },
  { id: "escolinha", nome: "Escolinha do bairro", descricao: "Base certinha, sem pular etapas.", mods: { PAS: 2, POS: 2, RES: 2, MAR: 2 } },
  { id: "academia", nome: "Academia particular", descricao: "Treino caro, metodologia europeia.", mods: { PAS: 3, POS: 2, ...cada(FISICOS, 1), DRI: -2 }, pers: { profissionalismo: 2 }, exigeFamilia: ["media", "rica"] },
  { id: "base_grande", nome: "Base de clube grande", descricao: "Passou na peneira e cresceu dentro de um gigante.", mods: { POS: 3, PAS: 3, MAR: 2, DRI: -2 }, pot: 3, pers: { profissionalismo: 3 }, traco: "frieza" },
];

export interface Familia { id: FamiliaId; nome: string; descricao: string; mods: Mods; pot?: number; pers?: Partial<PersonalidadeDNA>; dinheiro: number; vidaNoturna: number }
export const FAMILIAS: Familia[] = [
  { id: "humilde", nome: "Humilde", descricao: "Pouco dinheiro, muita fome de vencer. O primeiro salário grande tira a família da comunidade.", mods: { RES: 3 }, pers: { ambicao: 4, profissionalismo: 2 }, dinheiro: 2000, vidaNoturna: 0 },
  { id: "media", nome: "Classe média", descricao: "Estrutura razoável e estudo junto com o futebol.", mods: cada(TECNICOS, 1), pers: { profissionalismo: 2 }, dinheiro: 20000, vidaNoturna: 0 },
  { id: "rica", nome: "Rica", descricao: "Nutrição, treino e conforto. Menos fome, mais festa.", mods: cada(FISICOS, 1), pot: 2, pers: { ambicao: -3 }, dinheiro: 200000, vidaNoturna: 10 },
];

export interface Traco { id: TracoId; nome: string; efeito: string }
export const TRACOS: Record<TracoId, Traco> = {
  ginga: { id: "ginga", nome: "Ginga", efeito: "+5 em dribles nos momentos de decisão" },
  drible_curto: { id: "drible_curto", nome: "Drible curto", efeito: "+5 em lances em espaço curto" },
  chute_longe: { id: "chute_longe", nome: "Chute de longe", efeito: "+5 em finalizações de fora da área" },
  cabeceador: { id: "cabeceador", nome: "Cabeceador", efeito: "+5 em lances aéreos" },
  bicicleta: { id: "bicicleta", nome: "Bicicleta", efeito: "Libera a bicicleta, com mais chance de viralizar" },
  lider_nato: { id: "lider_nato", nome: "Líder nato", efeito: "+10 de afinidade com o elenco; chance de virar capitão" },
  frieza: { id: "frieza", nome: "Frieza", efeito: "+5 em pênaltis e finais" },
  velocista: { id: "velocista", nome: "Velocista", efeito: "+5 em contra-ataques" },
};

export interface EscolhasCriacao {
  nome: string;
  apelido?: string;
  pais: PaisId;
  clubeCoracao?: string; // id do clube do pacote de dados
  familia: FamiliaId;
  formacao: FormacaoId;
  alturaCm: number; // 165–195
  pe: Pe;
  posicao: Posicao;
  semente?: string;
}

export interface ResultadoCriacao {
  escolhas: EscolhasCriacao;
  formacaoFinal: FormacaoId; // pode mudar se reprovar na peneira
  peneira?: { aprovado: boolean; texto: string };
  atributos: Atributos;
  ovr: number;
  potencial: number; // real, oculto do jogador
  faixaPotencial: [number, number]; // o que os olheiros dizem
  personalidade: PersonalidadeDNA;
  tracos: TracoId[];
  dinheiroInicial: number;
  vidaNoturnaInicial: number;
  modsAplicados: Mods;
  nacionalidade: string;
  escola: EscolaId;
}

export function formacaoPermitida(f: FormacaoId, familia: FamiliaId): boolean {
  const ex = FORMACOES.find((x) => x.id === f)!.exigeFamilia;
  return !ex || ex.includes(familia);
}

function somar(...ms: Mods[]): Mods {
  const out: Mods = {};
  for (const m of ms) for (const [k, v] of Object.entries(m)) out[k as Atributo] = (out[k as Atributo] ?? 0) + (v ?? 0);
  for (const k of Object.keys(out) as Atributo[]) out[k] = clamp(out[k]!, -8, 8);
  return out;
}

function modsAltura(cm: number): Mods {
  const m: Mods = {};
  if (cm > 180) { const n = Math.floor((cm - 180) / 5); m.CAB = n; m.FOR = n; }
  if (cm > 185) m.VEL = -Math.floor((cm - 185) / 5);
  return m;
}

function sortearTracos(rng: RNG, e: EscolhasCriacao & { escola: EscolaId }, formacao: FormacaoId): TracoId[] {
  const peso: Record<TracoId, number> = { ginga: 1, drible_curto: 1, chute_longe: 1, cabeceador: 1, bicicleta: 0.5, lider_nato: 1, frieza: 1, velocista: 1 };
  const f = FORMACOES.find((x) => x.id === formacao)!;
  if (f.traco) peso[f.traco] += 4;
  if (e.escola === "BRA") peso.ginga += 3;
  if (e.escola === "GER" || e.escola === "ENG") peso.chute_longe += 3;
  if (e.escola === "ITA") peso.frieza += 3;
  if (e.escola === "AFO" || e.escola === "FRA" || e.escola === "JPN_KOR") peso.velocista += 3;
  if (e.escola === "ARG_URU" || e.familia === "humilde") peso.lider_nato += 2;
  if (e.alturaCm > 185) peso.cabeceador += 4;
  if (e.alturaCm < 175) peso.cabeceador = 0;
  const n = rng.chance(0.35) ? 2 : 1;
  const escolhidos: TracoId[] = [];
  for (let i = 0; i < n; i++) {
    const ids = (Object.keys(peso) as TracoId[]).filter((t) => !escolhidos.includes(t) && peso[t] > 0);
    const total = ids.reduce((a, t) => a + peso[t], 0);
    let r = rng.next() * total;
    for (const t of ids) { r -= peso[t]; if (r <= 0) { escolhidos.push(t); break; } }
  }
  return escolhidos;
}

/** Cria o jogador a partir das escolhas. Determinístico para a mesma semente e as mesmas escolhas. */
export function criarJogador(e: EscolhasCriacao): ResultadoCriacao {
  const pais = PAISES.find((x) => x.id === e.pais)!;
  const rng = new RNG(e.semente ?? `${e.nome}|${e.pais}|${e.familia}|${e.formacao}|${e.alturaCm}|${e.pe}|${e.posicao}`);
  if (!formacaoPermitida(e.formacao, e.familia)) throw new Error(`Formação ${e.formacao} exige outra origem familiar`);
  // peneira do clube grande
  let formacaoFinal = e.formacao;
  let peneira: ResultadoCriacao["peneira"];
  if (e.formacao === "base_grande") {
    const p = e.familia === "rica" ? 0.55 : e.familia === "media" ? 0.45 : 0.4;
    const aprovado = rng.chance(p);
    peneira = aprovado
      ? { aprovado, texto: "Na peneira de 300 garotos, o treinador apontou para você. Aprovado." }
      : { aprovado, texto: "Na peneira de 300 garotos, faltou pouco. Você voltou para a escolinha do bairro, com mais vontade ainda." };
    if (!aprovado) formacaoFinal = "escolinha";
  }
  const escola = ESCOLAS.find((x) => x.id === pais.escola)!;
  const formacao = FORMACOES.find((x) => x.id === formacaoFinal)!;
  const familia = FAMILIAS.find((x) => x.id === e.familia)!;
  const mods = somar(escola.mods, formacao.mods, familia.mods, modsAltura(e.alturaCm), e.pe === "ambidestro" ? { DRI: 3, FIN: 3 } : {});

  // base (35 + 120 pontos com peso nos principais da posição) + modificadores do DNA
  const at = atributosIniciais(rng, e.posicao);
  if (e.pe === "ambidestro") {
    // custa 10 pontos de criação: tirados dos atributos não principais
    const outros = ATRIBUTOS.filter((a) => !["DRI", "FIN"].includes(a));
    for (let i = 0; i < 10; i++) { const a = outros[i % outros.length]; at[a] -= 1; }
  }
  for (const a of ATRIBUTOS) at[a] = clamp(Math.round(at[a] + (mods[a] ?? 0)), 20, 75);

  const potencial = Math.round(clamp(rng.normal(72, 7) + (formacao.pot ?? 0) + (familia.pot ?? 0), 60, 95));
  const erro = rng.int(-3, 3);
  const faixaPotencial: [number, number] = [clamp(potencial + erro - 5, 55, 99), clamp(potencial + erro + 5, 55, 99)];

  const pers: PersonalidadeDNA = { profissionalismo: rng.int(4, 17), ambicao: rng.int(3, 17), temperamento: rng.int(3, 17), carisma: rng.int(3, 17) };
  for (const p of [escola.pers, formacao.pers, familia.pers]) {
    if (!p) continue;
    for (const [k, v] of Object.entries(p)) pers[k as keyof PersonalidadeDNA] = clamp(pers[k as keyof PersonalidadeDNA] + (v ?? 0), 1, 20);
  }

  return {
    escolhas: e, formacaoFinal, peneira, atributos: at, ovr: Math.round(ovr(at, e.posicao)), potencial, faixaPotencial,
    personalidade: pers, tracos: sortearTracos(rng, { ...e, escola: escola.id }, formacaoFinal), dinheiroInicial: familia.dinheiro,
    vidaNoturnaInicial: familia.vidaNoturna, modsAplicados: mods, nacionalidade: pais.nacionalidade, escola: escola.id,
  };
}
