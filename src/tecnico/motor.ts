// Modo técnico — motor: começo de carreira, a semana (treino, jogo, dinheiro, diretoria), a partida e a virada de temporada.
// O mundo é o mesmo do modo jogador (mesma semente = mesmo mundo); o clube do técnico usa o elenco do save.
import { RNG, clamp } from "../rng.js";
import { evoluirSemana, type Grupo, type Intensidade, type Participacao } from "../atributos.js";
import { forcaDoElenco, novaTabela, ordenar, registrar, rodadasDaLiga, type LinhaTabela, type PacoteDados, type JogadorNPC, type Liga } from "../liga.js";
import { simularPlacar, SHARE_GOL, SHARE_ASSIST } from "../partida.js";
import { mundo, sincronizarMundo, versaoMundo, infoClube, idClube, agentesLivres, LIGAS, type TabelasReais } from "../mundo.js";
import { valorBrl } from "../moeda.js";
import { semanaEmpregos, tabelaAgora } from "./empregos.js";
import { contratoInicial, salarioOferecido, type Contrato, type Negociacao } from "./contrato.js";
import { copasT, jogoCopaT, rodarCopasT, fecharCopasT, temCopaPendente, premioDeTitulo, bonusVitoriaCopa, type PalmaresT } from "./copas-t.js";
import { COPAS, NOME_FASE, rotuloJogo, type CopaId, type EstadoCopa } from "../copas.js";
import { receberMulta, trazerVida, semanaDaVida, mesDaVida, semanaNegocios, mesDosNegocios } from "./familia-t.js";
import type { EstadoNegocios } from "../negocios.js";
import type { EstadoFamilia } from "../familia.js";
import type { EstadoNamoro } from "../namoro.js";
import type { EstadoCasa } from "../casa.js";
import { infoLiga } from "../ligas.js";
import { gerarNome } from "../nomes.js";
import { onzeProvavel } from "../relacoes.js";
import { encaixe } from "../funcoes.js";
import { linguaDe, idiomasIniciais, semanaIdiomas, nivelEm, NOME_LINGUA, type Idiomas } from "../idiomas.js";
import { evoluirExtras } from "../detalhes.js";
import { LICENCAS, CURSO_LICENCA, licencaExigida, semanaCurso, type CursoTecnico } from "../licencas.js";
import { valorMercado, CAMBIO } from "../mercado.js";
import { curtoBrl } from "../moeda.js";
import { tipoDoGol, narrarGolMeu, narrarGolAdv, narrarChanceMeu, narrarChanceAdv, narrarCartao, narrarLesao } from "./narracao.js";
import { premiosDoMes, premiosDoAno, sortearEvento, forcaDoContato, type Premio, type EventoT, type Contato, type BioJogador, type FamiliarJogador } from "./vida.js";
import { patrociniosDe, receitaPatro, viradaPatro, type PatrociniosClube } from "./patrocinio.js";
/** Dinheiro nas mensagens: na moeda que a tela está usando. */
const dinheiroT = (v: number) => curtoBrl(v);
import {
  FORMACOES, ladoDaVaga, FUNCOES, NOME_FUNCAO, atletaDoMundo, exDe, idiomasDe, funcaoNaVaga, ovrPos, custoObra, disponivel, forcaDoTime, formaDe, gerarAtributos, melhorEscalacao, ovrDe, ovrNaVaga, precoIngresso,
  salarioJusto, salarioStaff, taticaPadrao, valorAtleta, type Atleta, type Escalacao, type Funcao, type Membro, type PosT, type Tatica,
} from "./modelo.js";

export const ANO_INICIAL_T = 2026;
export const SEMANAS_PRE_T = 2;
export const CHAVE_TECNICO = "mycarrerinha:tecnico";

export interface Noticia { quando: string; texto: string; tipo: "jogo" | "clube" | "elenco" | "diretoria" | "dinheiro" | "vida" }
export interface EventoPartida { min: number; tipo: "gol" | "amarelo" | "vermelho" | "lesao" | "sub" | "lance"; meu: boolean; texto: string; /** o lance contado (jogo ao vivo) */ narra?: string }
export interface NotaPartida { id: string; nome: string; pos: PosT; nota: number; min: number; gols: number; assist: number }
export interface Relatorio {
  rodada: number; casa: string; fora: string; gc: number; gf: number; souCasa: boolean; publico?: number;
  eventos: EventoPartida[]; notas: NotaPartida[]; posse: number; chutes: [number, number]; melhor?: string;
}
export interface LinhaFinancas { rotulo: string; receitas: Record<string, number>; despesas: Record<string, number> }
export interface Obra { tipo: "estadio" | "ct" | "base"; nivel?: number; lugares?: number; fim: number; custo: number }
export interface Clube {
  saldo: number; tv: number; patrocinio: number; capacidade: number; ctNivel: number; baseNivel: number; tetoFolha: number;
  /** humor da torcida, 0 a 100 */ torcida: number;
}
export interface SaveTecnico {
  versao: 1; modo: "tecnico"; semente: string;
  tecnico: { nome: string; nac: string; idade: number; reputacao: number; /** dinheiro do bolso do técnico (o salário dele) */ saldo?: number; /** o nome que ele fez como jogador (0 a 100) */ prestigio?: number;
    /** contrato atual: salário, até quando e a multa que o clube paga se demitir antes */ contrato?: Contrato;
    /** a cara do técnico (a do jogador, mais velha) e a roupa da beira do campo */ aparencia?: Record<string, unknown>; visual?: { roupa: string; cor: string }; exJogador?: { apelido: string; fama: number }; idiomas?: Idiomas; curso?: CursoTecnico };
  /** ex-atletas do clube que se aposentaram com licença de técnico: podem virar comissão */
  exAtletas?: { nome: string; nac: string; idade: number; licenca: number; lid: number; pos: PosT }[];
  clubeId: string; ligaId: string; temporada: number; semana: number;
  ordem: string[]; tabela: LinhaTabela[]; rodadas: Record<number, [string, string, number, number][]>;
  elenco: Atleta[]; esc: Escalacao; tatica: Tatica; entrosamento: Record<string, number>;
  treino: { foco: Grupo; intensidade: Intensidade };
  staff: Partial<Record<Funcao, Membro>>;
  clube: Clube;
  mes: { receitas: Record<string, number>; despesas: Record<string, number> };
  financas: LinhaFinancas[];
  diretoria: { confianca: number; expectativa: { pos: number; texto: string }; obras: Obra[] };
  noticias: Noticia[];
  ultima?: Relatorio;
  historico: { t: number; clubeId?: string; ligaId: string; pos: number; n: number; pts: number; esperado: number; campeao?: boolean }[];
  tabelasReais: TabelasReais;
  demitido?: string;
  /** contratados nesta temporada (agentes livres não voltam a aparecer) */ recusas: string[];
  /** mercado: jogadores à venda, propostas recebidas, negociações em andamento e o histórico */
  aoVivo?: AoVivo;
  /** patrocínios do clube: master, fornecedor, manga e naming rights da arena */ patro?: PatrociniosClube;
  /** prêmios, evento da semana esperando resposta, contatos e bio da época de jogador, família que joga */
  /** temporadas dos atletas do seu elenco em cada clube que você treinou (a história do clube usa no lugar do mundo simulado) */
  temporadasElenco?: { clubeId: string; t: number; nome: string; pos: string; j: number; g: number; a: number; nota?: number }[];
  /** a vida fora do campo, vinda da carreira de jogador: pais e irmãos, companheira, filhos e ex */
  familia?: EstadoFamilia; namoro?: EstadoNamoro; /** a casa (a mesma tela de decorar da carreira de jogador) e se ela já veio da carreira de jogador */ casa?: EstadoCasa; casaDoJogador?: boolean; /** empresas e investimentos (os mesmos da carreira de jogador) */ negocios?: EstadoNegocios;
  /** proposta de emprego de outro clube (com prazo) e o clube que você já acertou para a próxima temporada */
  ofertaEmprego?: { clubeId: string; expira: number; texto: string; /** clube sem técnico: assume na hora */ vaga?: boolean }; novoClube?: string;
  /** mercado de técnicos: vagas abertas no meio da temporada e clubes em que você demonstrou interesse */
  vagasT?: Record<string, { desde: number; saiu: string }>; interesses?: Record<string, number>; negociacaoT?: Negociacao; contratoNovo?: Contrato;
  /** as copas da temporada (estadual, copa nacional, continental, Intercontinental, Mundial), os campeões de cada ano e os seus títulos */
  copas?: Partial<Record<CopaId, EstadoCopa>>; copasT?: number; palmaresT?: PalmaresT; titulosCopa?: { t: number; id: CopaId; nome: string; clubeId: string }[];
  premios?: Premio[]; evento?: EventoT; contatos?: Contato[]; bio?: BioJogador; familiaJog?: FamiliarJogador[]; pausa?: number;
  aVenda?: string[]; propostas?: PropostaRecebida[]; negociacoes?: Record<string, { pedido?: number; tentativas: number; janela: string }>; transferencias?: Transferencia[];
}

export const semanaAbs = (s: SaveTecnico) => s.temporada * 60 + s.semana;
export const nRodadasT = (s: SaveTecnico) => rodadasDaLiga(s.ordem.length).length;
export const semanasDaTemporada = (s: SaveTecnico) => SEMANAS_PRE_T + nRodadasT(s);
export const rotuloSemanaT = (s: SaveTecnico) => s.semana < SEMANAS_PRE_T ? `Pré-temporada ${ANO_INICIAL_T + s.temporada}` : s.semana - SEMANAS_PRE_T >= nRodadasT(s) ? `Fim de ${ANO_INICIAL_T + s.temporada}` : `Rodada ${s.semana - SEMANAS_PRE_T + 1} · ${ANO_INICIAL_T + s.temporada}`;
const rngT = (s: SaveTecnico, ...p: (string | number)[]) => new RNG(`${s.semente}|tec|${s.temporada}|${s.semana}|${p.join("|")}`);
const ligaDe = (pacote: PacoteDados, s: SaveTecnico): Liga => mundo(pacote).liga[s.ligaId];
const fLigaDe = (s: SaveTecnico) => infoLiga(s.ligaId).fLiga;
export const folhaDe = (s: SaveTecnico) => s.elenco.reduce((a, x) => a + x.salario, 0);
export const folhaStaff = (s: SaveTecnico) => Object.values(s.staff).reduce((a, x) => a + (x?.salario ?? 0), 0);
export const nivelStaff = (s: SaveTecnico, f: Funcao) => s.staff[f]?.nivel ?? 0;
const noticia = (s: SaveTecnico, tipo: Noticia["tipo"], texto: string) => { s.noticias.unshift({ quando: rotuloSemanaT(s), texto, tipo }); s.noticias = s.noticias.slice(0, 60); };
const sal = (s: SaveTecnico, fClube: number) => (ovr: number, idade: number) => { const li = infoLiga(s.ligaId); return salarioJusto(ovr, idade, li.fLiga, li.fSalario, fClube); };

// ------------------------------------------------------------------ mundo
let versaoAplicada = -1, saveAplicado: SaveTecnico | undefined;
/** Põe o mundo na semana do save e coloca o elenco do técnico no lugar do clube (os outros clubes não ficam com jogador dele). */
export function prepararMundo(pacote: PacoteDados, s: SaveTecnico) {
  sincronizarMundo(pacote, s.semente, s.temporada, s.semana, s.tabelasReais, 0);
  const w = mundo(pacote), meu = w.clube[s.clubeId];
  if (!meu) return;
  meu.elenco = s.elenco.map((a): JogadorNPC => ({ nome: a.nome, posicao: a.pos, ovr: ovrDe(a), idade: a.idade, nacionalidade: a.nac, numero: a.numero }));
  meu.forca = forcaDoElenco(meu.elenco);
  if (versaoMundo() !== versaoAplicada || saveAplicado !== s) {
    versaoAplicada = versaoMundo(); saveAplicado = s;
    const nomes = new Set(s.elenco.map((a) => a.nome));
    for (const c of Object.values(w.clube)) if (c.id !== s.clubeId && c.elenco.some((j) => nomes.has(j.nome))) { c.elenco = c.elenco.filter((j) => !nomes.has(j.nome)); c.forca = forcaDoElenco(c.elenco); }
  }
}

// ------------------------------------------------------------------ começo de carreira
/** Reputação que um clube exige do técnico (clubes mais fortes querem nome). */
export const reputacaoExigida = (forca: number) => Math.round(clamp((forca - 62) * 3, 0, 95));
/** Ligas em que dá para começar (as divisões de cima e as de acesso dos países com futebol profissional). */
export function ligasParaComecar(pacote: PacoteDados): { id: string; nome: string; pais: string }[] {
  const w = mundo(pacote);
  return LIGAS.filter((l) => !l.amador && l.divisao <= 2 && w.liga[l.id]?.clubes.length >= 8).map((l) => ({ id: l.id, nome: l.nome, pais: l.pais }));
}
export function clubesDaLiga(pacote: PacoteDados, ligaId: string) {
  const w = mundo(pacote);
  return [...(w.liga[ligaId]?.clubes ?? [])].sort((a, b) => b.forca - a.forca).map((c) => ({ id: c.id, nome: w.info[c.id]?.nome ?? c.nome, forca: Math.round(c.forca), exige: reputacaoExigida(c.forca), licenca: licencaExigida(c.forca) }));
}
export interface DadosTecnico { nome: string; nac: string; idade: number; exJogador?: { apelido: string; fama: number }; licenca?: number; idiomas?: Idiomas;
  /** o tamanho do nome do ex-jogador (0 a 100): fama, títulos, prêmios, gigantes em que jogou e idiomas */ prestigio?: number;
  /** troca de clube no meio da carreira: o mesmo mundo, a temporada em que assume e as tabelas reais das temporadas passadas */
  continuar?: { semente: string; temporada: number; tabelas: SaveTecnico["tabelasReais"] };
  /** contrato já negociado (entrevista com o presidente) */ contrato?: Contrato;
  /** continuação da carreira de jogador: o mesmo mundo (semente), a temporada em que parou, a pausa antes de treinar, a bio, os contatos e a família que joga */
  vindoDe?: { semente: string; temporada: number; pausa: number; bio: BioJogador; contatos: Contato[]; familia: FamiliarJogador[];
    /** pais, irmãos, namoro, filhos e o dinheiro guardado da carreira de jogador */ vida?: { familia?: EstadoFamilia; namoro?: EstadoNamoro; saldo?: number; casa?: EstadoCasa; negocios?: EstadoNegocios } } }
/** Licença do técnico (quem começa direto já tem a B). */
export const licencaT = (s: SaveTecnico) => s.tecnico.curso?.licenca ?? 2;
export const idiomasT = (s: SaveTecnico) => (s.tecnico.idiomas ??= idiomasIniciais(s.tecnico.nome, s.tecnico.nac, s.tecnico.idade));
export const reputacaoInicial = (d: DadosTecnico) => Math.round(d.prestigio !== undefined ? clamp(20 + d.prestigio * 0.72, 22, 92) : d.exJogador ? clamp(22 + d.exJogador.fama * 0.55, 22, 75) : 20);
/** Lenda tem passe livre: o clube grande aceita o ídolo com uma ou duas licenças a menos e paga o curso na hora. */
export const toleranciaLicenca = (prestigio = 0) => (prestigio >= 80 ? 2 : prestigio >= 60 ? 1 : 0);

export function novaCarreiraTecnico(pacote: PacoteDados, d: DadosTecnico, clubeId: string, semente = `tec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`): SaveTecnico {
  // vindo da carreira de jogador: o mesmo mundo, no ano seguinte ao fim da carreira (mais a pausa)
  const inicio = d.vindoDe ? d.vindoDe.temporada + 1 + d.vindoDe.pausa : d.continuar ? d.continuar.temporada : 0;
  if (d.vindoDe) semente = d.vindoDe.semente;
  if (d.continuar) semente = d.continuar.semente;
  sincronizarMundo(pacote, semente, inicio, 0, d.continuar?.tabelas ?? {}, 0);
  const w = mundo(pacote), c = w.clube[idClube(clubeId)], info = infoClube(pacote, c.id), ligaId = info.ligaId, l = w.liga[ligaId], li = infoLiga(ligaId);
  const s: SaveTecnico = {
    versao: 1, modo: "tecnico", semente, tecnico: { nome: d.nome, nac: d.nac, idade: d.idade, reputacao: reputacaoInicial(d), ...(d.exJogador ? { exJogador: d.exJogador } : {}), idiomas: d.idiomas ? { ...d.idiomas } : idiomasIniciais(d.nome, d.nac, d.idade), curso: { licenca: Math.max(1, d.licenca ?? 2) }, ...(d.prestigio !== undefined ? { prestigio: d.prestigio } : {}) },
    clubeId: c.id, ligaId, temporada: inicio, semana: 0, ordem: l.clubes.map((x) => x.id), tabela: novaTabela(l), rodadas: {},
    elenco: [], esc: { titulares: [], reservas: [] }, tatica: taticaPadrao(), entrosamento: { "4-3-3": 55 }, treino: { foco: "tecnico", intensidade: "normal" },
    staff: {}, clube: { saldo: 0, tv: 0, patrocinio: 0, capacidade: Math.max(4000, info.capacidade || 12000), ctNivel: 0, baseNivel: 0, tetoFolha: 0, torcida: 60 },
    mes: { receitas: {}, despesas: {} }, financas: [], diretoria: { confianca: 60, expectativa: { pos: 0, texto: "" }, obras: [] },
    noticias: [], historico: [], tabelasReais: {}, recusas: [],
  };
  s.elenco = c.elenco.map((j) => atletaDoMundo(j, semente, c.id, 0, sal(s, c.fClube)));
  numerar(s);
  const folha = folhaDe(s), rng = new RNG(`${semente}|clube`);
  const nivelClube = clamp(Math.round(1 + c.fClube * 1.4 + (li.nivel <= 1 ? 1 : 0)), 1, 5);
  s.clube = { ...s.clube, saldo: Math.round(folha * (3 + 4 * c.fClube)), tv: Math.round(folha * 0.62), patrocinio: Math.round(folha * 0.28 * c.fClube), ctNivel: nivelClube, baseNivel: clamp(nivelClube + rng.int(-1, 1), 1, 5), tetoFolha: Math.round(folha * 1.2) };
  patrociniosDe(pacote, s);
  for (const f of FUNCOES) s.staff[f] = candidatos(s, f, `inicio`, clamp(nivelClube - 1 + rng.int(0, 1), 1, 4))[0];
  s.esc = melhorEscalacao(s.elenco, s.tatica.formacao);
  definirExpectativa(pacote, s);
  if (d.vindoDe) {
    const v = d.vindoDe, anos = v.pausa + 1;
    s.bio = v.bio; s.contatos = v.contatos; s.pausa = v.pausa;
    if (v.vida) trazerVida(s, v.vida.familia, v.vida.namoro, v.vida.saldo, v.vida.casa, v.vida.negocios);
    // a família que joga envelhece e evolui no tempo em que você ficou fora
    s.familiaJog = v.familia.map((f) => { let ovr = f.ovr; for (let k = 0; k < anos; k++) ovr = Math.min(f.pot, ovr + (f.idade + k < 24 ? 4 : f.idade + k < 30 ? 1 : -1)); return { ...f, idade: f.idade + anos, ovr }; }).filter((f) => f.idade <= 38);
    noticia(s, "clube", v.pausa ? `Depois de ${v.pausa === 1 ? "um ano" : `${v.pausa} anos`} longe do campo, entre cursos e viagens para estudar o jogo, ${v.bio.apelido} volta ao futebol como técnico.` : `Nem bem pendurou as chuteiras e ${v.bio.apelido} já está de prancheta na mão.`);
  }
  s.tecnico.contrato = d.contrato ?? contratoInicial(salarioOferecido(pacote, s, s.clubeId), s.temporada);
  noticia(s, "clube", `${d.nome} é o novo técnico do ${info.nome}. A diretoria espera: ${s.diretoria.expectativa.texto.toLowerCase()}.`);
  // ídolo contratado sem a licença que o clube pede: o clube banca o curso e ele estuda já na primeira temporada
  const precisa = licencaExigida(c.forca), cur = s.tecnico.curso!;
  if (precisa > cur.licenca && !cur.estudando) { cur.estudando = cur.licenca + 1; cur.progresso = 0; noticia(s, "clube", `O nome pesou: o ${info.nome} contratou ${d.nome} mesmo sem a ${LICENCAS[precisa]} e paga o curso da ${LICENCAS[cur.estudando]}, que ele começa já nesta temporada.`); }
  prepararMundo(pacote, s);
  return s;
}
/** Números das camisas: quem já tem fica, o resto ganha um livre. */
function numerar(s: SaveTecnico) {
  const usados = new Set<number>();
  for (const a of s.elenco) { if (a.numero > 0 && a.numero < 100 && !usados.has(a.numero)) usados.add(a.numero); else a.numero = 0; }
  for (const a of s.elenco) if (!a.numero) { let n = a.pos === "GOL" ? 12 : 2; while (usados.has(n)) n++; a.numero = n; usados.add(n); }
}
function definirExpectativa(pacote: PacoteDados, s: SaveTecnico) {
  const w = mundo(pacote), n = s.ordem.length, minha = forcaDoElenco(s.elenco.map((a) => ({ posicao: a.pos, ovr: ovrDe(a) })));
  const rank = 1 + s.ordem.filter((id) => id !== s.clubeId && (w.clube[id]?.forca ?? 0) > minha).length, rebaixa = infoLiga(s.ligaId).rebaixados;
  const texto = rank <= 2 ? "Brigar pelo título" : rank <= Math.ceil(n * 0.3) ? "Terminar entre os primeiros" : rank <= n - rebaixa - 3 ? "Campanha tranquila no meio da tabela" : "Escapar do rebaixamento";
  const pos = rank <= 2 ? 2 : rank <= Math.ceil(n * 0.3) ? Math.ceil(n * 0.3) : rank <= n - rebaixa - 3 ? Math.min(n - rebaixa - 1, rank + 2) : n - rebaixa;
  s.diretoria.expectativa = { pos, texto };
}

// ------------------------------------------------------------------ comissão técnica
/** Candidatos de uma função (mudam a cada dois meses); o nível puxa pela reputação do técnico e pela força do clube. */
export function candidatos(s: SaveTecnico, f: Funcao, chave = `${s.temporada}-${Math.floor(s.semana / 8)}`, nivelBase?: number): Membro[] {
  const rng = new RNG(`${s.semente}|staff|${f}|${chave}`), pais = infoLiga(s.ligaId).pais, usados = new Set(Object.values(s.staff).map((m) => m!.nome));
  const centro = nivelBase ?? clamp(1.6 + s.tecnico.reputacao / 30 + s.clube.ctNivel * 0.25, 1, 5);
  const fL = fLigaDe(s);
  // ex-atletas do clube com licença entram na frente (auxiliar, base; ex-goleiro também para treinar goleiros)
  const ex: Membro[] = (s.exAtletas ?? []).filter((x) => (f === "auxiliar" || f === "base" || (f === "goleiros" && x.pos === "GOL")) && !usados.has(x.nome))
    .map((x) => { const nivel = clamp(x.licenca + (x.lid >= 70 ? 1 : 0), 1, 5); return { nome: x.nome, nac: x.nac, idade: x.idade, nivel, salario: Math.round(salarioStaff(nivel, fL) * 0.85 / 100) * 100, ex: true }; });
  return [...ex, ...Array.from({ length: 4 }, (_, i) => {
    const nivel = clamp(Math.round(centro + (i === 0 ? 0 : rng.normal(0, 1))), 1, 5), nac = rng.chance(0.7) ? pais : rng.pick(["BRA", "ARG", "POR", "ESP", "ITA", "ENG", "GER", "FRA", "NED", "URU"]);
    return { nome: gerarNome(rng, nac.length === 3 ? nac : "BRA", usados), nac, idade: rng.int(31, 64), nivel, salario: salarioStaff(nivel, fL) };
  }).sort((a, b) => b.nivel - a.nivel)];
}
export function contratarStaff(s: SaveTecnico, f: Funcao, nome: string): { ok: boolean; msg: string } {
  const m = candidatos(s, f).find((x) => x.nome === nome);
  if (!m) return { ok: false, msg: "Esse profissional já acertou com outro clube." };
  const atual = s.staff[f], multa = atual ? atual.salario * 3 : 0;
  if (s.clube.saldo < multa + m.salario * 3) return { ok: false, msg: "O clube não tem caixa para essa troca agora." };
  if (atual) { s.clube.saldo -= multa; gastar(s, "rescisões", multa); }
  s.staff[f] = m;
  if (m.ex) s.exAtletas = (s.exAtletas ?? []).filter((x) => x.nome !== m.nome);
  noticia(s, "clube", `${m.nome} é o novo ${NOME_FUNCAO[f].toLowerCase()}${atual ? ` no lugar de ${atual.nome}` : ""}.`);
  return { ok: true, msg: `${m.nome} contratado${atual ? `. A rescisão de ${atual.nome} custou 3 salários.` : "."}` };
}
export function demitirStaff(s: SaveTecnico, f: Funcao): { ok: boolean; msg: string } {
  const atual = s.staff[f];
  if (!atual) return { ok: false, msg: "A vaga já está vazia." };
  const multa = atual.salario * 3;
  s.clube.saldo -= multa; gastar(s, "rescisões", multa); delete s.staff[f];
  return { ok: true, msg: `${atual.nome} saiu. Rescisão de 3 salários.` };
}

// ------------------------------------------------------------------ dinheiro
const receber = (s: SaveTecnico, k: string, v: number) => { s.mes.receitas[k] = (s.mes.receitas[k] ?? 0) + v; };
const gastar = (s: SaveTecnico, k: string, v: number) => { s.mes.despesas[k] = (s.mes.despesas[k] ?? 0) + v; };
function fecharMes(pacote: PacoteDados, s: SaveTecnico) {
  const manut = Math.round(s.clube.capacidade * 10 * Math.max(0.4, fLigaDe(s)));
  const patro = receitaPatro(pacote, s), somaPatro = Object.values(patro).reduce((x, y) => x + y, 0);
  const rec = { ...s.mes.receitas, "TV": s.clube.tv, ...patro, "Outros patrocínios": s.clube.patrocinio };
  const des = { ...s.mes.despesas, "Salários do elenco": folhaDe(s), "Comissão técnica": folhaStaff(s), "Manutenção": manut };
  const saldoMes = Object.values(rec).reduce((a, b) => a + b, 0) - Object.values(des).reduce((a, b) => a + b, 0);
  // o que já entrou ou saiu ao longo do mês (bilheteria, rescisões, obras) já mexeu no saldo
  s.clube.saldo += s.clube.tv + s.clube.patrocinio + somaPatro - folhaDe(s) - folhaStaff(s) - manut;
  s.financas.unshift({ rotulo: `${rotuloSemanaT(s)}`, receitas: rec, despesas: des });
  s.financas = s.financas.slice(0, 24);
  s.mes = { receitas: {}, despesas: {} };
  if (s.clube.saldo < 0) { s.diretoria.confianca = clamp(s.diretoria.confianca - 4, 0, 100); noticia(s, "dinheiro", "O caixa fechou o mês no vermelho. A diretoria cobra controle nos gastos."); }
  return saldoMes;
}

// ------------------------------------------------------------------ diretoria
export type Pedido = "estadio" | "ct" | "base" | "verba";
export function custoPedido(s: SaveTecnico, p: Pedido): { custo: number; lugares?: number; nivel?: number } {
  const fL = fLigaDe(s);
  if (p === "estadio") { const lugares = Math.max(3000, Math.round((s.clube.capacidade * 0.15) / 1000) * 1000); return { custo: custoObra("estadio", 0, fL, lugares), lugares }; }
  if (p === "ct") return { custo: custoObra("ct", s.clube.ctNivel + 1, fL), nivel: s.clube.ctNivel + 1 };
  if (p === "base") return { custo: custoObra("base", s.clube.baseNivel + 1, fL), nivel: s.clube.baseNivel + 1 };
  return { custo: 0 };
}
export function pedirDiretoria(s: SaveTecnico, p: Pedido): { ok: boolean; msg: string } {
  const d = s.diretoria, ab = semanaAbs(s), conf = d.confianca, { custo, lugares, nivel } = custoPedido(s, p);
  if (p !== "verba" && d.obras.some((o) => o.tipo === p)) return { ok: false, msg: "Essa obra já está em andamento." };
  if (p === "verba") {
    if (conf < 70) return { ok: false, msg: "A diretoria não vai abrir o cofre agora. Ganhe a confiança dela primeiro (precisa de 70)." };
    if (s.clube.saldo < 4 * (folhaDe(s) + folhaStaff(s))) return { ok: false, msg: "O caixa não aguenta aumentar a folha. Precisa de quatro meses de salários guardados." };
    s.clube.tetoFolha = Math.round(s.clube.tetoFolha * 1.12); d.confianca = clamp(conf - 5, 0, 100);
    noticia(s, "diretoria", "A diretoria aumentou o teto salarial em 12%.");
    return { ok: true, msg: "Aprovado: o teto da folha subiu 12%." };
  }
  if ((p === "ct" || p === "base") && (nivel ?? 6) > 5) return { ok: false, msg: "Já está no nível máximo." };
  const minimo = p === "estadio" ? 55 : p === "ct" ? 50 : 45;
  if (conf < minimo) return { ok: false, msg: `A diretoria não aprovou. Ela só investe nisso com confiança de ${minimo} ou mais (hoje: ${Math.round(conf)}).` };
  if (s.clube.saldo < custo) return { ok: false, msg: "A diretoria gostou da ideia, mas o clube não tem esse dinheiro em caixa." };
  const semanas = p === "estadio" ? 30 : p === "ct" ? 20 : 16;
  s.clube.saldo -= custo; gastar(s, "Obras", custo);
  d.obras.push({ tipo: p, fim: ab + semanas, custo, ...(lugares ? { lugares } : {}), ...(nivel ? { nivel } : {}) });
  const o = p === "estadio" ? `a ampliação do estádio (+${lugares!.toLocaleString("pt-BR")} lugares)` : p === "ct" ? `a reforma do centro de treinamento (nível ${nivel})` : `a melhoria da base (nível ${nivel})`;
  noticia(s, "diretoria", `A diretoria aprovou ${o}. Obra de ${semanas} semanas.`);
  return { ok: true, msg: `Aprovado: ${o}. Fica pronta em ${semanas} semanas.` };
}

// ------------------------------------------------------------------ elenco: conversas, contrato, chegadas
export type Conversa = "elogiar" | "cobrar" | "titular" | "reserva";
export const NOME_CONVERSA: Record<Conversa, string> = { elogiar: "Elogiar", cobrar: "Cobrar mais", titular: "Prometer vaga de titular", reserva: "Explicar a reserva" };
export function conversar(s: SaveTecnico, id: string, tipo: Conversa): { ok: boolean; msg: string } {
  const a = s.elenco.find((x) => x.id === id), ab = semanaAbs(s);
  if (!a) return { ok: false, msg: "Jogador não encontrado." };
  if (a.conversa === ab) return { ok: false, msg: "Você já conversou com ele nesta semana." };
  a.conversa = ab;
  const forma = formaDe(a), aux = nivelStaff(s, "auxiliar"), rng = rngT(s, "conversa", a.id), sorte = rng.next() + aux * 0.04 + (a.relacao - 50) / 200 + (nivelEm(idiomasT(s), linguaDe(a.nac)) >= 60 || nivelEm(idiomasDe(a), linguaDe(s.tecnico.nac)) >= 60 ? 0.06 : -0.06);
  const mudar = (moral: number, rel: number) => { a.moral = clamp(a.moral + moral, 0, 100); a.relacao = clamp(a.relacao + rel, 0, 100); };
  switch (tipo) {
    case "elogiar":
      if (forma >= 6.8 || a.jogos === 0) { mudar(7, 4); return { ok: true, msg: `${a.nome} gostou do elogio. Moral lá em cima.` }; }
      if (sorte > 0.5) { mudar(3, 2); return { ok: true, msg: `${a.nome} agradeceu, mas sabe que não está no melhor momento.` }; }
      mudar(-2, -1); return { ok: true, msg: `${a.nome} achou o elogio falso: ele sabe que está mal.` };
    case "cobrar":
      if (forma < 6.5 && (a.prof >= 12 || sorte > 0.6)) { mudar(4, 1); return { ok: true, msg: `${a.nome} ouviu a cobrança e prometeu reagir.` }; }
      if (a.temp >= 14) { mudar(-10, -8); return { ok: true, msg: `${a.nome} não aceitou a cobrança e saiu batendo a porta.` }; }
      mudar(-4, -3); return { ok: true, msg: `${a.nome} ficou chateado com a cobrança.` };
    case "titular":
      if (a.promessa !== undefined) return { ok: false, msg: "Você já prometeu isso a ele." };
      a.promessa = 3; mudar(10, 5); return { ok: true, msg: `${a.nome} ficou animado. Ele espera ser titular nos próximos jogos (3 de folga).` };
    case "reserva":
      if (a.semJogar >= 2 && (a.prof >= 10 || sorte > 0.55)) { mudar(5, 4); return { ok: true, msg: `${a.nome} entendeu a explicação e vai esperar a chance.` }; }
      if (a.semJogar < 2) { mudar(-1, 0); return { ok: true, msg: `${a.nome} estranhou a conversa: ele está jogando.` }; }
      mudar(-3, -2); return { ok: true, msg: `${a.nome} ouviu, mas não engoliu.` };
  }
}
export function pedidoRenovacao(s: SaveTecnico, a: Atleta, fClube: number): number {
  return Math.round(sal(s, fClube)(ovrDe(a), a.idade) * (a.moral < 50 ? 1.25 : 1.05) * (formaDe(a) >= 7 ? 1.1 : 1) / 100) * 100;
}
export function renovar(pacote: PacoteDados, s: SaveTecnico, id: string, anos: number): { ok: boolean; msg: string } {
  const a = s.elenco.find((x) => x.id === id);
  if (!a) return { ok: false, msg: "Jogador não encontrado." };
  if (a.querSair || a.moral < 35) return { ok: false, msg: `${a.nome} não quer conversar sobre renovação agora.` };
  if (a.idade >= 34 && anos > 1) return { ok: false, msg: `Com ${a.idade} anos, ${a.nome} só aceita um ano.` };
  const novo = pedidoRenovacao(s, a, mundo(pacote).clube[s.clubeId]?.fClube ?? 1);
  if (folhaDe(s) - a.salario + novo > s.clube.tetoFolha) return { ok: false, msg: `A diretoria barrou: o salário pedido (${dinheiroT(novo)}) passa do teto da folha.` };
  a.salario = novo; a.contratoAte = Math.max(a.contratoAte, s.temporada) + anos; a.moral = clamp(a.moral + 5, 0, 100);
  noticia(s, "elenco", `${a.nome} renovou até ${ANO_INICIAL_T + a.contratoAte}.`);
  return { ok: true, msg: `${a.nome} renovou até ${ANO_INICIAL_T + a.contratoAte}.` };
}
export function dispensar(s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const a = s.elenco.find((x) => x.id === id);
  if (!a) return { ok: false, msg: "Jogador não encontrado." };
  if (s.elenco.length <= 18) return { ok: false, msg: "O elenco ficaria curto demais (mínimo de 18)." };
  const meses = Math.max(1, (a.contratoAte - s.temporada + 1) * 12 - Math.floor(s.semana / 4)), multa = Math.round(a.salario * meses * 0.5);
  s.clube.saldo -= multa; gastar(s, "rescisões", multa);
  tirarDoElenco(s, id);
  noticia(s, "elenco", `${a.nome} foi dispensado.`);
  return { ok: true, msg: `${a.nome} foi dispensado. Rescisão: metade do que faltava do contrato.` };
}
/** Guarda a temporada de um atleta no clube (entra na história do clube: recordes e time de todos os tempos). */
export function guardarTemporada(s: SaveTecnico, a: Atleta) {
  if (!a.jogos) return;
  const nota = a.notas.length ? +(a.notas.reduce((x, y) => x + y, 0) / a.notas.length).toFixed(2) : undefined;
  (s.temporadasElenco ??= []).push({ clubeId: s.clubeId, t: s.temporada, nome: a.nome, pos: a.pos, j: a.jogos, g: a.gols, a: a.assist, ...(nota !== undefined ? { nota } : {}) });
}
function tirarDoElenco(s: SaveTecnico, id: string) {
  const sai = s.elenco.find((x) => x.id === id);
  if (sai) guardarTemporada(s, sai);
  s.elenco = s.elenco.filter((x) => x.id !== id);
  s.esc.titulares = s.esc.titulares.map((x) => (x === id ? null : x));
  s.esc.reservas = s.esc.reservas.filter((x) => x !== id);
}

/** Agentes livres: os do mundo e mais alguns sem clube que aparecem a cada mês, perto do nível do time. */
export interface Livre { nome: string; pos: PosT; idade: number; ovr: number; pot: number; nac: string; pedido: number }
export function agentesLivresT(pacote: PacoteDados, s: SaveTecnico): Livre[] {
  const w = mundo(pacote), meu = w.clube[s.clubeId], fC = meu?.fClube ?? 1, rng = new RNG(`${s.semente}|livres|${s.temporada}|${Math.floor(s.semana / 4)}`);
  const olheiro = nivelStaff(s, "olheiro"), forca = meu?.forca ?? 65, nomes = new Set([...s.elenco.map((a) => a.nome), ...s.recusas]);
  const lista: Livre[] = [];
  const pedir = (ovr: number, idade: number) => Math.round(sal(s, fC)(ovr, idade) * 1.15 / 100) * 100;
  for (const x of agentesLivres(pacote)) {
    if (nomes.has(x.nome) || x.ovr < forca - 16) continue;
    const pot = Math.max(x.ovr, Math.round(x.ovr + Math.max(0, 24 - x.idade) * 1.4));
    lista.push({ nome: x.nome, pos: x.posicao as PosT, idade: x.idade, ovr: x.ovr, pot, nac: (x as { nacionalidade?: string }).nacionalidade ?? "BRA", pedido: pedir(x.ovr, x.idade) });
  }
  const pais = infoLiga(s.ligaId).pais, usados = new Set(nomes);
  for (const p of ["GOL", "ZAG", "ZAG", "LAT", "VOL", "MEI", "PON", "ATA", "ATA", "MEI"] as PosT[]) {
    const idade = rng.int(19, 33), ovr = Math.round(clamp(forca - 7 + rng.normal(0, 3) + olheiro * 0.8, 45, 88)), nac = rng.chance(0.65) ? pais : rng.pick(["BRA", "ARG", "URU", "COL", "POR", "ESP", "FRA"]);
    const nome = gerarNome(rng, nac, usados);
    if (nomes.has(nome)) continue;
    lista.push({ nome, pos: p, idade, ovr, pot: Math.max(ovr, Math.round(ovr + Math.max(0, 24 - idade) * rng.range(0.8, 2))), nac, pedido: pedir(ovr, idade) });
  }
  return lista.sort((a, b) => b.ovr - a.ovr).slice(0, 30);
}
export function contratarLivre(pacote: PacoteDados, s: SaveTecnico, nome: string, anos: number): { ok: boolean; msg: string } {
  const x = agentesLivresT(pacote, s).find((l) => l.nome === nome);
  if (!x) return { ok: false, msg: "Esse jogador já acertou com outro clube." };
  if (s.elenco.length >= 36) return { ok: false, msg: "O elenco está cheio (36). Dispense alguém antes." };
  if (folhaDe(s) + x.pedido > s.clube.tetoFolha) return { ok: false, msg: "A diretoria barrou: esse salário passa do teto da folha." };
  const forca = mundo(pacote).clube[s.clubeId]?.forca ?? 65, limite = forca + 3 + s.tecnico.reputacao / 15;
  if (x.ovr > limite) { s.recusas.push(x.nome); return { ok: false, msg: `${x.nome} preferiu esperar uma proposta de um clube maior.` }; }
  const rng = new RNG(`${s.semente}|livre|${x.nome}`), at = gerarAtributos(rng, x.pos, x.ovr);
  s.elenco.push({ id: `${s.clubeId}|${x.nome}`, nome: x.nome, pos: x.pos, idade: x.idade, nac: x.nac, at, pot: x.pot, numero: 0, moral: 70, condicao: 85, lesao: 0, suspenso: 0, amarelos: 0,
    salario: x.pedido, contratoAte: s.temporada + anos - 1, prof: rng.int(5, 20), temp: rng.int(1, 20), relacao: 55, notas: [], jogos: 0, gols: 0, assist: 0, amarelosT: 0, vermelhosT: 0, semJogar: 0, desde: s.temporada });
  numerar(s);
  noticia(s, "elenco", `${x.nome} (${x.pos}, ${x.idade} anos) chega sem custo de transferência.`);
  return { ok: true, msg: `${x.nome} assinou até ${ANO_INICIAL_T + s.temporada + anos - 1}.` };
}

// ------------------------------------------------------------------ escalação
export function trocarNaVaga(s: SaveTecnico, vaga: number, id: string | null) {
  const t = s.esc.titulares;
  while (t.length < FORMACOES[s.tatica.formacao].length) t.push(null);
  const antes = t[vaga] ?? null, onde = id ? t.indexOf(id) : -1;
  if (onde >= 0) t[onde] = antes; // troca de lugar com quem já estava escalado
  s.esc.reservas = s.esc.reservas.filter((x) => x !== id);
  if (antes && onde < 0 && !s.esc.reservas.includes(antes)) s.esc.reservas.unshift(antes);
  t[vaga] = id;
  s.esc.reservas = s.esc.reservas.filter((x) => !t.includes(x)).slice(0, 9);
}
/** Onde está cada um: vaga do campo ("v:3"), um jogador ("j:id"). Troca os dois de lugar (campo, banco ou fora do jogo).
 *  Com o jogo rolando, só entra em campo quem está no banco, não volta quem saiu, e o limite de trocas vale. */
/** Trazer o filho ou o irmão para o seu elenco: de graça se ele não tem clube ou está na base; quem é profissional sai por 80% do valor. */
export function trazerFamiliar(pacote: PacoteDados, s: SaveTecnico, nome: string): { ok: boolean; msg: string } {
  const f = (s.familiaJog ?? []).find((x) => x.nome === nome);
  if (!f || f.noClube) return { ok: false, msg: "Ele já está no seu elenco." };
  if (s.elenco.length >= 36) return { ok: false, msg: "O elenco está cheio (36)." };
  const li = infoLiga(s.ligaId), meu = mundo(pacote).clube[s.clubeId];
  const a = atletaDoMundo({ nome: f.nome, posicao: f.pos, ovr: f.ovr, idade: f.idade, nacionalidade: s.tecnico.nac, numero: 0, pot: f.pot } as unknown as JogadorNPC, s.semente, s.clubeId, s.temporada, (o, i) => salarioJusto(o, i, li.fLiga, li.fSalario, meu?.fClube ?? 1));
  const custo = f.fase === "pro" && f.clubeId ? Math.round(valorMercado(f.ovr, f.idade, 2, li.fLiga) * CAMBIO * 0.8 / 1000) * 1000 : 0;
  if (custo > s.clube.saldo) return { ok: false, msg: `O clube dele pede ${curtoBrl(custo)} e o caixa não tem.` };
  if (custo) { s.clube.saldo -= custo; gastar(s, "Contratações", custo); }
  a.moral = 85; a.relacao = 90; a.contratoAte = s.temporada + 2;
  s.elenco.push(a); f.noClube = true;
  noticia(s, "elenco", `${f.nome} chega ao clube para jogar sob o comando ${f.parentesco.startsWith("filh") ? "do pai" : "do irmão"}${custo ? ` (${curtoBrl(custo)})` : ""}.`);
  return { ok: true, msg: `${f.nome} agora joga no seu time${custo ? ` (custou ${curtoBrl(custo)})` : ""}.` };
}
export function moverEscalacao(s: SaveTecnico, x: string, y: string): { ok: boolean; msg?: string } {
  const t = s.esc.titulares, R = s.esc.reservas, av = s.aoVivo;
  while (t.length < FORMACOES[s.tatica.formacao].length) t.push(null);
  type Lugar = { onde: "campo"; i: number; id: string | null } | { onde: "banco"; i: number; id: string } | { onde: "fora"; id: string };
  const achar = (k: string): Lugar | undefined => {
    if (k.startsWith("v:")) { const i = +k.slice(2); return { onde: "campo", i, id: t[i] ?? null }; }
    const id = k.slice(2), i = t.indexOf(id), b = R.indexOf(id);
    return i >= 0 ? { onde: "campo", i, id } : b >= 0 ? { onde: "banco", i: b, id } : s.elenco.some((a) => a.id === id) ? { onde: "fora", id } : undefined;
  };
  const A = achar(x), B = achar(y);
  if (!A || !B || (A.id && A.id === B.id) || (A.onde === "campo" && B.onde === "campo" && A.i === B.i)) return { ok: false };
  const entra = (l: Lugar, outro: Lugar) => (l.onde !== "campo" && outro.onde === "campo" ? l.id : null);
  for (const [l, o] of [[A, B], [B, A]] as const) {
    const id = entra(l, o); if (!id) continue;
    const a = s.elenco.find((z) => z.id === id)!;
    if (!disponivel(a)) return { ok: false, msg: `${a.nome} não pode jogar (${a.lesao > 0 ? "lesionado" : "suspenso"}).` };
    if (av) {
      if (l.onde === "fora") return { ok: false, msg: "Com o jogo rolando, só entra quem está no banco." };
      if (av.fora.includes(id) || (av.stats[id] && !(av.emCampo ?? []).includes(id))) return { ok: false, msg: `${a.nome} já saiu do jogo e não pode voltar.` };
      if (!(av.emCampo ?? []).includes(id) && trocasNoIntervalo(s) >= MAX_TROCAS) return { ok: false, msg: `Já foram as ${MAX_TROCAS} trocas.` };
    }
  }
  if (av && (A.onde === "fora" || B.onde === "fora") && (A.onde === "banco" || B.onde === "banco")) return { ok: false, msg: "O banco não muda com o jogo rolando." };
  const por = (l: Lugar, id: string | null) => {
    if (l.onde === "campo") t[l.i] = id;
    else if (l.onde === "banco") { if (id) R[l.i] = id; else R.splice(l.i, 1); }
  };
  por(A, B.id); por(B, A.id);
  s.esc.reservas = R.filter((z, i) => z && !t.includes(z) && R.indexOf(z) === i).slice(0, 9);
  return { ok: true };
}
/** Põe no banco (até 9) ou tira do banco quem não está jogando. */
export function alternarBanco(s: SaveTecnico, id: string): { ok: boolean; msg?: string } {
  if (s.aoVivo) return { ok: false, msg: "O banco não muda com o jogo rolando." };
  const R = s.esc.reservas;
  if (R.includes(id)) { s.esc.reservas = R.filter((x) => x !== id); return { ok: true }; }
  const a = s.elenco.find((x) => x.id === id);
  if (!a || s.esc.titulares.includes(id)) return { ok: false };
  if (!disponivel(a)) return { ok: false, msg: `${a.nome} não pode ser relacionado.` };
  if (R.length >= 9) return { ok: false, msg: "O banco já tem 9. Tire alguém primeiro." };
  R.push(id); return { ok: true };
}
export function mudarFormacao(s: SaveTecnico, f: string) {
  if (!FORMACOES[f]) return;
  s.tatica.formacao = f;
  s.entrosamento[f] ??= 40;
  s.esc = melhorEscalacao(s.elenco, f);
}
/** Antes do jogo: quem não pode jogar sai e entra o melhor disponível para a vaga. Devolve o que mudou. */
function conferirEscalacao(s: SaveTecnico): string[] {
  const vagas = FORMACOES[s.tatica.formacao], por = new Map(s.elenco.map((a) => [a.id, a])), avisos: string[] = [];
  while (s.esc.titulares.length < vagas.length) s.esc.titulares.push(null);
  s.esc.titulares = s.esc.titulares.slice(0, vagas.length);
  const usados = new Set<string>();
  vagas.forEach((v, i) => {
    const id = s.esc.titulares[i], a = id ? por.get(id) : undefined;
    if (a && disponivel(a) && !usados.has(a.id)) { usados.add(a.id); return; }
    const sub = s.elenco.filter((x) => disponivel(x) && !usados.has(x.id) && !s.esc.titulares.some((y, k) => k > i && y === x.id)).sort((x, y) => ovrNaVaga(y, v.pos) - ovrNaVaga(x, v.pos))[0];
    if (a && sub) avisos.push(`${sub.nome} entrou no lugar de ${a.nome} (${a.lesao > 0 ? "lesionado" : "suspenso"}).`);
    s.esc.titulares[i] = sub?.id ?? null; if (sub) usados.add(sub.id);
  });
  s.esc.reservas = s.esc.reservas.filter((id) => { const a = por.get(id); return a && disponivel(a) && !usados.has(id); });
  for (const a of s.elenco.filter((x) => disponivel(x) && !usados.has(x.id) && !s.esc.reservas.includes(x.id)).sort((x, y) => ovrDe(y) - ovrDe(x))) if (s.esc.reservas.length < 9) s.esc.reservas.push(a.id);
  return avisos;
}

// ------------------------------------------------------------------ partida
/** Partida em andamento (parou no intervalo): placar, lances e o que cada um fez no primeiro tempo. */
export interface AoVivo {
  rodada: number; adv: string; souCasa: boolean; gMe: number; gAdv: number; eventos: EventoPartida[];
  stats: Record<string, { gols: number; assist: number; amarelo: number; vermelho: boolean; min: number; pos: PosT }>;
  /** expulsos e machucados não voltam; quem estava em campo no fim do 1º tempo (para contar as trocas) */
  fora: string[]; lesoes: { id: string; semanas: number; tipo: string }[]; emCampo1: string[]; trocas: number;
  /** minuto já jogado (a partida anda de 5 em 5) e quem está em campo agora (para contar as trocas) */ minuto?: number; emCampo?: string[];
  /** o técnico mexeu durante o jogo: o assistente não faz troca sozinho */ autoTrocas?: boolean;
  /** cansaço durante o jogo (a condição só é gravada no fim) */ cond: Record<string, number>;
  lambdas: [number, number][];
}
export const MAX_TROCAS = 5;
const DRENO = (tat: Tatica) => 24 + 5 * tat.pressao + 3 * tat.ritmo;
/** Joga um trecho da partida (de `ini` a `fim`, em minutos) com o time e a tática que estão valendo agora. */
function jogarTrecho(pacote: PacoteDados, s: SaveTecnico, av: AoVivo, ini: number, fim: number, rng: RNG, rn: RNG = rng) {
  const w = mundo(pacote), cAdv = w.clube[av.adv], fAdv = cAdv?.forca ?? 65, por = new Map(s.elenco.map((a) => [a.id, a]));
  const vagas = FORMACOES[s.tatica.formacao], tat = s.tatica, ent = s.entrosamento[tat.formacao] ?? 40, dur = fim - ini;
  const lingua = linguaDe(infoLiga(s.ligaId).pais), prep = nivelStaff(s, "preparador");
  // em campo: os escalados nas vagas, menos expulsos e machucados (a vaga fica vazia: um a menos)
  type EmCampo = { a: Atleta; pos: PosT; ent: number; sai: number };
  const campo: EmCampo[] = vagas.map((v, i) => ({ a: por.get(s.esc.titulares[i] ?? "")!, pos: v.pos, ent: ini, sai: fim })).filter((x) => x.a && !av.fora.includes(x.a.id));
  // trocas automáticas pelo cansaço a partir dos 60 minutos, até o limite (se o técnico não mexeu)
  if (ini === 60 && av.autoTrocas !== false) {
    const banco = s.esc.reservas.map((id) => por.get(id)!).filter((a) => a && disponivel(a) && !av.fora.includes(a.id) && !av.stats[a.id]);
    for (const x of [...campo].sort((p, q) => (av.cond[p.a.id] ?? p.a.condicao) - (av.cond[q.a.id] ?? q.a.condicao))) {
      const c = (av.cond[x.a.id] ?? x.a.condicao) - DRENO(tat) * 0.3;
      if (av.trocas >= MAX_TROCAS || c >= 66 || x.pos === "GOL") continue;
      const sub = banco.filter((b) => !campo.some((y) => y.a.id === b.id)).sort((p, q) => ovrNaVaga(q, x.pos) - ovrNaVaga(p, x.pos))[0];
      if (!sub || ovrNaVaga(sub, x.pos) < ovrNaVaga(x.a, x.pos) - 8) continue;
      const min = rng.int(ini + 1, fim - 1), iv = s.esc.titulares.indexOf(x.a.id);
      x.sai = min; campo.push({ a: sub, pos: x.pos, ent: min, sai: fim }); av.trocas++;
      if (iv >= 0) s.esc.titulares[iv] = sub.id; s.esc.reservas = s.esc.reservas.filter((r) => r !== sub.id);
      av.eventos.push({ min, tipo: "sub", meu: true, texto: `Sai ${x.a.nome}, entra ${sub.nome}` });
    }
  }
  // força do momento: cansaço do jogo e quem saiu (vaga vazia)
  const elencoAgora = s.elenco.map((a) => (av.cond[a.id] !== undefined ? { ...a, condicao: av.cond[a.id] } : a));
  const escAgora: Escalacao = { ...s.esc, titulares: s.esc.titulares.map((id) => (id && !av.fora.includes(id) ? id : null)) };
  const f = forcaDoTime(elencoAgora, escAgora, tat, ent, lingua);
  const atk = 0.65 * f.ataque + 0.35 * f.meio, def = 0.7 * f.defesa + 0.3 * f.meio, m = tat.mentalidade - 2, aberto = 1 + 0.03 * (tat.ritmo - 1);
  // bola parada: o melhor cobrador de falta e de pênalti em campo
  const melhor = (k: "FAL" | "PEN") => [...campo].sort((p, q) => exDe(q.a)[k] - exDe(p.a)[k])[0];
  const bFal = melhor("FAL"), bPen = melhor("PEN");
  const bola = 1 + ((bFal ? exDe(bFal.a).FAL : 60) - 60) / 900 + ((bPen ? exDe(bPen.a).PEN : 60) - 60) / 1400;
  const lMe = ((av.souCasa ? 1.3 : 1.02) * Math.exp((atk - fAdv) / 15) + (av.souCasa ? 0.2 : 0)) * (1 + 0.04 * m) * aberto * bola;
  const lAdv = ((av.souCasa ? 1.02 : 1.3) * Math.exp((fAdv - def) / 15) + (av.souCasa ? 0 : 0.2)) * (1 + 0.035 * m) * aberto;
  av.lambdas.push([lMe, lAdv]);
  const noCampo = (min: number) => campo.filter((x) => x.ent <= min && x.sai > min && !av.fora.includes(x.a.id));
  const peso = <T>(lista: T[], fw: (x: T) => number) => { const t = lista.reduce((a, x) => a + fw(x), 0); let r = rng.next() * t; for (const x of lista) { r -= fw(x); if (r <= 0) return x; } return lista[lista.length - 1]; };
  const st = (x: EmCampo) => (av.stats[x.a.id] ??= { gols: 0, assist: 0, amarelo: 0, vermelho: false, min: 0, pos: x.pos });
  // nomes para a narração: o goleiro e um zagueiro de cada lado
  const onzeAdv = cAdv ? onzeProvavel(cAdv.elenco) : [];
  const golAdv = onzeAdv.find((j) => j.posicao === "GOL")?.nome ?? "goleiro", zagsAdv = onzeAdv.filter((j) => j.posicao === "ZAG").map((j) => j.nome);
  const meuGol = campo.find((x) => x.pos === "GOL")?.a.nome ?? "goleiro", meusZag = campo.filter((x) => x.pos === "ZAG").map((x) => x.a.nome);
  const zag = () => (zagsAdv.length ? rn.pick(zagsAdv) : "zagueiro"), meuZag = () => (meusZag.length ? rn.pick(meusZag) : "zagueiro");
  // cartões (agressividade e marcação alta pesam); segundo amarelo é vermelho
  let saiuAntes = 99;
  for (const x of campo) {
    const dur = (x.sai - x.ent) / 90, e = st(x);
    if (rng.chance(0.075 * (0.45 + exDe(x.a).AGR / 90) * (1 + 0.25 * (tat.pressao - 1)) * dur)) {
      const min = rng.int(x.ent + 1, Math.max(x.ent + 1, x.sai - 1));
      e.amarelo++;
      if (e.amarelo >= 2) { e.vermelho = true; x.sai = min; av.fora.push(x.a.id); saiuAntes = Math.min(saiuAntes, min); av.eventos.push({ min, tipo: "vermelho", meu: true, texto: `Segundo amarelo: ${x.a.nome} expulso`, narra: narrarCartao(rn, x.a.nome, "segundo") }); }
      else av.eventos.push({ min, tipo: "amarelo", meu: true, texto: `Amarelo para ${x.a.nome}`, narra: narrarCartao(rn, x.a.nome, "amarelo") });
    }
    if (!e.vermelho && rng.chance(0.0025 * (0.5 + exDe(x.a).AGR / 60) * ((x.sai - x.ent) / 45))) { const min = rng.int(x.ent + 1, Math.max(x.ent + 1, x.sai - 1)); e.vermelho = true; x.sai = min; av.fora.push(x.a.id); saiuAntes = Math.min(saiuAntes, min); av.eventos.push({ min, tipo: "vermelho", meu: true, texto: `Expulso: ${x.a.nome}`, narra: narrarCartao(rn, x.a.nome, "direto") }); }
  }
  const umAMenos = saiuAntes < 99 ? (fim - saiuAntes) / dur : 0;
  const gMe = rng.poisson(lMe * (dur / 90) * (1 - 0.3 * umAMenos)), gAdv = rng.poisson(lAdv * (dur / 90) * (1 + 0.35 * umAMenos));
  // gols: a função muda quem faz e quem passa; parte sai de falta e de pênalti
  for (let g = 0; g < gMe; g++) {
    const min = rng.int(ini + 1, fim), ali = noCampo(min);
    if (!ali.length) continue;
    const r = rng.next(), ehFalta = r < 0.1 && bFal && ali.includes(bFal), ehPen = !ehFalta && r < 0.17 && bPen && ali.includes(bPen);
    const autor = ehFalta ? bFal! : ehPen ? bPen! : peso(ali, (x) => (x.pos === "GOL" ? 0.001 : SHARE_GOL[x.pos as keyof typeof SHARE_GOL] * Math.pow(x.a.at.FIN / 70, 1.5) * (funcaoNaVaga(s.esc, x.a, x.pos)?.gol ?? 1)));
    st(autor).gols++;
    let txt = ehFalta ? `Gol de falta de ${autor.a.nome}` : ehPen ? `Gol de pênalti de ${autor.a.nome}` : `Gol de ${autor.a.nome}`, passe: string | undefined;
    if (!ehFalta && !ehPen && rng.chance(0.74)) {
      const outros = ali.filter((x) => x !== autor);
      if (outros.length) { const p = peso(outros, (x) => (x.pos === "GOL" ? 0.01 : SHARE_ASSIST[x.pos as keyof typeof SHARE_ASSIST] * Math.pow(Math.max(x.a.at.PAS, x.a.at.CRU) / 70, 1.5) * (funcaoNaVaga(s.esc, x.a, x.pos)?.assist ?? 1))); st(p).assist++; txt += ` (passe de ${p.a.nome})`; passe = p.a.nome; }
    }
    const tipo = ehFalta ? "falta" : ehPen ? "penalti" : tipoDoGol(rn, !!passe, autor.a.at.CAB, !!tat.contraAtaque);
    av.eventos.push({ min, tipo: "gol", meu: true, texto: txt, narra: narrarGolMeu(rn, tipo, { autor: autor.a.nome, passe, gol: golAdv, zag: zag() }) });
  }
  for (let g = 0; g < gAdv; g++) {
    const min = rng.int(ini + 1, fim);
    const autor = onzeAdv.length ? peso(onzeAdv, (j) => (j.posicao === "GOL" ? 0.001 : SHARE_GOL[j.posicao as keyof typeof SHARE_GOL] * Math.pow(j.ovr / 70, 1.5))) : undefined;
    av.eventos.push({ min, tipo: "gol", meu: false, texto: `Gol ${autor ? `de ${autor.nome}` : "do adversário"}`, narra: narrarGolAdv(rn, { autor: autor?.nome ?? "o atacante deles", meuGol, meuZag: meuZag() }) });
  }
  av.gMe += gMe; av.gAdv += gAdv;
  // chances que não viraram gol, dos dois lados (só narração: não mexem no placar)
  const atacantes = (min: number) => noCampo(min).filter((x) => x.pos !== "GOL");
  for (let k = rn.poisson(lMe * (dur / 90) * 1.7); k > 0; k--) {
    const min = rn.int(ini + 1, fim), ali = atacantes(min);
    if (!ali.length) continue;
    const quem = peso(ali, (x) => SHARE_GOL[x.pos as keyof typeof SHARE_GOL] * Math.pow(x.a.at.FIN / 70, 1.2));
    av.eventos.push({ min, tipo: "lance", meu: true, texto: `Chance de ${quem.a.nome}`, narra: narrarChanceMeu(rn, { quem: quem.a.nome, gol: golAdv }) });
  }
  for (let k = rn.poisson(lAdv * (dur / 90) * 1.7); k > 0; k--) {
    const min = rn.int(ini + 1, fim), quem = onzeAdv.length ? peso(onzeAdv, (j) => (j.posicao === "GOL" ? 0.001 : SHARE_GOL[j.posicao as keyof typeof SHARE_GOL])) : undefined;
    av.eventos.push({ min, tipo: "lance", meu: false, texto: `Chance deles`, narra: narrarChanceAdv(rn, { autor: quem?.nome ?? "o atacante deles", meuGol, meuZag: meuZag() }) });
  }
  // lesões no tempo
  const med = nivelStaff(s, "medico");
  for (const x of campo) {
    if (av.fora.includes(x.a.id) && !st(x).vermelho) continue;
    const c = av.cond[x.a.id] ?? x.a.condicao;
    if (!rng.chance(0.008 * (1 + (100 - c) / 70) * (1 - 0.06 * prep) * (tat.ritmo === 2 ? 1.2 : 1) * (x.a.idade >= 31 ? 1.2 : 1) * ((x.sai - x.ent) / 45))) continue;
    const r = rng.next(), base = r < 0.65 ? rng.int(1, 2) : r < 0.93 ? rng.int(3, 6) : rng.int(10, 24), semanas = Math.max(1, Math.round(base * (1 - 0.08 * med)));
    const tipo = semanas <= 2 ? "Lesão muscular leve" : semanas <= 6 ? "Estiramento" : rng.pick(["Lesão no joelho", "Fratura no pé", "Ruptura no tornozelo"]);
    const min = rng.int(Math.max(x.ent + 1, ini + 1), Math.max(x.ent + 1, x.sai - 1));
    av.lesoes.push({ id: x.a.id, semanas, tipo }); av.fora.push(x.a.id); x.sai = Math.min(x.sai, min);
    av.eventos.push({ min, tipo: "lesao", meu: true, texto: `${x.a.nome} se machucou (${tipo.toLowerCase()})`, narra: `${narrarLesao(rn, x.a.nome)} Diagnóstico: ${tipo.toLowerCase()}.` });
  }
  // minutos e cansaço do tempo
  for (const x of campo) {
    const e = st(x), dur = Math.max(0, x.sai - x.ent);
    e.min += dur;
    av.cond[x.a.id] = clamp((av.cond[x.a.id] ?? x.a.condicao) - (dur / 90) * DRENO(tat) * (1 - 0.04 * prep), 15, 100);
  }
  av.eventos.sort((a, b) => a.min - b.min);
  av.minuto = fim;
  av.emCampo = campo.filter((x) => x.sai >= fim && !av.fora.includes(x.a.id)).map((x) => x.a.id);
  if (fim === 45) av.emCampo1 = [...av.emCampo];
}
const novoAoVivo = (rodada: number, adv: string, souCasa: boolean): AoVivo => ({ rodada, adv, souCasa, gMe: 0, gAdv: 0, eventos: [], stats: {}, fora: [], lesoes: [], emCampo1: [], trocas: 0, cond: {}, lambdas: [], minuto: 0 });
/** Começa a partida ao vivo (minuto 0): ela anda de 5 em 5 minutos com `jogarAte`, e o técnico pode parar para mexer. */
export function iniciarPartida(pacote: PacoteDados, s: SaveTecnico): { avisos: string[] } | undefined {
  const pj = proximoJogo(s);
  if (!pj || s.aoVivo || s.demitido) return undefined;
  prepararMundo(pacote, s);
  const avisos = conferirEscalacao(s);
  s.aoVivo = novoAoVivo(pj.rodada, pj.adv, pj.souCasa);
  s.aoVivo.emCampo = s.esc.titulares.filter((x): x is string => !!x);
  return { avisos };
}
/** Trocas já feitas (as do jogo e as que estão na escalação esperando o próximo trecho). */
export const trocasNoIntervalo = (s: SaveTecnico) => (s.aoVivo ? s.aoVivo.trocas + pendentes(s, s.aoVivo).entraram.length : 0);
const pendentes = (s: SaveTecnico, av: AoVivo) => {
  const agora = av.emCampo ?? [];
  if (!agora.length) return { entraram: [] as string[], sairam: [] as string[] };
  return { entraram: s.esc.titulares.filter((id): id is string => !!id && !agora.includes(id) && !av.fora.includes(id)), sairam: agora.filter((id) => !s.esc.titulares.includes(id) && !av.fora.includes(id)) };
};
/** Antes de cada trecho: as trocas do técnico entram no lance a lance; machucado em campo sai sozinho se ainda houver troca. */
function aplicarTrocas(s: SaveTecnico, av: AoVivo, min: number) {
  const noLugarDe: Record<string, string> = {};
  for (const [i, id] of s.esc.titulares.entries()) {
    if (!id || !av.lesoes.some((l) => l.id === id) || av.trocas + pendentes(s, av).entraram.length >= MAX_TROCAS) continue;
    const v = FORMACOES[s.tatica.formacao][i], usados = new Set(s.esc.titulares);
    const sub = s.esc.reservas.map((x) => s.elenco.find((a) => a.id === x)!).filter((a) => a && disponivel(a) && !av.fora.includes(a.id) && !av.stats[a.id] && !usados.has(a.id)).sort((p, q) => ovrNaVaga(q, v.pos) - ovrNaVaga(p, v.pos))[0];
    if (sub) { noLugarDe[sub.id] = id; s.esc.titulares[i] = sub.id; }
  }
  const { entraram, sairam } = pendentes(s, av);
  if (!entraram.length) return;
  entraram.forEach((id, k) => {
    const machucado = noLugarDe[id], a = s.elenco.find((x) => x.id === id), b = s.elenco.find((x) => x.id === (machucado ?? sairam.filter((z) => !Object.values(noLugarDe).includes(z))[k]));
    if (a) av.eventos.push({ min: Math.max(1, min), tipo: "sub", meu: true, texto: b ? `Sai ${b.nome}${machucado ? " (machucado)" : ""}, entra ${a.nome}` : `Entra ${a.nome}` });
  });
  av.trocas += entraram.length;
  if (Object.keys(noLugarDe).length < entraram.length) av.autoTrocas = false;
  av.emCampo = s.esc.titulares.filter((x): x is string => !!x && !av.fora.includes(x));
}
/** Joga de 5 em 5 minutos até `ate` (no máximo 90). Devolve os lances novos. */
export function jogarAte(pacote: PacoteDados, s: SaveTecnico, ate: number): EventoPartida[] {
  const av = s.aoVivo;
  if (!av) return [];
  const antes = av.eventos.length;
  while ((av.minuto ?? 0) < Math.min(90, ate)) {
    const ini = av.minuto ?? 0, fim = Math.min(90, ini + 5);
    aplicarTrocas(s, av, ini + 1);
    jogarTrecho(pacote, s, av, ini, fim, rngT(s, "partida", ini), rngT(s, "narra", ini));
  }
  return av.eventos.slice(antes);
}
/** O apito final: joga o que falta e fecha notas, cartões, suspensões, lesões, cansaço e moral. */
function terminarPartida(pacote: PacoteDados, s: SaveTecnico, adv: string, souCasa: boolean, rodada: number): Relatorio {
  if (!(s.aoVivo && s.aoVivo.rodada === rodada && s.aoVivo.adv === adv)) { s.aoVivo = novoAoVivo(rodada, adv, souCasa); s.aoVivo.emCampo = s.esc.titulares.filter((x): x is string => !!x); }
  jogarAte(pacote, s, 90);
  const av = s.aoVivo!;
  // notas e o que fica no elenco
  const w = mundo(pacote), fAdv = w.clube[adv]?.forca ?? 65, gm = av.gMe, gd = av.gAdv, res = gm > gd ? 0.4 : gm < gd ? -0.4 : 0;
  const rng = rngT(s, "notas"), notas: NotaPartida[] = [];
  for (const [id, e] of Object.entries(av.stats)) {
    const a = s.elenco.find((x) => x.id === id);
    if (!a || e.min <= 0) continue;
    const fn = funcaoNaVaga(s.esc, a, e.pos), enc = fn ? encaixe(a.at, exDe(a), fn) : ovrPos(a.at, e.pos);
    const ef = (ovrNaVaga(a, e.pos) + clamp((enc - ovrPos(a.at, e.pos)) * 0.25, -5, 5)) * (0.85 + 0.15 * a.condicao / 100);
    let n = 6.0 + 0.035 * (ef - fAdv) + 1.0 * e.gols + 0.6 * e.assist + res + rng.normal(0, 0.5) + (exDe(a).CON - 60) / 200;
    if ((e.pos === "GOL" || e.pos === "ZAG" || e.pos === "LAT") && gd === 0) n += e.pos === "GOL" ? 0.7 : 0.4;
    if (e.pos === "GOL" && gd >= 2) n -= 0.3 * (gd - 1);
    if (e.vermelho) n -= 1.2;
    if (e.min < 30) n = 6 + (n - 6) * 0.5;
    const nota = Math.round(clamp(n, 3, 10) * 10) / 10;
    notas.push({ id, nome: a.nome, pos: e.pos, nota, min: e.min, gols: e.gols, assist: e.assist });
    a.jogos++; a.gols += e.gols; a.assist += e.assist; a.notas = [...a.notas, nota].slice(-10); a.semJogar = 0;
    const am = e.vermelho ? Math.max(0, e.amarelo - 1) : e.amarelo;
    if (am) { a.amarelos += am; a.amarelosT += am; if (a.amarelos >= 3) { a.amarelos = 0; a.suspenso = 1; } }
    if (e.vermelho) { a.vermelhosT++; a.suspenso = rng.int(1, 2); }
    a.condicao = av.cond[id] ?? a.condicao;
    a.moral = clamp(a.moral + (gm > gd ? 4 : gm === gd ? 0.5 : -2.5) + (nota - 6.5) * 1.5, 0, 100);
  }
  for (const l of av.lesoes) { const a = s.elenco.find((x) => x.id === l.id); if (a) { a.lesao = l.semanas; a.lesaoTipo = l.tipo; } }
  const lm = av.lambdas.reduce((x, y) => x + y[0], 0) / Math.max(1, av.lambdas.length), la = av.lambdas.reduce((x, y) => x + y[1], 0) / Math.max(1, av.lambdas.length);
  const f = forcaDoTime(s.elenco, s.esc, s.tatica, s.entrosamento[s.tatica.formacao] ?? 40);
  const posse = Math.round(clamp(50 + (f.meio - fAdv) * 1.1 + (s.tatica.mentalidade - 2) * 2 + (s.tatica.pressao - 1) * 2, 28, 72));
  const chutes: [number, number] = [gm + rng.poisson(2.5 + lm * 2.8), gd + rng.poisson(2.5 + la * 2.8)];
  const melhor = [...notas].sort((a, b) => b.nota - a.nota)[0];
  s.aoVivo = undefined;
  return { rodada, casa: souCasa ? s.clubeId : adv, fora: souCasa ? adv : s.clubeId, gc: souCasa ? gm : gd, gf: souCasa ? gd : gm, souCasa, eventos: av.eventos.sort((a, b) => a.min - b.min), notas, posse, chutes, melhor: melhor?.nome };
}
/** Mudar a formação no intervalo: os mesmos jogadores, redistribuídos nas vagas novas (sem trocar ninguém). */
export function reorganizarNoIntervalo(s: SaveTecnico, f: string) {
  if (!FORMACOES[f]) return;
  const ids = s.esc.titulares.filter((x): x is string => !!x), por = new Map(s.elenco.map((a) => [a.id, a]));
  s.tatica.formacao = f; s.entrosamento[f] ??= 40;
  const tit: (string | null)[] = FORMACOES[f].map(() => null), livres = new Set(ids);
  FORMACOES[f].map((v, i) => ({ v, i })).sort((a, b) => (a.v.pos === "GOL" ? -1 : b.v.pos === "GOL" ? 1 : 0)).forEach(({ v, i }) => {
    const m = [...livres].map((id) => por.get(id)!).sort((a, b) => ovrNaVaga(b, v.pos, ladoDaVaga(v)) - ovrNaVaga(a, v.pos, ladoDaVaga(v)))[0];
    if (m) { tit[i] = m.id; livres.delete(m.id); }
  });
  s.esc.titulares = tit;
}

// ------------------------------------------------------------------ a semana
export interface ResumoSemanaT { eventos: string[]; partida?: Relatorio; fimDeTemporada?: string; /** o jogo de copa da semana (antes da rodada da liga) */ partidaCopa?: Relatorio & { copa: string } }
export function avancarSemana(pacote: PacoteDados, s: SaveTecnico): ResumoSemanaT {
  if (s.demitido) return { eventos: [] };
  prepararMundo(pacote, s);
  const eventos: string[] = [], ab = semanaAbs(s), li = infoLiga(s.ligaId), w = mundo(pacote);
  let partida: Relatorio | undefined;
  // jogo de copa da semana (meio de semana): com a sua escalação, antes da rodada da liga
  let partidaCopa: (Relatorio & { copa: string }) | undefined, meuCopa: { id: string; gc: number; gf: number } | undefined;
  const jc = jogoCopaT(pacote, s);
  if (jc) {
    if (!s.aoVivo) eventos.push(...conferirEscalacao(s));
    const guarda = s.aoVivo; s.aoVivo = undefined;
    const souCasa = jc.jogo.casa === s.clubeId, adv = souCasa ? jc.jogo.fora : jc.jogo.casa;
    const antes = new Map(s.elenco.map((x) => [x.id, x.condicao]));
    const rel = terminarPartida(pacote, s, adv, souCasa, 1000 + s.semana);
    s.aoVivo = guarda;
    // o jogo de meio de semana cansa menos (o preparador físico dosa e o elenco roda)
    for (const x of s.elenco) { const c0 = antes.get(x.id); if (c0 !== undefined && x.condicao < c0) x.condicao = Math.max(x.condicao, c0 - 7); }
    const nomeCopa = `${COPAS[jc.copa.id].curto} · ${rotuloJogo(jc.jogo)}`;
    partidaCopa = { ...rel, copa: nomeCopa };
    meuCopa = { id: jc.jogo.id, gc: rel.gc, gf: rel.gf };
    const mg = souCasa ? rel.gc : rel.gf, dg = souCasa ? rel.gf : rel.gc;
    if (mg > dg) { const b = bonusVitoriaCopa(s, jc.copa.id); s.clube.saldo += b; receber(s, "Premiação de copas", b); }
    const placar = `${infoClube(pacote, rel.casa).nome} ${rel.gc} × ${rel.gf} ${infoClube(pacote, rel.fora).nome}`;
    eventos.push(`${nomeCopa}: ${placar}.`);
    noticia(s, "jogo", `${nomeCopa}: ${placar}.`);
  }
  {
    const rc = rodarCopasT(pacote, s, meuCopa);
    for (const id of rc.titulos) {
      const p = premioDeTitulo(s, id); s.clube.saldo += p.dinheiro; receber(s, "Premiação de copas", p.dinheiro);
      (s.titulosCopa ??= []).push({ t: s.temporada, id, nome: COPAS[id].nome, clubeId: s.clubeId });
      (s.premios ??= []).unshift({ t: s.temporada, nome: COPAS[id].nome, texto: `Campeão com o ${infoClube(pacote, s.clubeId).nome}` });
      eventos.unshift(p.texto); noticia(s, "clube", `${p.texto} O ${infoClube(pacote, s.clubeId).nome} é campeão ${COPAS[id].prep} ${COPAS[id].nome}.`);
    }
    for (const id of rc.caiu) { const e = s.copas?.[id]; noticia(s, "clube", `Fim da linha ${COPAS[id].prep} ${COPAS[id].curto}: eliminado ${e ? `na fase "${NOME_FASE[e.chegou[s.clubeId]] ?? e.chegou[s.clubeId]}"` : ""}.`); }
  }
  const r = s.semana - SEMANAS_PRE_T, rodadas = rodadasDaLiga(s.ordem.length);
  const titularesIds = new Set<string>(), entraram = new Set<string>();
  if (r >= 0 && r < rodadas.length) {
    if (!s.aoVivo) eventos.push(...conferirEscalacao(s));
    // quem estava suspenso cumpre agora
    const cumpriram = s.elenco.filter((a) => a.suspenso > 0);
    const rng = rngT(s, "rodada");
    const jogos: [string, string, number, number][] = [];
    for (const [ia, ib] of rodadas[r]) {
      const casa = s.ordem[ia], fora = s.ordem[ib];
      if (casa === s.clubeId || fora === s.clubeId) {
        const souCasa = casa === s.clubeId;
        partida = terminarPartida(pacote, s, souCasa ? fora : casa, souCasa, r);
        jogos.push([casa, fora, partida.gc, partida.gf]);
      } else {
        const [gc, gf] = simularPlacar(rng, w.clube[casa]?.forca ?? 60, w.clube[fora]?.forca ?? 60);
        jogos.push([casa, fora, gc, gf]);
      }
    }
    for (const a of cumpriram) a.suspenso = Math.max(0, a.suspenso - 1);
    for (const [casa, fora, gc, gf] of jogos) {
      const tc = s.tabela.find((t) => t.clube === casa), tf = s.tabela.find((t) => t.clube === fora);
      if (tc) registrar(tc, gc, gf); if (tf) registrar(tf, gf, gc);
    }
    s.rodadas[r] = jogos;
    if (partida) {
      const p = partida, meusGols = p.souCasa ? p.gc : p.gf, deles = p.souCasa ? p.gf : p.gc, adv = p.souCasa ? p.fora : p.casa;
      for (const n of p.notas) (n.min >= 45 ? titularesIds : entraram).add(n.id);
      // bilheteria
      if (p.souCasa) {
        const pos = ordenar(s.tabela).findIndex((t) => t.clube === s.clubeId) + 1, n = s.ordem.length;
        const ocup = clamp(0.38 + s.clube.torcida / 220 + (pos <= 4 ? 0.1 : pos > n - 4 ? -0.08 : 0) + ((w.clube[adv]?.forca ?? 60) > (w.clube[s.clubeId]?.forca ?? 60) ? 0.08 : 0), 0.2, 1);
        p.publico = Math.round(s.clube.capacidade * ocup);
        receber(s, "Bilheteria", p.publico * precoIngresso(li.fLiga));
        s.clube.saldo += p.publico * precoIngresso(li.fLiga);
      }
      // diretoria e torcida: resultado contra o esperado pela força dos dois
      const fMeu = w.clube[s.clubeId]?.forca ?? 60, fAdv = w.clube[adv]?.forca ?? 60, esperado = clamp(1.45 + (fMeu - fAdv) / 9 + (p.souCasa ? 0.25 : -0.25), 0.2, 2.6);
      const pts = meusGols > deles ? 3 : meusGols === deles ? 1 : 0;
      s.diretoria.confianca = clamp(s.diretoria.confianca + (pts - esperado) * 1.6, 0, 100);
      s.clube.torcida = clamp(s.clube.torcida + (pts - esperado) * 3, 0, 100);
      s.entrosamento[s.tatica.formacao] = clamp((s.entrosamento[s.tatica.formacao] ?? 40) + 1.5 + 0.4 * nivelStaff(s, "auxiliar"), 0, 100);
      s.ultima = p;
      const placar = `${infoClube(pacote, p.casa).nome} ${p.gc} × ${p.gf} ${infoClube(pacote, p.fora).nome}`;
      eventos.unshift(`${pts === 3 ? "Vitória" : pts === 1 ? "Empate" : "Derrota"}: ${placar}.`);
      noticia(s, "jogo", `${placar}${p.melhor ? ` · melhor em campo: ${p.melhor}` : ""}.`);
    }
    // promessas e quem não joga
    const mediaTit = media(s.elenco.filter((a) => titularesIds.has(a.id)).map(ovrDe));
    for (const a of s.elenco) {
      if (titularesIds.has(a.id)) { if (a.promessa !== undefined) a.promessa = undefined; continue; }
      if (!entraram.has(a.id) && disponivel(a)) a.semJogar++;
      if (a.promessa !== undefined && disponivel(a)) {
        a.promessa--;
        if (a.promessa <= 0) { a.promessa = undefined; a.moral = clamp(a.moral - 15, 0, 100); a.relacao = clamp(a.relacao - 20, 0, 100); eventos.push(`${a.nome} diz que você não cumpriu a promessa de titularidade.`); noticia(s, "elenco", `${a.nome} se sente enganado: a promessa de vaga não foi cumprida.`); }
      }
      if (a.semJogar >= 3 && ovrDe(a) >= mediaTit - 3 && a.idade >= 20) a.moral = clamp(a.moral - 3, 0, 100);
    }
  }
  // treino e evolução
  const lingua = linguaDe(li.pais), cap = s.elenco.find((a) => a.id === s.esc.capitao), liderCapitao = cap ? clamp((exDe(cap).LID - 60) / 6, -3, 4) : 0;
  const titularesAgora = s.esc.titulares.map((id) => s.elenco.find((a) => a.id === id)).filter((a): a is Atleta => !!a);
  const equipe = titularesAgora.length ? titularesAgora.reduce((x, a) => x + exDe(a).EQU, 0) / titularesAgora.length : 60;
  const ct = s.clube.ctNivel, gol = nivelStaff(s, "goleiros"), prep = nivelStaff(s, "preparador");
  for (const a of s.elenco) {
    const participacao: Participacao = a.lesao > 0 ? "ferias" : titularesIds.has(a.id) ? "titular" : entraram.has(a.id) ? "entrou" : "naoJogou";
    a.at = evoluirSemana(a.at, a.pot, { idade: a.idade, foco: s.treino.foco, intensidade: s.treino.intensidade, participacao, moral: a.moral, personalTrainer: false, profissionalismo: a.prof, fClube: (0.94 + exDe(a).DET / 800) * (0.88 + 0.05 * ct) * (a.pos === "GOL" ? 1 + 0.08 * gol : 1) });
    const rec = s.treino.intensidade === "alta" ? 18 : s.treino.intensidade === "leve" ? 34 : 26;
    a.condicao = a.lesao > 0 ? clamp(a.condicao, 0, 75) : clamp(a.condicao + rec + 2 * prep, 0, 100);
    if (a.lesao > 0) { a.lesao--; if (a.lesao === 0) { eventos.push(`${a.nome} está recuperado.`); a.lesaoTipo = undefined; } }
    a.ex = evoluirExtras(exDe(a), a.idade, participacao === "titular" || participacao === "entrou", s.treino.foco === "tecnico", exDe(a).DET);
    // idiomas: aprende a língua do país morando nele; as aulas pagas pelo clube aceleram
    const aula = a.aulas && a.aulas.ate > ab ? a.aulas.lingua : undefined;
    if (aula) gastar(s, "Aulas de idioma", Math.round(1200 * Math.max(0.5, li.fLiga)));
    else if (a.aulas) a.aulas = undefined;
    for (const x of semanaIdiomas(idiomasDe(a), lingua, aula)) if (x.startsWith(NOME_LINGUA[lingua] ?? "§")) noticia(s, "elenco", `${a.nome} já fala ${x.toLowerCase()}.`);
    // moral: quem não se comunica sente (menos se o técnico fala a língua dele); o capitão puxa o grupo
    const semLingua = nivelEm(idiomasDe(a), lingua) < 40 && nivelEm(idiomasT(s), linguaDe(a.nac)) < 50;
    a.moral = clamp(a.moral + (62 - (semLingua ? 7 : 0) + liderCapitao - a.moral) * 0.08, 0, 100);
    // curso de técnico recomendado: estuda devagar, junto com os treinos
    if (a.curso?.estudando) { const feita = semanaCurso(a.curso, 0.6); if (feita) { noticia(s, "elenco", `${a.nome} concluiu a ${LICENCAS[feita]}.`); if (feita < 2) a.curso.estudando = feita + 1; } }
    if (a.moral < 20 && !a.querSair) { a.querSair = true; noticia(s, "elenco", `${a.nome} está insatisfeito e pediu para sair do clube.`); }
    if (a.querSair && a.moral >= 45) a.querSair = false;
  }
  for (const [f, v] of Object.entries(s.entrosamento)) s.entrosamento[f] = f === s.tatica.formacao ? clamp(v + (s.treino.foco === "tatico" ? 3 : 1) + 0.3 * nivelStaff(s, "auxiliar") + (equipe - 60) / 40, 0, 100) : clamp(v - 0.4, 30, 100);
  // reta final: aviso de contrato acabando (uma vez)
  if (r === nRodadasT(s) - 8) for (const a of s.elenco.filter((x) => x.contratoAte <= s.temporada)) { noticia(s, "elenco", `O contrato de ${a.nome} termina no fim da temporada. Renove no Elenco ou ele vai embora.`); eventos.push(`Contrato de ${a.nome} acaba no fim da temporada.`); }
  // o técnico: língua do país e curso de licença
  for (const x of semanaIdiomas(idiomasT(s), lingua)) noticia(s, "clube", `Você já fala ${x.toLowerCase()}.`);
  if (s.tecnico.curso?.estudando) { const feita = semanaCurso(s.tecnico.curso, 1); if (feita) { s.tecnico.reputacao = clamp(s.tecnico.reputacao + 2, 0, 100); noticia(s, "clube", `Você concluiu a ${LICENCAS[feita]}.`); eventos.push(`Você concluiu a ${LICENCAS[feita]}.`); } }
  // obras que terminam
  for (const o of s.diretoria.obras.filter((x) => x.fim <= ab)) {
    if (o.tipo === "estadio") { s.clube.capacidade += o.lugares ?? 0; noticia(s, "clube", `Estádio ampliado: agora cabem ${s.clube.capacidade.toLocaleString("pt-BR")} torcedores.`); }
    if (o.tipo === "ct") { s.clube.ctNivel = o.nivel ?? s.clube.ctNivel + 1; noticia(s, "clube", `Centro de treinamento reformado (nível ${s.clube.ctNivel}).`); }
    if (o.tipo === "base") { s.clube.baseNivel = o.nivel ?? s.clube.baseNivel + 1; noticia(s, "clube", `Categoria de base melhorada (nível ${s.clube.baseNivel}).`); }
    eventos.push("Uma obra do clube ficou pronta.");
  }
  s.diretoria.obras = s.diretoria.obras.filter((x) => x.fim > ab);
  // fim do mês
  if (s.semana % 4 === 3) {
    fecharMes(pacote, s);
    mesDaVida(s);
    mesDosNegocios(s, (t) => noticia(s, "dinheiro", t));
    if (r >= 0) eventos.push(...premiosDoMes(pacote, s));
    const pos = ordenar(s.tabela).findIndex((t) => t.clube === s.clubeId) + 1;
    if (r > 4) s.diretoria.confianca = clamp(s.diretoria.confianca + (pos <= s.diretoria.expectativa.pos ? 2 : pos > s.diretoria.expectativa.pos + 4 ? -3 : 0), 0, 100);
  }
  if (s.diretoria.confianca < 8 && r > 6) {
    s.demitido = `Demitido na ${rotuloSemanaT(s).toLowerCase()}: a diretoria perdeu a confiança no trabalho.`;
    { const m = receberMulta(s); if (m) s.demitido += ` O clube pagou a multa rescisória: ${valorBrl(m)}.`; }
    noticia(s, "diretoria", s.demitido);
    return { eventos: [...eventos, s.demitido], partida };
  }
  propostasDaSemana(pacote, s, eventos);
  if (s.ofertaEmprego && semanaAbs(s) > s.ofertaEmprego.expira) { noticia(s, "clube", `A proposta do ${infoClube(pacote, s.ofertaEmprego.clubeId)?.nome ?? "outro clube"} expirou.`); s.ofertaEmprego = undefined; }
  s.semana++;
  let fim: string | undefined;
  if (s.semana >= semanasDaTemporada(s) && !temCopaPendente(s)) fim = virarTemporada(pacote, s);
  else prepararMundo(pacote, s);
  semanaDaVida(pacote, s, (t) => noticia(s, "vida", t));
  semanaNegocios(s, (t) => noticia(s, "dinheiro", t));
  semanaEmpregos(pacote, s, (t) => noticia(s, "clube", t));
  sortearEvento(pacote, s, rngT(s, "evento"));
  return { eventos, partida, fimDeTemporada: fim, ...(partidaCopa ? { partidaCopa } : {}) };
}
const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// ------------------------------------------------------------------ virada de temporada
function virarTemporada(pacote: PacoteDados, s: SaveTecnico): string {
  fecharCopasT(pacote, s);
  const t = s.temporada, final = ordenar(s.tabela), n = final.length, pos = final.findIndex((x) => x.clube === s.clubeId) + 1, li = infoLiga(s.ligaId);
  const esperado = s.diretoria.expectativa.pos, campeao = pos === 1;
  // premiação
  const premio = Math.round(s.clube.tv * (3 * (1 - (pos - 1) / Math.max(1, n - 1)) + (campeao ? 3 : 0)));
  s.clube.saldo += premio; receber(s, "Premiação", premio);
  const diff = esperado - pos;
  s.diretoria.confianca = clamp(s.diretoria.confianca + clamp(diff * 4, -25, 25) + (campeao ? 15 : 0), 0, 100);
  s.tecnico.reputacao = clamp(s.tecnico.reputacao + clamp(diff, -6, 8) + (campeao ? 8 : 0) + 1, 0, 100);
  s.historico.push({ t, clubeId: s.clubeId, ligaId: s.ligaId, pos, n, pts: final[pos - 1]?.pts ?? 0, esperado, ...(campeao ? { campeao: true } : {}) });
  s.tabelasReais[t] = { ligaId: s.ligaId, ordem: final.map((x) => x.clube) };
  const resumo = `${ANO_INICIAL_T + t}: ${pos}º lugar na ${li.curto}${campeao ? " — CAMPEÃO!" : ""} (a diretoria esperava ${esperado}º).`;
  noticia(s, "clube", resumo);
  const premiosAno = premiosDoAno(pacote, s, pos, esperado);
  // a família que joga cresce um ano (quem está no seu elenco evolui no treino, como os outros)
  for (const f of s.familiaJog ?? []) if (!f.noClube) { f.idade++; f.ovr = Math.min(f.pot, f.ovr + (f.idade < 24 ? 4 : f.idade < 30 ? 1 : -1)); }
  if (s.diretoria.confianca < 15) { s.demitido = `Demitido no fim de ${ANO_INICIAL_T + t}: a campanha ficou longe do que a diretoria esperava.`; { const m = receberMulta(s); if (m) s.demitido += ` O clube pagou a multa rescisória: ${valorBrl(m)}.`; } noticia(s, "diretoria", s.demitido); return resumo; }
  // contratos que acabam e aposentadorias
  const rng = new RNG(`${s.semente}|virada|${t}`);
  for (const a of [...s.elenco]) {
    if (a.contratoAte <= t) { tirarDoElenco(s, a.id); noticia(s, "elenco", `${a.nome} deixa o clube: o contrato acabou.`); continue; }
    const aposenta = a.idade >= 34 && rng.chance((a.idade - 33) * 0.2);
    if (aposenta && (a.curso?.licenca ?? 0) >= 1) { (s.exAtletas ??= []).push({ nome: a.nome, nac: a.nac, idade: a.idade, licenca: a.curso!.licenca, lid: exDe(a).LID, pos: a.pos }); noticia(s, "clube", `${a.nome} se aposenta com a ${LICENCAS[a.curso!.licenca]}: pode entrar na sua comissão técnica.`); }
    if (aposenta) { tirarDoElenco(s, a.id); noticia(s, "elenco", `${a.nome} pendura as chuteiras aos ${a.idade} anos.`); }
  }
  for (const a of s.elenco) guardarTemporada(s, a);
  for (const a of s.elenco) { a.idade++; a.jogos = 0; a.gols = 0; a.assist = 0; a.amarelosT = 0; a.vermelhosT = 0; a.amarelos = 0; a.suspenso = 0; a.notas = []; a.condicao = 100; a.promessa = undefined; a.moral = Math.round(a.moral * 0.5 + 32); a.querSair = false; a.semJogar = 0; }
  s.temporada++; s.semana = 0; s.rodadas = {}; s.recusas = []; s.propostas = []; s.negociacoes = {};
  for (const av of viradaPatro(pacote, s)) noticia(s, "dinheiro", av);
  // o mundo vira a temporada (com a tabela da liga do técnico valendo para o acesso e o rebaixamento)
  sincronizarMundo(pacote, s.semente, s.temporada, 0, s.tabelasReais, 0);
  const w = mundo(pacote), ligaNova = w.info[s.clubeId]?.ligaId ?? s.ligaId;
  if (ligaNova !== s.ligaId) {
    const subiu = infoLiga(ligaNova).divisao < li.divisao;
    s.clube.tv = Math.round(s.clube.tv * infoLiga(ligaNova).fLiga / li.fLiga);
    if (s.patro) s.patro.base = Math.round(s.patro.base * infoLiga(ligaNova).fLiga / li.fLiga);
    noticia(s, "clube", subiu ? `ACESSO! O clube jogará a ${infoLiga(ligaNova).curto}.` : `Rebaixado para a ${infoLiga(ligaNova).curto}.`);
    s.ligaId = ligaNova;
  }
  const l = w.liga[s.ligaId];
  s.ordem = l.clubes.map((x) => x.id); s.tabela = novaTabela(l);
  // garotos da base
  const usados = new Set(s.elenco.map((a) => a.nome)), pais = infoLiga(s.ligaId).pais, nBase = s.clube.baseNivel, coord = nivelStaff(s, "base");
  const nGarotos = Math.max(2 + Math.floor(nBase / 2), 18 - s.elenco.length);
  if (s.elenco.length + 2 + Math.floor(nBase / 2) < 18) noticia(s, "diretoria", "O elenco ficou curto: a diretoria completou o grupo com garotos da base.");
  for (let k = 0; k < nGarotos; k++) {
    const p = rng.pick(["GOL", "ZAG", "LAT", "VOL", "MEI", "PON", "ATA"] as PosT[]), idade = rng.int(16, 18), ovr = Math.round(clamp(40 + nBase * 2.5 + rng.normal(0, 4), 35, 64));
    const pot = Math.round(clamp(58 + nBase * 3 + coord * 2 + rng.normal(0, 7), ovr + 5, 94)), nome = gerarNome(rng, pais, usados);
    s.elenco.push({ id: `${s.clubeId}|${nome}`, nome, pos: p, idade, nac: pais, at: gerarAtributos(rng, p, ovr), pot, numero: 0, moral: 75, condicao: 100, lesao: 0, suspenso: 0, amarelos: 0,
      salario: Math.round(sal(s, 0.6)(ovr, idade) * 0.5 / 100) * 100, contratoAte: s.temporada + 2, prof: rng.int(6, 20), temp: rng.int(1, 20), relacao: 60, notas: [], jogos: 0, gols: 0, assist: 0, amarelosT: 0, vermelhosT: 0, semJogar: 0, base: true, desde: s.temporada });
    noticia(s, "elenco", `${nome} sobe da base (${p}, ${idade} anos).`);
  }
  numerar(s);
  s.esc = melhorEscalacao(s.elenco, s.tatica.formacao);
  prepararMundo(pacote, s);
  definirExpectativa(pacote, s);
  noticia(s, "diretoria", `Temporada ${ANO_INICIAL_T + s.temporada}: a diretoria espera "${s.diretoria.expectativa.texto.toLowerCase()}".`);
  // fim do contrato: com a diretoria satisfeita, renova com aumento; sem, você sai de graça (sem multa)
  const ct = s.tecnico.contrato;
  if (ct && ct.ate < s.temporada && !s.novoClube) {
    if (s.diretoria.confianca >= 45) { const novo = Math.round(Math.max(ct.salario * 1.1, salarioOferecido(pacote, s, s.clubeId)) / 1000) * 1000; s.tecnico.contrato = { salario: novo, ate: s.temporada + 1, multa: novo * 6 }; noticia(s, "diretoria", `Contrato renovado por duas temporadas, com salário de ${valorBrl(novo)} por mês.`); }
    else { s.demitido = `Seu contrato acabou no fim de ${ANO_INICIAL_T + t} e a diretoria preferiu não renovar.`; noticia(s, "diretoria", s.demitido); return resumo; }
  }
  // o mercado de técnicos: quem fez boa campanha (ou tem nome) recebe proposta de um clube maior na pré-temporada
  if (!s.novoClube && !s.ofertaEmprego && rng.chance(clamp(0.12 + (diff > 0 ? 0.12 : 0) + (campeao ? 0.25 : 0) + s.tecnico.reputacao / 300, 0, 0.75))) {
    const o = clubeQueQuer(pacote, s, rng);
    if (o) { s.ofertaEmprego = { clubeId: o, expira: semanaAbs(s) + SEMANAS_PRE_T + 1, texto: campeao ? "Depois do título, o seu nome entrou na lista de clubes grandes." : "A campanha chamou a atenção do mercado." }; noticia(s, "clube", `Proposta oficial: o ${infoClube(pacote, o)?.nome} quer você como técnico. Responda na tela inicial.`); }
  }
  return resumo;
}

// ------------------------------------------------------------------ consultas para as telas
export function proximoJogo(s: SaveTecnico): { adv: string; souCasa: boolean; rodada: number } | undefined {
  const r = s.semana - SEMANAS_PRE_T, rodadas = rodadasDaLiga(s.ordem.length);
  if (r < 0 || r >= rodadas.length) return undefined;
  const j = rodadas[r].find(([a, b]) => s.ordem[a] === s.clubeId || s.ordem[b] === s.clubeId);
  if (!j) return undefined;
  const souCasa = s.ordem[j[0]] === s.clubeId;
  return { adv: s.ordem[souCasa ? j[1] : j[0]], souCasa, rodada: r };
}
export { valorAtleta, ovrDe, formaDe, disponivel };

// ------------------------------------------------------------------ mercado de transferências
export interface Alvo { nome: string; pos: PosT; idade: number; ovr: number; nac: string; clubeId: string; ligaId: string; valor: number; titular: boolean }
export interface PropostaRecebida { id: string; atletaId: string; clubeId: string; valor: number; expira: number; contra?: boolean | number; /** o máximo que o clube topa pagar (não aparece na tela) */ max?: number }
export interface Transferencia { t: number; nome: string; de: string; para: string; valor: number; venda: boolean }
const PRE_JANELA = SEMANAS_PRE_T + 4, MEIO_INI = SEMANAS_PRE_T + 17, MEIO_FIM = SEMANAS_PRE_T + 22;
/** Janela aberta: pré-temporada até a 4ª rodada e no meio do ano, da 18ª à 22ª. */
export function janelaT(s: SaveTecnico): { aberta: boolean; texto: string } {
  if (s.semana < PRE_JANELA) return { aberta: true, texto: "Janela aberta até a 4ª rodada." };
  if (s.semana >= MEIO_INI && s.semana < MEIO_FIM) return { aberta: true, texto: "Janela do meio do ano aberta até a 22ª rodada." };
  return { aberta: false, texto: s.semana < MEIO_INI ? "Janela fechada. Reabre na 18ª rodada." : "Janela fechada. Reabre na pré-temporada." };
}
const chaveJanela = (s: SaveTecnico) => `${s.temporada}-${s.semana < MEIO_INI ? "pre" : "meio"}`;
const valorNpc = (j: JogadorNPC, fLiga: number) => Math.round(valorMercado(j.ovr, j.idade, 2, fLiga) * CAMBIO / 1000) * 1000;

/** Jogadores dos outros clubes, para a busca do mercado. */
export function buscarJogadores(pacote: PacoteDados, s: SaveTecnico, f: { pos?: PosT; idadeMax?: number; minhaLiga?: boolean; ovrMin?: number; alcance?: boolean }): Alvo[] {
  const w = mundo(pacote), meus = new Set(s.elenco.map((a) => a.nome)), lista: Alvo[] = [];
  const fMeu = w.clube[s.clubeId]?.forca ?? 60, teto = fMeu + 6 + s.tecnico.reputacao / 12;
  for (const l of w.ligas) {
    if (f.minhaLiga && l.id !== s.ligaId) continue;
    const li = infoLiga(l.id);
    if (li.amador) continue;
    for (const c of l.clubes) {
      if (c.id === s.clubeId) continue;
      const onze = new Set(onzeProvavel(c.elenco).map((j) => j.nome));
      for (const j of c.elenco) {
        if (meus.has(j.nome) || j.base || (f.pos && j.posicao !== f.pos) || (f.idadeMax && j.idade > f.idadeMax) || j.ovr < (f.ovrMin ?? 0)) continue;
        const valor = valorNpc(j, li.fLiga);
        if (f.alcance && (j.ovr > teto || valor > s.clube.saldo * 1.2 || (li.nivel < infoLiga(s.ligaId).nivel && c.forca > fMeu + 3 && j.idade < 31))) continue;
        lista.push({ nome: j.nome, pos: j.posicao as PosT, idade: j.idade, ovr: j.ovr, nac: j.nacionalidade, clubeId: c.id, ligaId: l.id, valor, titular: onze.has(j.nome) });
      }
    }
  }
  return lista.sort((a, b) => b.ovr - a.ovr || a.valor - b.valor).slice(0, 60);
}
/** O que o jogador acha de vir: topa ou acha o clube pequeno; e quanto quer ganhar. */
export function interesseDo(pacote: PacoteDados, s: SaveTecnico, a: Alvo): { topa: boolean; motivo: string; salario: number } {
  const w = mundo(pacote), meu = w.clube[s.clubeId], dele = w.clube[a.clubeId], li = infoLiga(s.ligaId), liDele = infoLiga(a.ligaId);
  const fMeu = meu?.forca ?? 60, fDele = dele?.forca ?? 60;
  const salario = Math.round(salarioJusto(a.ovr, a.idade, li.fLiga, li.fSalario, meu?.fClube ?? 1) * (fDele > fMeu ? 1.25 : 1.1) / 100) * 100;
  const amigo = forcaDoContato(s, a.nome), limite = fMeu + 6 + s.tecnico.reputacao / 12 + 8 * amigo;
  if (a.ovr > limite) return { topa: false, motivo: `${a.nome} acha o seu clube pequeno para ele.`, salario };
  if (amigo >= 0.5) return { topa: true, motivo: `${a.nome} é seu amigo dos tempos de jogador: topa conversar e não vai pedir a mais.`, salario: Math.round(salario * 0.92 / 100) * 100 };
  if (liDele.nivel < li.nivel && fDele > fMeu + 3 && a.idade < 31) return { topa: false, motivo: `${a.nome} não quer trocar a ${liDele.curto} por uma liga menor agora.`, salario };
  return { topa: true, motivo: fDele > fMeu ? `${a.nome} aceita conversar, mas quer ganhar bem para descer de nível.` : `${a.nome} topa conversar: seria um passo à frente na carreira.`, salario };
}
/** Quanto o clube dono pede no mínimo: titular, rival da mesma liga e garoto valem mais. */
const minimoDoClube = (s: SaveTecnico, a: Alvo) => Math.round(a.valor * (1 + (a.titular ? 0.25 : 0) + (a.ligaId === s.ligaId ? 0.1 : 0) + (a.idade <= 21 ? 0.1 : 0)) / 1000) * 1000;

export function fazerProposta(pacote: PacoteDados, s: SaveTecnico, nome: string, clubeId: string, valor: number, anos: number): { ok: boolean; status: "fechado" | "contra" | "recusado" | "erro"; msg: string; pedido?: number } {
  const jan = janelaT(s);
  if (!jan.aberta) return { ok: false, status: "erro", msg: jan.texto };
  const a = buscarAlvo(pacote, s, nome, clubeId);
  if (!a) return { ok: false, status: "erro", msg: "Esse jogador não está mais nesse clube." };
  const neg = ((s.negociacoes ??= {})[`${clubeId}|${nome}`] ??= { tentativas: 0, janela: chaveJanela(s) });
  if (neg.janela !== chaveJanela(s)) { neg.tentativas = 0; neg.janela = chaveJanela(s); neg.pedido = undefined; }
  if (neg.tentativas >= 3) return { ok: false, status: "recusado", msg: `O ${infoClube(pacote, clubeId).nome} encerrou a conversa por ${nome} nesta janela.` };
  const int = interesseDo(pacote, s, a);
  if (!int.topa) return { ok: false, status: "recusado", msg: int.motivo };
  if (s.elenco.length >= 36) return { ok: false, status: "erro", msg: "O elenco está cheio (36). Venda ou dispense alguém antes." };
  if (s.clube.saldo < valor) return { ok: false, status: "erro", msg: "O clube não tem esse dinheiro em caixa." };
  if (folhaDe(s) + int.salario > s.clube.tetoFolha) return { ok: false, status: "erro", msg: `A diretoria barrou: o salário dele (${dinheiroT(int.salario)}/mês) passa do teto da folha.` };
  neg.tentativas++;
  const minimo = neg.pedido ?? minimoDoClube(s, a), nomeC = infoClube(pacote, clubeId).nome;
  if (valor < minimo) {
    if (valor >= minimo * 0.8 && neg.tentativas < 3) { neg.pedido = Math.round(minimo * 1.03 / 1000) * 1000; return { ok: false, status: "contra", msg: `O ${nomeC} recusou, mas aceita vender por ${dinheiroT(neg.pedido)}.`, pedido: neg.pedido }; }
    return { ok: false, status: "recusado", msg: `O ${nomeC} achou a oferta baixa demais.${neg.tentativas >= 3 ? " A conversa acabou nesta janela." : ""}` };
  }
  // fechado
  const npc = mundo(pacote).clube[clubeId]?.elenco.find((j) => j.nome === nome);
  if (!npc) return { ok: false, status: "erro", msg: "Esse jogador não está mais nesse clube." };
  const at = atletaDoMundo(npc, s.semente, s.clubeId, s.temporada, () => int.salario);
  at.contratoAte = s.temporada + anos - 1; at.moral = 75; at.condicao = 90; at.desde = s.temporada; at.numero = 0;
  s.elenco.push(at); numerar(s);
  s.clube.saldo -= valor; gastar(s, "Contratações", valor);
  (s.transferencias ??= []).unshift({ t: s.temporada, nome, de: clubeId, para: s.clubeId, valor, venda: false });
  delete s.negociacoes![`${clubeId}|${nome}`];
  versaoAplicada = -1;
  prepararMundo(pacote, s);
  noticia(s, "elenco", `${nome} (${a.pos}, ${a.idade} anos) chega do ${nomeC} por ${dinheiroT(valor)}, com contrato até ${ANO_INICIAL_T + at.contratoAte}.`);
  return { ok: true, status: "fechado", msg: `Fechado! ${nome} assinou até ${ANO_INICIAL_T + at.contratoAte}.` };
}
function buscarAlvo(pacote: PacoteDados, s: SaveTecnico, nome: string, clubeId: string): Alvo | undefined {
  const c = mundo(pacote).clube[clubeId], j = c?.elenco.find((x) => x.nome === nome);
  if (!c || !j) return undefined;
  const li = infoLiga(c.ligaId);
  return { nome, pos: j.posicao as PosT, idade: j.idade, ovr: j.ovr, nac: j.nacionalidade, clubeId, ligaId: c.ligaId, valor: valorNpc(j, li.fLiga), titular: onzeProvavel(c.elenco).some((x) => x.nome === nome) };
}
export const alvoPorNome = buscarAlvo;

export function alternarVenda(s: SaveTecnico, id: string): string {
  const l = (s.aVenda ??= []), i = l.indexOf(id), a = s.elenco.find((x) => x.id === id);
  if (i >= 0) { l.splice(i, 1); return `${a?.nome ?? "Jogador"} saiu da lista de venda.`; }
  l.push(id); if (a) a.moral = clamp(a.moral - 4, 0, 100);
  return `${a?.nome ?? "Jogador"} está à venda: os clubes ficam sabendo e as propostas aparecem durante a janela.`;
}
/** Propostas dos outros clubes pelos jogadores do técnico (só com a janela aberta). */
function propostasDaSemana(pacote: PacoteDados, s: SaveTecnico, eventos: string[]) {
  const ab = semanaAbs(s);
  s.propostas = (s.propostas ?? []).filter((p) => p.expira > ab && s.elenco.some((a) => a.id === p.atletaId));
  if (!janelaT(s).aberta || s.propostas.length >= 3) return;
  const w = mundo(pacote), rng = rngT(s, "propostas"), fL = fLigaDe(s), aVenda = new Set(s.aVenda ?? []), meuF = w.clube[s.clubeId]?.forca ?? 60;
  const clubes = w.ligas.filter((l) => !infoLiga(l.id).amador).flatMap((l) => l.clubes).filter((c) => c.id !== s.clubeId);
  for (const a of s.elenco) {
    if (s.propostas.length >= 3 || s.propostas.some((p) => p.atletaId === a.id) || a.desde === s.temporada && !aVenda.has(a.id)) continue;
    const o = ovrDe(a), p = 0.012 + (aVenda.has(a.id) ? 0.12 : 0) + (a.querSair ? 0.05 : 0) + (o >= meuF + 3 ? 0.02 : 0) + (a.idade <= 21 && a.pot >= o + 8 ? 0.015 : 0);
    if (!rng.chance(p)) continue;
    const cands = clubes.filter((c) => c.forca >= o - 5 && c.forca <= o + 9);
    if (!cands.length) continue;
    const c = rng.pick(cands), valor = Math.round(valorAtleta(a, Math.max(fL, infoLiga(c.ligaId).fLiga), s.temporada) * rng.range(0.75, 1.25) * (aVenda.has(a.id) ? 0.9 : 1) / 1000) * 1000;
    s.propostas.push({ id: `${ab}-${a.id}`, atletaId: a.id, clubeId: c.id, valor, expira: ab + 2 });
    eventos.push(`Proposta do ${w.info[c.id]?.nome ?? c.id} por ${a.nome}.`);
  }
}
export function responderPropostaT(pacote: PacoteDados, s: SaveTecnico, id: string, r: "aceitar" | "recusar" | "contra", pedido?: number): { ok: boolean; msg: string } {
  const p = (s.propostas ?? []).find((x) => x.id === id), a = p && s.elenco.find((x) => x.id === p.atletaId);
  if (!p || !a) return { ok: false, msg: "Essa proposta não vale mais." };
  const nomeC = infoClube(pacote, p.clubeId)?.nome ?? p.clubeId;
  const tirar = () => { s.propostas = s.propostas!.filter((x) => x.id !== id); };
  if (r === "recusar") { tirar(); if (a.querSair) a.moral = clamp(a.moral - 8, 0, 100); return { ok: true, msg: `Você recusou a proposta do ${nomeC}.${a.querSair ? ` ${a.nome} ficou chateado.` : ""}` }; }
  if (r === "contra") {
    // o clube tem um máximo que topa pagar (fica escondido): pedir até ele fecha pelo pedido; acima, ele sobe até o máximo; muito acima, desiste
    const max = (p.max ??= Math.round(p.valor * rngT(s, "max", id).range(1.02, 1.35) / 1000) * 1000);
    const quer = Math.round((pedido ?? p.valor) / 1000) * 1000;
    if (quer <= p.valor) return responderPropostaT(pacote, s, id, "aceitar");
    p.contra = (typeof p.contra === "number" ? p.contra : p.contra ? 1 : 0) + 1;
    if (quer <= max) { p.valor = quer; return responderPropostaT(pacote, s, id, "aceitar"); }
    if (quer > max * 1.4 || (p.contra as number) >= 3) { tirar(); return { ok: false, msg: `O ${nomeC} achou ${dinheiroT(quer)} fora da realidade e desistiu.` }; }
    if (p.valor >= max) return { ok: false, msg: `O ${nomeC} não passa de ${dinheiroT(p.valor)}. É pegar ou largar.` };
    p.valor = max;
    return { ok: true, msg: `O ${nomeC} não paga ${dinheiroT(quer)}, mas subiu a oferta para ${dinheiroT(max)}. Disse que é o máximo.` };
  }
  if (s.elenco.length <= 18) return { ok: false, msg: "O elenco ficaria curto demais (mínimo de 18)." };
  tirar();
  s.clube.saldo += p.valor; receber(s, "Vendas", p.valor);
  tirarDoElenco(s, a.id); s.aVenda = (s.aVenda ?? []).filter((x) => x !== a.id);
  (s.transferencias ??= []).unshift({ t: s.temporada, nome: a.nome, de: s.clubeId, para: p.clubeId, valor: p.valor, venda: true });
  if (ovrDe(a) >= (mundo(pacote).clube[s.clubeId]?.forca ?? 60) + 2) s.clube.torcida = clamp(s.clube.torcida - 4, 0, 100);
  versaoAplicada = -1; prepararMundo(pacote, s);
  noticia(s, "elenco", `${a.nome} é vendido ao ${nomeC} por ${dinheiroT(p.valor)}.`);
  return { ok: true, msg: `${a.nome} vendido ao ${nomeC}.` };
}

// ------------------------------------------------------------------ curso de técnico e idiomas
/** Recomendar o curso de técnico a um atleta: os mais velhos, líderes ou profissionais topam. */
export function recomendarCurso(s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const a = s.elenco.find((x) => x.id === id);
  if (!a) return { ok: false, msg: "Jogador não encontrado." };
  if (a.curso?.estudando || (a.curso?.licenca ?? 0) >= 2) return { ok: false, msg: `${a.nome} já está nesse caminho.` };
  if (a.idade < 26) return { ok: false, msg: `${a.nome} ainda é novo e só pensa em jogar.` };
  if (exDe(a).LID < 50 && a.prof < 12) { a.relacao = clamp(a.relacao - 1, 0, 100); return { ok: false, msg: `${a.nome} agradeceu, mas não se vê como técnico.` }; }
  a.curso = { licenca: a.curso?.licenca ?? 0, estudando: (a.curso?.licenca ?? 0) + 1, progresso: 0 };
  a.relacao = clamp(a.relacao + 3, 0, 100); a.moral = clamp(a.moral + 2, 0, 100);
  return { ok: true, msg: `${a.nome} começou a ${LICENCAS[a.curso.estudando!]}. Quando se aposentar, pode entrar na sua comissão.` };
}
/** Aulas da língua do país pagas pelo clube (12 semanas). */
export function pagarAulas(s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const a = s.elenco.find((x) => x.id === id), lingua = linguaDe(infoLiga(s.ligaId).pais), ab = semanaAbs(s);
  if (!a) return { ok: false, msg: "Jogador não encontrado." };
  if (nivelEm(idiomasDe(a), lingua) >= 90) return { ok: false, msg: `${a.nome} já é fluente em ${(NOME_LINGUA[lingua] ?? lingua).toLowerCase()}.` };
  if (a.aulas && a.aulas.ate > ab) return { ok: false, msg: "Ele já está fazendo aulas." };
  a.aulas = { lingua, ate: ab + 12 }; a.relacao = clamp(a.relacao + 2, 0, 100);
  return { ok: true, msg: `${a.nome} começa aulas de ${(NOME_LINGUA[lingua] ?? lingua).toLowerCase()} por 12 semanas, pagas pelo clube.` };
}
/** O técnico estuda a próxima licença (o clube paga o curso). */
export function estudarLicenca(s: SaveTecnico): { ok: boolean; msg: string } {
  const c = (s.tecnico.curso ??= { licenca: 2 }), prox = c.licenca + 1;
  if (c.estudando) return { ok: false, msg: `Você já está estudando a ${LICENCAS[c.estudando]}.` };
  if (prox > 4) return { ok: false, msg: "Você já tem a licença máxima." };
  const custo = Math.round(CURSO_LICENCA[prox].custo * Math.max(0.5, fLigaDe(s)));
  if (s.clube.saldo < custo) return { ok: false, msg: "O clube não tem caixa para pagar o curso agora." };
  s.clube.saldo -= custo; gastar(s, "Cursos", custo);
  c.estudando = prox; c.progresso = 0;
  return { ok: true, msg: `Você começou a ${LICENCAS[prox]}: ${CURSO_LICENCA[prox].semanas} semanas de estudo.` };
}

// ------------------------------------------------------------------ mercado de técnicos (trocar de clube)
/** Um clube maior que toparia contratar você agora (pela reputação e pela licença, com a folga de quem é lenda). */
export function clubeQueQuer(pacote: PacoteDados, s: SaveTecnico, rng: RNG): string | undefined {
  const w = mundo(pacote), meu = w.clube[s.clubeId]?.forca ?? 60, lic = licencaT(s) + toleranciaLicenca(s.tecnico.prestigio);
  const l = Object.values(w.clube).filter((c) => c.ligaId !== "SELECOES" && c.id !== s.clubeId && c.forca > meu + 1 && reputacaoExigida(c.forca) <= s.tecnico.reputacao + 4 && licencaExigida(c.forca) <= lic && !infoLiga(c.ligaId).amador)
    .sort((a, b) => b.forca - a.forca).slice(0, 12);
  return l.length ? rng.pick(l).id : undefined;
}
/** Aceitar a proposta: na pré-temporada assume na hora; com a temporada rolando, acerta para a próxima. */
export function aceitarEmprego(pacote: PacoteDados, s: SaveTecnico): { ok: boolean; msg: string; agora: boolean } {
  const o = s.ofertaEmprego;
  if (!o) return { ok: false, msg: "A proposta não está mais de pé.", agora: false };
  const nome = infoClube(pacote, o.clubeId)?.nome ?? o.clubeId;
  s.ofertaEmprego = undefined;
  if (s.semana < SEMANAS_PRE_T || o.vaga) return { ok: true, msg: `Acertado: você é o novo técnico do ${nome}.`, agora: true };
  s.novoClube = o.clubeId;
  s.diretoria.confianca = clamp(s.diretoria.confianca - 10, 0, 100);
  noticia(s, "clube", `Pré-contrato assinado: você assume o ${nome} na próxima temporada. A diretoria atual não gostou de saber.`);
  return { ok: true, msg: `Pré-contrato assinado com o ${nome}. Você termina a temporada aqui e assume lá na próxima.`, agora: false };
}
export function recusarEmprego(pacote: PacoteDados, s: SaveTecnico): { ok: boolean; msg: string } {
  const o = s.ofertaEmprego; s.ofertaEmprego = undefined;
  if (o) { s.diretoria.confianca = clamp(s.diretoria.confianca + 3, 0, 100); noticia(s, "clube", `Você recusou o ${infoClube(pacote, o.clubeId)?.nome}. A diretoria gostou da lealdade.`); }
  return { ok: true, msg: "Proposta recusada. Você fica." };
}
/** Assume outro clube no mesmo mundo e na temporada certa, levando a vida inteira junto (carreira, família, casa,
 *  negócios, prêmios, contatos). Serve para proposta aceita e para recomeçar depois de uma demissão. */
export function assumirNovoClube(pacote: PacoteDados, s: SaveTecnico, clubeId: string, agora = false): SaveTecnico {
  const meioDaTemporada = agora && s.semana >= SEMANAS_PRE_T && !s.demitido;
  const temporada = s.semana < SEMANAS_PRE_T || meioDaTemporada ? s.temporada : s.temporada + 1;
  const t = s.tecnico;
  const n = novaCarreiraTecnico(pacote, { nome: t.nome, nac: t.nac, idade: t.idade, licenca: t.curso?.licenca, idiomas: t.idiomas, ...(t.exJogador ? { exJogador: t.exJogador } : {}), ...(t.prestigio !== undefined ? { prestigio: t.prestigio } : {}),
    continuar: { semente: s.semente, temporada, tabelas: s.tabelasReais } }, clubeId);
  const novidades = n.noticias;
  n.tecnico = { ...t, contrato: s.contratoNovo ?? n.tecnico.contrato };
  for (const k of ["historico", "bio", "contatos", "pausa", "familia", "namoro", "casa", "casaDoJogador", "negocios", "premios", "temporadasElenco", "exAtletas", "tabelasReais", "palmaresT", "titulosCopa"] as const) if (s[k] !== undefined) (n as unknown as Record<string, unknown>)[k] = s[k];
  n.familiaJog = (s.familiaJog ?? []).map((f) => ({ ...f, noClube: false }));
  n.noticias = [...novidades, ...s.noticias].slice(0, 60);
  // no meio da temporada: assume com a liga do clube novo já rolando (a tabela até aqui) e as copas dele
  if (meioDaTemporada) {
    n.semana = s.semana;
    if (n.ligaId === s.ligaId) n.tabela = s.tabela.map((x) => ({ ...x }));
    else { const parcial = tabelaAgora(pacote, { ...n, ligaId: "_" } as SaveTecnico, n.ligaId); if (parcial.length) n.tabela = parcial.map((x) => ({ ...x })); }
    n.vagasT = { ...(s.vagasT ?? {}) }; delete n.vagasT[clubeId];
    n.interesses = {};
    definirExpectativa(pacote, n);
    noticia(n, "diretoria", `Você chega com a temporada em andamento. A diretoria espera: ${n.diretoria.expectativa.texto.toLowerCase()}.`);
  }
  // o curso da licença continua; se o clube novo pede mais, ele paga o próximo
  const precisa = licencaExigida(mundo(pacote).clube[n.clubeId]?.forca ?? 60), cur = (n.tecnico.curso ??= { licenca: 2 });
  if (precisa > cur.licenca && !cur.estudando) { cur.estudando = cur.licenca + 1; cur.progresso = 0; }
  return n;
}
