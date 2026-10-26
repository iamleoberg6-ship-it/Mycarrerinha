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
import { mundo, infoClube, idClube, ligaDoClube, sincronizarMundo, viradaAtual, baseDoClube, ondeJoga, versaoMundo, nivelDaBase, rankingDaLiga, janelaDoMeioAtual, notasDaRodada, selecaoDaRodada, selecaoDoMes, premiosDaLiga, type Selecionado, type PremiosLiga } from "./mundo.js";
import { forcaDoElenco, type JogadorNPC } from "./liga.js";
import { LIGA_DA_BASE, type PaisId } from "./dna.js";
import { COPAS, ehEstadual, ufDoClube, forcaNoEstadual, classificados, novaCopa, rodarSemana, jogoDoClubeNaSemana, copaDoClube, rotuloJogo, idaDe, regiaoNaCopa, NOME_FASE, type CopaId, type EstadoCopa, type JogoCopa } from "./copas.js";
import { infoLiga, DA_CIDADE, NA_CIDADE } from "./ligas.js";
import { familiaridadeInicial, penalidade, ganhoSemanal, sugestaoDoTecnico, PODE_JOGAR, type Familiaridade } from "./posicoes.js";
import { estrelas, relacoesDe, relacao, semanaRelacoes, subir, atencao, chanceCamisa, chanceIndicacao, podeAgir, rotuloNivel, type EstadoRelacoes, type AcaoRel } from "./relacoes.js";
import { estatisticasEstimadas, type EstatEstimada } from "./perfil-jogador.js";
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
export interface ResumoTemporada { mvp?: number; selRodada?: number; selMes?: number; copa?: CampanhaCopa; estadual?: CampanhaCopa; fase?: Fase; ano: number; idade: number; clube: string; clubeId?: string; liga?: string; est?: EstatEstimada; ovr: number; jogos: number; gols: number; assist: number; nota: number; posicao: number; titulo: boolean; base: number; baseGols?: number; premios?: string[] }
/** Dados da imagem da notícia (o desenho é feito na tela, a partir destes ids). */
export type ImgNoticia = { k: "placar"; casa: string; fora: string; gc: number; gf: number } | { k: "transferencia"; clube: string; tipo: string; ate: number; taxa: number } | { k: "patrocinio"; marca: string } | { k: "trofeu" } | { k: "vida" } | { k: "tatuagem" };
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
  /** prêmios da liga na última temporada terminada (craque, seleção, artilheiro...) */
  premiosLiga?: PremiosLiga;
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
  if (versaoMundo() === antes) return;
  const c = s.carreira;
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

export function rotuloSemana(c: Carreira): string {
  const ano = ANO_INICIAL + c.temporada;
  const r = c.semana - SEMANAS_PRE + 1;
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
  if (c.lesao > 0) return "lesionado";
  if (!copa && c.semana < SEMANAS_PRE) return "semJogo";
  if (copa ? (estadual ? c.suspensaoEstadual : c.suspensaoCopa) : c.suspensao) return "suspenso";
  if (copa) { const e = escalacao(pacote, { ...s, carreira: { ...c, suspensao: 0, semana: Math.max(c.semana, SEMANAS_PRE) } }, cansacoPrevisto); return e === "base" ? "fora" : e; }
  const elenco = elencoAtual(pacote, s);
  const meu = pontuacaoTitular(ovr(j), forma(c), c.relTecnico, cansacoPrevisto) + bonusJovem(c.clubeId, j.idade);
  const rank = elenco.filter((x) => x.posicao === j.posicao).filter((x) => pontuacaoTitular(x.ovr, 6.5, 50, 0) > meu).length;
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
  c.copas = Object.fromEntries((Object.keys(COPAS) as CopaId[]).map((id) => [id, novaCopa(id, c.temporada, classificados(fonte, id), forca, pais, regiaoNaCopa, s.semente)]));
  return c.copas;
}
/** Jogo da copa do clube do jogador nesta semana (quarta), se ele é profissional e o clube está na copa. */
export function jogoCopaDaSemana(pacote: PacoteDados, s: Save): { copa: EstadoCopa; jogo: JogoCopa } | undefined {
  const c = s.carreira;
  if (c.fase) return;
  const r = jogoDoClubeNaSemana(copasDe(pacote, s), c.clubeId, c.semana);
  return r && r.jogo.gc === undefined ? r : undefined;
}
/** Dias da semana (0 = segunda) travados por jogo de copa: só se joga. */
export function diasTravados(s: Save): number[] {
  const c = s.carreira;
  if (c.fase) return [];
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
  const l = ligaAtual(pacote, s), c = s.carreira, j = s.jogador, W = mundo(pacote);
  const cj = copa?.jogo;
  const jogo = cj ? { casa: cj.casa, fora: cj.fora, souCasa: cj.casa === c.clubeId, adversario: cj.casa === c.clubeId ? cj.fora : cj.casa } : jogoDaSemana(s);
  if (!jogo) return;
  const clubeM = (id: string) => W.clube[idClube(id)] ?? clubeDe(l, id);
  const infoCopa = copa && cj ? { id: copa.copa.id, jogoId: cj.id, nome: COPAS[copa.copa.id].nome, rotulo: rotuloJogo(cj), ...(cj.neutro ? { neutro: true } : {}) } : undefined;
  // na quarta, o cansaço é o de segunda e terça; no domingo, o da semana inteira (com o jogo de quarta, se houve)
  const prev = cj ? previaPlano(s, { ...plano, acoes: plano.acoes.slice(0, 2) }) : previaPlano(s, plano);
  const esc = escalacao(pacote, s, prev.cansaco, !!cj, !!copa && ehEstadual(copa.copa.id));
  if (esc === "lesionado" || esc === "fora" || esc === "suspenso") return { tipo: "profissional", escalacao: esc, casa: jogo.casa, fora: jogo.fora, nomeCasa: clubeM(jogo.casa).nome, nomeFora: clubeM(jogo.fora).nome, souCasa: jogo.souCasa, ...(infoCopa ? { copa: infoCopa } : {}), entrada: 0, saida: 0, golsCasa: 0, golsFora: 0, lances: [], decisoes: [], base: { gols: 0, assist: 0, nota: 0 }, fAdv: 0, nomes: {}, ctx: contextoPadrao(), abertura: "", narracao: [] };
  const rng = rngDe(s, cj ? `partida-copa-${cj.id}` : "partida");
  // várzea, colégio e universidade contam como jogos "de formação" (não são profissionais), mas com os times como são
  const amador = !cj && faseAmadora(c), base = !cj && (esc === "base" || amador);
  const meuClube = clubeM(c.clubeId), adv = clubeM(jogo.adversario);
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
  const elMeu = elencoDe({ ...meuClube, elenco: naBase ? timeDaBase(pacote, c.clubeId, j.idade) : elencoAtual(pacote, s) }, false), elAdv = elencoDe(naBase ? { ...adv, elenco: timeDaBase(pacote, adv.id, j.idade) } : adv, false);
  const estadio = cj?.neutro ? `estádio da ${NOME_FASE[cj.fase].toLowerCase()}` : base && !amador ? `CT do ${cp(jogo.casa).apelido}` : cp(jogo.casa).estadio;
  const nomes = nomesDaPartida(rngN, elMeu, elAdv, { nome: j.apelido, meu: cp(c.clubeId).apelido, adv: cp(jogo.adversario).apelido, estadio, posJogador: j.posicao });
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
  { resumo?: ResumoPartida; participacao: Participacao; nota: number; placar?: [number, number] } {
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
  const resumo: ResumoPartida = { nomeCasa: partida.nomeCasa, nomeFora: partida.nomeFora, golsCasa: gc, golsFora: gf, nota, gols, assist, minutos, tipo: partida.tipo, escalacao: partida.escalacao,
    ...(copa ? { competicao: copa.nome, rotulo: copa.rotulo } : {}) };
  if (minutos <= 0) {
    if (partida.escalacao === "banco") { c.moral = clamp(c.moral - 1, 0, 100); eventos.push(copa ? "Ficou no banco o jogo da copa todo." : "Ficou no banco o jogo todo."); }
    return { resumo, participacao: "naoJogou", nota: 0, placar };
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
  if (copa) { const sc = ehEstadual(copa.id) ? (c.statsEstadual ??= { jogos: 0, gols: 0, assist: 0, notas: [] }) : (c.statsCopa ??= { jogos: 0, gols: 0, assist: 0, notas: [] }); sc.jogos++; sc.gols += gols; sc.assist += assist; sc.notas.push(nota); }
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
  c.relTecnico = clamp(c.relTecnico + (nota - 6.5) * (pro ? 1 : 1.5), 0, 100);
  const grande = (mundo(pacote).clube[c.clubeId] ?? clubeDe(l, c.clubeId)).forca >= 75 ? 1.5 : 1, vitrine = copa && !ehEstadual(copa.id) ? 1.5 : 1;
  c.fama = clamp(c.fama + (1 - c.fama / 110) * (pro ? vitrine * grande * (0.5 * gols + (nota >= 8 ? 0.3 : 0)) : 0.1 * gols + (nota >= 8 ? 0.1 : 0)), 0, 100);
  c.cansaco = clamp(c.cansaco + (30 * minutos) / 90, 0, 100);
  const l2 = sortearLesao(rng, c.cansaco, intensidadeAlta, j.idade, 1 - (1 - casa.lesao / 100) * (pro ? 1 : 0.6) * riscoLesaoFamilia(c.familia));
  if (l2) { c.lesao = Math.max(c.lesao, l2.semanas); eventos.push(`Lesão ${l2.tipo === "leve" ? "leve" : l2.tipo === "media" ? "muscular" : "grave"}${copa ? " no jogo da copa" : ""}: ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); noticia(s, "lesao", "Lesão", `${j.apelido} se machucou e fica ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); }
  const res = (partida.souCasa ? gc - gf : gf - gc) > 0 ? "vitória" : gc === gf ? "empate" : "derrota";
  noticia(s, "jogo", `${copa ? `${COPAS[copa.id].curto}: ` : ""}${partida.nomeCasa} ${gc} × ${gf} ${partida.nomeFora}`,
    `${res[0].toUpperCase() + res.slice(1)}${copa ? ` pela ${copa.nome} (${copa.rotulo.toLowerCase()})` : pro ? "" : faseAmadora(c) ? ` ${ROTULO_FASE[c.fase!]}` : " na base"}. ${j.apelido} jogou ${minutos} minutos${gols ? `, fez ${gols} ${gols > 1 ? "gols" : "gol"}` : ""}${assist ? `, deu ${assist} ${assist > 1 ? "assistências" : "assistência"}` : ""} e tirou nota ${nota.toFixed(1)}.`, { k: "placar", casa: partida.casa, fora: partida.fora, gc, gf });
  return { resumo, participacao, nota, placar };
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
  } else if (meu && e.fase !== "grupos" && e.fase !== "liga" && e.fase !== "turno") {
    const ORDEM = ["turno", "grupos", "liga", "playoff", "oitavas", "quartas", "semi", "final", "fim"];
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
  const resumoPartida = rj?.resumo, placarMeuJogo = rj?.placar;
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
  if (sn.noticia) noticia(s, "vida", sn.noticia, `${s.jogador.apelido} confirmou. A vida segue.`);
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
  if (c.semana >= SEMANAS_TEMPORADA) fim = fimDeTemporada(pacote, s, eventos);
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
  noticia(s, "vida", e.titulo, final, { k: "vida" });
  return { titulo: e.titulo, texto: final };
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
  return { semente: s.semente, semanaAbs: semanaAbsJogo(c), idadeJogador: s.jogador.idade, fama: c.fama, cidade: infoClube(pacote, c.clubeId).cidade, salario: c.salario, saldo: s.casa.saldo, vidaNoturna: c.vidaNoturna };
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
export function agirNamoroJogo(pacote: PacoteDados, s: Save, id: string, acao: AcaoNamoro): { ok: boolean; msg: string } {
  const c = s.carreira, r = agirNamoro(namoroDe(c), id, acao, ctxNamoro(pacote, s));
  if (!r.ok) return r;
  if (r.custo) s.casa.saldo -= r.custo;
  if (r.moral) c.moral = clamp(c.moral + r.moral, 0, 100);
  if (r.cansaco) c.cansaco = clamp(c.cansaco + r.cansaco, 0, 100);
  if (r.noticia) noticia(s, "vida", r.noticia, `${s.jogador.apelido} assumiu o relacionamento nas redes.`);
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
  const minhas = Object.values(c.copas ?? {}).filter((e) => e && e.clubes.includes(c.clubeId)) as EstadoCopa[];
  for (const ec of minhas) {
    const estadual = ehEstadual(ec.id), sc = estadual ? c.statsEstadual : c.statsCopa;
    if (!sc?.jogos) continue;
    const campeao = ec.campeao === c.clubeId;
    r[estadual ? "estadual" : "copa"] = { id: ec.id, nome: COPAS[ec.id].nome, fase: campeao ? "Campeão" : NOME_FASE[ec.chegou[c.clubeId]] ?? "", campeao, jogos: sc.jogos, gols: sc.gols, assist: sc.assist };
    if (campeao && sc.jogos >= 3) {
      const nomeT = `Taça ${COPAS[ec.id].prep} ${COPAS[ec.id].curto} ${r.ano}`;
      receberReliquias(s, [{ conquista: `trofeu-copa-${ec.id}`, reliquia: { id: `rel-trofeu-copa-${ec.id}-${r.ano}`, chave: `trofeu-copa-${ec.id}`, tipo: "trofeu", nome: nomeT, legenda: `${cc.nome} · ${COPAS[ec.id].nome} ${r.ano}`, ano: r.ano, cores: ["#E3B341", "#B8892B"], modelo: "taca" } }], ev);
      r.premios.push(nomeT);
      c.fama = clamp(c.fama + (estadual ? 3 : 8), 0, 100); c.torcida = clamp((c.torcida ?? 50) + (estadual ? 6 : 12), 0, 100);
    }
  }
  // tabela final (vale para as vagas das copas da próxima temporada)
  c.tabelaAnterior = { ligaId: infoLiga(c.ligaId).id, ordem: ordenar(c.tabela).map((t) => t.clube) };
  c.notasRodada = undefined;
  c.copas = undefined; c.statsCopa = undefined; c.suspensaoCopa = undefined; c.statsEstadual = undefined; c.suspensaoEstadual = undefined;
  c.historico.push(r);
  if (titulo) { c.fama = clamp(c.fama + 5, 0, 100); c.torcida = clamp((c.torcida ?? 50) + 10, 0, 100); }
  noticia(s, "clube", `Fim da temporada ${r.ano}`, `${r.clube} terminou em ${posicao}º. ${j.apelido}: ${r.jogos} jogos no profissional, ${r.gols} gols, ${r.assist} assistências${r.base ? `, ${r.base} jogos na base` : ""}.`);
  // nova temporada
  { const tf = temporadaFamilia(pacote, familiaDe(pacote, s), rngDe(s, "familia-temporada"), ANO_INICIAL + c.temporada + 1, s.jogador.pais, eventos); c.moral = clamp(c.moral + tf.moral, 0, 100); }
  { const tn = temporadaNamoro(namoroDe(c), eventos); if (tn.noticia) noticia(s, "vida", tn.noticia, `Festa para a família e os amigos do futebol.`); }
  j.idade++; c.temporada++; c.semana = 0; c.anosContrato--; c.recusadas = [];
  sincronizar(pacote, s);
  noticiasDaVirada(pacote, s);
  c.tabela = novaTabela(l); c.stats = statsVazias();
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
