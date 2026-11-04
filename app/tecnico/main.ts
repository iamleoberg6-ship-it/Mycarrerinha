// Modo técnico: a página. Mesmo mundo e mesmo visual do modo jogador; o save fica em outra chave.
import pacoteJson from "../../data/pacote-brasil-serie-a-v0.3.json";
import type { PacoteDados } from "../../src/liga";
import { ordenar } from "../../src/liga";
import { mundo, infoClube, idClube } from "../../src/mundo";
import { infoLiga } from "../../src/ligas";
import { ATRIBUTOS } from "../../src/atributos";
import { valorBrl, curtoBrl, definirMoeda, numBrl, simboloAtual, moedaAtual, MOEDAS } from "../../src/moeda";
import { svgEscudo } from "../visual/escudos";
import { svgEstadio, aparenciaDoEstadio } from "../visual/estadio";
import { EXTRAS, NOME_EXTRA, DICA_EXTRA } from "../../src/detalhes";
import { funcoesDa, encaixe, estrelasEncaixe } from "../../src/funcoes";
import { NOME_LINGUA, rotuloNivel, linguaDe, nivelEm, idiomasIniciais } from "../../src/idiomas";
/** Do save do jogador aposentado: licença (dos Estudos) e idiomas (nível de 0 a 3 vira 0 a 95). */
type SaveJogador = { jogador: { nome: string; apelido: string; nacionalidade: string; idade: number }; carreira: { encerrada?: unknown; fama: number; estudos?: { idiomas: Record<string, number>; formacoes: string[] } } };
function heranca(jog: SaveJogador): { licenca: number; idiomas: Record<string, number> } {
  const f = jog.carreira.estudos?.formacoes ?? [], licenca = f.includes("Licença Pro de técnico") ? 4 : f.includes("Licença A de técnico") ? 3 : f.includes("Licença B de técnico") ? 2 : f.includes("Licença C de técnico") ? 1 : 0;
  const idiomas = idiomasIniciais(jog.jogador.nome, jog.jogador.nacionalidade, jog.jogador.idade);
  for (const [l, n] of Object.entries(jog.carreira.estudos?.idiomas ?? {})) idiomas[l] = Math.max(idiomas[l] ?? 0, [0, 35, 65, 95][n] ?? 0);
  return { licenca, idiomas };
}
import { LICENCAS, CURSO_LICENCA } from "../../src/licencas";
import { criarAgendador, chaveNuvem, ultimoDaNuvem, nuvemDisponivel } from "../nuvem";
import {
  CHAVE_TECNICO, ANO_INICIAL_T, SEMANAS_PRE_T, avancarSemana, novaCarreiraTecnico, prepararMundo, ligasParaComecar, clubesDaLiga, reputacaoInicial, rotuloSemanaT,
  proximoJogo, folhaDe, folhaStaff, nivelStaff, candidatos, contratarStaff, demitirStaff, custoPedido, pedirDiretoria, conversar, NOME_CONVERSA, pedidoRenovacao,
  renovar, dispensar, agentesLivresT, contratarLivre, trocarNaVaga, mudarFormacao, nRodadasT, semanaAbs,
  janelaT, buscarJogadores, interesseDo, fazerProposta, alvoPorNome, alternarVenda, responderPropostaT,
  iniciarPartida, trocasNoIntervalo, reorganizarNoIntervalo, MAX_TROCAS, recomendarCurso, pagarAulas, estudarLicenca, licencaT, idiomasT,
  type SaveTecnico, type Relatorio, type Conversa, type Pedido, type DadosTecnico,
} from "../../src/tecnico/motor";
import {
  FORMACOES, NOMES_FORMACAO, NOME_MENTALIDADE, NOME_NIVEL3, NOME_AT, NOME_AT_GOL, NOME_POS_T, FUNCOES, NOME_FUNCAO, EFEITO_FUNCAO,
  forcaDoTime, melhorEscalacao, ovrDe, ovrNaVaga, formaDe, disponivel, rotuloEncaixe, valorAtleta, precoIngresso, exDe, idiomasDe, funcaoNaVaga, ovrPos, type Atleta, type PosT, type Funcao,
} from "../../src/tecnico/modelo";

const pacote = pacoteJson as unknown as PacoteDados;
const $ = (id: string) => document.getElementById(id)!;
const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const ler = <T>(k: string): T | null => { try { return JSON.parse(localStorage.getItem(k) ?? "null") as T | null; } catch { return null; } };
const gravar = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } };

let save: SaveTecnico | null = ler<SaveTecnico>(CHAVE_TECNICO);
let aba: "inicio" | "elenco" | "tatica" | "liga" | "clube" = "inicio";
let sub = { elenco: "jogadores", clube: "financas" } as Record<string, string>;
let filtro = "todos";
let filtroMercado: { pos?: PosT; idadeMax?: number; minhaLiga: boolean; alcance: boolean } = { minhaLiga: true, alcance: true };
/** Valor digitado (na moeda da tela) para reais, que é como o jogo guarda. */
const lerValor = (id: string) => { const el = document.getElementById(id) as HTMLInputElement | null, n = +(el?.value ?? "").replace(/\D/g, ""); return n > 0 ? Math.round(n / MOEDAS[moedaAtual()].porBrl) : 0; };
const naTela = (brl: number) => Math.round(numBrl(brl)).toLocaleString("pt-BR");
const campoValor = (id: string, brl: number) => `<label class="campo-valor"><span>${esc(simboloAtual())}</span><input id="${id}" inputmode="numeric" autocomplete="off" value="${naTela(brl)}" aria-label="Valor em ${esc(simboloAtual())}"></label>`;
let anosProposta = 3, msgNeg: { texto: string; ok: boolean; pedido?: number } | undefined;
let msg: { texto: string; ok: boolean } | undefined;
let ligaEscolhida = "BRA1";
/** Técnico demitido procurando clube: leva a reputação e o histórico. */
let anterior: SaveTecnico | null = null;
const nuvem = criarAgendador(() => save ? { chave: chaveNuvem("tec", save.semente), modo: "tecnico", json: JSON.stringify(save), rotulo: `${save.tecnico.nome} · ${infoClube(pacote, save.clubeId)?.nome ?? ""} · ${ANO_INICIAL_T + save.temporada}` } : null);
const salvar = () => { if (save) gravar(CHAVE_TECNICO, save); nuvem.agendar(); };

/** Moeda do país da liga (como nos eventos do modo jogador). */
const EURO = new Set(["POR", "ESP", "ITA", "FRA", "GER", "NED", "BEL", "AUT", "CRO", "IRL", "GRE", "FIN"]);
function moedaDaLiga(ligaId: string) { const p = infoLiga(ligaId).pais; definirMoeda(p === "BRA" ? "BRL" : p === "ENG" || p === "SCO" ? "GBP" : EURO.has(p) ? "EUR" : "USD"); }

const cores = (id: string) => { const i = infoClube(pacote, id); return [i?.cores[0] ?? "#888", i?.cores[1] ?? "#FFF"]; };
const escudo = (id: string, cls = "escudo") => { const [a, b] = cores(id); return svgEscudo(idClube(id), a, b, infoClube(pacote, id)?.nome, cls); };
const nomeClube = (id: string) => infoClube(pacote, id)?.nome ?? id;
const estrelas = (n: number) => `<span class="estrelas" aria-label="nível ${n} de 5">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
const barra = (v: number, cor?: string) => `<span class="mini-barra"><i style="--v:${Math.round(v)}%;--c:${cor ?? (v >= 66 ? "var(--pos)" : v >= 40 ? "var(--ouro)" : "var(--neg)")}"></i></span>`;
const corPos = (p: PosT) => (p === "GOL" ? "#F2B705" : p === "ZAG" || p === "LAT" ? "#4C8BD9" : p === "VOL" || p === "MEI" ? "#3FAE6A" : "#E5534B");

// ------------------------------------------------------------------ início de carreira
function telaInicio(): string {
  const jog = ler<SaveJogador>("mycarrerinha:save");
  const ex = jog?.carreira?.encerrada ? jog : null;
  const d: DadosTecnico = ex ? { nome: ex.jogador.apelido, nac: ex.jogador.nacionalidade, idade: ex.jogador.idade + 1, exJogador: { apelido: ex.jogador.apelido, fama: ex.carreira.fama }, ...heranca(ex) } : { nome: "", nac: "BRA", idade: 38 };
  const lic = anterior ? licencaT(anterior) : Math.max(1, d.licenca ?? 2);
  if (anterior) { d.nome = anterior.tecnico.nome; d.nac = anterior.tecnico.nac; d.idade = anterior.tecnico.idade; }
  const rep = anterior ? anterior.tecnico.reputacao : reputacaoInicial(d), ligas = ligasParaComecar(pacote);
  if (!ligas.some((l) => l.id === ligaEscolhida)) ligaEscolhida = ligas[0]?.id ?? "BRA1";
  const clubes = clubesDaLiga(pacote, ligaEscolhida);
  return `<header class="marca"><strong>Mycarrerinha</strong><span>Técnico</span></header>
    <h1>Carreira de técnico</h1>
    <p class="sub" style="font-size:16px">Monte o time, escolha a tática, cuide do vestiário, das finanças e da estrutura do clube. A diretoria cobra resultado.</p>
    ${anterior ? `<section class="painel"><p class="rotulo">De volta ao mercado</p><h2>${esc(anterior.tecnico.nome)} procura clube</h2><p class="sub">${anterior.historico.length} temporada${anterior.historico.length === 1 ? "" : "s"} de carreira, reputação ${rep}.</p></section>` : ex ? `<section class="painel"><p class="rotulo">Depois das chuteiras</p><h2>${esc(ex.jogador.apelido)} vira técnico</h2><p class="sub">A fama da carreira de jogador abre portas: começa com reputação ${rep}.</p></section>` : ""}
    <section class="painel form-ini">
      <label>Nome do técnico<input id="iNome" value="${esc(d.nome)}" maxlength="28" autocomplete="off" placeholder="Seu nome"></label>
      <label>Nacionalidade<select id="iNac">${["BRA", "ARG", "POR", "ESP", "ITA", "ENG", "GER", "FRA", "NED", "URU", "COL", "MEX", "USA", "JPN"].map((p) => `<option ${p === d.nac ? "selected" : ""}>${p}</option>`).join("")}</select></label>
      <label>Liga<select id="iLiga">${ligas.map((l) => `<option value="${l.id}" ${l.id === ligaEscolhida ? "selected" : ""}>${esc(l.nome)}</option>`).join("")}</select></label>
      <p class="sub">Sua reputação: <b style="color:var(--giz)">${rep}</b> · ${LICENCAS[lic]}. Clubes grandes só aceitam técnico com nome e licença alta; comece por baixo e suba.</p>
    </section>
    <section class="painel"><p class="rotulo">Escolha o clube</p>${clubes.map((c) => {
      const ok = c.exige <= rep && c.licenca <= lic;
      return `<div class="clube-op${ok ? "" : " trancado"}">${escudo(c.id)}<div><b>${esc(c.nome)}</b><br><small class="sub">Força ${c.forca}${c.exige > rep ? ` · exige reputação ${c.exige}` : ""}${c.licenca > lic ? ` · exige ${LICENCAS[c.licenca]}` : ""}</small></div>${ok ? `<button class="botao peq" data-assumir="${c.id}" data-ex="${ex ? 1 : 0}">Assumir</button>` : `<span class="pill">Fechado</span>`}</div>`;
    }).join("")}</section>
    <a class="botao sec" href="index.html">Voltar para a carreira de jogador</a>`;
}

// ------------------------------------------------------------------ cabeçalho e abas
const ICONES: Record<string, string> = {
  inicio: '<path d="M3 11 12 4l9 7v9H3z"/>', elenco: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.4c3 .2 5.5 2.4 5.5 5.6"/>',
  tatica: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M3 12h18"/>', liga: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M12 14v4M8 20h8M17 6h3a3 3 0 0 1-3 4M7 6H4a3 3 0 0 0 3 4"/>',
  clube: '<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>',
};
const ic = (p: string) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
function nav(s: SaveTecnico): string {
  const alertas = s.elenco.filter((a) => a.querSair || (a.contratoAte <= s.temporada && s.semana - SEMANAS_PRE_T >= nRodadasT(s) - 8)).length;
  return `<nav class="abas" role="tablist" aria-label="Menu">${([["inicio", "Início"], ["elenco", "Elenco"], ["tatica", "Tática"], ["liga", "Liga"], ["clube", "Clube"]] as const).map(([k, n]) =>
    `<button class="${aba === k ? "ativo" : ""}" data-aba="${k}" role="tab" aria-selected="${aba === k}"><span class="aba-ico">${ic(ICONES[k])}${k === "elenco" && alertas ? `<i class="aba-badge">${alertas}</i>` : ""}</span><span class="aba-nome">${n}</span></button>`).join("")}</nav>`;
}
function topo(s: SaveTecnico): string {
  const li = infoLiga(s.ligaId), pos = ordenar(s.tabela).findIndex((t) => t.clube === s.clubeId) + 1;
  return `<header class="marca"><strong>Mycarrerinha</strong><span>${esc(rotuloSemanaT(s))}</span></header>
    <section class="painel topo-clube">${escudo(s.clubeId)}<div><b>${esc(nomeClube(s.clubeId))}</b><small>${esc(s.tecnico.nome)} · ${esc(li.curto)}${s.semana >= SEMANAS_PRE_T ? ` · ${pos}º` : ""}</small></div>
      <div class="caixa">Caixa<br><b style="color:${s.clube.saldo < 0 ? "var(--neg)" : "var(--giz)"}">${curtoBrl(s.clube.saldo)}</b></div></section>`;
}
const aviso = () => (msg ? `<p class="aviso-t ${msg.ok ? "ok" : "erro"}" role="status">${esc(msg.texto)}</p>` : "");

// ------------------------------------------------------------------ Início
function abaInicio(s: SaveTecnico): string {
  const pj = proximoJogo(s), w = mundo(pacote), d = s.diretoria, pos = ordenar(s.tabela).findIndex((t) => t.clube === s.clubeId) + 1;
  const f = forcaDoTime(s.elenco, s.esc, s.tatica, s.entrosamento[s.tatica.formacao] ?? 40);
  const jogo = pj ? `<section class="painel"><p class="rotulo">Rodada ${pj.rodada + 1} de ${nRodadasT(s)} · ${pj.souCasa ? "em casa" : "fora"}</p>
      <div class="prox"><div class="lado">${escudo(pj.souCasa ? s.clubeId : pj.adv)}<span>${esc(nomeClube(pj.souCasa ? s.clubeId : pj.adv))}</span></div><span class="x">×</span><div class="lado">${escudo(pj.souCasa ? pj.adv : s.clubeId)}<span>${esc(nomeClube(pj.souCasa ? pj.adv : s.clubeId))}</span></div></div>
      <p class="sub" style="text-align:center">Seu time em campo: <b style="color:var(--giz)">${Math.round(f.geral)}</b> · adversário: <b style="color:var(--giz)">${Math.round(w.clube[pj.adv]?.forca ?? 0)}</b></p>
      ${s.aoVivo ? `<p class="placar-vivo">Intervalo: <b>${s.aoVivo.souCasa ? s.aoVivo.gMe : s.aoVivo.gAdv} × ${s.aoVivo.souCasa ? s.aoVivo.gAdv : s.aoVivo.gMe}</b></p><div class="botoes" style="justify-content:center"><button class="botao sec" data-ver-intervalo>Ver o 1º tempo</button><button class="botao sec" data-aba="tatica">Mexer no time</button></div><button class="botao grande" data-avancar style="margin-top:10px">Jogar o 2º tempo</button>` : `<button class="botao grande" data-primeiro-tempo style="margin-top:10px">Jogar o 1º tempo</button>`}</section>`
    : `<section class="painel"><p class="rotulo">${s.semana < SEMANAS_PRE_T ? "Pré-temporada" : "Fim de temporada"}</p><h2>${s.semana < SEMANAS_PRE_T ? "Treinos e ajustes antes da estreia" : "Última semana do ano"}</h2>
      <p class="sub">${s.semana < SEMANAS_PRE_T ? "Defina a tática e o treino. O entrosamento sobe com o foco tático." : "A temporada fecha: premiação, balanço da diretoria e contratos que acabam."}</p>
      <button class="botao grande" data-avancar style="margin-top:10px">Avançar semana</button></section>`;
  const ult = s.ultima ? `<button class="painel lin" data-ver-partida style="grid-template-columns:1fr auto"><div class="nm"><small>Último jogo · rodada ${s.ultima.rodada + 1}</small><b>${esc(nomeClube(s.ultima.casa))} ${s.ultima.gc} × ${s.ultima.gf} ${esc(nomeClube(s.ultima.fora))}</b></div><span class="pill">Ver relatório ›</span></button>` : "";
  const lesionados = s.elenco.filter((a) => a.lesao > 0), susp = s.elenco.filter((a) => a.suspenso > 0), sair = s.elenco.filter((a) => a.querSair);
  const contratos = s.elenco.filter((a) => a.contratoAte <= s.temporada);
  const alertas = [
    ...lesionados.map((a) => `<span class="pill ruim">${esc(a.nome)} · ${a.lesao} sem.</span>`), ...susp.map((a) => `<span class="pill aviso">${esc(a.nome)} suspenso</span>`),
    ...sair.map((a) => `<span class="pill ruim">${esc(a.nome)} quer sair</span>`), ...((s.propostas ?? []).length ? [`<button class="pill aviso" data-ir-propostas style="cursor:pointer">${s.propostas!.length} proposta${s.propostas!.length > 1 ? "s" : ""} por jogadores seus ›</button>`] : []), ...(contratos.length ? [`<span class="pill aviso">${contratos.length} contrato${contratos.length > 1 ? "s" : ""} acabando</span>`] : []),
  ];
  return `${jogo}${ult}
    <section class="painel"><p class="rotulo">Diretoria</p><h2 style="font-size:19px">${esc(d.expectativa.texto)}</h2>
      <div class="medidor"><i style="--v:${Math.round(d.confianca)}%;--c:${d.confianca >= 60 ? "var(--pos)" : d.confianca >= 30 ? "var(--ouro)" : "var(--neg)"}"></i></div>
      <p class="sub">Confiança ${Math.round(d.confianca)}/100 · meta: ${d.expectativa.pos}º lugar${s.semana >= SEMANAS_PRE_T ? ` · hoje: ${pos}º` : ""} · torcida ${Math.round(s.clube.torcida)}/100</p></section>
    ${alertas.length ? `<section class="painel"><p class="rotulo">Atenção</p><div class="botoes" style="margin-top:6px">${alertas.join("")}</div></section>` : ""}
    <section class="painel"><p class="rotulo">Notícias</p>${s.noticias.slice(0, 12).map((n) => `<div class="not"><small>${esc(n.quando)}</small>${esc(n.texto)}</div>`).join("")}</section>
    <section class="painel"><p class="rotulo">Carreira</p><div class="dl"><span>Reputação</span><b>${s.tecnico.reputacao}/100</b><span>Licença</span><b>${LICENCAS[licencaT(s)]}${s.tecnico.curso?.estudando ? ` · estudando a ${LICENCAS[s.tecnico.curso.estudando].replace("Licença ", "")} (${Math.round(100 * (s.tecnico.curso.progresso ?? 0) / CURSO_LICENCA[s.tecnico.curso.estudando].semanas)}%)` : ""}</b>
      <span>Idiomas</span><b>${Object.entries(idiomasT(s)).filter(([, n]) => n >= 15).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${NOME_LINGUA[l] ?? l} (${rotuloNivel(n).toLowerCase()})`).join(", ")}</b><span>Temporadas</span><b>${s.historico.length}</b><span>Títulos</span><b>${s.historico.filter((h) => h.campeao).length}</b></div>
      ${s.historico.length ? `<div class="lista" style="margin-top:8px">${s.historico.slice().reverse().map((h) => `<div class="not"><small>${ANO_INICIAL_T + h.t} · ${esc(infoLiga(h.ligaId).curto)}</small>${h.pos}º de ${h.n} (meta ${h.esperado}º)${h.campeao ? " · 🏆 campeão" : ""}</div>`).join("")}</div>` : ""}
      <div class="botoes" style="margin-top:10px">${licencaT(s) < 4 && !s.tecnico.curso?.estudando ? `<button class="botao sec peq" data-licenca>Estudar a ${LICENCAS[licencaT(s) + 1]} (${curtoBrl(CURSO_LICENCA[licencaT(s) + 1].custo * Math.max(0.5, infoLiga(s.ligaId).fLiga))})</button>` : ""}<button class="botao sec peq" data-apagar>Apagar carreira</button><a class="botao sec peq" href="index.html">Modo jogador</a></div></section>`;
}

// ------------------------------------------------------------------ Elenco
const grupoPos = (p: PosT) => (p === "GOL" ? "gol" : p === "ZAG" || p === "LAT" ? "def" : p === "VOL" || p === "MEI" ? "mei" : "ata");
function abaElenco(s: SaveTecnico): string {
  const nProp = (s.propostas ?? []).length;
  const subs = `<div class="sub-abas">${[["jogadores", `Jogadores (${s.elenco.length})`], ["mercado", "Mercado"], ["propostas", `Propostas${nProp ? ` (${nProp})` : ""}`], ["livres", "Agentes livres"]].map(([k, n]) => `<button class="${sub.elenco === k ? "ativo" : ""}" data-sub="elenco:${k}">${n}</button>`).join("")}</div>`;
  if (sub.elenco === "livres") return subs + abaLivres(s);
  if (sub.elenco === "mercado") return subs + abaMercadoT(s);
  if (sub.elenco === "propostas") return subs + abaPropostas(s);
  const filtros = `<div class="chips" style="margin-bottom:8px">${[["todos", "Todos"], ["gol", "Goleiros"], ["def", "Defesa"], ["mei", "Meio"], ["ata", "Ataque"]].map(([k, n]) => `<button class="chip${filtro === k ? " ativo" : ""}" data-filtro="${k}">${n}</button>`).join("")}</div>`;
  const ordemPos: Record<string, number> = { GOL: 0, ZAG: 1, LAT: 2, VOL: 3, MEI: 4, PON: 5, ATA: 6 };
  const lista = s.elenco.filter((a) => filtro === "todos" || grupoPos(a.pos) === filtro).sort((a, b) => ordemPos[a.pos] - ordemPos[b.pos] || ovrDe(b) - ovrDe(a));
  const tit = new Set(s.esc.titulares);
  return `${subs}${filtros}<p class="sub" style="margin-bottom:6px">Folha: <b style="color:var(--giz)">${curtoBrl(folhaDe(s))}</b>/mês · teto ${curtoBrl(s.clube.tetoFolha)}</p><div class="lista">${lista.map((a) => {
    const tags = [tit.has(a.id) ? `<span class="pill bom">Titular</span>` : "", a.lesao > 0 ? `<span class="pill ruim">Lesão ${a.lesao} sem.</span>` : "", a.suspenso > 0 ? `<span class="pill aviso">Suspenso</span>` : "",
      a.querSair ? `<span class="pill ruim">Quer sair</span>` : "", a.contratoAte <= s.temporada ? `<span class="pill aviso">Contrato acaba</span>` : "", a.promessa !== undefined ? `<span class="pill">Promessa</span>` : "", a.base ? `<span class="pill">Base</span>` : "", (s.aVenda ?? []).includes(a.id) ? `<span class="pill aviso">À venda</span>` : ""].join("");
    return `<button class="lin" data-jog="${esc(a.id)}"><span class="num">${a.numero}</span><span class="nm"><b>${esc(a.nome)}</b><small>${a.pos} · ${a.idade}a · moral ${barra(a.moral)} · físico ${barra(a.condicao)}${tags}</small></span><span class="ov"><strong>${ovrDe(a)}</strong><span>${potTexto(s, a)}</span></span></button>`;
  }).join("")}</div>`;
}
/** O potencial é uma estimativa: quanto melhor o olheiro e o coordenador da base, mais justa a faixa. */
function potTexto(s: SaveTecnico, a: Atleta): string {
  const erro = Math.max(1, 6 - Math.max(nivelStaff(s, "olheiro"), nivelStaff(s, "base"))), o = ovrDe(a);
  if (a.pot - o <= 1 && a.idade >= 27) return "no auge";
  return `pot ${Math.max(o, a.pot - erro)}–${Math.min(99, a.pot + erro)}`;
}
function fichaJogador(s: SaveTecnico, id: string): string {
  const a = s.elenco.find((x) => x.id === id);
  if (!a) return "";
  const fC = mundo(pacote).clube[s.clubeId]?.fClube ?? 1, pedido = pedidoRenovacao(s, a, fC), conv = a.conversa === semanaAbs(s);
  const nomeAt = (k: (typeof ATRIBUTOS)[number]) => (a.pos === "GOL" ? NOME_AT_GOL[k] ?? NOME_AT[k] : NOME_AT[k]);
  const meses = Math.max(1, (a.contratoAte - s.temporada + 1) * 12 - Math.floor(s.semana / 4)), multa = Math.round(a.salario * meses * 0.5);
  return `<button class="fechar" data-fechar aria-label="Fechar">×</button>
    <div><p class="rotulo">${NOME_POS_T[a.pos]} · ${a.idade} anos · ${a.nac} · camisa ${a.numero}</p><h2>${esc(a.nome)}</h2></div>
    <div class="forca3"><div><strong>${ovrDe(a)}</strong><span>OVR</span></div><div><strong>${formaDe(a).toFixed(1).replace(".", ",")}</strong><span>Forma</span></div><div><strong>${a.jogos}</strong><span>Jogos · ${a.gols}g ${a.assist}a</span></div></div>
    <div class="atr">${ATRIBUTOS.map((k) => `<div class="barra"><span>${nomeAt(k)}</span><b>${Math.round(a.at[k])}</b><i style="--v:${Math.round(a.at[k])}%;--c:${a.at[k] >= 75 ? "var(--pos)" : a.at[k] >= 55 ? "var(--ouro)" : "var(--giz-2)"}"></i></div>`).join("")}</div>
    <p class="rotulo">Mental e bola parada</p>
    <div class="atr">${EXTRAS.map((k) => `<div class="barra" title="${esc(DICA_EXTRA[k])}"><span>${NOME_EXTRA[k]}</span><b>${Math.round(exDe(a)[k])}</b><i style="--v:${Math.round(exDe(a)[k])}%;--c:${exDe(a)[k] >= 75 ? "var(--pos)" : exDe(a)[k] >= 55 ? "var(--ouro)" : "var(--giz-2)"}"></i></div>`).join("")}</div>
    <p class="rotulo">Funções na posição</p><div class="lista">${funcoesDa(a.pos).map((f) => `<div class="not" style="padding:5px 0"><span class="estrelas">${"★".repeat(estrelasEncaixe(encaixe(a.at, exDe(a), f), ovrDe(a)))}${"☆".repeat(5 - estrelasEncaixe(encaixe(a.at, exDe(a), f), ovrDe(a)))}</span> <b>${esc(f.nome)}</b><small>${esc(f.desc)}</small></div>`).join("")}</div>
    <div class="dl"><span>Potencial</span><b>${potTexto(s, a)}</b><span>Moral</span><b>${Math.round(a.moral)}/100</b><span>Condição física</span><b>${Math.round(a.condicao)}%</b><span>Relação com você</span><b>${Math.round(a.relacao)}/100</b>
      <span>Profissionalismo · temperamento</span><b>${a.prof} · ${a.temp}</b><span>Salário</span><b>${valorBrl(a.salario)}/mês</b><span>Contrato até</span><b>${ANO_INICIAL_T + a.contratoAte}</b>
      <span>Valor de mercado</span><b>${curtoBrl(valorAtleta(a, infoLiga(s.ligaId).fLiga, s.temporada))}</b>${a.lesao > 0 ? `<span>Lesão</span><b class="neg">${esc(a.lesaoTipo ?? "")} · ${a.lesao} sem.</b>` : ""}</div>
    ${aviso()}
    <div><p class="rotulo">Idiomas</p><p class="sub">${Object.entries(idiomasDe(a)).filter(([, n]) => n >= 10).sort((x, y) => y[1] - x[1]).map(([l, n]) => `${NOME_LINGUA[l] ?? l}: ${rotuloNivel(n).toLowerCase()}`).join(" · ")}</p>
      ${(() => { const lg = linguaDe(infoLiga(s.ligaId).pais), n = nivelEm(idiomasDe(a), lg); return n < 90 ? `<div class="botoes" style="margin-top:6px">${a.aulas && a.aulas.ate > semanaAbs(s) ? `<span class="pill">Em aulas de ${esc((NOME_LINGUA[lg] ?? lg).toLowerCase())}</span>` : `<button class="botao sec peq" data-aulas="${esc(a.id)}">Pagar aulas de ${esc((NOME_LINGUA[lg] ?? lg).toLowerCase())}</button>`}</div>` : ""; })()}</div>
    <div><p class="rotulo">Curso de técnico</p><p class="sub">${a.curso?.estudando ? `Estudando a ${LICENCAS[a.curso.estudando]} (${Math.round(100 * (a.curso.progresso ?? 0) / CURSO_LICENCA[a.curso.estudando].semanas)}%).` : (a.curso?.licenca ?? 0) > 0 ? `Tem a ${LICENCAS[a.curso!.licenca]}.` : "Ainda não começou."} Quem se aposenta com licença pode entrar na sua comissão.</p>${!a.curso?.estudando && (a.curso?.licenca ?? 0) < 2 ? `<div class="botoes" style="margin-top:6px"><button class="botao sec peq" data-curso="${esc(a.id)}">Recomendar o curso</button></div>` : ""}</div>
    <div><p class="rotulo">Conversar${conv ? " · já conversou nesta semana" : ""}</p><div class="botoes" style="margin-top:6px">${(Object.keys(NOME_CONVERSA) as Conversa[]).map((k) => `<button class="botao sec peq" data-conv="${k}" data-id="${esc(a.id)}" ${conv ? "disabled" : ""}>${NOME_CONVERSA[k]}</button>`).join("")}</div></div>
    <div><p class="rotulo">Renovar · pede ${valorBrl(pedido)}/mês</p><div class="botoes" style="margin-top:6px">${[1, 2, 3, 4].map((n) => `<button class="botao sec peq" data-renovar="${n}" data-id="${esc(a.id)}">${n} ano${n > 1 ? "s" : ""}</button>`).join("")}</div></div>
    <div><p class="rotulo">Mercado · vale ${curtoBrl(valorAtleta(a, infoLiga(s.ligaId).fLiga, s.temporada))}</p><div class="botoes" style="margin-top:6px"><button class="botao sec peq" data-venda="${esc(a.id)}">${(s.aVenda ?? []).includes(a.id) ? "Tirar da lista de venda" : "Colocar à venda"}</button></div></div>
    <div><p class="rotulo">Dispensar · rescisão de ${curtoBrl(multa)}</p><div class="botoes" style="margin-top:6px"><button class="botao sec peq" data-dispensar data-id="${esc(a.id)}">Dispensar ${esc(a.nome)}</button></div></div>`;
}
function abaMercadoT(s: SaveTecnico): string {
  const jan = janelaT(s), f = filtroMercado, lista = buscarJogadores(pacote, s, f);
  const chip = (on: boolean, attrs: string, n: string) => `<button class="chip${on ? " ativo" : ""}" ${attrs}>${n}</button>`;
  return `<p class="aviso-t ${jan.aberta ? "ok" : ""}" style="margin-bottom:10px">${esc(jan.texto)} Caixa: <b>${curtoBrl(s.clube.saldo)}</b> · folha ${curtoBrl(folhaDe(s))} de ${curtoBrl(s.clube.tetoFolha)}.</p>
    <div class="chips" style="margin-bottom:6px">${chip(!f.pos, 'data-mpos=""', "Todas")}${(["GOL", "ZAG", "LAT", "VOL", "MEI", "PON", "ATA"] as PosT[]).map((p) => chip(f.pos === p, `data-mpos="${p}"`, p)).join("")}</div>
    <div class="chips" style="margin-bottom:6px">${chip(!f.idadeMax, 'data-midade="0"', "Qualquer idade")}${chip(f.idadeMax === 23, 'data-midade="23"', "Até 23")}${chip(f.idadeMax === 28, 'data-midade="28"', "Até 28")}</div>
    <div class="chips" style="margin-bottom:6px">${chip(f.minhaLiga, 'data-mliga="1"', `Só na ${esc(infoLiga(s.ligaId).curto)}`)}${chip(!f.minhaLiga, 'data-mliga="0"', "Todas as ligas")}</div>
    <div class="chips" style="margin-bottom:10px">${chip(f.alcance, 'data-malc="1"', "Ao seu alcance")}${chip(!f.alcance, 'data-malc="0"', "Todos")}</div>
    <div class="lista">${lista.map((x) => `<button class="lin" data-alvo="${esc(x.nome)}" data-clube="${x.clubeId}"><span class="num" style="font-size:13px">${x.pos}</span><span class="nm"><b>${esc(x.nome)}</b><small>${escudo(x.clubeId, "escudo esc-p")}${esc(nomeClube(x.clubeId))} · ${x.idade}a${x.titular ? ` <span class="pill">Titular</span>` : ""}</small><small>Valor ${curtoBrl(x.valor)}</small></span><span class="ov"><strong>${x.ovr}</strong><span>OVR</span></span></button>`).join("") || `<p class="sub">Ninguém com esse filtro.</p>`}</div>`;
}
function negociarHtml(s: SaveTecnico, nome: string, clubeId: string): string {
  const a = alvoPorNome(pacote, s, nome, clubeId);
  if (!a) return `<button class="fechar" data-fechar aria-label="Fechar">×</button><p class="sub">Esse jogador não está mais nesse clube.</p>`;
  const int = interesseDo(pacote, s, a), jan = janelaT(s);
  const ofertas = [0.8, 1, 1.2, 1.5].map((k) => Math.round(a.valor * k / 1000) * 1000);
  return `<button class="fechar" data-fechar aria-label="Fechar">×</button>
    <div><p class="rotulo">${NOME_POS_T[a.pos]} · ${a.idade} anos · ${a.nac}</p><h2>${esc(a.nome)}</h2></div>
    <div class="clube-op" style="border:0">${escudo(a.clubeId)}<div><b>${esc(nomeClube(a.clubeId))}</b><br><small class="sub">${esc(infoLiga(a.ligaId).curto)}${a.titular ? " · titular" : ""}</small></div><span class="ov"><strong style="font-family:var(--display);font-size:30px;color:var(--ouro-claro)">${a.ovr}</strong></span></div>
    <div class="dl"><span>Valor de mercado</span><b>${valorBrl(a.valor)}</b><span>Salário que ele pede</span><b>${valorBrl(int.salario)}/mês</b><span>Seu caixa</span><b>${valorBrl(s.clube.saldo)}</b></div>
    <p class="aviso-t ${int.topa ? "ok" : "erro"}">${esc(int.motivo)}</p>
    ${msgNeg ? `<p class="aviso-t ${msgNeg.ok ? "ok" : "erro"}" role="status">${esc(msgNeg.texto)}</p>` : ""}
    ${!jan.aberta ? `<p class="sub">${esc(jan.texto)}</p>` : int.topa ? `<div><p class="rotulo">Contrato</p><div class="chips" style="margin-top:6px">${[1, 2, 3, 4, 5].map((n) => `<button class="chip${anosProposta === n ? " ativo" : ""}" data-anosprop="${n}">${n} ano${n > 1 ? "s" : ""}</button>`).join("")}</div></div>
    <div><p class="rotulo">Sua oferta ao clube</p>${campoValor("ofertaValor", msgNeg?.pedido ?? a.valor)}
      <div class="chips" style="margin:8px 0">${msgNeg?.pedido ? `<button class="chip ativo" data-preencher="ofertaValor" data-v="${msgNeg.pedido}">O clube pede ${curtoBrl(msgNeg.pedido)}</button>` : ""}${[0.8, 1, 1.2, 1.5].map((k) => `<button class="chip" data-preencher="ofertaValor" data-v="${Math.round(a.valor * k / 1000) * 1000}">${Math.round(k * 100)}% · ${curtoBrl(a.valor * k)}</button>`).join("")}</div>
      <button class="botao" data-enviar-oferta data-alvo-n="${esc(a.nome)}" data-clube="${a.clubeId}" style="width:100%">Enviar proposta</button>
    <p class="sub" style="margin-top:6px">Digite o valor que quiser. Os atalhos só preenchem o campo. O clube pede mais por titular, garoto e rival da mesma liga. Até 3 tentativas por janela.</p></div></div>` : ""}`;
}
function abaPropostas(s: SaveTecnico): string {
  const ps = s.propostas ?? [], jan = janelaT(s), por = new Map(s.elenco.map((a) => [a.id, a]));
  const hist = (s.transferencias ?? []).slice(0, 15);
  return `${aviso()}<p class="sub" style="margin-bottom:8px">${esc(jan.texto)} Coloque jogadores à venda pela ficha deles para atrair propostas.</p>
    ${ps.length ? ps.map((p, i) => { const a = por.get(p.atletaId)!; return `<div class="painel" style="margin-bottom:8px"><div class="clube-op" style="border:0;padding:0">${escudo(p.clubeId)}<div><b>${esc(a.nome)}</b> <small class="sub">(${a.pos}, ${ovrDe(a)})</small><br><small class="sub">${esc(nomeClube(p.clubeId))} oferece</small></div><b style="font-size:16px">${curtoBrl(p.valor)}</b></div>
      <p class="sub" style="margin:6px 0">Vale ${curtoBrl(valorAtleta(a, infoLiga(s.ligaId).fLiga, s.temporada))} no mercado · responde até a próxima semana</p>
      <div class="botoes" style="margin-bottom:8px"><button class="botao peq" data-prop="${esc(p.id)}" data-r="aceitar">Vender por ${curtoBrl(p.valor)}</button><button class="botao sec peq" data-prop="${esc(p.id)}" data-r="recusar">Recusar</button></div>
      <p class="rotulo">Ou peça outro valor</p>${campoValor(`pedir${i}`, Math.round(p.valor * 1.2 / 1000) * 1000)}<button class="botao sec peq" data-prop="${esc(p.id)}" data-r="contra" data-campo="pedir${i}" style="margin-top:6px">Pedir esse valor</button></div>`; }).join("") : `<p class="sub">Nenhuma proposta agora.</p>`}
    ${hist.length ? `<p class="rotulo" style="margin-top:14px">Transferências</p>${hist.map((t) => `<div class="not"><small>${ANO_INICIAL_T + t.t} · ${t.venda ? "venda" : "compra"}</small>${esc(t.nome)}: ${t.venda ? `para o ${esc(nomeClube(t.para))}` : `do ${esc(nomeClube(t.de))}`} · ${curtoBrl(t.valor)}</div>`).join("")}` : ""}`;
}
function abaLivres(s: SaveTecnico): string {
  const l = agentesLivresT(pacote, s), olheiro = nivelStaff(s, "olheiro");
  return `<p class="sub" style="margin-bottom:8px">Sem custo de transferência: só o salário. A lista muda todo mês. Jogador bom demais para o clube pode recusar. ${olheiro >= 3 ? "Seu olheiro mostra o potencial." : "Com olheiro nível 3 ou mais, você vê o potencial."}</p>${aviso()}
    <div class="lista">${l.map((x) => `<div class="lin" style="cursor:default"><span class="num" style="font-size:13px">${x.pos}</span><span class="nm"><b>${esc(x.nome)}</b><small>${x.idade}a · ${x.nac} · ${valorBrl(x.pedido)}/mês${olheiro >= 3 ? ` · pot ${x.pot}` : ""}</small>
      <span class="botoes" style="margin-top:5px">${[1, 2, 3].map((n) => `<button class="botao sec peq" data-livre="${esc(x.nome)}" data-anos="${n}">${n} ano${n > 1 ? "s" : ""}</button>`).join("")}</span></span><span class="ov"><strong>${x.ovr}</strong><span>OVR</span></span></div>`).join("")}</div>
    <p class="sub" style="margin-top:10px">Compra e venda entre clubes chegam na próxima fase do modo técnico.</p>`;
}

// ------------------------------------------------------------------ Tática
function abaTatica(s: SaveTecnico): string {
  const vagas = FORMACOES[s.tatica.formacao], por = new Map(s.elenco.map((a) => [a.id, a])), t = s.tatica;
  const f = forcaDoTime(s.elenco, s.esc, t, s.entrosamento[t.formacao] ?? 40);
  const campo = `<div class="campo"><div class="area cima"></div><div class="area baixo"></div><div class="circ"></div>${vagas.map((v, i) => {
    const a = por.get(s.esc.titulares[i] ?? "");
    if (!a) return `<button class="vaga vazia" data-vaga="${i}" style="left:${v.x}%;top:${v.y}%"><span class="bola">+</span><span class="nomev">${v.rot}</span></button>`;
    const ruim = !disponivel(a) || rotuloEncaixe(a, v.pos) !== "";
    return `<button class="vaga${ruim ? " alerta" : ""}" data-vaga="${i}" style="left:${v.x}%;top:${v.y}%" aria-label="${v.rot}: ${esc(a.nome)}"><span class="bola" style="background:${corPos(v.pos)}">${a.numero}</span><span class="nomev">${esc(a.nome.split(" ").slice(-1)[0])}</span><span class="notav">${v.rot} · ${Math.round(ovrNaVaga(a, v.pos))}</span></button>`;
  }).join("")}</div>`;
  const chips = (campo: string, nomes: string[], atual: number) => `<div class="chips">${nomes.map((n, i) => `<button class="chip${i === atual ? " ativo" : ""}" data-tat="${campo}" data-v="${i}">${n}</button>`).join("")}</div>`;
  const reservas = s.esc.reservas.map((id) => por.get(id)).filter(Boolean) as Atleta[];
  return `<div class="chips" style="margin-bottom:10px">${NOMES_FORMACAO.map((n) => `<button class="chip${n === t.formacao ? " ativo" : ""}" data-form="${n}">${n}</button>`).join("")}</div>
    <div class="forca3" style="margin-bottom:10px"><div><strong>${Math.round(f.defesa)}</strong><span>Defesa</span></div><div><strong>${Math.round(f.meio)}</strong><span>Meio</span></div><div><strong>${Math.round(f.ataque)}</strong><span>Ataque</span></div></div>
    ${campo}
    <p class="sub" style="margin:8px 0">Toque num jogador para trocar. Entrosamento no ${t.formacao}: <b style="color:var(--giz)">${Math.round(s.entrosamento[t.formacao] ?? 40)}%</b>. Contorno vermelho: improvisado, lesionado ou suspenso.</p>
    ${s.aoVivo ? `<p class="aviso-t ok" style="margin-top:8px">Intervalo · ${s.aoVivo.souCasa ? s.aoVivo.gMe : s.aoVivo.gAdv} × ${s.aoVivo.souCasa ? s.aoVivo.gAdv : s.aoVivo.gMe}. As mudanças valem para o 2º tempo. Trocas: ${trocasNoIntervalo(s)} de ${MAX_TROCAS}.</p><button class="botao grande" data-avancar-tatica style="margin-top:8px">Jogar o 2º tempo</button>` : `<div class="botoes"><button class="botao peq" data-melhor>Melhor escalação</button></div>`}
    <p class="rotulo" style="margin-top:14px">Funções</p><div class="lista">${vagas.map((v, i) => { const a = por.get(s.esc.titulares[i] ?? ""); if (!a) return ""; const atual = funcaoNaVaga(s.esc, a, v.pos);
      return `<div class="lin" style="cursor:default;grid-template-columns:34px 1fr"><span class="num" style="font-size:12px">${v.rot}</span><span class="nm"><b>${esc(a.nome)}</b><select class="campo-sel sel-funcao" data-funcao="${esc(a.id)}" aria-label="Função de ${esc(a.nome)}">${funcoesDa(v.pos).map((f) => `<option value="${f.id}" ${f.id === atual?.id ? "selected" : ""}>${"★".repeat(estrelasEncaixe(encaixe(a.at, exDe(a), f), ovrPos(a.at, v.pos)))} ${esc(f.nome)}</option>`).join("")}</select><small>${esc(atual?.desc ?? "")}</small></span></div>`; }).join("")}</div>
    <p class="rotulo" style="margin-top:14px">Banco</p><p class="sub">${reservas.map((a) => `${esc(a.nome)} (${a.pos} ${ovrDe(a)})`).join(" · ") || "Sem reservas disponíveis."}</p>
    <p class="sub" style="font-size:12.5px;margin-top:4px">Até 3 trocas automáticas a partir dos 60', saindo quem estiver mais cansado.</p>
    <div class="grade-tat" style="margin-top:14px"><p class="rotulo">Instruções</p>
      <div><div class="lbl">Mentalidade</div>${chips("mentalidade", NOME_MENTALIDADE, t.mentalidade)}</div>
      <div><div class="lbl">Marcação</div>${chips("pressao", NOME_NIVEL3.pressao, t.pressao)}</div>
      <div><div class="lbl">Ritmo</div>${chips("ritmo", NOME_NIVEL3.ritmo, t.ritmo)}</div>
      <div><div class="lbl">Linha de defesa</div>${chips("linha", NOME_NIVEL3.linha, t.linha)}</div>
      <div><div class="lbl">Amplitude</div>${chips("largura", NOME_NIVEL3.largura, t.largura)}</div>
      <div><div class="lbl">Contra-ataque</div>${chips("contraAtaque", ["Não", "Sim"], t.contraAtaque ? 1 : 0)}</div>
      <p class="sub" style="font-size:12.5px">Marcação alta ganha o meio, mas cansa. Linha alta pede zagueiros rápidos. Time aberto rende com quem cruza bem. Contra-ataque funciona com atacantes rápidos e time que não se expõe.</p>
      <p class="rotulo" style="margin-top:6px">Treino da semana</p>
      <div><div class="lbl">Foco</div><div class="chips">${([["fisico", "Físico"], ["tecnico", "Técnico"], ["tatico", "Tático"]] as const).map(([k, n]) => `<button class="chip${s.treino.foco === k ? " ativo" : ""}" data-treino="foco" data-v="${k}">${n}</button>`).join("")}</div></div>
      <div><div class="lbl">Intensidade</div><div class="chips">${([["leve", "Leve"], ["normal", "Normal"], ["alta", "Alta"]] as const).map(([k, n]) => `<button class="chip${s.treino.intensidade === k ? " ativo" : ""}" data-treino="intensidade" data-v="${k}">${n}</button>`).join("")}</div></div>
      <p class="sub" style="font-size:12.5px">Treino alto evolui mais e recupera menos. Foco tático aumenta o entrosamento.</p></div>`;
}
function escolherVaga(s: SaveTecnico, i: number): string {
  const v = FORMACOES[s.tatica.formacao][i], atual = s.esc.titulares[i];
  const av = s.aoVivo, podeVoltar = (a: Atleta) => !av || (!av.fora.includes(a.id) && (av.emCampo1.includes(a.id) || !av.stats[a.id]));
  const lista = [...s.elenco].filter((a) => !av || podeVoltar(a)).sort((a, b) => Number(disponivel(b)) - Number(disponivel(a)) || ovrNaVaga(b, v.pos) - ovrNaVaga(a, v.pos));
  return `<button class="fechar" data-fechar aria-label="Fechar">×</button><div><p class="rotulo">Vaga</p><h2>${v.rot} · ${NOME_POS_T[v.pos]}</h2></div>
    <div class="lista">${lista.map((a) => {
      const enc = rotuloEncaixe(a, v.pos), onde = s.esc.titulares.indexOf(a.id);
      return `<button class="lin" data-escolher="${esc(a.id)}" data-i="${i}" ${disponivel(a) ? "" : "disabled style=\"opacity:.45\""}><span class="num" style="font-size:13px">${a.pos}</span><span class="nm"><b>${esc(a.nome)}${a.id === atual ? " ✓" : ""}</b><small>${enc ? `<span class="pill aviso">${enc}</span>` : ""}${onde >= 0 && a.id !== atual ? `<span class="pill">Escalado</span>` : ""} físico ${Math.round(a.condicao)}% · forma ${formaDe(a).toFixed(1).replace(".", ",")}${a.lesao > 0 ? " · lesionado" : a.suspenso > 0 ? " · suspenso" : ""}</small></span><span class="ov"><strong>${Math.round(ovrNaVaga(a, v.pos))}</strong><span>na vaga</span></span></button>`;
    }).join("")}${atual ? `<button class="botao sec" data-escolher="" data-i="${i}" style="margin-top:8px">Deixar a vaga vazia</button>` : ""}</div>`;
}

// ------------------------------------------------------------------ Liga
function abaLiga(s: SaveTecnico): string {
  const li = infoLiga(s.ligaId), tab = ordenar(s.tabela), n = tab.length;
  const ult = Math.max(-1, ...Object.keys(s.rodadas).map(Number));
  const rodada = ult >= 0 ? `<section class="painel" style="margin-top:12px"><p class="rotulo">Rodada ${ult + 1}</p>${s.rodadas[ult].map(([c, f, gc, gf]) => `<div class="not" style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;${c === s.clubeId || f === s.clubeId ? "font-weight:700" : ""}"><span style="text-align:right">${esc(nomeClube(c))}</span><b>${gc} × ${gf}</b><span>${esc(nomeClube(f))}</span></div>`).join("")}</section>` : "";
  return `<p class="rotulo">${esc(li.nome)} · ${ANO_INICIAL_T + s.temporada}</p>
    <table class="tab" style="margin-top:6px"><thead><tr><th>#</th><th style="text-align:left">Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>Pts</th></tr></thead><tbody>${tab.map((t, i) =>
      `<tr class="${t.clube === s.clubeId ? "eu" : ""}${li.acima && i < (li.rebaixados ?? 3) ? " sobe" : ""}${li.abaixo && i >= n - li.rebaixados ? " cai" : ""}"><td>${i + 1}</td><td class="cl">${escudo(t.clube, "escudo esc-p")}${esc(nomeClube(t.clube))}</td><td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp - t.gc}</td><td><b>${t.pts}</b></td></tr>`).join("")}</tbody></table>
    ${rodada}`;
}

// ------------------------------------------------------------------ Clube
function abaClube(s: SaveTecnico): string {
  const subs = `<div class="sub-abas">${[["financas", "Finanças"], ["diretoria", "Diretoria"], ["comissao", "Comissão técnica"]].map(([k, n]) => `<button class="${sub.clube === k ? "ativo" : ""}" data-sub="clube:${k}">${n}</button>`).join("")}</div>`;
  return subs + aviso() + (sub.clube === "diretoria" ? abaDiretoria(s) : sub.clube === "comissao" ? abaComissao(s) : abaFinancas(s));
}
function abaFinancas(s: SaveTecnico): string {
  const li = infoLiga(s.ligaId), manut = Math.round(s.clube.capacidade * 10 * Math.max(0.4, li.fLiga)), mensal = s.clube.tv + s.clube.patrocinio - folhaDe(s) - folhaStaff(s) - manut;
  const linha = (o: Record<string, number>, sinal: string) => Object.entries(o).filter(([, v]) => v).map(([k, v]) => `<span>${esc(k)}</span><b class="${sinal}">${sinal === "neg" ? "−" : "+"}${curtoBrl(v)}</b>`).join("");
  return `<section class="painel" style="padding:0;border:0;background:none"><div class="dl">
      <span>Caixa</span><b class="${s.clube.saldo < 0 ? "neg" : ""}">${valorBrl(s.clube.saldo)}</b>
      <span>Salários do elenco</span><b>${curtoBrl(folhaDe(s))}/mês</b><span>Teto da folha</span><b>${curtoBrl(s.clube.tetoFolha)}/mês</b>
      <span>Comissão técnica</span><b>${curtoBrl(folhaStaff(s))}/mês</b><span>TV</span><b>${curtoBrl(s.clube.tv)}/mês</b><span>Patrocínio</span><b>${curtoBrl(s.clube.patrocinio)}/mês</b>
      <span>Manutenção do estádio</span><b>${curtoBrl(manut)}/mês</b><span>Fixo do mês (sem bilheteria)</span><b class="${mensal < 0 ? "neg" : "pos"}">${curtoBrl(mensal)}</b>
      <span>Estádio</span><b>${s.clube.capacidade.toLocaleString("pt-BR")} lugares</b><span>Ingresso médio</span><b>${valorBrl(precoIngresso(li.fLiga))}</b>
    </div></section>
    <p class="rotulo" style="margin-top:14px">Meses fechados</p>${s.financas.length ? s.financas.slice(0, 8).map((m) => {
      const r = Object.values(m.receitas).reduce((a, b) => a + b, 0), d = Object.values(m.despesas).reduce((a, b) => a + b, 0);
      return `<details class="not"><summary>${esc(m.rotulo)} · <b class="${r - d < 0 ? "neg" : ""}" style="color:${r - d < 0 ? "var(--neg)" : "var(--pos)"}">${r - d < 0 ? "" : "+"}${curtoBrl(r - d)}</b></summary><div class="dl" style="margin-top:6px">${linha(m.receitas, "pos")}${linha(m.despesas, "neg")}</div></details>`;
    }).join("") : `<p class="sub">O primeiro mês fecha na quarta semana.</p>`}`;
}
function abaDiretoria(s: SaveTecnico): string {
  const d = s.diretoria, ab = semanaAbs(s);
  const pedido = (p: Pedido, titulo: string, texto: string) => {
    const c = custoPedido(s, p), andando = d.obras.find((o) => o.tipo === p), max = (p === "ct" && s.clube.ctNivel >= 5) || (p === "base" && s.clube.baseNivel >= 5);
    return `<div class="not"><b>${titulo}</b><small style="font-size:13px;margin:2px 0 6px">${texto}${c.custo ? ` · custo ${curtoBrl(c.custo)}` : ""}</small>${andando ? `<span class="pill aviso">Em obra · ${andando.fim - ab} semanas</span>` : max ? `<span class="pill bom">Nível máximo</span>` : `<button class="botao sec peq" data-ped="${p}">Pedir à diretoria</button>`}</div>`;
  };
  const cE = custoPedido(s, "estadio"), info = infoClube(pacote, s.clubeId), obraEst = d.obras.find((o) => o.tipo === "estadio");
  const ap = info ? aparenciaDoEstadio(info, mundo(pacote).info) : undefined;
  const est = `<div class="estadio-box">${svgEstadio({ ...(ap?.dados ?? { nome: "Estádio", cores: ["#2E7D4F", "#FFFFFF"] }), capacidade: s.clube.capacidade, obra: !!obraEst })}</div>${ap?.divideCom.length ? `<p class="sub" style="text-align:center;margin:-4px 0 8px">Estádio dividido com ${ap.divideCom.map(esc).join(" e ")}.</p>` : ""}
    ${obraEst ? `<p class="sub" style="text-align:center;margin:-4px 0 10px">Obra de ampliação: +${(obraEst.lugares ?? 0).toLocaleString("pt-BR")} lugares em ${obraEst.fim - ab} semanas.</p>` : ""}`;
  return `${est}<div class="dl"><span>Confiança</span><b>${Math.round(d.confianca)}/100</b><span>Meta da temporada</span><b>${esc(d.expectativa.texto)} (${d.expectativa.pos}º)</b><span>Centro de treinamento</span><b>${estrelas(s.clube.ctNivel)}</b><span>Categoria de base</span><b>${estrelas(s.clube.baseNivel)}</b></div>
    <p class="rotulo" style="margin-top:14px">Pedidos</p>
    ${pedido("estadio", "Ampliar o estádio", `+${(cE.lugares ?? 0).toLocaleString("pt-BR")} lugares, mais bilheteria. Precisa de confiança 55`)}
    ${pedido("ct", `Reformar o centro de treinamento (nível ${Math.min(5, s.clube.ctNivel + 1)})`, "Todo o elenco evolui mais. Precisa de confiança 50")}
    ${pedido("base", `Investir na base (nível ${Math.min(5, s.clube.baseNivel + 1)})`, "Garotos melhores e em maior número a cada temporada. Precisa de confiança 45")}
    ${pedido("verba", "Aumentar o teto salarial (+12%)", "Espaço para renovar e contratar. Precisa de confiança 70 e caixa de quatro meses de salários")}
    <p class="sub" style="margin-top:8px">A confiança sobe com vitórias acima do esperado e com campanha melhor que a meta. Abaixo de 8, você é demitido.</p>`;
}
function abaComissao(s: SaveTecnico): string {
  return FUNCOES.map((f) => {
    const m = s.staff[f], cs = candidatos(s, f).filter((c) => c.nome !== m?.nome);
    return `<details class="painel" style="margin-bottom:8px"${m ? "" : " open"}><summary style="cursor:pointer"><b>${NOME_FUNCAO[f]}</b> · ${m ? `${esc(m.nome)} ${estrelas(m.nivel)}` : `<span class="pill ruim">vaga aberta</span>`}</summary>
      <p class="sub" style="margin:6px 0">${EFEITO_FUNCAO[f]}${m ? ` Salário ${curtoBrl(m.salario)}/mês.` : ""}</p>
      ${m ? `<button class="botao sec peq" data-staff-d="${f}">Demitir (3 salários)</button>` : ""}
      <p class="rotulo" style="margin-top:10px">Disponíveis</p>${cs.map((c) => `<div class="clube-op" style="grid-template-columns:1fr auto"><div><b>${esc(c.nome)}</b> ${estrelas(c.nivel)}${c.ex ? ` <span class="pill bom">Ex-atleta do clube</span>` : ""}<br><small class="sub">${c.nac} · ${c.idade} anos · ${curtoBrl(c.salario)}/mês</small></div><button class="botao peq" data-staff-c="${f}" data-nome="${esc(c.nome)}">Contratar</button></div>`).join("")}
    </details>`;
  }).join("") + `<p class="sub">A lista de disponíveis muda a cada dois meses.</p>`;
}

// ------------------------------------------------------------------ partida
function relatorioHtml(p: Relatorio): string {
  const minha = (e: { meu: boolean }) => e.meu;
  return `<button class="fechar" data-fechar aria-label="Fechar">×</button>
    <p class="rotulo">Rodada ${p.rodada + 1}${p.publico ? ` · público ${p.publico.toLocaleString("pt-BR")}` : ""}</p>
    <div class="prox"><div class="lado">${escudo(p.casa)}<span>${esc(nomeClube(p.casa))}</span></div><span class="placar">${p.gc} × ${p.gf}</span><div class="lado">${escudo(p.fora)}<span>${esc(nomeClube(p.fora))}</span></div></div>
    <div class="dl"><span>Posse de bola (seu time)</span><b>${p.posse}%</b><span>Finalizações</span><b>${p.chutes[0]} × ${p.chutes[1]}</b>${p.melhor ? `<span>Melhor em campo</span><b>${esc(p.melhor)}</b>` : ""}</div>
    <div><p class="rotulo">Lances</p>${p.eventos.length ? p.eventos.map((e) => `<div class="evento${minha(e) ? "" : " adv"}"><span class="m">${e.min}'</span><span>${e.tipo === "gol" ? "⚽" : e.tipo === "amarelo" ? "🟨" : e.tipo === "vermelho" ? "🟥" : e.tipo === "lesao" ? "✚" : "⇄"}</span><span>${esc(e.texto)}</span></div>`).join("") : `<p class="sub">Jogo sem gols nem grandes lances.</p>`}</div>
    <div><p class="rotulo">Notas</p><div class="lista">${[...p.notas].sort((a, b) => b.nota - a.nota).map((n) => `<div class="lin" style="cursor:default;grid-template-columns:40px 1fr auto"><span class="num" style="font-size:13px">${n.pos}</span><span class="nm"><b>${esc(n.nome)}</b><small>${n.min}'${n.gols ? ` · ${n.gols} gol${n.gols > 1 ? "s" : ""}` : ""}${n.assist ? ` · ${n.assist} assist.` : ""}</small></span><span class="ov"><strong style="font-size:20px;color:${n.nota >= 7 ? "var(--pos)" : n.nota < 6 ? "var(--neg)" : "var(--ouro-claro)"}">${n.nota.toFixed(1).replace(".", ",")}</strong></span></div>`).join("")}</div></div>`;
}

function intervaloHtml(s: SaveTecnico, avisos: string[]): string {
  const av = s.aoVivo;
  if (!av) return "";
  const casa = av.souCasa ? s.clubeId : av.adv, fora = av.souCasa ? av.adv : s.clubeId, gc = av.souCasa ? av.gMe : av.gAdv, gf = av.souCasa ? av.gAdv : av.gMe;
  const cansados = Object.entries(av.cond).filter(([id, c]) => c < 62 && s.esc.titulares.includes(id)).map(([id]) => s.elenco.find((a) => a.id === id)?.nome).filter(Boolean);
  return `<button class="fechar" data-fechar aria-label="Fechar">×</button><p class="rotulo">Intervalo · rodada ${av.rodada + 1}</p>
    <div class="prox"><div class="lado">${escudo(casa)}<span>${esc(nomeClube(casa))}</span></div><span class="placar">${gc} × ${gf}</span><div class="lado">${escudo(fora)}<span>${esc(nomeClube(fora))}</span></div></div>
    ${avisos.map((x) => `<p class="sub">${esc(x)}</p>`).join("")}
    <div><p class="rotulo">1º tempo</p>${av.eventos.length ? av.eventos.map((e) => `<div class="evento${e.meu ? "" : " adv"}"><span class="m">${e.min}'</span><span>${e.tipo === "gol" ? "⚽" : e.tipo === "amarelo" ? "🟨" : e.tipo === "vermelho" ? "🟥" : e.tipo === "lesao" ? "✚" : "⇄"}</span><span>${esc(e.texto)}</span></div>`).join("") : `<p class="sub">Primeiro tempo sem gols nem grandes lances.</p>`}</div>
    ${cansados.length ? `<p class="sub">Cansados: ${cansados.map((n) => esc(n!)).join(", ")}.</p>` : ""}${av.fora.length ? `<p class="sub">Não voltam: ${av.fora.map((id) => esc(s.elenco.find((a) => a.id === id)?.nome ?? "")).join(", ")}.</p>` : ""}
    <div class="botoes"><button class="botao sec" data-aba="tatica" data-fechar-tambem>Mexer no time e na tática</button><button class="botao" data-avancar>Jogar o 2º tempo</button></div>
    <p class="sub">Você pode fazer até ${MAX_TROCAS} trocas, mudar a formação, as funções e as instruções. Quem saiu não volta.</p>`;
}
// ------------------------------------------------------------------ render
function abrir(html: string) { $("tela").innerHTML = html; const d = $("dlg") as HTMLDialogElement; if (!d.open) d.showModal(); }
function fechar() { const d = $("dlg") as HTMLDialogElement; if (d.open) d.close(); }
function render() {
  const app = $("app");
  if (!save) { definirMoeda("BRL"); app.innerHTML = telaInicio(); return; }
  const s = save;
  moedaDaLiga(s.ligaId);
  if (s.demitido) {
    app.innerHTML = `${topo(s)}<section class="painel"><p class="rotulo">Fim de linha</p><h2>${esc(s.demitido)}</h2><p class="sub" style="margin-top:6px">Reputação ${s.tecnico.reputacao}. Você pode recomeçar num clube que aceite o seu nome.</p>
      <div class="botoes" style="margin-top:12px"><button class="botao" data-recomecar>Procurar outro clube</button><a class="botao sec" href="index.html">Modo jogador</a></div></section>`;
    return;
  }
  const corpo = aba === "inicio" ? abaInicio(s) : aba === "elenco" ? abaElenco(s) : aba === "tatica" ? abaTatica(s) : aba === "liga" ? abaLiga(s) : abaClube(s);
  app.innerHTML = `${topo(s)}${aba === "inicio" ? aviso() + corpo : `<section class="painel tela-aba">${corpo}</section>`}${nav(s)}`;
}

document.addEventListener("change", (ev) => {
  const t = ev.target as HTMLElement;
  if (t.dataset.funcao && save) { (save.esc.funcoes ??= {})[t.dataset.funcao] = (t as HTMLSelectElement).value; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
  if (t.id === "iLiga") { ligaEscolhida = (t as HTMLSelectElement).value; const nome = ($("iNome") as HTMLInputElement).value, nac = ($("iNac") as HTMLSelectElement).value; render(); ($("iNome") as HTMLInputElement).value = nome; ($("iNac") as HTMLSelectElement).value = nac; }
});
document.addEventListener("click", (ev) => {
  const b = (ev.target as Element).closest<HTMLElement>("button, [data-fechar]");
  if (!b) return;
  const d = b.dataset;
  const y = window.scrollY, redesenhar = (manterMsg = true) => { if (!manterMsg) msg = undefined; salvar(); render(); window.scrollTo(0, y); };
  if (d.fechar !== undefined) { fechar(); return; }
  if (d.assumir) {
    const nome = ($("iNome") as HTMLInputElement).value.trim() || "Técnico", nac = ($("iNac") as HTMLSelectElement).value;
    const jog = ler<SaveJogador>("mycarrerinha:save");
    const ex = d.ex === "1" && jog?.carreira?.encerrada ? { apelido: jog.jogador.apelido, fama: jog.carreira.fama } : undefined;
    save = novaCarreiraTecnico(pacote, { nome, nac, idade: ex ? jog!.jogador.idade + 1 : 38, ...(ex ? { exJogador: ex, ...heranca(jog!) } : {}) }, d.assumir);
    if (anterior) { save.tecnico.reputacao = anterior.tecnico.reputacao; save.historico = anterior.historico; save.tecnico.curso = anterior.tecnico.curso; save.tecnico.idiomas = anterior.tecnico.idiomas; anterior = null; }
    aba = "inicio"; msg = undefined; salvar(); nuvem.agora(); render(); window.scrollTo(0, 0); return;
  }
  if (!save) return;
  const s = save;
  if (d.aba) { aba = d.aba as typeof aba; msg = undefined; fechar(); salvar(); render(); window.scrollTo(0, 0); return; }
  if (d.sub) { const [k, v] = d.sub.split(":"); sub[k] = v; msg = undefined; render(); return; }
  if (d.filtro) { filtro = d.filtro; render(); return; }
  if (d.avancar !== undefined || d.avancarTatica !== undefined) {
    const r = avancarSemana(pacote, s); msg = undefined; salvar(); render(); window.scrollTo(0, 0);
    if (r.partida) abrir(relatorioHtml(r.partida) + (r.eventos.length > 1 ? `<div><p class="rotulo">Na semana</p>${r.eventos.slice(1).map((e) => `<div class="not">${esc(e)}</div>`).join("")}</div>` : "") + (r.fimDeTemporada ? `<div class="aviso-t ok">${esc(r.fimDeTemporada)}</div>` : ""));
    else if (r.fimDeTemporada || r.eventos.length) msg = { texto: [r.fimDeTemporada, ...r.eventos].filter(Boolean).join(" "), ok: true }, render();
    return;
  }
  if (d.verPartida !== undefined && s.ultima) { abrir(relatorioHtml(s.ultima)); return; }
  if (d.primeiroTempo !== undefined) { const r = iniciarPartida(pacote, s); salvar(); render(); window.scrollTo(0, 0); if (r) abrir(intervaloHtml(s, r.avisos)); return; }
  if (d.verIntervalo !== undefined && s.aoVivo) { abrir(intervaloHtml(s, [])); return; }
  if (d.avancarTatica !== undefined) { aba = "inicio"; fechar(); }
  if (d.licenca !== undefined) { const r = estudarLicenca(s); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.aulas) { const r = pagarAulas(s, d.aulas); msg = { texto: r.msg, ok: r.ok }; salvar(); abrir(fichaJogador(s, d.aulas)); render(); return; }
  if (d.curso) { const r = recomendarCurso(s, d.curso); msg = { texto: r.msg, ok: r.ok }; salvar(); abrir(fichaJogador(s, d.curso)); render(); return; }
  if (d.jog) { msg = undefined; abrir(fichaJogador(s, d.jog)); return; }
  if (d.conv && d.id) { const r = conversar(s, d.id, d.conv as Conversa); msg = { texto: r.msg, ok: r.ok }; salvar(); abrir(fichaJogador(s, d.id)); render(); return; }
  if (d.renovar && d.id) { const r = renovar(pacote, s, d.id, +d.renovar); msg = { texto: r.msg, ok: r.ok }; salvar(); abrir(fichaJogador(s, d.id)); render(); return; }
  if (d.dispensar !== undefined && d.id) { const r = dispensar(s, d.id); msg = { texto: r.msg, ok: r.ok }; if (r.ok) { fechar(); prepararMundo(pacote, s); redesenhar(); } else abrir(fichaJogador(s, d.id)); return; }
  if (d.vaga !== undefined) { abrir(escolherVaga(s, +d.vaga)); return; }
  if (d.escolher !== undefined && d.i !== undefined) {
    if (s.aoVivo && d.escolher && !s.aoVivo.emCampo1.includes(d.escolher) && !s.esc.titulares.includes(d.escolher) && trocasNoIntervalo(s) >= MAX_TROCAS) { msg = { texto: `Já foram as ${MAX_TROCAS} trocas.`, ok: false }; fechar(); redesenhar(); return; }
    trocarNaVaga(s, +d.i, d.escolher || null); fechar(); redesenhar(false); return;
  }
  if (d.form) { if (s.aoVivo) reorganizarNoIntervalo(s, d.form); else mudarFormacao(s, d.form); redesenhar(false); return; }
  if (d.melhor !== undefined && !s.aoVivo) { s.esc = melhorEscalacao(s.elenco, s.tatica.formacao); redesenhar(false); return; }
  if (d.tat && d.v !== undefined) { const k = d.tat as keyof typeof s.tatica; (s.tatica as unknown as Record<string, number | boolean>)[k] = k === "contraAtaque" ? d.v === "1" : +d.v; redesenhar(false); return; }
  if (d.treino && d.v) { (s.treino as unknown as Record<string, string>)[d.treino] = d.v; redesenhar(false); return; }
  if (d.ped) { const r = pedirDiretoria(s, d.ped as Pedido); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.staffC && d.nome) { const r = contratarStaff(s, d.staffC as Funcao, d.nome); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.staffD) { const r = demitirStaff(s, d.staffD as Funcao); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.mpos !== undefined) { filtroMercado.pos = (d.mpos || undefined) as PosT | undefined; render(); return; }
  if (d.midade !== undefined) { filtroMercado.idadeMax = +d.midade || undefined; render(); return; }
  if (d.mliga !== undefined) { filtroMercado.minhaLiga = d.mliga === "1"; render(); return; }
  if (d.malc !== undefined) { filtroMercado.alcance = d.malc === "1"; render(); return; }
  if (d.alvo && d.clube) { msgNeg = undefined; abrir(negociarHtml(s, d.alvo, d.clube)); return; }
  if (d.anosprop) { anosProposta = +d.anosprop; const n = $("tela").querySelector<HTMLElement>("[data-enviar-oferta]"), v = (document.getElementById("ofertaValor") as HTMLInputElement | null)?.value; if (n) { abrir(negociarHtml(s, n.dataset.alvoN!, n.dataset.clube!)); const el = document.getElementById("ofertaValor") as HTMLInputElement | null; if (el && v) el.value = v; } return; }
  if (d.preencher && d.v) { const el = document.getElementById(d.preencher) as HTMLInputElement | null; if (el) { el.value = naTela(+d.v); el.focus(); } return; }
  if (d.enviarOferta !== undefined && d.alvoN && d.clube) {
    const v = lerValor("ofertaValor");
    if (!v) { msgNeg = { texto: "Digite o valor da oferta.", ok: false }; abrir(negociarHtml(s, d.alvoN, d.clube)); return; }
    const r = fazerProposta(pacote, s, d.alvoN, d.clube, v, anosProposta);
    msgNeg = { texto: r.msg, ok: r.ok, ...(r.pedido ? { pedido: r.pedido } : {}) }; salvar();
    if (r.status === "fechado") { fechar(); msg = { texto: r.msg, ok: true }; sub.elenco = "jogadores"; render(); return; }
    abrir(negociarHtml(s, d.alvoN, d.clube)); render(); return;
  }
  if (d.venda) { msg = { texto: alternarVenda(s, d.venda), ok: true }; salvar(); abrir(fichaJogador(s, d.venda)); render(); return; }
  if (d.prop && d.r) {
    const pedido = d.campo ? lerValor(d.campo) : undefined;
    if (d.r === "contra" && !pedido) { msg = { texto: "Digite quanto você quer pelo jogador.", ok: false }; redesenhar(); return; }
    const r = responderPropostaT(pacote, s, d.prop, d.r as "aceitar" | "recusar" | "contra", pedido); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return;
  }
  if (d.irPropostas !== undefined) { aba = "elenco"; sub.elenco = "propostas"; render(); window.scrollTo(0, 0); return; }
  if (d.livre && d.anos) { const r = contratarLivre(pacote, s, d.livre, +d.anos); msg = { texto: r.msg, ok: r.ok }; if (r.ok) prepararMundo(pacote, s); redesenhar(); return; }
  if (d.recomecar !== undefined) { anterior = s; save = null; render(); window.scrollTo(0, 0); return; }
  if (d.apagar !== undefined) {
    if (!b.dataset.certeza) { b.dataset.certeza = "1"; b.textContent = "Toque de novo para apagar"; return; }
    try { localStorage.removeItem(CHAVE_TECNICO); } catch { /* ok */ }
    save = null; render(); return;
  }
});

if (save) prepararMundo(pacote, save);
render();
void (async () => {
  if (!(await nuvemDisponivel())) return;
  if (save) { nuvem.agora(); return; }
  const r = await ultimoDaNuvem("tecnico");
  const s = r ? (JSON.parse(r.json) as SaveTecnico) : null;
  if (!s?.elenco || save) return;
  save = s; gravar(CHAVE_TECNICO, s); prepararMundo(pacote, s);
  msg = { texto: `Carreira recuperada da sua conta: ${r!.meta.rotulo}.`, ok: true }; render();
})();
