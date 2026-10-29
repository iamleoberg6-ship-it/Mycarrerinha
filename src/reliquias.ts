// Relíquias: camisas, bolas e troféus que a carreira vai liberando e que viram enfeite da casa.
// Este arquivo diz o que existe, como cada uma é desbloqueada e com que cara ela fica.
import { TACA_DO_TORNEIO } from "./trofeus.js";
import type { RNG } from "./rng.js";
import type { Reliquia } from "./casa.js";
import { LIGA_INFO } from "./ligas.js";

export type Grupo = "Camisas" | "Bolas" | "Troféus";
export interface Conquista {
  chave: string; tipo: Reliquia["tipo"]; grupo: Grupo; nome: string; dica: string;
  /** pode ser ganha mais de uma vez (cada hat-trick, cada título, cada temporada premiada) */
  repetivel?: boolean;
  /** ainda não existe no jogo (seleção, transferências) */
  emBreve?: boolean;
}

export const CONQUISTAS: Conquista[] = [
  { chave: "camisa-estreia-base", tipo: "camisa", grupo: "Camisas", nome: "Camisa da estreia na base", dica: "Jogue sua primeira partida na base." },
  { chave: "camisa-estreia", tipo: "camisa", grupo: "Camisas", nome: "Camisa da estreia como profissional", dica: "Estreie no time profissional." },
  { chave: "camisa-primeiro-gol", tipo: "camisa", grupo: "Camisas", nome: "Camisa do primeiro gol", dica: "Marque seu primeiro gol como profissional." },
  { chave: "camisa-clube", tipo: "camisa", grupo: "Camisas", nome: "Camisa de cada clube", dica: "Faça 10 jogos como profissional por um clube.", repetivel: true },
  { chave: "camisa-jogo", tipo: "camisa", grupo: "Camisas", nome: "Camisa de jogo marcante", dica: "Chegue a 100, 200, 300... jogos como profissional.", repetivel: true },
  { chave: "camisa-titulo", tipo: "camisa", grupo: "Camisas", nome: "Camisa do título", dica: "Seja campeão da liga jogando pelo menos 10 partidas.", repetivel: true },
  { chave: "camisa-troca", tipo: "camisa", grupo: "Camisas", nome: "Camisa trocada com um craque", dica: "Fique amigo de uma estrela e peça a camisa dela depois do jogo.", repetivel: true },
  { chave: "camisa-selecao", tipo: "camisa", grupo: "Camisas", nome: "Camisa da estreia pela seleção", dica: "Seja convocado e estreie pela seleção." },
  { chave: "bola-gol-base", tipo: "bola", grupo: "Bolas", nome: "Bola do primeiro gol na base", dica: "Marque seu primeiro gol na base." },
  { chave: "bola-estreia", tipo: "bola", grupo: "Bolas", nome: "Bola da estreia", dica: "Estreie no time profissional." },
  { chave: "bola-primeiro-gol", tipo: "bola", grupo: "Bolas", nome: "Bola do primeiro gol", dica: "Marque seu primeiro gol como profissional." },
  { chave: "bola-hattrick", tipo: "bola", grupo: "Bolas", nome: "Bola do hat-trick", dica: "Faça três gols num jogo.", repetivel: true },
  { chave: "bola-marca", tipo: "bola", grupo: "Bolas", nome: "Bola de gol marcante", dica: "Chegue a 50, 100, 150... gols como profissional.", repetivel: true },
  { chave: "bola-bicicleta", tipo: "bola", grupo: "Bolas", nome: "Bola do gol de bicicleta", dica: "Faça um gol de bicicleta." },
  { chave: "bola-olimpico", tipo: "bola", grupo: "Bolas", nome: "Bola do gol olímpico", dica: "Faça um gol direto do escanteio." },
  { chave: "bola-meio-campo", tipo: "bola", grupo: "Bolas", nome: "Bola do gol do meio de campo", dica: "Marque do meio de campo." },
  { chave: "bola-falta", tipo: "bola", grupo: "Bolas", nome: "Bola do primeiro gol de falta", dica: "Faça um gol de falta." },
  { chave: "bola-cavadinha", tipo: "bola", grupo: "Bolas", nome: "Bola da cavadinha", dica: "Converta um pênalti de cavadinha." },
  { chave: "trofeu-campeao", tipo: "trofeu", grupo: "Troféus", nome: "Taça de campeão", dica: "Seja campeão da liga jogando pelo menos 10 partidas.", repetivel: true },
  { chave: "trofeu-craque", tipo: "trofeu", grupo: "Troféus", nome: "Craque do campeonato", dica: "Termine a temporada como o melhor jogador da liga.", repetivel: true },
  { chave: "trofeu-artilheiro", tipo: "trofeu", grupo: "Troféus", nome: "Artilheiro do campeonato", dica: "Seja o maior goleador da liga.", repetivel: true },
  { chave: "trofeu-garcom", tipo: "trofeu", grupo: "Troféus", nome: "Rei das assistências", dica: "Dê mais assistências que todo mundo na liga.", repetivel: true },
  { chave: "trofeu-selecao", tipo: "trofeu", grupo: "Troféus", nome: "Seleção do campeonato", dica: "Esteja entre os melhores da temporada na sua posição.", repetivel: true },
  { chave: "trofeu-revelacao", tipo: "trofeu", grupo: "Troféus", nome: "Revelação do campeonato", dica: "Brilhe na sua primeira temporada completa como profissional, até 21 anos." },
  { chave: "trofeu-sub21", tipo: "trofeu", grupo: "Troféus", nome: "Melhor jogador sub-21", dica: "Seja o melhor da liga com até 21 anos.", repetivel: true },
  { chave: "trofeu-artilheiro-base", tipo: "trofeu", grupo: "Troféus", nome: "Artilheiro do sub-17", dica: "Seja o maior goleador da base.", repetivel: true },
  { chave: "trofeu-craque-base", tipo: "trofeu", grupo: "Troféus", nome: "Craque do sub-17", dica: "Seja o melhor jogador da base na temporada.", repetivel: true },
  { chave: "trofeu-contratacao", tipo: "trofeu", grupo: "Troféus", nome: "Melhor contratação", dica: "Brilhe na primeira temporada depois de uma transferência.", repetivel: true },
];
export const CONQUISTA: Record<string, Conquista> = Object.fromEntries(CONQUISTAS.map((c) => [c.chave, c]));

// ------------------------------------------------------------------ aparência
/** Desenho da camisa de cada clube (paródia: só cores e padrão). */
const PADRAO_CAMISA: Record<string, string> = {
  FLA: "listrasH", FLU: "listrasV", BOT: "listrasV", VAS: "faixa", GRE: "listrasV", CAM: "listrasV", BAH: "listrasV", VIT: "listrasV", CAP: "diagonais",
  SPA: "faixaH", SAN: "lisa", PAL: "lisa", COR: "lisa", INT: "lisa", CRU: "lisa", CFC: "duasFaixasH", RBB: "lisa", MIR: "lisa", REM: "lisa", CHA: "lisa",
  FOR: "listrasHG", ACG: "metade",
};
export const padraoCamisa = (clubeId: string) => PADRAO_CAMISA[clubeId] ?? "lisa";
/** Uniforme real de alguns clubes que o padrão simples não representa. Corpo branco com duas faixas cruzando o meio (vermelha e preta). */
/** Quadricolor do Vale (Brusque): camisa branca com três faixas (verde, amarela e vermelha); o escudo segue as cores do clube. */
export const UNIFORME_CLUBE: Record<string, { cores: [string, string]; padrao: string; faixas: string[]; escudo: [string, string] }> = {
  "C-BRU": { cores: ["#FFFFFF", "#E2231A"], padrao: "tresFaixasH", faixas: ["#0B7A3B", "#F5C400", "#E2231A"], escudo: ["#E2231A", "#FFFFFF"] },
  /** Pantera de Ribeirão (Botafogo-SP): como o São Paulo, com as cores da faixa invertidas (preta em cima, vermelha embaixo). */
  BFC: { cores: ["#FFFFFF", "#000000"], padrao: "duasFaixasH", faixas: ["#000000", "#C8102E"], escudo: ["#C8102E", "#FFFFFF"] },
};
const KIT_VISUAL: Record<string, { cores: [string, string]; modelo: string; terceira: string; faixas?: string[] }> = {
  BFC: { cores: ["#FFFFFF", "#000000"], modelo: "duasFaixasH", terceira: "#C8102E" },
  "C-BRU": { cores: ["#FFFFFF", "#E2231A"], modelo: "tresFaixasH", terceira: "#0B7A3B", faixas: ["#0B7A3B", "#F5C400", "#E2231A"] },
  SPA: { cores: ["#FFFFFF", "#C8102E"], modelo: "duasFaixasH", terceira: "#111111" },
  CFC: { cores: ["#FFFFFF", "#00573F"], modelo: "duasFaixasH", terceira: "#00573F" },
  FOR: { cores: ["#1C3F94", "#E2231A"], modelo: "listrasHG", terceira: "#111111" },
  ACG: { cores: ["#E2231A", "#000000"], modelo: "metade", terceira: "#111111" },
};
/** Cores, desenho e terceira cor com que a camisa é desenhada (o clube tem prioridade sobre o que foi guardado). */
/** Calção de clubes cujo uniforme real não usa a cor 2 (Santos: calção branco, com o preto só na gola e nas mangas). */
/** Cor do número de clubes que usam número de outra cor (Vasco: sempre vermelho). */
export const numeroCorClube = (clubeId?: string): string | undefined => (clubeId === "VAS" ? "#C8102E" : undefined);
/** Calção e meião que fogem do padrão da camisa (São Paulo e Fortaleza jogam de branco embaixo). */
export const calcaoDoClube = (clubeId?: string): string | undefined => (clubeId === "SAN" || clubeId === "FOR" ? "#FFFFFF" : undefined);
export const meiaoDoClube = (clubeId?: string): string | undefined => (clubeId === "FOR" ? "#FFFFFF" : undefined);
export function kitVisual(r: { cores: [string, string]; modelo: string; clubeId?: string }): { cores: [string, string]; modelo: string; terceira?: string; faixas?: string[]; numeroCor?: string } {
  const k = r.clubeId ? KIT_VISUAL[r.clubeId] : undefined, numeroCor = numeroCorClube(r.clubeId);
  return k ? { cores: k.cores, modelo: k.modelo, terceira: k.terceira, faixas: k.faixas, numeroCor } : { cores: r.cores, modelo: r.modelo, numeroCor };
}
/** As bolas mudam de competição para competição e de ano para ano. */
const BOLA_BASE: [string, string][] = [["#262626", "#262626"], ["#1B98E0", "#262626"], ["#C0392B", "#262626"]];
/** competição: id da liga (BRA1, EUR1...) ou "base". */
export const coresDaBola = (competicao: string, ano: number): [string, string] => {
  const l = competicao === "base" ? BOLA_BASE : (LIGA_INFO[competicao === "serieA" ? "BRA1" : competicao]?.bolas ?? LIGA_INFO.BRA1.bolas);
  return l[ano % l.length];
};
export const OURO: [string, string] = ["#E3B341", "#9A7420"], PRATA: [string, string] = ["#CDD3D8", "#7D868D"];

// ------------------------------------------------------------------ desbloqueio
export interface DadosPartida {
  tipo: "profissional" | "base"; ano: number; semana: number; adversario: string; clubeId: string; clubeNome: string; cores: string[]; numero: string;
  padrao?: string; ligaId?: string;
  placar: string; gols: number; minutos: number;
  /** totais depois deste jogo */
  jogosPro: number; golsPro: number; jogosBase: number; golsBase: number; jogosNoClube: number;
  /** golaços vindos das decisões: situação/opção com resultado ótimo */
  golacos: string[];
}
export interface Ganho { conquista: string; reliquia: Reliquia }

const camisa = (chave: string, id: string, nome: string, legenda: string, d: DadosPartida, numero = d.numero): Ganho => ({
  conquista: chave,
  reliquia: { id: `rel-camisa-${id}`, chave, tipo: "camisa", nome, legenda, ano: d.ano, cores: [d.cores[0] ?? "#2E7D4F", d.cores[1] ?? "#FFFFFF"], modelo: d.padrao ?? padraoCamisa(d.clubeId), numero, clubeId: d.clubeId },
});
const bola = (chave: string, id: string, nome: string, legenda: string, d: DadosPartida): Ganho => ({
  conquista: chave,
  reliquia: { id: `rel-bola-${id}`, chave, tipo: "bola", nome, legenda, ano: d.ano, cores: coresDaBola(d.tipo === "base" ? "base" : d.ligaId ?? "BRA1", d.ano), modelo: d.tipo === "base" ? "base" : d.ligaId ?? "BRA1" },
});

const MARCAS_JOGOS = [100, 200, 300, 400, 500, 600], MARCAS_GOLS = [50, 100, 150, 200, 250, 300, 400, 500];
const GOLACOS: Record<string, [string, string]> = {
  "escanteioAtaque/bicicleta": ["bola-bicicleta", "Bola do gol de bicicleta"], "batedorEscanteio/olimpico": ["bola-olimpico", "Bola do gol olímpico"],
  "chuteMeioCampo/chutar": ["bola-meio-campo", "Bola do gol do meio de campo"], "faltaPerigosa/barreira": ["bola-falta", "Bola do primeiro gol de falta"],
  "faltaPerigosa/rasteiro": ["bola-falta", "Bola do primeiro gol de falta"], "penalti/cavadinha": ["bola-cavadinha", "Bola da cavadinha"],
};

/** O que um jogo libera. `tem` diz se uma relíquia já existe (para não repetir). */
export function reliquiasDaPartida(d: DadosPartida, tem: (id: string) => boolean): Ganho[] {
  const g: Ganho[] = [], contra = `${d.tipo === "base" ? "Sub-17 · " : ""}${d.placar} contra o ${d.adversario}`;
  const add = (x: Ganho) => { if (!tem(x.reliquia.id) && !g.some((y) => y.reliquia.id === x.reliquia.id)) g.push(x); };
  if (d.minutos <= 0) return g;
  if (d.tipo === "base") {
    if (d.jogosBase === 1) add(camisa("camisa-estreia-base", "estreia-base", "Camisa da estreia na base", `${d.clubeNome} · ${contra} · ${d.ano}`, d));
    if (d.gols > 0 && d.golsBase === d.gols) add(bola("bola-gol-base", "gol-base", "Bola do primeiro gol na base", `${contra} · ${d.ano}`, d));
  } else {
    if (d.jogosPro === 1) {
      add(camisa("camisa-estreia", "estreia", "Camisa da estreia", `${d.clubeNome} · ${contra} · ${d.ano}`, d));
      add(bola("bola-estreia", "estreia", "Bola da estreia", `${contra} · ${d.ano}`, d));
    }
    if (d.gols > 0 && d.golsPro === d.gols) {
      add(camisa("camisa-primeiro-gol", "primeiro-gol", "Camisa do primeiro gol", `${d.clubeNome} · ${contra} · ${d.ano}`, d));
      add(bola("bola-primeiro-gol", "primeiro-gol", "Bola do primeiro gol", `${contra} · ${d.ano}`, d));
    }
    if (d.jogosNoClube === 10) add(camisa("camisa-clube", `clube-${d.clubeId}`, `Camisa do ${d.clubeNome}`, `10 jogos pelo clube · ${d.ano}`, d));
    for (const m of MARCAS_JOGOS) if (d.jogosPro === m) add(camisa("camisa-jogo", `jogo-${m}`, `Camisa do jogo ${m}`, `${d.clubeNome} · ${contra} · ${d.ano}`, d, String(m)));
    for (const m of MARCAS_GOLS) if (d.golsPro >= m && d.golsPro - d.gols < m) add(bola("bola-marca", `gol-${m}`, `Bola do gol ${m}`, `${contra} · ${d.ano}`, d));
  }
  if (d.gols >= 3) add(bola("bola-hattrick", `hattrick-${d.ano}-${d.semana}`, d.gols >= 4 ? `Bola dos ${d.gols} gols` : "Bola do hat-trick", `${d.gols} gols · ${contra} · ${d.ano}`, d));
  for (const x of d.golacos) { const k = GOLACOS[x]; if (k) add(bola(k[0], k[0].slice(5), k[1], `${contra} · ${d.ano}`, d)); }
  return g;
}

export interface DadosTemporada {
  /** gols e assistências do melhor da liga entre os outros jogadores */
  maxGols?: number; maxAssist?: number;
  /** resultado da premiação da liga (comparado com todos os jogadores); sem ele, a régua sorteada de antes */
  craque?: boolean; naSelecao?: boolean; revelacao?: boolean;
  ano: number; idade: number; clubeId: string; clubeNome: string; cores: string[]; numero: string;
  padrao?: string; ligaCurto?: string; ligaId?: string;
  /** primeira temporada no clube depois de uma transferência */
  recemContratado?: boolean;
  jogos: number; gols: number; assist: number; nota: number; titulo: boolean;
  base: number; golsBase: number; notaBase: number;
  /** temporadas anteriores com 15+ jogos no profissional */
  temporadasCheias: number;
}
const trofeu = (chave: string, nome: string, legenda: string, ano: number, modelo: string, cores: [string, string]): Ganho =>
  ({ conquista: chave, reliquia: { id: `rel-trofeu-${chave.slice(7)}-${ano}`, chave, tipo: "trofeu", nome, legenda, ano, cores, modelo } });

/** Premiação do fim da temporada. Os outros jogadores da liga não são simulados um a um: a régua de cada prêmio é sorteada em volta da marca típica. */
export function premiosDaTemporada(rng: RNG, d: DadosTemporada): Ganho[] {
  const g: Ganho[] = [], liga = d.ligaCurto ?? "Série A";
  // a régua é o melhor da liga (as temporadas imaginadas dos outros); sem ela, uma marca típica sorteada
  const alvoGols = d.maxGols !== undefined ? Math.max(8, d.maxGols) : Math.max(13, Math.round(rng.normal(18, 3)));
  const alvoAssist = d.maxAssist !== undefined ? Math.max(5, d.maxAssist) : Math.max(7, Math.round(rng.normal(10, 2)));
  const ruido = (sd: number) => Math.max(-sd, Math.min(sd * 1.5, rng.normal(0, sd)));
  const alvoCraque = 7.25 + ruido(0.12), alvoSelecao = 6.95 + ruido(0.08);
  if (d.titulo) {
    g.push(trofeu("trofeu-campeao", `Taça de campeão ${d.ano}`, `${d.clubeNome} · ${liga} ${d.ano}`, d.ano, TACA_DO_TORNEIO[d.ligaId ?? ""] ?? "taca", OURO));
    g.push({ conquista: "camisa-titulo", reliquia: { id: `rel-camisa-titulo-${d.ano}`, chave: "camisa-titulo", tipo: "camisa", nome: `Camisa do título ${d.ano}`, legenda: `${d.clubeNome} campeão · ${d.ano}`, ano: d.ano, cores: [d.cores[0] ?? "#2E7D4F", d.cores[1] ?? "#FFFFFF"], modelo: d.padrao ?? padraoCamisa(d.clubeId), numero: d.numero, clubeId: d.clubeId } });
  }
  if (d.jogos >= 15 && d.gols >= alvoGols) g.push(trofeu("trofeu-artilheiro", `Artilheiro ${d.ano}`, `${d.gols} gols · ${liga} ${d.ano}`, d.ano, "chuteira", OURO));
  if (d.jogos >= 15 && d.assist >= alvoAssist) g.push(trofeu("trofeu-garcom", `Rei das assistências ${d.ano}`, `${d.assist} assistências · ${liga} ${d.ano}`, d.ano, "prato", OURO));
  if (d.craque ?? (d.jogos >= 25 && d.nota >= alvoCraque)) g.push(trofeu("trofeu-craque", `Craque do campeonato ${d.ano}`, `Nota média ${d.nota.toFixed(2)} · ${liga} ${d.ano}`, d.ano, "bola", OURO));
  if (d.naSelecao ?? (d.jogos >= 22 && d.nota >= alvoSelecao)) g.push(trofeu("trofeu-selecao", `Seleção do campeonato ${d.ano}`, `${liga} ${d.ano}`, d.ano, "placa", OURO));
  if (d.revelacao ?? (d.idade <= 21 && d.jogos >= 15 && d.nota >= 6.75 && d.temporadasCheias === 0)) g.push(trofeu("trofeu-revelacao", `Revelação ${d.ano}`, `${d.idade} anos · ${liga} ${d.ano}`, d.ano, "estrela", OURO));
  if (d.idade <= 21 && d.jogos >= 18 && d.nota >= 7.0 + ruido(0.08)) g.push(trofeu("trofeu-sub21", `Melhor sub-21 ${d.ano}`, `${liga} ${d.ano}`, d.ano, "estrela", PRATA));
  if (d.recemContratado && d.jogos >= 20 && d.nota >= 6.9 + ruido(0.08)) g.push(trofeu("trofeu-contratacao", `Melhor contratação ${d.ano}`, `${d.clubeNome} · ${liga} ${d.ano}`, d.ano, "placa", PRATA));
  if (d.base >= 15 && d.golsBase >= Math.max(12, Math.round(rng.normal(17, 3)))) g.push(trofeu("trofeu-artilheiro-base", `Artilheiro do sub-17 ${d.ano}`, `${d.golsBase} gols · Sub-17 ${d.ano}`, d.ano, "chuteira", PRATA));
  if (d.base >= 20 && d.notaBase >= 7.45 + Math.max(-0.1, Math.min(0.15, rng.normal(0, 0.1)))) g.push(trofeu("trofeu-craque-base", `Craque do sub-17 ${d.ano}`, `Nota média ${d.notaBase.toFixed(2)} · Sub-17 ${d.ano}`, d.ano, "bola", PRATA));
  return g;
}
