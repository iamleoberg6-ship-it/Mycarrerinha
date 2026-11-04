// Modo técnico — motor: começo de carreira, a semana (treino, jogo, dinheiro, diretoria), a partida e a virada de temporada.
// O mundo é o mesmo do modo jogador (mesma semente = mesmo mundo); o clube do técnico usa o elenco do save.
import { RNG, clamp } from "../rng.js";
import { evoluirSemana, type Grupo, type Intensidade, type Participacao } from "../atributos.js";
import { forcaDoElenco, novaTabela, ordenar, registrar, rodadasDaLiga, type LinhaTabela, type PacoteDados, type JogadorNPC, type Liga } from "../liga.js";
import { simularPlacar, SHARE_GOL, SHARE_ASSIST } from "../partida.js";
import { mundo, sincronizarMundo, versaoMundo, infoClube, idClube, agentesLivres, LIGAS, type TabelasReais } from "../mundo.js";
import { infoLiga } from "../ligas.js";
import { gerarNome } from "../nomes.js";
import { onzeProvavel } from "../relacoes.js";
import { valorMercado, CAMBIO } from "../mercado.js";
import { curtoBrl } from "../moeda.js";
/** Dinheiro nas mensagens: na moeda que a tela está usando. */
const dinheiroT = (v: number) => curtoBrl(v);
import {
  FORMACOES, FUNCOES, NOME_FUNCAO, atletaDoMundo, custoObra, disponivel, forcaDoTime, formaDe, gerarAtributos, melhorEscalacao, ovrDe, ovrNaVaga, precoIngresso,
  salarioJusto, salarioStaff, taticaPadrao, valorAtleta, type Atleta, type Escalacao, type Funcao, type Membro, type PosT, type Tatica,
} from "./modelo.js";

export const ANO_INICIAL_T = 2026;
export const SEMANAS_PRE_T = 2;
export const CHAVE_TECNICO = "mycarrerinha:tecnico";

export interface Noticia { quando: string; texto: string; tipo: "jogo" | "clube" | "elenco" | "diretoria" | "dinheiro" }
export interface EventoPartida { min: number; tipo: "gol" | "amarelo" | "vermelho" | "lesao" | "sub"; meu: boolean; texto: string }
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
  tecnico: { nome: string; nac: string; idade: number; reputacao: number; exJogador?: { apelido: string; fama: number } };
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
  historico: { t: number; ligaId: string; pos: number; n: number; pts: number; esperado: number; campeao?: boolean }[];
  tabelasReais: TabelasReais;
  demitido?: string;
  /** contratados nesta temporada (agentes livres não voltam a aparecer) */ recusas: string[];
  /** mercado: jogadores à venda, propostas recebidas, negociações em andamento e o histórico */
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
  return [...(w.liga[ligaId]?.clubes ?? [])].sort((a, b) => b.forca - a.forca).map((c) => ({ id: c.id, nome: w.info[c.id]?.nome ?? c.nome, forca: Math.round(c.forca), exige: reputacaoExigida(c.forca) }));
}
export interface DadosTecnico { nome: string; nac: string; idade: number; exJogador?: { apelido: string; fama: number } }
export const reputacaoInicial = (d: DadosTecnico) => Math.round(d.exJogador ? clamp(22 + d.exJogador.fama * 0.55, 22, 75) : 20);

export function novaCarreiraTecnico(pacote: PacoteDados, d: DadosTecnico, clubeId: string, semente = `tec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`): SaveTecnico {
  sincronizarMundo(pacote, semente, 0, 0, {}, 0);
  const w = mundo(pacote), c = w.clube[idClube(clubeId)], info = infoClube(pacote, c.id), ligaId = info.ligaId, l = w.liga[ligaId], li = infoLiga(ligaId);
  const s: SaveTecnico = {
    versao: 1, modo: "tecnico", semente, tecnico: { nome: d.nome, nac: d.nac, idade: d.idade, reputacao: reputacaoInicial(d), ...(d.exJogador ? { exJogador: d.exJogador } : {}) },
    clubeId: c.id, ligaId, temporada: 0, semana: 0, ordem: l.clubes.map((x) => x.id), tabela: novaTabela(l), rodadas: {},
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
  for (const f of FUNCOES) s.staff[f] = candidatos(s, f, `inicio`, clamp(nivelClube - 1 + rng.int(0, 1), 1, 4))[0];
  s.esc = melhorEscalacao(s.elenco, s.tatica.formacao);
  definirExpectativa(pacote, s);
  noticia(s, "clube", `${d.nome} é o novo técnico do ${info.nome}. A diretoria espera: ${s.diretoria.expectativa.texto.toLowerCase()}.`);
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
  return Array.from({ length: 4 }, (_, i) => {
    const nivel = clamp(Math.round(centro + (i === 0 ? 0 : rng.normal(0, 1))), 1, 5), nac = rng.chance(0.7) ? pais : rng.pick(["BRA", "ARG", "POR", "ESP", "ITA", "ENG", "GER", "FRA", "NED", "URU"]);
    return { nome: gerarNome(rng, nac.length === 3 ? nac : "BRA", usados), nac, idade: rng.int(31, 64), nivel, salario: salarioStaff(nivel, fL) };
  }).sort((a, b) => b.nivel - a.nivel);
}
export function contratarStaff(s: SaveTecnico, f: Funcao, nome: string): { ok: boolean; msg: string } {
  const m = candidatos(s, f).find((x) => x.nome === nome);
  if (!m) return { ok: false, msg: "Esse profissional já acertou com outro clube." };
  const atual = s.staff[f], multa = atual ? atual.salario * 3 : 0;
  if (s.clube.saldo < multa + m.salario * 3) return { ok: false, msg: "O clube não tem caixa para essa troca agora." };
  if (atual) { s.clube.saldo -= multa; gastar(s, "rescisões", multa); }
  s.staff[f] = m;
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
function fecharMes(s: SaveTecnico) {
  const manut = Math.round(s.clube.capacidade * 10 * Math.max(0.4, fLigaDe(s)));
  const rec = { ...s.mes.receitas, "TV": s.clube.tv, "Patrocínio": s.clube.patrocinio };
  const des = { ...s.mes.despesas, "Salários do elenco": folhaDe(s), "Comissão técnica": folhaStaff(s), "Manutenção": manut };
  const saldoMes = Object.values(rec).reduce((a, b) => a + b, 0) - Object.values(des).reduce((a, b) => a + b, 0);
  // o que já entrou ou saiu ao longo do mês (bilheteria, rescisões, obras) já mexeu no saldo
  s.clube.saldo += s.clube.tv + s.clube.patrocinio - folhaDe(s) - folhaStaff(s) - manut;
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
  const forma = formaDe(a), aux = nivelStaff(s, "auxiliar"), rng = rngT(s, "conversa", a.id), sorte = rng.next() + aux * 0.04 + (a.relacao - 50) / 200;
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
function tirarDoElenco(s: SaveTecnico, id: string) {
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
function jogarPartida(pacote: PacoteDados, s: SaveTecnico, adv: string, souCasa: boolean, rodada: number, rng: RNG): Relatorio {
  const w = mundo(pacote), cAdv = w.clube[adv], fAdv = cAdv?.forca ?? 65, por = new Map(s.elenco.map((a) => [a.id, a]));
  const vagas = FORMACOES[s.tatica.formacao], tat = s.tatica, ent = s.entrosamento[tat.formacao] ?? 40;
  const f = forcaDoTime(s.elenco, s.esc, tat, ent);
  const atk = 0.65 * f.ataque + 0.35 * f.meio, def = 0.7 * f.defesa + 0.3 * f.meio, m = tat.mentalidade - 2, aberto = 1 + 0.03 * (tat.ritmo - 1);
  const lMe = ((souCasa ? 1.3 : 1.02) * Math.exp((atk - fAdv) / 15) + (souCasa ? 0.2 : 0)) * (1 + 0.04 * m) * aberto;
  const lAdv = ((souCasa ? 1.02 : 1.3) * Math.exp((fAdv - def) / 15) + (souCasa ? 0 : 0.2)) * (1 + 0.035 * m) * aberto;
  const eventos: EventoPartida[] = [];
  // quem está em campo em cada minuto: titulares e as trocas (automáticas, pelo cansaço, a partir dos 60')
  type EmCampo = { a: Atleta; pos: PosT; ent: number; sai: number };
  const campo: EmCampo[] = vagas.map((v, i) => ({ a: por.get(s.esc.titulares[i] ?? "")!, pos: v.pos, ent: 0, sai: 90 })).filter((x) => x.a);
  const banco = s.esc.reservas.map((id) => por.get(id)!).filter((a) => a && disponivel(a));
  let trocas = 0;
  for (const x of [...campo].sort((p, q) => p.a.condicao - q.a.condicao)) {
    if (trocas >= 3 || x.a.condicao >= 72 || x.pos === "GOL") continue;
    const sub = banco.filter((b) => !campo.some((c) => c.a.id === b.id)).sort((p, q) => ovrNaVaga(q, x.pos) - ovrNaVaga(p, x.pos))[0];
    if (!sub || ovrNaVaga(sub, x.pos) < ovrNaVaga(x.a, x.pos) - 8) continue;
    const min = rng.int(58, 80);
    x.sai = min; campo.push({ a: sub, pos: x.pos, ent: min, sai: 90 }); trocas++;
    eventos.push({ min, tipo: "sub", meu: true, texto: `Sai ${x.a.nome}, entra ${sub.nome}` });
  }
  const noCampo = (min: number) => campo.filter((x) => x.ent <= min && x.sai > min);
  const peso = <T>(lista: T[], w: (x: T) => number) => { const t = lista.reduce((a, x) => a + w(x), 0); let r = rng.next() * t; for (const x of lista) { r -= w(x); if (r <= 0) return x; } return lista[lista.length - 1]; };
  const stats = new Map<string, { gols: number; assist: number; amarelo: number; vermelho: boolean }>();
  const st = (id: string) => { let x = stats.get(id); if (!x) { x = { gols: 0, assist: 0, amarelo: 0, vermelho: false }; stats.set(id, x); } return x; };
  // cartões e expulsões (o vermelho tira o jogador e pesa no resto do jogo)
  let expulsoMin = 99;
  for (const x of campo) {
    const pAm = 0.075 * (0.6 + x.a.temp / 20) * (1 + 0.25 * (tat.pressao - 1)) * ((x.sai - x.ent) / 90);
    if (rng.chance(pAm)) { const min = rng.int(x.ent + 1, Math.max(x.ent + 1, x.sai - 1)); st(x.a.id).amarelo++; eventos.push({ min, tipo: "amarelo", meu: true, texto: `Amarelo para ${x.a.nome}` }); }
    if (rng.chance(0.005 * (0.5 + x.a.temp / 20)) && expulsoMin === 99) { const min = rng.int(Math.max(10, x.ent + 1), 88); st(x.a.id).vermelho = true; x.sai = Math.min(x.sai, min); expulsoMin = min; eventos.push({ min, tipo: "vermelho", meu: true, texto: `Expulso: ${x.a.nome}` }); }
  }
  const fatorExpulsao = expulsoMin < 99 ? (90 - expulsoMin) / 90 : 0;
  const gMe = rng.poisson(lMe * (1 - 0.3 * fatorExpulsao)), gAdv = rng.poisson(lAdv * (1 + 0.35 * fatorExpulsao));
  // gols do time do técnico: quem marca e quem dá o passe
  for (let g = 0; g < gMe; g++) {
    const min = rng.int(1, 90), ali = noCampo(min);
    if (!ali.length) continue;
    const autor = peso(ali, (x) => x.pos === "GOL" ? 0.001 : SHARE_GOL[x.pos as keyof typeof SHARE_GOL] * Math.pow(x.a.at.FIN / 70, 1.5));
    st(autor.a.id).gols++;
    let txt = `Gol de ${autor.a.nome}`;
    if (rng.chance(0.74)) {
      const outros = ali.filter((x) => x !== autor);
      if (outros.length) { const p = peso(outros, (x) => x.pos === "GOL" ? 0.01 : SHARE_ASSIST[x.pos as keyof typeof SHARE_ASSIST] * Math.pow(Math.max(x.a.at.PAS, x.a.at.CRU) / 70, 1.5)); st(p.a.id).assist++; txt += ` (passe de ${p.a.nome})`; }
    }
    eventos.push({ min, tipo: "gol", meu: true, texto: txt });
  }
  // gols do adversário: os titulares prováveis dele
  const onzeAdv = cAdv ? onzeProvavel(cAdv.elenco) : [];
  for (let g = 0; g < gAdv; g++) {
    const min = rng.int(1, 90);
    const autor = onzeAdv.length ? peso(onzeAdv, (j) => j.posicao === "GOL" ? 0.001 : SHARE_GOL[j.posicao as keyof typeof SHARE_GOL] * Math.pow(j.ovr / 70, 1.5)) : undefined;
    eventos.push({ min, tipo: "gol", meu: false, texto: `Gol ${autor ? `de ${autor.nome}` : "do adversário"}` });
  }
  // lesões (o preparador físico reduz o risco; o médico encurta)
  const prep = nivelStaff(s, "preparador"), med = nivelStaff(s, "medico"), lesoes: { a: Atleta; semanas: number; tipo: string }[] = [];
  for (const x of campo) {
    const p = 0.016 * (1 + (100 - x.a.condicao) / 70) * (1 - 0.06 * prep) * (tat.ritmo === 2 ? 1.2 : 1) * (x.a.idade >= 31 ? 1.2 : 1) * ((x.sai - x.ent) / 90);
    if (!rng.chance(p)) continue;
    const r = rng.next(), base = r < 0.65 ? rng.int(1, 2) : r < 0.93 ? rng.int(3, 6) : rng.int(10, 24), semanas = Math.max(1, Math.round(base * (1 - 0.08 * med)));
    const tipo = semanas <= 2 ? "Lesão muscular leve" : semanas <= 6 ? "Estiramento" : rng.pick(["Lesão no joelho", "Fratura no pé", "Ruptura no tornozelo"]);
    lesoes.push({ a: x.a, semanas, tipo });
    eventos.push({ min: rng.int(Math.max(x.ent + 1, 5), Math.max(x.ent + 2, x.sai - 1)), tipo: "lesao", meu: true, texto: `${x.a.nome} se machucou (${tipo.toLowerCase()})` });
  }
  eventos.sort((a, b) => a.min - b.min);
  // notas
  const meus = souCasa ? gMe : gAdv, golsMeus = gMe, golsDeles = gAdv, res = golsMeus > golsDeles ? 0.4 : golsMeus < golsDeles ? -0.4 : 0;
  const notas: NotaPartida[] = campo.map((x) => {
    const minutos = x.sai - x.ent, e = st(x.a.id), ef = ovrNaVaga(x.a, x.pos) * (0.85 + 0.15 * x.a.condicao / 100);
    let n = 6.0 + 0.035 * (ef - fAdv) + 1.0 * e.gols + 0.6 * e.assist + res + rng.normal(0, 0.5);
    if ((x.pos === "GOL" || x.pos === "ZAG" || x.pos === "LAT") && golsDeles === 0) n += x.pos === "GOL" ? 0.7 : 0.4;
    if (x.pos === "GOL" && golsDeles >= 2) n -= 0.3 * (golsDeles - 1);
    if (e.vermelho) n -= 1.2;
    if (minutos < 30) n = 6 + (n - 6) * 0.5;
    return { id: x.a.id, nome: x.a.nome, pos: x.pos, nota: Math.round(clamp(n, 3, 10) * 10) / 10, min: minutos, gols: e.gols, assist: e.assist };
  });
  void meus;
  const melhor = [...notas].sort((a, b) => b.nota - a.nota)[0];
  // aplica no elenco: jogos, gols, notas, cartões, suspensões, lesões, cansaço
  for (const x of campo) {
    const a = x.a, e = st(a.id), n = notas.find((y) => y.id === a.id)!;
    a.jogos++; a.gols += e.gols; a.assist += e.assist; a.notas = [...a.notas, n.nota].slice(-10); a.semJogar = 0;
    if (e.amarelo) { a.amarelos += e.amarelo; a.amarelosT += e.amarelo; if (a.amarelos >= 3) { a.amarelos = 0; a.suspenso = 1; } }
    if (e.vermelho) { a.vermelhosT++; a.suspenso = rng.int(1, 2); }
    a.condicao = clamp(a.condicao - ((x.sai - x.ent) / 90) * (24 + 5 * tat.pressao + 3 * tat.ritmo) * (1 - 0.04 * prep), 15, 100);
    const resultado = golsMeus > golsDeles ? 4 : golsMeus === golsDeles ? 0.5 : -2.5;
    a.moral = clamp(a.moral + resultado + (n.nota - 6.5) * 1.5, 0, 100);
  }
  for (const l of lesoes) { l.a.lesao = l.semanas; l.a.lesaoTipo = l.tipo; }
  const posse = Math.round(clamp(50 + (f.meio - fAdv) * 1.1 + m * 2 + (tat.pressao - 1) * 2, 28, 72));
  const chutes: [number, number] = [gMe + rng.poisson(2.5 + lMe * 2.8), gAdv + rng.poisson(2.5 + lAdv * 2.8)];
  return {
    rodada, casa: souCasa ? s.clubeId : adv, fora: souCasa ? adv : s.clubeId, gc: souCasa ? gMe : gAdv, gf: souCasa ? gAdv : gMe, souCasa,
    eventos, notas, posse, chutes, melhor: melhor?.nome,
  };
}

// ------------------------------------------------------------------ a semana
export interface ResumoSemanaT { eventos: string[]; partida?: Relatorio; fimDeTemporada?: string }
export function avancarSemana(pacote: PacoteDados, s: SaveTecnico): ResumoSemanaT {
  if (s.demitido) return { eventos: [] };
  prepararMundo(pacote, s);
  const eventos: string[] = [], ab = semanaAbs(s), li = infoLiga(s.ligaId), w = mundo(pacote);
  let partida: Relatorio | undefined;
  const r = s.semana - SEMANAS_PRE_T, rodadas = rodadasDaLiga(s.ordem.length);
  const titularesIds = new Set<string>(), entraram = new Set<string>();
  if (r >= 0 && r < rodadas.length) {
    eventos.push(...conferirEscalacao(s));
    // quem estava suspenso cumpre agora
    const cumpriram = s.elenco.filter((a) => a.suspenso > 0);
    const rng = rngT(s, "rodada");
    const jogos: [string, string, number, number][] = [];
    for (const [ia, ib] of rodadas[r]) {
      const casa = s.ordem[ia], fora = s.ordem[ib];
      if (casa === s.clubeId || fora === s.clubeId) {
        const souCasa = casa === s.clubeId;
        partida = jogarPartida(pacote, s, souCasa ? fora : casa, souCasa, r, rngT(s, "partida"));
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
  const ct = s.clube.ctNivel, gol = nivelStaff(s, "goleiros"), prep = nivelStaff(s, "preparador");
  for (const a of s.elenco) {
    const participacao: Participacao = a.lesao > 0 ? "ferias" : titularesIds.has(a.id) ? "titular" : entraram.has(a.id) ? "entrou" : "naoJogou";
    a.at = evoluirSemana(a.at, a.pot, { idade: a.idade, foco: s.treino.foco, intensidade: s.treino.intensidade, participacao, moral: a.moral, personalTrainer: false, profissionalismo: a.prof, fClube: (0.88 + 0.05 * ct) * (a.pos === "GOL" ? 1 + 0.08 * gol : 1) });
    const rec = s.treino.intensidade === "alta" ? 18 : s.treino.intensidade === "leve" ? 34 : 26;
    a.condicao = a.lesao > 0 ? clamp(a.condicao, 0, 75) : clamp(a.condicao + rec + 2 * prep, 0, 100);
    if (a.lesao > 0) { a.lesao--; if (a.lesao === 0) { eventos.push(`${a.nome} está recuperado.`); a.lesaoTipo = undefined; } }
    a.moral = clamp(a.moral + (62 - a.moral) * 0.08, 0, 100);
    if (a.moral < 20 && !a.querSair) { a.querSair = true; noticia(s, "elenco", `${a.nome} está insatisfeito e pediu para sair do clube.`); }
    if (a.querSair && a.moral >= 45) a.querSair = false;
  }
  for (const [f, v] of Object.entries(s.entrosamento)) s.entrosamento[f] = f === s.tatica.formacao ? clamp(v + (s.treino.foco === "tatico" ? 3 : 1) + 0.3 * nivelStaff(s, "auxiliar"), 0, 100) : clamp(v - 0.4, 30, 100);
  // reta final: aviso de contrato acabando (uma vez)
  if (r === nRodadasT(s) - 8) for (const a of s.elenco.filter((x) => x.contratoAte <= s.temporada)) { noticia(s, "elenco", `O contrato de ${a.nome} termina no fim da temporada. Renove no Elenco ou ele vai embora.`); eventos.push(`Contrato de ${a.nome} acaba no fim da temporada.`); }
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
    fecharMes(s);
    const pos = ordenar(s.tabela).findIndex((t) => t.clube === s.clubeId) + 1;
    if (r > 4) s.diretoria.confianca = clamp(s.diretoria.confianca + (pos <= s.diretoria.expectativa.pos ? 2 : pos > s.diretoria.expectativa.pos + 4 ? -3 : 0), 0, 100);
  }
  if (s.diretoria.confianca < 8 && r > 6) {
    s.demitido = `Demitido na ${rotuloSemanaT(s).toLowerCase()}: a diretoria perdeu a confiança no trabalho.`;
    noticia(s, "diretoria", s.demitido);
    return { eventos: [...eventos, s.demitido], partida };
  }
  propostasDaSemana(pacote, s, eventos);
  s.semana++;
  let fim: string | undefined;
  if (s.semana >= semanasDaTemporada(s)) fim = virarTemporada(pacote, s);
  else prepararMundo(pacote, s);
  return { eventos, partida, fimDeTemporada: fim };
}
const media = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// ------------------------------------------------------------------ virada de temporada
function virarTemporada(pacote: PacoteDados, s: SaveTecnico): string {
  const t = s.temporada, final = ordenar(s.tabela), n = final.length, pos = final.findIndex((x) => x.clube === s.clubeId) + 1, li = infoLiga(s.ligaId);
  const esperado = s.diretoria.expectativa.pos, campeao = pos === 1;
  // premiação
  const premio = Math.round(s.clube.tv * (3 * (1 - (pos - 1) / Math.max(1, n - 1)) + (campeao ? 3 : 0)));
  s.clube.saldo += premio; receber(s, "Premiação", premio);
  const diff = esperado - pos;
  s.diretoria.confianca = clamp(s.diretoria.confianca + clamp(diff * 4, -25, 25) + (campeao ? 15 : 0), 0, 100);
  s.tecnico.reputacao = clamp(s.tecnico.reputacao + clamp(diff, -6, 8) + (campeao ? 8 : 0) + 1, 0, 100);
  s.historico.push({ t, ligaId: s.ligaId, pos, n, pts: final[pos - 1]?.pts ?? 0, esperado, ...(campeao ? { campeao: true } : {}) });
  s.tabelasReais[t] = { ligaId: s.ligaId, ordem: final.map((x) => x.clube) };
  const resumo = `${ANO_INICIAL_T + t}: ${pos}º lugar na ${li.curto}${campeao ? " — CAMPEÃO!" : ""} (a diretoria esperava ${esperado}º).`;
  noticia(s, "clube", resumo);
  if (s.diretoria.confianca < 15) { s.demitido = `Demitido no fim de ${ANO_INICIAL_T + t}: a campanha ficou longe do que a diretoria esperava.`; noticia(s, "diretoria", s.demitido); return resumo; }
  // contratos que acabam e aposentadorias
  const rng = new RNG(`${s.semente}|virada|${t}`);
  for (const a of [...s.elenco]) {
    if (a.contratoAte <= t) { tirarDoElenco(s, a.id); noticia(s, "elenco", `${a.nome} deixa o clube: o contrato acabou.`); continue; }
    if (a.idade >= 34 && rng.chance((a.idade - 33) * 0.2)) { tirarDoElenco(s, a.id); noticia(s, "elenco", `${a.nome} pendura as chuteiras aos ${a.idade} anos.`); }
  }
  for (const a of s.elenco) { a.idade++; a.jogos = 0; a.gols = 0; a.assist = 0; a.amarelosT = 0; a.vermelhosT = 0; a.amarelos = 0; a.suspenso = 0; a.notas = []; a.condicao = 100; a.promessa = undefined; a.moral = Math.round(a.moral * 0.5 + 32); a.querSair = false; a.semJogar = 0; }
  s.temporada++; s.semana = 0; s.rodadas = {}; s.recusas = []; s.propostas = []; s.negociacoes = {};
  // o mundo vira a temporada (com a tabela da liga do técnico valendo para o acesso e o rebaixamento)
  sincronizarMundo(pacote, s.semente, s.temporada, 0, s.tabelasReais, 0);
  const w = mundo(pacote), ligaNova = w.info[s.clubeId]?.ligaId ?? s.ligaId;
  if (ligaNova !== s.ligaId) {
    const subiu = infoLiga(ligaNova).divisao < li.divisao;
    s.clube.tv = Math.round(s.clube.tv * infoLiga(ligaNova).fLiga / li.fLiga);
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
  const limite = fMeu + 6 + s.tecnico.reputacao / 12;
  if (a.ovr > limite) return { topa: false, motivo: `${a.nome} acha o seu clube pequeno para ele.`, salario };
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
