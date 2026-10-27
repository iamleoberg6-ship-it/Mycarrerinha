// A carreira jogável, semana a semana. Tudo que o jogo precisa guardar fica num Save (JSON).
// Cada sorteio usa uma semente derivada do save + semana, então recarregar a página não muda resultados.
import { RNG, clamp } from "./rng.js";
import { ATRIBUTOS, ovr as calcOvr, evoluirSemana, type Atributo, type Atributos, type Grupo, type Intensidade, type Participacao, type Posicao } from "./atributos.js";
import { simularPlacar, desempenhoJogador, sortearLesao, pontuacaoTitular, VAGAS_433 } from "./partida.js";
import { ligaDoPacote, rodadasDaLiga, novaTabela, registrar, ordenar, type Clube, type Liga, type LinhaTabela, type PacoteDados } from "./liga.js";
import { salarioMensal, AGENTES, type TipoAgente } from "./mercado.js";
import type { PersonalidadeDNA, ResultadoCriacao, TracoId } from "./dna.js";
import { definirPerfil, type Efeitos as EfeitosPerfil } from "./perfil.js";
import { SITUACAO, COMEMORACAO, POS_JOGO, MEMORIA_RECENTE, contextoPadrao, escolherSituacao, montarDecisao, resolverEfeito, habilidade, sortearNivel, notaEsperada, type Contexto, type Efeito, type Memoria, type Nivel } from "./lances.js";
import { bonusDoTecnico, chanceDeDemissao, NOME_ESTILO, type Tecnico } from "./tecnicos.js";
import { tecnicoDoClube, tecnicoLivrePara, trocasDeTecnico, lesionadosDoClube, lesoesQueComecam } from "./mundo.js";
import { recordesDoClube, recordesDaSelecao, recordeDaLiga, comJogador, type Lenda } from "./recordes.js";
import { premiosDoAno, type PremiosDoAno, type IdPremio } from "./premios-mundo.js";
import { candidatosDoAno, naSelecao, type Candidato } from "./mundo.js";
import { mundo, infoClube, idClube, ligaDoClube, sincronizarMundo, viradaAtual, baseDoClube, ondeJoga, versaoMundo, nivelDaBase, rankingDaLiga, janelaDoMeioAtual, idSelecao, temSelecao, selecaoDe, todasSelecoes, notasDaRodada, selecaoDaRodada, selecaoDoMes, premiosDaLiga, type Selecionado, type PremiosLiga } from "./mundo.js";
import { forcaDoElenco, type JogadorNPC } from "./liga.js";
import { LIGA_DA_BASE, type PaisId } from "./dna.js";
import { ehTorneioContinental, ehFinalissima, ehDeSelecao, TORNEIO_DA_CONF, type TorneioId } from "./copas.js";
import { COPAS, ehEstadual, ehMundial, ehCopaDoMundo, SEMANAS_SEL, confederacao, ordemFinal, ufDoClube, forcaNoEstadual, classificados, novaCopa, rodarSemana, jogoDoClubeNaSemana, copaDoClube, rotuloJogo, idaDe, regiaoNaCopa, NOME_FASE, type CopaId, type EstadoCopa, type JogoCopa } from "./copas.js";
import { infoLiga, DA_CIDADE, NA_CIDADE } from "./ligas.js";
import { familiaridadeInicial, penalidade, ganhoSemanal, sugestaoDoTecnico, PODE_JOGAR, type Familiaridade } from "./posicoes.js";
import { estrelas, relacoesDe, relacao, semanaRelacoes, subir, atencao, chanceCamisa, chanceIndicacao, podeAgir, rotuloNivel, type EstadoRelacoes, type AcaoRel } from "./relacoes.js";
import { estatisticasEstimadas, totaisDaCarreira, type EstatEstimada } from "./perfil-jogador.js";
import { TATUAGEM, custoRemocao, visualDe, NOME_AREA, noArea, VISUAL_PADRAO, type Visual, type AreaTatuagem, type Fisico } from "./visual.js";
import { MARCA, ofertasDaMarca, marcaInteressada, bonusDoMes, type ContratoPatrocinio, type PropostaPatrocinio, type TipoContrato } from "./marcas.js";
import { EVENTO, fasesDe, sortearEvento, preencher, dinheiroDoEfeito, patrocinioDoEfeito, type CtxEvento, type EfeitoEvento } from "./eventos.js";
import { alvoSeguidores, famaDeReferencia, efeitosVida, gastosDoMes, imposto, semanaRedes, visibilidade, PADRAO_INICIAL, type PadraoVida } from "./vida.js";
import { bonusJovem, chanceSubir, culturaBase, NOME_CULTURA, type Cultura } from "./identidade.js";
import { semanaDoMercado, propostaPorIndicacao, janelaAberta, fimDaTemporadaNoMercado, contratoVencido, decidirAutomatico, type DadosMercado } from "./transferencias.js";
import { gradeDeNumeros, numeroLivre, numeroParaChegada, limparNumeros, type Camisa } from "./numeros.js";
import { semanaDoCaminho, fimDeTemporadaDoCaminho, decidirCaminhoAutomatico, caminhoDe, faseAmadora, IDADE_INICIAL, FASE_INICIAL, CAMINHOS, type Caminho, type Fase, type EstadoCaminho } from "./caminhos.js";
import { elencoDe, nomesDaPartida, narrarGol, narrarPartida, type LinhaNarracao } from "./narracao.js";
import { reliquiasDaPartida, premiosDaTemporada, type Ganho } from "./reliquias.js";
import { gerarFamilia, semanaFamilia, temporadaFamilia, agirFamilia, familiaAutomatica, membro, paiTreinador, riscoLesaoFamilia, type EstadoFamilia, type AcaoFamilia, type CtxFamilia, type EscolhaFamilia } from "./familia.js";
import { agirFilho, type AcaoFilho } from "./namoro.js";
import { novoNamoro, baralhoDaSemana, curtir, agirNamoro, efeitosNamoro, semanaNamoro, temporadaNamoro, namoroAutomatico, type EstadoNamoro, type AcaoNamoro, type CtxNamoro } from "./namoro.js";
import { ganharReliquia, novoEstado, fecharMes, manutencaoMensal, efeitosDaCasa, alojamentosDoClube, estruturaDoClube, ESTRUTURAS, IMOVEL, nomeImovel, type EstadoCasa, type ClubeCasa } from "./casa.js";

// ------------------------------------------------------------------ tipos
export interface Jogador {
  nome: string; apelido: string; posicao: Posicao; pais: string; nacionalidade: string; idade: number;
  at: Atributos; pot: number; faixaPot: [number, number]; personalidade: PersonalidadeDNA; tracos: TracoId[];
  perfilId: string; perfilNome: string; aparencia: unknown; numero: string; familia: string;
  /** corpo inteiro: físico, uniforme, roupa do dia a dia e tatuagens */
  visual?: Visual; alturaCm?: number; pe?: string;
  /** quanto domina cada posição (0–100; a natural começa em 100) */
  familiaridade?: Familiaridade;
}
export interface Stats { jogos: number; titular: number; gols: number; assist: number; notas: number[]; base: number; baseGols: number; baseNotas?: number[];
  /** melhor em campo, seleção da rodada e do mês (na temporada) */
  mvp?: number; selRodada?: number; selMes?: number }
/** Campanha numa copa continental (na temporada). */
export interface CampanhaCopa { id: CopaId; nome: string; fase: string; campeao: boolean; jogos: number; gols: number; assist: number }
export interface ResumoTemporada { /** passagem de meia temporada (trocou de clube no meio do ano) */ parcial?: boolean; extras?: CampanhaCopa[]; mvp?: number; selRodada?: number; selMes?: number; copa?: CampanhaCopa; estadual?: CampanhaCopa; fase?: Fase; ano: number; idade: number; clube: string; clubeId?: string; liga?: string; est?: EstatEstimada; ovr: number; jogos: number; gols: number; assist: number; nota: number; posicao: number; titulo: boolean; base: number; baseGols?: number; premios?: string[] }
/** Dados da imagem da notícia (o desenho é feito na tela, a partir destes ids). */
export type ImgNoticia = { k: "placar"; casa: string; fora: string; gc: number; gf: number } | { k: "transferencia"; clube: string; tipo: string; ate: number; taxa: number } | { k: "patrocinio"; marca: string } | { k: "trofeu" } | { k: "vida" } | { k: "tatuagem" } | { k: "capa"; edicao: number; clube: string; regional?: boolean };
export interface Noticia { semana: string; titulo: string; texto: string; tipo: "jogo" | "clube" | "vida" | "dinheiro" | "polemica" | "lesao"; img?: ImgNoticia }
export interface Carreira {
  clubeId: string; salario: number; anosContrato: number; formacao: boolean; agente: TipoAgente;
  moral: number; fama: number; seguidores: number; cansaco: number; lesao: number; relTecnico: number; formaUlt: number[];
  suspensao?: number;
  /** temporada cuja janela do meio do ano (dos outros clubes) já virou notícia */
  meioNoticiado?: number;
  /** copas continentais da temporada, suspensão na copa, estatísticas na copa, tabela final da temporada passada (vagas)
   *  e o jogo de quarta já jogado nesta semana (entra no resumo da semana) */
  copas?: Partial<Record<CopaId, EstadoCopa>>; suspensaoCopa?: number; statsCopa?: { jogos: number; gols: number; assist: number; notas: number[] };
  /** estadual da temporada (fica em `copas`): suspensão e estatísticas separadas das da copa continental */
  /** nota, gols e assistências do jogador em cada rodada da liga (para a seleção da rodada e do mês) */
  notasRodada?: Record<number, { nota: number; gols: number; assist: number }>;
  /** seleção nacional: jogos, gols e assistências na carreira, convocações, estreia, Copas do Mundo e convocação de cada data */
  selecao?: { jogos: number; gols: number; assist: number; convocacoes: number; estreia?: number; copas: { ano: number; fase: string; jogos: number; gols: number; campeao: boolean; id?: CopaId }[]; conv: Record<string, boolean>; naTorneio?: Partial<Record<CopaId, { jogos: number; gols: number; assist: number }>>; naCopa?: { jogos: number; gols: number; assist: number } };
  /** o que ficou das copas de cada temporada (Intercontinental e Mundial usam) */
  palmares?: Record<number, Palmares>;
  /** estatísticas na Intercontinental e no Mundial */
  statsExtra?: Partial<Record<CopaId, { jogos: number; gols: number; assist: number; notas: number[] }>>;
  /** prêmios da liga na última temporada terminada (craque, seleção, artilheiro...) */
  premiosLiga?: PremiosLiga;
  /** prêmios do mundo da temporada passada (Bola de Ouro, Melhor da Europa, Rei da América...) */
  premiosMundo?: PremiosDoAno;
  /** vencedores de cada prêmio do mundo, ano a ano */
  galeriaPremios?: Partial<Record<IdPremio, { ano: number; nome: string; clubeId: string; nacionalidade: string; eu?: boolean }[]>>;
  suspensaoEstadual?: number; statsEstadual?: { jogos: number; gols: number; assist: number; notas: number[] };
  tabelaAnterior?: { ligaId: string; ordem: string[] }; avisosCopa?: Record<string, string>; meioSemana?: { semana: number; resumo: ResumoPartida; participacao: Participacao; nota: number; eventos: string[] };
  /** liga do clube atual (saves antigos: Série A) */
  ligaId?: string;
  /** propostas, empréstimo, histórico de transferências, agente */
  mercado?: DadosMercado;
  /** lances já vividos: os recentes aparecem menos, os inéditos mais */
  memoria?: Memoria;
  /** temporada em que chegou ao clube atual por transferência (prêmio de melhor contratação) */
  chegadaClube?: number;
  /** jogos como profissional por clube (camisa de cada clube) */
  jogosPorClube?: Record<string, number>;
  /** redes sociais: quanto posta (0–100) e repercussão recente de lances (decai) */
  engajamento?: number; hype?: number;
  /** padrão de vida escolhido (alimentação, carro, lazer, família) */
  padrao?: PadraoVida;
  /** evento fora de campo esperando decisão, e a temporada em que cada evento apareceu */
  evento?: string; eventosVistos?: Record<string, number>;
  /** reputação com a torcida do clube atual (0–100) */
  torcida?: number;
  /** relacionamento com outros jogadores */
  relacoes?: EstadoRelacoes;
  /** pai, mãe e irmãos (sorteados na primeira semana, ou como escolhido na criação) e o app de namoro */
  familia?: EstadoFamilia; namoro?: EstadoNamoro; escolhaFamilia?: EscolhaFamilia;
  /** fase amadora ou de academia (várzea, academia nos EUA, high school, universidade) e os convites do caminho */
  fase?: Fase; caminho?: EstadoCaminho;
  /** escolha do número pendente (começo de temporada ou chegada a um clube) e quem saiu do clube nesta temporada */
  escolhaNumero?: "temporada" | "chegada"; saidas?: { clubeId: string; temporada: number; nomes: string[] };
  /** treino de posição em andamento e sugestão do técnico */
  treinoPosicao?: Posicao; sugestaoPos?: { pos: Posicao; aceita?: boolean };
  /** maior reputação que teve com a torcida de cada clube */
  torcidaMax?: Record<string, number>;
  /** melhor posição já anunciada em cada lista de recordes (chave: clube-gols-FLA, sel-jogos, liga-BRA1-3...) */
  recordes?: Record<string, number>;
  /** técnico do clube do jogador (decidido pelos resultados reais) e de qual clube ele é */
  tecnico?: Tecnico; tecnicoClube?: string;
  /** pontos do clube nos últimos jogos da liga (3, 1, 0) e temporada da última troca de técnico no meio do ano */
  resultadosClube?: number[]; tecnicoTroca?: number;
  /** tabela do campeonato da base (categoria do jogador) */
  tabelaBase?: { cat: string; t: number; tabela: LinhaTabela[] };
  /** capas de videogame (edição, clube e se foi a edição do país) */
  capas?: { edicao: number; clube: string; regional: boolean }[];
  /** aposentadoria anunciada (vale no fim desta temporada) */
  aposentadoria?: { temporada: number };
  /** carreira encerrada: a despedida */
  encerrada?: Despedida;
  /** patrocinadores: contratos ativos, proposta na mesa, marcas recusadas na temporada e números do mês para os bônus */
  patrocinios?: ContratoPatrocinio[]; propPatrocinio?: PropostaPatrocinio; recusadas?: string[]; mesStats?: { gols: number; assist: number; notas8: number };
  bonusEvolucao: number; patrocinioMensal: number; mesesPatrocinio: number; pressao: number; vidaNoturna: number; exposicao: number;
  temporada: number; semana: number; ordem: string[]; tabela: LinhaTabela[]; stats: Stats; historico: ResumoTemporada[];
}
export interface Save { versao: 1; semente: string; jogador: Jogador; carreira: Carreira; casa: EstadoCasa; noticias: Noticia[] }

export const ANO_INICIAL = 2026;
export const SEMANAS_PRE = 2, RODADAS = 38, SEMANAS_TEMPORADA = SEMANAS_PRE + RODADAS;
const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// ------------------------------------------------------------------ mundo (liga e clubes)
/** Clássicos entre cidades diferentes (os da mesma cidade já contam sozinhos). */
const CLASSICOS_EXTRA: Record<string, true> = { "PAL-SAN": true, "COR-SAN": true, "SAN-SPA": true };
let ligaCache: { pacote: PacoteDados; liga: Liga } | undefined;
/** A Série A (início de carreira e ofertas da base). */
export function liga(pacote: PacoteDados): Liga {
  if (!ligaCache || ligaCache.pacote !== pacote) ligaCache = { pacote, liga: mundo(pacote).liga.BRA1 };
  return ligaCache.liga;
}
/** A liga em que o jogador está agora. */
export const ligaAtual = (pacote: PacoteDados, s: Save): Liga => mundo(pacote).liga[infoLiga(s.carreira.ligaId).id];
/** Saves de antes das ligas reais: clubes e ligas antigas viram os equivalentes atuais. Devolve true se mudou algo. */
export function migrarSave(pacote: PacoteDados, s: Save): boolean {
  const c = s.carreira, w = mundo(pacote);
  if (w.clube[c.clubeId]) sincronizar(pacote, s);
  const existe = (id: string) => !!w.clube[id];
  if (existe(c.clubeId) && (c.ligaId ?? "BRA1") === w.info[c.clubeId].ligaId && c.ordem.every(existe)) return false;
  c.clubeId = idClube(c.clubeId);
  if (!existe(c.clubeId)) c.clubeId = "FLA";
  c.ligaId = w.info[c.clubeId].ligaId;
  const l = w.liga[c.ligaId];
  if (c.ordem.length !== l.clubes.length || !c.ordem.every((id) => existe(idClube(id)) && w.info[idClube(id)].ligaId === c.ligaId)) {
    c.ordem = l.clubes.map((x) => x.id);
    c.tabela = novaTabela(l);
  } else {
    c.ordem = c.ordem.map(idClube);
    for (const t of c.tabela) t.clube = idClube(t.clube);
  }
  const m = c.mercado;
  if (m) {
    m.propostas = m.propostas.filter((p) => existe(idClube(p.clubeId))).map((p) => ({ ...p, clubeId: idClube(p.clubeId), ligaId: w.info[idClube(p.clubeId)].ligaId }));
    for (const t of m.transferencias) { t.de = idClube(t.de); t.para = idClube(t.para); }
    if (m.emprestimo) {
      m.emprestimo.origem = idClube(m.emprestimo.origem);
      if (!existe(m.emprestimo.origem)) m.emprestimo = undefined;
      else { const lo = w.liga[w.info[m.emprestimo.origem].ligaId]; m.emprestimo.ligaOrigem = lo.id; m.emprestimo.ordemOrigem = lo.clubes.map((x) => x.id); }
    }
  }
  if (c.jogosPorClube) c.jogosPorClube = Object.fromEntries(Object.entries(c.jogosPorClube).map(([k, v]) => [idClube(k), v]));
  s.casa.clube = clubeCasa(pacote, c.clubeId);
  return true;
}
export const nRodadas = (c: Carreira) => rodadasDaLiga(c.ordem.length).length;
export const clubeDe = (l: Liga, id: string) => l.clubes.find((c) => c.id === id)!;
export function clubeCasa(pacote: PacoteDados, id: string): ClubeCasa {
  const c = infoClube(pacote, id);
  return { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, forca: c.forca };
}
const rngDe = (s: Save, ...partes: (string | number)[]) => new RNG(`${s.semente}|${s.carreira.temporada}|${s.carreira.semana}|${partes.join("|")}`);
export const familiaridadeDe = (j: Jogador): Familiaridade => (j.familiaridade ??= familiaridadeInicial(j.posicao));
/** OVR na posição em que joga, com desconto se ainda não domina a posição. */
export const ovr = (j: Jogador) => calcOvr(j.at, j.posicao) - penalidade(familiaridadeDe(j)[j.posicao] ?? 100);
export const ovrEm = (j: Jogador, p: Posicao) => calcOvr(j.at, p) - penalidade(familiaridadeDe(j)[p] ?? 0);
/** Põe o mundo na temporada da carreira (o mundo envelhece, evolui e troca de clube a cada temporada) e acerta o que
 *  o save guarda dele: amigos que mudaram de clube ou se aposentaram e a camisa do jogador. */
export function sincronizar(pacote: PacoteDados, s: Save) {
  const antes = versaoMundo();
  sincronizarMundo(pacote, s.semente, s.carreira.temporada, s.carreira.semana);
  const c = s.carreira;
  if (c.tecnicoClube !== c.clubeId && !c.fase) {
    const t = tecnicoDoClube(pacote, idClube(c.clubeId));
    c.tecnico = t ? { ...t } : tecnicoLivrePara(pacote, idClube(c.clubeId), `${c.temporada}-chegada`); c.tecnicoClube = c.clubeId; c.resultadosClube = [];
  }
  if (versaoMundo() === antes) return;
  // fechou a janela do meio do ano: as notícias saem uma vez
  const meio = janelaDoMeioAtual(pacote);
  if (meio && c.meioNoticiado !== c.temporada) { c.meioNoticiado = c.temporada; noticiasDaVirada(pacote, s, meio, "meio"); }
  for (const x of Object.values(c.relacoes?.lista ?? {})) {
    const o = ondeJoga(pacote, x.nome);
    if (o) { x.clubeId = o.clubeId; x.aposentado = undefined; } else if (!x.aposentado && mundo(pacote).info[x.clubeId] && !x.nome.startsWith("Camisa")) x.aposentado = true;
  }
  // ninguém que chegou ao clube fica com a camisa do jogador
  const clube = mundo(pacote).clube[idClube(c.clubeId)], meu = +s.jogador.numero;
  if (clube && escolheNumero(c) && meu) {
    const dono = clube.elenco.find((j) => j.numero === meu);
    if (dono) { dono.numero = numeroParaChegada(clube, dono.posicao, dono.nome, [meu, ...clube.elenco.map((j) => j.numero ?? 0)]); limparNumeros(); }
  }
}
/** Quem saiu do clube atual na virada para esta temporada (libera o número e a vaga). */
export function saidasAtuais(pacote: PacoteDados, s: Save): string[] {
  return saidasComNumero(pacote, s).map((x) => x.nome);
}
function saidasComNumero(pacote: PacoteDados, s: Save) {
  sincronizar(pacote, s);
  return s.carreira.temporada > 0 ? viradaAtual(pacote).saidas[idClube(s.carreira.clubeId)] ?? [] : [];
}
/** Elenco do clube atual (o do mundo nesta temporada). */
export function elencoAtual(pacote: PacoteDados, s: Save) {
  sincronizar(pacote, s);
  return mundo(pacote).clube[idClube(s.carreira.clubeId)].elenco;
}
/** O elenco do clube sem quem está fora por lesão grave nesta rodada. */
export function elencoDisponivel(pacote: PacoteDados, s: Save, clubeId = s.carreira.clubeId) {
  sincronizar(pacote, s);
  const fora = lesionadosDoClube(pacote, idClube(clubeId), s.carreira.semana - SEMANAS_PRE), el = mundo(pacote).clube[idClube(clubeId)]?.elenco ?? [];
  return fora.size ? el.filter((x) => !fora.has(x.nome)) : el;
}
/** O time da base do clube na categoria do jogador (sub-17 até 17 anos; sub-20 depois). */
export function timeDaBase(pacote: PacoteDados, clubeId: string, idade: number): JogadorNPC[] {
  const b = baseDoClube(pacote, clubeId), cat = idade <= 17 ? b.filter((j) => j.idade <= 17) : b.filter((j) => j.idade >= 17);
  return cat.length >= 11 ? cat : b;
}
export function gradeDoClube(pacote: PacoteDados, s: Save): Camisa[] {
  return gradeDeNumeros(mundo(pacote).clube[idClube(s.carreira.clubeId)], saidasComNumero(pacote, s), s.jogador.numero);
}
/** Pode escolher número: profissional ou na várzea/colégio/universidade (na base, o número é o da base). */
export const escolheNumero = (c: Carreira) => !c.formacao || faseAmadora(c);
export function escolherNumero(pacote: PacoteDados, s: Save, n: number): { ok: boolean; msg: string } {
  const g = gradeDoClube(pacote, s), j = s.jogador, c = s.carreira;
  if (String(n) !== j.numero && !numeroLivre(g, n)) return { ok: false, msg: `A ${n} já tem dono: ${g[n - 1]?.dono}.` };
  const antes = j.numero;
  j.numero = String(n); c.escolhaNumero = undefined;
  if (antes !== j.numero) noticia(s, "clube", `${j.apelido} com a ${n}`, `${j.apelido} vai usar a camisa ${n} no ${infoClube(pacote, c.clubeId).nome}${g[n - 1]?.liberado ? ", que ficou livre com uma saída do elenco" : ""}.`);
  return { ok: true, msg: antes === j.numero ? `Segue com a ${n}.` : `Agora você é o camisa ${n}.` };
}
/** Escolha automática: mantém o número se estiver livre; senão, o primeiro livre que combina com a posição. */
function numeroAutomatico(pacote: PacoteDados, s: Save) {
  const g = gradeDoClube(pacote, s), atual = +s.jogador.numero;
  const pref = ({ ZAG: [4, 3, 14], LAT: [2, 6, 13], VOL: [5, 8, 15], MEI: [10, 8, 20], PON: [7, 11, 17], ATA: [9, 19, 29] } as Record<string, number[]>)[s.jogador.posicao] ?? [];
  const n = numeroLivre(g, atual) ? atual : [...pref, ...g.map((x) => x.numero)].find((x) => numeroLivre(g, x)) ?? atual;
  escolherNumero(pacote, s, n);
}
export const forma = (c: Carreira) => (c.formaUlt.length ? c.formaUlt.reduce((a, b) => a + b, 0) / c.formaUlt.length : 6.5);

// ------------------------------------------------------------------ início
export interface DadosCriacao { resultado: ResultadoCriacao; aparencia: unknown; clube: string | null; perfil?: string; decisao?: string | null; caminho?: Caminho; cidade?: string; parentes?: EscolhaFamilia }
export interface OfertaBase { clubeId: string; nome: string; apelido: string; cores: string[]; forca: number; estrutura: number; nomeEstrutura: string; moradia: string; fila: number; texto: string; cultura: Cultura; nomeCultura: string }

/** Três clubes oferecem vaga na base. Promessa de clube grande recebe convites dos grandes; os outros, de clubes menores. */
/** Liga onde a carreira começa na base: a primeira divisão do país do jogador (ou de para onde a família foi). */
export function ligaDaBase(pacote: PacoteDados, pais: string): Liga {
  const id = LIGA_DA_BASE[pais as PaisId], w = mundo(pacote);
  return id && id !== "BRA1" && w.liga[id] ? w.liga[id] : liga(pacote);
}
export function ofertasDeBase(pacote: PacoteDados, d: DadosCriacao): OfertaBase[] {
  const l = ligaDaBase(pacote, d.resultado.escolhas.pais), perfil = definirPerfil(d.resultado), rng = new RNG(`ofertas|${d.resultado.escolhas.nome}|${d.resultado.potencial}`);
  const min = perfil.efeitos.forcaMinimaClubeInicial;
  let pool: Clube[];
  if (l.id === liga(pacote).id) {
    const casas = (pacote.clubes as unknown as { id: string; forca: number }[]);
    const forcaPacote = (id: string) => casas.find((c) => c.id === id)!.forca;
    pool = l.clubes.filter((c) => (min ? forcaPacote(c.id) >= min : forcaPacote(c.id) <= 72));
  } else {
    // fora do Brasil: promessa de clube grande vai para o terço de cima da liga; os outros, para os três quartos de baixo
    const ord = [...l.clubes].sort((a, b) => b.forca - a.forca);
    pool = min ? ord.slice(0, Math.max(3, Math.ceil(ord.length / 3))) : ord.slice(Math.floor(ord.length / 4));
  }
  if (pool.length < 3) pool = [...l.clubes];
  const escolhidos: Clube[] = [];
  const coracao = l.clubes.find((c) => c.id === d.clube);
  if (coracao && pool.includes(coracao)) escolhidos.push(coracao);
  while (escolhidos.length < 3) { const c = rng.pick(pool); if (!escolhidos.includes(c)) escolhidos.push(c); }
  return escolhidos.map((c) => {
    const cc = clubeCasa(pacote, c.id), est = estruturaDoClube(cc), alojId = alojamentosDoClube(cc)[0], aloj = { nome: nomeImovel(novoEstado(0, alojId, cc), IMOVEL[alojId]) };
    const fila = c.elenco.filter((j) => j.posicao === d.resultado.escolhas.posicao).length;
    const cult = culturaBase(c.id);
    const estrutura = est >= 4 ? "Estrutura de primeiro mundo" : est === 1 ? "Clube pobre, moradia apertada" : est === 2 ? "Clube modesto, pouco conforto" : "Clube organizado";
    const base = cult >= 5 ? "e aqui se vive de revelar garotos: a chance chega cedo." : cult === 4 ? "e aqui se gosta de lançar jovens." : cult <= 2 ? "mas aqui se prefere contratar pronto: subir vai exigir muito." : est >= 4 ? "mas a fila para subir é longa." : "e quem estiver melhor joga.";
    const texto = (c.id === d.clube ? "O clube do seu coração abriu as portas. " : "") + `${estrutura}, ${base}`;
    return { clubeId: c.id, nome: c.nome, apelido: cc.apelido, cores: cc.cores, forca: Math.round(cc.forca), estrutura: est, nomeEstrutura: ESTRUTURAS[est], moradia: aloj.nome, fila, texto, cultura: cult, nomeCultura: NOME_CULTURA[cult] };
  });
}

/** Ofertas de início para cada caminho: base (Série A), várzea da cidade, academia da liga americana ou colégio nos EUA. */
export function ofertasDoCaminho(pacote: PacoteDados, d: DadosCriacao, caminho: Caminho, cidade = "SP"): OfertaBase[] {
  if (caminho === "base") return ofertasDeBase(pacote, d);
  const w = mundo(pacote), r = d.resultado, rng = new RNG(`ofertas|${caminho}|${cidade}|${r.escolhas.nome}|${r.potencial}`);
  const ligaId = caminho === "varzea" ? `VAR-${cidade}` : caminho === "eua_academia" ? "USA1" : "USA-HS";
  const pool = w.liga[ligaId].clubes.filter((c) => !["US-TOR", "US-VAN", "US-MTL"].includes(c.id)); // academia nos EUA (sem os clubes do Canadá)
  const escolhidos: Clube[] = [];
  while (escolhidos.length < 3 && pool.length) escolhidos.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]);
  return escolhidos.map((c) => {
    const cc = clubeCasa(pacote, c.id), info = w.info[c.id];
    const fila = c.elenco.filter((j) => j.posicao === r.escolhas.posicao).length;
    const texto = caminho === "varzea" ? `Time de bairro ${NA_CIDADE[cidade]}. Terrão, marmanjo e olheiro na beira do campo de vez em quando. Você mora com a família.`
      : caminho === "eua_academia" ? `A família se muda para ${info.cidade}. Academia de clube da liga americana: quem se destaca assina contrato homegrown já aos 15.`
      : `Colégio em Miami, com time de futebol e aulas em inglês. Depois, bolsa numa universidade e o draft.`;
    return { clubeId: c.id, nome: c.nome, apelido: cc.apelido, cores: cc.cores, forca: Math.round(c.forca), estrutura: caminho === "eua_academia" ? 4 : caminho === "eua_escola" ? 3 : 1,
      nomeEstrutura: caminho === "varzea" ? "Campo de terra" : caminho === "eua_academia" ? "Academia profissional" : "Estrutura de colégio americano",
      moradia: caminho === "varzea" ? "Casa dos pais" : caminho === "eua_academia" ? `Casa da família em ${info.cidade}` : "Casa de família anfitriã",
      fila, texto, cultura: 3 as Cultura, nomeCultura: caminho === "varzea" ? "Time de bairro" : caminho === "eua_academia" ? "Academia" : "Colégio" };
  });
}

export function novoJogo(pacote: PacoteDados, d: DadosCriacao, clubeId: string, sementeFixa?: string): Save {
  const r = d.resultado, e = r.escolhas, perfil = definirPerfil(r);
  const ef: EfeitosPerfil = { ...perfil.efeitos };
  const dec = perfil.evento?.opcoes.find((o) => o.id === d.decisao);
  if (dec) for (const [k, v] of Object.entries(dec.efeitos)) {
    const chave = k as keyof EfeitosPerfil;
    if (typeof v === "number") (ef as Record<string, unknown>)[chave] = ((ef[chave] as number | undefined) ?? 0) + v; else (ef as Record<string, unknown>)[chave] = v;
  }
  const pers = { ...r.personalidade, profissionalismo: clamp(r.personalidade.profissionalismo + (ef.profissionalismo ?? 0), 1, 20) };
  const semente = sementeFixa ?? `${e.nome}|${r.potencial}|${Date.now() % 100000}`;
  const caminho: Caminho = d.caminho ?? "base", fase = FASE_INICIAL[caminho];
  const l = caminho === "base" ? (liga(pacote).clubes.some((x) => x.id === clubeId) ? liga(pacote) : ligaDoClube(pacote, clubeId)) : ligaDoClube(pacote, clubeId), rng = new RNG(semente);
  const jogador: Jogador = {
    nome: e.nome, apelido: e.apelido || e.nome.split(" ")[0], posicao: e.posicao, pais: e.pais, nacionalidade: r.nacionalidade, idade: IDADE_INICIAL[caminho],
    at: { ...r.atributos }, pot: r.potencial, faixaPot: r.faixaPotencial, personalidade: pers, tracos: r.tracos, perfilId: perfil.id, perfilNome: perfil.nome,
    aparencia: d.aparencia, numero: String(rng.int(26, 49)), familia: e.familia,
    alturaCm: e.alturaCm, pe: e.pe, visual: { ...VISUAL_PADRAO, tatuagens: {}, fisico: fisicoInicial(r.atributos) },
  };
  // quem começa antes dos 16 ainda tem uns anos de desenvolvimento pela frente
  const anosAntes = 16 - jogador.idade;
  if (anosAntes > 0) for (const k of ATRIBUTOS) jogador.at[k] = clamp(Math.round(jogador.at[k] - 2.2 * anosAntes), 15, 99);
  const ordem = l.clubes.map((c) => c.id);
  for (let i = ordem.length - 1; i > 0; i--) { const j = rng.int(0, i); [ordem[i], ordem[j]] = [ordem[j], ordem[i]]; }
  const fama = ef.fama ?? 0;
  const carreira: Carreira = {
    clubeId, salario: fase ? 0 : 3000, anosContrato: fase ? 4 : 2, formacao: true, agente: ef.agente ?? "pai",
    ...(caminho === "base" ? (l.id === liga(pacote).id ? {} : { ligaId: l.id }) : { ligaId: l.id, fase, ...(fase !== "academia" ? { escolhaNumero: "chegada" as const } : {}), caminho: { convites: [], seq: 0, temporadasFase: 0, cidade: d.cidade } }),
    moral: 62, fama, seguidores: Math.round((ef.seguidores ?? 0) + 300), cansaco: 0, lesao: 0, relTecnico: clamp(50 + (ef.relTecnico ?? 0), 0, 100), formaUlt: [],
    bonusEvolucao: ef.bonusEvolucao ?? 0, patrocinioMensal: ef.patrocinioMensal ?? 0, mesesPatrocinio: ef.mesesPatrocinio ?? 0, pressao: ef.pressao ?? 0,
    vidaNoturna: r.vidaNoturnaInicial + (ef.vidaNoturna ?? 0), exposicao: ef.exposicao ?? 0,
    temporada: 0, semana: 0, ordem, tabela: novaTabela(l), stats: statsVazias(), historico: [],
    ...(d.parentes && (d.parentes.pai !== "sortear" || d.parentes.irmaos !== "sortear") ? { escolhaFamilia: d.parentes } : {}),
  };
  const cc = clubeCasa(pacote, clubeId);
  const casa = novoEstado(r.dinheiroInicial, fase ? "aloj-familia" : alojamentosDoClube(cc)[0], cc);
  const save: Save = { versao: 1, semente, jogador, carreira, casa, noticias: [] };
  const c = clubeDe(l, clubeId);
  if (!fase) noticia(save, "clube", `Bem-vindo ao ${c.nome}`, `${jogador.apelido} assina com a base do ${c.nome}. Mora em: ${nomeImovel(casa, IMOVEL[casa.imovel])}. Ajuda de custo de R$ 3.000 por mês.`);
  else noticia(save, "clube", fase === "varzea" ? `${jogador.apelido} no ${c.nome}` : fase === "academia" ? `De mudança para os EUA` : `Primeiro dia no colégio`,
    fase === "varzea" ? `Aos ${jogador.idade} anos, ${jogador.apelido} começa no ${c.nome}, na várzea ${DA_CIDADE[d.cidade ?? "SP"]}. Sem salário: a família banca. Jogando bem, aparece olheiro.`
    : fase === "academia" ? `A família de ${jogador.apelido} se muda para ${infoClube(pacote, clubeId).cidade}. Ele entra na academia do ${c.nome}, aos ${jogador.idade} anos.`
    : `${jogador.apelido} começa o high school no ${c.nome}, em Miami, aos ${jogador.idade} anos. Aulas em inglês de manhã, treino à tarde.`);
  void CAMINHOS;
  if (perfil.evento) noticia(save, "vida", perfil.evento.titulo, dec ? dec.resultado : perfil.evento.texto);
  sincronizar(pacote, save);
  return save;
}
const statsVazias = (): Stats => ({ jogos: 0, titular: 0, gols: 0, assist: 0, notas: [], base: 0, baseGols: 0 });
/** Trocou de clube no meio da temporada: o que fez no clube antigo vira uma linha própria no histórico (e os números recomeçam). */
export function fecharPassagemNoClube(pacote: PacoteDados, s: Save) {
  const c = s.carreira, j = s.jogador, st = c.stats, sc = c.statsCopa, se = c.statsEstadual;
  if (c.semana <= SEMANAS_PRE || !(st.jogos || st.base || sc?.jogos || se?.jogos)) return;
  const media = (x: number[]) => (x.length ? +(x.reduce((a, b) => a + b, 0) / x.length).toFixed(2) : 0);
  const info = infoClube(pacote, c.clubeId), camp = (id: CopaId | undefined, x?: { jogos: number; gols: number; assist: number }) => id && x?.jogos ? { id, nome: COPAS[id].nome, fase: "Até a saída", campeao: false, jogos: x.jogos, gols: x.gols, assist: x.assist } : undefined;
  const copaId = (Object.keys(c.copas ?? {}) as CopaId[]).find((k) => !ehEstadual(k) && !ehDeSelecao(k) && !["INT", "MUN"].includes(k) && c.copas![k]!.clubes.includes(c.clubeId));
  const estId = (Object.keys(c.copas ?? {}) as CopaId[]).find((k) => ehEstadual(k) && c.copas![k]!.clubes.includes(c.clubeId));
  const r: ResumoTemporada = { parcial: true, ...(c.fase ? { fase: c.fase } : {}), ano: ANO_INICIAL + c.temporada, idade: j.idade, clube: info?.nome ?? c.clubeId, clubeId: c.clubeId, liga: infoLiga(c.ligaId).curto,
    ovr: Math.round(ovr(j)), jogos: st.jogos, gols: st.gols, assist: st.assist, nota: media(st.notas), posicao: 0, titulo: false, base: st.base, baseGols: st.baseGols,
    ...(st.mvp ? { mvp: st.mvp } : {}), ...(st.selRodada ? { selRodada: st.selRodada } : {}), ...(st.selMes ? { selMes: st.selMes } : {}) };
  const cp = camp(copaId, sc), ce = camp(estId, se);
  if (cp) r.copa = cp;
  if (ce) r.estadual = ce;
  c.historico.push(r);
  c.stats = statsVazias(); c.statsCopa = undefined; c.statsEstadual = undefined; c.notasRodada = undefined;
}

export function rotuloSemana(c: Carreira): string {
  const ano = ANO_INICIAL + c.temporada;
  const r = c.semana - SEMANAS_PRE + 1;
  if (c.semana >= SEMANAS_TEMPORADA) return `Mundial de Clubes ${ano} · ${["1ª rodada", "2ª rodada", "3ª rodada", "oitavas", "quartas", "semifinal", "final"][c.semana - SEMANAS_TEMPORADA] ?? "fim"}`;
  return c.semana < SEMANAS_PRE ? `Pré-temporada ${ano} · semana ${c.semana + 1}` : r > nRodadas(c) ? `Temporada ${ano} · fim de calendário` : `Temporada ${ano} · rodada ${r}`;
}
export function noticia(s: Save, tipo: Noticia["tipo"], titulo: string, texto: string, img?: ImgNoticia) {
  s.noticias.unshift({ semana: rotuloSemana(s.carreira), titulo, texto, tipo, ...(img ? { img } : {}) });
  s.noticias = s.noticias.slice(0, 60);
}

// ------------------------------------------------------------------ calendário
export interface Jogo { casa: string; fora: string }
export function jogosDaRodada(c: Carreira, rodada: number): Jogo[] {
  return rodadasDaLiga(c.ordem.length)[rodada].map(([a, b]) => ({ casa: c.ordem[a], fora: c.ordem[b] }));
}
export function jogoDaSemana(s: Save): (Jogo & { rodada: number; souCasa: boolean; adversario: string }) | undefined {
  const c = s.carreira;
  if (c.semana < SEMANAS_PRE || c.semana - SEMANAS_PRE >= nRodadas(c)) return;
  const r = c.semana - SEMANAS_PRE, j = jogosDaRodada(c, r).find((x) => x.casa === c.clubeId || x.fora === c.clubeId)!;
  return { ...j, rodada: r, souCasa: j.casa === c.clubeId, adversario: j.casa === c.clubeId ? j.fora : j.casa };
}

// ------------------------------------------------------------------ escalação
export type Escalacao = "titular" | "banco" | "base" | "fora" | "lesionado" | "semJogo" | "suspenso";
export const NOME_ESCALACAO: Record<Escalacao, string> = {
  titular: "Titular", banco: "No banco", base: "Jogo da base", fora: "Fora dos relacionados", lesionado: "Lesionado", semJogo: "Sem jogo", suspenso: "Suspenso",
};
export function escalacao(pacote: PacoteDados, s: Save, cansacoPrevisto = s.carreira.cansaco, copa = false, estadual = false): Escalacao {
  const c = s.carreira, j = s.jogador;
  if (c.mercado?.semClube) return "semJogo"; // sem clube: treina sozinho, não joga
  if (c.lesao > 0) return "lesionado";
  if (!copa && c.semana < SEMANAS_PRE) return "semJogo";
  if (copa ? (estadual ? c.suspensaoEstadual : c.suspensaoCopa) : c.suspensao) return "suspenso";
  if (copa) { const e = escalacao(pacote, { ...s, carreira: { ...c, suspensao: 0, semana: Math.max(c.semana, SEMANAS_PRE) } }, cansacoPrevisto); return e === "base" ? "fora" : e; }
  const elenco = elencoDisponivel(pacote, s), tec = c.tecnico;
  const meu = pontuacaoTitular(ovr(j), forma(c), c.relTecnico, cansacoPrevisto) + bonusJovem(c.clubeId, j.idade) + bonusDoTecnico(tec, j.posicao, j.idade);
  const rank = elenco.filter((x) => x.posicao === j.posicao).filter((x) => pontuacaoTitular(x.ovr, 6.5, 50, 0) + bonusDoTecnico(tec, x.posicao, x.idade) > meu).length;
  const vagas = VAGAS_433[j.posicao];
  if (rank < vagas) return "titular";
  if (rank <= vagas + 1) return "banco";
  if (j.idade <= 19) {
    // garoto da base em grande fase ganha chance de ficar no banco do profissional
    const sub = chanceSubir(c.clubeId);
    if (faseAmadora(c)) return "banco"; // várzea, colégio e universidade: não existe time de base
    if (forma(c) >= sub.formaMin && c.relTecnico >= 60 && rngDe(s, "relacionado").chance(sub.chance)) return "banco";
    return "base";
  }
  return "fora";
}

// ------------------------------------------------------------------ copas continentais
/** As copas da temporada (criadas no começo dela pela tabela final da anterior). */
export function copasDe(pacote: PacoteDados, s: Save): Partial<Record<CopaId, EstadoCopa>> {
  const c = s.carreira, w = mundo(pacote);
  const algum = Object.values(c.copas ?? {})[0];
  if (c.copas && algum && algum.temporada === c.temporada) return c.copas;
  const fonte = { ligas: w.liga, tabelaReal: c.tabelaAnterior, semente: s.semente, temporada: c.temporada, cidade: (id: string) => w.info[id]?.cidade ?? "" };
  const forca = (id: string) => w.clube[id]?.forca ?? 60, pais = (id: string) => w.clube[id]?.pais ?? "";
  const copas: Partial<Record<CopaId, EstadoCopa>> = Object.fromEntries((Object.keys(COPAS) as CopaId[]).filter((id) => !["INT", "MUN", "SEL", "COP", "EUR", "AME", "AFR", "ASI", "FIN"].includes(id)).map((id) => [id, novaCopa(id, c.temporada, classificados(fonte, id), forca, pais, regiaoNaCopa, s.semente)]));
  // Intercontinental: campeões da temporada passada (Concacaf = campeão mexicano, Libertadora, Asiática, Champions)
  const p = palmaresDe(pacote, s, c.temporada - 1);
  const ints = [p.campeoes.CON ?? p.ordens.MEX1?.[0], p.campeoes.LIB, p.campeoes.ACL, p.campeoes.UCL];
  if (ints.every(Boolean) && new Set(ints).size === 4) copas.INT = novaCopa("INT", c.temporada, ints as string[], forca, pais, regiaoNaCopa, s.semente);
  // Mundial de Clubes: a cada quatro anos, 32 clubes, no fim da temporada
  // seleção do jogador: três datas FIFA (Eliminatórias nos anos antes da Copa, amistosos no resto)
  const nac = s.jogador.nacionalidade;
  if (temSelecao(nac)) {
    const minha = selecaoDe(pacote, nac)!, rs = new RNG(`${s.semente}|datas|${c.temporada}`), elim = c.temporada % 4 !== 0;
    const conf = confederacao(nac), cand = todasSelecoes(pacote).filter((x) => x.pais !== nac && (!elim || confederacao(x.pais) === conf));
    const advs = rs.shuffle([...cand].sort((a, b) => Math.abs(a.forca - minha.forca) - Math.abs(b.forca - minha.forca)).slice(0, 8)).slice(0, 3).map((x) => x.id);
    if (advs.length === 3) { const e = novaCopa("SEL", c.temporada, [minha.id, ...advs], forca, pais, regiaoNaCopa, s.semente); for (const j of e.jogos) j.fase = elim ? "eliminatorias" : "amistoso"; copas.SEL = e; }
  }
  // Copa do Mundo de seleções (2030, 2034...): 32 seleções, grupos e mata-mata nas semanas 40 a 46
  if (ehCopaDoMundo(c.temporada)) copas.COP = novaCopa("COP", c.temporada, participantesCopa(pacote, c.temporada), forca, pais, (id) => confederacao(w.clube[id]?.pais ?? ""), s.semente);
  // Eurocopa, Copa América, Copa Africana e Copa da Ásia (2028, 2032...): no fim da temporada, como a Copa
  const confNat = (id: string) => confederacao(w.clube[id]?.pais ?? "");
  if (ehTorneioContinental(c.temporada)) for (const id of ["EUR", "AME", "AFR", "ASI"] as TorneioId[]) copas[id] = novaCopa(id, c.temporada, participantesTorneio(pacote, id, c.temporada), forca, pais, confNat, s.semente);
  // Finalíssima: campeão da Eurocopa × campeão da Copa América do ano anterior, jogo único numa data FIFA
  if (ehFinalissima(c.temporada)) { const pp = palmaresDe(pacote, s, c.temporada - 1), a = pp.campeoes.EUR, b = pp.campeoes.AME; if (a && b) copas.FIN = novaCopa("FIN", c.temporada, [a, b], forca, pais, confNat, s.semente); }
  if (ehMundial(c.temporada)) copas.MUN = novaCopa("MUN", c.temporada, participantesMundial(pacote, s, c.temporada), forca, pais, (id) => confederacao(pais(id) || w.info[id]?.pais || ""), s.semente);
  c.copas = copas;
  return c.copas;
}

// ------------------------------------------------------------------ histórico das copas (Intercontinental e Mundial)
/** O que ficou de uma temporada: campeão e até onde cada clube foi em cada copa continental, e a tabela final de algumas ligas. */
export interface Palmares { campeoes: Partial<Record<CopaId, string>>; chegou: Partial<Record<CopaId, Record<string, string>>>; ordens: Record<string, string[]> }
const LIGAS_PALMARES = ["MEX1", "USA1", "BRA1", "ESP1", "KSA1"];
const simulados = new Map<string, Palmares>();
/** Palmarés de uma temporada: o guardado na carreira, ou (antes da carreira começar) simulado, sempre igual. */
export function palmaresDe(pacote: PacoteDados, s: Save, t: number): Palmares {
  const guardado = s.carreira.palmares?.[t];
  if (guardado) return guardado;
  const k = `${s.semente}|${t}`, ja = simulados.get(k);
  if (ja) return ja;
  const w = mundo(pacote), forca = (id: string) => w.clube[id]?.forca ?? 60, pais = (id: string) => w.clube[id]?.pais ?? "";
  const fonte = { ligas: w.liga, semente: `${s.semente}|sim`, temporada: t, cidade: (id: string) => w.info[id]?.cidade ?? "" };
  const p: Palmares = { campeoes: {}, chegou: {}, ordens: Object.fromEntries(LIGAS_PALMARES.map((l) => [l, ordemFinal(fonte, l)])) };
  for (const id of ["LIB", "UCL", "ACL", "CON"] as CopaId[]) {
    const e = novaCopa(id, t, classificados(fonte, id), forca, pais, regiaoNaCopa, `${s.semente}|sim`), rng = new RNG(`${s.semente}|sim|${id}|${t}`);
    for (let sem = 0; sem < SEMANAS_TEMPORADA; sem++) rodarSemana(e, sem, forca, rng);
    p.campeoes[id] = e.campeao; p.chegou[id] = e.chegou;
  }
  simulados.set(k, p);
  return p;
}
const PONTOS_FASE: Record<string, number> = { grupos: 1, liga: 1, playoff: 1.5, oitavas: 2, quartas: 3, semi: 4, final: 5 };
const SEDES = ["BRA1", "ESP1", "USA1", "KSA1"]; // 2029 Brasil, 2033 Espanha, 2037 EUA, 2041 Arábia...
/**
 * Os 32 do Mundial (critério da FIFA adaptado): por continente, os campeões das quatro últimas temporadas e depois o
 * ranking de resultados nelas (até 2 por país, fora campeões). Europa 12, América do Sul 6, Ásia 4, Concacaf 4
 * (campeões e melhores de México e EUA), África 4 e Oceania 1 (convidados) e 1 do país-sede.
 */
export function participantesMundial(pacote: PacoteDados, s: Save, t: number): string[] {
  const w = mundo(pacote), ps = [t - 1, t - 2, t - 3, t - 4].map((x) => palmaresDe(pacote, s, x)), pais = (id: string) => w.info[id]?.pais ?? "";
  const lista: string[] = [];
  const porCopa = (id: CopaId, n: number) => {
    const campeoes = [...new Set(ps.map((p) => p.campeoes[id]).filter(Boolean) as string[])].slice(0, n);
    const pts: Record<string, number> = {};
    for (const p of ps) for (const [cl, f] of Object.entries(p.chegou[id] ?? {})) pts[cl] = (pts[cl] ?? 0) + (PONTOS_FASE[f] ?? 0) + (p.campeoes[id] === cl ? 2 : 0);
    const sel = [...campeoes];
    for (const cl of Object.keys(pts).sort((a, b) => pts[b] - pts[a])) {
      if (sel.length >= n) break;
      if (sel.includes(cl) || lista.includes(cl) || sel.filter((x) => pais(x) === pais(cl)).length >= 2) continue;
      sel.push(cl);
    }
    lista.push(...sel);
  };
  porCopa("UCL", 12); porCopa("LIB", 6); porCopa("ACL", 4); porCopa("CON", 4);
  // África e Oceania (convidados) e o país-sede
  lista.push(...Object.values(w.clube).filter((c) => c.ligaId === "CONV" && confederacao(c.pais) === "CAF").sort((a, b) => b.forca - a.forca).slice(0, 4).map((c) => c.id));
  lista.push(...Object.values(w.clube).filter((c) => c.ligaId === "CONV" && confederacao(c.pais) === "OFC").map((c) => c.id).slice(0, 1));
  const sede = SEDES[Math.floor((t - 3) / 4) % SEDES.length], daSede = ps[0].ordens[sede]?.find((x) => !lista.includes(x));
  if (daSede) lista.push(daSede);
  const forca = (id: string) => w.clube[id]?.forca ?? 60;
  return lista.slice(0, 32).sort((a, b) => forca(b) - forca(a));
}
/** O clube do jogador ainda tem jogo no Mundial, ou a seleção dele (com ele convocado) na Copa do Mundo: a temporada só acaba depois. */
export const noMundial = (s: Save) => {
  const c = s.carreira, e = c.copas?.MUN, nat = idSelecao(s.jogador.nacionalidade);
  const clube = !!e && e.jogos.some((j) => j.gc === undefined && (j.casa === c.clubeId || j.fora === c.clubeId));
  const selecao = TORNEIOS_FIM.some((id) => { const cop = c.copas?.[id]; return !!cop && c.selecao?.conv[chaveConv(id, c.temporada, 0)] === true && cop.jogos.some((j) => j.gc === undefined && (j.casa === nat || j.fora === nat)); });
  return clube || selecao;
};
const TROFEU_PREMIO: Record<IdPremio, [string, number, [string, string]]> = {
  BOLA: ["bola", 15, ["#E3B341", "#B8892B"]], BEST: ["estrela", 10, ["#E3B341", "#1E3A6B"]], UEFA: ["placa", 9, ["#C0C8D8", "#0B2F7A"]], REI: ["prato", 8, ["#E3B341", "#2E7D4F"]],
  ASIA: ["placa", 6, ["#E3B341", "#8A1C1C"]], AFR: ["placa", 6, ["#E3B341", "#2E7D4F"]], KOPA: ["bola", 6, ["#C0C8D8", "#8F96A3"]], YASHIN: ["placa", 6, ["#E3B341", "#222222"]], CHUTEIRA: ["chuteira", 8, ["#E3B341", "#B8892B"]],
};
/** Fim da temporada: os prêmios do mundo, com o jogador do usuário concorrendo com os números da liga dele. */
function premiosDoMundo(pacote: PacoteDados, s: Save, r: ResumoTemporada, ev: string[]) {
  const c = s.carreira, j = s.jogador, w = mundo(pacote), ano = r.ano;
  const fonte = { ligas: w.liga, tabelaReal: { ligaId: infoLiga(c.ligaId).id, ordem: ordenar(c.tabela).map((x) => x.clube) }, semente: `${s.semente}|sim`, temporada: c.temporada };
  const campeaoLiga: Record<string, string | undefined> = {};
  for (const id of Object.keys(w.liga)) if (id !== "SELECOES" && id !== "CONV") campeaoLiga[id] = ordemFinal(fonte, id)[0];
  const faseDe = (e: EstadoCopa | undefined, id: string) => !e ? undefined : e.campeao === id ? "campeao" : e.chegou[id];
  const cands: Candidato[] = candidatosDoAno(pacote);
  const minimo = Math.ceil(nRodadas(c) * 0.5);
  const meus = c.selecao?.copas.filter((x) => x.ano === ano) ?? [];
  if (!c.fase && r.jogos >= minimo) cands.push({ nome: j.apelido, clubeId: c.clubeId, posicao: j.posicao, nota: r.nota, gols: r.gols, assist: r.assist, jogos: r.jogos, idade: j.idade, ligaId: infoLiga(c.ligaId).id, ovr: ovr(j) + (c.fama - 50) / 10, nacionalidade: j.nacionalidade, minimo, eu: true });
  const p = premiosDoAno(cands, {
    semente: s.semente, ano, campeaoLiga, regiaoLiga: (id) => infoLiga(id).regiao, nivelLiga: (id) => infoLiga(id).nivel, confederacao,
    faseCopa: (copa, id) => faseDe(c.copas?.[copa as CopaId], id),
    faseSelecao: (copa, x) => { const cop = c.copas?.[copa as CopaId], nat = idSelecao(x.nacionalidade); if (!cop) return undefined; return (x.eu ? meus.some((m) => (m.id ?? "COP") === copa) : naSelecao(pacote, x.nacionalidade, x.nome)) ? faseDe(cop, nat) : undefined; },
  });
  c.premiosMundo = p;
  const gal = (c.galeriaPremios ??= {}), nome = (x: { nome: string; eu?: boolean }) => (x.eu ? j.apelido : x.nome), clube = (id: string) => infoClube(pacote, id)?.nome ?? "";
  for (const pr of p.premios) {
    const v = pr.ranking[0];
    (gal[pr.id] ??= []).push({ ano, nome: v.nome, clubeId: v.clubeId, nacionalidade: v.nacionalidade, ...(v.eu ? { eu: true } : {}) });
    const pos = pr.ranking.findIndex((x) => x.eu);
    if (pos === 0) {
      if (pr.id === "BOLA") ganharCapa(s, false);
      const [modelo, fama, cores] = TROFEU_PREMIO[pr.id], nomeT = `${pr.nome} ${ano}`;
      receberReliquias(s, [{ conquista: `trofeu-mundo-${pr.id}`, reliquia: { id: `rel-trofeu-mundo-${pr.id}-${ano}`, chave: `trofeu-mundo-${pr.id}`, tipo: "trofeu", nome: nomeT, legenda: `${clube(c.clubeId)} · ${ano}`, ano, cores, modelo } }], ev);
      r.premios = [...(r.premios ?? []), nomeT];
      c.fama = clamp(c.fama + fama, 0, 100);
      noticia(s, "jogo", `${j.apelido} ganha ${pr.id === "BOLA" ? "a" : "o"} ${pr.nome}!`, `${j.apelido} (${clube(c.clubeId)}) é ${pr.id === "BOLA" ? "o melhor jogador do mundo" : `o vencedor do prêmio ${pr.nome}`} de ${ano}.`, { k: "trofeu" });
    } else if (pos > 0 && (pr.id === "BOLA" || pr.id === "BEST")) {
      c.fama = clamp(c.fama + Math.max(1, 6 - pos), 0, 100);
      noticia(s, "jogo", `${j.apelido} é ${pos + 1}º ${pr.id === "BOLA" ? "na Bola de Ouro" : "no The Best"}`, `${nome(v)} (${clube(v.clubeId)}) venceu. ${j.apelido} terminou em ${pos + 1}º lugar.`);
    }
  }
  // Seleção FIFA do Ano (FIFPro): os 11 do mundo, votados pelos jogadores
  if (p.selecao.length) {
    const eu = p.selecao.some((x) => x.eu);
    if (eu) {
      const nomeT = `Seleção FIFA do Ano ${ano}`;
      receberReliquias(s, [{ conquista: "trofeu-mundo-FIFPRO", reliquia: { id: `rel-trofeu-mundo-FIFPRO-${ano}`, chave: "trofeu-mundo-FIFPRO", tipo: "trofeu", nome: nomeT, legenda: `${clube(c.clubeId)} · os 11 do mundo · ${ano}`, ano, cores: ["#C0C8D8", "#1E3A6B"], modelo: "placa" } }], ev);
      r.premios = [...(r.premios ?? []), nomeT]; c.fama = clamp(c.fama + 4, 0, 100);
    }
    noticia(s, "clube", `Seleção FIFA do Ano ${ano}`, `${eu ? `${j.apelido} está entre os 11 do mundo! ` : ""}${p.selecao.map((x) => nome(x)).join(", ")}.`, { k: "trofeu" });
  }
  const bola = p.premios.find((x) => x.id === "BOLA")?.ranking[0], uefa = p.premios.find((x) => x.id === "UEFA")?.ranking[0], rei = p.premios.find((x) => x.id === "REI")?.ranking[0];
  if (bola) noticia(s, "clube", `Bola de Ouro ${ano}: ${nome(bola)}`, `${nome(bola)} (${clube(bola.clubeId)}) é o melhor do mundo.${uefa ? ` Melhor da Europa: ${nome(uefa)}${uefa.nome !== bola.nome ? " — os votantes da UEFA discordaram" : ""}.` : ""}${rei ? ` Rei da América: ${nome(rei)}.` : ""}`, { k: "trofeu" });
}
/** Torneios de seleções do fim da temporada (semanas 40+): a temporada espera a seleção do jogador sair. */
const TORNEIOS_FIM: CopaId[] = ["COP", "EUR", "AME", "AFR", "ASI"];
/** Chave da convocação: cada data FIFA tem a sua; cada torneio tem uma lista só. */
const chaveConv = (id: CopaId, t: number, semana: number) => id === "SEL" ? `${t}-${semana}` : id === "COP" ? `${t}-copa` : `${t}-${id}`;
/** Participantes dos torneios continentais (em ordem de força): Eurocopa 16, Copa América 16 (10 sul-americanos e
 *  6 convidados da Concacaf), Copa Africana 8, Copa da Ásia 8. As sedes estão sempre. */
export function participantesTorneio(pacote: PacoteDados, id: TorneioId, t: number): string[] {
  const sel = todasSelecoes(pacote), por = (cf: string) => sel.filter((x) => confederacao(x.pais) === cf).sort((a, b) => b.forca - a.forca);
  const sedes: Record<string, string[]> = { "EUR-2": ["ENG", "SCO"], "EUR-6": ["ITA", "TUR"], "AME-2": ["USA"], "AFR-2": ["MAR"], "ASI-2": ["KSA"] };
  let lista = id === "AME" ? [...por("CONMEBOL").slice(0, 10), ...por("CONCACAF").slice(0, 6)] : por(id === "EUR" ? "UEFA" : id === "AFR" ? "CAF" : "AFC");
  const n = id === "EUR" || id === "AME" ? 16 : 8, fixas = sedes[`${id}-${t}`] ?? [];
  lista = [...lista.filter((x) => fixas.includes(x.pais)), ...lista.filter((x) => !fixas.includes(x.pais))].slice(0, n);
  const forca = (x: { forca: number }) => x.forca;
  return lista.sort((a, b) => forca(b) - forca(a)).map((x) => x.id).slice(0, Math.floor(lista.length / 4) * 4);
}
/** As 32 da Copa do Mundo: por continente, as mais fortes (Europa 13, América do Sul 5, África 5, Ásia 5, Concacaf 3, Oceania 1), com as sedes garantidas. */
export function participantesCopa(pacote: PacoteDados, t: number): string[] {
  const sel = todasSelecoes(pacote), sedes = t === 4 ? ["ESP", "POR", "MAR"] : t === 8 ? ["KSA"] : t === 12 ? ["USA", "CAN"] : [];
  const cotas: Record<string, number> = { UEFA: 13, CONMEBOL: 5, CAF: 5, AFC: 5, CONCACAF: 3, OFC: 1 };
  const lista = sel.filter((x) => sedes.includes(x.pais)).map((x) => x.id);
  for (const [cf, n] of Object.entries(cotas)) {
    const ja = lista.filter((id) => confederacao(id.slice(4)) === cf).length;
    lista.push(...sel.filter((x) => confederacao(x.pais) === cf && !lista.includes(x.id)).sort((a, b) => b.forca - a.forca).slice(0, Math.max(0, n - ja)).map((x) => x.id));
  }
  const forca = (id: string) => sel.find((x) => x.id === id)?.forca ?? 60;
  return lista.slice(0, 32).sort((a, b) => forca(b) - forca(a));
}
const CONVOCADOS: Record<string, number> = { GOL: 3, ZAG: 4, LAT: 3, VOL: 3, MEI: 3, PON: 3, ATA: 3 };
/** Convocado? Nível (com fama e fase) contra os compatriotas da mesma posição no mundo; a decisão de cada data fica guardada. */
export function convocado(pacote: PacoteDados, s: Save, chave = `${s.carreira.temporada}-${s.carreira.semana}`): boolean {
  const c = s.carreira, j = s.jogador, reg = (c.selecao ??= { jogos: 0, gols: 0, assist: 0, convocacoes: 0, copas: [], conv: {} });
  if (chave in reg.conv) return reg.conv[chave];
  const sel = selecaoDe(pacote, j.nacionalidade);
  let sim = false;
  if (sel && j.idade >= 17 && !c.fase && c.lesao <= 0) {
    const meu = ovr(j) + c.fama / 25 + (forma(c) - 6.5) * 1.5;
    sim = sel.elenco.filter((x) => x.posicao === j.posicao && x.ovr > meu).length < (CONVOCADOS[j.posicao] ?? 3);
  }
  reg.conv[chave] = sim;
  if (sim) { reg.convocacoes++; noticia(s, "jogo", `${j.apelido} convocado`, `${j.apelido} está na lista da ${sel!.nome}${chave.endsWith("copa") ? " para a Copa do Mundo" : ""}.`); }
  return sim;
}
/** Titular ou banco na seleção: a posição dele entre os convocados da posição. */
export function escalacaoSelecao(pacote: PacoteDados, s: Save, cansaco: number): Escalacao {
  const c = s.carreira, j = s.jogador, sel = selecaoDe(pacote, j.nacionalidade)!;
  if (c.lesao > 0) return "lesionado";
  const meu = pontuacaoTitular(ovr(j), forma(c), 60, cansaco) + c.fama / 30;
  const rank = sel.elenco.filter((x) => x.posicao === j.posicao && pontuacaoTitular(x.ovr, 6.5, 60, 0) > meu).length;
  return rank < ({ GOL: 1, ...VAGAS_433 } as Record<string, number>)[j.posicao] ? "titular" : "banco";
}
/** O jogo da seleção nesta semana (se o jogador foi convocado). */
function jogoDaSelecao(pacote: PacoteDados, s: Save): { copa: EstadoCopa; jogo: JogoCopa } | undefined {
  const c = s.carreira, nat = idSelecao(s.jogador.nacionalidade);
  for (const id of ["SEL", "FIN", ...TORNEIOS_FIM] as CopaId[]) {
    const e = copasDe(pacote, s)[id];
    const jg = e?.jogos.find((x) => x.semana === c.semana && x.gc === undefined && (x.casa === nat || x.fora === nat));
    if (e && jg && convocado(pacote, s, chaveConv(id, c.temporada, c.semana))) return { copa: e, jogo: jg };
  }
}
/** Sede do Mundial da temporada t (liga do país-sede). */
export const sedeDoMundial = (t: number) => SEDES[Math.floor((t - 3) / 4) % SEDES.length];
/** Jogo da copa do clube do jogador nesta semana (quarta), se ele é profissional e o clube está na copa. */
export function jogoCopaDaSemana(pacote: PacoteDados, s: Save): { copa: EstadoCopa; jogo: JogoCopa } | undefined {
  const c = s.carreira;
  if (c.fase) return;
  // seleção primeiro (data FIFA e Copa do Mundo); quem está sem clube também pode ser convocado
  const nac = jogoDaSelecao(pacote, s);
  if (nac) return nac;
  if (c.mercado?.semClube) return;
  const r = jogoDoClubeNaSemana(copasDe(pacote, s), c.clubeId, c.semana);
  return r && r.jogo.gc === undefined ? r : undefined;
}
/** Dias da semana (0 = segunda) travados por jogo de copa: só se joga. */
export function diasTravados(s: Save): number[] {
  const c = s.carreira;
  if (c.fase) return [];
  // convocado para a seleção nesta semana (a decisão já foi tomada quando a semana abriu)
  const nat = idSelecao(s.jogador.nacionalidade), conv = c.selecao?.conv;
  for (const id of ["SEL", "FIN", ...TORNEIOS_FIM] as CopaId[]) {
    const e = c.copas?.[id], jg = e?.jogos.find((x) => x.semana === c.semana && (x.casa === nat || x.fora === nat));
    if (jg && conv?.[chaveConv(id, c.temporada, c.semana)]) return [2];
  }
  if (c.mercado?.semClube) return [];
  const r = jogoDoClubeNaSemana(c.copas, c.clubeId, c.semana);
  return r && (r.jogo.gc === undefined || c.meioSemana?.semana === c.semana) ? [2] : [];
}
/** Ações que valem na semana (os dias de jogo não contam). */
const acoesValidas = (s: Save, p: Plano): Acao[] => { const t = diasTravados(s); return p.acoes.filter((_, i) => !t.includes(i)); };

// ------------------------------------------------------------------ plano da semana
export type Acao = "treino" | "descanso" | "familia" | "amigos" | "redes" | "video";
export const ACOES: Record<Acao, { nome: string; efeito: string }> = {
  treino: { nome: "Treino extra", efeito: "+10% de evolução, +10 de cansaço" },
  descanso: { nome: "Descanso", efeito: "−15 de cansaço" },
  familia: { nome: "Família", efeito: "+2 de moral" },
  amigos: { nome: "Sair com amigos", efeito: "+4 de moral, +10 de cansaço, risco de polêmica" },
  redes: { nome: "Redes sociais", efeito: "Mais seguidores e fama, risco de polêmica" },
  video: { nome: "Estudar o adversário", efeito: "Melhora a nota do jogo e a relação com o técnico" },
};
export interface Plano { foco: Grupo; intensidade: Intensidade; acoes: Acao[] }
export const planoPadrao = (): Plano => ({ foco: "tecnico", intensidade: "normal", acoes: ["treino", "descanso", "familia", "video", "descanso"] });

/** O que o plano faz com cansaço e moral antes do jogo (sem sorteios). */
export function previaPlano(s: Save, p: Plano) {
  const casa = efeitosDaCasa(s.casa).total, ac = acoesValidas(s, p), cont = (a: Acao) => ac.filter((x) => x === a).length;
  const cansaco = clamp(s.carreira.cansaco + 10 * cont("treino") - 15 * cont("descanso") + 10 * cont("amigos") + (p.intensidade === "alta" ? 10 : p.intensidade === "leve" ? -10 : 0) + 12, 0, 100);
  const moral = clamp(s.carreira.moral + 2 * cont("familia") + 4 * cont("amigos"), 0, 100);
  const evolucao = Math.round(100 * (cont("treino") * 0.1 + (p.intensidade === "alta" ? 0.2 : p.intensidade === "leve" ? -0.2 : 0) + (casa.evolucao + efeitosVida(padraoDe(s.carreira)).evolucao) / 100 + s.carreira.bonusEvolucao));
  return { cansaco: Math.round(cansaco), moral: Math.round(moral), evolucao, notaExtra: Math.min(0.3, 0.15 * cont("video")) };
}

// ------------------------------------------------------------------ partida
export interface Opcao { id: string; rotulo: string }
export interface Decisao { min: number; titulo: string; texto: string; opcoes: Opcao[]; situacao: string }
export interface Lance { min: number; lado: "casa" | "fora"; meu?: "gol" | "assist"; texto: string }
export interface Partida {
  tipo: "profissional" | "base"; escalacao: Escalacao; casa: string; fora: string; nomeCasa: string; nomeFora: string; souCasa: boolean;
  /** jogo de copa continental (quarta-feira) */
  copa?: { id: CopaId; jogoId: string; nome: string; rotulo: string; neutro?: boolean };
  entrada: number; saida: number; golsCasa: number; golsFora: number; lances: Lance[]; decisoes: Decisao[];
  base: { gols: number; assist: number; nota: number }; fAdv: number;
  /** nomes do elenco usados nos textos, contexto do jogo e narração de ambiente */
  nomes: Record<string, string>; ctx: Contexto; abertura: string; narracao: LinhaNarracao[];
}
export interface ResultadoDecisao extends Efeito { min: number; nivel: Nivel; situacao: string; opcao?: string }
/** Decisão extra que a tela abre quando o jogador marca pela primeira vez no jogo: como comemorar. */
export function decisaoComemoracao(s: Save, p: Partida, min: number): Decisao {
  return { min, ...montarDecisao(rngDe(s, "comemoracao", min), COMEMORACAO, { ...p.ctx, min, jaFezGol: (s.carreira.stats.gols + s.carreira.historico.reduce((a, h) => a + h.gols, 0)) > 0 }, p.nomes) };
}
/** Depois do apito final (nem sempre): entrevista, troca de camisa, conversa com o técnico... */
export function decisaoPosJogo(s: Save, p: Partida, resultados: ResultadoDecisao[]): Decisao | undefined {
  if (Math.min(90, p.saida) - p.entrada <= 0) return;
  const meuLado = p.souCasa;
  let gm = meuLado ? p.golsCasa : p.golsFora, ga = meuLado ? p.golsFora : p.golsCasa, gols = p.lances.filter((l) => l.meu === "gol").length, nota = p.base.nota, amarelos = 0, expulso = false;
  for (const r of resultados) { if (r.golPro) gm++; if (r.golContra) ga++; if (r.meu === "gol") gols++; nota += r.nota; if (r.amarelo) amarelos++; if (r.vermelho || amarelos >= 2) expulso = true; }
  const rng = rngDe(s, "posjogo");
  if (!expulso && !rng.chance(0.5)) return;
  const ctx: Contexto = { ...p.ctx, min: 90, saldo: gm - ga, resultado: gm > ga ? "v" : gm === ga ? "e" : "d", gols, expulso, nota };
  const sit = escolherSituacao(rng, ctx, [], s.carreira.memoria, POS_JOGO);
  if (sit.peso(ctx) <= 0) return;
  return { min: 90, ...montarDecisao(rng, sit, ctx, { ...p.nomes, marco: String(ctx.jogosPro + 1) }) };
}

const ROTULO_FASE: Record<Fase, string> = { varzea: "na várzea", colegial: "pelo colégio", universidade: "pela universidade", academia: "na academia" };
/** Categoria da base pela idade. */
export const categoriaBase = (idade: number) => (idade <= 17 ? "sub-17" : "sub-20");
/** Força dos times da base (sub-17/20) a partir da força do profissional. */
const forcaBase = (forcaPro: number) => 46 + (forcaPro - 70) * 0.6;
/** Na base também tem disputa: se há garotos melhores na posição, na categoria, começa no banco. */
export function reservaNaBase(pacote: PacoteDados, s: Save, cansacoPrevisto = s.carreira.cansaco): boolean {
  const c = s.carreira, j = s.jogador;
  if (!c.formacao || c.fase) return false;
  const meu = pontuacaoTitular(ovr(j), forma(c), c.relTecnico, cansacoPrevisto);
  const rank = timeDaBase(pacote, c.clubeId, j.idade).filter((x) => x.posicao === j.posicao && pontuacaoTitular(x.ovr, 6.5, 50, 0) > meu).length;
  return rank >= VAGAS_433[j.posicao];
}
/** Força do time da base na categoria (os garotos de verdade); sem base, pela força do profissional. */
function forcaDaBase(pacote: PacoteDados, clubeId: string, idade: number, forcaPro: number) {
  const t = timeDaBase(pacote, clubeId, idade);
  return t.length >= 11 ? forcaDoElenco(t) : forcaBase(forcaPro);
}

/** Prepara a partida da semana (domingo, liga) ou, com `copa`, a de quarta pela copa continental. */
export function prepararPartida(pacote: PacoteDados, s: Save, plano: Plano, copa?: { copa: EstadoCopa; jogo: JogoCopa }): Partida | undefined {
  sincronizar(pacote, s);
  const selecaoJogo = !!copa && ehDeSelecao(copa.copa.id);
  if (s.carreira.mercado?.semClube && !selecaoJogo) return; // sem clube: não tem jogo (a seleção, sim)
  const l = ligaAtual(pacote, s), c = s.carreira, j = s.jogador, W = mundo(pacote);
  const cj = copa?.jogo, meuId = selecaoJogo ? idSelecao(j.nacionalidade) : c.clubeId;
  const jogo = cj ? { casa: cj.casa, fora: cj.fora, souCasa: cj.casa === meuId, adversario: cj.casa === meuId ? cj.fora : cj.casa } : jogoDaSemana(s);
  if (!jogo) return;
  const clubeM = (id: string) => W.clube[idClube(id)] ?? clubeDe(l, id);
  const infoCopa = copa && cj ? { id: copa.copa.id, jogoId: cj.id, nome: COPAS[copa.copa.id].nome, rotulo: rotuloJogo(cj), ...(cj.neutro ? { neutro: true } : {}) } : undefined;
  // na quarta, o cansaço é o de segunda e terça; no domingo, o da semana inteira (com o jogo de quarta, se houve)
  const prev = cj ? previaPlano(s, { ...plano, acoes: plano.acoes.slice(0, 2) }) : previaPlano(s, plano);
  const esc = selecaoJogo ? escalacaoSelecao(pacote, s, prev.cansaco) : escalacao(pacote, s, prev.cansaco, !!cj, !!copa && ehEstadual(copa.copa.id));
  if (esc === "lesionado" || esc === "fora" || esc === "suspenso") return { tipo: "profissional", escalacao: esc, casa: jogo.casa, fora: jogo.fora, nomeCasa: clubeM(jogo.casa).nome, nomeFora: clubeM(jogo.fora).nome, souCasa: jogo.souCasa, ...(infoCopa ? { copa: infoCopa } : {}), entrada: 0, saida: 0, golsCasa: 0, golsFora: 0, lances: [], decisoes: [], base: { gols: 0, assist: 0, nota: 0 }, fAdv: 0, nomes: {}, ctx: contextoPadrao(), abertura: "", narracao: [] };
  const rng = rngDe(s, cj ? `partida-copa-${cj.id}` : "partida");
  // várzea, colégio e universidade contam como jogos "de formação" (não são profissionais), mas com os times como são
  const amador = !cj && faseAmadora(c), base = !cj && (esc === "base" || amador);
  const meuClube = clubeM(meuId), adv = clubeM(jogo.adversario);
  let fCasa = clubeM(jogo.casa).forca, fFora = clubeM(jogo.fora).forca;
  if (copa && ehEstadual(copa.copa.id)) { fCasa = forcaNoEstadual(fCasa); fFora = forcaNoEstadual(fFora); }
  const ovrEf = ovr(j) * (0.92 + (0.08 * prev.moral) / 100) * (prev.cansaco > 70 ? 0.9 : 1);
  if (base && !amador) { fCasa = forcaDaBase(pacote, jogo.casa, j.idade, fCasa); fFora = forcaDaBase(pacote, jogo.fora, j.idade, fFora); }
  const meuF = jogo.souCasa ? fCasa : fFora, advF = jogo.souCasa ? fFora : fCasa;
  const reservaBase = base && !amador && reservaNaBase(pacote, s, prev.cansaco);
  const entrada = esc === "banco" || reservaBase ? (rng.chance(reservaBase ? 0.7 : 0.6) ? rng.int(55, 80) : 91) : 0;
  const saida = esc === "titular" && prev.cansaco > 75 ? rng.int(60, 75) : 90;
  const minutos = Math.max(0, Math.min(90, saida) - entrada);
  if (minutos > 0 && (esc === "titular" || base)) {
    const bonus = (ovrEf - (base && !amador ? meuF + 4 : meuClube.forca)) / 11;
    if (jogo.souCasa) fCasa += bonus; else fFora += bonus;
  }
  const [gc, gf] = simularPlacar(rng, fCasa, fFora);
  const golsMeu = jogo.souCasa ? gc : gf, golsAdv = jogo.souCasa ? gf : gc;
  const d = minutos > 0 ? desempenhoJogador(rng, { posicao: j.posicao, ovrEfetivo: ovrEf, fin: j.at.FIN, passeOuCruz: Math.max(j.at.PAS, j.at.CRU), minutos, golsTime: golsMeu, golsSofridos: golsAdv, fAdv: advF }) : { gols: 0, assistencias: 0, nota: 0 };
  // lances: minutos dos gols; os do jogador caem dentro do tempo em campo
  const lado = (meu: boolean): "casa" | "fora" => (meu === jogo.souCasa ? "casa" : "fora");
  const lances: Lance[] = [];
  const minutosLivres = () => rng.int(2, 89);
  const meusGolsMin: number[] = Array.from({ length: golsMeu }, minutosLivres).sort((a, b) => a - b);
  let g = d.gols, a = d.assistencias;
  for (const m of meusGolsMin) {
    const emCampo = m >= entrada && m <= saida;
    let meu: Lance["meu"];
    if (emCampo && g > 0) { meu = "gol"; g--; } else if (emCampo && a > 0) { meu = "assist"; a--; }
    lances.push({ min: m, lado: lado(true), meu, texto: "" });
  }
  for (let i = 0; i < golsAdv; i++) lances.push({ min: minutosLivres(), lado: lado(false), texto: "" });
  // quem é quem, contexto do jogo e narração (sorteios próprios: não mexem no placar)
  const rngN = rngDe(s, cj ? `narracao-${cj.id}` : "narracao"), rngL = rngDe(s, cj ? `lances-${cj.id}` : "lances");
  const cp = (id: string) => infoClube(pacote, id);
  const classico = !cj && (cp(jogo.casa).cidade === cp(jogo.fora).cidade || [jogo.casa, jogo.fora].sort().join("-") in CLASSICOS_EXTRA);
  const chuva = rngN.chance(0.14);
  const naBase = base && !amador;
  const elMeu = elencoDe({ ...meuClube, elenco: naBase ? timeDaBase(pacote, c.clubeId, j.idade) : selecaoJogo ? meuClube.elenco : elencoDisponivel(pacote, s) }, false), elAdv = elencoDe(naBase ? { ...adv, elenco: timeDaBase(pacote, adv.id, j.idade) } : selecaoJogo ? adv : { ...adv, elenco: elencoDisponivel(pacote, s, adv.id) }, false);
  const estadio = cj?.neutro ? `estádio da ${NOME_FASE[cj.fase].toLowerCase()}` : base && !amador ? `CT do ${cp(jogo.casa).apelido}` : cp(jogo.casa).estadio;
  const nomes = nomesDaPartida(rngN, elMeu, elAdv, { nome: j.apelido, meu: cp(meuId).apelido, adv: cp(jogo.adversario).apelido, estadio, posJogador: j.posicao });
  const posTab = posicaoNaTabela(undefined, s), reta = c.semana >= SEMANAS_PRE + 28;
  const jogosPro = c.stats.jogos + c.historico.reduce((acc, h) => acc + h.jogos, 0);
  const ctx: Contexto = { pos: j.posicao, min: 0, saldo: 0, base, jaFezGol: false, classico, mandante: jogo.souCasa, reta,
    briga: cj || base || !reta ? "" : posTab <= 3 ? "titulo" : posTab > c.ordem.length - 4 ? "rebaixamento" : "", fama: c.fama, estreia: !base && jogosPro === 0,
    chuva, idade: j.idade, relTecnico: c.relTecnico, moral: c.moral, jogosPro };
  // decisões dentro do tempo em campo: de uma a três, situações diferentes conforme posição, minuto, placar, contexto e memória
  const nDec = minutos <= 0 ? 0 : minutos < 30 ? 1 : rng.chance(0.25) ? 1 : rng.chance(0.7) ? 2 : 3;
  const decisoes: Decisao[] = [], usadas: string[] = [];
  for (const [lo, hi] of janelasDeLance(entrada, saida, nDec)) {
    const min = rng.int(lo, hi);
    const saldo = lances.filter((x) => x.min < min).reduce((acc, x) => acc + (x.lado === lado(true) ? 1 : -1), 0);
    const ctxMin = { ...ctx, min, saldo };
    const sit = ctx.estreia && !decisoes.length ? SITUACAO.estreia : escolherSituacao(rngL, ctxMin, usadas, c.memoria);
    usadas.push(sit.id);
    decisoes.push({ min, ...montarDecisao(rngL, sit, ctxMin, nomes) });
  }
  lances.sort((x, y) => x.min - y.min);
  for (const x of lances) x.texto = narrarGol(rngN, x.lado === lado(true), x.meu, nomes, elMeu, elAdv);
  const narr = narrarPartida(rngN, { mandante: jogo.souCasa, classico, chuva, base, pos: j.posicao, nota: d.nota, entrada, saida }, nomes, elMeu, elAdv);
  const cat = categoriaBase(j.idade), suf = base && !amador ? ` ${cat}` : "", nomeC = `${clubeM(jogo.casa).nome}${suf}`, nomeF = `${clubeM(jogo.fora).nome}${suf}`;
  void adv;
  return { tipo: base ? "base" : "profissional", escalacao: esc, casa: jogo.casa, fora: jogo.fora, nomeCasa: nomeC, nomeFora: nomeF, souCasa: jogo.souCasa, ...(infoCopa ? { copa: infoCopa } : {}),
    entrada, saida, golsCasa: gc, golsFora: gf, lances, decisoes, base: { gols: d.gols, assist: d.assistencias, nota: d.nota }, fAdv: advF,
    nomes, ctx, abertura: narr.abertura, narracao: narr.linhas };
}

/** Janelas de minuto para os lances do jogador: só com ele em campo (depois de entrar, antes de sair),
 *  divididas em partes iguais para os lances não se amontoarem. */
export function janelasDeLance(entrada: number, saida: number, n: number): [number, number][] {
  const ini = entrada > 0 ? entrada + 2 : 5, fim = Math.min(90, saida) - 1;
  n = Math.min(n, fim - ini + 1); // poucos minutos em campo: menos lances
  if (n <= 0) return [];
  const passo = (fim - ini + 1) / n;
  return Array.from({ length: n }, (_, i) => {
    const lo = Math.round(ini + passo * i), hi = Math.max(lo, Math.round(ini + passo * (i + 1)) - 1);
    return [lo, Math.min(hi, fim)] as [number, number];
  });
}

/** Nível do adversário no lance: no profissional o lance já nasce numa situação boa para quem decide. */
const nivelAdversario = (p: Partida) => (p.tipo === "base" ? p.fAdv - 2 : p.fAdv - 6);

export function resolverDecisao(s: Save, p: Partida, d: Decisao, opcaoId: string): ResultadoDecisao {
  const op = SITUACAO[d.situacao].opcoes.find((o) => o.id === opcaoId)!;
  const hab = habilidade(s.jogador.at, s.jogador.personalidade, s.jogador.tracos, op);
  const rng = rngDe(s, "decisao", d.situacao, d.min, opcaoId);
  const nivel = sortearNivel(rng, hab, nivelAdversario(p), op);
  return { ...resolverEfeito(rng, op, nivel, { ...p.nomes, marco: String((p.ctx?.jogosPro ?? 0) + 1) }), min: d.min, nivel, situacao: d.situacao, opcao: opcaoId };
}
/** Melhor opção pela nota esperada (só para a política automática; a tela não mostra nada disso). */
export function melhorOpcao(s: Save, p: Partida, d: Decisao): string {
  const ops = SITUACAO[d.situacao].opcoes.filter((o) => d.opcoes.some((x) => x.id === o.id));
  return ops.map((op) => ({ id: op.id, v: notaEsperada(habilidade(s.jogador.at, s.jogador.personalidade, s.jogador.tracos, op), nivelAdversario(p), op) })).sort((a, b) => b.v - a.v)[0].id;
}

// ------------------------------------------------------------------ fim da semana
/** Resumo de uma partida do jogador (o da copa traz a competição e a fase). */
export interface ResumoPartida { nomeCasa: string; nomeFora: string; golsCasa: number; golsFora: number; nota: number; gols: number; assist: number; minutos: number; tipo: Partida["tipo"]; competicao?: string; rotulo?: string; penaltis?: string; escalacao?: Escalacao; melhorEmCampo?: boolean }
export interface ResumoSemana {
  rotulo: string; escalacao: Escalacao; partida?: ResumoPartida; copa?: ResumoPartida;
  ovrAntes: number; ovrDepois: number; ganhos: [Atributo, number][]; moral: [number, number]; cansaco: [number, number]; fama: [number, number];
  dinheiro?: { salario: number; aluguel: number; gastos?: number }; eventos: string[]; posicaoTabela: number; fimDeTemporada?: ResumoTemporada;
}

const POLEMICAS = [
  "Um vídeo seu dançando na balada às 3 da manhã rodou os grupos da torcida.",
  "Você respondeu um torcedor nas redes e virou assunto no programa de esporte.",
  "Uma foto sua na fila do show apareceu no perfil de fofoca na véspera do treino.",
];

/** Aplica uma partida do jogador: decisões, nota, estatísticas, moral, torcida, fama, cansaço, lesão, relíquias e notícia.
 *  Serve para o jogo de domingo (liga) e o de quarta (copa continental). */
function aplicarPartida(pacote: PacoteDados, s: Save, partida: Partida, decisoes: ResultadoDecisao[], notaExtra: number, intensidadeAlta: boolean, rng: RNG, eventos: string[]):
  { resumo?: ResumoPartida; participacao: Participacao; nota: number; placar?: [number, number]; placarBase?: [number, number] } {
  const l = ligaAtual(pacote, s), c = s.carreira, j = s.jogador, casa = efeitosDaCasa(s.casa).total, copa = partida.copa;
  const adversario = partida.souCasa ? partida.fora : partida.casa;
  if (partida.escalacao === "lesionado" || partida.escalacao === "suspenso") return { participacao: "naoJogou", nota: 0 };
  if (partida.escalacao === "fora") { c.moral = clamp(c.moral - (copa ? 1 : 3), 0, 100); eventos.push(copa ? "Não foi relacionado para o jogo da copa." : "Não foi relacionado para o jogo."); return { participacao: "naoJogou", nota: 0 }; }
  let gc = partida.golsCasa, gf = partida.golsFora, gols = partida.base.gols, assist = partida.base.assist, nota = partida.base.nota;
  // expulsão: dois amarelos ou um vermelho tiram o jogador do jogo naquele minuto
  let amarelos = 0, expulsoMin = 99, saiuMin = 99;
  const mem: Memoria = c.memoria ?? (c.memoria = { vistos: {}, recentes: [] });
  for (const d of decisoes) { mem.vistos[d.situacao] = (mem.vistos[d.situacao] ?? 0) + 1; mem.recentes = [...mem.recentes.filter((x) => x !== d.situacao), d.situacao].slice(-MEMORIA_RECENTE); }
  for (const d of [...decisoes].sort((a, b) => a.min - b.min)) {
    const pos = SITUACAO[d.situacao]?.momento === "pos";
    if (!pos && d.min > Math.min(expulsoMin, saiuMin)) continue;
    if (d.golPro) { if (partida.souCasa) gc++; else gf++; }
    if (d.golContra) { if (partida.souCasa) gf++; else gc++; }
    if (d.meu === "gol") gols++; if (d.meu === "assist") assist++;
    nota += d.nota;
    if (d.fama) c.fama = clamp(c.fama + d.fama, 0, 100);
    if (d.moral) c.moral = clamp(c.moral + d.moral, 0, 100);
    if (d.relTecnico) c.relTecnico = clamp(c.relTecnico + d.relTecnico, 0, 100);
    if (d.seguidores) c.hype = clamp((c.hype ?? 0) + 2 * d.seguidores, -0.3, 1.5);
    if (d.lesao) c.lesao = Math.max(c.lesao, d.lesao);
    if (d.noticia) noticia(s, "polemica", "Repercussão", d.noticia);
    if (d.amarelo) amarelos++;
    if (d.vermelho || amarelos >= 2) {
      expulsoMin = d.min;
      eventos.push(`${amarelos >= 2 && !d.vermelho ? "Expulso com dois amarelos" : "Cartão vermelho"}${copa ? " na copa" : ""}. Fica fora do próximo jogo${copa ? " da copa" : ""}.`);
      if (copa && ehEstadual(copa.id)) c.suspensaoEstadual = 1; else if (copa) c.suspensaoCopa = 1; else c.suspensao = 1;
    } else if (d.amarelo) eventos.push(`Levou cartão amarelo${copa ? " na copa" : ""}.`);
    if (d.sai && !d.vermelho && saiuMin === 99 && expulsoMin === 99) { saiuMin = d.min; eventos.push(`Saiu de campo aos ${d.min} minutos.`); }
  }
  const foraMin = Math.min(expulsoMin, saiuMin);
  if (foraMin < 99) {
    // tira do jogador os gols e assistências do placar original que vieram depois de ele sair
    for (const x of partida.lances) if (x.meu && x.min > foraMin) { if (x.meu === "gol") gols--; else assist--; }
    partida.saida = Math.min(partida.saida, foraMin);
    if (expulsoMin < 99) nota -= 0.5;
  }
  const minutos = Math.max(0, Math.min(90, partida.saida) - partida.entrada);
  if (minutos > 0) nota = Math.round(clamp(nota + notaExtra, 3, 10) * 10) / 10; else nota = 0;
  const pro = partida.tipo === "profissional";
  const placar: [number, number] | undefined = pro ? [gc, gf] : undefined;
  const placarBase: [number, number] | undefined = partida.tipo === "base" && !copa ? [gc, gf] : undefined;
  // troca de camisa no apito final (o craque do outro lado pediu): vai para o armário
  const craque = partida.nomes.craque;
  if (craque && decisoes.some((d) => d.situacao === "camisa" && d.opcao === "trocar")) {
    const info = infoClube(pacote, adversario), ano = ANO_INICIAL + c.temporada;
    receberReliquias(s, [{ conquista: "camisa-troca", reliquia: { id: `rel-camisa-troca-${craque.replace(/\W+/g, "")}-${ano}`, chave: "camisa-troca", tipo: "camisa", nome: `Camisa de ${craque}`, legenda: `${info?.nome ?? ""}${partida.tipo === "base" ? ` ${categoriaBase(j.idade)}` : ""} · troca no apito final · ${ano}`, ano, cores: [info?.cores[0] ?? "#FFFFFF", info?.cores[1] ?? "#111111"], modelo: info?.padrao ?? "lisa", numero: String(1 + (craque.length * 7) % 30) } }], eventos);
  }
  const resumo: ResumoPartida = { nomeCasa: partida.nomeCasa, nomeFora: partida.nomeFora, golsCasa: gc, golsFora: gf, nota, gols, assist, minutos, tipo: partida.tipo, escalacao: partida.escalacao,
    ...(copa ? { competicao: copa.nome, rotulo: copa.rotulo } : {}) };
  if (minutos <= 0) {
    if (partida.escalacao === "banco") { c.moral = clamp(c.moral - 1, 0, 100); eventos.push(copa ? "Ficou no banco o jogo da copa todo." : "Ficou no banco o jogo todo."); }
    return { resumo, participacao: "naoJogou", nota: 0, placar, placarBase };
  }
  const participacao: Participacao = pro ? (partida.escalacao === "titular" ? "titular" : "entrou") : "base";
  // melhor em campo: na liga, contra as notas dos outros jogadores dos dois times na rodada; nas copas, contra uma régua sorteada
  if (pro) {
    const jl = !copa ? jogoDaSemana(s) : undefined, lid = infoLiga(c.ligaId).id;
    if (jl) (c.notasRodada ??= {})[jl.rodada] = { nota, gols, assist };
    const outros = jl ? notasDaRodada(pacote, lid, jl.rodada, [partida.casa, partida.fora]).map((x) => x.nota) : [];
    const regua = outros.length ? Math.max(...outros) : clamp(8.2 + rng.normal(0, 0.5), 7.3, 9.5);
    if (nota >= regua && nota >= 6.8) {
      resumo.melhorEmCampo = true; c.stats.mvp = (c.stats.mvp ?? 0) + 1; c.moral = clamp(c.moral + 2, 0, 100);
      eventos.push(`Melhor em campo${copa ? ` (${COPAS[copa.id].curto})` : ""}!`);
      const total = (c.stats.mvp ?? 0) + c.historico.reduce((a, h) => a + (h.mvp ?? 0), 0), ano = ANO_INICIAL + c.temporada;
      if ([1, 10, 25, 50, 100].includes(total)) receberReliquias(s, [{ conquista: `trofeu-mvp-${total}`, reliquia: { id: `rel-trofeu-mvp-${total}`, chave: `trofeu-mvp-${total}`, tipo: "trofeu", nome: total === 1 ? "Primeiro prêmio de melhor em campo" : `${total} prêmios de melhor em campo`, legenda: `${partida.nomeCasa} ${gc} × ${gf} ${partida.nomeFora} · ${ano}`, ano, cores: ["#E3B341", "#9A7420"], modelo: "estrela" } }], eventos);
    }
  }
  if (copa && ehDeSelecao(copa.id)) {
    const sl = (c.selecao ??= { jogos: 0, gols: 0, assist: 0, convocacoes: 0, copas: [], conv: {} });
    sl.jogos++; sl.gols += gols; sl.assist += assist;
    if (copa.id !== "SEL") { const nc = ((sl.naTorneio ??= {})[copa.id] ??= { jogos: 0, gols: 0, assist: 0 }); nc.jogos++; nc.gols += gols; nc.assist += assist; }
    c.fama = clamp(c.fama + (copa.id === "COP" ? 1.5 : copa.id === "SEL" ? 0.7 : 1.1) + gols * 0.5, 0, 100);
    if (!sl.estreia) {
      sl.estreia = ANO_INICIAL + c.temporada; eventos.push("Estreia pela seleção!");
      const sel = selecaoDe(pacote, j.nacionalidade)!, info = infoClube(pacote, sel.id);
      receberReliquias(s, [{ conquista: "camisa-selecao", reliquia: { id: "rel-camisa-selecao", chave: "camisa-selecao", tipo: "camisa", nome: "Camisa da estreia pela seleção", legenda: `${sel.nome} · ${partida.nomeCasa} ${gc} × ${gf} ${partida.nomeFora} · ${ANO_INICIAL + c.temporada}`, ano: ANO_INICIAL + c.temporada, cores: [info.cores[0], info.cores[1] ?? "#FFFFFF"], modelo: "lisa", numero: j.numero } }], eventos);
    }
  } else if (copa) { const vazio = () => ({ jogos: 0, gols: 0, assist: 0, notas: [] as number[] }); const sc = ehEstadual(copa.id) ? (c.statsEstadual ??= vazio()) : copa.id === "INT" || copa.id === "MUN" ? ((c.statsExtra ??= {})[copa.id] ??= vazio()) : (c.statsCopa ??= vazio()); sc.jogos++; sc.gols += gols; sc.assist += assist; sc.notas.push(nota); }
  else if (pro) { c.stats.jogos++; if (partida.escalacao === "titular") c.stats.titular++; c.stats.gols += gols; c.stats.assist += assist; c.stats.notas.push(nota); }
  else { c.stats.base++; c.stats.baseGols += gols; (c.stats.baseNotas ??= []).push(nota); }
  if (pro) { const ms = (c.mesStats ??= { gols: 0, assist: 0, notas8: 0 }); ms.gols += gols; ms.assist += assist; if (nota >= 8) ms.notas8++; }
  if (pro && !copa) { c.jogosPorClube ??= {}; c.jogosPorClube[c.clubeId] = (c.jogosPorClube[c.clubeId] ?? 0) + 1; }
  if (!copa) {
    // relíquias do jogo: estreia, primeiro gol, hat-trick, golaços, marcas
    const meusGols = partida.souCasa ? gc : gf, golsAdv = partida.souCasa ? gf : gc, cc = clubeCasa(pacote, c.clubeId);
    const totPro = (k: "jogos" | "gols") => c.stats[k] + c.historico.reduce((a, h) => a + h[k], 0);
    const ganhos = reliquiasDaPartida({
      tipo: partida.tipo, ano: ANO_INICIAL + c.temporada, semana: c.semana, adversario: clubeCasa(pacote, adversario).apelido, clubeId: c.clubeId, clubeNome: cc.nome, cores: cc.cores, numero: j.numero,
      padrao: infoClube(pacote, c.clubeId).padrao, ligaId: infoLiga(c.ligaId).id,
      placar: `${meusGols} × ${golsAdv}`, gols, minutos, jogosPro: totPro("jogos"), golsPro: totPro("gols"),
      jogosBase: c.stats.base + c.historico.reduce((a, h) => a + h.base, 0), golsBase: c.stats.baseGols + c.historico.reduce((a, h) => a + (h.baseGols ?? 0), 0),
      jogosNoClube: c.jogosPorClube?.[c.clubeId] ?? 0,
      golacos: decisoes.filter((d) => d.nivel === 0 && d.meu === "gol" && d.min <= foraMin).map((d) => `${d.situacao}/${d.opcao}`),
    }, (id) => (s.casa.reliquias ?? []).some((r) => r.id === id));
    receberReliquias(s, ganhos, eventos);
  }
  c.formaUlt = [...c.formaUlt.slice(-4), nota];
  if (pro) c.torcida = clamp((c.torcida ?? 50) + (nota - 6.5) * (copa ? 2 : 1.5) + gols, 0, 100);
  c.moral = clamp(c.moral + 3 * (nota - 6.5), 0, 100);
  c.relTecnico = clamp(c.relTecnico + (nota - 6.5) * (pro ? 1 : 1.5) * (c.tecnico?.estilo === "linha-dura" ? 1.5 : 1), 0, 100);
  const grande = (mundo(pacote).clube[c.clubeId] ?? clubeDe(l, c.clubeId)).forca >= 75 ? 1.5 : 1, vitrine = copa && !ehEstadual(copa.id) ? 1.5 : 1;
  c.fama = clamp(c.fama + (1 - c.fama / 110) * (pro ? vitrine * grande * (0.5 * gols + (nota >= 8 ? 0.3 : 0)) : 0.1 * gols + (nota >= 8 ? 0.1 : 0)), 0, 100);
  c.cansaco = clamp(c.cansaco + (30 * minutos) / 90, 0, 100);
  const l2 = sortearLesao(rng, c.cansaco, intensidadeAlta, j.idade, 1 - (1 - casa.lesao / 100) * (pro ? 1 : 0.6) * riscoLesaoFamilia(c.familia));
  if (l2) { c.lesao = Math.max(c.lesao, l2.semanas); eventos.push(`Lesão ${l2.tipo === "leve" ? "leve" : l2.tipo === "media" ? "muscular" : "grave"}${copa ? " no jogo da copa" : ""}: ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); noticia(s, "lesao", "Lesão", `${j.apelido} se machucou e fica ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); }
  const res = (partida.souCasa ? gc - gf : gf - gc) > 0 ? "vitória" : gc === gf ? "empate" : "derrota";
  noticia(s, "jogo", `${copa ? `${COPAS[copa.id].curto}: ` : ""}${partida.nomeCasa} ${gc} × ${gf} ${partida.nomeFora}`,
    `${res[0].toUpperCase() + res.slice(1)}${copa ? ` pela ${copa.nome} (${copa.rotulo.toLowerCase()})` : pro ? "" : faseAmadora(c) ? ` ${ROTULO_FASE[c.fase!]}` : " na base"}. ${j.apelido} jogou ${minutos} minutos${gols ? `, fez ${gols} ${gols > 1 ? "gols" : "gol"}` : ""}${assist ? `, deu ${assist} ${assist > 1 ? "assistências" : "assistência"}` : ""} e tirou nota ${nota.toFixed(1)}.`, { k: "placar", casa: partida.casa, fora: partida.fora, gc, gf });
  return { resumo, participacao, nota, placar, placarBase };
}

/** Quarta-feira: aplica o jogo da copa do jogador e roda a rodada da copa. Fica guardado para o resumo da semana. */
export function concluirJogoDaCopa(pacote: PacoteDados, s: Save, plano: Plano, partida: Partida, decisoes: ResultadoDecisao[]): ResumoPartida | undefined {
  const c = s.carreira, eventos: string[] = [], rng = rngDe(s, "copa-quarta"), info = partida.copa;
  if (!info) return;
  if (partida.escalacao === "suspenso") { if (ehEstadual(info.id)) c.suspensaoEstadual = 0; else c.suspensaoCopa = 0; eventos.push(`Cumpriu suspensão no ${COPAS[info.id].curto}.`); }
  const r = aplicarPartida(pacote, s, partida, decisoes, previaPlano(s, { ...plano, acoes: plano.acoes.slice(0, 2) }).notaExtra, plano.intensidade === "alta", rng, eventos);
  const e = copasDe(pacote, s)[info.id]!, w = mundo(pacote), forca = (id: string) => w.clube[id]?.forca ?? 60;
  const placar = r.placar ?? (partida.lances.length || partida.entrada ? [partida.golsCasa, partida.golsFora] as [number, number] : undefined);
  rodarSemana(e, c.semana, forca, rngDe(s, "copa-rodada"), placar ? { id: info.jogoId, gc: placar[0], gf: placar[1] } : undefined);
  const jg = e.jogos.find((x) => x.id === info.jogoId)!;
  const resumo: ResumoPartida = r.resumo ?? { nomeCasa: partida.nomeCasa, nomeFora: partida.nomeFora, golsCasa: jg.gc!, golsFora: jg.gf!, nota: 0, gols: 0, assist: 0, minutos: 0, tipo: "profissional", competicao: info.nome, rotulo: info.rotulo, escalacao: partida.escalacao };
  if (jg.penaltis) { resumo.penaltis = w.info[jg.penaltis]?.nome; eventos.push(`Decisão nos pênaltis: ${w.info[jg.penaltis]?.nome} passou.`); }
  noticiasDaCopa(pacote, s, e, eventos);
  c.meioSemana = { semana: c.semana, resumo, participacao: r.participacao, nota: r.nota, eventos };
  return resumo;
}
/** Notícias da rodada da copa: classificação/eliminação do clube do jogador e o campeão. */
function noticiasDaCopa(pacote: PacoteDados, s: Save, e: EstadoCopa, eventos: string[]) {
  const c = s.carreira, w = mundo(pacote), nome = (id: string) => w.info[id]?.nome ?? id, meu = e.clubes.includes(c.clubeId);
  // estaduais dos outros estados: sem notícia (só o do clube do jogador e o do estado dele)
  if (ehEstadual(e.id) && !meu && COPAS[e.id].uf !== ufDoClube(c.clubeId, w.info[c.clubeId]?.cidade ?? "")) return;
  const da = COPAS[e.id].prep;
  const chave = `${e.temporada}-${e.fase}`, avisos = (c.avisosCopa ??= {});
  if (avisos[e.id] === chave) return;
  avisos[e.id] = chave;
  if (e.fase === "fim" && e.campeao) {
    noticia(s, "jogo", `${nome(e.campeao)} é campeão ${da} ${COPAS[e.id].nome}`, `${nome(e.campeao)} conquista ${da === "da" ? "a" : "o"} ${COPAS[e.id].curto} ${ANO_INICIAL + e.temporada}.`, { k: "trofeu" });
    if (e.campeao === c.clubeId) eventos.push(`CAMPEÃO ${da.toUpperCase()} ${COPAS[e.id].curto.toUpperCase()}!`);
  } else if (meu && e.fase !== "grupos" && e.fase !== "liga" && e.fase !== "turno" && e.fase !== "derby") {
    const ORDEM = ["derby", "desafio", "turno", "grupos", "liga", "playoff", "oitavas", "quartas", "semi", "final", "fim"];
    const passou = ORDEM.indexOf(e.chegou[c.clubeId]) >= ORDEM.indexOf(e.fase);
    if (passou) { eventos.push(`${nome(c.clubeId)} classificado: ${NOME_FASE[e.fase].toLowerCase()} ${da} ${COPAS[e.id].curto}.`); noticia(s, "clube", `${COPAS[e.id].curto}: ${nome(c.clubeId)} avança`, `O ${nome(c.clubeId)} está nas ${NOME_FASE[e.fase].toLowerCase()} ${da} ${COPAS[e.id].nome}.`); }
    else if (avisos[`${e.id}-fora`] !== String(e.temporada)) { avisos[`${e.id}-fora`] = String(e.temporada); eventos.push(`${nome(c.clubeId)} eliminado ${da} ${COPAS[e.id].curto}.`); noticia(s, "clube", `${COPAS[e.id].curto}: fim do sonho`, `O ${nome(c.clubeId)} está fora ${da} ${COPAS[e.id].nome} (${NOME_FASE[e.chegou[c.clubeId]].toLowerCase()}).`); }
  }
}
/** Roda as copas na semana (os jogos que ainda não foram jogados) e dá as notícias. */
function avancarCopas(pacote: PacoteDados, s: Save, eventos: string[]) {
  const c = s.carreira, w = mundo(pacote), forca = (id: string) => w.clube[id]?.forca ?? 60;
  for (const e of Object.values(copasDe(pacote, s))) {
    if (!e || !e.jogos.some((x) => x.semana === c.semana && x.gc === undefined)) continue;
    rodarSemana(e, c.semana, forca, rngDe(s, `copa-rodada-${e.id}`));
    noticiasDaCopa(pacote, s, e, eventos);
  }
}

export function concluirSemana(pacote: PacoteDados, s: Save, plano: Plano, partida: Partida | undefined, decisoes: ResultadoDecisao[]): ResumoSemana {
  sincronizar(pacote, s);
  const l = ligaAtual(pacote, s), c = s.carreira, j = s.jogador, rng = rngDe(s, "semana");
  const casa = efeitosDaCasa(s.casa).total;
  const rotulo = rotuloSemana(c);
  const ovrAntes = ovr(j), atAntes = { ...j.at }, moral0 = c.moral, cansaco0 = c.cansaco, fama0 = c.fama;
  const eventos: string[] = [];
  const validas = acoesValidas(s, plano), travados = diasTravados(s);
  const cont = (a: Acao) => validas.filter((x) => x === a).length;

  // 1. a semana fora de campo
  const prev = previaPlano(s, plano);
  c.cansaco = prev.cansaco; c.moral = prev.moral;
  c.relTecnico = clamp(c.relTecnico + cont("video") + (cont("treino") >= 2 ? 1 : 0), 0, 100);
  if (c.tecnico?.estilo === "motivador" && !c.fase && !c.mercado?.semClube) c.moral = clamp(c.moral + 1, 0, 100);
  if (cont("redes")) {
    c.engajamento = clamp((c.engajamento ?? 40) + 9 * cont("redes"), 0, 100);
    c.fama = clamp(c.fama + 0.15 * cont("redes"), 0, 100); c.exposicao = clamp(c.exposicao + 2 * cont("redes"), 0, 100);
  }
  if (cont("amigos")) c.vidaNoturna = clamp(c.vidaNoturna + 2 * cont("amigos"), 0, 100);
  let polemica = false;
  plano.acoes.forEach((a, dia) => {
    if (travados.includes(dia)) return;
    const risco = a === "amigos" ? (dia === 4 && partida ? 0.1 : 0.05) : a === "redes" ? 0.01 + j.personalidade.temperamento / 400 : 0;
    if (risco && rng.chance(risco)) {
      const t = rng.pick(POLEMICAS);
      c.moral = clamp(c.moral - 5, 0, 100); c.relTecnico = clamp(c.relTecnico - 4, 0, 100); c.fama = clamp(c.fama + 1, 0, 100); c.torcida = clamp((c.torcida ?? 50) - 2, 0, 100);
      polemica = true;
      eventos.push(`Polêmica na ${DIAS[dia].toLowerCase()}: ${t}`);
      noticia(s, "polemica", "Polêmica", t);
    }
  });

  // 2. o jogo (o de quarta, pela copa, já foi aplicado em concluirJogoDaCopa)
  const jogo = jogoDaSemana(s);
  if (partida?.escalacao === "suspenso") { c.suspensao = 0; eventos.push("Cumpriu suspensão."); }
  const rj = partida && jogo ? aplicarPartida(pacote, s, partida, decisoes, prev.notaExtra, plano.intensidade === "alta", rng, eventos) : undefined;
  let participacao: Participacao = rj?.participacao ?? (c.semana < SEMANAS_PRE ? "base" : "naoJogou");
  // seleção da rodada (e, a cada quatro rodadas, do mês): o jogador entra se a nota dele estiver entre as melhores da posição
  if (jogo && !c.fase) {
    const lid = infoLiga(c.ligaId).id, eu = (r: number): Selecionado[] => { const x = c.notasRodada?.[r]; return x ? [{ nome: s.jogador.apelido, clubeId: c.clubeId, posicao: s.jogador.posicao, nota: x.nota, gols: x.gols, assist: x.assist, eu: true }] : []; };
    if (c.notasRodada?.[jogo.rodada] && selecaoDaRodada(pacote, lid, jogo.rodada, eu(jogo.rodada)).some((x) => x.eu)) {
      c.stats.selRodada = (c.stats.selRodada ?? 0) + 1; c.fama = clamp(c.fama + 0.3, 0, 100); eventos.push(`Seleção da ${jogo.rodada + 1}ª rodada!`);
    }
    if ((jogo.rodada + 1) % 4 === 0) {
      const rs = [0, 1, 2, 3].map((k) => jogo.rodada - 3 + k);
      if (selecaoDoMes(pacote, lid, rs, rs.flatMap(eu)).some((x) => x.eu)) {
        c.stats.selMes = (c.stats.selMes ?? 0) + 1; c.fama = clamp(c.fama + 1, 0, 100); c.moral = clamp(c.moral + 3, 0, 100);
        eventos.push("Seleção do mês!");
        noticia(s, "jogo", `${s.jogador.apelido} na seleção do mês`, `Rodadas ${rs[0] + 1} a ${rs[3] + 1} da ${infoLiga(c.ligaId).curto}: ${s.jogador.apelido} está entre os onze melhores.`);
      }
    }
  }
  const resumoPartida = rj?.resumo, placarMeuJogo = rj?.placar, placarBase = rj?.placarBase;
  let notaSemana = rj?.nota ?? 0;
  // semana com jogo de copa: o que aconteceu na quarta entra na evolução e no resumo
  const quarta = c.meioSemana?.semana === c.semana ? c.meioSemana : undefined;
  if (quarta) {
    eventos.unshift(...quarta.eventos);
    const peso: Record<string, number> = { titular: 4, entrou: 3, base: 2, naoJogou: 1, ferias: 0 };
    if ((peso[quarta.participacao] ?? 0) > (peso[participacao] ?? 0)) participacao = quarta.participacao;
    if (!notaSemana) notaSemana = quarta.nota;
  }

  // 3. a rodada da liga
  if (jogo) {
    for (const g of jogosDaRodada(c, jogo.rodada)) {
      const meu = g.casa === c.clubeId || g.fora === c.clubeId;
      const [a, b] = meu && placarMeuJogo ? placarMeuJogo : simularPlacar(rng, clubeDe(l, g.casa).forca, clubeDe(l, g.fora).forca);
      registrar(c.tabela.find((t) => t.clube === g.casa)!, a, b);
      registrar(c.tabela.find((t) => t.clube === g.fora)!, b, a);
      if (meu) { const [gp, gc] = g.casa === c.clubeId ? [a, b] : [b, a]; c.resultadosClube = [...(c.resultadosClube ?? []).slice(-9), gp > gc ? 3 : gp === gc ? 1 : 0]; }
    }
    // tabela da base (sub-17 ou sub-20 do clube, conforme a idade): os mesmos confrontos, com a força dos times da base
    if (c.formacao && !c.fase) {
      const cat = categoriaBase(j.idade);
      if (!c.tabelaBase || c.tabelaBase.cat !== cat || c.tabelaBase.t !== c.temporada) c.tabelaBase = { cat, t: c.temporada, tabela: novaTabela(l) };
      const fb = (id: string) => forcaDaBase(pacote, id, j.idade, clubeDe(l, id).forca), rb = rngDe(s, "tabela-base");
      for (const g of jogosDaRodada(c, jogo.rodada)) {
        const meu = g.casa === c.clubeId || g.fora === c.clubeId;
        const [a, b] = meu && placarBase ? placarBase : simularPlacar(rb, fb(g.casa), fb(g.fora));
        const tb = c.tabelaBase.tabela;
        registrar(tb.find((t) => t.clube === g.casa)!, a, b); registrar(tb.find((t) => t.clube === g.fora)!, b, a);
      }
    }
  }

  // 3b. a rodada das copas continentais (os jogos de quarta que faltam)
  avancarCopas(pacote, s, eventos);

  // 4. evolução e recuperação
  if (c.lesao > 0 && participacao !== "titular" && participacao !== "entrou") { participacao = "ferias"; }
  const evoluido = evoluirSemana(j.at, j.pot, { idade: j.idade, foco: plano.foco, intensidade: plano.intensidade, participacao, moral: c.moral, personalTrainer: false, profissionalismo: j.personalidade.profissionalismo, fClube: fatorDoClube(pacote, s) });
  const vida = efeitosVida(padraoDe(c));
  // família e namoro: a semana deles mexe na moral, no treino e na recuperação
  const fam = familiaDe(pacote, s), cidadeAgora = infoClube(pacote, c.clubeId).cidade;
  const sf = semanaFamilia(fam, { semanaAbs: semanaAbsJogo(c), exterior: infoLiga(c.ligaId).regiao !== "BRA" && s.jogador.pais === "BRA", padraoFamilia: padraoDe(c).familia, polemica, clubeId: c.clubeId, nota: notaSemana, ovrJogador: ovr(j) });
  eventos.push(...sf.avisos);
  if (sf.pressao) c.pressao = clamp(c.pressao + sf.pressao, 0, 100);
  const nam = namoroDe(c), ctxN = ctxNamoro(pacote, s);
  const sn = semanaNamoro(nam, { ...ctxN, mudouDeCidade: nam.par && nam.par.cidadeClube !== cidadeAgora ? cidadeAgora : undefined });
  eventos.push(...sn.avisos);
  if (sn.custo) s.casa.saldo -= sn.custo;
  if (sn.escandalo) { c.fama = clamp(c.fama + 1.5, 0, 100); c.torcida = clamp((c.torcida ?? 50) - 4, 0, 100); c.exposicao = clamp(c.exposicao + 10, 0, 100); }
  if (sn.noticia) noticia(s, sn.escandalo ? "polemica" : "vida", sn.noticia, sn.escandalo ? `As fotos rodaram as redes. Patrocinadores e torcida comentam a vida pessoal de ${s.jogador.apelido}.` : `${s.jogador.apelido} confirmou. A vida segue.`);
  const en = efeitosNamoro(nam);
  const mult = 1 + cont("treino") * 0.1 + (casa.evolucao + vida.evolucao + en.evolucao) / 100 + c.bonusEvolucao - (c.treinoPosicao ? 0.1 : 0) + (paiTreinador(fam) ? 0.05 : 0);
  for (const k of ATRIBUTOS) j.at[k] = clamp(j.at[k] + (evoluido[k] - j.at[k]) * (evoluido[k] > j.at[k] ? mult : 1), 1, 99);
  if (c.lesao > 0) c.lesao--;
  c.cansaco = clamp(c.cansaco - 20 - casa.recuperacao - vida.recuperacao - en.recuperacao, 0, 100);
  c.moral = clamp(c.moral + 0.18 * (60 + casa.moral + vida.moral + sf.moral + en.moral + en.conforto / 3 - c.moral) + sn.moral, 0, 100);
  c.fama = clamp(c.fama + (casa.fama + vida.fama) * 0.02 + en.fama, 0, 100);
  if (vida.noite) c.vidaNoturna = clamp(c.vidaNoturna + 0.3 * vida.noite, 0, 100);
  if (en.noite) c.vidaNoturna = clamp(c.vidaNoturna + en.noite, 0, 100);
  if (en.pressao) c.pressao = clamp(c.pressao + en.pressao, 0, 100);
  if (en.torcida) c.torcida = clamp((c.torcida ?? 50) + en.torcida, 0, 100);
  if (en.engajamento) c.engajamento = clamp((c.engajamento ?? 40) + en.engajamento, 0, 100);
  if (participacao !== "titular" && participacao !== "entrou") c.fama = clamp(c.fama * 0.995, 0, 100);
  { // a fama volta aos poucos para o tamanho real do jogador e do clube
    const cl = clubeDe(l, c.clubeId), ref = famaDeReferencia(ovr(j), visibilidade(c.clubeId, c.ligaId, cl.fClube));
    c.fama = clamp(c.fama + (ref - c.fama) * (c.fama > ref ? 0.012 : 0.004), 0, 100);
  }
  // redes: quem não posta perde engajamento; repercussão de lance passa
  c.engajamento = clamp((c.engajamento ?? 40) - 2.5, 0, 100);
  c.hype = (c.hype ?? 0) * 0.85;
  c.torcida = clamp((c.torcida ?? 50) + (50 - (c.torcida ?? 50)) * 0.005, 0, 100);
  (c.torcidaMax ??= {})[c.clubeId] = Math.max(c.torcidaMax[c.clubeId] ?? 0, c.torcida);
  const seg0 = c.seguidores;
  c.seguidores = semanaRedes(c.seguidores, alvoDeSeguidores(pacote, s));
  if (Math.abs(c.seguidores - seg0) >= Math.max(5000, seg0 * 0.01)) eventos.push(`${c.seguidores > seg0 ? "+" : "−"}${Math.abs(c.seguidores - seg0).toLocaleString("pt-BR")} seguidores nas redes.`);

  // 5. dinheiro no fim do mês
  let dinheiro: ResumoSemana["dinheiro"];
  if (c.semana % 4 === 3) {
    const pat = fecharMesPatrocinios(s, eventos);
    // várzea, academia, colégio e universidade: a família paga o custo de vida
    const liquido = salarioLiquido(c) + pat, g = c.fase ? { itens: [], total: 0 } : gastosDoMes(padraoDe(c), c.ligaId, c.salario, c.fama, c.formacao, manutencaoMensal(s.casa));
    const { aluguel } = fecharMes(s.casa, liquido - g.total);
    if (c.mesesPatrocinio > 0) c.mesesPatrocinio--; else c.patrocinioMensal = 0;
    dinheiro = { salario: Math.round(liquido), aluguel, gastos: g.total };
    noticia(s, "dinheiro", "Fechou o mês", `R$ ${Math.round(liquido).toLocaleString("pt-BR")} de salário líquido, R$ ${g.total.toLocaleString("pt-BR")} de custo de vida${aluguel ? `, R$ ${aluguel.toLocaleString("pt-BR")} de aluguel` : ""}.`);
    if (s.casa.saldo < 0) { c.moral = clamp(c.moral - 4, 0, 100); eventos.push("Conta no vermelho: o custo de vida está maior que o salário."); noticia(s, "dinheiro", "Conta no vermelho", "Os gastos passaram do que entra. Hora de rever o padrão de vida."); }
  }

  // 6. avança
  const ganhos = ATRIBUTOS.map((k) => [k, j.at[k] - atAntes[k]] as [Atributo, number]).sort((x, y) => y[1] - x[1]).slice(0, 3);
  c.meioSemana = undefined;
  c.semana++;
  let fim: ResumoTemporada | undefined;
  // Copa do Mundo: a lista sai antes da primeira rodada (e a temporada continua se ele foi chamado)
  if (c.semana === SEMANAS_TEMPORADA) for (const id of TORNEIOS_FIM) if (c.copas?.[id]?.clubes.includes(idSelecao(s.jogador.nacionalidade))) convocado(pacote, s, chaveConv(id, c.temporada, 0));
  if (c.semana >= SEMANAS_TEMPORADA && !noMundial(s)) fim = fimDeTemporada(pacote, s, eventos);
  // 7. mercado: propostas da janela, renovação, empréstimo; nos caminhos de formação, olheiros e convites
  semanaDoMercado(pacote, s, rngDe(s, "mercado"), eventos);
  semanaDoCaminho(pacote, s, notaSemana, notaSemana > 0, eventos);
  // 8. patrocinadores: proposta vence em 4 semanas; marcas novas aparecem conforme a fama
  if (c.propPatrocinio && semanaAbsJogo(c) >= c.propPatrocinio.expira) { eventos.push(`A proposta da ${MARCA[c.propPatrocinio.marca]?.nome ?? "marca"} expirou.`); c.propPatrocinio = undefined; }
  if (!c.propPatrocinio && (c.patrocinios?.length ?? 0) < 4) {
    const r3 = rngDe(s, "patrocinio");
    if (r3.chance(0.025 + c.fama / 700)) {
      const m = marcaInteressada(r3, c.fama, j.idade, c.patrocinios ?? [], c.recusadas ?? []);
      if (m) { c.propPatrocinio = { marca: m.id, opcoes: ofertasDaMarca(r3, m, c.fama, c.seguidores), expira: semanaAbsJogo(c) + 4 }; eventos.push(`Proposta de patrocínio: ${m.nome}.`); noticia(s, "dinheiro", `${m.nome} quer patrocinar ${j.apelido}`, `A marca mandou três modelos de contrato. A proposta vale por quatro semanas.`, { k: "patrocinio", marca: m.id }); }
    }
  }
  // 9. relações: convivência, redes, túnel do jogo e troca de camisa
  {
    const rr = relacoesDe(c), r4 = rngDe(s, "relacoes"), ano = ANO_INICIAL + c.temporada, clube = mundo(pacote).clube[idClube(c.clubeId)];
    const naBase = c.formacao && !c.fase;
    semanaRelacoes(rr, r4, naBase ? timeDaBase(pacote, c.clubeId, j.idade) : clube ? elencoAtual(pacote, s) : [], c.clubeId, ano, cont("amigos"));
    const est = estrelas(pacote);
    for (let k = 0; k < cont("redes"); k++) {
      const seguidas = est.filter((e) => (rr.lista[e.nome]?.nivel ?? 0) > 0);
      const e = seguidas.length && r4.chance(0.7) ? r4.pick(seguidas) : r4.pick(est.slice(0, 60));
      subir(relacao(rr, e.nome, e.clubeId, ano), 2 * atencao(c.fama, e.fama));
    }
    if (jogo && partida && participacao !== "naoJogou" && participacao !== "base") {
      for (const e of est.filter((x) => x.clubeId === jogo.adversario)) {
        const x = relacao(rr, e.nome, e.clubeId, ano); subir(x, 2);
        if (rr.camisaPedida === e.nome) {
          rr.camisaPedida = undefined;
          if (r4.chance(chanceCamisa(x.nivel, c.fama, e.fama))) {
            x.camisa = true; subir(x, 8);
            const info = infoClube(pacote, e.clubeId);
            receberReliquias(s, [{ conquista: "camisa-troca", reliquia: { id: `rel-camisa-troca-${e.nome.replace(/\W+/g, "")}-${ano}`, chave: "camisa-troca", tipo: "camisa", nome: `Camisa de ${e.nome}`, legenda: `${info.nome} · troca depois do jogo · ${ano}`, ano, cores: [info.cores[0], info.cores[1] ?? "#FFFFFF"], modelo: info.padrao, numero: String(e.numero) } }], eventos);
            eventos.push(`${e.nome} trocou de camisa com você no fim do jogo!`);
          } else { subir(x, -2); eventos.push(`Você pediu, mas ${e.nome} trocou a camisa com outro jogador.`); }
        }
      }
    }
    if (rr.camisaPedida && (!jogo || !est.some((e) => e.nome === rr.camisaPedida && e.clubeId === jogo.adversario))) rr.camisaPedida = undefined;
  }
  // 10. treino de posição e sugestão do técnico
  {
    const fam = familiaridadeDe(j);
    if (c.treinoPosicao && c.treinoPosicao !== j.posicao) {
      const p = c.treinoPosicao, antes = fam[p] ?? 0;
      fam[p] = clamp(antes + ganhoSemanal(j.at, j.posicao, p, c.sugestaoPos?.pos === p && !!c.sugestaoPos.aceita, cont("treino")), 0, 100);
      if (antes < PODE_JOGAR && fam[p]! >= PODE_JOGAR) { eventos.push(`Já dá para jogar de ${NOME_POSICAO[p].toLowerCase()}.`); noticia(s, "clube", "Posição nova", `${j.apelido} já está pronto para jogar de ${NOME_POSICAO[p].toLowerCase()}. Ainda falta lapidar, mas o técnico pode contar com ele ali.`); }
      if (fam[p]! >= 100) { c.treinoPosicao = undefined; eventos.push(`Domina a posição de ${NOME_POSICAO[p].toLowerCase()}.`); }
    } else if (!c.sugestaoPos && c.semana > 2 && rngDe(s, "sugestao").chance(0.025)) {
      const p = sugestaoDoTecnico(j.at, j.posicao, fam);
      if (p) { c.sugestaoPos = { pos: p }; eventos.push(`O técnico quer testar você como ${NOME_POSICAO[p].toLowerCase()}.`); noticia(s, "clube", "Conversa com o técnico", `O técnico chamou ${j.apelido}: "Vejo você jogando de ${NOME_POSICAO[p].toLowerCase()}. Topa treinar?"`); }
    }
  }
  // 11. vida fora de campo: de vez em quando, uma decisão
  if (c.evento && !EVENTO[c.evento]) c.evento = undefined;
  if (!c.evento && c.semana > 0) {
    const r2 = rngDe(s, "evento");
    if (r2.chance(0.14)) {
      const ctx = contextoEvento(pacote, s), e = sortearEvento(r2, ctx, c.eventosVistos ??= {});
      if (e) { c.evento = e.id; c.eventosVistos[e.id] = c.temporada; eventos.push(`Fora de campo: ${e.titulo}.`); }
    }
  }
  checarRecordes(pacote, s, eventos);
  if (!fim) { noticiasDeLesao(pacote, s, eventos); demissaoNoMeio(pacote, s, eventos); }
  return {
    rotulo, escalacao: partida?.escalacao ?? (c.semana - 1 < SEMANAS_PRE ? "semJogo" : "fora"), partida: resumoPartida, ...(quarta ? { copa: quarta.resumo } : {}),
    ovrAntes, ovrDepois: ovr(j), ganhos, moral: [moral0, c.moral], cansaco: [cansaco0, c.cansaco], fama: [fama0, c.fama], dinheiro, eventos,
    posicaoTabela: posicaoNaTabela(fim ? s.carreira.historico.at(-1)!.posicao : undefined, s), fimDeTemporada: fim,
  };
}

export function salarioLiquido(c: Carreira): number {
  const s = c.salario, ir = c.formacao ? 0 : imposto(s, c.ligaId);
  return s - ir - AGENTES[c.agente].comissao * s + c.patrocinioMensal;
}
export function contextoEvento(pacote: PacoteDados, s: Save): CtxEvento {
  const c = s.carreira, info = infoClube(pacote, c.clubeId), li = infoLiga(c.ligaId);
  const fam = familiaDe(pacote, s), ano = ANO_INICIAL + c.temporada, pai = membro(fam, "pai");
  const base = { idade: s.jogador.idade, fama: c.fama, salario: c.salario, saldo: s.casa.saldo, exterior: li.regiao !== "BRA", golfo: li.id === "KSA1",
    titular: c.stats.titular > c.stats.jogos / 2, nome: s.jogador.apelido, clube: info.nome, cidade: info.cidade, liga: li.curto, temporada: c.temporada, seguidores: c.seguidores,
    paiVelho: !!pai && ano - pai.nasc >= 50, irmaoJoga: fam.membros.some((m) => (m.futebol?.fase === "amador" || m.futebol?.fase === "base") && ano - m.nasc >= 12 && ano - m.nasc <= 19),
    irmaoPro: fam.membros.some((m) => m.futebol?.fase === "pro"), proposta: (c.mercado?.propostas.length ?? 0) > 0 };
  return { ...base, fase: fasesDe(base, c.formacao) };
}
/** Evento esperando decisão (com o texto já preenchido). */
export function eventoPendente(pacote: PacoteDados, s: Save) {
  const e = s.carreira.evento ? EVENTO[s.carreira.evento] : undefined;
  if (!e) return undefined;
  const ctx = contextoEvento(pacote, s);
  return { id: e.id, titulo: e.titulo, texto: preencher(e.texto, ctx), opcoes: e.opcoes.map((o) => ({ id: o.id, rotulo: o.rotulo, custo: dinheiroDoEfeito(o.efeitos, s.carreira.salario) })) };
}
function aplicarEfeito(s: Save, f: EfeitoEvento): string[] {
  const c = s.carreira, notas: string[] = [];
  const din = dinheiroDoEfeito(f, c.salario);
  if (din) { s.casa.saldo += din; notas.push(`${din > 0 ? "+" : "−"}R$ ${Math.abs(din).toLocaleString("pt-BR")}`); }
  if (f.moral) c.moral = clamp(c.moral + f.moral, 0, 100);
  if (f.fama) c.fama = clamp(c.fama + f.fama, 0, 100);
  if (f.relTecnico) c.relTecnico = clamp(c.relTecnico + f.relTecnico, 0, 100);
  if (f.engajamento) c.engajamento = clamp((c.engajamento ?? 40) + f.engajamento, 0, 100);
  if (f.hype) c.hype = clamp((c.hype ?? 0) + f.hype, -0.3, 1.5);
  if (f.pressao) c.pressao = clamp(c.pressao + f.pressao, 0, 100);
  if (f.vidaNoturna) c.vidaNoturna = clamp(c.vidaNoturna + f.vidaNoturna, 0, 100);
  if (f.cansaco) c.cansaco = clamp(c.cansaco + f.cansaco, 0, 100);
  if (f.evolucao) c.bonusEvolucao += f.evolucao;
  const pat = patrocinioDoEfeito(f, c.salario);
  if (pat && f.patrocinio) { c.patrocinioMensal += pat; c.mesesPatrocinio = Math.max(c.mesesPatrocinio, f.patrocinio.meses); notas.push(`patrocínio de R$ ${pat.toLocaleString("pt-BR")}/mês`); }
  if (c.familia && (f.pais || f.irmao || f.irmaoPot || f.irmaoPara)) {
    const ms = c.familia.membros;
    for (const m of ms) if (f.pais && (m.parentesco === "pai" || m.parentesco === "mae")) m.relacao = clamp(m.relacao + f.pais, 0, 100);
    const novo = ms.find((m) => m.futebol && (m.futebol.fase === "amador" || m.futebol.fase === "base" || m.futebol.fase === "crianca"));
    const pro = ms.find((m) => m.futebol?.fase === "pro");
    const irm = (f.irmaoPot || f.irmaoPara ? novo : pro ?? novo);
    if (irm && f.irmao) irm.relacao = clamp(irm.relacao + f.irmao, 0, 100);
    if (novo?.futebol && f.irmaoPot) novo.futebol.pot = Math.min(95, novo.futebol.pot + f.irmaoPot);
    if (novo?.futebol && f.irmaoPara) { novo.futebol.fase = "parou"; novo.futebol.clubeId = undefined; novo.profissao = "Estudante"; }
  }
  return notas;
}
/** O jogador decide o evento fora de campo. */
export function resolverEvento(pacote: PacoteDados, s: Save, opcaoId: string): { titulo: string; texto: string } | undefined {
  const c = s.carreira, e = c.evento ? EVENTO[c.evento] : undefined, o = e?.opcoes.find((x) => x.id === opcaoId);
  if (!e || !o) return;
  c.evento = undefined;
  const ctx = contextoEvento(pacote, s);
  let texto = preencher(o.resultado, ctx), notas = aplicarEfeito(s, o.efeitos);
  if (o.risco && rngDe(s, "evento-risco", e.id).chance(o.risco.chance)) { texto += " " + preencher(o.risco.resultado, ctx); notas = [...notas, ...aplicarEfeito(s, o.risco.efeitos)]; }
  const final = texto + (notas.length ? ` (${notas.join(", ")})` : "");
  if (e.id === "videogame" && opcaoId === "aceitar") { ganharCapa(s, true); return { titulo: e.titulo, texto: final }; }
  noticia(s, "vida", e.titulo, final, { k: "vida" });
  return { titulo: e.titulo, texto: final };
}
/** Capa de videogame: IAFC da edição seguinte (temporada 2026 → IAFC 27). Regional pelo evento; mundial com a Bola de Ouro. */
export function ganharCapa(s: Save, regional: boolean) {
  const c = s.carreira, edicao = ANO_INICIAL + c.temporada + 1, ed = String(edicao % 100).padStart(2, "0");
  if ((c.capas ??= []).some((x) => x.edicao === edicao)) return;
  c.capas.push({ edicao, clube: c.clubeId, regional });
  noticia(s, "vida", `${s.jogador.apelido} é a capa do IAFC ${ed}`, regional ? `A edição do país do novo IAFC ${ed} sai com ${s.jogador.apelido} na capa.` : `O melhor do mundo estampa a capa mundial do IAFC ${ed}. Lançamento em todas as lojas.`, { k: "capa", edicao, clube: c.clubeId, ...(regional ? { regional: true } : {}) });
}
export const semanaAbsJogo = (c: Carreira) => c.temporada * SEMANAS_TEMPORADA + c.semana;

// ------------------------------------------------------------------ família e namoro
/** A família da carreira (sorteada na primeira vez; saves antigos ganham a sua). */
export function familiaDe(pacote: PacoteDados, s: Save): EstadoFamilia {
  const c = s.carreira, j = s.jogador;
  return (c.familia ??= gerarFamilia(pacote, { semente: s.semente, nome: j.nome, pais: j.pais, origem: j.familia, idade: j.idade - c.temporada, ano: ANO_INICIAL, escolha: c.escolhaFamilia }));
}
export const namoroDe = (c: Carreira): EstadoNamoro => (c.namoro ??= novoNamoro());
export function ctxFamilia(pacote: PacoteDados, s: Save): CtxFamilia {
  const c = s.carreira, jg = jogoDaSemana(s), w = mundo(pacote);
  return { semanaAbs: semanaAbsJogo(c), ano: ANO_INICIAL + c.temporada, idadeJogador: s.jogador.idade, exterior: infoLiga(c.ligaId).regiao !== "BRA" && s.jogador.pais === "BRA",
    salario: c.salario, saldo: s.casa.saldo, profissional: !c.fase && !!w.clube[c.clubeId], clubeId: c.clubeId, forcaClube: w.clube[c.clubeId]?.forca ?? 60,
    relTecnico: c.relTecnico, fama: c.fama, jogoEmCasa: !!jg?.souCasa, janela: !!janelaAberta(c) && !c.formacao && s.jogador.idade >= 18, temporada: c.temporada };
}
export function ctxNamoro(pacote: PacoteDados, s: Save): CtxNamoro {
  const c = s.carreira;
  return { ano: ANO_INICIAL + c.temporada, semente: s.semente, semanaAbs: semanaAbsJogo(c), idadeJogador: s.jogador.idade, fama: c.fama, cidade: infoClube(pacote, c.clubeId).cidade, salario: c.salario, saldo: s.casa.saldo, vidaNoturna: c.vidaNoturna };
}
/** O jogador fala com alguém da família (ligar, visitar, presente, levar ao jogo, indicar o irmão...). */
export function agirFamiliaJogo(pacote: PacoteDados, s: Save, id: string, acao: AcaoFamilia): { ok: boolean; msg: string } {
  const c = s.carreira, f = familiaDe(pacote, s);
  const r = agirFamilia(f, id, acao, ctxFamilia(pacote, s), rngDe(s, "familia", id, acao));
  if (!r.ok) return r;
  if (r.custo) s.casa.saldo -= r.custo;
  if (r.moral) c.moral = clamp(c.moral + r.moral, 0, 100);
  if (r.cansaco) c.cansaco = clamp(c.cansaco + r.cansaco, 0, 100);
  let msg = r.msg;
  if (r.indicacaoClube) {
    const p = propostaPorIndicacao(pacote, s, r.indicacaoClube);
    msg += p ? ` O ${infoClube(pacote, r.indicacaoClube).nome} fez uma proposta! Veja no Mercado.` : " A diretoria agradeceu, mas não fez proposta agora.";
  }
  if (acao === "indicarBase" && membro(f, id)?.futebol?.fase === "base") noticia(s, "clube", "Irmão na base", `${membro(f, id)!.nome} passou no teste e agora treina na base do ${infoClube(pacote, c.clubeId).nome}.`);
  return { ok: true, msg };
}
/** App de namoro: curtir ou passar um perfil. */
export function curtirPerfil(pacote: PacoteDados, s: Save, id: string, sim: boolean) {
  const n = namoroDe(s.carreira), ctx = ctxNamoro(pacote, s);
  baralhoDaSemana(n, ctx);
  return curtir(n, id, sim, ctx);
}
export function perfisDaSemana(pacote: PacoteDados, s: Save) { return baralhoDaSemana(namoroDe(s.carreira), ctxNamoro(pacote, s)); }
export function agirFilhoJogo(pacote: PacoteDados, s: Save, i: number, acao: AcaoFilho): { ok: boolean; msg: string } {
  const c = s.carreira, r = agirFilho(namoroDe(c), i, acao, ctxNamoro(pacote, s));
  if (!r.ok) return r;
  if (r.custo) s.casa.saldo -= r.custo;
  if (r.moral) c.moral = clamp(c.moral + r.moral, 0, 100);
  if (r.cansaco) c.cansaco = clamp(c.cansaco + r.cansaco, 0, 100);
  if (r.fama) c.fama = clamp(c.fama + r.fama, 0, 100);
  return { ok: true, msg: r.msg };
}
export function agirNamoroJogo(pacote: PacoteDados, s: Save, id: string, acao: AcaoNamoro): { ok: boolean; msg: string } {
  const c = s.carreira, r = agirNamoro(namoroDe(c), id, acao, ctxNamoro(pacote, s));
  if (!r.ok) return r;
  if (r.custo) s.casa.saldo -= r.custo;
  if (r.moral) c.moral = clamp(c.moral + r.moral, 0, 100);
  if (r.cansaco) c.cansaco = clamp(c.cansaco + r.cansaco, 0, 100);
  if (r.fama) c.fama = clamp(c.fama + r.fama, 0, 100);
  if (r.engajamento) c.engajamento = clamp((c.engajamento ?? 40) + r.engajamento, 0, 100);
  if (r.torcida) c.torcida = clamp((c.torcida ?? 50) + r.torcida, 0, 100);
  if (r.noticia) noticia(s, r.escandalo ? "polemica" : "vida", r.noticia, r.escandalo ? `Os programas de fofoca não falam de outra coisa.` : `${s.jogador.apelido} assumiu o relacionamento nas redes.`);
  return { ok: true, msg: r.msg };
}
/** Paga os patrocínios do mês (fixo + bônus) e encerra os contratos que acabaram. */
function fecharMesPatrocinios(s: Save, eventos: string[]): number {
  const c = s.carreira, ms = c.mesStats ?? { gols: 0, assist: 0, notas8: 0 };
  let total = 0;
  for (const k of c.patrocinios ?? []) {
    const b = bonusDoMes(k, ms);
    total += k.mensal + b;
    if (b) eventos.push(`Bônus da ${MARCA[k.marca]?.nome}: R$ ${b.toLocaleString("pt-BR")}.`);
    k.restantes--;
  }
  for (const k of (c.patrocinios ?? []).filter((x) => x.restantes <= 0)) noticia(s, "dinheiro", `Fim do contrato com a ${MARCA[k.marca]?.nome}`, `O contrato de ${k.meses} meses terminou. A marca pode voltar a procurar ${s.jogador.apelido}.`);
  c.patrocinios = (c.patrocinios ?? []).filter((x) => x.restantes > 0);
  c.mesStats = { gols: 0, assist: 0, notas8: 0 };
  return total;
}
export function aceitarPatrocinio(s: Save, tipo: TipoContrato): ContratoPatrocinio | undefined {
  const c = s.carreira, p = c.propPatrocinio, o = p?.opcoes.find((x) => x.tipo === tipo);
  if (!p || !o) return;
  const k: ContratoPatrocinio = { ...o, marca: p.marca, restantes: o.meses, desde: ANO_INICIAL + c.temporada };
  (c.patrocinios ??= []).push(k);
  c.propPatrocinio = undefined;
  if (o.luvas) s.casa.saldo += o.luvas;
  c.fama = clamp(c.fama + 1, 0, 100);
  const m = MARCA[p.marca];
  noticia(s, "dinheiro", `${s.jogador.apelido} é o novo rosto da ${m.nome}`, `Contrato ${tipo === "fixo" ? "de valor fixo" : tipo === "desempenho" ? "por desempenho" : "de longo prazo"}: ${o.meses} meses, R$ ${o.mensal.toLocaleString("pt-BR")} por mês${o.luvas ? ` e R$ ${o.luvas.toLocaleString("pt-BR")} de luvas` : ""}. "${m.slogan}"`, { k: "patrocinio", marca: m.id });
  return k;
}
export function recusarPatrocinio(s: Save) {
  const c = s.carreira;
  if (!c.propPatrocinio) return;
  (c.recusadas ??= []).push(c.propPatrocinio.marca);
  c.propPatrocinio = undefined;
}
export const receitaPatrocinios = (c: Carreira) => (c.patrocinios ?? []).reduce((a, k) => a + k.mensal, 0);
/** Estúdio de tatuagem: paga e a tatuagem aparece no corpo. */
export function tatuar(s: Save, area: AreaTatuagem, id: string): { ok: boolean; msg: string } {
  const t = TATUAGEM[id], v = visualDe(s.jogador);
  if (!t || !t.areas.includes(area)) return { ok: false, msg: "Esse desenho não cabe aí." };
  if (v.tatuagens[area]) return { ok: false, msg: `Já tem tatuagem ${noArea(area)}. Tire antes com laser.` };
  if (s.casa.saldo < t.preco) return { ok: false, msg: "Dinheiro não dá." };
  s.casa.saldo -= t.preco; v.tatuagens[area] = id;
  s.carreira.moral = clamp(s.carreira.moral + 2, 0, 100); s.carreira.hype = clamp((s.carreira.hype ?? 0) + 0.05, -0.3, 1.5);
  noticia(s, "vida", "Tatuagem nova", `${s.jogador.apelido} apareceu com ${t.nome.toLowerCase()} ${noArea(area)}. A foto rodou as redes.`, { k: "tatuagem" });
  return { ok: true, msg: `${t.nome} ${noArea(area)}: R$ ${t.preco.toLocaleString("pt-BR")}.` };
}
export function removerTatuagem(s: Save, area: AreaTatuagem): { ok: boolean; msg: string } {
  const v = visualDe(s.jogador), id = v.tatuagens[area];
  if (!id) return { ok: false, msg: "Não tem tatuagem aí." };
  const custo = custoRemocao(id);
  if (s.casa.saldo < custo) return { ok: false, msg: "O laser é caro: dinheiro não dá." };
  s.casa.saldo -= custo; delete v.tatuagens[area];
  return { ok: true, msg: `Removida com laser: R$ ${custo.toLocaleString("pt-BR")}.` };
}
function fisicoInicial(at: Record<string, number>): Fisico {
  const vals = Object.values(at), media = vals.reduce((a, b) => a + b, 0) / vals.length;
  return at.FOR >= media + 6 ? "forte" : at.FOR <= media - 6 ? "magro" : "atletico";
}
/** Amigos mais próximos (para a bio e o perfil). */
export function melhoresAmigos(pacote: PacoteDados, c: Carreira, n = 2): { nome: string; clube: string; nivel: number }[] {
  return Object.values(c.relacoes?.lista ?? {}).filter((x) => x.nivel >= 40).sort((a, b) => b.nivel - a.nivel).slice(0, n)
    .map((x) => ({ nome: x.nome, clube: infoClube(pacote, x.clubeId)?.nome ?? x.clubeId, nivel: x.nivel }));
}
export const NOME_POSICAO: Record<Posicao, string> = { ZAG: "Zagueiro", LAT: "Lateral", VOL: "Volante", MEI: "Meia", PON: "Ponta", ATA: "Centroavante" };
/** Responder à sugestão de posição do técnico. */
export function responderSugestao(s: Save, aceita: boolean): string {
  const c = s.carreira, sg = c.sugestaoPos;
  if (!sg || sg.aceita !== undefined) return "";
  if (aceita) { sg.aceita = true; c.treinoPosicao = sg.pos; c.relTecnico = clamp(c.relTecnico + 4, 0, 100); return `Combinado: você treina de ${NOME_POSICAO[sg.pos].toLowerCase()} (rende 30% mais por ser pedido do técnico).`; }
  sg.aceita = false; c.relTecnico = clamp(c.relTecnico - 2, 0, 100); return "Você agradeceu e preferiu seguir na sua posição.";
}
export function treinarPosicao(s: Save, p: Posicao | undefined): string {
  s.carreira.treinoPosicao = p && p !== s.jogador.posicao ? p : undefined;
  return p ? `Treino de ${NOME_POSICAO[p].toLowerCase()} começa nesta semana.` : "Sem treino de posição.";
}
/** Passa a jogar na posição (a partir de 70% de domínio). */
export function mudarPosicao(s: Save, p: Posicao): { ok: boolean; msg: string } {
  const j = s.jogador, fam = familiaridadeDe(j);
  if (p === j.posicao) return { ok: false, msg: "Já é a sua posição." };
  if ((fam[p] ?? 0) < PODE_JOGAR) return { ok: false, msg: `Precisa de ${PODE_JOGAR}% de domínio para jogar ali.` };
  j.posicao = p;
  noticia(s, "clube", "Mudança de posição", `${j.apelido} passa a jogar de ${NOME_POSICAO[p].toLowerCase()}.`);
  return { ok: true, msg: `Agora você joga de ${NOME_POSICAO[p].toLowerCase()}.` };
}
/** Uma conversa com outro jogador (até 3 por semana, uma por pessoa). */
export function agirRelacao(pacote: PacoteDados, s: Save, nome: string, acao: AcaoRel, clubeId?: string): { ok: boolean; msg: string } {
  const c = s.carreira, rr = relacoesDe(c), x = rr.lista[nome], ano = ANO_INICIAL + c.temporada;
  const est = estrelas(pacote).find((e) => e.nome === nome);
  // achado na busca do celular (liga → clube → jogador): vira contato
  const achado = !x && !est && clubeId && ondeJoga(pacote, nome)?.clubeId === idClube(clubeId) ? relacao(rr, nome, clubeId, ano) : undefined;
  const alvo = x ?? achado ?? (est ? relacao(rr, est.nome, est.clubeId, ano) : undefined);
  if (!alvo) return { ok: false, msg: "Jogador não encontrado." };
  const bloqueio = podeAgir(rr, semanaAbsJogo(c), nome);
  if (bloqueio && acao !== "camisa") return { ok: false, msg: bloqueio };
  const fazer = (v: number, msg: string) => { subir(alvo, v); rr.feitas.push(nome); return { ok: true, msg: `${msg} (${rotuloNivel(alvo.nivel).toLowerCase()} · ${Math.round(alvo.nivel)})` }; };
  switch (acao) {
    case "mensagem": return fazer(est && !alvo.companheiro ? 3 * atencao(c.fama, est.fama) : 3, `Você mandou mensagem para ${nome}.`);
    case "jantar": {
      if (!alvo.companheiro) return { ok: false, msg: "Jantar é com companheiro de clube." };
      const custo = Math.round(Math.max(300, c.salario * 0.01));
      if (s.casa.saldo < custo) return { ok: false, msg: "Dinheiro curto para o jantar." };
      s.casa.saldo -= custo;
      return fazer(7, `Jantar com ${nome}: R$ ${custo.toLocaleString("pt-BR")}.`);
    }
    case "redes": {
      if (!est) return { ok: false, msg: "Comentar nas redes é para estrela." };
      c.engajamento = clamp((c.engajamento ?? 40) + 3, 0, 100);
      return fazer(3 * atencao(c.fama, est.fama), `Você comentou na foto de ${nome}.`);
    }
    case "camisa": {
      const jg = jogoDaSemana(s);
      if (!est || !jg || jg.adversario !== est.clubeId) return { ok: false, msg: "Só dá para pedir a camisa na semana do jogo contra ele." };
      if (alvo.camisa) return { ok: false, msg: "Você já tem a camisa dele." };
      rr.camisaPedida = nome;
      return { ok: true, msg: `Combinado: depois do jogo você pede a camisa de ${nome}. Chance de ${Math.round(100 * chanceCamisa(alvo.nivel, c.fama, est.fama))}%.` };
    }
    case "indicacao": {
      if (alvo.companheiro) return { ok: false, msg: "Ele já joga com você." };
      if (alvo.nivel < 60) return { ok: false, msg: "Precisa ser parceiro (60+) para pedir isso." };
      if (alvo.indicacao === c.temporada) return { ok: false, msg: "Ele já tentou nesta temporada." };
      const w = mundo(pacote), clube = w.clube[alvo.clubeId];
      if (!janelaAberta(c)) return { ok: false, msg: "Peça na janela de transferências." };
      alvo.indicacao = c.temporada; rr.feitas.push(nome);
      if (!rngDe(s, "indicacao", nome).chance(chanceIndicacao(alvo.nivel, ovr(s.jogador), clube.forca))) return { ok: true, msg: `${nome} falou com a diretoria do ${clube.nome}, mas eles não quiseram agora.` };
      const p = propostaPorIndicacao(pacote, s, clube.id);
      return p ? { ok: true, msg: `${nome} te indicou e o ${clube.nome} fez uma proposta! Veja no Mercado.` } : { ok: true, msg: `${nome} tentou, mas não deu certo agora.` };
    }
  }
}
export const padraoDe = (c: Carreira): PadraoVida => (c.padrao ??= { ...PADRAO_INICIAL });
/** Seguidores que o jogador "deveria" ter no clube atual. */
export function alvoDeSeguidores(pacote: PacoteDados, s: Save, clubeId = s.carreira.clubeId): number {
  const c = s.carreira, cl = mundo(pacote).clube[clubeId];
  return alvoSeguidores(c.fama, visibilidade(clubeId, cl?.ligaId, cl?.fClube ?? 1), s.jogador.personalidade.carisma ?? 10, c.engajamento ?? 40, c.hype ?? 0);
}
function posicaoNaTabela(fixa: number | undefined, s: Save): number {
  if (fixa) return fixa;
  return ordenar(s.carreira.tabela).findIndex((t) => t.clube === s.carreira.clubeId) + 1;
}

/** Coloca as relíquias ganhas na casa e conta na semana e nas notícias. */
function receberReliquias(s: Save, ganhos: Ganho[], eventos: string[]) {
  for (const g of ganhos) {
    const r = ganharReliquia(s.casa, g.reliquia);
    if (!r.ok) continue;
    eventos.push(`Relíquia nova: ${r.msg}`);
    noticia(s, "vida", g.reliquia.tipo === "trofeu" ? g.reliquia.nome : `Relíquia: ${g.reliquia.nome}`, `${g.reliquia.legenda}. Já faz parte da coleção de ${s.jogador.apelido}.`, { k: "trofeu" });
  }
}

function fimDeTemporada(pacote: PacoteDados, s: Save, eventos: string[]): ResumoTemporada {
  const l = ligaAtual(pacote, s), c = s.carreira, j = s.jogador;
  const posicao = ordenar(c.tabela).findIndex((t) => t.clube === c.clubeId) + 1;
  const titulo = posicao === 1 && c.stats.jogos >= 10;
  const notas = c.stats.notas, media = (x: number[]) => (x.length ? +(x.reduce((a, b) => a + b, 0) / x.length).toFixed(2) : 0);
  const r: ResumoTemporada = { ...(c.fase ? { fase: c.fase } : {}), ano: ANO_INICIAL + c.temporada, idade: j.idade, clube: clubeDe(l, c.clubeId).nome, clubeId: c.clubeId, liga: infoLiga(c.ligaId).curto, est: estatisticasEstimadas(j.at, j.posicao, `${s.semente}|${c.temporada}`), ovr: Math.round(ovr(j)), jogos: c.stats.jogos, gols: c.stats.gols, assist: c.stats.assist, nota: media(notas), posicao, titulo, base: c.stats.base, baseGols: c.stats.baseGols,
    ...(c.stats.mvp ? { mvp: c.stats.mvp } : {}), ...(c.stats.selRodada ? { selRodada: c.stats.selRodada } : {}), ...(c.stats.selMes ? { selMes: c.stats.selMes } : {}) };
  // premiação: troféus que vão para a casa
  const cc = clubeCasa(pacote, c.clubeId), ev: string[] = [];
  const ligaId = infoLiga(c.ligaId).id, artilheiro = rankingDaLiga(pacote, ligaId, 999, "g", 1)[0], garcom = rankingDaLiga(pacote, ligaId, 999, "a", 1)[0];
  // premiação da liga: todos os jogadores, com o do usuário competindo com os números dele
  const eu: Selecionado[] = !c.fase && r.jogos ? [{ nome: j.apelido, clubeId: c.clubeId, posicao: j.posicao, nota: r.nota, gols: r.gols, assist: r.assist, jogos: r.jogos, idade: j.idade, eu: true }] : [];
  const pl = c.fase ? undefined : premiosDaLiga(pacote, ligaId, r.ano, eu);
  if (pl) {
    c.premiosLiga = pl;
    const nm = (x?: Selecionado) => x ? `${x.eu ? j.apelido : x.nome} (${infoClube(pacote, x.clubeId)?.nome ?? ""})` : "–";
    noticia(s, "clube", `Prêmios da ${infoLiga(c.ligaId).curto} ${r.ano}`, `Craque: ${nm(pl.craque)}. Artilheiro: ${nm(pl.artilheiro)}, ${pl.artilheiro?.gols ?? 0} gols. Garçom: ${nm(pl.garcom)}, ${pl.garcom?.assist ?? 0} assistências.${pl.revelacao ? ` Revelação: ${nm(pl.revelacao)}.` : ""}`, { k: "trofeu" });
  }
  const premios = premiosDaTemporada(rngDe(s, "premios"), { maxGols: artilheiro?.valor, maxAssist: garcom?.valor, ...(pl ? { craque: !!pl.craque?.eu, naSelecao: pl.selecao.some((x) => x.eu), revelacao: !!pl.revelacao?.eu } : {}), ano: r.ano, idade: j.idade, clubeId: c.clubeId, clubeNome: cc.nome, cores: cc.cores, numero: j.numero,
    padrao: infoClube(pacote, c.clubeId).padrao, ligaCurto: infoLiga(c.ligaId).curto, recemContratado: c.chegadaClube === c.temporada,
    jogos: r.jogos, gols: r.gols, assist: r.assist, nota: r.nota, titulo, base: r.base, golsBase: c.stats.baseGols, notaBase: media(c.stats.baseNotas ?? []),
    temporadasCheias: c.historico.filter((h) => h.jogos >= 15).length });
  receberReliquias(s, premios, ev);
  r.premios = premios.filter((g) => g.reliquia.tipo === "trofeu").map((g) => g.reliquia.nome);
  // copa continental: campanha, e o troféu se o clube foi campeão com o jogador em campo
  // o que faltou das copas (Mundial sem o clube do jogador, ou depois que ele caiu) é jogado agora
  { const w2 = mundo(pacote), forca = (id: string) => w2.clube[id]?.forca ?? 60, rr = rngDe(s, "copas-fim");
    for (const e of Object.values(c.copas ?? {})) if (e) for (let sem = c.semana; sem <= 46 && e.fase !== "fim"; sem++) rodarSemana(e, sem, forca, rr); }
  // palmarés da temporada (campeões e campanhas das copas; tabelas finais de algumas ligas)
  {
    const w2 = mundo(pacote), fonteP = { ligas: w2.liga, tabelaReal: { ligaId: infoLiga(c.ligaId).id, ordem: ordenar(c.tabela).map((x) => x.clube) }, semente: `${s.semente}|sim`, temporada: c.temporada };
    const p: Palmares = { campeoes: {}, chegou: {}, ordens: Object.fromEntries(LIGAS_PALMARES.map((l) => [l, ordemFinal(fonteP, l)])) };
    for (const id of ["LIB", "UCL", "ACL", "CON", "INT", "MUN", "COP", "EUR", "AME", "AFR", "ASI", "FIN"] as CopaId[]) { const e = c.copas?.[id]; if (e) { p.campeoes[id] = e.campeao; if (["LIB", "UCL", "ACL", "CON"].includes(id)) p.chegou[id] = e.chegou; } }
    (c.palmares ??= {})[c.temporada] = p;
    for (const k of Object.keys(c.palmares)) if (+k < c.temporada - 4) delete c.palmares[+k];
  }
  const minhas = Object.values(c.copas ?? {}).filter((e) => e && e.clubes.includes(c.clubeId)) as EstadoCopa[];
  for (const ec of minhas) {
    const estadual = ehEstadual(ec.id), extra = ec.id === "INT" || ec.id === "MUN", sc = estadual ? c.statsEstadual : extra ? c.statsExtra?.[ec.id] : c.statsCopa;
    if (!sc?.jogos) continue;
    const campeao = ec.campeao === c.clubeId;
    const camp = { id: ec.id, nome: COPAS[ec.id].nome, fase: campeao ? "Campeão" : NOME_FASE[ec.chegou[c.clubeId]] ?? "", campeao, jogos: sc.jogos, gols: sc.gols, assist: sc.assist };
    if (extra) (r.extras ??= []).push(camp); else r[estadual ? "estadual" : "copa"] = camp;
    if (campeao && sc.jogos >= (extra ? 1 : 3)) {
      const nomeT = `Taça ${COPAS[ec.id].prep} ${COPAS[ec.id].curto} ${r.ano}`;
      receberReliquias(s, [{ conquista: `trofeu-copa-${ec.id}`, reliquia: { id: `rel-trofeu-copa-${ec.id}-${r.ano}`, chave: `trofeu-copa-${ec.id}`, tipo: "trofeu", nome: nomeT, legenda: `${cc.nome} · ${COPAS[ec.id].nome} ${r.ano}`, ano: r.ano, cores: ["#E3B341", "#B8892B"], modelo: "taca" } }], ev);
      r.premios.push(nomeT);
      const bonus = ec.id === "MUN" ? 14 : estadual ? 3 : 8;
      c.fama = clamp(c.fama + bonus, 0, 100); c.torcida = clamp((c.torcida ?? 50) + bonus * 1.5, 0, 100);
    }
  }
  // torneios de seleções (Copa do Mundo, continentais, Finalíssima): campanha do jogador (se foi convocado) e a taça
  for (const id of ["FIN", ...TORNEIOS_FIM] as CopaId[]) {
    const cop = c.copas?.[id], nc = c.selecao?.naTorneio?.[id], nat = idSelecao(j.nacionalidade);
    if (!cop || !nc || !c.selecao) continue;
    const campeao = cop.campeao === nat, sel = selecaoDe(pacote, j.nacionalidade)!, nomeC = COPAS[id].nome;
    const fase = campeao ? "Campeão" : id === "FIN" ? "Vice" : NOME_FASE[cop.chegou[nat]] ?? "Fase de grupos";
    c.selecao.copas.push({ ano: r.ano, fase, jogos: nc.jogos, gols: nc.gols, campeao, id });
    (r.extras ??= []).push({ id, nome: nomeC, fase, campeao, jogos: nc.jogos, gols: nc.gols, assist: nc.assist });
    if (campeao) {
      const nomeT = `Taça da ${nomeC} ${r.ano}`;
      receberReliquias(s, [{ conquista: `trofeu-copa-${id}`, reliquia: { id: `rel-trofeu-copa-${id}-${r.ano}`, chave: `trofeu-copa-${id}`, tipo: "trofeu", nome: nomeT, legenda: `${sel.nome} · ${nomeC} ${r.ano}`, ano: r.ano, cores: id === "COP" ? ["#E3B341", "#B8892B"] : [COPAS[id].cores[1], COPAS[id].cores[0]], modelo: "taca" } }], ev);
      r.premios.push(nomeT); c.fama = clamp(c.fama + ({ COP: 20, EUR: 12, AME: 12, AFR: 8, ASI: 8, FIN: 6 } as Record<string, number>)[id], 0, 100);
      noticia(s, "jogo", id === "COP" ? `${sel.nome} campeã do mundo!` : `${sel.nome} campeã da ${nomeC}!`, `${j.apelido} levanta a ${nomeC} ${r.ano}: ${nc.jogos} ${nc.jogos === 1 ? "jogo" : "jogos"} e ${nc.gols} gols.`, { k: "trofeu" });
    } else noticia(s, "jogo", `Fim de ${nomeC} para a ${sel.nome}`, `${sel.nome}: ${fase.toLowerCase()}. ${j.apelido} fez ${nc.jogos} ${nc.jogos === 1 ? "jogo" : "jogos"} e ${nc.gols} gols. Campeã: ${infoClube(pacote, cop.campeao ?? "")?.nome ?? "–"}.`);
  }
  // prêmios do mundo: cada júri vota do seu jeito (veja premios-mundo.ts)
  premiosDoMundo(pacote, s, r, ev);
  if (c.selecao) { c.selecao.naTorneio = undefined; c.selecao.naCopa = undefined; }
  // técnico do clube do jogador: a campanha real decide se ele fica
  avaliarTecnico(pacote, s, posicao, ev);
  // tabela final (vale para as vagas das copas da próxima temporada)
  c.tabelaAnterior = { ligaId: infoLiga(c.ligaId).id, ordem: ordenar(c.tabela).map((t) => t.clube) };
  c.notasRodada = undefined;
  c.copas = undefined; c.statsCopa = undefined; c.suspensaoCopa = undefined; c.statsEstadual = undefined; c.suspensaoEstadual = undefined; c.statsExtra = undefined;
  c.historico.push(r);
  if (titulo) { c.fama = clamp(c.fama + 5, 0, 100); c.torcida = clamp((c.torcida ?? 50) + 10, 0, 100); }
  noticia(s, "clube", `Fim da temporada ${r.ano}`, `${r.clube} terminou em ${posicao}º. ${j.apelido}: ${r.jogos} jogos no profissional, ${r.gols} gols, ${r.assist} assistências${r.base ? `, ${r.base} jogos na base` : ""}.`);
  // nova temporada
  { const tf = temporadaFamilia(pacote, familiaDe(pacote, s), rngDe(s, "familia-temporada"), ANO_INICIAL + c.temporada + 1, s.jogador.pais, eventos); c.moral = clamp(c.moral + tf.moral, 0, 100); }
  { const tn = temporadaNamoro(namoroDe(c), eventos, { semente: s.semente, ano: ANO_INICIAL + c.temporada, salario: c.salario });
    if (tn.custo) s.casa.saldo -= tn.custo;
    if (tn.escandalo) { c.fama = clamp(c.fama + 1, 0, 100); c.torcida = clamp((c.torcida ?? 50) - 4, 0, 100); }
    if (tn.noticia) noticia(s, tn.escandalo ? "polemica" : "vida", tn.noticia, tn.escandalo ? `A vida pessoal de ${s.jogador.apelido} virou assunto nos programas de fofoca.` : `Festa para a família e os amigos do futebol.`); }
  j.idade++; c.temporada++; c.semana = 0; c.anosContrato--; c.recusadas = [];
  sincronizar(pacote, s);
  noticiasDaVirada(pacote, s);
  c.tabela = novaTabela(l); c.stats = statsVazias(); c.resultadosClube = [];
  const clube = clubeDe(l, c.clubeId);
  if (c.fase) { c.anosContrato = Math.max(1, c.anosContrato); fimDeTemporadaDoCaminho(pacote, s, eventos); }
  if (c.fase) { /* várzea, academia, colégio e universidade: a passagem é pelos convites */ }
  else if (c.formacao && j.idade >= 18) {
    c.escolhaNumero = "chegada"; // sobe para o profissional: escolhe o número no elenco de cima
    c.formacao = false; c.anosContrato = 3;
    c.salario = Math.round(salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama }));
    noticia(s, "clube", "Primeiro contrato profissional", `${j.apelido} assina por 3 anos: R$ ${c.salario.toLocaleString("pt-BR")} por mês.`);
  } else if (c.anosContrato <= 0 && c.formacao) {
    c.anosContrato = 2;
    c.salario = Math.round(Math.max(3000, salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama, formacao: true })));
    noticia(s, "clube", "Contrato renovado", `Mais 2 anos na base, R$ ${c.salario.toLocaleString("pt-BR")} por mês.`);
  }
  // aposentadoria: anunciada, aos 40, ou sem clube depois dos 35
  if (!c.fase && (c.aposentadoria?.temporada === c.temporada - 1 || r.idade >= 40 || (!!c.mercado?.semClube && r.idade >= 35))) {
    checarRecordes(pacote, s, eventos);
    c.encerrada = despedida(pacote, s, c.aposentadoria?.temporada === c.temporada - 1 ? "anunciada" : r.idade >= 40 ? "idade" : "sem-clube");
    noticia(s, "clube", `${j.apelido} pendura as chuteiras`, c.encerrada.texto, { k: "trofeu" });
    return r;
  }
  // mercado: fim de empréstimo e contrato vencido
  fimDaTemporadaNoMercado(pacote, s, eventos);
  contratoVencido(pacote, s, eventos);
  // quem saiu do elenco libera o número; começo de temporada é hora de escolher a camisa
  const saidas = saidasAtuais(pacote, s);
  if (saidas.length) {
    const g = gradeDoClube(pacote, s), lib = g.filter((x) => x.liberado).map((x) => x.numero);
    noticia(s, "clube", `Saídas do ${clubeCasa(pacote, c.clubeId).nome}`, `Deixaram o clube: ${saidas.join(", ")}.${lib.length ? ` Camisas livres: ${lib.join(", ")}.` : ""}`);
  }
  if (escolheNumero(c) && !c.escolhaNumero) c.escolhaNumero = "temporada";
  return r;
}

// ------------------------------------------------------------------ técnicos e lesões dos outros
/** Troca o técnico do clube do jogador: notícia, e a relação começa de novo (o novo julga pelo nível e pela fama). */
function trocarTecnico(pacote: PacoteDados, s: Save, motivo: "demitido" | "aposentou", eventos: string[]) {
  const c = s.carreira, j = s.jogador, velho = c.tecnico, clube = infoClube(pacote, c.clubeId);
  const novo = tecnicoLivrePara(pacote, idClube(c.clubeId), `${c.temporada}-${c.semana}`);
  c.tecnico = novo; c.tecnicoClube = c.clubeId;
  const forcaClube = mundo(pacote).clube[idClube(c.clubeId)]?.forca ?? 70;
  c.relTecnico = Math.round(clamp(50 + (c.fama - 50) / 8 + (ovr(j) - forcaClube) / 2, 25, 75));
  const est = NOME_ESTILO[novo.estilo];
  noticia(s, "clube", `${velho ? `${velho.nome} ${motivo === "aposentou" ? "se aposenta" : "é demitido"}` : "Técnico novo"} no ${clube.nome}`, `${novo.nome} (${NOME_PAIS_CURTO[novo.nacionalidade] ?? novo.nacionalidade}, ${novo.idade} anos) é o novo técnico. Estilo: ${est[0].toLowerCase()}. ${est[1]}`);
  eventos.push(`Técnico novo: ${novo.nome} (${est[0].toLowerCase()}).`);
}
const NOME_PAIS_CURTO: Record<string, string> = { BRA: "brasileiro", ARG: "argentino", POR: "português", ESP: "espanhol", ITA: "italiano", GER: "alemão", FRA: "francês", ENG: "inglês", NED: "holandês", URU: "uruguaio", MEX: "mexicano", TUR: "turco", USA: "americano", KSA: "saudita", COL: "colombiano", CHI: "chileno", PAR: "paraguaio", ECU: "equatoriano" };
/** Fim da temporada: campanha contra a força do elenco (e o rebaixamento); técnico velho se aposenta. */
function avaliarTecnico(pacote: PacoteDados, s: Save, posicao: number, eventos: string[]) {
  const c = s.carreira;
  if (c.fase || !c.tecnico || c.mercado?.semClube) return;
  const l = mundo(pacote).liga[infoLiga(c.ligaId).id], tec = c.tecnico;
  if (!l) return;
  tec.idade++;
  const esp = [...l.clubes].sort((a, b) => b.forca - a.forca).findIndex((x) => x.id === idClube(c.clubeId)) + 1;
  const r = rngDe(s, "tecnico-fim");
  if (tec.idade >= 70) trocarTecnico(pacote, s, "aposentou", eventos);
  else if (esp && r.chance(chanceDeDemissao(posicao, esp, l.clubes.length, l.rebaixados, c.temporada - tec.desde))) trocarTecnico(pacote, s, "demitido", eventos);
}
/** No meio do campeonato: time muito abaixo do esperado e mal nos últimos jogos derruba o técnico. */
function demissaoNoMeio(pacote: PacoteDados, s: Save, eventos: string[]) {
  const c = s.carreira, rod = c.semana - SEMANAS_PRE, n = nRodadas(c);
  if (c.fase || !c.tecnico || c.mercado?.semClube || rod < 10 || rod > n - 4 || c.tecnicoTroca === c.temporada) return;
  const l = mundo(pacote).liga[infoLiga(c.ligaId).id];
  if (!l) return;
  const ord = ordenar(c.tabela), pos = ord.findIndex((t) => t.clube === c.clubeId) + 1;
  const esp = [...l.clubes].sort((a, b) => b.forca - a.forca).findIndex((x) => x.id === idClube(c.clubeId)) + 1;
  const ultimos = (c.resultadosClube ?? []).slice(-5), pts = ultimos.reduce((a, x) => a + x, 0);
  const z4 = l.rebaixados && pos > l.clubes.length - l.rebaixados;
  if (!esp || ultimos.length < 5 || pts > 4 || (pos < esp + 5 && !z4)) return;
  if (rngDe(s, "tecnico-meio").chance(z4 ? 0.22 : 0.14)) { trocarTecnico(pacote, s, "demitido", eventos); c.tecnicoTroca = c.temporada; }
}
/** Lesões graves que começam nesta rodada: do clube do jogador (com aviso se abre a vaga dele) e dos craques do mundo. */
function noticiasDeLesao(pacote: PacoteDados, s: Save, eventos: string[]) {
  const c = s.carreira, j = s.jogador, rod = c.semana - SEMANAS_PRE;
  if (rod < 0 || c.fase) return;
  const meu = idClube(c.clubeId), nome = (id: string) => infoClube(pacote, id)?.nome ?? id;
  const ls = lesoesQueComecam(pacote, rod), semanas = (x: { ini: number; fim: number }) => x.fim - x.ini;
  for (const x of ls.filter((x) => x.clubeId === meu)) {
    const rival = (mundo(pacote).clube[meu]?.elenco.find((y) => y.nome === x.nome)?.posicao) === j.posicao;
    noticia(s, "lesao", `${x.nome} fora por ${semanas(x)} semanas`, `${x.nome} (${nome(x.clubeId)}) sofreu ${x.tipo}.${rival ? ` Ele joga na sua posição: abre espaço no time.` : ""}`);
    if (rival) eventos.push(`${x.nome}, da sua posição, se machucou: abre espaço no time.`);
  }
  for (const x of ls.filter((x) => x.clubeId !== meu && x.ovr >= 84).sort((a, b) => b.ovr - a.ovr).slice(0, 2))
    noticia(s, "lesao", `${x.nome} se machuca`, `Golpe para o ${nome(x.clubeId)}: ${x.nome} sofreu ${x.tipo} e fica fora por ${semanas(x)} semanas.`);
}

// ------------------------------------------------------------------ recordes e aposentadoria
/** Jogos e gols do jogador por um clube (liga, copa, estadual, Intercontinental, Mundial), contando a temporada em andamento. */
export function numerosNoClube(s: Save, clubeId: string): { jogos: number; gols: number } {
  const c = s.carreira, n = { jogos: 0, gols: 0 };
  for (const h of c.historico) if (h.clubeId === clubeId && !h.fase) {
    for (const x of [h, h.copa, h.estadual, ...(h.extras ?? []).filter((e) => !ehDeSelecao(e.id))]) if (x) { n.jogos += x.jogos; n.gols += x.gols; }
  }
  if (c.clubeId === clubeId && !c.fase && !c.encerrada) for (const x of [c.stats, c.statsCopa, c.statsEstadual, ...Object.values(c.statsExtra ?? {})]) if (x) { n.jogos += x.jogos; n.gols += x.gols; }
  return n;
}
export interface ListaRecorde { chave: string; titulo: string; unidade: string; lista: Lenda[]; pos: number; valor: number; clubeId?: string }
/** As listas de recordes que interessam ao jogador: cada clube por onde passou (gols e jogos), a seleção e o recorde de gols numa temporada da liga atual. */
export function recordesDoJogador(pacote: PacoteDados, s: Save): ListaRecorde[] {
  const c = s.carreira, j = s.jogador, out: ListaRecorde[] = [];
  const clubes = [...new Set([...c.historico.filter((h) => !h.fase && h.clubeId && h.jogos).map((h) => h.clubeId!), ...(c.fase || c.formacao || c.encerrada ? [] : [c.clubeId])])];
  for (const id of clubes) {
    const info = infoClube(pacote, id);
    if (!info) continue;
    const rec = recordesDoClube(id, info.forca, info.pais ?? "BRA"), n = numerosNoClube(s, id);
    for (const [tipo, titulo, unidade] of [["gols", "Maiores artilheiros", "gols"], ["jogos", "Mais jogos", "jogos"]] as const) {
      const { lista, pos } = comJogador(rec[tipo], j.apelido, n[tipo]);
      out.push({ chave: `clube-${tipo}-${id}`, titulo: `${titulo} do ${info.nome}`, unidade, lista, pos, valor: n[tipo], clubeId: id });
    }
  }
  const sel = selecaoDe(pacote, j.nacionalidade), sl = c.selecao;
  if (sel && sl?.jogos) {
    const rec = recordesDaSelecao(j.nacionalidade, infoClube(pacote, sel.id)?.forca ?? sel.forca);
    for (const [tipo, titulo, unidade] of [["gols", "Maiores artilheiros", "gols"], ["jogos", "Mais jogos", "jogos"]] as const) {
      const { lista, pos } = comJogador(rec[tipo], j.apelido, sl[tipo]);
      out.push({ chave: `sel-${tipo}`, titulo: `${titulo} da ${sel.nome}`, unidade, lista, pos, valor: sl[tipo], clubeId: sel.id });
    }
  }
  if (!c.fase && !c.formacao) {
    const lid = infoLiga(c.ligaId).id, rl = recordeDaLiga(lid, infoLiga(c.ligaId).pais, nRodadas(c));
    const melhor = Math.max(c.stats.gols, ...c.historico.filter((h) => h.liga === infoLiga(c.ligaId).curto && !h.fase).map((h) => h.gols));
    out.push({ chave: `liga-${lid}`, titulo: `Recorde de gols numa temporada da ${infoLiga(c.ligaId).curto}`, unidade: "gols", lista: [rl], pos: melhor > rl.valor ? 1 : 0, valor: melhor });
  }
  return out;
}
const ORD = ["", "maior", "2º maior", "3º maior", "4º maior", "5º maior"];
/** Toda semana: o jogador subiu numa lista de recordes? Notícia (e, se virou o recordista, troféu e fama). */
function checarRecordes(pacote: PacoteDados, s: Save, eventos: string[]) {
  const c = s.carreira, j = s.jogador;
  if (c.fase || c.formacao) return;
  const av = (c.recordes ??= {});
  for (const r of recordesDoJogador(pacote, s)) {
    // recorde de temporada da liga: uma vez por temporada
    const chave = r.chave.startsWith("liga-") ? `${r.chave}-${c.temporada}` : r.chave;
    if (!r.pos || (av[chave] && av[chave] <= r.pos)) continue;
    av[chave] = r.pos;
    const passou = r.lista[r.pos] ?? r.lista[r.pos - 1];
    if (r.chave.startsWith("liga-")) {
      if (c.stats.gols <= (r.lista.find((x) => !x.eu)?.valor ?? 999)) { delete av[chave]; continue; }
      const rec = r.lista[0];
      noticia(s, "jogo", `Recorde na ${infoLiga(c.ligaId).curto}!`, `${j.apelido} chega a ${c.stats.gols} gols e passa ${rec.eu ? "o recorde" : rec.nome}: é o maior artilheiro de uma temporada da história da liga.`, { k: "trofeu" });
      eventos.push("Recorde de gols numa temporada da liga!");
      receberReliquias(s, [{ conquista: `recorde-${chave}`, reliquia: { id: `rel-recorde-${chave}`, chave: `recorde-${chave}`, tipo: "trofeu", nome: `Recorde de gols na ${infoLiga(c.ligaId).curto} ${ANO_INICIAL + c.temporada}`, legenda: `${c.stats.gols} gols numa temporada`, ano: ANO_INICIAL + c.temporada, cores: ["#C0C8D8", "#8F96A3"], modelo: "placa" } }], eventos);
      c.fama = clamp(c.fama + 4, 0, 100);
      continue;
    }
    const sel = r.chave.startsWith("sel-"), onde = r.titulo.replace(/^(Maiores artilheiros|Mais jogos) d[oa] /, "");
    const oQue = r.unidade === "gols" ? "artilheiro" : "jogador com mais jogos";
    const nomeAntigo = passou && !passou.eu ? ` Passou ${passou.nome} (${passou.valor}).` : "";
    noticia(s, sel ? "jogo" : "clube", r.pos === 1 ? `${j.apelido}: recordista ${sel ? "da" : "do"} ${onde}` : `${j.apelido} sobe na história ${sel ? "da" : "do"} ${onde}`,
      `Com ${r.valor} ${r.unidade}, ${j.apelido} é agora o ${ORD[r.pos]} ${oQue} da história ${sel ? "da" : "do"} ${onde}.${nomeAntigo}`, r.pos === 1 ? { k: "trofeu" } : undefined);
    if (r.pos <= 2) eventos.push(`Recorde: ${ORD[r.pos]} ${oQue} ${sel ? "da" : "do"} ${onde}.`);
    if (r.pos === 1) {
      const cores = (infoClube(pacote, r.clubeId!)?.cores ?? ["#E3B341", "#FFFFFF"]) as [string, string];
      receberReliquias(s, [{ conquista: `recorde-${r.chave}`, reliquia: { id: `rel-recorde-${r.chave}`, chave: `recorde-${r.chave}`, tipo: "trofeu", nome: `Recordista: ${r.unidade === "gols" ? "maior artilheiro" : "mais jogos"} ${sel ? "da" : "do"} ${onde}`, legenda: `${r.valor} ${r.unidade}`, ano: ANO_INICIAL + c.temporada, cores: [cores[0], cores[1] ?? "#FFFFFF"], modelo: "placa" } }], eventos);
      c.fama = clamp(c.fama + (sel ? 4 : 3), 0, 100);
      if (!sel && r.clubeId === c.clubeId) c.torcida = clamp((c.torcida ?? 50) + 8, 0, 100);
    }
  }
}

export interface Despedida {
  ano: number; idade: number; motivo: "anunciada" | "idade" | "sem-clube"; texto: string;
  nivel: { titulo: string; texto: string };
  /** clube do coração da carreira (onde mais jogou) e se ele aposentou a camisa */
  casa?: { clubeId: string; jogos: number; gols: number; camisa?: string };
  recordes: string[];
}
/** O que fica: nível de lenda (títulos, prêmios, gols, seleção), o clube onde mais jogou (e se ele aposenta a camisa), os recordes. */
export function despedida(pacote: PacoteDados, s: Save, motivo: Despedida["motivo"]): Despedida {
  const c = s.carreira, j = s.jogador, hist = c.historico, ultimo = hist.at(-1)!;
  const t = totaisDaCarreira(hist), sl = c.selecao;
  const premios = hist.flatMap((h) => h.premios ?? []);
  const conta = (re: RegExp) => premios.filter((p) => re.test(p)).length;
  const pontos = t.titulos.length * 3 + conta(/^Bola de Ouro/) * 30 + conta(/^(The Best|Melhor da Europa|Rei da América|Melhor da Ásia|Melhor Africano)/) * 10
    + conta(/^Taça da Copa do Mundo/) * 25 + conta(/^Taça da (Eurocopa|Copa América|Copa Africana|Copa da Ásia)/) * 10 + t.gols / 10 + t.jogos / 40 + (sl?.jogos ?? 0) / 4 + (sl?.gols ?? 0) / 3;
  const ids = [...new Set(hist.filter((h) => h.clubeId && !h.fase).map((h) => h.clubeId!))];
  const porClube = ids.map((id) => ({ id, ...numerosNoClube(s, id) })).sort((a, b) => b.jogos - a.jogos);
  const casa = porClube[0];
  const recs = recordesDoJogador(pacote, s).filter((r) => r.pos === 1).map((r) => r.chave.startsWith("liga-") ? `${r.titulo}: ${r.valor} gols` : `${r.titulo.replace(/^Maiores artilheiros/, "Maior artilheiro").replace(/^Mais jogos/, "Recordista de jogos")}: ${r.valor}`);
  const nomeCasa = casa ? infoClube(pacote, casa.id)?.nome ?? "" : "";
  const recordistaCasa = !!casa && recordesDoJogador(pacote, s).some((r) => r.clubeId === casa.id && r.pos === 1 && !r.chave.startsWith("sel-"));
  // camisa aposentada: muitos jogos, títulos e idolatria (ou o recorde do clube)
  const titulosCasa = hist.filter((h) => h.clubeId === casa?.id && (h.titulo || h.copa?.campeao)).length;
  const aposentaCamisa = !!casa && (casa.jogos >= 250 || (casa.jogos >= 150 && (titulosCasa >= 2 || recordistaCasa)) || (casa.jogos >= 100 && (c.torcidaMax?.[casa.id] ?? 0) >= 90));
  const nivel = pontos >= 220 ? { titulo: "Lenda do futebol mundial", texto: "Um dos maiores da história. Daqui a cinquenta anos ainda vão discutir se ele foi o melhor de todos." }
    : pontos >= 120 ? { titulo: "Craque histórico", texto: "Ganhou o que tinha para ganhar e entrou para a história do futebol do país." }
    : pontos >= 60 ? { titulo: `Ídolo${nomeCasa ? ` do ${nomeCasa}` : ""}`, texto: "A torcida vai cantar o nome dele por muitos anos." }
    : pontos >= 25 ? { titulo: "Carreira sólida", texto: "Uma vida inteira no futebol profissional, com respeito por onde passou." }
    : { titulo: "Carreira de trabalhador da bola", texto: "Nem todo mundo vira craque. Ele viveu do futebol, e isso já é muito." };
  const motivoTxt = motivo === "idade" ? "Aos 40 anos, o corpo pediu." : motivo === "sem-clube" ? "Sem propostas que valessem a pena, decidiu parar." : "Despedida anunciada, com festa no último jogo.";
  const texto = `${motivoTxt} ${j.apelido} encerra a carreira em ${ultimo.ano}: ${t.jogos} jogos, ${t.gols} gols e ${t.titulos.length} títulos${sl?.jogos ? `; ${sl.jogos} jogos e ${sl.gols} gols pela seleção` : ""}.${aposentaCamisa ? ` O ${nomeCasa} aposenta a camisa ${j.numero ?? ""}.` : ""}`;
  if (aposentaCamisa && casa) {
    const info = infoClube(pacote, casa.id);
    receberReliquias(s, [{ conquista: "camisa-aposentada", reliquia: { id: "rel-camisa-aposentada", chave: "camisa-aposentada", tipo: "camisa", nome: `Camisa ${j.numero ?? ""} aposentada`, legenda: `${info?.nome ?? ""} · ${casa.jogos} jogos, ${casa.gols} gols`, ano: ultimo.ano, cores: [info?.cores[0] ?? "#2E7D4F", info?.cores[1] ?? "#FFFFFF"], modelo: info?.padrao ?? "lisa", numero: j.numero } }], []);
  }
  return { ano: ultimo.ano, idade: ultimo.idade, motivo, texto, nivel, ...(casa ? { casa: { clubeId: casa.id, jogos: casa.jogos, gols: casa.gols, ...(aposentaCamisa ? { camisa: j.numero } : {}) } } : {}), recordes: recs };
}
/** Anunciar que esta é a última temporada (a partir dos 30, ou dos 28 sem clube). Dá para voltar atrás até o fim dela. */
export function anunciarAposentadoria(s: Save): { ok: boolean; msg: string } {
  const c = s.carreira, j = s.jogador;
  if (c.encerrada) return { ok: false, msg: "A carreira já acabou." };
  if (c.fase || c.formacao) return { ok: false, msg: "Ainda nem chegou ao profissional." };
  if (j.idade < (c.mercado?.semClube ? 28 : 30)) return { ok: false, msg: "Cedo demais: a partir dos 30 anos (28 se estiver sem clube)." };
  c.aposentadoria = { temporada: c.temporada };
  c.torcida = clamp((c.torcida ?? 50) + 5, 0, 100);
  noticia(s, "clube", `${j.apelido} anuncia a aposentadoria`, `Esta é a última temporada da carreira. A despedida será no fim do ano.`);
  return { ok: true, msg: "Anunciado: esta é a última temporada." };
}
export function desistirAposentadoria(s: Save): { ok: boolean; msg: string } {
  const c = s.carreira;
  if (!c.aposentadoria || c.encerrada) return { ok: false, msg: "Nada para desfazer." };
  c.aposentadoria = undefined;
  noticia(s, "clube", `${s.jogador.apelido} volta atrás`, `Ainda tem lenha para queimar: a aposentadoria fica para depois.`);
  return { ok: true, msg: "Você continua jogando." };
}

/** Estrutura e cultura do clube no treino do jogador: na base pesam as duas; no profissional, só a estrutura. */
export function fatorDoClube(pacote: PacoteDados, s: Save): number {
  const c = s.carreira;
  if (c.fase) return 1;
  const n = nivelDaBase(pacote, c.clubeId);
  if (!n) return 1;
  return c.formacao ? 0.88 + 0.04 * n.estrutura + 0.02 * n.cultura : 0.92 + 0.03 * n.estrutura;
}
/** Notícias da virada: quem subiu da base e quem chegou ao clube, e as aposentadorias e vendas de craques no mundo. */
function noticiasDaVirada(pacote: PacoteDados, s: Save, v = viradaAtual(pacote), quando: "virada" | "meio" = "virada") {
  const c = s.carreira, id = idClube(c.clubeId), nome = (x: string) => infoClube(pacote, x)?.nome ?? x;
  const ch = v.chegadas[id] ?? [], sub = ch.filter((x) => x.motivo === "subiu"), contr = ch.filter((x) => x.motivo === "contratado");
  if (sub.length) noticia(s, "clube", `Da base para o profissional`, `O ${nome(id)} promoveu ${sub.map((x) => `${x.nome} (${x.idade} anos, ${x.posicao === "GOL" ? "goleiro" : x.posicao})`).join(", ")}.`);
  if (contr.length) noticia(s, "clube", `Reforços do ${nome(id)}${quando === "meio" ? " no meio do ano" : ""}`, `Chegaram: ${contr.slice(0, 6).map((x) => `${x.nome}${x.de ? ` (${nome(x.de)})` : ""}`).join(", ")}.`);
  const sa = (v.saidas[id] ?? []).filter((x) => x.motivo === "vendido");
  if (quando === "meio" && sa.length) noticia(s, "clube", `Saídas do ${nome(id)} no meio do ano`, sa.map((x) => `${x.nome} (${nome(x.para!)})`).join(", ") + ".");
  // dança dos técnicos nos grandes e na liga do jogador
  if (quando === "virada") {
    const w = mundo(pacote), lid = infoLiga(c.ligaId).id;
    const tr = trocasDeTecnico(pacote).filter((x) => x.clubeId !== id && ((w.clube[x.clubeId]?.forca ?? 0) >= 79 || w.clube[x.clubeId]?.ligaId === lid)).sort((a, b) => (w.clube[b.clubeId]?.forca ?? 0) - (w.clube[a.clubeId]?.forca ?? 0)).slice(0, 5);
    if (tr.length) noticia(s, "clube", "Dança dos técnicos", tr.map((x) => `${nome(x.clubeId)}: sai ${x.saiu ?? "–"}${x.motivo === "aposentou" ? " (aposentado)" : x.motivo === "levado" ? "" : " (demitido)"}, chega ${x.entrou}${x.de ? ` (do ${nome(x.de)})` : ""}`).join(". ") + ".");
  }
  const dest = [...v.destaques].sort((a, b) => b.ovr - a.ovr).slice(0, 3);
  for (const x of dest) {
    if (x.motivo === "aposentou") noticia(s, "clube", `${x.nome} pendura as chuteiras`, `Aos ${x.idade} anos, ${x.nome} anuncia a aposentadoria. Último clube: ${nome(x.de!)}.`);
    else noticia(s, "clube", `${x.nome} troca de clube`, `${x.nome} deixa o ${nome(x.de!)} e assina com o ${nome(x.para!)}.`);
  }
}

// ------------------------------------------------------------------ política automática (para testes e balanceamento)
export function planoAutomatico(s: Save): Plano {
  const c = s.carreira, foco: Grupo = (["fisico", "tecnico", "tatico"] as Grupo[])[(c.semana + c.temporada) % 3];
  const acoes: Acao[] = c.cansaco > 40 ? ["descanso", "treino", "descanso", "familia", "video"] : ["treino", "familia", "treino", "video", "descanso"];
  return { foco, intensidade: c.cansaco > 60 ? "leve" : "normal", acoes };
}
/** Joga uma semana inteira sem interface, escolhendo a primeira opção de cada decisão. */
export function semanaAutomatica(pacote: PacoteDados, s: Save, decidirMercado = true): ResumoSemana {
  sincronizar(pacote, s);
  if (decidirMercado) { decidirAutomatico(pacote, s); decidirCaminhoAutomatico(pacote, s); }
  if (s.carreira.escolhaNumero) numeroAutomatico(pacote, s);
  if (s.carreira.propPatrocinio) aceitarPatrocinio(s, "fixo");
  if (s.carreira.evento) resolverEvento(pacote, s, EVENTO[s.carreira.evento]?.opcoes[0].id ?? "");
  { const f = familiaDe(pacote, s), ctx = ctxFamilia(pacote, s), r = rngDe(s, "familia-auto"), antes = s.casa.saldo; familiaAutomatica(f, ctx, r); void antes; }
  namoroAutomatico(namoroDe(s.carreira), ctxNamoro(pacote, s));
  const plano = planoAutomatico(s);
  // quarta: jogo da copa continental
  const jc = jogoCopaDaSemana(pacote, s);
  if (jc) { const pc = prepararPartida(pacote, s, plano, jc); if (pc) concluirJogoDaCopa(pacote, s, plano, pc, decisoesAutomaticas(s, pc)); }
  const p = prepararPartida(pacote, s, plano);
  return concluirSemana(pacote, s, plano, p, p ? decisoesAutomaticas(s, p) : []);
}
/** Decide os lances de uma partida como a política automática (melhor opção, comemoração, pós-jogo). */
function decisoesAutomaticas(s: Save, p: Partida): ResultadoDecisao[] {
  const ds: ResultadoDecisao[] = [];
  let fora = 99;
  for (const d of p.decisoes) { if (d.min > fora) break; const r = resolverDecisao(s, p, d, melhorOpcao(s, p, d)); ds.push(r); if (r.vermelho || r.sai || ds.filter((x) => x.amarelo).length >= 2) fora = d.min; }
  // primeiro gol do jogador no jogo: comemoração, como na tela
  const golMin = [...p.lances.filter((l) => l.meu === "gol" && l.min <= fora).map((l) => l.min), ...ds.filter((r) => r.meu === "gol").map((r) => r.min)].sort((a, b) => a - b)[0];
  if (golMin !== undefined) { const d = decisaoComemoracao(s, p, golMin); ds.push(resolverDecisao(s, p, d, melhorOpcao(s, p, d))); }
  const pos = decisaoPosJogo(s, p, ds);
  if (pos) ds.push(resolverDecisao(s, p, pos, melhorOpcao(s, p, pos)));
  return ds;
}
