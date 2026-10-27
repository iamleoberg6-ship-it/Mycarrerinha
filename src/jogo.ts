// A carreira jogável, semana a semana. Tudo que o jogo precisa guardar fica num Save (JSON).
// Cada sorteio usa uma semente derivada do save + semana, então recarregar a página não muda resultados.
import { RNG, clamp } from "./rng.js";
import { ATRIBUTOS, ovr as calcOvr, evoluirSemana, type Atributo, type Atributos, type Grupo, type Intensidade, type Participacao, type Posicao } from "./atributos.js";
import { simularPlacar, desempenhoJogador, sortearLesao, pontuacaoTitular, VAGAS_433 } from "./partida.js";
import { ligaDoPacote, rodadasDaLiga, novaTabela, registrar, ordenar, type Clube, type Liga, type LinhaTabela, type PacoteDados } from "./liga.js";
import { salarioMensal, valorMercado, AGENTES, type TipoAgente } from "./mercado.js";
import { novoNegocios, mesNegocios, sortearProposta, abrirEmpresa, agirEmpresa, aplicar, responderProposta, CUSTO_ASSESSOR, type EstadoNegocios, type CtxNegocios, type TipoEmpresa, type AcaoEmpresa, type TipoInvest } from "./negocios.js";
import { novaSaude, semanaSaude, feriasSaude, operar, riscoLesaoSaude, fatorDeclinio, recuperacaoSaude, custoEquipe, type EstadoSaude, type Staff, type ParteCorpo } from "./saude.js";
import { semanaAmor, agendarCasamento, agendarLuaDeMel } from "./amor.js";
import { semanaAcontecimentos } from "./acontecimentos.js";
import { conversaDaSemana, opcoesConversa, responderConversa, type Conversa, type CtxConversa, type OpcaoConversa } from "./conversas.js";
import { novaAgenda, resolverOcasiao, vencidas, type EstadoAgenda, type EfeitoVida } from "./agenda.js";
import { parcasIniciais, novoParca, efeitosParcas, semanaSocial, agendarFerias, temFuncao, FUNCOES, type Parca, type PerfilParca, type FuncaoParca, type CtxSocial } from "./vida-social.js";
import { LUXO, MAX_LUXO, mesLuxo, statusLuxo, valoresEmCasa, temEsportivo, HOBBIES, MAX_HOBBIES, semanaHobbies, semanaEstudos, infoCurso, novaAdaptacao, semanaAdaptacao, moralAdaptacao, fatorAdaptacao, ocasioesExterior, linguaNativa, mesFundacao, ocasioesFundacao, ganhouCoracaoDeOuro, CUSTO_FUNDACAO, type ItemLuxo, type TipoLuxo, type EstadoHobbies, type Hobby, type EstadoEstudos, type Curso, type Adaptacao, type Fundacao } from "./estilo.js";
import { patrimonioInvestido } from "./negocios.js";
import { novaMidia, feedDaSemana, sortearPauta, postar, responderPauta, type EstadoMidia, type CtxMidia, type EfeitoPost, type TipoPost } from "./midia.js";
import type { PersonalidadeDNA, ResultadoCriacao, TracoId } from "./dna.js";
import { definirPerfil, type Efeitos as EfeitosPerfil } from "./perfil.js";
import { SITUACAO, COMEMORACAO, POS_JOGO, DISPUTA, MEMORIA_RECENTE, contextoPadrao, escolherSituacao, montarDecisao, resolverEfeito, habilidade, sortearNivel, notaEsperada, type Contexto, type Efeito, type Memoria, type Nivel } from "./lances.js";
import { bonusDoTecnico, chanceDeDemissao, NOME_ESTILO, type Tecnico } from "./tecnicos.js";
import { tecnicoDoClube, tecnicoLivrePara, trocasDeTecnico, lesionadosDoClube, lesoesQueComecam } from "./mundo.js";
import { recordesDoClube, recordesDaSelecao, recordeDaLiga, comJogador, type Lenda } from "./recordes.js";
import { premiosDoAno, type PremiosDoAno, type IdPremio } from "./premios-mundo.js";
import { candidatosDoAno, naSelecao, type Candidato } from "./mundo.js";
import { mundo, infoClube, idClube, ligaDoClube, sincronizarMundo, type TabelasReais, viradaAtual, baseDoClube, ondeJoga, versaoMundo, nivelDaBase, rankingDaLiga, janelaDoMeioAtual, idSelecao, temSelecao, selecaoDe, todasSelecoes, notasDaRodada, selecaoDaRodada, selecaoDoMes, premiosDaLiga, type Selecionado, type PremiosLiga } from "./mundo.js";
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
import { semanaDoClube, gatilhoClube, fimDeTemporadaClube, figurinhaDaSelecao } from "./clube-vivo.js";
import type { Vestiario } from "./vestiario.js";
import type { Rival } from "./rival.js";
import type { EstadoTorcida } from "./torcida.js";
import { perfilCidade, type EstadoCidade } from "./cidades.js";
import type { Figurinha } from "./figurinhas.js";
import type { ClausulasContrato } from "./transferencias.js";
import { alvoSeguidores, tetoSeguidores, saltoTransferencia, famaDeReferencia, efeitosVida, gastosDoMes, imposto, semanaRedes, visibilidade, PADRAO_INICIAL, type PadraoVida } from "./vida.js";
import { bonusJovem, chanceSubir, culturaBase, NOME_CULTURA, type Cultura } from "./identidade.js";
import { semanaDoMercado, propostaPorIndicacao, janelaAberta, fimDaTemporadaNoMercado, contratoVencido, decidirAutomatico, type DadosMercado } from "./transferencias.js";
import { gradeDeNumeros, numeroLivre, numeroParaChegada, limparNumeros, type Camisa } from "./numeros.js";
import { semanaDoCaminho, fimDeTemporadaDoCaminho, decidirCaminhoAutomatico, caminhoDe, faseAmadora, IDADE_INICIAL, FASE_INICIAL, CAMINHOS, type Caminho, type Fase, type EstadoCaminho } from "./caminhos.js";
import { elencoDe, nomesDaPartida, narrarGol, narrarPartida, type LinhaNarracao } from "./narracao.js";
import { reliquiasDaPartida, premiosDaTemporada, type Ganho } from "./reliquias.js";
import { gerarFamilia, semanaFamilia, temporadaFamilia, agirFamilia, membro, acoesDe, paiTreinador, riscoLesaoFamilia, type EstadoFamilia, type AcaoFamilia, type CtxFamilia, type EscolhaFamilia } from "./familia.js";
import { agirFilho, programaPreferido, type AcaoFilho } from "./namoro.js";
import { gostosDe, MAX_ACOES_NAMORO, type Par } from "./namoro.js";
import { novoNamoro, arrumarNamoro, acharPar, baralhoDaSemana, curtir, agirNamoro, efeitosNamoro, semanaNamoro, temporadaNamoro, responderCena, type EstadoNamoro, type AcaoNamoro, type CtxNamoro } from "./namoro.js";
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
export interface ResumoTemporada { /** passagem de meia temporada (trocou de clube no meio do ano) */ parcial?: boolean; extras?: CampanhaCopa[]; mvp?: number; selRodada?: number; selMes?: number; copa?: CampanhaCopa; estadual?: CampanhaCopa; fase?: Fase; ano: number; idade: number; clube: string; clubeId?: string; liga?: string; est?: EstatEstimada; ovr: number; jogos: number; gols: number; assist: number; nota: number; posicao: number; titulo: boolean; base: number; baseGols?: number; premios?: string[];
  /** fotografia do fim da temporada (gráfico de evolução e retrospectiva) */
  valor?: number; salario?: number; fama?: number; seguidores?: number; saldo?: number }
/** Dados da imagem da notícia (o desenho é feito na tela, a partir destes ids). */
export type ImgNoticia = { k: "placar"; casa: string; fora: string; gc: number; gf: number } | { k: "transferencia"; clube: string; tipo: string; ate: number; taxa: number } | { k: "patrocinio"; marca: string } | { k: "trofeu" } | { k: "vida" } | { k: "tatuagem" } | { k: "capa"; edicao: number; clube: string; regional?: boolean };
export type TipoMarco = "clube" | "amor" | "filho" | "casa" | "recorde" | "lesao" | "escandalo" | "selecao" | "marco";
export interface Marco { ano: number; tipo: TipoMarco; texto: string }
/** Guarda na linha do tempo o que a notícia tem de marcante (namoro, casamento, filho, transferência, recorde, lesão grave, escândalo). */
export function registrarMarco(s: Save, m: Omit<Marco, "ano">) {
  const c = s.carreira, ano = ANO_INICIAL + c.temporada, l = (c.marcos ??= []);
  if (l.some((x) => x.ano === ano && x.texto === m.texto)) return;
  l.push({ ano, ...m });
  if (l.length > 400) l.splice(0, l.length - 400);
}
function marcoDaNoticia(tipo: Noticia["tipo"], titulo: string, texto: string, img?: ImgNoticia): Omit<Marco, "ano"> | undefined {
  if (img?.k === "transferencia" || /^Primeiro contrato profissional|^Contrato homegrown/.test(titulo)) return { tipo: "clube", texto: titulo };
  if (/grávida|namorada nova|noivos|se casaram|Divórcio|Fim do casamento|Noivado desfeito|Troca de namorada|termina com ele/i.test(titulo)) return { tipo: "amor", texto: titulo };
  if (/^Filho fora do casamento/.test(titulo)) return { tipo: "filho", texto: titulo };
  if (/^Recorde na|recordista/.test(titulo)) return { tipo: "recorde", texto: titulo };
  if (tipo === "lesao") { const sem = +(texto.match(/(\d+) semanas/)?.[1] ?? 0); if (sem >= 6) return { tipo: "lesao", texto: `Lesão grave: ${sem} semanas fora` }; }
  if (tipo === "polemica" && /flagra|amante|caso|escândalo|fofoca/i.test(titulo + " " + texto)) return { tipo: "escandalo", texto: titulo };
  return undefined;
}
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
  /** vida fora de campo: negócios e investimentos, saúde do corpo, imprensa e redes */
  negocios?: EstadoNegocios; saude?: EstadoSaude; midia?: EstadoMidia;
  /** agenda de momentos com escolha, parças, garagem, hobbies, estudos, adaptação no exterior e fundação */
  agenda?: EstadoAgenda; parcas?: Parca[]; luxo?: ItemLuxo[]; hobbies?: EstadoHobbies; estudos?: EstadoEstudos; adaptacao?: Adaptacao; fundacao?: Fundacao;
  /** última semana em que fez churrasco com os parças */
  churrasco?: number;
  /** linha do tempo da vida: o que aconteceu de marcante, com o ano (o resto a tela tira do histórico) */
  marcos?: Marco[];
  galeriaPremios?: Partial<Record<IdPremio, { ano: number; nome: string; clubeId: string; nacionalidade: string; eu?: boolean }[]>>;
  suspensaoEstadual?: number; statsEstadual?: { jogos: number; gols: number; assist: number; notas: number[] };
  tabelaAnterior?: { ligaId: string; ordem: string[] };
  /** tabela final real de cada temporada (decide acesso e rebaixamento no mundo) e a primeira temporada com a pirâmide valendo */
  tabelasReais?: TabelasReais; piramideDesde?: number; avisosCopa?: Record<string, string>; meioSemana?: { semana: number; resumo: ResumoPartida; participacao: Participacao; nota: number; eventos: string[] };
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
  /** placar do clube em cada rodada da liga nesta temporada (gols pró, gols contra), para o calendário */
  placaresRodada?: Record<number, [number, number]>;
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
  /** acontecimentos da temporada já vistos (semana absoluta) */
  acontecidos?: Record<string, number>;
  /** o último jogo do jogador (ela comenta no chat) */
  ultimoJogo?: { s: number; resultado: "vitoria" | "derrota" | "empate"; gols: number; nota: number; adv: string };
  /** cláusulas do contrato em vigor (multa, % de venda, bônus) */
  contrato?: ClausulasContrato;
  /** vestiário do clube atual, rival pessoal (e os de antes), torcida de cada clube, cidade onde mora e álbum */
  vestiario?: Vestiario; rival?: Rival; rivaisPassados?: Rival[]; torcidaViva?: EstadoTorcida; cidade?: EstadoCidade; cidadesMoradas?: string[]; album?: Figurinha[];
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
export const ehClassico = (pacote: PacoteDados, a: string, b: string) => { const x = infoClube(pacote, a), y = infoClube(pacote, b); return (!!x && !!y && x.cidade === y.cidade) || [a, b].sort().join("-") in CLASSICOS_EXTRA; };
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
  const antes = versaoMundo(), c = s.carreira;
  // saves de antes do acesso e rebaixamento: a pirâmide passa a valer a partir da última temporada jogada
  c.piramideDesde ??= Math.max(0, c.temporada - 1);
  const reais: TabelasReais = { ...(c.tabelaAnterior && c.temporada > 0 ? { [c.temporada - 1]: c.tabelaAnterior } : {}), ...(c.tabelasReais ?? {}) };
  sincronizarMundo(pacote, s.semente, s.carreira.temporada, s.carreira.semana, reais, c.piramideDesde);
  mudancaDeDivisao(pacote, s);
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
/** Acesso ou rebaixamento: o clube do jogador mudou de divisão no mundo, e a carreira vai junto (tabela e calendário novos). */
function mudancaDeDivisao(pacote: PacoteDados, s: Save) {
  const c = s.carreira, w = mundo(pacote), id = idClube(c.clubeId), nova = w.info[id]?.ligaId;
  if (c.fase || c.mercado?.semClube || !nova || !w.clube[id] || !w.liga[nova] || infoLiga(nova).amador) return;
  if (nova === infoLiga(c.ligaId).id) {
    // mesma divisão, mas quem subiu e quem caiu mudou os adversários: calendário e tabela novos
    const l = w.liga[nova], ids = new Set(l.clubes.map((x) => x.id));
    if (c.ordem.length !== ids.size || !c.ordem.every((x) => ids.has(idClube(x)))) { c.ordem = l.clubes.map((x) => x.id); c.tabela = novaTabela(l); }
    return;
  }
  const de = infoLiga(c.ligaId), para = infoLiga(nova), sobe = para.divisao < de.divisao || (para.divisao === de.divisao && para.nivel < de.nivel);
  const l = w.liga[nova];
  c.ligaId = nova; c.ordem = l.clubes.map((x) => x.id); c.tabela = novaTabela(l);
  const clube = infoClube(pacote, id)?.nome ?? "clube", ano = ANO_INICIAL + c.temporada;
  if (sobe) {
    noticia(s, "clube", `Acesso! O ${clube} sobe para a ${para.curto}`, `Depois da campanha na ${de.curto}, o ${clube} joga a ${para.curto} em ${ano}. ${s.jogador.apelido} vai jogar uma divisão acima.`, { k: "trofeu" });
    registrarMarco(s, { tipo: "clube", texto: `Acesso com o ${clube}: da ${de.curto} para a ${para.curto}` });
    c.moral = clamp(c.moral + 6, 0, 100); c.torcida = clamp((c.torcida ?? 50) + 8, 0, 100); c.fama = clamp(c.fama + 2, 0, 100);
  } else {
    noticia(s, "clube", `Rebaixado: o ${clube} cai para a ${para.curto}`, `A campanha na ${de.curto} não foi suficiente. Em ${ano} o ${clube} disputa a ${para.curto}.`);
    registrarMarco(s, { tipo: "clube", texto: `Rebaixado com o ${clube}: da ${de.curto} para a ${para.curto}` });
    c.moral = clamp(c.moral - 8, 0, 100); c.torcida = clamp((c.torcida ?? 50) - 5, 0, 100);
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
/** Durante o fechamento da temporada, as notícias saem com a data "Fim da temporada" (e não a da semana do calendário). */
let rotuloFim: string | undefined;
export function noticia(s: Save, tipo: Noticia["tipo"], titulo: string, texto: string, img?: ImgNoticia) {
  s.noticias.unshift({ semana: rotuloFim ?? rotuloSemana(s.carreira), titulo, texto, tipo, ...(img ? { img } : {}) });
  s.noticias = s.noticias.slice(0, 80);
  const m = marcoDaNoticia(tipo, titulo, texto, img);
  if (m) registrarMarco(s, m);
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
  if (c.vestiario?.geladeira && c.vestiario.clubeId === c.clubeId && !c.formacao) return "fora"; // geladeira do técnico
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
  const primeira = sim && reg.convocacoes === 0;
  if (sim) { reg.convocacoes++; noticia(s, "jogo", `${j.apelido} convocado`, `${j.apelido} está na lista da ${sel!.nome}${chave.endsWith("copa") ? " para a Copa do Mundo" : ""}.`); }
  if (primeira) { // primeira convocação: as redes explodem e a figurinha da seleção vai para o álbum
    const ic = infoClube(pacote, sel!.id);
    figurinhaDaSelecao(pacote, s, sel!.nome, [ic?.cores[0] ?? "#F2C200", ic?.cores[1] ?? "#0B7A3B"]);
    c.hype = clamp((c.hype ?? 0) + 0.8, -0.3, 1.5);
    c.seguidores = saltoTransferencia(c.seguidores, alvoDeSeguidores(pacote, s));
  }
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
  copa?: { id: CopaId; jogoId: string; nome: string; rotulo: string; neutro?: boolean; fase?: string;
    /** jogo que decide a vaga (volta ou jogo único): empate no agregado vai para os pênaltis */
    mataMata?: boolean;
    /** gols do jogo de ida, pela ordem casa/fora DESTE jogo */
    ida?: [number, number] };
  /** clima do jogo grande (final, clássico, briga...): selo, texto de abertura e o peso na fama e na torcida */
  clima?: { tag: string; texto: string; peso: number };
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
  const mataMata = !!cj && !cj.grupo && !cj.amistoso && !cj.rodada && (cj.perna === 2 || !cj.perna);
  const jIda = cj && cj.perna === 2 ? copa!.copa.jogos.find((x) => x.serie === cj.serie && x.perna === 1 && x.gc !== undefined) : undefined;
  const ida: [number, number] | undefined = jIda ? (jIda.casa === cj!.casa ? [jIda.gc!, jIda.gf!] : [jIda.gf!, jIda.gc!]) : undefined;
  const infoCopa = copa && cj ? { id: copa.copa.id, jogoId: cj.id, nome: COPAS[copa.copa.id].nome, rotulo: rotuloJogo(cj), fase: cj.fase, ...(cj.neutro ? { neutro: true } : {}), ...(mataMata ? { mataMata } : {}), ...(ida ? { ida } : {}) } : undefined;
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
  const ovrEf = ovr(j) * (0.92 + (0.08 * prev.moral) / 100) * (prev.cansaco > 70 ? 0.9 : 1) * fatorAdaptacao(c.adaptacao);
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
    chuva, idade: j.idade, relTecnico: c.relTecnico, moral: c.moral, jogosPro, namorada: ["namorando", "morando", "noivos", "casados"].includes(namoroDe(c).par?.etapa ?? "") };
  const clima = base ? undefined : climaDoJogo(infoCopa, ctx, estadio);
  if (clima && (clima.peso >= 1.3 || ctx.briga)) ctx.decisiva = true;
  // decisões dentro do tempo em campo: de uma a três, situações diferentes conforme posição, minuto, placar, contexto e memória
  // mais lances por partida: cerca de um a cada 15 minutos em campo (até 6), para o jogo ser sempre novidade
  const nDec = minutos <= 0 ? 0 : Math.min(6, Math.max(1, Math.round(minutos / 15) + (rng.chance(0.5) ? 1 : 0)));
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
    nomes, ctx, abertura: narr.abertura, narracao: narr.linhas, ...(clima ? { clima } : {}) };
}

/** O tamanho do jogo: final, semifinal, Copa do Mundo, mata-mata de volta, clássico, briga na reta final, estreia. */
function climaDoJogo(copa: Partida["copa"], ctx: Contexto, estadio: string): Partida["clima"] {
  const pick = (l: string[]) => l[(estadio.length + ctx.jogosPro) % l.length];
  const de = copa ? `${COPAS[copa.id].prep} ${copa.nome}` : "";
  if (copa?.fase === "final") return { tag: "FINAL", peso: copa.id === "COP" ? 1.9 : 1.6, texto: pick([`Final ${de}. Estádio lotado, mosaico na arquibancada e a taça exposta na beira do campo.`, `É a final ${de}. Fogos antes do apito, as duas torcidas cantando desde cedo.`]) };
  if (copa?.fase === "semi") return { tag: "SEMIFINAL", peso: copa.id === "COP" ? 1.6 : 1.35, texto: `Semifinal ${de}. Uma vaga na final em jogo${copa.ida ? ", e a ida já foi" : ""}.` };
  if (copa?.id === "COP") return { tag: "COPA DO MUNDO", peso: 1.4, texto: pick(["Jogo de Copa do Mundo. O país inteiro parou para ver.", "Copa do Mundo. Hino, arrepio e o mundo inteiro olhando."]) };
  if (copa?.mataMata && copa.fase !== "playoff") return { tag: copa.ida ? "JOGO DE VOLTA" : "MATA-MATA", peso: 1.25, texto: copa.ida ? `Jogo de volta ${de}. Quem perder, está fora.` : `Mata-mata ${de}: jogo único, quem perder volta para casa.` };
  if (ctx.classico) return { tag: "CLÁSSICO", peso: 1.25, texto: pick(["Clássico. A cidade dividida, a semana inteira só se falou disso.", "Dia de clássico. Arquibancada pulsando desde cedo, as duas torcidas provocando."]) };
  if (ctx.briga === "titulo") return { tag: "BRIGA PELO TÍTULO", peso: 1.2, texto: "Reta final e briga pelo título: cada ponto agora vale ouro." };
  if (ctx.briga === "rebaixamento") return { tag: "CONTRA A QUEDA", peso: 1.2, texto: "Reta final e o fantasma do rebaixamento ronda o estádio. Não dá para perder." };
  if (ctx.estreia) return { tag: "ESTREIA", peso: 1.1, texto: "Sua estreia como profissional. A família está na arquibancada." };
  return undefined;
}

/** Disputa de pênaltis do mata-mata: quem bate primeiro, os batedores e, para cada cobrança, se entra (sem a do jogador,
 *  que é decidida na tela). Até 5 cobranças de cada lado e depois alternadas até alguém errar. */
export interface Disputa { meuPrimeiro: boolean; meu: boolean[]; adv: boolean[]; batMeu: string[]; batAdv: string[] }
export function disputaDePenaltis(s: Save, p: Partida): Disputa {
  const rng = rngDe(s, "disputa", p.copa?.jogoId ?? "");
  const n = p.nomes, uniq = (l: (string | undefined)[]) => [...new Set(l.filter((x): x is string => !!x && x !== n.nome))];
  const batMeu = uniq([n.batedor, n.comp, n.meia, n.ponta, n.capitao, n.zagMeu, n.goleiro]), batAdv = uniq([n.craque, n.ata, n.vol, n.zag, n.lat, n.gol]);
  const chute = () => rng.chance(0.76);
  return { meuPrimeiro: rng.chance(0.5), meu: Array.from({ length: 20 }, chute), adv: Array.from({ length: 20 }, chute), batMeu, batAdv };
}
/** A cobrança do próprio jogador na disputa. */
export function decisaoDisputa(s: Save, p: Partida): Decisao {
  return { min: 120, ...montarDecisao(rngDe(s, "disputa-lance", p.copa?.jogoId ?? ""), DISPUTA, p.ctx, p.nomes) };
}
/** Placar e vencedor de uma sequência de cobranças (ordem: a primeira cobrança é de quem começa). */
export function placarDisputa(cob: { meu: boolean; ok: boolean }[]): { meu: number; adv: number; fim: boolean; venceu?: boolean } {
  let meu = 0, adv = 0, bm = 0, ba = 0;
  for (const x of cob) {
    if (x.meu) { bm++; if (x.ok) meu++; } else { ba++; if (x.ok) adv++; }
    if (bm <= 5 && ba <= 5) {
      if (meu + (5 - bm) < adv) return { meu, adv, fim: true, venceu: false };
      if (adv + (5 - ba) < meu) return { meu, adv, fim: true, venceu: true };
    } else if (bm === ba && meu !== adv) return { meu, adv, fim: true, venceu: meu > adv };
  }
  if (bm === ba && bm >= 5 && meu !== adv) return { meu, adv, fim: true, venceu: meu > adv };
  return { meu, adv, fim: false };
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
  const r: ResultadoDecisao = { ...resolverEfeito(rng, op, nivel, { ...p.nomes, marco: String((p.ctx?.jogosPro ?? 0) + 1) }), min: d.min, nivel, situacao: d.situacao, opcao: opcaoId };
  // lesão de verdade (duas semanas ou mais) no meio do jogo: não dá para continuar em campo
  if ((r.lesao ?? 0) >= 2 && !r.sai && SITUACAO[d.situacao]?.momento !== "pos") r.sai = true;
  return r;
}
/** Melhor opção pela nota esperada (só para a política automática; a tela não mostra nada disso). */
export function melhorOpcao(s: Save, p: Partida, d: Decisao): string {
  const ops = SITUACAO[d.situacao].opcoes.filter((o) => d.opcoes.some((x) => x.id === o.id));
  return ops.map((op) => ({ id: op.id, v: notaEsperada(habilidade(s.jogador.at, s.jogador.personalidade, s.jogador.tracos, op), nivelAdversario(p), op) })).sort((a, b) => b.v - a.v)[0].id;
}

// ------------------------------------------------------------------ fim da semana
/** Resumo de uma partida do jogador (o da copa traz a competição e a fase). */
export interface ResumoPartida { nomeCasa: string; nomeFora: string; idCasa?: string; idFora?: string; golsCasa: number; golsFora: number; nota: number; gols: number; assist: number; minutos: number; tipo: Partida["tipo"]; competicao?: string; rotulo?: string; penaltis?: string; escalacao?: Escalacao; melhorEmCampo?: boolean }
export interface ResumoSemana {
  /** o que o jogador fez sozinho pela vida no automático */
  vidaAuto?: VidaAuto;
  rotulo: string; escalacao: Escalacao; partida?: ResumoPartida; copa?: ResumoPartida;
  ovrAntes: number; ovrDepois: number; ganhos: [Atributo, number][]; moral: [number, number]; cansaco: [number, number]; fama: [number, number];
  dinheiro?: { salario: number; aluguel: number; gastos?: number }; eventos: string[]; posicaoTabela: number; fimDeTemporada?: ResumoTemporada;
  seguidores?: [number, number]; saldo?: [number, number]; relTecnico?: [number, number]; torcida?: [number, number];
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
    if (d.relPar) { const par = namoroDe(c).par; if (par) par.relacao = clamp(par.relacao + d.relPar, 0, 100); }
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
  const resumo: ResumoPartida = { nomeCasa: partida.nomeCasa, nomeFora: partida.nomeFora, idCasa: partida.casa, idFora: partida.fora, golsCasa: gc, golsFora: gf, nota, gols, assist, minutos, tipo: partida.tipo, escalacao: partida.escalacao,
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
  const pesoJogo = partida.clima?.peso ?? 1;
  if (pro) c.torcida = clamp((c.torcida ?? 50) + ((nota - 6.5) * (copa ? 2 : 1.5) + gols) * pesoJogo, 0, 100);
  c.moral = clamp(c.moral + 3 * (nota - 6.5), 0, 100);
  c.relTecnico = clamp(c.relTecnico + (nota - 6.5) * (pro ? 1 : 1.5) * (c.tecnico?.estilo === "linha-dura" ? 1.5 : 1), 0, 100);
  const grande = (mundo(pacote).clube[c.clubeId] ?? clubeDe(l, c.clubeId)).forca >= 75 ? 1.5 : 1, vitrine = copa && !ehEstadual(copa.id) ? 1.5 : 1;
  c.fama = clamp(c.fama + (1 - c.fama / 110) * (pro ? pesoJogo * vitrine * grande * (0.5 * gols + (nota >= 8 ? 0.3 : 0)) : 0.1 * gols + (nota >= 8 ? 0.1 : 0)), 0, 100);
  c.cansaco = clamp(c.cansaco + (30 * minutos) / 90, 0, 100);
  const l2 = sortearLesao(rng, c.cansaco, intensidadeAlta, j.idade, 1 - (1 - casa.lesao / 100) * (pro ? 1 : 0.6) * riscoLesaoFamilia(c.familia) * riscoLesaoSaude(saudeDe(c)));
  if (l2) { c.lesao = Math.max(c.lesao, l2.semanas); eventos.push(`Lesão ${l2.tipo === "leve" ? "leve" : l2.tipo === "media" ? "muscular" : "grave"}${copa ? " no jogo da copa" : ""}: ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); noticia(s, "lesao", "Lesão", `${j.apelido} se machucou e fica ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); }
  const res = (partida.souCasa ? gc - gf : gf - gc) > 0 ? "vitória" : gc === gf ? "empate" : "derrota";
  if (pro) c.ultimoJogo = { s: semanaAbsJogo(c), resultado: res === "vitória" ? "vitoria" : res, gols, nota, adv: infoClube(pacote, adversario)?.nome ?? "" };
  noticia(s, "jogo", `${copa ? `${COPAS[copa.id].curto}: ` : ""}${partida.nomeCasa} ${gc} × ${gf} ${partida.nomeFora}`,
    `${res[0].toUpperCase() + res.slice(1)}${copa ? ` pela ${copa.nome} (${copa.rotulo.toLowerCase()})` : pro ? "" : faseAmadora(c) ? ` ${ROTULO_FASE[c.fase!]}` : " na base"}. ${j.apelido} jogou ${minutos} minutos${gols ? `, fez ${gols} ${gols > 1 ? "gols" : "gol"}` : ""}${assist ? `, deu ${assist} ${assist > 1 ? "assistências" : "assistência"}` : ""} e tirou nota ${nota.toFixed(1)}.`, { k: "placar", casa: partida.casa, fora: partida.fora, gc, gf });
  return { resumo, participacao, nota, placar, placarBase };
}

/** Quarta-feira: aplica o jogo da copa do jogador e roda a rodada da copa. Fica guardado para o resumo da semana. */
export function concluirJogoDaCopa(pacote: PacoteDados, s: Save, plano: Plano, partida: Partida, decisoes: ResultadoDecisao[], disputa?: { venceu: boolean; bateu?: boolean; converteu?: boolean; placar?: string }): ResumoPartida | undefined {
  const c = s.carreira, eventos: string[] = [], rng = rngDe(s, "copa-quarta"), info = partida.copa;
  if (!info) return;
  if (partida.escalacao === "suspenso") { if (ehEstadual(info.id)) c.suspensaoEstadual = 0; else c.suspensaoCopa = 0; eventos.push(`Cumpriu suspensão no ${COPAS[info.id].curto}.`); }
  const r = aplicarPartida(pacote, s, partida, decisoes, previaPlano(s, { ...plano, acoes: plano.acoes.slice(0, 2) }).notaExtra, plano.intensidade === "alta", rng, eventos);
  const e = copasDe(pacote, s)[info.id]!, w = mundo(pacote), forca = (id: string) => w.clube[id]?.forca ?? 60;
  const placar = r.placar ?? (partida.lances.length || partida.entrada ? [partida.golsCasa, partida.golsFora] as [number, number] : undefined);
  // pênaltis jogados na tela: valem se o agregado terminou mesmo empatado
  const meuId = ehDeSelecao(info.id) ? idSelecao(s.jogador.nacionalidade) : c.clubeId, advId = partida.casa === meuId ? partida.fora : partida.casa;
  const empatou = !!placar && !!info.mataMata && placar[0] + (info.ida?.[0] ?? 0) === placar[1] + (info.ida?.[1] ?? 0);
  const pen = empatou && disputa ? (disputa.venceu ? meuId : advId) : undefined;
  rodarSemana(e, c.semana, forca, rngDe(s, "copa-rodada"), placar ? { id: info.jogoId, gc: placar[0], gf: placar[1], ...(pen ? { penaltis: pen } : {}) } : undefined);
  const jg = e.jogos.find((x) => x.id === info.jogoId)!;
  if (pen && disputa?.bateu) {
    const j = s.jogador;
    if (disputa.converteu) { c.moral = clamp(c.moral + (disputa.venceu ? 5 : 2), 0, 100); if (disputa.venceu) { c.torcida = clamp((c.torcida ?? 50) + 4, 0, 100); c.fama = clamp(c.fama + 1, 0, 100); } }
    else { c.moral = clamp(c.moral - (disputa.venceu ? 2 : 7), 0, 100); if (!disputa.venceu) { c.torcida = clamp((c.torcida ?? 50) - 4, 0, 100); noticia(s, "polemica", `${j.apelido} perde pênalti na disputa`, `${j.apelido} desperdiçou a cobrança e ${ehDeSelecao(info.id) ? "a seleção foi eliminada" : "o time foi eliminado"}${disputa.placar ? ` (${disputa.placar} nos pênaltis)` : ""}.`); } }
    if (disputa.converteu && disputa.venceu) noticia(s, "jogo", `${j.apelido} converte e ${ehDeSelecao(info.id) ? "a seleção" : "o time"} passa nos pênaltis`, `Frieza na marca da cal${disputa.placar ? `: ${disputa.placar} na disputa` : ""}.`);
  }
  const resumo: ResumoPartida = r.resumo ?? { nomeCasa: partida.nomeCasa, nomeFora: partida.nomeFora, idCasa: partida.casa, idFora: partida.fora, golsCasa: jg.gc!, golsFora: jg.gf!, nota: 0, gols: 0, assist: 0, minutos: 0, tipo: "profissional", competicao: info.nome, rotulo: info.rotulo, escalacao: partida.escalacao };
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
  const ovrAntes = ovr(j), atAntes = { ...j.at }, moral0 = c.moral, cansaco0 = c.cansaco, fama0 = c.fama, lesao0 = c.lesao;
  const segIni = c.seguidores, saldoIni = s.casa.saldo, relIni = c.relTecnico, torcIni = c.torcida ?? 50;
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
      if (meu) { const [gp, gc] = g.casa === c.clubeId ? [a, b] : [b, a]; c.resultadosClube = [...(c.resultadosClube ?? []).slice(-9), gp > gc ? 3 : gp === gc ? 1 : 0]; (c.placaresRodada ??= {})[jogo.rodada] = [gp, gc]; }
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
  const evoluido = evoluirSemana(j.at, j.pot, { idade: j.idade, foco: plano.foco, intensidade: plano.intensidade, participacao, moral: c.moral, personalTrainer: !!saudeDe(c).equipe.preparador, fatorDeclinio: fatorDeclinio(saudeDe(c)), profissionalismo: j.personalidade.profissionalismo, fClube: fatorDoClube(pacote, s) });
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
  // saúde: desgaste do corpo, lesão grave que vira crônica, crises de dor, equipe particular
  {
    const sd = saudeDe(c), minutos = (resumoPartida?.minutos ?? 0) + (quarta?.resumo?.minutos ?? 0);
    const ss = semanaSaude(sd, rngDe(s, "saude"), { minutos, intensidadeAlta: plano.intensidade === "alta", cansaco: c.cansaco, vidaNoturna: c.vidaNoturna, idade: j.idade, descansos: cont("descanso"), alimentacao: padraoDe(c).alimentacao, recuperacaoCasa: casa.recuperacao, lesaoNova: c.lesao > lesao0 ? c.lesao : 0, ano: ANO_INICIAL + c.temporada });
    eventos.push(...ss.avisos);
    if (ss.lesao) c.lesao = Math.max(c.lesao, ss.lesao);
    if (ss.moral) c.moral = clamp(c.moral + ss.moral, 0, 100);
    if (ss.pressao) c.pressao = clamp(c.pressao + ss.pressao, 0, 100);
    if (ss.noticia) noticia(s, "lesao", ss.noticia, `Os exames de ${j.apelido} mostram um problema que vai exigir cuidado daqui para frente.`);
  }
  if (c.lesao > 0) c.lesao--;
  c.cansaco = clamp(c.cansaco - 20 - casa.recuperacao - vida.recuperacao - en.recuperacao - recuperacaoSaude(saudeDe(c)), 0, 100);
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
    // bônus por gol do contrato (antes de os números do mês zerarem)
    const bonusGol = c.fase || c.formacao ? 0 : (c.contrato?.bonusGol ?? 0) * (c.mesStats?.gols ?? 0);
    if (bonusGol) eventos.push(`Bônus por gol do contrato: R$ ${bonusGol.toLocaleString("pt-BR")}.`);
    const pat = fecharMesPatrocinios(s, eventos) + bonusGol;
    // várzea, academia, colégio e universidade: a família paga o custo de vida
    const liquido = salarioLiquido(c) + pat, g = c.fase ? { itens: [], total: 0 } : gastosDoMes(padraoDe(c), c.ligaId, c.salario, c.fama, c.formacao, manutencaoMensal(s.casa), c.cidade ? perfilCidade(c.cidade.nome, c.cidade.pais).custo : 1);
    const { aluguel } = fecharMes(s.casa, liquido - g.total);
    if (c.mesesPatrocinio > 0) c.mesesPatrocinio--; else c.patrocinioMensal = 0;
    // equipe particular, parças com função, fundação e garagem fecham o mês junto
    const extra = mesVidaFora(s, eventos);
    const equipe = custoEquipe(saudeDe(c)) + extra;
    if (equipe) s.casa.saldo -= equipe;
    const mn = mesNegocios(negociosDe(c), rngDe(s, "negocios-mes"), ctxNegocios(pacote, s));
    s.casa.saldo += mn.lucro; // o rendimento dos investimentos fica aplicado
    if (mn.moral) c.moral = clamp(c.moral + mn.moral, 0, 100);
    if (mn.fama) c.fama = clamp(c.fama + mn.fama, 0, 100);
    if (mn.torcida) c.torcida = clamp((c.torcida ?? 50) + mn.torcida, 0, 100);
    eventos.push(...mn.avisos);
    for (const x of mn.noticias) noticia(s, x.polemica ? "polemica" : "dinheiro", x.titulo, x.texto);
    if (negociosDe(c).empresas.length || mn.invest) eventos.push(`Negócios no mês: ${mn.lucro >= 0 ? "+" : "−"}R$ ${Math.abs(Math.round(mn.lucro)).toLocaleString("pt-BR")} das empresas${mn.invest ? `, ${mn.invest >= 0 ? "+" : "−"}R$ ${Math.abs(Math.round(mn.invest)).toLocaleString("pt-BR")} nos investimentos` : ""}.`);
    dinheiro = { salario: Math.round(liquido), aluguel, gastos: g.total + equipe };
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
      const m = marcaInteressada(r3, c.fama, j.idade, c.patrocinios ?? [], c.recusadas ?? [], c.seguidores, infoClube(pacote, c.clubeId)?.pais, j.pais);
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
  // 12. negócios (propostas pelo celular) e imprensa/redes (feed da semana e pedido de entrevista)
  {
    const n = negociosDe(c), ab = semanaAbsJogo(c);
    if (n.proposta && ab > n.proposta.expira) { eventos.push(`A proposta "${n.proposta.titulo}" expirou.`); n.proposta = undefined; }
    const p = sortearProposta(n, rngDe(s, "negocio-prop"), ctxNegocios(pacote, s));
    if (p) { n.proposta = p; eventos.push(`Proposta de negócio: ${p.titulo}.`); }
    const m = midiaDe(s), cm = ctxMidia(pacote, s, { nota: notaSemana || undefined, gols: resumoPartida?.gols ?? 0, minutos: resumoPartida?.minutos ?? 0, adv: jogo ? infoClube(pacote, jogo.adversario)?.apelido : undefined, polemica, escandalo: !!sn.escandalo });
    feedDaSemana(m, rngDe(s, "feed"), cm);
    const tinha = !!m.pauta;
    sortearPauta(m, rngDe(s, "pauta"), cm);
    if (m.pauta && !tinha) eventos.push("Pedido de entrevista: a imprensa quer falar com você.");
    c.fama = clamp(c.fama + 0.02 * (m.imprensa - 50) / 50, 0, 100);
  }
  semanaVidaFora(pacote, s, eventos, !!jogoDaSemana(s) || !!jogoCopaDaSemana(pacote, s));
  if (!fim) {
    // acontecimentos da temporada: o gol que viraliza, a gripe, o salário atrasado...
    const ac = semanaAcontecimentos(agendaDe(c), rngDe(s, "acontece"), { ab: semanaAbsJogo(c), semana: c.semana, ano: ANO_INICIAL + c.temporada, apelido: j.apelido, clube: infoClube(pacote, c.clubeId)?.nome ?? "", cidade: infoClube(pacote, c.clubeId)?.cidade ?? "",
      idade: j.idade, fama: c.fama, salario: c.salario, saldo: s.casa.saldo, jogou: !!resumoPartida && resumoPartida.minutos > 0, nota: resumoPartida?.nota ?? 0, gols: resumoPartida?.gols ?? 0,
      resultado: c.ultimoJogo && c.ultimoJogo.s >= semanaAbsJogo(c) - 1 ? c.ultimoJogo.resultado : undefined, classico: !!jogo && ehClassico(pacote, jogo.casa, jogo.fora), titular: participacao === "titular",
      fClube: mundo(pacote).clube[idClube(c.clubeId)]?.fClube ?? 1, exterior: infoLiga(c.ligaId).regiao !== "BRA", seguranca: temFuncao(parcasDe(s), "seguranca"), temporadaBoa: forma(c) >= 7, profissional: !c.formacao && !c.fase && !c.mercado?.semClube }, (c.acontecidos ??= {}));
    if (ac) { aplicarEfeitoVida(pacote, s, ac.ef); eventos.push(`${ac.bom ? "👍" : "👎"} ${ac.titulo}.`); noticia(s, ac.bom ? "vida" : "polemica", ac.titulo, ac.texto); }
  }
  if (!fim) semanaDoClube(pacote, s, eventos, { jogou: !!resumoPartida && resumoPartida.minutos > 0 && resumoPartida.tipo === "profissional", titular: participacao === "titular", nota: resumoPartida?.nota ?? 0, gols: resumoPartida?.gols ?? 0, adv: jogo?.adversario, rodada: jogo?.rodada, grande: (partida?.clima?.peso ?? 1) >= 1.2 });
  checarRecordes(pacote, s, eventos);
  if (!fim) { noticiasDeLesao(pacote, s, eventos); demissaoNoMeio(pacote, s, eventos); }
  return {
    rotulo, escalacao: partida?.escalacao ?? (c.semana - 1 < SEMANAS_PRE ? "semJogo" : "fora"), partida: resumoPartida, ...(quarta ? { copa: quarta.resumo } : {}),
    ovrAntes, ovrDepois: ovr(j), ganhos, moral: [moral0, c.moral], cansaco: [cansaco0, c.cansaco], fama: [fama0, c.fama], dinheiro, eventos,
    seguidores: [segIni, c.seguidores], saldo: [saldoIni, s.casa.saldo], relTecnico: [relIni, c.relTecnico], torcida: [torcIni, c.torcida ?? 50],
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
  const base = { pais: s.jogador.pais, idade: s.jogador.idade, fama: c.fama, salario: c.salario, saldo: s.casa.saldo, exterior: li.regiao !== "BRA", golfo: li.id === "KSA1",
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
export const namoroDe = (c: Carreira): EstadoNamoro => { const n = (c.namoro ??= novoNamoro()); arrumarNamoro(n); return n; };
export const agendaDe = (c: Carreira): EstadoAgenda => (c.agenda ??= novaAgenda());
export const parcasDe = (s: Save): Parca[] => (s.carreira.parcas ??= parcasIniciais(rngDe(s, "parcas-iniciais"), s.jogador.nacionalidade, ANO_INICIAL + s.carreira.temporada));
export const luxoDe = (c: Carreira): ItemLuxo[] => (c.luxo ??= []);
export const hobbiesDe = (c: Carreira): EstadoHobbies => (c.hobbies ??= { ativos: [], nivel: {} });
export const estudosDe = (c: Carreira): EstadoEstudos => (c.estudos ??= { idiomas: {}, formacoes: [] });
/** Cidade natal: a do primeiro clube da carreira. */
export function cidadeNatal(pacote: PacoteDados, s: Save): string {
  const id = s.carreira.historico[0]?.clubeId ?? s.carreira.clubeId;
  return infoClube(pacote, id)?.cidade ?? "sua cidade";
}
export function ctxSocial(pacote: PacoteDados, s: Save, temJogo: boolean): CtxSocial {
  const c = s.carreira, j = s.jogador, n = namoroDe(c), par = n.par, l = luxoDe(c);
  const patrimonio = s.casa.saldo + patrimonioInvestido(negociosDe(c)) + l.reduce((a, i) => a + i.valor, 0);
  return { semanaAbs: semanaAbsJogo(c), semana: c.semana, ano: ANO_INICIAL + c.temporada, idade: j.idade, fama: c.fama, saldo: s.casa.saldo, salario: c.salario, patrimonio,
    vidaNoturna: c.vidaNoturna, apelido: j.apelido, nac: j.nacionalidade, cidadeNatal: cidadeNatal(pacote, s), clube: infoClube(pacote, c.clubeId)?.nome ?? "", exterior: infoLiga(c.ligaId).regiao !== "BRA" && j.nacionalidade === "BRA", temJogo,
    assessor: !!negociosDe(c).assessor, ferias: c.semana < SEMANAS_PRE || c.semana >= SEMANAS_TEMPORADA - 1, casado: par?.etapa === "casados", nomePar: par?.nome.split(" ")[0],
    familia: familiaDe(pacote, s).membros, filhos: n.filhos ?? [], parcas: parcasDe(s), carroEsportivo: temEsportivo(l), valoresEmCasa: valoresEmCasa(l) };
}
/** Aplica o efeito de um momento da agenda (ou de um acontecimento) na vida do jogador. */
export function aplicarEfeitoVida(pacote: PacoteDados, s: Save, ef: EfeitoVida) {
  const c = s.carreira, cl = (x: number) => clamp(x, 0, 100);
  if (ef.moral) c.moral = cl(c.moral + ef.moral);
  if (ef.fama) c.fama = cl(c.fama + ef.fama);
  if (ef.torcida) c.torcida = cl((c.torcida ?? 50) + ef.torcida);
  if (ef.relTecnico) c.relTecnico = cl(c.relTecnico + ef.relTecnico);
  if (ef.cansaco) c.cansaco = cl(c.cansaco + ef.cansaco);
  if (ef.lesao) c.lesao = Math.max(c.lesao, ef.lesao);
  if (ef.dinheiro) s.casa.saldo += Math.round(ef.dinheiro);
  if (ef.engajamento) c.engajamento = cl((c.engajamento ?? 40) + ef.engajamento);
  if (ef.hype) c.hype = clamp((c.hype ?? 0) + ef.hype, -0.3, 1.5);
  if (ef.imprensa) { const m = midiaDe(s); m.imprensa = cl(m.imprensa + ef.imprensa); }
  if (ef.vidaNoturna) c.vidaNoturna = cl(c.vidaNoturna + ef.vidaNoturna);
  if (ef.desgaste) { const sd = saudeDe(c); sd.desgaste = cl(sd.desgaste + ef.desgaste); }
  if (ef.pressao) c.pressao = cl(c.pressao + ef.pressao);
  if (ef.adaptacao && c.adaptacao) c.adaptacao.valor = cl(c.adaptacao.valor + ef.adaptacao);
  if (ef.impacto && c.fundacao) { c.fundacao.impacto += ef.impacto; c.fundacao.impactoAno += ef.impacto; }
  if (ef.evolucao) c.bonusEvolucao += ef.evolucao * 0.25;
  if (ef.familiar) { const m = familiaDe(pacote, s).membros.find((x) => x.id === ef.familiar![0]); if (m && !m.falecido) m.relacao = cl(m.relacao + ef.familiar[1]); }
  if (ef.filho) { const fs = namoroDe(c).filhos ?? []; for (const [i, f] of fs.entries()) if (ef.filho[0] < 0 || ef.filho[0] === i) f.relacao = cl((f.relacao ?? 50) + ef.filho[1]); }
  if (ef.parca) { const p = parcasDe(s).find((x) => x.id === ef.parca![0]); if (p) p.lealdade = cl(p.lealdade + ef.parca[1]); }
  if (ef.luto) agendaDe(c).luto = { semanas: ef.luto, quem: "" };
  if (ef.noticia) noticia(s, ef.noticia.tipo ?? "vida", ef.noticia.titulo, ef.noticia.texto);
  if (ef.marco) registrarMarco(s, ef.marco);
  if (ef.gatilho) gatilhoVida(pacote, s, ef.gatilho);
}
function gatilhoVida(pacote: PacoteDados, s: Save, g: string) {
  if (gatilhoClube(pacote, s, g)) return;
  const c = s.carreira, [k, a, b] = g.split(":"), ps = parcasDe(s);
  if (k === "parca-divida") { const p = ps.find((x) => x.id === a); if (p) p.divida = (p.divida ?? 0) + +b; }
  else if (k === "parca-afastar") c.parcas = ps.filter((x) => x.id !== a);
  else if (k === "parca-novo") { const n = ps.length + 1 + Math.floor(rngDe(s, "parca-id").next() * 1000); ps.push(novoParca(rngDe(s, "parca-novo"), s.jogador.nacionalidade, ANO_INICIAL + c.temporada, new Set(ps.map((x) => x.nome)), a as PerfilParca, `p${n}`)); }
  else if (k === "familiar-hospital") { const m = familiaDe(pacote, s).membros.find((x) => x.id === a); if (m) m.tratamento = true; }
  else if (k === "familia-todos") { for (const m of familiaDe(pacote, s).membros) if (!m.falecido) m.relacao = clamp(m.relacao + +a, 0, 100); }
  else if (k === "filho-boleiro") { const f = (namoroDe(c).filhos ?? [])[+a], r = rngDe(s, "filho-boleiro", a); if (f) f.futebol = { fase: "escolinha", ovr: r.int(28, 38), pot: r.int(55, 88) }; }
  else if (k === "par") { const par = namoroDe(c).par; if (par) par.relacao = clamp(par.relacao + +a, 0, 100); }
  else if (k === "garagem-furto") {
    const l = luxoDe(c), val = l.filter((i) => ["relogio", "joia", "arte"].includes(LUXO[i.tipo].cat)).sort((x, y) => y.valor - x.valor);
    const levar = a === "tudo" ? val.slice(0, 3) : val.slice(0, 1);
    c.luxo = l.filter((i) => !levar.includes(i));
  }
  else if (k.startsWith("par-") || k === "ex-reatar") gatilhoAmor(pacote, s, k, a);
  else if (k === "esports") hobbiesDe(c).esports = { valor: 400_000, titulos: 0 };
  else if (k === "musica") hobbiesDe(c).musica = ANO_INICIAL + c.temporada;
}
function gatilhoAmor(pacote: PacoteDados, s: Save, k: string, a?: string) {
  const c = s.carreira, n = namoroDe(c), p = n.par, ab = semanaAbsJogo(c);
  if (k === "par-fim" && p) { n.ex.push(p.nome); n.par = undefined; n.mudancaDecidida = n.mudanca; }
  else if (k === "par-vem" && p && n.mudanca) { p.cidadeClube = n.mudanca; p.cidade = n.mudanca; n.mudancaDecidida = n.mudanca; }
  else if (k === "par-distancia") n.mudancaDecidida = n.mudanca;
  else if (k === "par-longe" && p) { p.cidadeClube = "outra cidade"; n.mudanca = n.mudancaDecidida = infoClube(pacote, c.clubeId)?.cidade; }
  else if (k === "par-famosa" && p) { p.famosa = true; registrarMarco(s, { tipo: "amor", texto: `${p.nome.split(" ")[0]} vira celebridade: casal do ano` }); }
  else if (k === "par-filho" && p && !n.gravidez && rngDe(s, "par-filho").chance(0.55)) { n.gravidez = { mae: p.nome, parto: ab + 36, caso: false }; noticia(s, "vida", `${p.nome.split(" ")[0]} está grávida: o jogador vai ser pai`, `${s.jogador.apelido} confirmou a novidade nas redes.`); }
  else if (k === "ex-reatar" && a && !p) {
    const r = rngDe(s, "ex-reatar", a), cidade = infoClube(pacote, c.clubeId)?.cidade ?? "";
    const profs = ["influencer", "psicologa", "modelo", "medica", "jornalista", "personal", "advogada", "professora", "arquiteta"] as const;
    n.ex = n.ex.filter((x) => x !== a);
    n.par = { id: `ex-${ab}`, nome: a, idade: s.jogador.idade + r.int(-2, 2), cidade, profissao: r.pick(profs), jeito: r.pick(["romântica", "tranquila", "ciumenta", "independente", "caseira"]), bio: "", interesse: 60, etapa: "namorando", relacao: 58, desde: ab, conversas: 5, cidadeClube: cidade };
    noticia(s, "vida", `${s.jogador.apelido} e ${a.split(" ")[0]} reatam`, "O casal foi visto junto de novo num restaurante.");
  }
}
/** A semana fora de campo: agenda, parças, hobbies, estudos, adaptação, fundação, garagem, luto. */
function semanaVidaFora(pacote: PacoteDados, s: Save, eventos: string[], temJogo: boolean) {
  const c = s.carreira, j = s.jogador, a = agendaDe(c), ab = semanaAbsJogo(c), rng = rngDe(s, "vida-fora");
  const uid0 = a.uid;
  for (const v of vencidas(a, ab)) { aplicarEfeitoVida(pacote, s, v.ef); eventos.push(`${v.o.titulo}: ${v.texto}`); posOcasiao(s, v.o.chave, v.ef); }
  if (a.luto && a.luto.semanas > 0) { c.moral = clamp(c.moral - 1, 0, 100); a.luto.semanas--; if (!a.luto.semanas) a.luto = undefined; }
  // parças
  const ps = parcasDe(s), ep = efeitosParcas(ps);
  c.moral = clamp(c.moral + ep.moral, 0, 100); c.cansaco = clamp(c.cansaco + ep.cansaco, 0, 100);
  c.engajamento = clamp((c.engajamento ?? 40) + ep.engajamento, 0, 100); c.vidaNoturna = clamp(c.vidaNoturna + ep.vidaNoturna, 0, 100);
  for (const p of ps) {
    if (p.divida && p.perfil !== "interesseiro" && rng.chance(0.04)) { s.casa.saldo += p.divida; eventos.push(`${p.apelido} pagou o que devia: R$ ${p.divida.toLocaleString("pt-BR")}.`); p.divida = undefined; p.lealdade = clamp(p.lealdade + 5, 0, 100); }
    p.lealdade = clamp(p.lealdade - 0.15, 0, 100);
  }
  // hobbies
  const h = hobbiesDe(c);
  if (h.ativos.length || h.esports) {
    const eh = semanaHobbies(h, a, rng, ab, c.fama);
    c.moral = clamp(c.moral + eh.moral, 0, 100); c.pressao = clamp(c.pressao + eh.pressao, 0, 100); c.vidaNoturna = clamp(c.vidaNoturna + eh.vidaNoturna, 0, 100);
    c.engajamento = clamp((c.engajamento ?? 40) + eh.engajamento, 0, 100); s.casa.saldo += eh.dinheiro;
    if (eh.desgaste) { const sd = saudeDe(c); sd.desgaste = clamp(sd.desgaste + eh.desgaste, 0, 100); }
    if (eh.imprensa) { const m = midiaDe(s); m.imprensa = clamp(m.imprensa + eh.imprensa, 0, 100); }
    eventos.push(...eh.avisos);
  }
  // estudos
  const es = estudosDe(c);
  if (es.atual) {
    const r = semanaEstudos(es, c.cansaco > 80);
    s.casa.saldo -= r.custo; c.cansaco = clamp(c.cansaco + r.cansaco, 0, 100);
    if (r.concluiu) { eventos.push(`Formado: ${r.concluiu}!`); noticia(s, "vida", `${j.apelido} conclui curso`, `${r.concluiu}. O jogador estudou nas horas vagas, entre treinos e viagens.`); registrarMarco(s, { tipo: "marco", texto: `Conclui: ${r.concluiu}` }); c.moral = clamp(c.moral + 4, 0, 100); }
  }
  // adaptação no exterior: só quando o país tem outra língua
  const paisLiga = infoLiga(c.ligaId).pais, nativa = linguaNativa(j.nacionalidade);
  if (linguaNativa(paisLiga) === nativa && paisLiga !== "INT") c.adaptacao = undefined;
  else if (!infoLiga(c.ligaId).amador && paisLiga !== "INT") {
    if (!c.adaptacao || c.adaptacao.pais !== paisLiga) { c.adaptacao = novaAdaptacao(paisLiga, nativa, es.idiomas, ab); eventos.push(`Vida nova em outro país: adaptação ${Math.round(c.adaptacao.valor)}%.`); }
    const par = namoroDe(c).par;
    semanaAdaptacao(c.adaptacao, es.idiomas, !!par && ["morando", "noivos", "casados"].includes(par.etapa), ps.some((p) => p.funcao));
    c.moral = clamp(c.moral + moralAdaptacao(c.adaptacao), 0, 100);
    ocasioesExterior(a, rng, c.adaptacao, ab, par?.etapa === "casados", par?.nome.split(" ")[0]);
  }
  // fundação
  if (c.fundacao) ocasioesFundacao(a, rng, c.fundacao, ab);
  // garagem: coisa nova dá alegria por umas semanas; o status puxa a fama
  const l = luxoDe(c);
  if (l.some((i) => ab - i.novidade <= 4)) c.moral = clamp(c.moral + 0.8, 0, 100);
  c.fama = clamp(c.fama + Math.min(0.03, statusLuxo(l) / 3000), 0, 100);
  // a vida a dois: datas, crises, a ex, a mudança, a carreira dela
  { const n = namoroDe(c), par = n.par; semanaAmor(a, rng, n, { semanaAbs: ab, semana: c.semana, ano: ANO_INICIAL + c.temporada, fama: c.fama, salario: c.salario, exterior: infoLiga(c.ligaId).regiao !== "BRA", apelido: j.apelido, temFilhoComEla: !!par && (n.filhos ?? []).some((f) => f.mae === par.nome) }); }
  // família, filhos, parças, convites, encrencas
  const so = semanaSocial(a, rng, ctxSocial(pacote, s, temJogo), eventos);
  aplicarEfeitoVida(pacote, s, so.ef);
  for (const n of so.noticias) if (n) noticia(s, n.tipo ?? "vida", n.titulo, n.texto);
  for (const o of a.pendentes) if (+o.uid.slice(1) > uid0) eventos.push(`Na agenda: ${o.titulo}.`);
}
/** O mês: custo dos parças com função e da fundação, valorização da garagem. Devolve o custo total. */
function mesVidaFora(s: Save, eventos: string[]): number {
  const c = s.carreira, ps = parcasDe(s);
  let custo = efeitosParcas(ps).custo;
  mesLuxo(luxoDe(c), rngDe(s, "luxo-mes"));
  if (c.fundacao) {
    const f = mesFundacao(c.fundacao);
    custo += f.custo; c.torcida = clamp((c.torcida ?? 50) + f.torcida, 0, 100);
    const m = midiaDe(s); m.imprensa = clamp(m.imprensa + f.imprensa, 0, 100);
    if (f.impacto) eventos.push(`${c.fundacao.nome}: mais ${f.impacto} pontos de impacto no mês.`);
  }
  if (custo) s.casa.saldo -= custo;
  return custo;
}
/** Fim de temporada fora de campo: prêmio humanitário, filhos que jogam bola e a escolha das férias. */
function fimDeTemporadaVida(pacote: PacoteDados, s: Save, r: ResumoTemporada, ev: string[]) {
  const c = s.carreira, f = c.fundacao, ano = r.ano;
  if (f && ganhouCoracaoDeOuro(f)) {
    const nome = `Prêmio Coração de Ouro ${ano}`;
    f.premios.push(ano); (r.premios ??= []).push(nome);
    receberReliquias(s, [{ conquista: "trofeu-coracao", reliquia: { id: `rel-trofeu-coracao-${ano}`, chave: "trofeu-coracao", tipo: "trofeu", nome, legenda: `${f.nome} · ${f.impactoAno} pontos de impacto em ${ano}`, ano, cores: ["#E58FB1", "#B8892B"], modelo: "estrela" } }], ev);
    c.torcida = clamp((c.torcida ?? 50) + 5, 0, 100); c.fama = clamp(c.fama + 2, 0, 100);
    noticia(s, "vida", `${s.jogador.apelido} ganha o Prêmio Coração de Ouro`, `O trabalho da ${f.nome} em ${f.cidade} foi reconhecido como o mais importante do futebol no ano.`);
  }
  if (f) f.impactoAno = 0;
  // filhos que jogam bola: crescem uma temporada
  const w = mundo(pacote), rr = rngDe(s, "filhos-bola");
  for (const fi of namoroDe(c).filhos ?? []) {
    const fb = fi.futebol, idade = ano + 1 - fi.ano;
    if (!fb || fb.fase === "parou") continue;
    if (fb.fase !== "pro") fb.ovr = Math.min(fb.pot, fb.ovr + rr.int(2, 7));
    if (fb.fase === "escolinha" && idade >= 14) { fb.fase = "base"; fb.clubeId = c.clubeId; noticia(s, "vida", `Filho de ${s.jogador.apelido} entra na base`, `${fi.nome}, ${idade} anos, passou na peneira do ${infoClube(pacote, c.clubeId)?.nome ?? "clube"}.`); registrarMarco(s, { tipo: "filho", texto: `${fi.nome} entra na base do ${infoClube(pacote, c.clubeId)?.nome ?? "clube"}` }); }
    else if (fb.fase === "base" && idade >= 18) {
      const forca = fb.clubeId ? w.clube[fb.clubeId]?.forca ?? 70 : 70;
      if (fb.ovr >= forca - 16) { fb.fase = "pro"; noticia(s, "vida", `${fi.nome} assina o primeiro contrato`, `O filho de ${s.jogador.apelido} vira jogador profissional aos ${idade} anos.`); registrarMarco(s, { tipo: "filho", texto: `${fi.nome} vira jogador profissional` }); c.moral = clamp(c.moral + 8, 0, 100); }
      else { fb.fase = "parou"; ev.push(`${fi.nome} foi dispensado da base e decidiu estudar.`); }
    }
  }
  agendarFerias(agendaDe(c), ctxSocial(pacote, s, false));
}
/** Um momento que puxa o próximo (depois do casamento, a lua de mel). */
function posOcasiao(s: Save, chave: string, ef: EfeitoVida) {
  if (chave.startsWith("casamento-") && ef.marco) agendarLuaDeMel(agendaDe(s.carreira), semanaAbsJogo(s.carreira), s.carreira.salario);
}
// ------------------------------------------------------------------ ações da vida fora de campo (tela)
type Res = { ok: boolean; msg: string };
export function responderOcasiaoJogo(pacote: PacoteDados, s: Save, uid: string, opcao: string): Res {
  const r = resolverOcasiao(agendaDe(s.carreira), uid, opcao, rngDe(s, "ocasiao", uid, opcao));
  if (!r) return { ok: false, msg: "Esse momento já passou." };
  aplicarEfeitoVida(pacote, s, r.ef);
  posOcasiao(s, r.o.chave, r.ef);
  return { ok: true, msg: r.texto };
}
export function churrascoJogo(s: Save): Res {
  const c = s.carreira, ab = semanaAbsJogo(c);
  if (c.churrasco === ab) return { ok: false, msg: "Já teve churrasco nesta semana." };
  c.churrasco = ab;
  for (const p of parcasDe(s)) p.lealdade = clamp(p.lealdade + 5, 0, 100);
  c.moral = clamp(c.moral + 3, 0, 100); c.vidaNoturna = clamp(c.vidaNoturna + 2, 0, 100); c.cansaco = clamp(c.cansaco + 4, 0, 100); s.casa.saldo -= 3_000;
  return { ok: true, msg: "Churrasco na sua casa: pagode, resenha e os parças felizes." };
}
export function funcaoParcaJogo(s: Save, id: string, f: FuncaoParca | ""): Res {
  const ps = parcasDe(s), p = ps.find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Esse parça não está mais por perto." };
  if (f) { for (const x of ps) if (x.funcao === f) x.funcao = undefined; p.funcao = f; p.lealdade = clamp(p.lealdade + 10, 0, 100); return { ok: true, msg: `${p.apelido} agora é o seu ${FUNCOES[f].nome.toLowerCase()}.` }; }
  p.funcao = undefined; p.lealdade = clamp(p.lealdade - 10, 0, 100);
  return { ok: true, msg: `${p.apelido} não trabalha mais para você.` };
}
export function afastarParcaJogo(pacote: PacoteDados, s: Save, id: string): Res {
  const c = s.carreira, ps = parcasDe(s), p = ps.find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Esse parça não está mais por perto." };
  c.parcas = ps.filter((x) => x !== p);
  if ((p.perfil === "fofoqueiro" || p.lealdade < 35) && rngDe(s, "afastar", id).chance(0.45)) {
    noticia(s, "polemica", `Ex-parça detona ${s.jogador.apelido}`, `${p.apelido}, amigo de infância afastado, contou bastidores da vida do jogador num podcast.`);
    c.moral = clamp(c.moral - 4, 0, 100); c.torcida = clamp((c.torcida ?? 50) - 2, 0, 100);
    return { ok: true, msg: `${p.apelido} saiu do grupo atirando: deu entrevista contando tudo.` };
  }
  void pacote;
  return { ok: true, msg: `${p.apelido} saiu do grupo.` };
}
export function comprarLuxoJogo(s: Save, t: TipoLuxo): Res {
  const c = s.carreira, l = luxoDe(c), x = LUXO[t];
  if (c.fama < x.famaMin) return { ok: false, msg: `Isso é para quem tem fama ${x.famaMin}.` };
  if (s.casa.saldo < x.preco) return { ok: false, msg: "Não tem dinheiro em conta para isso." };
  if (l.length >= MAX_LUXO) return { ok: false, msg: "A garagem e o cofre estão cheios. Venda alguma coisa." };
  s.casa.saldo -= x.preco;
  l.push({ uid: `l${Date.now() % 1e7}${l.length}`, tipo: t, valor: x.preco, ano: ANO_INICIAL + c.temporada, novidade: semanaAbsJogo(c) });
  if (x.preco >= 3_000_000) { noticia(s, "dinheiro", `${s.jogador.apelido} compra ${x.nome.toLowerCase()}`, `Aquisição de R$ ${(x.preco / 1e6).toFixed(1).replace(".", ",")} milhões chamou atenção nas redes.`); registrarMarco(s, { tipo: "marco", texto: `Compra ${x.nome.toLowerCase()}` }); }
  return { ok: true, msg: `${x.emoji} ${x.nome} na sua garagem.` };
}
export function venderLuxoJogo(s: Save, uid: string): Res {
  const l = luxoDe(s.carreira), i = l.find((x) => x.uid === uid);
  if (!i) return { ok: false, msg: "Esse item não está mais com você." };
  s.carreira.luxo = l.filter((x) => x !== i); s.casa.saldo += i.valor;
  return { ok: true, msg: `Vendeu ${LUXO[i.tipo].nome.toLowerCase()} por R$ ${i.valor.toLocaleString("pt-BR")}.` };
}
export function hobbyJogo(s: Save, hb: Hobby): Res {
  const h = hobbiesDe(s.carreira);
  if (h.ativos.includes(hb)) { h.ativos = h.ativos.filter((x) => x !== hb); return { ok: true, msg: `Largou o ${HOBBIES[hb].nome.toLowerCase()} por enquanto.` }; }
  if (h.ativos.length >= MAX_HOBBIES) return { ok: false, msg: `No máximo ${MAX_HOBBIES} hobbies: o tempo não dá para tudo.` };
  h.ativos.push(hb);
  return { ok: true, msg: `${HOBBIES[hb].emoji} ${HOBBIES[hb].nome} entrou na rotina.` };
}
export function matricularJogo(s: Save, curso: Curso | ""): Res {
  const e = estudosDe(s.carreira);
  if (!curso) { e.atual = undefined; return { ok: true, msg: "Curso trancado." }; }
  if (e.atual) return { ok: false, msg: "Um curso de cada vez." };
  e.atual = { curso, progresso: 0 };
  return { ok: true, msg: `Matriculado: ${infoCurso(curso).nome}.` };
}
export function criarFundacaoJogo(pacote: PacoteDados, s: Save): Res {
  const c = s.carreira;
  if (c.fundacao) return { ok: false, msg: "A fundação já existe." };
  if (s.casa.saldo < CUSTO_FUNDACAO) return { ok: false, msg: "Não tem dinheiro em conta para isso." };
  s.casa.saldo -= CUSTO_FUNDACAO;
  const cidade = cidadeNatal(pacote, s);
  c.fundacao = { nome: `Fundação ${s.jogador.apelido}`, cidade, criada: ANO_INICIAL + c.temporada, nivel: 1, impacto: 0, impactoAno: 0, premios: [] };
  noticia(s, "vida", `${s.jogador.apelido} cria fundação em ${cidade}`, "A fundação vai cuidar de crianças e famílias do bairro onde o jogador cresceu.");
  registrarMarco(s, { tipo: "marco", texto: `Cria a Fundação ${s.jogador.apelido} em ${cidade}` });
  c.torcida = clamp((c.torcida ?? 50) + 3, 0, 100);
  return { ok: true, msg: `A Fundação ${s.jogador.apelido} abriu as portas em ${cidade}.` };
}
export function nivelFundacaoJogo(s: Save, n: 0 | 1 | 2 | 3): Res {
  const f = s.carreira.fundacao;
  if (!f) return { ok: false, msg: "Crie a fundação primeiro." };
  f.nivel = n;
  return { ok: true, msg: "Doação mensal ajustada." };
}
export { temFuncao };
export const negociosDe = (c: Carreira): EstadoNegocios => (c.negocios ??= novoNegocios());
export const saudeDe = (c: Carreira): EstadoSaude => (c.saude ??= novaSaude());
export const midiaDe = (s: Save): EstadoMidia => (s.carreira.midia ??= novaMidia(rngDe(s, "midia-inicio")));
export function ctxNegocios(pacote: PacoteDados, s: Save): CtxNegocios {
  const c = s.carreira;
  void pacote;
  return { ano: ANO_INICIAL + c.temporada, semanaAbs: semanaAbsJogo(c), fama: c.fama, seguidores: c.seguidores, saldo: s.casa.saldo, apelido: s.jogador.apelido, numero: String(s.jogador.numero ?? 10) };
}
export function ctxMidia(pacote: PacoteDados, s: Save, x: Partial<CtxMidia> = {}): CtxMidia {
  const c = s.carreira, j = s.jogador, ult = c.formaUlt.slice(-3), r = c.resultadosClube?.at(-1);
  return { pais: infoClube(pacote, c.clubeId)?.pais, apelido: j.apelido, clube: infoClube(pacote, c.clubeId)?.apelido ?? "time", gols: 0, minutos: 0, polemica: false, escandalo: false, lesionado: c.lesao > 0,
    forma: ult.length ? ult.reduce((a, b) => a + b, 0) / ult.length : 6.5, fama: c.fama, seguidores: c.seguidores, janela: !!janelaAberta(c), relTecnico: c.relTecnico,
    selecao: (c.selecao?.convocacoes ?? 0) > 0, base: c.formacao || !!c.fase, semanaAbs: semanaAbsJogo(c), temperamento: j.personalidade.temperamento, carisma: j.personalidade.carisma ?? 10,
    patrocinios: c.patrocinios?.length ?? 0, resultado: r === undefined ? undefined : r === 3 ? "v" : r === 1 ? "e" : "d", ...x };
}
/** Aplica o efeito de um post ou de uma entrevista na carreira. */
function aplicarMidia(s: Save, ef: EfeitoPost) {
  const c = s.carreira, m = midiaDe(s);
  if (ef.engajamento) c.engajamento = clamp((c.engajamento ?? 40) + ef.engajamento, 0, 100);
  if (ef.hype) c.hype = clamp((c.hype ?? 0) + ef.hype, -0.3, 1.5);
  if (ef.torcida) c.torcida = clamp((c.torcida ?? 50) + ef.torcida, 0, 100);
  if (ef.moral) c.moral = clamp(c.moral + ef.moral, 0, 100);
  if (ef.relTecnico) c.relTecnico = clamp(c.relTecnico + ef.relTecnico, 0, 100);
  if (ef.fama) c.fama = clamp(c.fama + ef.fama, 0, 100);
  if (ef.cansaco) c.cansaco = clamp(c.cansaco + ef.cansaco, 0, 100);
  if (ef.dinheiro) s.casa.saldo += ef.dinheiro;
  if (ef.imprensa) m.imprensa = clamp(m.imprensa + ef.imprensa, 0, 100);
  if (ef.noticia) noticia(s, ef.noticia.polemica ? "polemica" : "clube", ef.noticia.titulo, ef.noticia.texto);
}
export function postarJogo(pacote: PacoteDados, s: Save, t: TipoPost): { ok: boolean; msg: string } {
  const ef = postar(midiaDe(s), t, rngDe(s, "post", t), ctxMidia(pacote, s));
  if ("erro" in ef) return { ok: false, msg: ef.erro };
  aplicarMidia(s, ef);
  return { ok: true, msg: ef.msg };
}
export function responderEntrevistaJogo(pacote: PacoteDados, s: Save, id: string): { ok: boolean; msg: string } {
  const ef = responderPauta(midiaDe(s), id, ctxMidia(pacote, s));
  if ("erro" in ef) return { ok: false, msg: ef.erro };
  aplicarMidia(s, ef);
  return { ok: true, msg: ef.msg };
}
export function abrirEmpresaJogo(pacote: PacoteDados, s: Save, tipo: TipoEmpresa): { ok: boolean; msg: string } {
  const r = abrirEmpresa(negociosDe(s.carreira), tipo, ctxNegocios(pacote, s), rngDe(s, "empresa", tipo));
  if (r.custo) s.casa.saldo -= r.custo;
  if (r.ok) { noticia(s, "dinheiro", `${s.jogador.apelido} vira empresário`, r.msg); registrarMarco(s, { tipo: "marco", texto: r.msg.replace(" abriu as portas!", ": primeiro dia do negócio") }); }
  return r;
}
export function agirEmpresaJogo(pacote: PacoteDados, s: Save, uid: string, acao: AcaoEmpresa): { ok: boolean; msg: string } {
  const r = agirEmpresa(negociosDe(s.carreira), uid, acao, ctxNegocios(pacote, s)), c = s.carreira;
  if (r.custo) s.casa.saldo -= r.custo;
  if (r.ganho) s.casa.saldo += r.ganho;
  if (r.cansaco) c.cansaco = clamp(c.cansaco + r.cansaco, 0, 100);
  if (r.engajamento) c.engajamento = clamp((c.engajamento ?? 40) + r.engajamento, 0, 100);
  if (r.ok && acao === "vender") registrarMarco(s, { tipo: "marco", texto: r.msg });
  return r;
}
export function aplicarJogo(s: Save, tipo: TipoInvest, valor: number): { ok: boolean; msg: string } {
  const r = aplicar(negociosDe(s.carreira), tipo, valor, s.casa.saldo);
  if (r.custo) s.casa.saldo -= r.custo;
  if (r.ganho) s.casa.saldo += r.ganho;
  return r;
}
export function responderPropostaNegocio(pacote: PacoteDados, s: Save, aceitar: boolean): { ok: boolean; msg: string } {
  const r = responderProposta(negociosDe(s.carreira), aceitar, ctxNegocios(pacote, s), rngDe(s, "proposta-neg"));
  if (r.custo) s.casa.saldo -= r.custo;
  return r;
}
export function assessorJogo(s: Save, on: boolean) { negociosDe(s.carreira).assessor = on; return { ok: true, msg: on ? `Assessor financeiro contratado: R$ ${CUSTO_ASSESSOR.toLocaleString("pt-BR")} por mês.` : "Assessor dispensado." }; }
export function equipeJogo(s: Save, k: Staff, on: boolean) { saudeDe(s.carreira).equipe[k] = on; return { ok: true, msg: on ? "Contratado. Começa já na semana que vem." : "Dispensado." }; }
export function tratarJogo(s: Save, parte: ParteCorpo) {
  const sd = saudeDe(s.carreira), cr = sd.cronicas.find((x) => x.parte === parte);
  if (!cr) return { ok: false, msg: "Nada para tratar aí." };
  cr.tratando = !cr.tratando;
  return { ok: true, msg: cr.tratando ? (sd.equipe.fisio ? "Tratamento começou: sessões com o fisioterapeuta toda semana." : "Tratamento marcado, mas sem fisioterapeuta particular ele quase não avança.") : "Tratamento interrompido." };
}
export function operarJogo(s: Save, parte: ParteCorpo) {
  const r = operar(saudeDe(s.carreira), parte, rngDe(s, "cirurgia", parte));
  if (!r.semanas) return { ok: false, msg: r.msg };
  s.carreira.lesao = Math.max(s.carreira.lesao, r.semanas);
  noticia(s, "lesao", `${s.jogador.apelido} passa por cirurgia`, `${r.msg} Fica ${r.semanas} semanas fora.`);
  return { ok: true, msg: r.msg };
}
export function ctxFamilia(pacote: PacoteDados, s: Save): CtxFamilia {
  const c = s.carreira, jg = jogoDaSemana(s), w = mundo(pacote);
  return { semanaAbs: semanaAbsJogo(c), ano: ANO_INICIAL + c.temporada, idadeJogador: s.jogador.idade, exterior: infoLiga(c.ligaId).regiao !== "BRA" && s.jogador.pais === "BRA",
    salario: c.salario, saldo: s.casa.saldo, profissional: !c.fase && !!w.clube[c.clubeId], clubeId: c.clubeId, forcaClube: w.clube[c.clubeId]?.forca ?? 60,
    relTecnico: c.relTecnico, fama: c.fama, jogoEmCasa: !!jg?.souCasa, janela: !!janelaAberta(c) && !c.formacao && s.jogador.idade >= 18, temporada: c.temporada };
}
export function ctxNamoro(pacote: PacoteDados, s: Save): CtxNamoro {
  const c = s.carreira;
  return { ano: ANO_INICIAL + c.temporada, semente: s.semente, semanaAbs: semanaAbsJogo(c), idadeJogador: s.jogador.idade, fama: c.fama, cidade: infoClube(pacote, c.clubeId).cidade, salario: c.salario, saldo: s.casa.saldo, vidaNoturna: c.vidaNoturna,
    pais: paisOndeMora(pacote, s), paisJogador: s.jogador.pais };
}
/** País onde o jogador mora agora (a cidade escolhida, senão o país do clube). */
export function paisOndeMora(pacote: PacoteDados, s: Save): string {
  return s.carreira.cidade?.pais ?? infoClube(pacote, s.carreira.clubeId)?.pais ?? s.jogador.pais ?? "BRA";
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
export function agirNamoroJogo(pacote: PacoteDados, s: Save, id: string, acao: AcaoNamoro, extra?: string): { ok: boolean; msg: string } {
  const c = s.carreira, r = agirNamoro(namoroDe(c), id, acao, ctxNamoro(pacote, s), extra);
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
/** O jogo mais recente (para ela comentar no chat). */
function ctxConversa(pacote: PacoteDados, s: Save, p: Par): CtxConversa {
  const c = s.carreira, ab = semanaAbsJogo(c), u = c.ultimoJogo && ab - c.ultimoJogo.s <= 1 ? c.ultimoJogo : undefined, prox = jogoDaSemana(s);
  return { apelido: s.jogador.apelido, clube: infoClube(pacote, c.clubeId)?.nome ?? "", adv: u?.adv, resultado: u?.resultado, gols: u?.gols, nota: u?.nota, foraDeCasa: !!prox && !prox.souCasa,
    exterior: infoLiga(c.ligaId).regiao !== "BRA" && s.jogador.nacionalidade === "BRA", fama: c.fama, semanaAbs: ab, gostoDela: gostosDe(p).gosta[0], profissao: p.profissao };
}
/** A conversa da semana no chat (começa um assunto novo se ainda não houver). */
export function chatDe(pacote: PacoteDados, s: Save, id: string): { conversa: Conversa; opcoes: OpcaoConversa[] } | undefined {
  const n = namoroDe(s.carreira), p = acharPar(n, id);
  if (!p) return;
  const cx = ctxConversa(pacote, s, p), cv = conversaDaSemana(p, cx);
  return { conversa: cv, opcoes: opcoesConversa(p, cv, cx) };
}
export function responderChatJogo(pacote: PacoteDados, s: Save, id: string, fala: string): { ok: boolean; msg: string } {
  const c = s.carreira, n = namoroDe(c), ab = semanaAbsJogo(c), p = acharPar(n, id);
  if (!p) return { ok: false, msg: "Conversa não encontrada." };
  if (n.semana !== ab) { n.semana = ab; n.feitas = 0; }
  if (n.feitas >= MAX_ACOES_NAMORO) return { ok: false, msg: "Já foram programas demais nesta semana." };
  const r = responderConversa(p, fala, ctxConversa(pacote, s, p), rngDe(s, "conversa", id, fala, p.conversa?.hist.length ?? 0));
  if (!r.ok) return { ok: false, msg: "Essa conversa já acabou." };
  n.feitas++;
  if (r.fim) {
    p.conversas += r.revelou ? 2 : 1;
    if (r.convite) p.topouSair = ab;
    const total = p.conversa?.total ?? r.delta;
    return { ok: true, msg: `${total >= 8 ? "Ótima conversa" : total >= 0 ? "Conversa boa" : "A conversa esfriou"} (relação ${total >= 0 ? "+" : ""}${total}).${r.convite ? ` ${p.nome.split(" ")[0]} topou sair: é só marcar.` : ""}${r.revelou ? " Agora você sabe do que ela gosta." : ""}` };
  }
  return { ok: true, msg: "" };
}
export function responderCenaJogo(s: Save, id: string, opcao: string): { ok: boolean; msg: string } {
  const r = responderCena(namoroDe(s.carreira), id, opcao), c = s.carreira;
  if (r.fama) c.fama = clamp(c.fama + r.fama, 0, 100);
  return r;
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
  const sel = { convocacoes: c.selecao?.convocacoes ?? 0, copas: c.selecao?.copas?.filter((x) => x.jogos > 0).length ?? 0 };
  const vis = Math.max(visibilidade(clubeId, cl?.ligaId, cl?.fClube ?? 1), sel.convocacoes ? 0.9 : 0);
  return alvoSeguidores(c.fama, vis, s.jogador.personalidade.carisma ?? 10, c.engajamento ?? 40, c.hype ?? 0, tetoSeguidores(clubeId, cl?.ligaId, cl?.fClube ?? 1, sel));
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
  rotuloFim = `Fim da temporada ${ANO_INICIAL + s.carreira.temporada}`;
  try { return fecharTemporada(pacote, s, eventos); } finally { rotuloFim = undefined; }
}
function fecharTemporada(pacote: PacoteDados, s: Save, eventos: string[]): ResumoTemporada {
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
  // vida no clube: títulos (bônus, aeroporto), figurinha do ano e o balanço da briga com o rival
  fimDeTemporadaClube(pacote, s, r, ev);
  // tabela final (vale para as vagas das copas da próxima temporada)
  c.tabelaAnterior = { ligaId: infoLiga(c.ligaId).id, ordem: ordenar(c.tabela).map((t) => t.clube) };
  if (!c.fase && !infoLiga(c.ligaId).amador) (c.tabelasReais ??= {})[c.temporada] = c.tabelaAnterior;
  c.notasRodada = undefined;
  c.copas = undefined; c.statsCopa = undefined; c.suspensaoCopa = undefined; c.statsEstadual = undefined; c.suspensaoEstadual = undefined; c.statsExtra = undefined;
  fimDeTemporadaVida(pacote, s, r, ev);
  r.valor = Math.round(valorMercado(r.ovr, j.idade, Math.max(1, c.anosContrato), mundo(pacote).liga[infoLiga(c.ligaId).id]?.fLiga ?? 0.6));
  r.salario = c.salario; r.fama = Math.round(c.fama); r.seguidores = c.seguidores; r.saldo = Math.round(s.casa.saldo);
  c.historico.push(r);
  if (titulo) { c.fama = clamp(c.fama + 5, 0, 100); c.torcida = clamp((c.torcida ?? 50) + 10, 0, 100); }
  noticia(s, "clube", `Fim da temporada ${r.ano}`, `${r.clube} terminou em ${posicao}º. ${j.apelido}: ${r.jogos} jogos no profissional, ${r.gols} gols, ${r.assist} assistências${r.base ? `, ${r.base} jogos na base` : ""}.`);
  // nova temporada
  { const tf = temporadaFamilia(pacote, familiaDe(pacote, s), rngDe(s, "familia-temporada"), ANO_INICIAL + c.temporada + 1, s.jogador.pais, eventos); c.moral = clamp(c.moral + tf.moral, 0, 100); }
  { const tn = temporadaNamoro(namoroDe(c), eventos, { semente: s.semente, ano: ANO_INICIAL + c.temporada, salario: c.salario, paises: [paisOndeMora(pacote, s), s.jogador.pais] });
    if (tn.casou) agendarCasamento(agendaDe(c), semanaAbsJogo(c), tn.casou, c.salario);
    if (tn.custo) s.casa.saldo -= tn.custo;
    if (tn.escandalo) { c.fama = clamp(c.fama + 1, 0, 100); c.torcida = clamp((c.torcida ?? 50) - 4, 0, 100); }
    if (tn.noticia) noticia(s, tn.escandalo ? "polemica" : "vida", tn.noticia, tn.escandalo ? `A vida pessoal de ${s.jogador.apelido} virou assunto nos programas de fofoca.` : `Festa para a família e os amigos do futebol.`); }
  feriasSaude(saudeDe(c));
  j.idade++; c.temporada++; c.semana = 0; c.anosContrato--; c.recusadas = [];
  sincronizar(pacote, s);
  noticiasDaVirada(pacote, s);
  // a liga pode ter mudado (acesso ou rebaixamento): a tabela nova é a da divisão em que o clube vai jogar
  const lN = ligaAtual(pacote, s);
  c.tabela = novaTabela(lN); c.stats = statsVazias(); c.resultadosClube = []; c.placaresRodada = {};
  const clube = clubeDe(lN, c.clubeId);
  if (c.fase) { c.anosContrato = Math.max(1, c.anosContrato); fimDeTemporadaDoCaminho(pacote, s, eventos); }
  if (c.fase) { /* várzea, academia, colégio e universidade: a passagem é pelos convites */ }
  else if (c.formacao && j.idade >= 18) {
    c.escolhaNumero = "chegada"; // sobe para o profissional: escolhe o número no elenco de cima
    c.formacao = false; c.anosContrato = 3;
    c.salario = Math.round(salarioMensal({ ovr: ovr(j), idade: j.idade, liga: lN, clube, agente: c.agente, fama: c.fama }));
    noticia(s, "clube", "Primeiro contrato profissional", `${j.apelido} assina por 3 anos: R$ ${c.salario.toLocaleString("pt-BR")} por mês.`);
  } else if (c.anosContrato <= 0 && c.formacao) {
    c.anosContrato = 2;
    c.salario = Math.round(Math.max(3000, salarioMensal({ ovr: ovr(j), idade: j.idade, liga: lN, clube, agente: c.agente, fama: c.fama, formacao: true })));
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
  const vida = vidaAutomatica(pacote, s);
  const plano = planoAutomatico(s);
  // quarta: jogo da copa continental
  const jc = jogoCopaDaSemana(pacote, s);
  if (jc) { const pc = prepararPartida(pacote, s, plano, jc); if (pc) concluirJogoDaCopa(pacote, s, plano, pc, decisoesAutomaticas(s, pc)); }
  const p = prepararPartida(pacote, s, plano);
  const res = concluirSemana(pacote, s, plano, p, p ? decisoesAutomaticas(s, p) : []);
  res.vidaAuto = vida;
  return res;
}
export interface VidaAuto { familia: number; filhos: number; par: number; outros: number; amigos: number }
/** No automático o jogador não larga a vida: liga para quem da família está esfriando, sai com a parceira do jeito que ela
 *  gosta, brinca com os filhos, responde os casinhos e os matches e manda mensagem para os amigos. Casos escondidos ficam
 *  por conta do jogador (o automático não arrisca). */
export function vidaAutomatica(pacote: PacoteDados, s: Save): VidaAuto {
  const c = s.carreira, ab = semanaAbsJogo(c), v: VidaAuto = { familia: 0, filhos: 0, par: 0, outros: 0, amigos: 0 };
  const ok = (r: { ok: boolean }, k: keyof VidaAuto) => { if (r.ok) v[k]++; };
  // família: liga para quem está mais distante; visita quem esfriou muito
  const f = familiaDe(pacote, s), ctxF = ctxFamilia(pacote, s);
  const vivos = f.membros.filter((m) => !m.falecido).sort((a, b) => a.relacao - b.relacao);
  for (const m of vivos.filter((m) => m.relacao < 72).slice(0, 3)) ok(agirFamiliaJogo(pacote, s, m.id, "ligar"), "familia");
  if (vivos[0] && vivos[0].relacao < 45 && ab % 6 === 0) ok(agirFamiliaJogo(pacote, s, vivos[0].id, "visitar"), "familia");
  const novo = f.membros.find((m) => acoesDe(m, ctxF).includes("indicarBase"));
  if (novo) ok(agirFamiliaJogo(pacote, s, novo.id, "indicarBase"), "familia");
  // filhos
  const n = namoroDe(c);
  (n.filhos ?? []).forEach((fi, i) => { if ((fi.relacao ?? 70) < 80) ok(agirFilhoJogo(pacote, s, i, ab % 4 === 0 ? "passear" : ab % 7 === 0 ? "levarJogo" : "brincar"), "filhos"); });
  // o relacionamento sério: conversa sempre que esfria e um programa que ela curte a cada duas semanas
  const p = n.par;
  if (p && p.etapa !== "match") {
    if (p.relacao < 75) ok(agirNamoroJogo(pacote, s, p.id, "conversar"), "par");
    if (ab % 3 === 0 || p.relacao < 55) { const a = programaPreferido(p, ab, !!n.gravidez, s.casa.saldo, c.salario); if (a) ok(agirNamoroJogo(pacote, s, p.id, a), "par"); }
  }
  // casinhos e matches: responde para não sumirem
  for (const x of [...(n.ficantes ?? [])]) if (x.relacao < 65) ok(agirNamoroJogo(pacote, s, x.id, "conversar"), "outros");
  for (const m of [...n.matches].slice(0, 3)) if (m.conversas < 4 || m.relacao < 50) ok(agirNamoroJogo(pacote, s, m.id, "conversar"), "outros");
  // amigos de verdade (fora do clube): uma mensagem a cada duas semanas
  if (ab % 2 === 0) {
    const rr = relacoesDe(c), amigos = Object.values(rr.lista).filter((x) => x.nivel >= 45 && !x.companheiro).sort((a, b) => b.nivel - a.nivel).slice(0, 2);
    for (const x of amigos) ok(agirRelacao(pacote, s, x.nome, "mensagem"), "amigos");
  }
  return v;
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
