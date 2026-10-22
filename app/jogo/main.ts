// A semana do jogador: início (criação e ofertas de base), plano da semana, jogo narrado com decisões e resumo.
import { camisaCostas } from "../visual/camisas";
import type { Reliquia } from "../../src/casa";
import pacoteJson from "../../data/pacote-brasil-serie-a-v0.3.json";
import type { PacoteDados } from "../../src/liga";
import { ordenar } from "../../src/liga";
import { ATRIBUTOS, GRUPO, type Atributo, type Grupo, type Intensidade } from "../../src/atributos";
import { criarJogador, type EscolhasCriacao } from "../../src/dna";
import { conforto, efeitosDaCasa, imovelAtual, nomeImovel, dinheiro, registrarReliquias, manutencaoMensal, ehDono } from "../../src/casa";
import {
  ACOES, NOME_ESCALACAO, SEMANAS_PRE, clubeCasa, decisaoComemoracao, decisaoPosJogo, clubeDe, concluirSemana, escalacao, forma, jogoDaSemana, liga, novoJogo,
  ofertasDeBase, ovr, planoPadrao, nRodadas, ligaAtual, semanaAutomatica, categoriaBase, prepararPartida, previaPlano, resolverDecisao, rotuloSemana, salarioLiquido,
  ANO_INICIAL, type ResumoTemporada, type Noticia, type ImgNoticia, type Acao, type DadosCriacao, type Decisao, type Partida, type Plano, type ResultadoDecisao, type ResumoSemana, type Save,
  ofertasDoCaminho, gradeDoClube, escolherNumero, saidasAtuais, agirRelacao, responderSugestao, treinarPosicao, mudarPosicao, familiaridadeDe, melhoresAmigos, semanaAbsJogo, ovrEm,
  migrarSave, tatuar, removerTatuagem, eventoPendente, resolverEvento, padraoDe, alvoDeSeguidores, aceitarPatrocinio, recusarPatrocinio, receitaPatrocinios,
  familiaDe, namoroDe, ctxFamilia, agirFamiliaJogo, perfisDaSemana, curtirPerfil, agirNamoroJogo,
} from "../../src/jogo";
import { acoesDe, parentescoCompleto, idadeDe, rotuloRelacaoFam, NOME_ACAO_FAM, NOME_TRACO, NOME_FASE_IRMAO, MAX_ACOES_FAMILIA, type AcaoFamilia, type Familiar } from "../../src/familia";
import { PROFISSOES, NOME_ETAPA, NOME_ACAO_NAMORO, acoesNamoro, chanceMatch, IDADE_MINIMA_APP, MAX_ACOES_NAMORO, type AcaoNamoro, type Par, type Perfil } from "../../src/namoro";
import { MARCA, NOME_CATEGORIA, NOME_CONTRATO, type ContratoPatrocinio, type OfertaPatrocinio, type TipoContrato } from "../../src/marcas";
import { cartazPatrocinio, logoSvg } from "./poster";
import { previaTatuagem } from "../visual/corpo";
import { svgCorpo, svgFoto, aparenciaDe, APARENCIA_PADRAO, NOMES_CABELO, NOMES_COR_CABELO, AMOSTRAS_COR_CABELO, CORES_CASUAL as CORES_ROUPA, NOMES_CASUAL_COR as NOMES_ROUPA, type Kit } from "../visual/personagem";
import { anuncioTransferencia, miniNoticia } from "../visual/cartazes";
import { trofeuSvg } from "../casa/iso";
import { armario, biografia, estatisticasEstimadas, totaisDaCarreira, clubesDaCarreira, personalidade, estiloDeJogo, pontos, rotuloFama, rotuloTorcida, rotuloTecnico } from "../../src/perfil-jogador";
import { TRACOS, PAISES } from "../../src/dna";
import { valorMercado } from "../../src/mercado";
import { TATUAGENS, TATUAGEM, NOME_AREA, NOME_FISICO, NOME_CASUAL, custoRemocao, visualDe, tatuagemVisivel, type AreaTatuagem, type Fisico, type RoupaCasual } from "../../src/visual";
import { VIDA, ITENS_VIDA, gastosDoMes, imposto, aliquota, fCustoVida, type ItemVida } from "../../src/vida";
import { CAMINHOS, NOME_FASE, caminhosDisponiveis, cidadeDaVarzea, caminhoDe, aceitarConvite, recusarConvite, type Caminho } from "../../src/caminhos";
import { CIDADES_VARZEA, DA_CIDADE } from "../../src/ligas";
import { estrelas as estrelasDoMundo, numeroDe, relacoesDe, rotuloNivel, NOME_ACAO_REL, chanceCamisa, MAX_ACOES_SEMANA, atencao, alternarFavorito, type AcaoRel, type Relacao } from "../../src/relacoes";
import { POSICOES, PODE_JOGAR, semanasParaAprender, afinidade } from "../../src/posicoes";
import { SITUACAO } from "../../src/lances";
import { infoClube, mundo } from "../../src/mundo";
import { infoLiga } from "../../src/ligas";
import { culturaBase, NOME_CULTURA, TEXTO_CULTURA } from "../../src/identidade";
import { AGENTE_INFO, NOME_PAPEL, aceitar, janelaAberta, mercadoDe, negociar, papelNoClube, pedirParaSair, podeContratarAgente, proximaJanela, recusar, trocarAgente, JANELAS, NOME_DESTINO, ONDE_DESTINO, type Destino, type PropostaSave } from "../../src/transferencias";
const NOME_PAIS: Record<string, string> = { BRA: "Brasil", ARG: "Argentina", URU: "Uruguai", ESP: "Espanha", POR: "Portugal", ENG: "Inglaterra", ITA: "Itália", GER: "Alemanha", FRA: "França", NED: "Holanda", SEN: "Senegal", JPN: "Japão" };
import { AGENTES, type TipoAgente } from "../../src/mercado";
import { svgComodo } from "../casa/iso";

const pacote = pacoteJson as unknown as PacoteDados;
void liga;
const nomeDe = (id: string) => infoClube(pacote, id).nome;
const CHAVE_SAVE = "mycarrerinha:save", CHAVE_JOGADOR = "mycarrerinha:jogador", CHAVE_PLANO = "mycarrerinha:plano";
const ler = <T>(k: string): T | null => { try { return JSON.parse(localStorage.getItem(k) ?? "null") as T | null; } catch { return null; } };
const gravar = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } };
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const NOME_POS: Record<string, string> = { ZAG: "Zagueiro", LAT: "Lateral", VOL: "Volante", MEI: "Meia", PON: "Ponta", ATA: "Centroavante" };
const NOME_AT: Record<Atributo, string> = { VEL: "Velocidade", RES: "Resistência", FOR: "Força", PAS: "Passe", CRU: "Cruzamento", DRI: "Drible", FIN: "Finalização", CAB: "Cabeceio", MAR: "Marcação", VIS: "Visão", POS: "Posicionamento", COM: "Compostura" };
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

let save: Save | null = ler<Save>(CHAVE_SAVE);
if (save && migrarSave(pacote, save)) gravar(CHAVE_SAVE, save);
if (save) registrarReliquias(save.casa);
let plano: Plano = ler<Plano>(CHAVE_PLANO) ?? planoPadrao();
let aba: "tabela" | "jogador" | "noticias" | "casa" | "mercado" | "amigos" = "tabela";
let msgNumero: { texto: string; ok: boolean } | undefined, numeroVisto: number | undefined;
let caminhoSel: Caminho = "base", cidadeSel: string | undefined, msgConvite: { texto: string; ok: boolean } | undefined;
let msgRel: { texto: string; ok: boolean } | undefined, msgPos: { texto: string; ok: boolean } | undefined;
let msgMercado: { texto: string; ok: boolean } | undefined;
const salvar = () => { if (save) gravar(CHAVE_SAVE, save); gravar(CHAVE_PLANO, plano); };

// ------------------------------------------------------------------ peças visuais
function cores(id: string): string[] { return clubeCasa(pacote, id).cores; }
function escudo(id: string): string {
  const [a, b] = cores(id), c2 = b ?? "#FFFFFF";
  return `<svg class="escudo" viewBox="0 0 26 30" aria-hidden="true"><path d="M1 1 H25 V14 Q25 24 13 29 Q1 24 1 14 Z" fill="${a}" stroke="#0A0A0A" stroke-width="1.6"/><path d="M1 12 H25 V17 H1 Z" fill="${c2}" opacity=".9"/><path d="M1 1 H25 V14 Q25 24 13 29 Q1 24 1 14 Z" fill="none" stroke="#0A0A0A" stroke-width="1.6"/></svg>`;
}
/** Uniforme do clube (cores e padrão) com a chuteira do patrocinador de material esportivo, se houver. */
function kitDe(s: Save, clubeId = s.carreira.clubeId): Kit {
  const info = infoClube(pacote, clubeId), [a, b] = info.cores;
  const mat = (s.carreira.patrocinios ?? []).map((k) => MARCA[k.marca]).find((m) => m?.categoria === "material");
  return { cor1: a, cor2: b ?? "#FFFFFF", padrao: info.padrao, numero: s.jogador.numero, marca: mat?.id, chuteira: mat ? [mat.cores[0] === "#FFFFFF" ? mat.cores[1] : mat.cores[0], mat.cores[1] === mat.cores[0] ? "#FFFFFF" : mat.cores[1]] : undefined };
}
function corpoDe(s: Save, traje: "jogo" | "casual", clubeId?: string): string {
  return svgCorpo({ aparencia: s.jogador.aparencia ?? null, visual: visualDe(s.jogador), alturaCm: s.jogador.alturaCm, traje, kit: kitDe(s, clubeId) });
}
function foto(s: Save): string {
  const [a, b] = cores(s.carreira.clubeId);
  const info = infoClube(pacote, s.carreira.clubeId);
  return svgFoto({ aparencia: s.jogador.aparencia ?? APARENCIA_PADRAO, camisa: { cor1: a, cor2: b ?? "#FFFFFF", estilo: info.padrao }, numero: s.jogador.numero, traje: "jogo", visual: visualDe(s.jogador), marca: kitDe(s).marca });
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
    <h1>Sua carreira começa na base, na várzea ou nos EUA.</h1>
    <p class="sub" style="font-size:16px">Crie o jogador, escolha por onde começar e jogue semana a semana: treino, descanso, família, redes, o jogo de domingo e a casa que você vai montando com o salário.</p>
    <a class="botao grande" href="criacao.html">Criar meu jogador</a>
    <button class="botao sec" data-acao="exemplo">Começar com um jogador de exemplo</button>`;
}

function telaOfertas(d: DadosCriacao): string {
  const r = d.resultado, disp = caminhosDisponiveis(r.escolhas.pais, r.escolhas.familia);
  if (!disp.includes(caminhoSel)) caminhoSel = "base";
  const cidade = cidadeSel ?? cidadeDaVarzea(pacote, d.clube);
  const of = ofertasDoCaminho(pacote, d, caminhoSel, cidade);
  const titulo = caminhoSel === "base" ? "Três clubes querem você na base." : caminhoSel === "varzea" ? `Três times da várzea ${DA_CIDADE[cidade]} querem você.` : caminhoSel === "eua_academia" ? "Três academias da liga americana abrem as portas." : "Três colégios nos EUA aceitam você.";
  return `<header class="marca"><strong>Mycarrerinha</strong><span>Primeira decisão</span></header>
    <p class="rotulo">${esc(r.escolhas.nome)} · ${NOME_POS[r.escolhas.posicao]} · OVR ${r.ovr}</p>
    ${disp.length > 1 ? `<p class="rotulo" style="margin-top:6px">Por onde começar</p><div class="caminhos">${disp.map((k) => `<button class="caminho${caminhoSel === k ? " ativo" : ""}" data-caminho="${k}"><b>${esc(CAMINHOS[k].nome)}</b><small>Começa aos ${CAMINHOS[k].idade}</small></button>`).join("")}</div>
      <p class="sub">${esc(CAMINHOS[caminhoSel].texto)}</p>` : ""}
    ${caminhoSel === "varzea" ? `<div class="chips" style="flex-wrap:wrap;margin-bottom:8px">${Object.entries(CIDADES_VARZEA).map(([k, n]) => `<button class="chip${k === cidade ? " ativo" : ""}" data-cidade="${k}">${esc(n)}</button>`).join("")}</div>` : ""}
    <h1>${esc(titulo)}</h1>
    ${caminhoSel === "base" ? `<p class="sub">A estrutura do clube decide onde você mora. A fila na posição e a cultura do clube decidem quando você chega ao profissional.</p>` : ""}
    <div class="ofertas">${of.map((o) => `<div class="oferta" style="--c1:${o.cores[0].toUpperCase() === "#FFFFFF" ? o.cores[1] : o.cores[0]}"><div class="faixa"></div><div class="corpo">
      <div style="display:flex;gap:10px;align-items:center">${escudo(o.clubeId)}<h2>${esc(o.nome)}</h2></div>
      <p class="sub">${esc(o.texto)}</p>
      <div class="linha-info"><span>Estrutura ${estrelas(o.estrutura)} ${o.nomeEstrutura.toLowerCase()}</span><span>Força do elenco <b>${o.forca}</b></span><span>Na sua posição: <b>${o.fila}</b> no elenco${caminhoSel === "base" ? " profissional" : ""}</span>${caminhoSel === "base" ? `<span>Base: <b>${esc(o.nomeCultura.toLowerCase())}</b></span>` : ""}</div>
      <p class="sub">Moradia: ${esc(o.moradia)}</p>
      <button class="botao" data-assinar="${o.clubeId}">${caminhoSel === "base" ? `Assinar com o ${esc(o.apelido)}` : caminhoSel === "varzea" ? `Jogar no ${esc(o.nome)}` : caminhoSel === "eua_academia" ? `Ir para a academia` : `Estudar no ${esc(o.nome)}`}</button></div></div>`).join("")}</div>
    <a class="sub" href="criacao.html" style="text-align:center">Criar outro jogador</a>`;
}

function telaSemana(s: Save): string {
  const c = s.carreira, j = s.jogador, clube = clubeDe(ligaAtual(pacote, s), c.clubeId), jogo = jogoDaSemana(s);
  const nProp = mercadoDe(c).propostas.length, jan = janelaAberta(c);
  const prev = previaPlano(s, plano), escPrev = escalacao(pacote, s, prev.cansaco);
  const pos = ordenar(c.tabela).findIndex((t) => t.clube === c.clubeId) + 1;
  const tagCls = escPrev === "titular" ? "titular" : escPrev === "banco" || escPrev === "base" ? "banco" : escPrev === "semJogo" ? "" : "ruim";
  const jogoHtml = jogo ? `<div class="confronto"><div class="time">${escudo(jogo.casa)}<span>${esc(nomeDe(jogo.casa))}</span></div><span class="vs">×</span><div class="time dir"><span>${esc(nomeDe(jogo.fora))}</span>${escudo(jogo.fora)}</div></div>
      <div class="linha-info"><span>${jogo.souCasa ? "Em casa" : "Fora de casa"}</span><span>${esc(infoLiga(c.ligaId).curto)} · rodada <b>${jogo.rodada + 1}</b> de ${nRodadas(c)}</span><span>${esc(clube.nome)} em <b>${pos || "–"}º</b></span></div>`
    : c.semana < SEMANAS_PRE ? `<p class="sub">Pré-temporada: sem jogo oficial. Semana de treino forte para chegar bem na estreia.</p>` : `<p class="sub">A ${esc(infoLiga(c.ligaId).curto)} já terminou. Semana de treino até o fim do calendário.</p>`;
  const previsao = escPrev === "semJogo" ? "" : `<div><span class="tag ${tagCls}">${escPrev === "base" ? `Jogo da base (${categoriaBase(j.idade)})` : `Previsão: ${NOME_ESCALACAO[escPrev].toLowerCase()}`}</span></div>`;
  const focos: [Grupo, string][] = [["fisico", "Físico"], ["tecnico", "Técnico"], ["tatico", "Tático"]];
  const ints: [Intensidade, string][] = [["leve", "Leve"], ["normal", "Normal"], ["alta", "Puxado"]];
  const acoesDisp = (Object.keys(ACOES) as Acao[]).filter((a) => a !== "video" || jogo);
  return `<header class="marca"><strong>Mycarrerinha</strong><span>${esc(rotuloSemana(c))}</span></header>
  <section class="painel card-jogador" data-acao="perfil" role="button" tabindex="0" aria-label="Abrir o perfil do jogador">
    <div class="jogador"><div class="foto">${foto(s)}</div>
      <div><div class="nome">${esc(j.apelido)}</div><div class="det">${NOME_POS[j.posicao]} · ${j.idade} anos · ${esc(clube.nome)}${c.fase ? ` (${NOME_FASE[c.fase].toLowerCase().replace("eua", "EUA")})` : c.formacao ? " (base)" : ""}</div><div class="det">${esc(j.perfilNome)}</div><div class="det ver-perfil">Ver perfil completo ›</div></div>
      <div class="ovr"><strong>${Math.round(ovr(j))}</strong><span>OVR</span></div></div>
    <div class="barras">${barra("Moral", c.moral, 100, "#74D394")}${barra("Cansaço", c.cansaco, 100, c.cansaco > 60 ? "#EC7D69" : "#E3B341")}${barra("Forma", forma(c), 10, "#6FB7E0", forma(c).toFixed(1))}${barra("Técnico", c.relTecnico, 100, "#B9A3E8")}</div>
    <div class="linha-info"><span>Saldo <b>${dinheiro(s.casa.saldo)}</b></span><span>Salário <b>${dinheiro(c.salario)}</b>/mês</span><span>Fama <b>${c.fama.toFixed(1)}</b></span><span><b>${compacto(c.seguidores)}</b> seguidores</span>${c.lesao ? `<span style="color:var(--neg)">Lesionado: <b>${c.lesao}</b> sem.</span>` : ""}</div>
  </section>

  <section class="painel jogo-card"><p class="rotulo">Esta semana</p>${jogoHtml}${previsao}</section>
  ${cardAnuncio(s)}
  ${cardPatrocinio(s)}
  ${cardEvento(s)}
  ${cardNumero(s)}
  ${cardConvites(s)}
  ${cardSugestao(s)}
  ${cardCraque(s)}
  ${nProp ? `<button class="painel aviso-mercado" data-aba="mercado"><span>📩</span><span><b>${nProp} ${nProp === 1 ? "proposta" : "propostas"} na mesa</b><small>${jan ? `Janela aberta até a semana ${jan.fim + 1}` : "Responda antes que expire"}. Ver no Mercado.</small></span></button>` : ""}

  <section class="painel grupo-plano" aria-label="Plano da semana">
    <p class="rotulo">Treino do clube</p>
    <div class="chips" style="flex-wrap:wrap">${focos.map(([k, n]) => `<button class="chip${plano.foco === k ? " ativo" : ""}" data-foco="${k}">${n}</button>`).join("")}<span style="width:8px"></span>${ints.map(([k, n]) => `<button class="chip${plano.intensidade === k ? " ativo" : ""}" data-int="${k}">${n}</button>`).join("")}</div>
    ${blocoTreinoPosicao(s)}
    <p class="rotulo" style="margin-top:6px">Seu tempo livre</p>
    <div class="grade-semana" role="grid" aria-label="Tempo livre de segunda a sexta">
      <span></span>${DIAS.map((d, i) => `<span class="cab">${d}${i === 4 && jogo ? "<small>véspera</small>" : ""}</span>`).join("")}
      ${acoesDisp.map((a) => `<span class="acao">${ACOES[a].nome}<small>${esc(ACOES[a].efeito)}</small></span>${DIAS.map((d, i) => `<button class="cel${plano.acoes[i] === a ? " ativo" : ""}" data-dia="${i}" data-a="${a}" aria-label="${d}: ${ACOES[a].nome}" aria-pressed="${plano.acoes[i] === a}"></button>`).join("")}`).join("")}
    </div>
    <div class="previa"><span>Cansaço no jogo <b>${prev.cansaco}</b></span><span>Moral <b>${prev.moral}</b></span><span>Evolução <b>${sinal(prev.evolucao)}%</b></span>${prev.notaExtra ? `<span>Nota <b>+${prev.notaExtra.toFixed(2)}</b></span>` : ""}</div>
  </section>
  <button class="botao grande" data-acao="jogar">${jogo && escPrev !== "lesionado" ? "Ir para o jogo" : "Fechar a semana"}</button>

  <div class="abas" role="tablist">${[["tabela", "Tabela"], ["jogador", "Jogador"], ["mercado", nProp ? `Mercado (${nProp})` : "Mercado"], ["amigos", "Celular"], ["noticias", "Notícias"], ["casa", "Casa"]].map(([k, n]) => `<button class="${aba === k ? "ativo" : ""}" data-aba="${k}" role="tab" aria-selected="${aba === k}">${n}</button>`).join("")}</div>
  <section class="painel">${aba === "tabela" ? abaTabela(s) : aba === "jogador" ? abaJogador(s) : aba === "noticias" ? abaNoticias(s) : aba === "mercado" ? abaMercado(s) : aba === "amigos" ? abaCelular(s) : abaCasa(s)}</section>
  <details class="painel teste"><summary>Opções</summary><p class="sub" style="margin:8px 0">O jogo salva sozinho neste navegador.</p><div class="ferr-botoes"><button class="botao sec peq" data-acao="pular">Simular até a próxima janela</button><button class="botao sec peq" data-acao="recomecar">Apagar carreira e recomeçar</button></div><p class="sub" style="margin-top:6px">Simular joga as semanas no automático (decisões e plano padrão) até abrir a próxima janela de transferências com você já profissional (no máximo 60 semanas). As propostas ficam para você decidir.</p></details>`;
}

function abaTabela(s: Save): string {
  const t = ordenar(s.carreira.tabela);
  return `<p class="rotulo" style="margin-bottom:6px">${esc(infoLiga(s.carreira.ligaId).nome)}</p><table><thead><tr><th>#</th><th>Clube</th><th class="n">P</th><th class="n">J</th><th class="n">SG</th></tr></thead><tbody>${t.map((x, i) => `<tr class="${x.clube === s.carreira.clubeId ? "meu" : ""}"><td>${i + 1}</td><td>${esc(nomeDe(x.clube))}</td><td class="n">${x.pts}</td><td class="n">${x.j}</td><td class="n">${x.gp - x.gc}</td></tr>`).join("")}</tbody></table>`;
}

let msgEvento: { titulo: string; texto: string } | undefined;
let msgVisual: { texto: string; ok: boolean } | undefined, areaTat: AreaTatuagem = "antebracoD", trajeVisto: "jogo" | "casual" = "jogo";
const CHAVE_ANUNCIO = "mycarrerinha:anuncio";
function anuncioDe(s: Save, n: Noticia): string {
  const img = n.img as Extract<ImgNoticia, { k: "transferencia" }>, info = infoClube(pacote, img.clube);
  return anuncioTransferencia({ clube: info.nome, apelidoClube: info.nome, cores: info.cores, liga: infoLiga(info.ligaId).nome, jogador: s.jogador.apelido, numero: s.jogador.numero, tipo: img.tipo as "transferencia", ate: img.ate, taxa: img.taxa, corpoSvg: corpoDe(s, "jogo", img.clube) });
}
function cardAnuncio(s: Save): string {
  const n = s.noticias.find((x) => x.img?.k === "transferencia");
  if (!n) return "";
  const chave = `${s.semente}|${n.semana}|${n.titulo}`;
  if (ler<string>(CHAVE_ANUNCIO) === chave) return "";
  return `<section class="painel anuncio-card"><p class="rotulo">Anúncio oficial</p><div class="anuncio-grande">${anuncioDe(s, n)}</div><button class="botao sec peq" data-acao="fechar-anuncio" data-chave="${esc(chave)}">Fechar</button></section>`;
}
function blocoVisual(s: Save): string {
  const v = visualDe(s.jogador), ap = aparenciaDe(s.jogador.aparencia), aviso = msgVisual ? `<p class="msg-mercado ${msgVisual.ok ? "ok" : "nao"}">${esc(msgVisual.texto)}</p>` : "";
  msgVisual = undefined;
  const chips = <T extends string>(campo: string, opcoes: [T, string][], atual: T) => `<div class="chips" style="flex-wrap:wrap">${opcoes.map(([k, n]) => `<button class="chip${atual === k ? " ativo" : ""}" data-vis="${campo}" data-val="${k}">${esc(n)}</button>`).join("")}</div>`;
  const atualTat = v.tatuagens[areaTat];
  const designs = TATUAGENS.filter((t) => t.areas.includes(areaTat));
  return `${aviso}<p class="rotulo">Visual</p>
    <div class="visual-duplo"><button class="figura${trajeVisto === "jogo" ? " ativo" : ""}" data-traje="jogo">${corpoDe(s, "jogo")}<small>Uniforme</small></button><button class="figura${trajeVisto === "casual" ? " ativo" : ""}" data-traje="casual">${corpoDe(s, "casual")}<small>Dia a dia</small></button></div>
    <p class="sub" style="margin:12px 0 6px;font-weight:600">Físico</p>${chips("fisico", (Object.keys(NOME_FISICO) as Fisico[]).map((k) => [k, NOME_FISICO[k]]), v.fisico)}
    <p class="sub" style="margin:12px 0 6px;font-weight:600">Uniforme</p>${chips("manga", [["curta", "Manga curta"], ["longa", "Manga longa"]], v.manga)}${chips("caimento", [["justo", "Justo"], ["largo", "Largo"]], v.caimento)}${chips("meiao", [["alto", "Meião alto"], ["baixo", "Meião baixo"]], v.meiao)}
    <p class="sub" style="margin:12px 0 6px;font-weight:600">Dia a dia</p>${chips("casual", (Object.keys(NOME_CASUAL) as RoupaCasual[]).map((k) => [k, NOME_CASUAL[k]]), v.casual)}${chips("perna", [["bermuda", "Bermuda"], ["calca", "Calça"]], v.perna)}
    <div class="cores-roupa">${CORES_ROUPA.map((c, i) => `<button class="cor${v.corCasual === i ? " ativo" : ""}" style="--c:${c}" data-vis="corCasual" data-val="${i}" aria-label="${esc(NOMES_ROUPA[i])}"></button>`).join("")}</div>
    <p class="sub" style="margin:12px 0 6px;font-weight:600">Salão</p>${chips("ap:cabelo", NOMES_CABELO.map((n, i) => [String(i), n] as [string, string]), String(ap.cabelo))}
    <div class="cores-roupa">${AMOSTRAS_COR_CABELO.map((c, i) => `<button class="cor${ap.corCabelo === i ? " ativo" : ""}" style="--c:${c}" data-vis="ap:corCabelo" data-val="${i}" aria-label="${esc(NOMES_COR_CABELO[i])}"></button>`).join("")}</div>
    <p class="rotulo" style="margin-top:16px">Estúdio de tatuagem</p>
    <div class="chips" style="flex-wrap:wrap">${(Object.keys(NOME_AREA) as AreaTatuagem[]).map((a) => `<button class="chip${areaTat === a ? " ativo" : ""}" data-tarea="${a}">${esc(NOME_AREA[a])}${v.tatuagens[a] ? " •" : ""}</button>`).join("")}</div>
    ${atualTat ? `<p class="sub" style="margin-top:8px">${esc(NOME_AREA[areaTat])}: <b>${esc(TATUAGEM[atualTat].nome)}</b>. <button class="botao sec peq" data-tat-remover="${areaTat}">Tirar com laser (${dinheiro(custoRemocao(atualTat))})</button></p>`
      : `<div class="tat-lista">${designs.map((t) => `<button class="tat-op" data-tat="${t.id}"><span class="tat-prev">${previaTatuagem(t.id)}</span><b>${esc(t.nome)}</b><small>${dinheiro(t.preco)}</small></button>`).join("")}</div>`}
    ${!tatuagemVisivel(areaTat, v, trajeVisto) ? `<p class="sub">Com essa roupa, a tatuagem nessa parte fica escondida.</p>` : ""}`;
}
let cartazNovo: ContratoPatrocinio | undefined;
const cartaz = (s: Save, k: ContratoPatrocinio) => cartazPatrocinio(MARCA[k.marca], foto(s), s.jogador.apelido, s.jogador.numero, k.desde);
function cardPatrocinio(s: Save): string {
  if (cartazNovo) {
    const k = cartazNovo, m = MARCA[k.marca]; cartazNovo = undefined;
    return `<section class="painel patro"><p class="rotulo">Campanha lançada</p><div class="cartaz-grande">${cartaz(s, k)}</div>
      <p class="sub">Você é o novo rosto da ${esc(m.nome)}. ${esc(NOME_CONTRATO[k.tipo].nome)} · ${k.meses} meses · ${dinheiro(k.mensal)}/mês${k.luvas ? ` · ${dinheiro(k.luvas)} de luvas` : ""}.</p></section>`;
  }
  const p = s.carreira.propPatrocinio, m = p && MARCA[p.marca];
  if (!p || !m) return "";
  const det = (o: OfertaPatrocinio) => o.tipo === "desempenho" ? `${dinheiro(o.mensal)}/mês + ${dinheiro(o.bonusGol)} por gol, ${dinheiro(o.bonusAssist)} por assistência, ${dinheiro(o.bonusNota)} por nota 8+` : `${dinheiro(o.mensal)}/mês${o.luvas ? ` + ${dinheiro(o.luvas)} de luvas` : ""}`;
  return `<section class="painel patro"><p class="rotulo">Proposta de patrocínio · ${esc(NOME_CATEGORIA[m.categoria])}</p>
    <div class="patro-topo">${logoSvg(m, 34)}<span class="sub">“${esc(m.slogan)}”</span></div>
    <div class="patro-opcoes">${p.opcoes.map((o) => `<button class="patro-op" data-patro="${o.tipo}"><b>${NOME_CONTRATO[o.tipo].nome}</b><span>${det(o)}</span><small>${o.meses} meses · ${esc(NOME_CONTRATO[o.tipo].texto)}</small></button>`).join("")}</div>
    <button class="botao sec peq" data-patro="recusar">Recusar a ${esc(m.nome)}</button></section>`;
}
const compacto = (n: number) => n >= 1e6 ? `${(n / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: n >= 1e8 ? 0 : 1 })} mi` : n >= 1e4 ? `${Math.round(n / 1e3).toLocaleString("pt-BR")} mil` : n.toLocaleString("pt-BR");
function cardEvento(s: Save): string {
  if (msgEvento) { const m = msgEvento; msgEvento = undefined; return `<section class="painel evento"><p class="rotulo">Fora de campo · ${esc(m.titulo)}</p><p>${esc(m.texto)}</p></section>`; }
  const e = eventoPendente(pacote, s);
  if (!e) return "";
  return `<section class="painel evento"><p class="rotulo">Fora de campo</p><h2>${esc(e.titulo)}</h2><p class="sub">${esc(e.texto)}</p>
    <div class="ferr-botoes">${e.opcoes.map((o) => `<button class="botao sec" data-evento="${o.id}">${esc(o.rotulo)}${o.custo < 0 ? `<small>${dinheiro(-o.custo)}</small>` : ""}</button>`).join("")}</div></section>`;
}
function blocoPatrocinios(s: Save): string {
  const ks = s.carreira.patrocinios ?? [];
  if (!ks.length) return `<p class="rotulo" style="margin-top:16px">Patrocinadores</p><p class="sub">Nenhum ainda. As marcas aparecem conforme a sua fama cresce: uma por categoria, até quatro ao mesmo tempo.</p>`;
  return `<p class="rotulo" style="margin-top:16px">Patrocinadores · ${dinheiro(receitaPatrocinios(s.carreira))}/mês fixos</p>
    <div class="patro-galeria">${ks.map((k) => `<div class="patro-item">${cartaz(s, k)}<b>${esc(MARCA[k.marca].nome)}</b><small>${esc(NOME_CONTRATO[k.tipo].nome)} · ${dinheiro(k.mensal)}/mês · faltam ${k.restantes} ${k.restantes === 1 ? "mês" : "meses"}</small></div>`).join("")}</div>`;
}
function blocoVida(s: Save): string {
  const c = s.carreira, pd = padraoDe(c), g = gastosDoMes(pd, c.ligaId, c.salario, c.fama, c.formacao, manutencaoMensal(s.casa));
  const ir = c.formacao ? 0 : imposto(c.salario, c.ligaId), ag = AGENTES[c.agente].comissao * c.salario, liq = salarioLiquido(c);
  const sobra = liq + receitaPatrocinios(c) - g.total - (imovelAtual(s.casa).categoria === "alojamento" || ehDono(s.casa) ? 0 : imovelAtual(s.casa).aluguel);
  const pct = Math.round(100 * aliquota(c.ligaId));
  return `<p class="rotulo" style="margin-top:16px">Dinheiro do mês</p>
    <div class="kv" style="margin-top:6px"><span>Salário bruto</span><b>${dinheiro(c.salario)}</b>${ir ? `<span>Imposto (${pct}%)</span><b class="neg">−${dinheiro(ir)}</b>` : c.formacao ? "" : `<span>Imposto</span><b>isento no Golfo</b>`}${ag ? `<span>Agente</span><b class="neg">−${dinheiro(ag)}</b>` : ""}${c.patrocinioMensal ? `<span>Campanhas (${c.mesesPatrocinio} meses)</span><b class="pos">+${dinheiro(c.patrocinioMensal)}</b>` : ""}${receitaPatrocinios(c) ? `<span>Patrocinadores (fixo)</span><b class="pos">+${dinheiro(receitaPatrocinios(c))}</b>` : ""}
    ${g.itens.filter((x) => x.valor).map((x) => `<span>${esc(x.nome)}</span><b class="neg">−${dinheiro(x.valor)}</b>`).join("")}
    ${!ehDono(s.casa) && imovelAtual(s.casa).aluguel ? `<span>Aluguel</span><b class="neg">−${dinheiro(imovelAtual(s.casa).aluguel)}</b>` : ""}
    <span><b>Sobra no mês</b></span><b class="${sobra >= 0 ? "pos" : "neg"}">${sobra >= 0 ? "" : "−"}${dinheiro(Math.abs(sobra))}</b></div>
    <p class="rotulo" style="margin-top:16px">Padrão de vida</p>
    ${ITENS_VIDA.map((k) => `<p class="sub" style="margin:10px 0 6px;font-weight:600">${VIDA[k].nome}</p><div class="chips" style="flex-wrap:wrap">${VIDA[k].niveis.map((n, i) => `<button class="chip${pd[k] === i ? " ativo" : ""}" data-vida="${k}" data-nivel="${i}">${esc(n.nome)}</button>`).join("")}</div><p class="sub" style="margin-top:4px">${esc(VIDA[k].niveis[pd[k]].texto)} ${dinheiro(Math.round(VIDA[k].niveis[pd[k]].custo * fCustoVida(c.ligaId)))}/mês${efeitoTxt(VIDA[k].niveis[pd[k]])}</p>`).join("")}
    <p class="rotulo" style="margin-top:16px">Redes sociais</p>
    <div class="kv" style="margin-top:6px"><span>Seguidores</span><b>${compacto(c.seguidores)}</b><span>Tendência</span><b>${tendencia(s)}</b><span>Engajamento</span><b>${Math.round(c.engajamento ?? 40)}/100</b></div>
    <p class="sub" style="margin-top:4px">Os seguidores acompanham sua fama, o tamanho do clube e o quanto você posta. Clube grande traz torcida nova de uma vez; ficar sem postar ou ir para um clube menor faz perder aos poucos.</p>`;
}
const efeitoTxt = (n: { moral?: number; recuperacao?: number; evolucao?: number; fama?: number }) => {
  const p = [n.moral ? `moral ${sinal(n.moral)}` : "", n.recuperacao ? `recuperação ${sinal(n.recuperacao)}` : "", n.evolucao ? `evolução ${sinal(n.evolucao)}%` : "", n.fama ? `fama ${sinal(n.fama)}` : ""].filter(Boolean);
  return p.length ? ` · ${p.join(", ")}` : "";
};
function tendencia(s: Save): string {
  const alvo = alvoDeSeguidores(pacote, s), seg = s.carreira.seguidores;
  return alvo > seg * 1.05 ? "subindo ↑" : alvo < seg * 0.95 ? "caindo ↓" : "estável";
}
// ------------------------------------------------------------------ número da camisa
function cardNumero(s: Save): string {
  const c = s.carreira;
  if (!c.escolhaNumero) return "";
  const g = gradeDoClube(pacote, s), clube = infoClube(pacote, c.clubeId), atual = +s.jogador.numero, livreAtual = !g[atual - 1]?.dono;
  const lib = g.filter((x) => x.liberado), saidas = saidasAtuais(pacote, s);
  const sel = numeroVisto ? g[numeroVisto - 1] : undefined;
  const msg = msgNumero ? `<p class="msg-mercado ${msgNumero.ok ? "ok" : "nao"}">${esc(msgNumero.texto)}</p>` : "";
  msgNumero = undefined;
  return `<section class="painel numero-card"><p class="rotulo">${c.escolhaNumero === "chegada" ? `Chegada ao ${esc(clube.nome)}` : "Começo de temporada"} · escolha sua camisa</p>
    <p class="sub">${saidas.length && c.escolhaNumero === "temporada" ? `Saíram do elenco: ${esc(saidas.join(", "))}. ` : ""}${lib.length ? `Camisas liberadas: <b>${lib.map((x) => x.numero).join(", ")}</b>. ` : ""}Toque num número livre para ficar com ele; os ocupados mostram quem usa.</p>${msg}
    <div class="grade-num">${g.map((x) => `<button class="num${x.dono ? " ocupado" : ""}${x.liberado ? " liberado" : ""}${x.meu ? " meu" : ""}${sel?.numero === x.numero ? " visto" : ""}" data-num="${x.numero}" aria-label="${x.numero}${x.dono ? `, de ${esc(x.dono)}` : ", livre"}">${x.numero}</button>`).join("")}</div>
    ${sel?.dono ? `<p class="sub" style="margin-top:8px">A <b>${sel.numero}</b> é de ${esc(sel.dono)} (${NOME_POS[sel.posicao ?? ""] ?? "Goleiro"}).</p>` : ""}
    <div class="legenda-num"><span><i class="num meu"></i>sua</span><span><i class="num liberado"></i>liberada agora</span><span><i class="num ocupado"></i>ocupada</span></div>
    ${livreAtual ? `<button class="botao sec" data-num-manter="1" style="margin-top:8px">Manter a ${atual}</button>` : `<p class="sub" style="margin-top:8px">A ${atual} já tem dono aqui: escolha outra.</p>`}</section>`;
}

// ------------------------------------------------------------------ caminhos: convites de peneira, bolsa, draft
const ROTULO_CONVITE = { peneira: "Peneira", profissional: "Contrato profissional", universidade: "Bolsa de estudos", draft: "Draft", homegrown: "Homegrown" } as const;
function cardConvites(s: Save): string {
  const cs = caminhoDe(s.carreira).convites;
  const msg = msgConvite ? `<p class="msg-mercado ${msgConvite.ok ? "ok" : "nao"}">${esc(msgConvite.texto)}</p>` : "";
  msgConvite = undefined;
  if (!cs.length) return msg ? `<section class="painel">${msg}</section>` : "";
  return `<section class="painel convites"><p class="rotulo">${cs.length === 1 ? "Um convite" : `${cs.length} convites`} · escolha um caminho</p>${msg}
    ${cs.map((cv) => { const info = infoClube(pacote, cv.clubeId), li = infoLiga(info.ligaId);
      return `<div class="convite">${escudo(cv.clubeId)}<div><span class="tag">${ROTULO_CONVITE[cv.tipo]}</span><b>${esc(cv.titulo)}</b><small>${esc(li.curto)} · força ${Math.round(info.forca)}</small><p class="sub">${esc(cv.texto)}</p>
        <div class="ferr-botoes"><button class="botao peq" data-convite="${cv.id}" data-op="aceitar">${cv.tipo === "universidade" ? "Aceitar a bolsa" : cv.tipo === "peneira" ? "Ir à peneira" : "Assinar"}</button><button class="botao sec peq" data-convite="${cv.id}" data-op="recusar">${cv.tipo === "draft" ? "Recusar e seguir estudando" : "Recusar"}</button></div></div></div>`; }).join("")}</section>`;
}

// ------------------------------------------------------------------ posições
const ICONE_POS: Record<string, string> = { ZAG: "🛡️", LAT: "↔️", VOL: "⚓", MEI: "🎯", PON: "⚡", ATA: "⚽" };
function blocoTreinoPosicao(s: Save): string {
  const j = s.jogador, c = s.carreira, fam = familiaridadeDe(j), alvo = c.treinoPosicao;
  const sug = c.sugestaoPos?.aceita ? c.sugestaoPos.pos : undefined;
  const info = alvo ? (() => {
    const f = fam[alvo] ?? 0, sem = semanasParaAprender(j.at, j.posicao, alvo, f, sug === alvo);
    return `<div class="treino-pos-info"><div class="tp-barra"><i style="width:${f}%"></i><b style="left:${PODE_JOGAR}%"></b></div>
      <span>${NOME_POS[alvo]}: <b>${Math.round(f)}%</b> · ${f >= PODE_JOGAR ? "já pode jogar ali" : `joga ali a partir de ${PODE_JOGAR}%`} · faltam ~${sem} sem. para dominar${sug === alvo ? " · pedido do técnico (+30%)" : ""}. A evolução normal cai 10% enquanto treina.</span></div>`;
  })() : `<p class="sub" style="margin:4px 0 0">Escolha uma posição para treinar além do treino do clube. Quanto mais parecida com a sua e mais seus atributos combinam, mais rápido.</p>`;
  return `<p class="rotulo" style="margin-top:8px">Treino de posição</p>
    <div class="chips" style="flex-wrap:wrap"><button class="chip${!alvo ? " ativo" : ""}" data-tpos="">Nenhum</button>${POSICOES.filter((p) => p !== j.posicao).map((p) => `<button class="chip pos-chip${alvo === p ? " ativo" : ""}" data-tpos="${p}" title="${NOME_POS[p]}">${ICONE_POS[p]} ${NOME_POS[p]} <small>${Math.round(fam[p] ?? 0)}%</small></button>`).join("")}</div>${info}
    ${msgPos ? `<p class="msg-mercado ${msgPos.ok ? "ok" : "nao"}" style="margin:8px 0 0">${esc(msgPos.texto)}</p>` : ""}`;
}
function blocoPosicoes(s: Save): string {
  const j = s.jogador, fam = familiaridadeDe(j);
  const linhas = [...POSICOES].sort((a, b) => (fam[b] ?? 0) - (fam[a] ?? 0)).map((p) => {
    const f = Math.round(fam[p] ?? 0), atual = p === j.posicao;
    return `<div class="pos-linha${atual ? " atual" : ""}"><span class="pos-nome">${ICONE_POS[p]} ${NOME_POS[p]}</span>
      <span class="pos-fam"><i style="width:${f}%;background:${f >= 100 ? "#74D394" : f >= PODE_JOGAR ? "#E3B341" : "#6B7A70"}"></i></span>
      <span class="pos-num">${f}%</span><span class="pos-ovr">${Math.round(ovrEm(j, p))}</span>
      ${atual ? `<span class="tag titular">Atual</span>` : f >= PODE_JOGAR ? `<button class="botao sec peq" data-mudapos="${p}">Jogar aqui</button>` : `<span class="pos-vazio"></span>`}</div>`;
  }).join("");
  return `<p class="rotulo" style="margin-top:16px">Posições · domínio e OVR em cada uma</p><div class="pos-lista">${linhas}</div>`;
}
function cardSugestao(s: Save): string {
  const sg = s.carreira.sugestaoPos;
  if (!sg || sg.aceita !== undefined) return "";
  const j = s.jogador, sem = semanasParaAprender(j.at, j.posicao, sg.pos, familiaridadeDe(j)[sg.pos] ?? 0, true);
  return `<section class="painel evento sugestao"><p class="rotulo">Conversa com o técnico</p><h2>"Talvez eu queira te usar de ${NOME_POS[sg.pos].toLowerCase()}. Vamos treinar?"</h2>
    <p class="sub">Seus atributos rendem ${Math.round(ovrEm(j, sg.pos) + (100 - (familiaridadeDe(j)[sg.pos] ?? 0)) * 0.07)} de OVR ali (hoje você joga de ${NOME_POS[j.posicao].toLowerCase()} com ${Math.round(ovr(j))}). Com o técnico acompanhando, o treino rende 30% mais: cerca de ${sem} semanas para dominar.</p>
    <div class="ferr-botoes"><button class="botao" data-sug="sim">Topo treinar<small>Técnico +4</small></button><button class="botao sec" data-sug="nao">Prefiro minha posição<small>Técnico −2</small></button></div></section>`;
}
// ------------------------------------------------------------------ relações
/** Estrela do adversário desta semana: chance de conversar no túnel e pedir a camisa. */
function cardCraque(s: Save): string {
  const jg = jogoDaSemana(s);
  if (!jg) return "";
  const rr = relacoesDe(s.carreira), cs = estrelasDoMundo(pacote).filter((e) => e.clubeId === jg.adversario).slice(0, 2);
  if (!cs.length) return "";
  return `<section class="painel craque"><p class="rotulo">Craque do outro lado</p>${cs.map((e) => {
    const x = rr.lista[e.nome], nivel = x?.nivel ?? 0, pedida = rr.camisaPedida === e.nome;
    return `<div class="craque-linha">${camisaMini(e.clubeId, e.numero)}<div><b>${esc(e.nome)}</b><small>${esc(nomeDe(e.clubeId))} · ${NOME_POS[e.posicao] ?? "Goleiro"} · OVR ${e.ovr} · ${rotuloNivel(nivel)}${x?.camisa ? " · camisa na coleção" : ""}</small></div>
      ${x?.camisa ? "" : pedida ? `<span class="tag titular">Camisa pedida · ${Math.round(100 * chanceCamisa(nivel, s.carreira.fama, e.fama))}%</span>` : `<button class="botao sec peq" data-rel="${esc(e.nome)}" data-op="camisa">Pedir a camisa<small>${Math.round(100 * chanceCamisa(nivel, s.carreira.fama, e.fama))}%</small></button>`}</div>`;
  }).join("")}<p class="sub" style="margin-top:6px">Se você jogar, a troca acontece no apito final. Quanto mais amizade, maior a chance.</p></section>`;
}
function camisaMini(clubeId: string, numero: number): string {
  const [a, b] = cores(clubeId), c2 = b ?? "#FFFFFF";
  return `<svg class="camisa-mini" viewBox="0 0 40 36" aria-hidden="true"><path d="M12 2 L4 7 L1 15 L7 17 L9 13 L9 34 L31 34 L31 13 L33 17 L39 15 L36 7 L28 2 Q20 7 12 2 Z" fill="${a}" stroke="#0A0A0A" stroke-width="1.6" stroke-linejoin="round"/><text x="20" y="27" text-anchor="middle" font-family="Big Shoulders Display,sans-serif" font-weight="800" font-size="13" fill="${c2}" stroke="#0A0A0A" stroke-width=".6">${numero}</text></svg>`;
}
function linhaRel(s: Save, x: Relacao, acoes: AcaoRel[], extra = "", clubeBusca?: string): string {
  const e = estrelasDoMundo(pacote).find((k) => k.nome === x.nome), cor = x.nivel >= 80 ? "#E3B341" : x.nivel >= 60 ? "#74D394" : x.nivel >= 40 ? "#6FB7E0" : "#8A968E";
  const conhecido = !!relacoesDe(s.carreira).lista[x.nome], fav = relacoesDe(s.carreira).favoritos?.includes(x.nome);
  return `<div class="rel-linha"><div class="rel-topo">${conhecido ? `<button class="fav${fav ? " on" : ""}" data-fav="${esc(x.nome)}" aria-label="${fav ? "Tirar dos favoritos" : "Pôr nos favoritos"}" aria-pressed="${!!fav}">★</button>` : ""}${camisaMini(x.clubeId, e?.numero ?? numeroDe(x.nome))}<div class="rel-nome"><b>${esc(x.nome)}</b>${x.camisa ? ` <span class="selo" title="Camisa trocada">👕</span>` : ""}${e ? ` <span class="selo estrela" title="Estrela">★ ${e.ovr}</span>` : ""}<small>${esc(nomeDe(x.clubeId))}${extra}</small></div>
    <div class="rel-nivel"><span style="color:${cor}">${rotuloNivel(x.nivel)}</span><span class="rel-barra"><i style="width:${x.nivel}%;background:${cor}"></i></span></div></div>
    <div class="rel-acoes">${acoes.map((a) => `<button class="chip" data-rel="${esc(x.nome)}" data-op="${a}"${clubeBusca ? ` data-clube="${clubeBusca}"` : ""}>${NOME_ACAO_REL[a]}</button>`).join("")}</div></div>`;
}

// ------------------------------------------------------------------ celular: contatos, busca e app de namoro
let telaCel: "contatos" | "busca" | "match" = "contatos", buscaLiga: string | undefined, buscaClube: string | undefined;
const iniciais = (nome: string) => nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
const corRelFam = (n: number) => (n >= 80 ? "#E3B341" : n >= 60 ? "#74D394" : n >= 40 ? "#6FB7E0" : n >= 20 ? "#C9A24D" : "#EC7D69");
function linhaFam(s: Save, m: Familiar): string {
  const ctx = ctxFamilia(pacote, s), ano = ANO_INICIAL + s.carreira.temporada, fb = m.futebol, cor = corRelFam(m.relacao);
  const fut = fb ? ` · ${fb.fase === "pro" || fb.fase === "base" ? `${NOME_FASE_IRMAO[fb.fase]}${fb.clubeId ? ` no ${esc(nomeDe(fb.clubeId))}` : ""} · OVR ${fb.ovr}` : NOME_FASE_IRMAO[fb.fase]}${fb.clubeId === s.carreira.clubeId && fb.fase === "pro" ? " · joga com você" : ""}` : "";
  return `<div class="rel-linha"><div class="rel-topo"><span class="avatar-fam" style="--c:${cor}">${esc(iniciais(m.nome))}</span><div class="rel-nome"><b>${esc(m.nome)}</b>${m.traco ? ` <span class="selo estrela">${NOME_TRACO[m.traco]}</span>` : ""}<small>${esc(parentescoCompleto(m, s.jogador.idade, ano))} · ${idadeDe(m, ano)} anos · ${esc(m.profissao)}${fut}</small></div>
    <div class="rel-nivel"><span style="color:${cor}">${rotuloRelacaoFam(m.relacao)}</span><span class="rel-barra"><i style="width:${m.relacao}%;background:${cor}"></i></span></div></div>
    <div class="rel-acoes">${acoesDe(m, ctx).map((a) => `<button class="chip" data-fam="${m.id}" data-op="${a}">${NOME_ACAO_FAM[a]}</button>`).join("")}</div></div>`;
}
function abaCelular(s: Save): string {
  const abas = `<div class="cel-abas" role="tablist">${([["contatos", "Contatos"], ["busca", "Buscar jogador"], ["match", "Match"]] as const).map(([k, n]) => `<button class="${telaCel === k ? "ativo" : ""}" data-cel="${k}" role="tab" aria-selected="${telaCel === k}">${n}</button>`).join("")}</div>`;
  const msg = msgRel ? `<p class="msg-mercado ${msgRel.ok ? "ok" : "nao"}">${esc(msgRel.texto)}</p>` : "";
  msgRel = undefined;
  return `<div class="celular">${abas}${msg}${telaCel === "busca" ? celBusca(s) : telaCel === "match" ? celMatch(s) : celContatos(s)}</div>`;
}
function celContatos(s: Save): string {
  const c = s.carreira, rr = relacoesDe(c), fam = familiaDe(pacote, s);
  const favs = (rr.favoritos ?? []).map((n) => rr.lista[n]).filter(Boolean) as Relacao[];
  const famFeitas = fam.semana === semanaAbsJogo(c) ? fam.feitas.length : 0;
  return `${favs.length ? `<p class="rotulo">Favoritos</p>${favs.map((x) => linhaRel(s, x, x.companheiro ? ["mensagem", "jantar"] : ["mensagem"])).join("")}` : ""}
    <p class="rotulo" style="margin-top:${favs.length ? 14 : 0}px">Família <small>· ${MAX_ACOES_FAMILIA - famFeitas} ${MAX_ACOES_FAMILIA - famFeitas === 1 ? "conversa livre" : "conversas livres"} nesta semana</small></p>
    <p class="sub">Família perto e bem cuidada dá moral. A ajuda mensal (em Jogador › Padrão de vida) aproxima os pais; morar longe e sumir afasta.</p>
    ${fam.membros.map((m) => linhaFam(s, m)).join("")}
    <p class="rotulo" style="margin-top:14px">Amigos do futebol</p>${abaAmigos(s)}`;
}
function celBusca(s: Save): string {
  const w = mundo(pacote), rr = relacoesDe(s.carreira);
  const ligas = w.ligas.map((l) => infoLiga(l.id));
  const chipsLiga = `<div class="chips" style="flex-wrap:wrap">${ligas.map((l) => `<button class="chip${buscaLiga === l.id ? " ativo" : ""}" data-bliga="${l.id}">${esc(l.curto)}</button>`).join("")}</div>`;
  if (!buscaLiga || !w.liga[buscaLiga]) return `<p class="sub">Escolha a liga, depois o clube, e ache qualquer jogador.</p>${chipsLiga}`;
  const l = w.liga[buscaLiga];
  const chipsClube = `<div class="busca-clubes">${l.clubes.map((cl) => `<button class="busca-clube${buscaClube === cl.id ? " ativo" : ""}" data-bclube="${cl.id}">${escudo(cl.id)}<span>${esc(cl.nome)}</span></button>`).join("")}</div>`;
  const cl = buscaClube ? w.clube[buscaClube] : undefined;
  const elenco = cl ? [...cl.elenco].sort((a, b) => b.ovr - a.ovr).map((j) => {
    const x = rr.lista[j.nome] ?? { nome: j.nome, clubeId: cl.id, nivel: 0, desde: 0 };
    return linhaRel(s, x, cl.id === s.carreira.clubeId ? ["mensagem", "jantar"] : ["mensagem"], ` · ${NOME_POS[j.posicao] ?? "Goleiro"} · OVR ${j.ovr} · ${j.idade} anos`, cl.id);
  }).join("") : `<p class="sub">Toque num clube para ver o elenco.</p>`;
  return `${chipsLiga}<p class="rotulo" style="margin-top:12px">${esc(infoLiga(l.id).nome)}</p>${chipsClube}${cl ? `<p class="rotulo" style="margin-top:12px">Elenco do ${esc(cl.nome)}</p>` : ""}${elenco}`;
}
function cartaoPar(p: Par | Perfil, botoes: string, extra = ""): string {
  const prof = PROFISSOES[p.profissao];
  return `<div class="perfil-app"><span class="avatar-app">${esc(iniciais(p.nome))}</span><div class="perfil-app-txt"><b>${esc(p.nome.split(" ")[0])}, ${p.idade}</b><small>${esc(prof.nome)} · ${esc(p.cidade)} · ${esc(p.jeito)}</small>
    <p>“${esc(p.bio)}”</p><small class="efeito-prof">${esc(prof.efeito)}</small>${extra}</div><div class="perfil-app-botoes">${botoes}</div></div>`;
}
function celMatch(s: Save): string {
  if (s.jogador.idade < IDADE_MINIMA_APP) return `<p class="sub">O app de namoro é só a partir dos ${IDADE_MINIMA_APP} anos.</p>`;
  const c = s.carreira, n = namoroDe(c), par = n.par, ab = semanaAbsJogo(c);
  const feitas = n.semana === ab ? n.feitas : 0;
  const acoes = (p: Par) => acoesNamoro(p, ab).map((a) => `<button class="chip${a === "terminar" ? " perigo" : ""}" data-nam="${p.id}" data-op="${a}">${NOME_ACAO_NAMORO[a as AcaoNamoro]}</button>`).join("");
  const barra = (p: Par) => `<div class="rel-nivel" style="margin-top:6px"><span style="color:${corRelFam(p.relacao)}">${NOME_ETAPA[p.etapa]} · ${Math.round(p.relacao)}</span><span class="rel-barra"><i style="width:${p.relacao}%;background:${corRelFam(p.relacao)}"></i></span></div>`;
  const parHtml = par ? `<p class="rotulo">${par.etapa === "saindo" ? "Saindo com" : par.etapa === "casados" ? "Sua esposa" : par.etapa === "noivos" ? "Sua noiva" : "Sua namorada"}</p>${cartaoPar(par, "", barra(par))}<div class="rel-acoes" style="margin-left:0">${acoes(par)}</div>
    <p class="sub" style="margin-top:6px">${MAX_ACOES_NAMORO - feitas} ${MAX_ACOES_NAMORO - feitas === 1 ? "programa livre" : "programas livres"} nesta semana. Sem atenção a relação esfria; vida noturna demais incomoda.</p>` : "";
  if (par && par.etapa !== "saindo") return parHtml;
  const perfis = perfisDaSemana(pacote, s);
  const deck = perfis.length ? perfis.map((p) => cartaoPar(p, `<button class="botao sec peq" data-curtir="${p.id}" data-sim="0">Passar</button><button class="botao peq" data-curtir="${p.id}" data-sim="1">Curtir</button>`, `<small class="sub">Chance de match: ${Math.round(100 * chanceMatch(p, c.fama))}%</small>`)).join("") : `<p class="sub">Acabaram os perfis desta semana. Novos chegam na próxima.</p>`;
  const matches = n.matches.length ? `<p class="rotulo" style="margin-top:14px">Matches</p>${n.matches.map((m) => `${cartaoPar(m, "", `<small class="sub">${m.conversas} ${m.conversas === 1 ? "conversa" : "conversas"}${m.conversas < 2 ? " · converse mais antes de chamar para sair" : ""}</small>`)}<div class="rel-acoes" style="margin-left:0">${acoes(m)}</div>`).join("")}` : "";
  return `${parHtml}<p class="rotulo"${par ? ' style="margin-top:14px"' : ""}>Perfis da semana</p><p class="sub">Fama ajuda no match. A profissão dela mexe no seu jogo.</p>${deck}${matches}`;
}
function abaAmigos(s: Save): string {
  const c = s.carreira, rr = relacoesDe(c), lista = Object.values(rr.lista), est = estrelasDoMundo(pacote);
  const usadas = rr.semana === semanaAbsJogo(c) ? rr.feitas.length : 0;
  const jan = !!janelaAberta(c);
  const comp = lista.filter((x) => x.companheiro).sort((a, b) => b.nivel - a.nivel);
  const ex = lista.filter((x) => !x.companheiro && !est.some((e) => e.nome === x.nome)).sort((a, b) => b.nivel - a.nivel);
  const seguidas = lista.filter((x) => !x.companheiro && est.some((e) => e.nome === x.nome)).sort((a, b) => b.nivel - a.nivel);
  const ligaEst = est.filter((e) => !rr.lista[e.nome] && mundo(pacote).info[e.clubeId]?.ligaId === c.ligaId && e.clubeId !== c.clubeId).slice(0, 4);
  const mundoEst = est.filter((e) => !rr.lista[e.nome] && !ligaEst.includes(e)).slice(0, 6);
  const novo = (e: typeof est[number]) => linhaRel(s, { nome: e.nome, clubeId: e.clubeId, nivel: 0, desde: 0 }, ["redes", "mensagem"], ` · ${NOME_POS[e.posicao] ?? "Goleiro"} · ${Math.round(100 * atencao(c.fama, e.fama))}% de atenção`);
  const camisas = lista.filter((x) => x.camisa).length;
  return `<div class="amigos-topo"><div><b>${MAX_ACOES_SEMANA - usadas}</b><span>conversas livres nesta semana</span></div><div><b>${lista.filter((x) => x.nivel >= 40).length}</b><span>amigos</span></div><div><b>${camisas}</b><span>camisas trocadas</span></div></div>
    <p class="sub">A convivência no clube cria amizade sozinha; sair com os amigos no tempo livre acelera. Estrelas respondem mais a quem tem fama. Amigo de verdade (Parceiro, 60+) pode te indicar ao clube dele na janela.</p>
    <p class="rotulo" style="margin-top:14px">Companheiros de clube</p>
    ${comp.length ? comp.slice(0, 10).map((x) => linhaRel(s, x, ["mensagem", "jantar"])).join("") : `<p class="sub">Jogue algumas semanas para conhecer o elenco.</p>`}
    ${ex.length ? `<p class="rotulo" style="margin-top:14px">Ex-companheiros</p>${ex.slice(0, 8).map((x) => linhaRel(s, x, x.nivel >= 60 && jan ? ["mensagem", "indicacao"] : ["mensagem"])).join("")}` : ""}
    ${seguidas.length ? `<p class="rotulo" style="margin-top:14px">Estrelas que você conhece</p>${seguidas.map((x) => linhaRel(s, x, x.nivel >= 60 && jan ? ["redes", "mensagem", "indicacao"] : ["redes", "mensagem"])).join("")}` : ""}
    ${ligaEst.length ? `<p class="rotulo" style="margin-top:14px">Estrelas da sua liga</p>${ligaEst.map(novo).join("")}` : ""}
    <p class="rotulo" style="margin-top:14px">Estrelas do mundo</p>${mundoEst.map(novo).join("")}`;
}

function abaJogador(s: Save): string {
  const j = s.jogador, c = s.carreira, st = c.stats;
  const visual = blocoVisual(s);
  const media = st.notas.length ? (st.notas.reduce((a, b) => a + b, 0) / st.notas.length).toFixed(2) : "–";
  const grupos: [string, Grupo][] = [["Físico", "fisico"], ["Técnico", "tecnico"], ["Tático", "tatico"]];
  return `${visual}${blocoPosicoes(s)}<p class="rotulo" style="margin-top:16px">Atributos · olheiros veem potencial ${j.faixaPot[0]}–${j.faixaPot[1]}</p>
    ${grupos.map(([n, g]) => `<p class="sub" style="margin:10px 0 6px;font-weight:600">${n}</p><div class="atrs">${ATRIBUTOS.filter((a) => GRUPO[a] === g).map((a) => barra(NOME_AT[a], j.at[a], 99, "#E3B341", j.at[a].toFixed(0))).join("")}</div>`).join("")}
    <p class="rotulo" style="margin-top:16px">Temporada</p>
    <div class="kv" style="margin-top:6px"><span>Jogos no profissional</span><b>${st.jogos} (${st.titular} como titular)</b><span>Gols / assistências</span><b>${st.gols} / ${st.assist}</b><span>Nota média</span><b>${media}</b><span>Jogos na base</span><b>${st.base} (${st.baseGols} gols)</b><span>Contrato</span><b>${c.formacao ? "Base" : "Profissional"} · ${c.anosContrato} ${c.anosContrato === 1 ? "ano" : "anos"}</b><span>Salário líquido</span><b>${dinheiro(salarioLiquido(c))}/mês</b></div>
    ${blocoPatrocinios(s)}
    ${blocoVida(s)}
    ${c.historico.length ? `<p class="rotulo" style="margin-top:16px">Carreira</p><table><thead><tr><th>Ano</th><th>Clube</th><th class="n">OVR</th><th class="n">J</th><th class="n">G</th><th class="n">Nota</th></tr></thead><tbody>${c.historico.map((h) => `<tr><td>${h.ano}</td><td>${esc(h.clube)}</td><td class="n">${h.ovr}</td><td class="n">${h.jogos}</td><td class="n">${h.gols}</td><td class="n">${h.nota || "–"}</td></tr>`).join("")}</tbody></table>` : ""}`;
}

// ------------------------------------------------------------------ mercado
const milhoes = (euros: number) => `€ ${(euros / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
const NOME_TIPO: Record<PropostaSave["tipo"], string> = { transferencia: "Transferência", livre: "Sem custo", emprestimo: "Empréstimo", renovacao: "Renovação" };
function abaMercado(s: Save): string {
  const c = s.carreira, j = s.jogador, m = mercadoDe(c), w = mundo(pacote), meu = w.clube[c.clubeId], jan = janelaAberta(c);
  const ligaNome = infoLiga(c.ligaId).curto, papel = papelNoClube(meu, s);
  const aviso = msgMercado ? `<p class="msg-mercado ${msgMercado.ok ? "ok" : "nao"}">${esc(msgMercado.texto)}</p>` : "";
  msgMercado = undefined;
  const contrato = `<div style="display:flex;gap:10px;align-items:center">${escudo(c.clubeId)}<div><h2 style="margin:0">${esc(meu.nome)}</h2><span class="sub">${esc(ligaNome)} · força ${Math.round(meu.forca)} · você é ${NOME_PAPEL[papel].toLowerCase()}</span></div></div><p class="sub" style="margin-top:8px"><b>${esc(NOME_CULTURA[culturaBase(c.clubeId)])}.</b> ${esc(TEXTO_CULTURA[culturaBase(c.clubeId)])}</p>
    <div class="kv" style="margin-top:8px"><span>Contrato</span><b>${c.formacao ? "Base" : "Profissional"} · ${c.anosContrato} ${c.anosContrato === 1 ? "ano" : "anos"}</b><span>Salário</span><b>${dinheiro(c.salario)}/mês</b>${m.emprestimo ? `<span>Empréstimo</span><b>Volta ao ${esc(nomeDe(m.emprestimo.origem))} no fim da temporada</b>` : ""}<span>Mercado</span><b>${jan ? `Janela aberta até a semana ${jan.fim + 1}` : `Fechado · próxima: ${esc(proximaJanela(c))}`}</b></div>
    ${c.fase ? `<p class="sub" style="margin-top:8px">${c.fase === "varzea" ? "Na várzea, o caminho é o olheiro: jogue bem e os convites de peneira aparecem na tela da semana." : c.fase === "academia" ? "Na academia, o clube pode te oferecer contrato homegrown no fim da temporada, a partir dos 15 anos." : c.fase === "colegial" ? "No colégio, as universidades oferecem bolsa no fim do último ano." : "Na universidade, a partir do segundo ano você entra no draft da liga americana no fim da temporada."}</p>`
      : c.formacao || j.idade < 18 ? `<p class="sub" style="margin-top:8px">Na base você ainda não pode ser negociado. O primeiro contrato profissional chega aos 18.</p>` : m.emprestimo ? "" :
      `<div style="margin-top:10px">${m.listaTransferencia
        ? `<p class="sub">Você pediu para ser negociado${m.destinoSaida && m.destinoSaida !== "qualquer" ? ` (clubes ${esc(ONDE_DESTINO[m.destinoSaida])})` : ""}. O agente procura clubes nas janelas.</p><div class="ferr-botoes"><button class="botao sec peq" data-acao="ficar">Tirar o pedido de saída</button></div>`
        : `<p class="sub" style="margin-bottom:6px"><b>Pedir para ser negociado</b>: pedir um mercado específico faz o agente ir atrás de clubes de lá, mas vaza na imprensa e piora a relação com técnico e torcida.</p>
          <div class="chips" style="flex-wrap:wrap">${(Object.keys(NOME_DESTINO) as Destino[]).map((d) => `<button class="chip" data-sair="${d}">${esc(d === "casa" ? `Voltar para casa (${NOME_PAIS[save!.jogador.nacionalidade] ?? "seu país"})` : NOME_DESTINO[d])}</button>`).join("")}</div>`}</div>`}`;
  const card = (p: PropostaSave) => {
    const info = infoClube(pacote, p.clubeId), cl = w.clube[p.clubeId], delta = p.salario - c.salario;
    const botoes = p.travada
      ? `<button class="botao" data-prop="${p.id}" data-op="forcar">Forçar a saída</button><button class="botao sec" data-prop="${p.id}" data-op="recusar">Desistir</button>`
      : `<button class="botao" data-prop="${p.id}" data-op="aceitar">${p.tipo === "renovacao" ? "Renovar" : p.tipo === "emprestimo" ? "Aceitar o empréstimo" : "Aceitar"}</button>${!p.negociada && p.tipo !== "emprestimo" ? `<button class="botao sec" data-prop="${p.id}" data-op="negociar">Pedir mais (agente)</button>` : ""}<button class="botao sec" data-prop="${p.id}" data-op="recusar">Recusar</button>`;
    return `<div class="oferta" style="--c1:${info.cores[0].toUpperCase() === "#FFFFFF" ? info.cores[1] : info.cores[0]}"><div class="faixa"></div><div class="corpo">
      <div style="display:flex;gap:10px;align-items:center">${escudo(p.clubeId)}<div><h2 style="margin:0">${esc(info.nome)}</h2><span class="sub">${esc(infoLiga(p.ligaId).curto)} · ${esc(info.cidade)} · força ${Math.round(cl.forca)} · ${esc(NOME_CULTURA[culturaBase(p.clubeId)].toLowerCase())}</span></div></div>
      <div class="linha-info"><span class="tag ${p.papel === "titular" ? "titular" : p.papel === "rotacao" ? "banco" : "ruim"}">${NOME_TIPO[p.tipo]} · ${NOME_PAPEL[p.papel].toLowerCase()}</span></div>
      <div class="kv"><span>Salário</span><b>${dinheiro(p.salario)}/mês <small class="${delta >= 0 ? "pos" : "neg"}">${delta >= 0 ? "+" : "−"}${dinheiro(Math.abs(delta))}</small></b>${p.anos ? `<span>Contrato</span><b>${p.anos} anos</b>` : `<span>Duração</span><b>Até o fim da temporada</b>`}${p.luvas ? `<span>Luvas</span><b>${dinheiro(p.luvas)}</b>` : ""}${p.taxa ? `<span>Pagam ao ${esc(meu.nome)}</span><b>${milhoes(p.taxa)}</b>` : ""}</div>
      ${p.travada ? `<p class="sub" style="color:var(--neg)">O ${esc(meu.nome)} não quer vender. Forçar a saída desgasta a relação com o técnico e com a torcida.</p>` : p.negociada ? `<p class="sub">O agente já negociou essa.</p>` : ""}
      <div class="ferr-botoes">${botoes}</div></div></div>`;
  };
  const props = m.propostas.length ? `<div class="ofertas">${m.propostas.map(card).join("")}</div>` : `<p class="sub">${jan ? "Nenhuma proposta por enquanto. Elas chegam ao longo da janela; jogar bem e ter um bom agente ajudam." : "Fora da janela de transferências. Jogue bem: os clubes estão olhando."}</p>`;
  const agentes = (Object.keys(AGENTE_INFO) as TipoAgente[]).map((t) => {
    const a = AGENTE_INFO[t], atual = c.agente === t, pode = podeContratarAgente(s, t), alcance = AGENTES[t].ligas === "todas" ? "Todas as ligas" : (AGENTES[t].ligas as string[]).map((x) => infoLiga(x).curto).join(", ");
    return `<div class="agente${atual ? " atual" : ""}"><div><b>${esc(a.nome)}</b> <span class="sub">· ${esc(a.quem)}</span><p class="sub" style="margin:2px 0">${esc(a.texto)}</p><small class="sub">Alcance: ${esc(alcance)}</small></div>
      ${atual ? `<span class="tag titular">Seu agente</span>` : `<button class="botao sec peq" data-agente="${t}" ${pode.ok ? "" : "disabled"} title="${esc(pode.msg)}">Contratar</button>${pode.ok ? "" : `<small class="sub">${esc(pode.msg)}</small>`}`}</div>`;
  }).join("");
  const hist = m.transferencias.length ? `<p class="rotulo" style="margin-top:16px">Transferências</p><div class="kv">${m.transferencias.map((t) => `<span>${2026 + t.temporada}</span><b>${esc(nomeDe(t.de))} → ${esc(nomeDe(t.para))}${t.tipo === "emprestimo" ? " (empréstimo)" : t.taxa ? ` · ${milhoes(t.taxa)}` : t.tipo === "livre" ? " (de graça)" : ""}</b>`).join("")}</div>` : "";
  return `${aviso}<p class="rotulo">Seu contrato</p>${contrato}
    <p class="rotulo" style="margin-top:16px">Propostas</p>${props}
    <p class="rotulo" style="margin-top:16px">Agente</p><div style="display:flex;flex-direction:column;gap:8px">${agentes}</div>${hist}
    <p class="sub" style="margin-top:12px">Janelas: semanas ${JANELAS.map((x) => `${x.ini + 1}–${x.fim + 1}`).join(" e ")} de cada temporada.</p>`;
}

let casualMini: string | undefined;
function imgNoticia(s: Save, n: Noticia, i: number): string {
  const img = n.img;
  if (img?.k === "transferencia" && s.noticias.findIndex((x) => x.img?.k === "transferencia") === i) return `<div class="noticia-img grande">${anuncioDe(s, n)}</div>`;
  const ci = (id: string) => { const c = infoClube(pacote, id); return [c.cores[0], c.cores[1] ?? "#FFFFFF"] as [string, string]; };
  if (img?.k === "placar") return miniNoticia({ k: "placar", casa: ci(img.casa), fora: ci(img.fora), gc: img.gc, gf: img.gf, nomeCasa: infoClube(pacote, img.casa).nome, nomeFora: infoClube(pacote, img.fora).nome });
  if (img?.k === "transferencia") return miniNoticia({ k: "transferencia", cores: ci(img.clube), corpoSvg: corpoDe(s, "jogo", img.clube) });
  if (img?.k === "patrocinio" && MARCA[img.marca]) return miniNoticia({ k: "patrocinio", logoSvg: logoSvg(MARCA[img.marca]), cor: MARCA[img.marca].cores[2] });
  if (img?.k === "trofeu") return miniNoticia({ k: "trofeu" });
  if (img?.k === "vida" || img?.k === "tatuagem") return miniNoticia({ k: "vida", corpoSvg: casualMini ??= corpoDe(s, "casual") });
  return miniNoticia(n.tipo === "lesao" ? { k: "lesao" } : n.tipo === "dinheiro" ? { k: "dinheiro" } : n.tipo === "polemica" ? { k: "polemica" } : n.tipo === "jogo" ? { k: "trofeu", cor: "#C9CCD1" } : { k: "clube", cores: ci(s.carreira.clubeId) });
}
// ------------------------------------------------------------------ perfil completo (estilo Football Manager)
function radar(at: Record<Atributo, number>): string {
  const eixos: [string, number][] = [["Ritmo", at.VEL], ["Finalização", (at.FIN * 2 + at.CAB) / 3], ["Passe", (at.PAS + at.VIS + at.CRU) / 3], ["Drible", (at.DRI * 2 + at.COM) / 3], ["Defesa", (at.MAR + at.POS) / 2], ["Físico", (at.FOR + at.RES) / 2]];
  const cx = 130, cy = 108, R = 78, pt = (i: number, v: number) => { const a = -Math.PI / 2 + (i * Math.PI) / 3; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
  const anel = (k: number) => eixos.map((_, i) => pt(i, k).map((x) => x.toFixed(1)).join(",")).join(" ");
  const dados = eixos.map(([, v], i) => pt(i, Math.max(0.08, v / 99)).map((x) => x.toFixed(1)).join(",")).join(" ");
  return `<svg class="radar" viewBox="0 0 260 220" role="img" aria-label="Radar de atributos">
    ${[0.25, 0.5, 0.75, 1].map((k) => `<polygon points="${anel(k)}" fill="none" stroke="var(--linha)" stroke-width="1"/>`).join("")}
    ${eixos.map((_, i) => { const [x, y] = pt(i, 1); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--linha)"/>`; }).join("")}
    <polygon points="${dados}" fill="#E3B341" fill-opacity=".32" stroke="#E3B341" stroke-width="2.4" stroke-linejoin="round"/>
    ${eixos.map(([n, v], i) => { const [x, y] = pt(i, 1.22); return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--giz-2)">${n} <tspan fill="var(--giz)" font-weight="800">${Math.round(v)}</tspan></text>`; }).join("")}
  </svg>`;
}
const tile = (valor: string, rotulo: string) => `<div class="tile"><b>${valor}</b><span>${rotulo}</span></div>`;
function perfilHtml(s: Save): string {
  const j = s.jogador, c = s.carreira, info = infoClube(pacote, c.clubeId), w = mundo(pacote);
  const [c1, c2] = info.cores;
  const atual: ResumoTemporada | undefined = c.stats.jogos || c.stats.base ? { ano: ANO_INICIAL + c.temporada, idade: j.idade, clube: info.nome, clubeId: c.clubeId, liga: infoLiga(c.ligaId).curto, ovr: Math.round(ovr(j)), jogos: c.stats.jogos, gols: c.stats.gols, assist: c.stats.assist, nota: c.stats.notas.length ? c.stats.notas.reduce((a, b) => a + b, 0) / c.stats.notas.length : 0, posicao: 0, titulo: false, base: c.stats.base, est: estatisticasEstimadas(j.at, j.posicao, `${s.semente}|${c.temporada}`) } : undefined;
  const hist = [...c.historico, ...(atual ? [atual] : [])];
  const t = totaisDaCarreira(hist), clubes = clubesDaCarreira(hist.filter((h) => h.jogos || h === hist[0]));
  const est = t.est ?? estatisticasEstimadas(j.at, j.posicao, `${s.semente}|${c.temporada}`);
  const pers = personalidade({ ...j.personalidade, carisma: j.personalidade.carisma ?? 10 }), estilo = estiloDeJogo(j.at, j.posicao), pf = pontos(j.at, j.posicao);
  const vm = valorMercado(ovr(j), j.idade, c.anosContrato, w.liga[infoLiga(c.ligaId).id].fLiga);
  const torc = c.torcida ?? 50;
  const idClube = (h: { clubeId?: string; clube: string }) => h.clubeId ?? Object.values(w.info).find((x) => x.nome === h.clube)?.id;
  const minGol = t.gols ? Math.round((t.jogos * 78) / t.gols) : 0;
  const arm = armario(hist), aberto = arm.find((x) => x.nome === trofeuAberto);
  // parceiros de vestiário: no clube onde mais jogou, os companheiros de idade parecida
  const casa = [...clubes].sort((a, b) => b.jogos - a.jogos)[0], idCasa = casa ? idClube(casa) : undefined;
  const elenco = idCasa ? w.clube[idCasa]?.elenco ?? [] : [];
  const amigos = [...elenco].filter((x) => !x.nome.startsWith(j.apelido)).sort((a, b) => Math.abs(a.idade - j.idade) - Math.abs(b.idade - j.idade) || b.ovr - a.ovr).slice(0, 2).map((x) => ({ nome: x.nome, clube: casa!.clube }));
  const tmax = c.torcidaMax ?? {}, nomeDe = (id: string) => infoClube(pacote, id)?.nome ?? id;
  const idolo = Object.entries(tmax).filter(([, v]) => v >= 85).sort((a, b) => b[1] - a[1])[0]?.[0], querido = Object.entries(tmax).filter(([, v]) => v >= 70).sort((a, b) => b[1] - a[1])[0]?.[0];
  const pais = PAISES.find((x) => x.id === j.pais);
  const bio = biografia({ nome: j.nome, apelido: j.apelido, pais: pais?.local ?? "no Brasil", posicao: NOME_POS[j.posicao], idade: j.idade, perfil: j.perfilNome, hist, clubeAtual: info.nome, fama: c.fama,
    estilo: estiloDeJogo(j.at, j.posicao).nome, forte: pontos(j.at, j.posicao).fortes[0], traco: j.tracos[0] ? TRACOS[j.tracos[0]]?.nome : undefined,
    idolo: idolo ? nomeDe(idolo) : undefined, querido: querido ? nomeDe(querido) : undefined, amigos: (() => { const reais = melhoresAmigos(pacote, s.carreira); return reais.length ? reais : t.jogos >= 30 ? amigos : []; })(), semente: s.semente });
  return `<div class="perfil-topo" style="--c1:${c1};--c2:${c2 ?? "#FFFFFF"}">
      <button class="fechar" data-acao="fechar-perfil" aria-label="Fechar">✕</button>
      <div class="perfil-foto">${foto(s)}</div>
      <div class="perfil-nome"><small>${esc(NOME_POS[j.posicao])} · ${j.idade} anos · ${esc(NOME_PAIS[j.nacionalidade] ?? j.nacionalidade)}</small><h1>${esc(j.apelido)}</h1><span>${esc(j.nome)}</span>
        <div class="perfil-clube">${escudo(c.clubeId)}<b>${esc(info.nome)}</b><small>${esc(infoLiga(c.ligaId).curto)}</small></div></div>
      <div class="perfil-ovr"><strong>${Math.round(ovr(j))}</strong><span>OVR</span><small>Pot. ${j.faixaPot[0]}–${j.faixaPot[1]}</small></div>
    </div>
    <div class="perfil-corpo">
      <p class="bio">${esc(bio)}</p>
      <div class="kv perfil-info"><span>Altura</span><b>${j.alturaCm ? `${(j.alturaCm / 100).toFixed(2).replace(".", ",")} m` : "–"}</b><span>Pé</span><b>${j.pe === "esquerdo" ? "Esquerdo" : j.pe === "ambidestro" ? "Ambidestro" : "Direito"}</b><span>Valor de mercado</span><b>${milhoes(vm)}</b><span>Salário</span><b>${dinheiro(c.salario)}/mês</b><span>Contrato</span><b>${c.formacao ? "Base" : `${c.anosContrato} ${c.anosContrato === 1 ? "ano" : "anos"}`}</b><span>Seguidores</span><b>${compacto(c.seguidores)}</b></div>

      <p class="rotulo">Carreira</p>
      <div class="tiles">${tile(String(t.jogos), "Jogos")}${tile(String(t.gols), "Gols")}${tile(String(t.assist), "Assistências")}${tile(t.nota ? t.nota.toFixed(2) : "–", "Nota média")}${tile(String(t.titulos.length), "Títulos")}${tile(String(t.premios.length), "Prêmios")}</div>

      <p class="rotulo">Estatísticas <small>(média da carreira, estimada pelo scout)</small></p>
      <div class="tiles">${tile(`${est.passe}%`, "Passes certos")}${tile(`${est.chute}%`, "Chutes no gol")}${tile(String(est.drible).replace(".", ","), "Dribles por jogo")}${tile(String(est.desarme).replace(".", ","), "Desarmes por jogo")}${tile(t.jogos ? (t.gols / t.jogos).toFixed(2).replace(".", ",") : "–", "Gols por jogo")}${tile(minGol ? `${minGol}'` : "–", "Minutos por gol")}</div>

      <p class="rotulo">Atributos</p>
      ${radar(j.at)}

      <p class="rotulo">Relatório do olheiro</p>
      <div class="relatorio">
        <div><small>Estilo de jogo</small><b>${esc(estilo.nome)}</b><span>${esc(estilo.texto)}</span></div>
        <div><small>Personalidade</small><b>${esc(pers.nome)}</b><span>${esc(pers.texto)}</span></div>
      </div>
      <div class="chips-lista">${pf.fortes.map((x) => `<span class="chip-info pos">+ ${esc(x)}</span>`).join("")}${pf.fracos.map((x) => `<span class="chip-info neg">− ${esc(x)}</span>`).join("")}${j.tracos.map((x) => `<span class="chip-info">★ ${esc(TRACOS[x]?.nome ?? x)}</span>`).join("")}</div>

      <p class="rotulo">Reputação</p>
      <div class="barras">${barra(`Torcida · ${rotuloTorcida(torc)}`, torc, 100, "#74D394")}${barra(`Técnico · ${rotuloTecnico(c.relTecnico)}`, c.relTecnico, 100, "#B9A3E8")}${barra(`Mundo · ${rotuloFama(c.fama)}`, c.fama, 100, "#E3B341")}</div>

      <p class="rotulo">Clubes</p>
      <div class="lista-clubes">${clubes.map((k) => { const id = idClube(k); return `<div class="linha-clube">${id ? escudo(id) : ""}<div><b>${esc(k.clube)}</b><small>${k.de === k.ate ? k.de : `${k.de}–${k.ate}`}</small></div><span>${k.jogos} j · ${k.gols} g · ${k.assist} a${k.titulos ? ` · 🏆 ${k.titulos}` : ""}</span></div>`; }).join("") || `<p class="sub">Ainda na base.</p>`}</div>

      <p class="rotulo">Armário de troféus</p>
      ${arm.length ? `<div class="armario">${arm.map((x) => `<button class="trofeu-cel${trofeuAberto === x.nome ? " ativo" : ""}" data-trofeu="${esc(x.nome)}" aria-expanded="${trofeuAberto === x.nome}"><svg viewBox="-13 -30 26 32" aria-hidden="true">${trofeuSvg(0, 0, x.modelo, x.cores)}</svg><b>${x.vezes.length}×</b><small>${esc(x.nome)}</small></button>`).join("")}</div>
        ${aberto ? `<div class="trofeu-detalhe"><b>${esc(aberto.nome)}</b>${[...aberto.vezes].sort((a, b) => b.ano - a.ano).map((v) => `<div><span>${v.ano}</span>${esc(v.clube)}${v.liga ? ` · <small>${esc(v.liga)}</small>` : ""}</div>`).join("")}</div>` : `<p class="sub">Toque num troféu para ver as temporadas.</p>`}` : `<p class="sub">Nenhum ainda. A estante da casa está esperando.</p>`}

      ${armarioCamisas(s)}

      <p class="rotulo">Temporada a temporada</p>
      <table><thead><tr><th>Ano</th><th>Clube</th><th class="n">OVR</th><th class="n">J</th><th class="n">G</th><th class="n">A</th><th class="n">Nota</th></tr></thead><tbody>${hist.map((h) => `<tr><td>${h.ano}</td><td>${esc(h.clube)}${h.titulo ? " 🏆" : ""}</td><td class="n">${h.ovr}</td><td class="n">${h.jogos}</td><td class="n">${h.gols}</td><td class="n">${h.assist}</td><td class="n">${h.nota ? h.nota.toFixed(1) : "–"}</td></tr>`).join("")}</tbody></table>
    </div>`;
}
let trofeuAberto: string | undefined, camisaAberta: string | undefined;
/** Armário de camisas: as especiais e as trocadas com craques. */
function armarioCamisas(s: Save): string {
  const minhas = (s.casa.reliquias ?? []).filter((r) => r.tipo === "camisa").sort((a, b) => a.ano - b.ano);
  if (!minhas.length) return `<p class="rotulo">Armário de camisas</p><p class="sub">Nenhuma ainda. A estreia, o primeiro gol e as trocas com craques vêm parar aqui.</p>`;
  const nomeCostas = (r: Reliquia) => (r.chave === "camisa-troca" ? r.nome.replace(/^Camisa d[eoa] /, "") : s.jogador.apelido);
  const r = minhas.find((x) => x.id === camisaAberta);
  return `<p class="rotulo">Armário de camisas <small>(${minhas.length})</small></p>
      <div class="armario camisas">${minhas.map((x) => `<button class="camisa-cel${camisaAberta === x.id ? " ativo" : ""}" data-camisa="${esc(x.id)}" aria-expanded="${camisaAberta === x.id}">${camisaCostas({ cores: x.cores, modelo: x.modelo, numero: x.numero }, nomeCostas(x))}<small>${esc(x.nome.replace(/^Camisa d[aeo] /, ""))}</small></button>`).join("")}</div>
      ${r ? `<div class="trofeu-detalhe"><b>${esc(r.nome)}</b><div>${esc(r.legenda)}</div><small>É uma relíquia: dá para pendurar na parede na aba Casa.</small></div>` : `<p class="sub">Toque numa camisa para ver a história dela.</p>`}`;
}
function abrirPerfil() {
  if (!save) return;
  $("telaPerfil").innerHTML = perfilHtml(save);
  ($("dlgPerfil") as HTMLDialogElement).showModal();
  $("telaPerfil").scrollTop = 0;
}
function abaNoticias(s: Save): string {
  casualMini = undefined;
  return s.noticias.length ? `<div style="display:flex;flex-direction:column;gap:12px">${s.noticias.slice(0, 25).map((n, i) => `<div class="noticia ${n.tipo}">${imgNoticia(s, n, i)}<div><small>${esc(n.semana)}</small><strong>${esc(n.titulo)}</strong><span class="sub">${esc(n.texto)}</span></div></div>`).join("")}</div>` : `<p class="sub">Nada por enquanto.</p>`;
}

function abaCasa(s: Save): string {
  const m = imovelAtual(s.casa), ef = efeitosDaCasa(s.casa).total;
  const rels = s.casa.reliquias ?? [];
  // mostra o cômodo com mais relíquias, se houver
  const conta = (id: string) => s.casa.objetos.filter((o) => o.comodo === id && o.item.startsWith("rel-")).length;
  const c0 = [...m.comodos].sort((a, b) => conta(b.id) - conta(a.id))[0];
  return `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><div><p class="rotulo">Onde você mora</p><h2>${esc(nomeImovel(s.casa, m))}</h2></div><div class="ovr"><strong style="font-size:32px">${conforto(s.casa)}</strong><span>Conforto</span></div></div>
    <div class="casa-mini" style="margin-top:10px">${svgComodo(s.casa, c0.id)}</div>
    <p class="sub" style="margin-top:10px">A casa entra na semana: recuperação ${sinal(ef.recuperacao)}, moral ${sinal(ef.moral)}, proteção contra lesão ${sinal(ef.lesao)}%, evolução ${sinal(ef.evolucao)}%, fama ${sinal(ef.fama)}.</p>
    <p class="sub" style="margin-top:6px">${rels.length ? `Coleção: <b>${rels.length}</b> ${rels.length === 1 ? "relíquia" : "relíquias"}. Mais recente: ${esc(rels[rels.length - 1].nome)}.` : "Camisas, bolas e troféus que você conquistar em campo aparecem aqui para enfeitar a casa."}</p>
    <a class="botao" href="casa.html" style="margin-top:12px;width:100%">Entrar em casa</a>`;
}

// ------------------------------------------------------------------ partida narrada
let partida: Partida | undefined;
let resultados: ResultadoDecisao[] = [];
type ItemFila = { min: number; html?: string; cls?: string; decisao?: Decisao; gol?: "casa" | "fora"; meu?: "gol" | "assist"; texto?: string; saida?: boolean; fim?: boolean };
let fila: ItemFila[] = [];
let placar = [0, 0], timer = 0, minutoAtual = 0, nDec = 0, amarelos = 0, expulso = false, comemorou = false, posFeito = false;
const decisoesAbertas: Record<number, Decisao> = {};

function htmlGol(p: Partida, lado: "casa" | "fora", meu?: "gol" | "assist", texto?: string) {
  const nome = save!.jogador.apelido, time = lado === "casa" ? p.nomeCasa : p.nomeFora, meuTime = (lado === "casa") === p.souCasa;
  const extra = meu === "gol" ? ` GOL de ${esc(nome)}!` : meu === "assist" ? ` Assistência de ${esc(nome)}.` : "";
  return `<span class="${meuTime ? (meu ? "meu" : "") : "contra"}">Gol do ${esc(time)}!${extra}</span>${texto ? `<br><small class="detalhe">${esc(texto)}</small>` : ""}`;
}

function abrirJogo() {
  if (!save) return;
  partida = prepararPartida(pacote, save, plano);
  resultados = [];
  if (!partida || partida.escalacao === "lesionado" || partida.escalacao === "fora" || partida.escalacao === "suspenso" || (partida.escalacao === "banco" && partida.entrada > 90 && partida.lances.length === 0)) { fecharSemana(); return; }
  const p = partida, nome = save.jogador.apelido;
  placar = [0, 0]; minutoAtual = 0; amarelos = 0; expulso = false; comemorou = false; posFeito = false;
  fila = [{ min: 0, html: `${esc(p.abertura || "Bola rolando.")}${p.escalacao === "titular" || p.tipo === "base" ? ` ${esc(nome)} começa jogando.` : ` ${esc(nome)} começa no banco.`}` }];
  for (const l of p.narracao ?? []) fila.push({ min: l.min, html: esc(l.texto), cls: l.cls });
  if (p.entrada > 0 && p.entrada <= 90) fila.push({ min: p.entrada, html: `Substituição: ${esc(nome)} entra em campo.` });
  if (p.saida < 90) fila.push({ min: p.saida, saida: true, html: `${esc(nome)} sente o cansaço e é substituído.` });
  fila.push({ min: 45, html: "Intervalo." });
  for (const l of p.lances) fila.push({ min: l.min, gol: l.lado, meu: l.meu, texto: l.texto });
  p.decisoes.forEach((d) => fila.push({ min: d.min, decisao: d }));
  fila.sort((a, b) => a.min - b.min || (a.decisao ? 1 : 0) - (b.decisao ? 1 : 0));
  fila.push({ min: 90, fim: true, html: "Fim de jogo." });
  $("telaJogo").innerHTML = `<div class="placar"><p class="rotulo" style="text-align:center;margin-bottom:6px">${p.tipo === "base" ? categoriaBase(save.jogador.idade).replace("s", "S") : rotuloSemana(save.carreira)}</p>
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
  if (!partida || !save) return;
  if (!item) { $("rodapeJogo").innerHTML = `<button class="botao grande" data-acao="fimjogo">Ver a semana</button>`; return; }
  minutoAtual = item.min;
  if (item.decisao) {
    // lance de campo só com o jogador em campo: nada antes de entrar, depois de sair ou de ser expulso
    const momento = SITUACAO[item.decisao.situacao]?.momento ?? (item.decisao.situacao === "comemoracao" ? "comemoracao" : "");
    const deCampo = momento !== "pos" && momento !== "comemoracao";
    if (deCampo && (expulso || item.min < partida.entrada || item.min > Math.min(90, partida.saida))) { avancar(); return; }
    mostrarDecisao(item.decisao); atualizarPlacar(); return;
  }
  if (item.gol) { if (item.gol === "casa") placar[0]++; else placar[1]++; }
  atualizarPlacar();
  adicionarLance(item.min, item.html ?? htmlGol(partida, item.gol!, item.meu, item.texto), item.gol ? "gol" : item.cls ?? "");
  if (item.meu === "gol") abrirComemoracao(item.min);
  if (item.fim && !posFeito) {
    // depois do apito, às vezes ainda tem entrevista, troca de camisa, conversa com o técnico...
    posFeito = true;
    const pos = decisaoPosJogo(save, partida, resultados);
    if (pos) fila.unshift({ min: 90, decisao: pos });
  }
  if (!fila.length) { $("rodapeJogo").innerHTML = `<button class="botao grande" data-acao="fimjogo">Ver a semana</button>`; return; }
  timer = window.setTimeout(avancar, item.gol ? 1100 : 650);
}

/** Na primeira vez que o jogador marca no jogo, ele escolhe como comemorar. */
function abrirComemoracao(min: number) {
  if (comemorou || expulso) return;
  comemorou = true;
  fila.unshift({ min, decisao: decisaoComemoracao(save!, partida!, min) });
}

function mostrarDecisao(d: Decisao) {
  const i = nDec++; decisoesAbertas[i] = d;
  const el = document.createElement("div"); el.className = "decisao"; el.id = `dec${i}`;
  const pos = SITUACAO[d.situacao]?.momento === "pos";
  el.innerHTML = `<p class="rotulo" style="color:var(--ouro)">${pos ? "Depois do jogo" : `${d.min}' · Sua decisão`}</p><h2>${esc(d.titulo)}</h2><p class="sub" style="font-size:15px;color:var(--giz)">${esc(d.texto)}</p>
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
  } else if (r.sai) {
    expulso = true;
    novos.push({ min: d.min, html: `${esc(save!.jogador.apelido)} deixa o campo.` });
    fila = fila.filter((x) => !(x.decisao && SITUACAO[x.decisao.situacao]?.momento !== "pos") && !x.saida).map((x) => (x.meu ? { ...x, meu: undefined } : x));
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
      <div class="kv"><span>Jogos no profissional</span><b>${r.fimDeTemporada.jogos}</b><span>Gols / assistências</span><b>${r.fimDeTemporada.gols} / ${r.fimDeTemporada.assist}</b><span>Jogos na base</span><b>${r.fimDeTemporada.base}</b><span>OVR</span><b>${r.fimDeTemporada.ovr}</b></div>${r.fimDeTemporada.premios?.length ? `<p class="sub" style="margin-top:8px;color:var(--ouro-claro)">🏆 ${r.fimDeTemporada.premios.map(esc).join(" · ")}</p>` : ""}<p class="sub" style="margin-top:8px">Agora você tem ${save!.jogador.idade} anos. Uma nova temporada começa com a pré-temporada.</p></section>` : "";
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
  const b = (ev.target as Element).closest<HTMLElement>("[data-acao],[data-assinar],[data-foco],[data-int],[data-dia],[data-aba],[data-decidir],[data-prop],[data-agente],[data-evento],[data-vida],[data-patro],[data-vis],[data-traje],[data-tarea],[data-tat],[data-tat-remover],[data-sair],[data-trofeu],[data-camisa],[data-rel],[data-tpos],[data-mudapos],[data-sug],[data-caminho],[data-cidade],[data-convite],[data-num],[data-num-manter],[data-cel],[data-fav],[data-fam],[data-bliga],[data-bclube],[data-curtir],[data-nam]");
  if (!b) return;
  const d = b.dataset;
  if (d.assinar) {
    const dados = ler<DadosCriacao>(CHAVE_JOGADOR)!;
    dados.caminho = caminhoSel; dados.cidade = caminhoSel === "varzea" ? cidadeSel ?? cidadeDaVarzea(pacote, dados.clube) : undefined;
    save = novoJogo(pacote, dados, d.assinar); plano = planoPadrao(); salvar(); render(); window.scrollTo(0, 0);
  } else if (d.foco) { plano.foco = d.foco as Grupo; salvar(); render(); }
  else if (d.int) { plano.intensidade = d.int as Intensidade; salvar(); render(); }
  else if (d.dia) { plano.acoes[+d.dia] = d.a as Acao; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.aba) { aba = d.aba as typeof aba; render(); if (b.classList.contains("aviso-mercado")) document.querySelector(".abas")?.scrollIntoView({ behavior: "smooth" }); }
  else if (d.prop && save) {
    const r = d.op === "aceitar" ? aceitar(pacote, save, d.prop) : d.op === "forcar" ? aceitar(pacote, save, d.prop, true) : d.op === "negociar" ? negociar(pacote, save, d.prop) : recusar(pacote, save, d.prop);
    msgMercado = { texto: r.msg, ok: r.ok }; salvar(); render();
    if (r.ok && (d.op === "aceitar" || d.op === "forcar")) window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (d.agente && save) { const r = trocarAgente(save, d.agente as TipoAgente); msgMercado = { texto: r.msg, ok: r.ok }; salvar(); render(); }
  else if (d.decidir) decidir(+d.decidir, d.op!);
  else if (d.patro && save) {
    if (d.patro === "recusar") recusarPatrocinio(save); else cartazNovo = aceitarPatrocinio(save, d.patro as TipoContrato);
    salvar(); const y = window.scrollY; render(); window.scrollTo(0, y);
  }
  else if (d.vis?.startsWith("ap:") && save) { // salão: corte e cor do cabelo
    save.jogador.aparencia = { ...aparenciaDe(save.jogador.aparencia), [d.vis.slice(3)]: +d.val! };
    salvar(); const y = window.scrollY; render(); window.scrollTo(0, y);
  }
  else if (d.vis && save) {
    const v = visualDe(save.jogador) as unknown as Record<string, unknown>;
    v[d.vis] = d.vis === "corCasual" ? +d.val! : d.val; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y);
  } else if (d.traje) { trajeVisto = d.traje as "jogo" | "casual"; const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.tarea) { areaTat = d.tarea as AreaTatuagem; const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if ((d.tat || d.tatRemover) && save) {
    const rv = d.tat ? tatuar(save, areaTat, d.tat) : removerTatuagem(save, d.tatRemover as AreaTatuagem);
    msgVisual = { texto: rv.msg, ok: rv.ok };
    if (rv.ok && d.tat) trajeVisto = tatuagemVisivel(areaTat, visualDe(save.jogador), "jogo") ? "jogo" : "casual";
    salvar(); const y = window.scrollY; render(); window.scrollTo(0, y);
  }
  else if (d.camisa && save) { camisaAberta = camisaAberta === d.camisa ? undefined : d.camisa; const tela = $("telaPerfil"), y = tela.scrollTop; tela.innerHTML = perfilHtml(save); tela.scrollTop = y; }
  else if (d.trofeu && save) { trofeuAberto = trofeuAberto === d.trofeu ? undefined : d.trofeu; const tela = $("telaPerfil"), y = tela.scrollTop; tela.innerHTML = perfilHtml(save); tela.scrollTop = y; }
  else if ((d.num || d.numManter) && save) {
    const n = d.numManter ? +save.jogador.numero : +d.num!, g = gradeDoClube(pacote, save);
    if (!d.numManter && g[n - 1]?.dono) { numeroVisto = n; const y = window.scrollY; render(); window.scrollTo(0, y); return; }
    const rr = escolherNumero(pacote, save, n); numeroVisto = undefined;
    msgEvento = { titulo: "Camisa", texto: rr.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y);
  }
  else if (d.caminho) { caminhoSel = d.caminho as Caminho; render(); }
  else if (d.cidade) { cidadeSel = d.cidade; render(); }
  else if (d.convite && save) {
    const rr = d.op === "aceitar" ? aceitarConvite(pacote, save, d.convite) : recusarConvite(pacote, save, d.convite);
    msgConvite = { texto: rr.msg, ok: rr.ok }; salvar(); render(); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  else if (d.cel) { telaCel = d.cel as typeof telaCel; render(); }
  else if (d.fav && save) { alternarFavorito(relacoesDe(save.carreira), d.fav); salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.fam && save) { const r = agirFamiliaJogo(pacote, save, d.fam, d.op as AcaoFamilia); msgRel = { texto: r.msg, ok: r.ok }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.bliga) { buscaLiga = d.bliga; buscaClube = undefined; render(); }
  else if (d.bclube) { buscaClube = d.bclube; const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.curtir && save) { const r = curtirPerfil(pacote, save, d.curtir, d.sim === "1"); msgRel = { texto: r.msg, ok: r.ok }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.nam && save) { const r = agirNamoroJogo(pacote, save, d.nam, d.op as AcaoNamoro); msgRel = { texto: r.msg, ok: r.ok }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.rel && save) {
    const r = agirRelacao(pacote, save, d.rel, d.op as AcaoRel, d.clube); msgRel = { texto: r.msg, ok: r.ok };
    if (d.op === "camisa" && aba !== "amigos") msgRel = undefined;
    salvar(); const y = window.scrollY; render(); window.scrollTo(0, y);
  }
  else if (d.tpos !== undefined && save) { msgPos = { texto: treinarPosicao(save, (d.tpos || undefined) as never), ok: true }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.mudapos && save) { const r = mudarPosicao(save, d.mudapos as never); msgPos = { texto: r.msg, ok: r.ok }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.sug && save) { msgPos = { texto: responderSugestao(save, d.sug === "sim"), ok: true }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.sair && save) { const r = pedirParaSair(save, true, d.sair as Destino); msgMercado = { texto: r.msg, ok: r.ok }; salvar(); render(); }
  else if (d.evento && save) { msgEvento = resolverEvento(pacote, save, d.evento); salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.vida && save) { padraoDe(save.carreira)[d.vida as ItemVida] = +d.nivel!; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else switch (d.acao) {
    case "exemplo": {
      const e: EscolhasCriacao = { nome: "Gabriel Souza", apelido: "Gabi", pais: "BRA", familia: "humilde", formacao: "rua", alturaCm: 176, pe: "esquerdo", posicao: "PON", clubeCoracao: "FLA" };
      gravar(CHAVE_JOGADOR, { resultado: criarJogador(e), aparencia: { ...APARENCIA_PADRAO, cabelo: 4, tom: 4, corCabelo: 1 }, clube: "FLA", perfil: undefined, decisao: null });
      render(); break;
    }
    case "jogar": abrirJogo(); break;
    case "perfil": abrirPerfil(); break;
    case "fechar-perfil": ($("dlgPerfil") as HTMLDialogElement).close(); break;
    case "fechar-anuncio": gravar(CHAVE_ANUNCIO, b.dataset.chave); render(); break;
    case "sair": case "ficar": if (save) { const r = pedirParaSair(save, d.acao === "sair"); msgMercado = { texto: r.msg, ok: r.ok }; salvar(); render(); } break;
    case "pular": if (save) {
      // atalho de teste: o jogo segue no automático (sem mexer no mercado) até abrir a próxima janela com você profissional
      const c = save.carreira;
      let n = 0, saiu = !janelaAberta(c);
      while (n < 60) {
        semanaAutomatica(pacote, save, false); n++;
        const jan = janelaAberta(c);
        if (!jan) saiu = true;
        else if (saiu && save.jogador.idade >= 18 && !c.formacao && (mercadoDe(c).propostas.length || c.semana >= jan.fim)) break;
      }
      plano = planoPadrao(); aba = "mercado"; msgMercado = { texto: `${n} semanas simuladas.`, ok: true }; salvar(); render(); window.scrollTo(0, 0);
    } break;
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
document.addEventListener("keydown", (ev) => { if ((ev.key === "Enter" || ev.key === " ") && (ev.target as HTMLElement).classList?.contains("card-jogador")) { ev.preventDefault(); abrirPerfil(); } });
void SEMANAS_PRE;
render();
