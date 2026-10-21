// A semana do jogador: início (criação e ofertas de base), plano da semana, jogo narrado com decisões e resumo.
import pacoteJson from "../../data/pacote-brasil-serie-a-v0.3.json";
import type { PacoteDados } from "../../src/liga";
import { ordenar } from "../../src/liga";
import { ATRIBUTOS, GRUPO, type Atributo, type Grupo, type Intensidade } from "../../src/atributos";
import { criarJogador, type EscolhasCriacao } from "../../src/dna";
import { conforto, efeitosDaCasa, imovelAtual, nomeImovel, dinheiro } from "../../src/casa";
import {
  ACOES, NOME_ESCALACAO, SEMANAS_PRE, clubeCasa, decisaoComemoracao, clubeDe, concluirSemana, escalacao, forma, jogoDaSemana, liga, novoJogo,
  ofertasDeBase, ovr, planoPadrao, prepararPartida, previaPlano, resolverDecisao, rotuloSemana, salarioLiquido,
  type Acao, type DadosCriacao, type Decisao, type Partida, type Plano, type ResultadoDecisao, type ResumoSemana, type Save,
} from "../../src/jogo";
import { svgFoto, APARENCIA_PADRAO, type Aparencia } from "../criacao/avatar";
import { svgComodo } from "../casa/iso";

const pacote = pacoteJson as unknown as PacoteDados;
const L = liga(pacote);
const CHAVE_SAVE = "mycarrerinha:save", CHAVE_JOGADOR = "mycarrerinha:jogador", CHAVE_PLANO = "mycarrerinha:plano";
const ler = <T>(k: string): T | null => { try { return JSON.parse(localStorage.getItem(k) ?? "null") as T | null; } catch { return null; } };
const gravar = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } };
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const NOME_POS: Record<string, string> = { ZAG: "Zagueiro", LAT: "Lateral", VOL: "Volante", MEI: "Meia", PON: "Ponta", ATA: "Centroavante" };
const NOME_AT: Record<Atributo, string> = { VEL: "Velocidade", RES: "Resistência", FOR: "Força", PAS: "Passe", CRU: "Cruzamento", DRI: "Drible", FIN: "Finalização", CAB: "Cabeceio", MAR: "Marcação", VIS: "Visão", POS: "Posicionamento", COM: "Compostura" };
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

let save: Save | null = ler<Save>(CHAVE_SAVE);
let plano: Plano = ler<Plano>(CHAVE_PLANO) ?? planoPadrao();
let aba: "tabela" | "jogador" | "noticias" | "casa" = "tabela";
const salvar = () => { if (save) gravar(CHAVE_SAVE, save); gravar(CHAVE_PLANO, plano); };

// ------------------------------------------------------------------ peças visuais
function cores(id: string): string[] { return clubeCasa(pacote, id).cores; }
function escudo(id: string): string {
  const [a, b] = cores(id), c2 = b ?? "#FFFFFF";
  return `<svg class="escudo" viewBox="0 0 26 30" aria-hidden="true"><path d="M1 1 H25 V14 Q25 24 13 29 Q1 24 1 14 Z" fill="${a}" stroke="#0A0A0A" stroke-width="1.6"/><path d="M1 12 H25 V17 H1 Z" fill="${c2}" opacity=".9"/><path d="M1 1 H25 V14 Q25 24 13 29 Q1 24 1 14 Z" fill="none" stroke="#0A0A0A" stroke-width="1.6"/></svg>`;
}
function foto(s: Save): string {
  const [a, b] = cores(s.carreira.clubeId);
  const ap = { ...APARENCIA_PADRAO, ...((s.jogador.aparencia as Partial<Aparencia>) ?? {}) };
  return svgFoto({ aparencia: ap, camisa: { cor1: a.toUpperCase() === "#FFFFFF" ? "#F4F4F2" : a, cor2: b ?? "#111111", estilo: "lisa" }, numero: s.jogador.numero, traje: "jogo" });
}
const barra = (nome: string, v: number, max = 100, cor?: string, txt?: string) =>
  `<div class="barra">${nome}<b>${txt ?? Math.round(v)}</b><i style="--v:${Math.max(0, Math.min(100, (100 * v) / max))}%${cor ? `;--c:${cor}` : ""}"></i></div>`;
const estrelas = (n: number) => `<span class="estrelas" aria-label="${n} de 5">${"★".repeat(n)}${'<span style="opacity:.25">' + "★".repeat(5 - n) + "</span>"}</span>`;
const sinal = (v: number, casas = 0) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(casas)}`;

// ------------------------------------------------------------------ telas
function render() {
  const app = $("app");
  if (!save) {
    const dados = ler<DadosCriacao>(CHAVE_JOGADOR);
    app.innerHTML = dados?.resultado ? telaOfertas(dados) : telaInicio();
    return;
  }
  app.innerHTML = telaSemana(save);
}

function telaInicio(): string {
  return `<header class="marca"><strong>Mycarrerinha</strong><span>Carreira</span></header>
    <h1>Sua carreira começa aos 16.</h1>
    <p class="sub" style="font-size:16px">Crie o jogador, escolha o clube que vai te formar e jogue semana a semana: treino, descanso, família, redes, o jogo de domingo e a casa que você vai montando com o salário.</p>
    <a class="botao grande" href="criacao.html">Criar meu jogador</a>
    <button class="botao sec" data-acao="exemplo">Começar com um jogador de exemplo</button>`;
}

function telaOfertas(d: DadosCriacao): string {
  const of = ofertasDeBase(pacote, d), r = d.resultado;
  return `<header class="marca"><strong>Mycarrerinha</strong><span>Primeira decisão</span></header>
    <p class="rotulo">${esc(r.escolhas.nome)} · ${NOME_POS[r.escolhas.posicao]} · OVR ${r.ovr}</p>
    <h1>Três clubes querem você na base.</h1>
    <p class="sub">A estrutura do clube decide onde você mora. Clube grande tem fila maior para chegar ao profissional.</p>
    <div class="ofertas">${of.map((o) => `<div class="oferta" style="--c1:${o.cores[0].toUpperCase() === "#FFFFFF" ? o.cores[1] : o.cores[0]}"><div class="faixa"></div><div class="corpo">
      <div style="display:flex;gap:10px;align-items:center">${escudo(o.clubeId)}<h2>${esc(o.nome)}</h2></div>
      <p class="sub">${esc(o.texto)}</p>
      <div class="linha-info"><span>Estrutura ${estrelas(o.estrutura)} ${o.nomeEstrutura.toLowerCase()}</span><span>Força do elenco <b>${o.forca}</b></span><span>Na sua posição: <b>${o.fila}</b> no elenco profissional</span></div>
      <p class="sub">Moradia: ${esc(o.moradia)}</p>
      <button class="botao" data-assinar="${o.clubeId}">Assinar com o ${esc(o.apelido)}</button></div></div>`).join("")}</div>
    <a class="sub" href="criacao.html" style="text-align:center">Criar outro jogador</a>`;
}

function telaSemana(s: Save): string {
  const c = s.carreira, j = s.jogador, clube = clubeDe(L, c.clubeId), jogo = jogoDaSemana(s);
  const prev = previaPlano(s, plano), escPrev = escalacao(pacote, s, prev.cansaco);
  const pos = ordenar(c.tabela).findIndex((t) => t.clube === c.clubeId) + 1;
  const tagCls = escPrev === "titular" ? "titular" : escPrev === "banco" || escPrev === "base" ? "banco" : escPrev === "semJogo" ? "" : "ruim";
  const jogoHtml = jogo ? `<div class="confronto"><div class="time">${escudo(jogo.casa)}<span>${esc(clubeDe(L, jogo.casa).nome)}</span></div><span class="vs">×</span><div class="time dir"><span>${esc(clubeDe(L, jogo.fora).nome)}</span>${escudo(jogo.fora)}</div></div>
      <div class="linha-info"><span>${jogo.souCasa ? "Em casa" : "Fora de casa"}</span><span>Rodada <b>${jogo.rodada + 1}</b> de 38</span><span>${esc(clube.nome)} em <b>${pos || "–"}º</b></span></div>`
    : `<p class="sub">Pré-temporada: sem jogo oficial. Semana de treino forte para chegar bem na estreia.</p>`;
  const previsao = escPrev === "semJogo" ? "" : `<div><span class="tag ${tagCls}">${escPrev === "base" ? "Jogo da base (sub-17)" : `Previsão: ${NOME_ESCALACAO[escPrev].toLowerCase()}`}</span></div>`;
  const focos: [Grupo, string][] = [["fisico", "Físico"], ["tecnico", "Técnico"], ["tatico", "Tático"]];
  const ints: [Intensidade, string][] = [["leve", "Leve"], ["normal", "Normal"], ["alta", "Puxado"]];
  const acoesDisp = (Object.keys(ACOES) as Acao[]).filter((a) => a !== "video" || jogo);
  return `<header class="marca"><strong>Mycarrerinha</strong><span>${esc(rotuloSemana(c))}</span></header>
  <section class="painel">
    <div class="jogador"><div class="foto">${foto(s)}</div>
      <div><div class="nome">${esc(j.apelido)}</div><div class="det">${NOME_POS[j.posicao]} · ${j.idade} anos · ${esc(clube.nome)}${c.formacao ? " (base)" : ""}</div><div class="det">${esc(j.perfilNome)}</div></div>
      <div class="ovr"><strong>${Math.round(ovr(j))}</strong><span>OVR</span></div></div>
    <div class="barras">${barra("Moral", c.moral, 100, "#74D394")}${barra("Cansaço", c.cansaco, 100, c.cansaco > 60 ? "#EC7D69" : "#E3B341")}${barra("Forma", forma(c), 10, "#6FB7E0", forma(c).toFixed(1))}${barra("Técnico", c.relTecnico, 100, "#B9A3E8")}</div>
    <div class="linha-info"><span>Saldo <b>${dinheiro(s.casa.saldo)}</b></span><span>Salário <b>${dinheiro(c.salario)}</b>/mês</span><span>Fama <b>${c.fama.toFixed(1)}</b></span><span><b>${c.seguidores.toLocaleString("pt-BR")}</b> seguidores</span>${c.lesao ? `<span style="color:var(--neg)">Lesionado: <b>${c.lesao}</b> sem.</span>` : ""}</div>
  </section>

  <section class="painel jogo-card"><p class="rotulo">Esta semana</p>${jogoHtml}${previsao}</section>

  <section class="painel grupo-plano" aria-label="Plano da semana">
    <p class="rotulo">Treino do clube</p>
    <div class="chips" style="flex-wrap:wrap">${focos.map(([k, n]) => `<button class="chip${plano.foco === k ? " ativo" : ""}" data-foco="${k}">${n}</button>`).join("")}<span style="width:8px"></span>${ints.map(([k, n]) => `<button class="chip${plano.intensidade === k ? " ativo" : ""}" data-int="${k}">${n}</button>`).join("")}</div>
    <p class="rotulo" style="margin-top:6px">Seu tempo livre</p>
    <div class="grade-semana" role="grid" aria-label="Tempo livre de segunda a sexta">
      <span></span>${DIAS.map((d, i) => `<span class="cab">${d}${i === 4 && jogo ? "<small>véspera</small>" : ""}</span>`).join("")}
      ${acoesDisp.map((a) => `<span class="acao">${ACOES[a].nome}<small>${esc(ACOES[a].efeito)}</small></span>${DIAS.map((d, i) => `<button class="cel${plano.acoes[i] === a ? " ativo" : ""}" data-dia="${i}" data-a="${a}" aria-label="${d}: ${ACOES[a].nome}" aria-pressed="${plano.acoes[i] === a}"></button>`).join("")}`).join("")}
    </div>
    <div class="previa"><span>Cansaço no jogo <b>${prev.cansaco}</b></span><span>Moral <b>${prev.moral}</b></span><span>Evolução <b>${sinal(prev.evolucao)}%</b></span>${prev.notaExtra ? `<span>Nota <b>+${prev.notaExtra.toFixed(2)}</b></span>` : ""}</div>
  </section>
  <button class="botao grande" data-acao="jogar">${jogo && escPrev !== "lesionado" ? "Ir para o jogo" : "Fechar a semana"}</button>

  <div class="abas" role="tablist">${[["tabela", "Tabela"], ["jogador", "Jogador"], ["noticias", "Notícias"], ["casa", "Casa"]].map(([k, n]) => `<button class="${aba === k ? "ativo" : ""}" data-aba="${k}" role="tab" aria-selected="${aba === k}">${n}</button>`).join("")}</div>
  <section class="painel">${aba === "tabela" ? abaTabela(s) : aba === "jogador" ? abaJogador(s) : aba === "noticias" ? abaNoticias(s) : abaCasa(s)}</section>
  <details class="painel teste"><summary>Opções</summary><p class="sub" style="margin:8px 0">O jogo salva sozinho neste navegador.</p><button class="botao sec peq" data-acao="recomecar">Apagar carreira e recomeçar</button></details>`;
}

function abaTabela(s: Save): string {
  const t = ordenar(s.carreira.tabela);
  return `<table><thead><tr><th>#</th><th>Clube</th><th class="n">P</th><th class="n">J</th><th class="n">SG</th></tr></thead><tbody>${t.map((x, i) => `<tr class="${x.clube === s.carreira.clubeId ? "meu" : ""}"><td>${i + 1}</td><td>${esc(clubeDe(L, x.clube).nome)}</td><td class="n">${x.pts}</td><td class="n">${x.j}</td><td class="n">${x.gp - x.gc}</td></tr>`).join("")}</tbody></table>`;
}

function abaJogador(s: Save): string {
  const j = s.jogador, c = s.carreira, st = c.stats;
  const media = st.notas.length ? (st.notas.reduce((a, b) => a + b, 0) / st.notas.length).toFixed(2) : "–";
  const grupos: [string, Grupo][] = [["Físico", "fisico"], ["Técnico", "tecnico"], ["Tático", "tatico"]];
  return `<p class="rotulo">Atributos · olheiros veem potencial ${j.faixaPot[0]}–${j.faixaPot[1]}</p>
    ${grupos.map(([n, g]) => `<p class="sub" style="margin:10px 0 6px;font-weight:600">${n}</p><div class="atrs">${ATRIBUTOS.filter((a) => GRUPO[a] === g).map((a) => barra(NOME_AT[a], j.at[a], 99, "#E3B341", j.at[a].toFixed(0))).join("")}</div>`).join("")}
    <p class="rotulo" style="margin-top:16px">Temporada</p>
    <div class="kv" style="margin-top:6px"><span>Jogos no profissional</span><b>${st.jogos} (${st.titular} como titular)</b><span>Gols / assistências</span><b>${st.gols} / ${st.assist}</b><span>Nota média</span><b>${media}</b><span>Jogos na base</span><b>${st.base} (${st.baseGols} gols)</b><span>Contrato</span><b>${c.formacao ? "Base" : "Profissional"} · ${c.anosContrato} ${c.anosContrato === 1 ? "ano" : "anos"}</b><span>Salário líquido</span><b>${dinheiro(salarioLiquido(c))}/mês</b></div>
    ${c.historico.length ? `<p class="rotulo" style="margin-top:16px">Carreira</p><table><thead><tr><th>Ano</th><th>Clube</th><th class="n">OVR</th><th class="n">J</th><th class="n">G</th><th class="n">Nota</th></tr></thead><tbody>${c.historico.map((h) => `<tr><td>${h.ano}</td><td>${esc(h.clube)}</td><td class="n">${h.ovr}</td><td class="n">${h.jogos}</td><td class="n">${h.gols}</td><td class="n">${h.nota || "–"}</td></tr>`).join("")}</tbody></table>` : ""}`;
}

function abaNoticias(s: Save): string {
  return s.noticias.length ? `<div style="display:flex;flex-direction:column;gap:12px">${s.noticias.slice(0, 25).map((n) => `<div class="noticia ${n.tipo}"><small>${esc(n.semana)}</small><strong>${esc(n.titulo)}</strong><span class="sub">${esc(n.texto)}</span></div>`).join("")}</div>` : `<p class="sub">Nada por enquanto.</p>`;
}

function abaCasa(s: Save): string {
  const m = imovelAtual(s.casa), ef = efeitosDaCasa(s.casa).total;
  const c0 = m.comodos[0];
  return `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><div><p class="rotulo">Onde você mora</p><h2>${esc(nomeImovel(s.casa, m))}</h2></div><div class="ovr"><strong style="font-size:32px">${conforto(s.casa)}</strong><span>Conforto</span></div></div>
    <div class="casa-mini" style="margin-top:10px">${svgComodo(s.casa, c0.id)}</div>
    <p class="sub" style="margin-top:10px">A casa entra na semana: recuperação ${sinal(ef.recuperacao)}, moral ${sinal(ef.moral)}, proteção contra lesão ${sinal(ef.lesao)}%, evolução ${sinal(ef.evolucao)}%, fama ${sinal(ef.fama)}.</p>
    <a class="botao" href="casa.html" style="margin-top:12px;width:100%">Entrar em casa</a>`;
}

// ------------------------------------------------------------------ partida narrada
let partida: Partida | undefined;
let resultados: ResultadoDecisao[] = [];
type ItemFila = { min: number; html?: string; decisao?: Decisao; gol?: "casa" | "fora"; meu?: "gol" | "assist"; saida?: boolean };
let fila: ItemFila[] = [];
let placar = [0, 0], timer = 0, minutoAtual = 0, nDec = 0, amarelos = 0, expulso = false, comemorou = false;
const decisoesAbertas: Record<number, Decisao> = {};

function htmlGol(p: Partida, lado: "casa" | "fora", meu?: "gol" | "assist") {
  const nome = save!.jogador.apelido, time = lado === "casa" ? p.nomeCasa : p.nomeFora, meuTime = (lado === "casa") === p.souCasa;
  const extra = meu === "gol" ? ` GOL de ${esc(nome)}!` : meu === "assist" ? ` Assistência de ${esc(nome)}.` : "";
  return `<span class="${meuTime ? (meu ? "meu" : "") : "contra"}">Gol do ${esc(time)}.${extra}</span>`;
}

function abrirJogo() {
  if (!save) return;
  partida = prepararPartida(pacote, save, plano);
  resultados = [];
  if (!partida || partida.escalacao === "lesionado" || partida.escalacao === "fora" || partida.escalacao === "suspenso" || (partida.escalacao === "banco" && partida.entrada > 90 && partida.lances.length === 0)) { fecharSemana(); return; }
  const p = partida, nome = save.jogador.apelido;
  placar = [0, 0]; minutoAtual = 0; amarelos = 0; expulso = false; comemorou = false;
  fila = [{ min: 0, html: `Bola rolando${p.tipo === "base" ? " no jogo da base" : ""}.${p.escalacao === "titular" || p.tipo === "base" ? ` ${esc(nome)} começa jogando.` : ` ${esc(nome)} começa no banco.`}` }];
  if (p.entrada > 0 && p.entrada <= 90) fila.push({ min: p.entrada, html: `Substituição: ${esc(nome)} entra em campo.` });
  if (p.saida < 90) fila.push({ min: p.saida, saida: true, html: `${esc(nome)} sente o cansaço e é substituído.` });
  fila.push({ min: 45, html: "Intervalo." });
  for (const l of p.lances) fila.push({ min: l.min, gol: l.lado, meu: l.meu });
  p.decisoes.forEach((d) => fila.push({ min: d.min, decisao: d }));
  fila.sort((a, b) => a.min - b.min || (a.decisao ? 1 : 0) - (b.decisao ? 1 : 0));
  fila.push({ min: 90, html: "Fim de jogo." });
  $("telaJogo").innerHTML = `<div class="placar"><p class="rotulo" style="text-align:center;margin-bottom:6px">${p.tipo === "base" ? "Sub-17" : rotuloSemana(save.carreira)}</p>
    <div class="linha"><div class="time">${escudo(p.casa)}<span>${esc(p.nomeCasa)}</span></div><div class="gols" id="gols">0 × 0</div><div class="time dir"><span>${esc(p.nomeFora)}</span>${escudo(p.fora)}</div></div>
    <div class="min" id="minuto">0'</div></div>
    <div class="lances" id="lances"></div><div class="rodape" id="rodapeJogo"><button class="botao sec grande" data-acao="acelerar">Pular para o próximo lance</button></div>`;
  ($("dlgJogo") as HTMLDialogElement).showModal();
  avancar();
}

function atualizarPlacar() { $("gols").textContent = `${placar[0]} × ${placar[1]}`; $("minuto").textContent = `${minutoAtual}'`; }
function adicionarLance(min: number, html: string, cls = "") {
  const el = document.createElement("div"); el.className = `lance ${cls}`; el.innerHTML = `<span class="m">${min}'</span><span>${html}</span>`;
  $("lances").appendChild(el); el.scrollIntoView({ behavior: "smooth", block: "end" });
}

function avancar() {
  clearTimeout(timer);
  const item = fila.shift();
  if (!item || !partida || !save) return;
  minutoAtual = item.min;
  if (item.decisao) { mostrarDecisao(item.decisao); atualizarPlacar(); return; }
  if (item.gol) { if (item.gol === "casa") placar[0]++; else placar[1]++; }
  atualizarPlacar();
  adicionarLance(item.min, item.html ?? htmlGol(partida, item.gol!, item.meu), item.gol ? "gol" : "");
  if (item.meu === "gol") abrirComemoracao(item.min);
  if (!fila.length) { $("rodapeJogo").innerHTML = `<button class="botao grande" data-acao="fimjogo">Ver a semana</button>`; return; }
  timer = window.setTimeout(avancar, item.gol ? 1100 : 650);
}

/** Na primeira vez que o jogador marca no jogo, ele escolhe como comemorar. */
function abrirComemoracao(min: number) {
  if (comemorou || expulso) return;
  comemorou = true;
  fila.unshift({ min, decisao: decisaoComemoracao(min) });
}

function mostrarDecisao(d: Decisao) {
  const i = nDec++; decisoesAbertas[i] = d;
  const el = document.createElement("div"); el.className = "decisao"; el.id = `dec${i}`;
  el.innerHTML = `<p class="rotulo" style="color:var(--ouro)">${d.min}' · Sua decisão</p><h2>${esc(d.titulo)}</h2><p class="sub" style="font-size:15px;color:var(--giz)">${esc(d.texto)}</p>
    <div class="ops">${d.opcoes.map((o) => `<button data-decidir="${i}" data-op="${o.id}"><span>${esc(o.rotulo)}</span><small>›</small></button>`).join("")}</div>`;
  $("lances").appendChild(el); el.scrollIntoView({ behavior: "smooth", block: "end" });
  $("rodapeJogo").innerHTML = `<p class="sub" style="text-align:center">Escolha uma opção.</p>`;
}

function decidir(i: number, op: string) {
  const p = partida!, d = decisoesAbertas[i];
  if (!d) return;
  delete decisoesAbertas[i];
  const r = resolverDecisao(save!, p, d, op);
  resultados.push(r);
  const el = $(`dec${i}`);
  el.querySelector(".ops")!.innerHTML = `<div class="resultado n${r.nivel}">${esc(r.texto)}</div>`;
  const meuLado: "casa" | "fora" = p.souCasa ? "casa" : "fora", outro: "casa" | "fora" = p.souCasa ? "fora" : "casa";
  const novos: ItemFila[] = [];
  if (r.golPro) novos.push({ min: d.min, gol: meuLado, meu: r.meu });
  if (r.golContra) novos.push({ min: d.min, gol: outro });
  if (r.lesao) novos.push({ min: d.min, html: `<span class="contra">${esc(save!.jogador.apelido)} sente uma lesão e pede atendimento.</span>` });
  if (r.amarelo) amarelos++;
  if (r.vermelho || amarelos >= 2) {
    expulso = true;
    novos.push({ min: d.min, html: `<span class="cartao vermelho"></span><span class="contra">${r.vermelho ? "Cartão vermelho direto" : "Segundo amarelo, depois o vermelho"}. ${esc(save!.jogador.apelido)} está expulso.</span>` });
    // fora de campo: some o resto das decisões, a saída por cansaço e o crédito pelos gols que ainda vão sair
    fila = fila.filter((x) => !x.decisao && !x.saida).map((x) => (x.meu ? { ...x, meu: undefined } : x));
  } else if (r.amarelo) novos.push({ min: d.min, html: `<span class="cartao"></span>Cartão amarelo para ${esc(save!.jogador.apelido)}.` });
  fila.unshift(...novos);
  $("rodapeJogo").innerHTML = `<button class="botao sec grande" data-acao="acelerar">Pular para o próximo lance</button>`;
  timer = window.setTimeout(avancar, 1300);
}

// ------------------------------------------------------------------ fim da semana
function fecharSemana() {
  if (!save) return;
  const r = concluirSemana(pacote, save, plano, partida, resultados);
  partida = undefined; resultados = [];
  if (save.carreira.semana === 0) plano = planoPadrao();
  salvar();
  ($("dlgJogo") as HTMLDialogElement).close();
  mostrarResumo(r);
  render();
}

function mostrarResumo(r: ResumoSemana) {
  const p = r.partida, d = (a: [number, number], casas = 0, inv = false) => { const v = a[1] - a[0]; const bom = inv ? v < 0 : v > 0; return `<span class="delta ${v === 0 ? "" : bom ? "pos" : "neg"}">${Math.round(a[0])} → ${Math.round(a[1])}</span>`; void casas; };
  const partidaHtml = p ? `<section class="painel"><p class="rotulo">${p.tipo === "base" ? "Jogo da base" : "Jogo"}</p><h2 style="margin:4px 0">${esc(p.nomeCasa)} ${p.golsCasa} × ${p.golsFora} ${esc(p.nomeFora)}</h2>
      ${p.minutos > 0 ? `<div style="display:flex;gap:18px;align-items:flex-end"><div><div class="grande-num">${p.nota.toFixed(1)}</div><span class="rotulo">Nota</span></div><div class="kv" style="flex:1"><span>Minutos</span><b>${p.minutos}</b><span>Gols</span><b>${p.gols}</b><span>Assistências</span><b>${p.assist}</b></div></div>` : `<p class="sub">Você não entrou em campo.</p>`}</section>`
    : `<section class="painel"><p class="rotulo">${r.rotulo}</p><p class="sub">${esc(NOME_ESCALACAO[r.escalacao])}${r.escalacao === "semJogo" ? ": semana de treinos." : "."}</p></section>`;
  const fim = r.fimDeTemporada ? `<section class="painel" style="border-color:var(--ouro)"><p class="rotulo">Fim da temporada ${r.fimDeTemporada.ano}</p><h2 style="margin:4px 0">${esc(r.fimDeTemporada.clube)} em ${r.fimDeTemporada.posicao}º${r.fimDeTemporada.titulo ? " · CAMPEÃO!" : ""}</h2>
      <div class="kv"><span>Jogos no profissional</span><b>${r.fimDeTemporada.jogos}</b><span>Gols / assistências</span><b>${r.fimDeTemporada.gols} / ${r.fimDeTemporada.assist}</b><span>Jogos na base</span><b>${r.fimDeTemporada.base}</b><span>OVR</span><b>${r.fimDeTemporada.ovr}</b></div><p class="sub" style="margin-top:8px">Agora você tem ${save!.jogador.idade} anos. Uma nova temporada começa com a pré-temporada.</p></section>` : "";
  $("telaResumo").innerHTML = `<div class="resumo"><p class="rotulo">${esc(r.rotulo)}</p><h1>Resumo da semana</h1>${partidaHtml}${fim}
    <section class="painel"><div style="display:flex;justify-content:space-between;align-items:flex-end"><div><p class="rotulo">OVR</p><div class="grande-num">${Math.round(r.ovrDepois)}</div></div><span class="delta ${r.ovrDepois - r.ovrAntes > 0 ? "pos" : ""}">${sinal(r.ovrDepois - r.ovrAntes, 2)}</span></div>
      <p class="sub" style="margin-top:6px">Mais evoluíram: ${r.ganhos.map(([a, v]) => `${NOME_AT[a]} ${sinal(v, 2)}`).join(" · ")}</p></section>
    <section class="painel kv"><span>Moral</span>${d(r.moral)}<span>Cansaço</span>${d(r.cansaco, 0, true)}<span>Fama</span>${d(r.fama)}${r.dinheiro ? `<span>Salário</span><b class="delta pos">+${dinheiro(r.dinheiro.salario)}</b>${r.dinheiro.aluguel ? `<span>Aluguel</span><b class="delta neg">−${dinheiro(r.dinheiro.aluguel)}</b>` : ""}` : ""}${r.posicaoTabela && !r.fimDeTemporada && save!.carreira.semana > SEMANAS_PRE ? `<span>Clube na tabela</span><b>${r.posicaoTabela}º</b>` : ""}</section>
    ${r.eventos.length ? `<section class="painel" style="display:flex;flex-direction:column;gap:6px">${r.eventos.map((e) => `<p class="sub" style="color:var(--giz)">${esc(e)}</p>`).join("")}</section>` : ""}
    </div><div class="rodape"><button class="botao grande" data-acao="proxima">Próxima semana</button></div>`;
  ($("dlgResumo") as HTMLDialogElement).showModal();
}

// ------------------------------------------------------------------ eventos
document.addEventListener("click", (ev) => {
  const b = (ev.target as Element).closest<HTMLElement>("[data-acao],[data-assinar],[data-foco],[data-int],[data-dia],[data-aba],[data-decidir]");
  if (!b) return;
  const d = b.dataset;
  if (d.assinar) {
    const dados = ler<DadosCriacao>(CHAVE_JOGADOR)!;
    save = novoJogo(pacote, dados, d.assinar); plano = planoPadrao(); salvar(); render(); window.scrollTo(0, 0);
  } else if (d.foco) { plano.foco = d.foco as Grupo; salvar(); render(); }
  else if (d.int) { plano.intensidade = d.int as Intensidade; salvar(); render(); }
  else if (d.dia) { plano.acoes[+d.dia] = d.a as Acao; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.aba) { aba = d.aba as typeof aba; render(); }
  else if (d.decidir) decidir(+d.decidir, d.op!);
  else switch (d.acao) {
    case "exemplo": {
      const e: EscolhasCriacao = { nome: "Gabriel Souza", apelido: "Gabi", pais: "BRA", familia: "humilde", formacao: "rua", alturaCm: 176, pe: "esquerdo", posicao: "PON", clubeCoracao: "FLA" };
      gravar(CHAVE_JOGADOR, { resultado: criarJogador(e), aparencia: { ...APARENCIA_PADRAO, cabelo: "cacheado", pele: 4 }, clube: "FLA", perfil: undefined, decisao: null });
      render(); break;
    }
    case "jogar": abrirJogo(); break;
    case "acelerar": clearTimeout(timer); avancar(); break;
    case "fimjogo": fecharSemana(); break;
    case "proxima": ($("dlgResumo") as HTMLDialogElement).close(); window.scrollTo(0, 0); break;
    case "recomecar":
      if (b.dataset.certeza) { try { localStorage.removeItem(CHAVE_SAVE); localStorage.removeItem(CHAVE_PLANO); } catch { /* ok */ } save = null; render(); }
      else { b.dataset.certeza = "1"; b.textContent = "Toque de novo para apagar tudo"; }
      break;
  }
});
$("dlgJogo").addEventListener("cancel", (ev) => ev.preventDefault());
void SEMANAS_PRE;
render();
