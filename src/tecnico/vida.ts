// A vida em volta do técnico: prêmios (técnico do mês, craque do mês do elenco, técnico e artilheiro do ano), eventos com
// escolha (coletiva, jogador pedindo aumento, briga no vestiário, protesto, proposta de outro clube, amigo da época de
// jogador) e os contatos herdados da carreira de jogador, que facilitam contratar quem já foi seu parceiro.
import { RNG, clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { mundo, infoClube, tecnicoDoClube, rankingDaLiga } from "../mundo.js";
import type { SaveTecnico } from "./motor.js";
import { ovrDe, type Atleta } from "./modelo.js";

export interface Premio { t: number; nome: string; texto: string }
export interface Contato { nome: string; nivel: number; tipo: "amigo" | "excompanheiro" | "extecnico" }
/** Quem você foi como jogador (fica na bio do técnico). */
export interface BioJogador { apelido: string; nivel?: string; texto?: string; clubes: string[]; jogos: number; gols: number; assist: number; titulos: number; aposentouEm: number; idade: number; recordes?: string[]; premios?: string[] }
/** Filho ou irmão que ainda joga: dá para levar para o seu time. */
export interface FamiliarJogador { nome: string; parentesco: string; idade: number; ovr: number; pot: number; pos: "GOL" | "ZAG" | "LAT" | "VOL" | "MEI" | "PON" | "ATA"; clubeId?: string; fase: string; noClube?: boolean }
export interface OpcaoEventoT { id: string; rotulo: string }
export interface EventoT { id: string; titulo: string; texto: string; opcoes: OpcaoEventoT[]; alvo?: string; extra?: string }

const nomeClube = (pacote: PacoteDados, id: string) => infoClube(pacote, id)?.nome ?? id;
const nota = (s: SaveTecnico, tipo: "clube" | "elenco" | "diretoria" | "dinheiro" | "jogo", texto: string) => { s.noticias.unshift({ quando: `Semana ${s.semana + 1}`, texto, tipo }); s.noticias = s.noticias.slice(0, 60); };
const premiar = (s: SaveTecnico, nome: string, texto: string) => { (s.premios ??= []).unshift({ t: s.temporada, nome, texto }); s.premios = s.premios.slice(0, 80); };

// ------------------------------------------------------------------ prêmios
/** Fecha o mês: técnico do mês da liga (mais pontos nas últimas rodadas) e o craque do mês do seu elenco. */
export function premiosDoMes(pacote: PacoteDados, s: SaveTecnico): string[] {
  const rodadas = Object.keys(s.rodadas).map(Number).sort((a, b) => b - a).slice(0, 4);
  if (rodadas.length < 3) return [];
  const pts: Record<string, number> = {};
  for (const r of rodadas) for (const [c, f, gc, gf] of s.rodadas[r]) { pts[c] = (pts[c] ?? 0) + (gc > gf ? 3 : gc === gf ? 1 : 0); pts[f] = (pts[f] ?? 0) + (gf > gc ? 3 : gc === gf ? 1 : 0); }
  const melhor = Object.entries(pts).sort((a, b) => b[1] - a[1] || (a[0] === s.clubeId ? -1 : 1))[0];
  const av: string[] = [];
  if (melhor && melhor[0] === s.clubeId) {
    premiar(s, "Técnico do mês", `${melhor[1]} pontos em ${rodadas.length} jogos`);
    s.tecnico.reputacao = clamp(s.tecnico.reputacao + 2, 0, 100); s.diretoria.confianca = clamp(s.diretoria.confianca + 3, 0, 100);
    av.push(`🏆 Você foi eleito o técnico do mês: ${melhor[1]} pontos em ${rodadas.length} jogos.`); nota(s, "clube", av[av.length - 1]);
  } else if (melhor) {
    const t = tecnicoDoClube(pacote, melhor[0]);
    nota(s, "clube", `Técnico do mês: ${t?.nome ?? "o técnico"} (${nomeClube(pacote, melhor[0])}), com ${melhor[1]} pontos.`);
  }
  // craque do mês do elenco: melhor média de notas recentes (com pelo menos 3 jogos)
  const craque = [...s.elenco].filter((a) => a.notas.length >= 3).map((a) => ({ a, m: a.notas.slice(-4).reduce((x, y) => x + y, 0) / Math.min(4, a.notas.length) })).sort((x, y) => y.m - x.m)[0];
  if (craque && craque.m >= 7) {
    craque.a.moral = clamp(craque.a.moral + 6, 0, 100);
    premiar(s, "Craque do mês do elenco", `${craque.a.nome} (média ${craque.m.toFixed(1)})`);
    nota(s, "elenco", `${craque.a.nome} é o craque do mês do elenco, com média ${craque.m.toFixed(1)}.`);
  }
  return av;
}
/** Artilharia e assistências da liga com o seu elenco no meio (o mundo não sabe dos números do seu time). */
export function rankingT(pacote: PacoteDados, s: SaveTecnico, tipo: "g" | "a", limite = 10): { nome: string; clubeId: string; valor: number; jogos: number; meu: boolean }[] {
  const feitas = Object.keys(s.rodadas).length;
  const mundoL = rankingDaLiga(pacote, s.ligaId, feitas, tipo, 40).filter((x) => x.clubeId !== s.clubeId).map((x) => ({ ...x, meu: false }));
  const meus = s.elenco.filter((a) => (tipo === "g" ? a.gols : a.assist) > 0).map((a) => ({ nome: a.nome, clubeId: s.clubeId, valor: tipo === "g" ? a.gols : a.assist, jogos: a.jogos, meu: true }));
  return [...mundoL, ...meus].sort((a, b) => b.valor - a.valor || a.jogos - b.jogos).slice(0, limite);
}
/** Prêmios da temporada (na virada): técnico do ano da liga e artilheiro. */
export function premiosDoAno(pacote: PacoteDados, s: SaveTecnico, pos: number, esperado: number): string[] {
  const av: string[] = [];
  const superou = esperado - pos;
  if (pos === 1 || superou >= 5) {
    premiar(s, "Técnico do ano", pos === 1 ? "Campeão da liga" : `${pos}º lugar com um time de ${esperado}º`);
    s.tecnico.reputacao = clamp(s.tecnico.reputacao + 4, 0, 100);
    av.push("🏆 Você foi eleito o técnico do ano da liga.");
  }
  const art = rankingT(pacote, s, "g", 1)[0];
  if (art) {
    if (art.meu) { premiar(s, "Artilheiro da liga (seu elenco)", `${art.nome}, ${art.valor} gols`); const a = s.elenco.find((x) => x.nome === art.nome); if (a) a.moral = clamp(a.moral + 10, 0, 100); }
    av.push(`Artilheiro da liga: ${art.nome} (${nomeClube(pacote, art.clubeId)}), ${art.valor} gols.`);
  }
  for (const x of av) nota(s, "clube", x);
  return av;
}

// ------------------------------------------------------------------ eventos com escolha
/** Sorteia um evento da semana (no máximo um por vez, nem toda semana). */
export function sortearEvento(pacote: PacoteDados, s: SaveTecnico, rng: RNG): void {
  if (s.evento || s.demitido || !rng.chance(0.32)) return;
  const tab = Object.values(s.rodadas).flat().filter(([c, f]) => c === s.clubeId || f === s.clubeId).slice(-3);
  const derrotas = tab.filter(([c, , gc, gf]) => (c === s.clubeId ? gc < gf : gf < gc)).length;
  const op: [() => EventoT | undefined, number][] = [
    [() => ({ id: "coletiva", titulo: "Coletiva de imprensa", texto: derrotas >= 2 ? `"Professor, foram ${derrotas} derrotas nos últimos jogos. O elenco é fraco ou a culpa é sua?"` : `"Professor, o time vem bem. Dá para sonhar alto nesta temporada?"`, opcoes: [{ id: "defender", rotulo: "Defender o elenco" }, { id: "cobrar", rotulo: "Cobrar os jogadores em público" }, { id: "humilde", rotulo: "Resposta humilde, jogo a jogo" }] }), 3],
    [() => { const a = [...s.elenco].filter((x) => ovrDe(x) >= 70 && x.moral >= 50 && x.salario > 0).sort((x, y) => ovrDe(y) - ovrDe(x))[rng.int(0, 2)]; return a ? { id: "aumento", titulo: `${a.nome} quer aumento`, texto: `O empresário de ${a.nome} pede 20% a mais no salário: "Ele é dos melhores do time e recebe menos que reserva de outro clube."`, opcoes: [{ id: "dar", rotulo: "Dar o aumento" }, { id: "renovacao", rotulo: "Prometer na renovação" }, { id: "negar", rotulo: "Negar" }], alvo: a.id } : undefined; }, 2],
    [() => { const l = rng.shuffle(s.elenco.filter((x) => x.temp >= 12)).slice(0, 2); return l.length === 2 ? { id: "briga", titulo: "Briga no treino", texto: `${l[0].nome} e ${l[1].nome} se estranharam no rachão e precisaram ser separados.`, opcoes: [{ id: "multar", rotulo: "Multar os dois" }, { id: "conversar", rotulo: "Conversar com os dois juntos" }, { id: "ignorar", rotulo: "Deixar passar" }], alvo: l[0].id, extra: l[1].id } : undefined; }, 2],
    [() => derrotas >= 2 ? { id: "protesto", titulo: "Protesto da torcida", texto: "A organizada foi ao CT com faixas cobrando o time e a comissão.", opcoes: [{ id: "receber", rotulo: "Receber os líderes da torcida" }, { id: "ignorar", rotulo: "Ignorar e seguir o trabalho" }] } : undefined, 3],
    [() => { if (s.tecnico.reputacao < 35) return undefined; const w = mundo(pacote), meu = w.clube[s.clubeId]?.forca ?? 60; const c = rng.shuffle(Object.values(w.clube).filter((x) => x.ligaId !== "SELECOES" && x.forca > meu + 2 && x.forca <= meu + 10))[0]; return c ? { id: "proposta", titulo: `O ${c.nome} quer você`, texto: `A diretoria do ${c.nome} sondou seu empresário. O seu clube ficou sabendo.`, opcoes: [{ id: "fiel", rotulo: "Dizer que fica" }, { id: "ouvir", rotulo: "Ouvir a proposta" }], alvo: c.id } : undefined; }, 1],
    [() => { const ct = (s.contatos ?? []).filter((x) => x.tipo !== "extecnico"); const c = ct.length ? rng.pick(ct) : undefined; return c ? { id: "amigo", titulo: `Ligação de ${c.nome}`, texto: `${c.nome}, ${c.tipo === "amigo" ? "seu amigo dos tempos de jogador" : "seu ex-companheiro de time"}, liga para dar os parabéns pelo trabalho e diz que adoraria jogar com você de novo.`, opcoes: [{ id: "convidar", rotulo: "Dizer que a porta está aberta" }, { id: "agradecer", rotulo: "Agradecer e mudar de assunto" }], alvo: c.nome } : undefined; }, 1.5],
    [() => { const a = [...s.elenco].filter((x) => x.idade <= 21 && x.pot >= 75).sort((x, y) => y.pot - x.pot)[0]; return a ? { id: "joia", titulo: `Assédio pela joia ${a.nome}`, texto: `Clubes de fora mandaram olheiros para ver ${a.nome} (${a.idade} anos). O garoto está mexido.`, opcoes: [{ id: "segurar", rotulo: "Garantir que ele é titular do projeto" }, { id: "liberar", rotulo: "Dizer que pode ouvir propostas" }], alvo: a.id } : undefined; }, 1],
  ];
  const tot = op.reduce((x, [, p]) => x + p, 0); let r = rng.next() * tot;
  for (const [f, p] of op) { r -= p; if (r <= 0) { const e = f(); if (e) s.evento = e; return; } }
}
/** A escolha do técnico: mexe em moral, relação, confiança, torcida e reputação. */
export function responderEvento(pacote: PacoteDados, s: SaveTecnico, op: string): string {
  const e = s.evento; if (!e) return "";
  s.evento = undefined;
  const a = s.elenco.find((x) => x.id === e.alvo), b = s.elenco.find((x) => x.id === e.extra);
  const todos = (d: number) => { for (const x of s.elenco) x.moral = clamp(x.moral + d, 0, 100); };
  const conf = (d: number) => { s.diretoria.confianca = clamp(s.diretoria.confianca + d, 0, 100); };
  const torc = (d: number) => { s.clube.torcida = clamp(s.clube.torcida + d, 0, 100); };
  let r = "";
  switch (`${e.id}:${op}`) {
    case "coletiva:defender": todos(4); conf(-1); r = "O vestiário gostou de ver o técnico do lado dele."; break;
    case "coletiva:cobrar": todos(-4); conf(2); torc(2); r = "A torcida aprovou a cobrança. No vestiário, caras fechadas."; break;
    case "coletiva:humilde": todos(1); r = "Resposta sem polêmica. Ninguém reclamou."; break;
    case "aumento:dar": if (a) { a.salario = Math.round(a.salario * 1.2 / 100) * 100; a.moral = clamp(a.moral + 12, 0, 100); a.relacao = clamp(a.relacao + 10, 0, 100); } r = `${a?.nome ?? "Ele"} ficou feliz. A folha subiu.`; break;
    case "aumento:renovacao": if (a) { a.moral = clamp(a.moral + 3, 0, 100); a.relacao = clamp(a.relacao + 2, 0, 100); } r = "Ele aceitou esperar a renovação, mas vai cobrar."; break;
    case "aumento:negar": if (a) { a.moral = clamp(a.moral - 12, 0, 100); a.relacao = clamp(a.relacao - 10, 0, 100); } r = `${a?.nome ?? "Ele"} não gostou nada.`; break;
    case "briga:multar": for (const x of [a, b]) if (x) { x.moral = clamp(x.moral - 6, 0, 100); x.relacao = clamp(x.relacao - 4, 0, 100); } todos(1); conf(1); r = "Multa aplicada. O grupo entendeu o recado."; break;
    case "briga:conversar": for (const x of [a, b]) if (x) { x.moral = clamp(x.moral + 3, 0, 100); x.relacao = clamp(x.relacao + 5, 0, 100); } r = "Conversa franca. Os dois apertaram as mãos."; break;
    case "briga:ignorar": for (const f of Object.keys(s.entrosamento)) s.entrosamento[f] = clamp(s.entrosamento[f] - 4, 0, 100); r = "O clima no grupo azedou e o entrosamento sentiu."; break;
    case "protesto:receber": torc(6); todos(-1); r = "Conversa tensa, mas a torcida saiu mais calma."; break;
    case "protesto:ignorar": torc(-5); conf(-2); r = "A torcida ficou ainda mais irritada."; break;
    case "proposta:fiel": conf(5); torc(4); s.tecnico.reputacao = clamp(s.tecnico.reputacao + 1, 0, 100); r = "A diretoria e a torcida gostaram da lealdade."; break;
    case "proposta:ouvir": conf(-8); s.tecnico.reputacao = clamp(s.tecnico.reputacao + 2, 0, 100); r = "A notícia vazou e a diretoria ficou desconfiada. Seu nome ficou mais valorizado no mercado."; break;
    case "amigo:convidar": { const c = (s.contatos ?? []).find((x) => x.nome === e.alvo); if (c) c.nivel = clamp(c.nivel + 8, 0, 100); r = `${e.alvo} ficou animado. Se ele estiver no mercado, vai topar conversar mais fácil.`; break; }
    case "amigo:agradecer": r = "Papo bom, coisa de velhos amigos."; break;
    case "joia:segurar": if (a) { a.moral = clamp(a.moral + 8, 0, 100); a.relacao = clamp(a.relacao + 8, 0, 100); } r = "O garoto ficou. Agora ele espera jogar."; break;
    case "joia:liberar": if (a) { a.moral = clamp(a.moral - 4, 0, 100); if (!(s.aVenda ??= []).includes(a.id)) s.aVenda.push(a.id); } r = "Ele foi colocado à venda. Propostas devem chegar na janela."; break;
  }
  nota(s, "clube", `${e.titulo}: ${r}`);
  return r;
}

// ------------------------------------------------------------------ contatos da carreira de jogador
/** O quanto um contato ajuda a contratar (0 a 1): amigo próximo topa vir mesmo para um clube menor. */
export function forcaDoContato(s: SaveTecnico, nome: string): number {
  const c = (s.contatos ?? []).find((x) => x.nome === nome);
  return c && c.tipo !== "extecnico" ? clamp(c.nivel / 100, 0, 1) : 0;
}
export const TIPO_CONTATO: Record<Contato["tipo"], string> = { amigo: "Amigo", excompanheiro: "Ex-companheiro", extecnico: "Ex-técnico" };
export type { Atleta };
