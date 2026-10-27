// A semana do jogador: início (criação e ofertas de base), plano da semana, jogo narrado com decisões e resumo.
import { camisaCostas } from "../visual/camisas";
import type { Reliquia } from "../../src/casa";
import pacoteJson from "../../data/pacote-brasil-serie-a-v0.3.json";
import type { PacoteDados } from "../../src/liga";
import { ordenar, type LinhaTabela } from "../../src/liga";
import { COPAS, ehDeSelecao, ufDoClube, NOME_FASE as NOME_FASE_COPA, rotuloJogo, idaDe, copaDoClube, vencedorSerie, type CopaId, type JogoCopa } from "../../src/copas";
import { ATRIBUTOS, GRUPO, type Atributo, type Grupo, type Intensidade } from "../../src/atributos";
import { criarJogador, type EscolhasCriacao } from "../../src/dna";
import { conforto, efeitosDaCasa, imovelAtual, nomeImovel, dinheiro, registrarReliquias, manutencaoMensal, ehDono } from "../../src/casa";
import {
  ACOES, NOME_ESCALACAO, SEMANAS_PRE, SEMANAS_TEMPORADA, clubeCasa, decisaoComemoracao, decisaoPosJogo, clubeDe, concluirSemana, escalacao, forma, jogoDaSemana, liga, novoJogo,
  ofertasDeBase, ovr, planoPadrao, nRodadas, jogosDaRodada, ehClassico, ligaAtual, semanaAutomatica, categoriaBase, prepararPartida, previaPlano, resolverDecisao, rotuloSemana, salarioLiquido,
  ANO_INICIAL, type ResumoTemporada, type Noticia, type ImgNoticia, type Acao, type DadosCriacao, type Decisao, type Partida, type Plano, type ResultadoDecisao, type ResumoSemana, type Save,
  ofertasDoCaminho, gradeDoClube, escolherNumero, saidasAtuais, agirRelacao, responderSugestao, treinarPosicao, mudarPosicao, familiaridadeDe, melhoresAmigos, semanaAbsJogo, ovrEm,
  migrarSave, tatuar, removerTatuagem, eventoPendente, resolverEvento, padraoDe, alvoDeSeguidores, aceitarPatrocinio, recusarPatrocinio, receitaPatrocinios,
  familiaDe, namoroDe, ctxFamilia, agirFamiliaJogo, perfisDaSemana, curtirPerfil, agirNamoroJogo, agirFilhoJogo,
  copasDe, jogoCopaDaSemana, diasTravados, escalacaoSelecao, recordesDoJogador, anunciarAposentadoria, desistirAposentadoria, numerosNoClube, type ListaRecorde, concluirJogoDaCopa, chatDe, responderChatJogo, responderCenaJogo, agendaDe, parcasDe, luxoDe, hobbiesDe, estudosDe, responderOcasiaoJogo, churrascoJogo, funcaoParcaJogo, afastarParcaJogo, comprarLuxoJogo, venderLuxoJogo, hobbyJogo, matricularJogo, criarFundacaoJogo, nivelFundacaoJogo, negociosDe, saudeDe, midiaDe, ctxMidia, postarJogo, responderEntrevistaJogo, abrirEmpresaJogo, agirEmpresaJogo, aplicarJogo, responderPropostaNegocio, assessorJogo, equipeJogo, tratarJogo, operarJogo, disputaDePenaltis, decisaoDisputa, placarDisputa, type Disputa, type TipoMarco, reservaNaBase, type ResumoPartida,
} from "../../src/jogo";
import { acoesDe, parentescoCompleto, idadeDe, rotuloRelacaoFam, NOME_ACAO_FAM, NOME_TRACO, NOME_FASE_IRMAO, NOME_PARENTESCO, MAX_ACOES_FAMILIA, type AcaoFamilia, type Familiar } from "../../src/familia";
import { NOME_ACAO_FILHO, type AcaoFilho } from "../../src/namoro";
import { PROFISSOES, NOME_ETAPA, NOME_ACAO_NAMORO, acoesNamoro, chanceMatch, IDADE_MINIMA_APP, MAX_ACOES_NAMORO, type AcaoNamoro, type Par, type Perfil } from "../../src/namoro";
import { MARCA, NOME_CATEGORIA, NOME_CONTRATO, type ContratoPatrocinio, type OfertaPatrocinio, type TipoContrato } from "../../src/marcas";
import { cartazPatrocinio, logoSvg } from "./poster";
import { svgCorpo, tatuagemPescoco, previaTatuagem, type Kit } from "../visual/corpo";
import { anuncioTransferencia, miniNoticia, capaVideogame } from "../visual/cartazes";
import { svgEscudo } from "../visual/escudos";
import { fotoDoPerfil } from "../visual/mulheres";
import { trofeuSvg } from "../casa/iso";
import { armario, biografia, estatisticasEstimadas, totaisDaCarreira, clubesDaCarreira, personalidade, estiloDeJogo, pontos, rotuloFama, rotuloTorcida, rotuloTecnico } from "../../src/perfil-jogador";
import { TRACOS, PAISES } from "../../src/dna";
import { EMPRESAS, INVEST, CUSTO_ASSESSOR, patrimonioInvestido, type TipoEmpresa, type TipoInvest, type AcaoEmpresa } from "../../src/negocios";
import { STAFF, NOME_PARTE, idadeDoCorpo, previsaoAltoNivel, rotuloCorpo, custoEquipe, type Staff, type ParteCorpo } from "../../src/saude";
import { ICONE_ORIGEM, NOME_ORIGEM } from "../../src/agenda";
import { NOME_TOM } from "../../src/conversas";
import { gostosDe, conheceGostos, NOME_GOSTO, LUGARES, NOME_PEDIDO, quimica, pensamentoDela, type Lugar } from "../../src/namoro";
import { NOME_PERFIL, FUNCOES, type FuncaoParca } from "../../src/vida-social";
import { LUXO, MAX_LUXO, HOBBIES, MAX_HOBBIES, CURSOS, NOME_LINGUA, NIVEL_LINGUA, cursosDisponiveis, infoCurso, linguaNativa, DOACAO, NOME_DOACAO, CUSTO_FUNDACAO, type TipoLuxo, type Hobby, type Curso, type Lingua } from "../../src/estilo";
import { POSTS, MAX_POSTS, postsDisponiveis, respostasDaPauta, tituloDaPauta, type TipoPost } from "../../src/midia";
import { valorMercado } from "../../src/mercado";
import { TATUAGENS, TATUAGEM, NOME_AREA, NOME_FISICO, NOME_CASUAL, custoRemocao, visualDe, tatuagemVisivel, type AreaTatuagem, type Fisico, type RoupaCasual } from "../../src/visual";
import { VIDA, ITENS_VIDA, gastosDoMes, imposto, aliquota, fCustoVida, type ItemVida } from "../../src/vida";
import { CAMINHOS, NOME_FASE, caminhosDisponiveis, cidadeDaVarzea, caminhoDe, aceitarConvite, recusarConvite, type Caminho } from "../../src/caminhos";
import { CIDADES_VARZEA, DA_CIDADE } from "../../src/ligas";
import { estrelas as estrelasDoMundo, numeroDe, relacoesDe, rotuloNivel, NOME_ACAO_REL, chanceCamisa, MAX_ACOES_SEMANA, atencao, alternarFavorito, type AcaoRel, type Relacao } from "../../src/relacoes";
import { POSICOES, PODE_JOGAR, semanasParaAprender, afinidade } from "../../src/posicoes";
import { SITUACAO } from "../../src/lances";
import type { LinhaPremio, PremioMundo } from "../../src/premios-mundo";
import { trocasDeTecnicoEm, lesoesDaTemporada } from "../../src/mundo";
import { NOME_ESTILO } from "../../src/tecnicos";
import { infoClube, idClube, idSelecao, mundo, baseDoClube, nivelDaBase, historicoDe, ondeJoga, rankingDaLiga, statsDaLinha, janelaDoMundo, janelasFeitas, agentesLivres, selecaoDaRodada, selecaoDoMes, type Negocio, type Selecionado } from "../../src/mundo";
import { statsAte } from "../../src/estatisticas";
import type { JogadorNPC } from "../../src/liga";
import { ESTRUTURAS } from "../../src/casa";
import { infoLiga } from "../../src/ligas";
import { culturaBase, NOME_CULTURA, TEXTO_CULTURA, type Cultura } from "../../src/identidade";
import { AGENTE_INFO, NOME_PAPEL, NOME_ITEM, negociarItem, pedirAumento, comClausulas, oferecerJogador, aceitar, janelaAberta, mercadoDe, negociar, papelNoClube, pedirParaSair, podeContratarAgente, proximaJanela, recusar, trocarAgente, JANELAS, NOME_DESTINO, ONDE_DESTINO, type Destino, type PropostaSave } from "../../src/transferencias";
const NOME_PAIS: Record<string, string> = { BRA: "Brasil", ARG: "Argentina", URU: "Uruguai", ESP: "Espanha", POR: "Portugal", ENG: "Inglaterra", ITA: "Itália", GER: "Alemanha", FRA: "França", NED: "Holanda", SEN: "Senegal", JPN: "Japão" };
import { AGENTES, type TipoAgente } from "../../src/mercado";
import { svgFoto, APARENCIA_PADRAO, CORES_ROUPA, NOMES_ROUPA, CORES_CABELO, NOMES_CABELO_COR, ROSTOS, CABELOS, OLHOS, NARIZES, BOCAS, BARBAS, ACESSORIOS, PIERCINGS, aparenciaCompat, luminancia, type Aparencia } from "../criacao/avatar";
import { acessoriosAtivos, type Marca } from "../../src/marcas";
import { NOME_PAPEL_VEST, NOME_COMP } from "../../src/vestiario";
import { identidade, estiloIdent, seloSvg, faixaComp, bannerComp } from "../visual/torneios";
import { anelNota, repetir, blocoDelta, cartoesEventos, iconesEfeito, corNota, catEvento } from "./visuais";
import { vestiarioDe, albumDe } from "../../src/clube-vivo";
import { perfilCidade, NOME_CLIMA, inverno } from "../../src/cidades";
import { NOME_RARIDADE, NOME_TIPO_FIG, type Figurinha } from "../../src/figurinhas";
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
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex"], FIM_SEMANA = ["Sáb", "Dom"];

let save: Save | null = ler<Save>(CHAVE_SAVE);
if (save && migrarSave(pacote, save)) gravar(CHAVE_SAVE, save);
// aparência criada no estilo de arte que foi desfeito: volta para o formato do boneco atual
if (save && (save.jogador.aparencia as { v?: number } | undefined)?.v === 2) { save.jogador.aparencia = aparenciaCompat(save.jogador.aparencia); gravar(CHAVE_SAVE, save); }
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
  const [a, b] = cores(id);
  return svgEscudo(idClube(id), a, b, infoClube(pacote, id)?.nome);
}
/** Uniforme do clube (cores e padrão) com a chuteira do patrocinador de material esportivo, se houver. */
function kitDe(s: Save, clubeId = s.carreira.clubeId): Kit {
  const info = infoClube(pacote, clubeId), [a, b] = info.cores;
  const mat = (s.carreira.patrocinios ?? []).map((k) => MARCA[k.marca]).find((m) => m?.categoria === "material");
  const ch = mat?.chuteira ?? (mat ? [mat.cores[0] === "#FFFFFF" ? mat.cores[1] : mat.cores[0], mat.cores[1] === mat.cores[0] ? "#FFFFFF" : mat.cores[1], mat.cores[2]] : undefined);
  return { cor1: a, cor2: b ?? "#FFFFFF", padrao: info.padrao, numero: s.jogador.numero, chuteira: ch ? [ch[0], ch[1]] : undefined, marcaChuteira: mat && ch ? { simbolo: mat.simbolo, cor: ch[2] } : undefined };
}
/** Aparência com os acessórios dos patrocinadores (óculos e fone) por cima. */
function apDe(s: Save, forcar?: Marca): Aparencia {
  const ap: Aparencia = { ...APARENCIA_PADRAO, ...((s.jogador.aparencia as Partial<Aparencia>) ?? {}) };
  const ac = visualDe(s.jogador).semAcessorioPatro && !forcar ? {} : acessoriosAtivos(s.carreira.patrocinios);
  if (forcar?.acessorio) (ac as Record<string, unknown>)[forcar.acessorio.tipo] = forcar.acessorio;
  const o = ac.oculos, f = ac.fone;
  ap.oculosSol = o?.tipo === "oculos" ? { modelo: o.modelo, armacao: o.armacao, lente: o.lente } : null;
  ap.fone = f?.tipo === "fone" ? { cor: f.cor, detalhe: f.detalhe } : null;
  return ap;
}
function relogioDe(s: Save) {
  const r = visualDe(s.jogador).semAcessorioPatro ? undefined : acessoriosAtivos(s.carreira.patrocinios).relogio;
  return r?.tipo === "relogio" ? { pulseira: r.pulseira, mostrador: r.mostrador } : null;
}
function corpoDe(s: Save, traje: "jogo" | "casual", clubeId?: string): string {
  return svgCorpo({ aparencia: s.jogador.aparencia ? apDe(s) : null, visual: visualDe(s.jogador), alturaCm: s.jogador.alturaCm, traje, kit: kitDe(s, clubeId), relogio: relogioDe(s) });
}
function capaDe(s: Save, edicao: number, clube: string, regional: boolean): string {
  return capaVideogame({ edicao, jogador: s.jogador.apelido, numero: s.jogador.numero, cores: infoClube(pacote, clube)?.cores ?? ["#0B7A3B", "#F5C400"], corpoSvg: corpoDe(s, "jogo", clube), ...(regional ? { edicaoDe: NOME_PAIS[s.jogador.pais] ?? "Brasil" } : {}) });
}
function foto(s: Save): string {
  const [a, b] = cores(s.carreira.clubeId);
  const ap = { ...APARENCIA_PADRAO, ...((s.jogador.aparencia as Partial<Aparencia>) ?? {}) };
  return svgFoto({ aparencia: ap, camisa: { cor1: a.toUpperCase() === "#FFFFFF" ? "#F4F4F2" : a, cor2: b ?? "#111111", estilo: "lisa" }, numero: s.jogador.numero, traje: "jogo", pescoco: tatuagemPescoco(visualDe(s.jogador).tatuagens.pescoco) });
}
/** Rosto de um personagem do jogo (rival, companheiro), sorteado pelo nome: sempre o mesmo para o mesmo nome. */
function fotoNpc(nome: string, clubeId: string, idade = 25): string {
  let h = 2166136261; for (const ch of nome) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const pick = <T,>(l: readonly T[], k: number) => l[(h >>> k) % l.length];
  const [a, b] = cores(clubeId);
  const ap: Aparencia = { ...APARENCIA_PADRAO, pele: (h >>> 3) % 8, rosto: pick(["oval", "redondo", "quadrado", "longo", "largo", "diamante"] as const, 5),
    cabelo: pick(["raspado", "curto", "degrade", "topete", "ondulado", "cacheado", "crespo", "blackpower", "trancas", "undercut", "careca", "moicano"] as const, 7),
    corCabelo: (h >>> 11) % 5, olhos: (h >>> 13) % 4, nariz: pick(["reto", "pequeno", "largo", "achatado", "aquilino", "batata"] as const, 9),
    boca: pick(["neutra", "sorriso", "lado", "fina", "cheia"] as const, 15), barba: idade < 21 ? "nenhuma" : pick(["nenhuma", "sombra", "rala", "cavanhaque", "curta", "cheia", "bigode"] as const, 17) };
  return svgFoto({ aparencia: ap, camisa: { cor1: a.toUpperCase() === "#FFFFFF" ? "#F4F4F2" : a, cor2: b ?? "#111111", estilo: "lisa" }, numero: String(((h >>> 19) % 30) + 2), traje: "jogo" });
}
const ICO_GOSTO: Record<string, string> = { praia: "🏖️", balada: "🪩", cinema: "🎬", futebol: "⚽", viagem: "✈️", comida: "🍝", musica: "🎤", natureza: "🥾", moda: "🛍️", games: "🎮" };
const ICO_COMP: Record<string, string> = { parceiro: "🤝", invejoso: "😒", mentor: "🧓", pupilo: "🧒" };
const humor = (rel: number) => (rel >= 70 ? "😄" : rel >= 45 ? "🙂" : rel >= 30 ? "😐" : "😠");
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
  app.innerHTML = save.carreira.encerrada ? telaDespedida(save) : telaSemana(save);
  // sub-abas que rolam: a escolhida fica à vista
  const rol = document.querySelector<HTMLElement>(".sub-abas.rolar"), at = rol?.querySelector<HTMLElement>(".ativo");
  if (rol && at) rol.scrollLeft = Math.max(0, at.offsetLeft - rol.offsetLeft - 16);
}

function telaInicio(): string {
  return `<header class="marca"><strong>Mycarrerinha</strong><span>Carreira</span></header>
    <h1>Sua carreira começa na base, na várzea ou nos EUA.</h1>
    <p class="sub" style="font-size:16px">Crie o jogador, escolha por onde começar e jogue semana a semana: treino, descanso, família, redes, o jogo de domingo e a casa que você vai montando com o salário.</p>
    <a class="botao grande" href="criacao.html">Criar meu jogador</a>
    <button class="botao sec" data-acao="exemplo">Começar com um jogador de exemplo</button>
    <button class="botao sec" data-acao="carregar-save">Carregar um save</button><p id="avisoSave" class="sub aviso-save" role="status"></p>`;
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

/** Id da competição a partir do nome guardado no resumo da partida (copas) ou da liga. */
function compPorNome(nome?: string): string {
  const k = (Object.keys(COPAS) as CopaId[]).find((x) => COPAS[x].nome === nome || COPAS[x].curto === nome);
  return k ?? (save ? infoLiga(save.carreira.ligaId).id : "BRA1");
}
function telaSemana(s: Save): string {
  const c = s.carreira, j = s.jogador, clube = clubeDe(ligaAtual(pacote, s), c.clubeId), jogo = jogoDaSemana(s);
  const nProp = mercadoDe(c).propostas.length, jan = janelaAberta(c);
  const prev = previaPlano(s, plano), escPrev = escalacao(pacote, s, prev.cansaco);
  const pos = ordenar(c.tabela).findIndex((t) => t.clube === c.clubeId) + 1;
  const tagCls = escPrev === "titular" ? "titular" : escPrev === "banco" || escPrev === "base" ? "banco" : escPrev === "semJogo" ? "" : "ruim";
  // quarta-feira: jogo da copa continental
  copasDe(pacote, s);
  const jc = jogoCopaDaSemana(pacote, s), travados = diasTravados(s);
  const prevQ = jc ? previaPlano(s, { ...plano, acoes: plano.acoes.slice(0, 2) }) : undefined, natJ = !!jc && ehDeSelecao(jc.copa.id), meuJ = natJ ? idSelecao(j.nacionalidade) : c.clubeId;
  const escQ = jc ? (natJ ? escalacaoSelecao(pacote, s, prevQ!.cansaco) : escalacao(pacote, s, prevQ!.cansaco, true)) : undefined;
  const copaHtml = jc ? (() => {
    const j0 = jc.jogo, ida = idaDe(jc.copa, j0), cls = escQ === "titular" ? "titular" : escQ === "banco" ? "banco" : "ruim";
    return `<p class="rotulo dia-jogo">${faixaComp(jc.copa.id, natJ ? `Convocado · ${esc(nomeDe(meuJ))} · ${jc.jogo.fase === "eliminatorias" ? "Eliminatórias" : jc.jogo.fase === "amistoso" ? "Amistoso" : esc(COPAS[jc.copa.id].nome)}` : `Quarta · ${esc(COPAS[jc.copa.id].nome)}`)}</p><div class="confronto"><div class="time">${escudo(j0.casa)}<span>${esc(nomeDe(j0.casa))}</span></div><span class="vs">×</span><div class="time dir"><span>${esc(nomeDe(j0.fora))}</span>${escudo(j0.fora)}</div></div>
      <div class="linha-info"><span>${j0.neutro ? "Campo neutro" : j0.casa === meuJ ? "Em casa" : "Fora de casa"}</span><span>${esc(rotuloJogo(j0))}</span>${ida ? `<span>Ida: ${esc(nomeDe(ida.casa))} <b>${ida.gc} × ${ida.gf}</b> ${esc(nomeDe(ida.fora))}</span>` : ""}</div>
      <div><span class="tag ${cls}">Previsão: ${NOME_ESCALACAO[escQ!].toLowerCase()}</span></div>${jogo ? `<p class="rotulo dia-jogo" style="margin-top:10px">${faixaComp(infoLiga(c.ligaId).id, `Domingo · ${esc(infoLiga(c.ligaId).curto)}`)}</p>` : ""}`;
  })() : (() => {
    const m = c.meioSemana;
    if (!m || m.semana !== c.semana) return "";
    const q = m.resumo;
    return `<p class="rotulo dia-jogo">${faixaComp(compPorNome(q.competicao), `Quarta · ${esc(q.competicao ?? "Copa")} · encerrado`)}</p><p style="margin:2px 0 8px;font-size:15px"><b>${esc(q.nomeCasa)} ${q.golsCasa} × ${q.golsFora} ${esc(q.nomeFora)}</b>${q.minutos > 0 ? ` <span class="sub">· nota ${q.nota.toFixed(1)}</span>` : ""}${q.penaltis ? ` <span class="sub">· ${esc(q.penaltis)} nos pênaltis</span>` : ""}</p><p class="rotulo dia-jogo">${faixaComp(infoLiga(c.ligaId).id, `Domingo · ${esc(infoLiga(c.ligaId).curto)}`)}</p>`;
  })();
  const jogoHtml = jogo && !c.mercado?.semClube ? `${copaHtml ? "" : `<p class="rotulo dia-jogo">${faixaComp(c.formacao && !c.fase ? "BASE" : infoLiga(c.ligaId).id, `${esc(infoLiga(c.ligaId).curto)} · rodada ${jogo.rodada + 1}`)}</p>`}<div class="confronto"><div class="time">${escudo(jogo.casa)}<span>${esc(nomeDe(jogo.casa))}</span></div><span class="vs">×</span><div class="time dir"><span>${esc(nomeDe(jogo.fora))}</span>${escudo(jogo.fora)}</div></div>
      <div class="linha-info"><span>${jogo.souCasa ? "Em casa" : "Fora de casa"}</span><span>${esc(infoLiga(c.ligaId).curto)} · rodada <b>${jogo.rodada + 1}</b> de ${nRodadas(c)}</span><span>${esc(clube.nome)} em <b>${pos || "–"}º</b></span></div>`
    : c.mercado?.semClube ? `<p class="sub"><b style="color:var(--ouro)">Sem clube.</b> Você treina por conta própria e não joga. As propostas chegam no Mercado; o agente pode te oferecer aos clubes.</p>`
    : c.semana >= SEMANAS_PRE + nRodadas(c) && c.copas?.MUN?.clubes.includes(c.clubeId) ? (jc ? "" : `<p class="sub">Semana do Mundial de Clubes.</p>`)
    : c.semana < SEMANAS_PRE ? `<p class="sub">Pré-temporada: sem jogo oficial. Semana de treino forte para chegar bem na estreia.</p>` : `<p class="sub">A ${esc(infoLiga(c.ligaId).curto)} já terminou. Semana de treino até o fim do calendário.</p>`;
  const previsao = escPrev === "semJogo" || (!jogo && c.semana >= SEMANAS_PRE) ? "" : `<div><span class="tag ${tagCls}">${escPrev === "base" ? `Jogo da base (${categoriaBase(j.idade)})${reservaNaBase(pacote, s, prev.cansaco) ? " · reserva" : " · titular"}` : `Previsão: ${NOME_ESCALACAO[escPrev].toLowerCase()}`}</span></div>`;
  const focos: [Grupo, string][] = [["fisico", "Físico"], ["tecnico", "Técnico"], ["tatico", "Tático"]];
  const ints: [Intensidade, string][] = [["leve", "Leve"], ["normal", "Normal"], ["alta", "Puxado"]];
  const acoesDisp = (Object.keys(ACOES) as Acao[]).filter((a) => a !== "video" || jogo);
  return `<header class="marca"><strong>Mycarrerinha</strong><span>${esc(rotuloSemana(c))}${c.aposentadoria ? " · última temporada" : ""}</span></header>
  <section class="painel card-jogador" data-acao="perfil" role="button" tabindex="0" aria-label="Abrir o perfil do jogador">
    <div class="jogador"><div class="foto">${foto(s)}</div>
      <div><div class="nome">${esc(j.apelido)}</div><div class="det">${NOME_POS[j.posicao]} · ${j.idade} anos · ${esc(clube.nome)}${c.fase ? ` (${NOME_FASE[c.fase].toLowerCase().replace("eua", "EUA")})` : c.formacao ? " (base)" : ""}</div><div class="det">${esc(j.perfilNome)}</div><div class="det ver-perfil">Ver perfil completo ›</div></div>
      <div class="ovr"><strong>${Math.round(ovr(j))}</strong><span>OVR</span></div></div>
    <div class="barras">${barra("Moral", c.moral, 100, "#74D394")}${barra("Cansaço", c.cansaco, 100, c.cansaco > 60 ? "#EC7D69" : "#E3B341")}${barra("Forma", forma(c), 10, "#6FB7E0", forma(c).toFixed(1))}${barra("Técnico", c.relTecnico, 100, "#B9A3E8")}</div>
    <div class="linha-info"><span>Saldo <b>${dinheiro(s.casa.saldo)}</b></span><span>Salário <b>${dinheiro(c.salario)}</b>/mês</span><span>Fama <b>${Math.round(c.fama)}</b></span><span><b>${compacto(c.seguidores)}</b> seguidores</span>${c.lesao ? `<span style="color:var(--neg)">Lesionado: <b>${c.lesao}</b> sem.</span>` : ""}</div>
  </section>

  <section class="painel jogo-card"><p class="rotulo">Esta semana</p>${copaHtml}${jogoHtml}${previsao}</section>
  ${cardAnuncio(s)}
  ${cardPatrocinio(s)}
  ${cardEvento(s)}
  ${cardAgenda(s)}
  ${cardNumero(s)}
  ${cardConvites(s)}
  ${cardSugestao(s)}
  ${cardCraque(s)}
  ${(() => { const n = negociosDe(s.carreira), m = midiaDe(s); return (n.proposta ? `<button class="painel aviso-mercado" data-aba="jogador" data-ir="negocios"><span>💼</span><span><b>Proposta de negócio: ${esc(n.proposta.titulo)}</b><small>Responda em Jogador › Negócios.</small></span></button>` : "") + (m.pauta ? `<button class="painel aviso-mercado" data-aba="amigos" data-ir="redes"><span>🎤</span><span><b>Pedido de entrevista</b><small>${esc(tituloDaPauta(m.pauta))}. Responda no Celular › Redes.</small></span></button>` : ""); })()}
  ${nProp ? `<button class="painel aviso-mercado" data-aba="mercado"><span>📩</span><span><b>${nProp} ${nProp === 1 ? "proposta" : "propostas"} na mesa</b><small>${jan ? `Janela aberta até a semana ${jan.fim + 1}` : "Responda antes que expire"}. Ver no Mercado.</small></span></button>` : ""}

  <section class="painel grupo-plano" aria-label="Plano da semana">
    <p class="rotulo">Treino do clube</p>
    <div class="chips" style="flex-wrap:wrap">${focos.map(([k, n]) => `<button class="chip${plano.foco === k ? " ativo" : ""}" data-foco="${k}">${n}</button>`).join("")}<span style="width:8px"></span>${ints.map(([k, n]) => `<button class="chip${plano.intensidade === k ? " ativo" : ""}" data-int="${k}">${n}</button>`).join("")}</div>
    ${blocoTreinoPosicao(s)}
    <p class="rotulo" style="margin-top:6px">Seu tempo livre</p>
    <div class="grade-semana" role="grid" aria-label="Tempo livre de segunda a domingo">
      <span></span>${DIAS.map((d, i) => `<span class="cab${travados.includes(i) ? " jogo" : ""}">${d}${travados.includes(i) ? "<small>jogo</small>" : i === 4 && jogo ? "<small>vésp.</small>" : ""}</span>`).join("")}${FIM_SEMANA.map((d, i) => `<span class="cab trav">${d}<small>${jogo ? (i ? "jogo" : "conc.") : "folga"}</small></span>`).join("")}
      ${acoesDisp.map((a) => `<span class="acao">${ACOES[a].nome}<small>${esc(ACOES[a].efeito)}</small></span>${DIAS.map((d, i) => travados.includes(i) || (c.meioSemana?.semana === c.semana && i < 2) ? `<span class="cel travado" aria-hidden="true"></span>` : `<button class="cel${plano.acoes[i] === a ? " ativo" : ""}" data-dia="${i}" data-a="${a}" aria-label="${d}: ${ACOES[a].nome}" aria-pressed="${plano.acoes[i] === a}"></button>`).join("")}${FIM_SEMANA.map(() => `<span class="cel travado" aria-hidden="true"></span>`).join("")}`).join("")}
    </div>
    ${travados.length ? `<p class="sub" style="margin-top:6px">Quarta é dia de jogo ${(() => { const k = COPAS[jc?.copa.id ?? copaDoClube(s.carreira.copas, s.carreira.clubeId)!.id]; return `${k.prep === "do" ? "pelo" : "pela"} ${esc(k.curto)}`; })()}: só sobram quatro dias livres. O cansaço da quarta chega no domingo.</p>` : ""}
    <div class="previa"><span>Cansaço no jogo <b>${prev.cansaco}</b></span><span>Moral <b>${prev.moral}</b></span><span>Evolução <b>${sinal(prev.evolucao)}%</b></span>${prev.notaExtra ? `<span>Nota <b>+${prev.notaExtra.toFixed(2)}</b></span>` : ""}</div>
  </section>
  <button class="botao grande fixo-jogar" data-acao="jogar">${jc && escQ !== "lesionado" ? "Ir para o jogo de quarta" : jogo && escPrev !== "lesionado" ? "Ir para o jogo" : "Fechar a semana"}</button>

  <div class="abas" role="tablist">${[["tabela", "Tabela"], ["jogador", "Jogador"], ["mercado", nProp ? `Mercado (${nProp})` : "Mercado"], ["amigos", "Celular"], ["noticias", "Notícias"], ["casa", agendaDe(s.carreira).pendentes.length ? `Vida (${agendaDe(s.carreira).pendentes.length})` : "Vida"]].map(([k, n]) => `<button class="${aba === k ? "ativo" : ""}" data-aba="${k}" role="tab" aria-selected="${aba === k}">${n}</button>`).join("")}</div>
  <section class="painel">${aba === "tabela" ? abaTabela(s) : aba === "jogador" ? abaJogador(s) : aba === "noticias" ? abaNoticias(s) : aba === "mercado" ? abaMercado(s) : aba === "amigos" ? abaCelular(s) : abaVida(s)}</section>
  <details class="painel teste"><summary>Opções</summary><p class="sub" style="margin:8px 0">O jogo salva sozinho neste navegador. Para não perder a carreira (trocar de aparelho, limpar o navegador), baixe o save de vez em quando.</p><div class="ferr-botoes"><button class="botao peq" data-acao="baixar-save">Baixar save</button><button class="botao sec peq" data-acao="carregar-save">Carregar save</button></div><p id="avisoSave" class="sub aviso-save" role="status"></p><div class="ferr-botoes"><button class="botao sec peq" data-acao="pular">Simular até a próxima janela</button><button class="botao sec peq" data-acao="recomecar">Apagar carreira e recomeçar</button></div><p class="sub" style="margin-top:6px">Simular joga as semanas no automático (decisões e plano padrão) até abrir a próxima janela de transferências com você já profissional (no máximo 60 semanas). As propostas ficam para você decidir.</p></details>`;
}

let vistaTabela: "liga" | "base" | CopaId = "liga", tabelaEscolhida = false, verOutras = false;
let subTabela: "classificacao" | "estatisticas" | "premios" = "classificacao";
const FASES_MM = ["derby", "desafio", "playoff", "oitavas", "quartas", "semi", "final"];
function tabelaCopaHtml(t: LinhaTabela[], meu: string, zona?: (i: number) => string) {
  return `<table><thead><tr><th>#</th><th>Clube</th><th class="n">P</th><th class="n">J</th><th class="n">SG</th></tr></thead><tbody>${ordenar(t).map((x, i) => `<tr class="${x.clube === meu ? "meu" : ""} ${zona ? zona(i) : ""}"><td>${i + 1}</td><td>${esc(nomeDe(x.clube))}</td><td class="n">${x.pts}</td><td class="n">${x.j}</td><td class="n">${x.gp - x.gc}</td></tr>`).join("")}</tbody></table>`;
}
function abaCopa(s: Save, id: CopaId): string {
  const e = copasDe(pacote, s)[id], c = s.carreira;
  if (!e) return `<p class="sub">Sem copa nesta temporada.</p>`;
  const nat = ehDeSelecao(id), meu = nat ? idSelecao(s.jogador.nacionalidade) : c.clubeId, estou = e.clubes.includes(meu);
  const placar = (j: JogoCopa) => j.gc === undefined ? `<span class="sub">sem. ${j.semana + 1}</span>` : `<b>${j.gc} × ${j.gf}</b>${j.penaltis ? ` <small class="sub">(pên. ${esc(nomeDe(j.penaltis))})</small>` : ""}`;
  const linhaJogo = (j: JogoCopa) => `<div class="jogo-copa${j.casa === meu || j.fora === meu ? " meu" : ""}"><span>${esc(nomeDe(j.casa))}</span>${placar(j)}<span>${esc(nomeDe(j.fora))}</span></div>`;
  const meus = e.jogos.filter((j) => j.casa === meu || j.fora === meu);
  const prox = meus.filter((j) => j.gc === undefined).slice(0, 3);
  const status = e.campeao ? `Campeão: <b>${esc(nomeDe(e.campeao))}</b>` : `Agora: ${esc(NOME_FASE_COPA[e.fase] ?? e.fase)}`;
  let tabelas = "";
  if (id === "UCL" && e.tabelas.Liga) tabelas = `<p class="sub" style="margin:10px 0 4px">1º–8º direto às oitavas · 9º–24º playoff · 25º–36º eliminados</p>${tabelaCopaHtml(e.tabelas.Liga, meu, (i) => i < 8 ? "z-dir" : i < 24 ? "z-play" : "z-fora")}`;
  else {
    const nomes = Object.keys(e.tabelas), meuG = nomes.find((k) => e.tabelas[k].some((x) => x.clube === meu));
    const ordem = meuG ? [meuG, ...nomes.filter((k) => k !== meuG)] : nomes;
    const zona = id === "LIB" || id === "MUN" || id === "COP" || ["EUR", "AME", "AFR", "ASI"].includes(id) ? (i: number) => (i < 2 ? "z-dir" : "") : COPAS[id].uf ? (i: number) => (i < 4 ? "z-dir" : "z-fora") : (i: number) => (i < 8 ? "z-dir" : "z-fora");
    tabelas = ordem.map((k, i) => { const h = `<p class="rotulo" style="margin:12px 0 4px">${id === "LIB" || id === "MUN" || id === "COP" || ["EUR", "AME", "AFR", "ASI"].includes(id) ? `Grupo ${k}` : COPAS[id].uf ? "Primeira fase · os 4 primeiros vão à semifinal" : k}</p>${tabelaCopaHtml(e.tabelas[k], meu, zona)}`; return i === 0 ? h : `<details><summary class="sub">${id === "LIB" || id === "MUN" || id === "COP" || ["EUR", "AME", "AFR", "ASI"].includes(id) ? `Grupo ${k}` : k}</summary>${h}</details>`; }).join("");
  }
  const mm = FASES_MM.filter((f) => e.jogos.some((j) => j.fase === f)).reverse().map((f) => {
    const series = [...new Set(e.jogos.filter((j) => j.fase === f).map((j) => j.serie!))];
    return `<p class="rotulo" style="margin:12px 0 4px">${esc(NOME_FASE_COPA[f])}</p>${series.map((sr) => {
      const js = e.jogos.filter((j) => j.serie === sr), v = vencedorSerie(e, sr);
      if (js.length === 1) return `<div class="serie${v ? "" : " aberta"}">${linhaJogo(js[0])}</div>`;
      const [a, b] = [js[1].casa, js[1].fora], agg = js.every((j) => j.gc !== undefined) ? [js[0].gf! + js[1].gc!, js[0].gc! + js[1].gf!] : undefined;
      return `<div class="serie${a === meu || b === meu ? " meu" : ""}"><div class="jogo-copa"><span class="${v === a ? "venc" : ""}">${esc(nomeDe(a))}</span>${agg ? `<b>${agg[0]} × ${agg[1]}</b>` : `<span class="sub">ida e volta</span>`}<span class="${v === b ? "venc" : ""}">${esc(nomeDe(b))}</span></div><small class="sub">${js.map((j) => `${esc(nomeDe(j.casa))} ${j.gc ?? "–"}×${j.gf ?? "–"}`).join(" · ")}${js[1].penaltis ? ` · pênaltis: ${esc(nomeDe(js[1].penaltis))}` : ""}</small></div>`;
    }).join("")}`;
  }).join("");
  const sl = c.selecao, selInfo = nat && sl ? `<div class="grade-n" style="display:flex;gap:14px;margin:6px 0 10px"><span><b>${sl.convocacoes}</b> <small class="sub">convocações</small></span><span><b>${sl.jogos}</b> <small class="sub">jogos</small></span><span><b>${sl.gols}</b> <small class="sub">gols</small></span><span><b>${sl.assist}</b> <small class="sub">assist.</small></span></div>${sl.copas.length ? `<p class="sub">Torneios: ${sl.copas.map((x) => `${esc(COPAS[x.id ?? "COP"].curto)} ${x.ano} · ${esc(x.fase)} (${x.jogos} j, ${x.gols} g)`).join(" · ")}</p>` : ""}` : "";
  const wrap = (html: string) => `<div class="comp-wrap" style="${estiloIdent(identidade(id))}">${html}</div>`;
  if (id === "SEL") return wrap(`${bannerComp(id, esc(nomeDe(meu)), e.jogos[0]?.fase === "eliminatorias" ? "Eliminatórias" : "Amistosos")}`) + `<p class="rotulo" style="margin-bottom:2px">${esc(nomeDe(meu))} · ${e.jogos[0]?.fase === "eliminatorias" ? "Eliminatórias" : "Amistosos"}</p><p class="sub" style="margin-bottom:6px">Três datas FIFA na temporada. A convocação sai na semana de cada jogo: nível, fase e fama contra os outros ${esc(NOME_POS[s.jogador.posicao] ?? "Goleiro")}s do país.</p>${selInfo}${e.jogos.map((j) => linhaJogo(j) + (j.gc === undefined ? "" : `<small class="sub">${sl?.conv[`${c.temporada}-${j.semana}`] ? "convocado" : "fora da lista"}</small>`)).join("")}`;
  return wrap(`${bannerComp(id, esc(COPAS[id].nome), `${esc(COPAS[id].regiao)} · ${ANO_INICIAL + c.temporada}`)}${selInfo}<p class="sub" style="margin-bottom:8px">${status}${estou && nat ? ` · ${esc(nomeDe(meu))}: ${esc(NOME_FASE_COPA[e.chegou[meu]] ?? "na disputa")}` : nat ? " · sua seleção não se classificou" : estou ? ` · ${esc(clubeDe(ligaAtual(pacote, s), meu).nome)}: ${esc(NOME_FASE_COPA[e.chegou[meu]] ?? "na disputa")}` : " · seu clube não está nesta copa"}</p>
    ${prox.length ? `<p class="rotulo" style="margin:6px 0 4px">Seus próximos jogos</p>${prox.map((j) => `<div class="jogo-copa meu"><span>${esc(nomeDe(j.casa))}</span><span class="sub">sem. ${j.semana + 1} · ${esc(rotuloJogo(j))}</span><span>${esc(nomeDe(j.fora))}</span></div>`).join("")}` : ""}
    ${mm}${tabelas}`);
}
let vistaSelecao: "rodada" | "mes" = "rodada";
/** Seleção da última rodada (ou do último mês) da liga, num 4-3-3; o jogador entra com a nota dele. */
function selecaoHtml(s: Save): string {
  const c = s.carreira;
  if (c.fase) return "";
  const feitas = c.semana - SEMANAS_PRE;
  if (feitas < 1) return "";
  const lid = infoLiga(c.ligaId).id, eu = (r: number): Selecionado[] => { const x = c.notasRodada?.[r]; return x ? [{ nome: s.jogador.apelido, clubeId: c.clubeId, posicao: s.jogador.posicao, nota: x.nota, gols: x.gols, assist: x.assist, eu: true }] : []; };
  const mesFim = Math.floor(feitas / 4) * 4 - 1, temMes = mesFim >= 3;
  const modo = vistaSelecao === "mes" && temMes ? "mes" : "rodada";
  const rs = modo === "mes" ? [mesFim - 3, mesFim - 2, mesFim - 1, mesFim] : [feitas - 1];
  const sel = modo === "mes" ? selecaoDoMes(pacote, lid, rs, rs.flatMap(eu)) : selecaoDaRodada(pacote, lid, rs[0], eu(rs[0]));
  if (sel.length < 11) return "";
  const de = (p: string) => sel.filter((x) => x.posicao === p);
  const cart = (x: Selecionado) => `<div class="sel-j${x.eu ? " eu" : ""}">${escudo(x.clubeId)}${x.eu ? `<b>${esc(x.nome)}</b>` : `<button class="nome-hist" data-hist="${esc(x.nome)}">${esc(nomeCurtoSel(x.nome))}</button>`}<small>${x.nota.toFixed(1).replace(".", ",")}${x.gols ? ` · ${x.gols}g` : ""}${x.assist ? ` · ${x.assist}a` : ""}</small></div>`;
  const linhas = [[...de("PON").slice(0, 1), ...de("ATA"), ...de("PON").slice(1)], [...de("MEI").slice(0, 1), ...de("VOL"), ...de("MEI").slice(1)], [...de("LAT").slice(0, 1), ...de("ZAG"), ...de("LAT").slice(1)], de("GOL")];
  return `<p class="rotulo" style="margin:16px 0 6px">Seleção ${modo === "mes" ? `do mês · rodadas ${rs[0] + 1} a ${rs[3] + 1}` : `da ${rs[0] + 1}ª rodada`}</p>
    <div class="chips" style="margin-bottom:8px"><button class="chip${modo === "rodada" ? " ativo" : ""}" data-vsel="rodada">Rodada</button>${temMes ? `<button class="chip${modo === "mes" ? " ativo" : ""}" data-vsel="mes">Mês</button>` : ""}</div>
    <div class="campinho">${linhas.map((l) => `<div class="sel-linha">${l.map(cart).join("")}</div>`).join("")}</div>`;
}
/** Prêmios da liga na temporada passada: craque, artilheiro, garçom, revelação e a seleção do campeonato. */
function premiosLigaHtml(s: Save): string {
  const p = s.carreira.premiosLiga;
  if (!p || !p.selecao.length) return "";
  const quem = (x?: Selecionado) => x ? `${x.eu ? `<b style="color:var(--ouro)">${esc(s.jogador.apelido)}</b>` : `<button class="nome-hist" data-hist="${esc(x.nome)}">${esc(x.nome)}</button>`} <small class="sub">${esc(nomeDe(x.clubeId))}</small>` : "–";
  const linha = (rot: string, x: Selecionado | undefined, extra: string) => `<div class="premio-l"><span class="rotulo">${rot}</span><span>${quem(x)}</span><b>${extra}</b></div>`;
  const de = (k: string) => p.selecao.filter((x) => x.posicao === k);
  const cart = (x: Selecionado) => `<div class="sel-j${x.eu ? " eu" : ""}">${escudo(x.clubeId)}${x.eu ? `<b>${esc(s.jogador.apelido)}</b>` : `<button class="nome-hist" data-hist="${esc(x.nome)}">${esc(nomeCurtoSel(x.nome))}</button>`}<small>${x.nota.toFixed(2).replace(".", ",")}</small></div>`;
  const linhas = [[...de("PON").slice(0, 1), ...de("ATA"), ...de("PON").slice(1)], [...de("MEI").slice(0, 1), ...de("VOL"), ...de("MEI").slice(1)], [...de("LAT").slice(0, 1), ...de("ZAG"), ...de("LAT").slice(1)], de("GOL")];
  return `<p class="rotulo" style="margin:16px 0 6px">Prêmios ${esc(infoLiga(p.ligaId).curto)} ${p.ano}</p>
    ${linha("Craque", p.craque, p.craque ? `nota ${p.craque.nota.toFixed(2).replace(".", ",")}` : "")}
    ${linha("Artilheiro", p.artilheiro, `${p.artilheiro?.gols ?? 0} gols`)}
    ${linha("Garçom", p.garcom, `${p.garcom?.assist ?? 0} assist.`)}
    ${p.revelacao ? linha("Revelação", p.revelacao, `${p.revelacao.idade} anos`) : ""}
    <p class="sub" style="margin:10px 0 6px">Seleção do campeonato</p>
    <div class="campinho">${linhas.map((l) => `<div class="sel-linha">${l.map(cart).join("")}</div>`).join("")}</div>`;
}
/** Prêmios do mundo da temporada passada: Bola de Ouro (top 10), The Best, Melhor da Europa, Rei da América... e a galeria. */
function premiosMundoHtml(s: Save): string {
  const p = s.carreira.premiosMundo;
  if (!p) return "";
  const quem = (x: LinhaPremio) => `${x.eu ? `<b style="color:var(--ouro)">${esc(s.jogador.apelido)}</b>` : `<button class="nome-hist" data-hist="${esc(x.nome)}">${esc(x.nome)}</button>`} <small class="sub">${esc(nomeDe(x.clubeId))}</small>`;
  const bola = p.premios.find((x) => x.id === "BOLA"), outros = p.premios.filter((x) => x.id !== "BOLA");
  const extra = (pr: PremioMundo, x: LinhaPremio) => pr.id === "CHUTEIRA" ? `${x.gols} gols` : pr.id === "YASHIN" ? `nota ${x.nota.toFixed(2).replace(".", ",")}` : `${x.gols} g · ${x.nota.toFixed(2).replace(".", ",")}`;
  const meu = bola?.ranking.findIndex((x) => x.eu) ?? -1;
  const gal = s.carreira.galeriaPremios?.BOLA ?? [];
  const de = (k: string) => p.selecao.filter((x) => x.posicao === k);
  const cart = (x: LinhaPremio) => `<div class="sel-j${x.eu ? " eu" : ""}">${escudo(x.clubeId)}${x.eu ? `<b>${esc(s.jogador.apelido)}</b>` : `<button class="nome-hist" data-hist="${esc(x.nome)}">${esc(nomeCurtoSel(x.nome))}</button>`}</div>`;
  const linhas = [[...de("PON").slice(0, 1), ...de("ATA"), ...de("PON").slice(1)], [...de("MEI").slice(0, 1), ...de("VOL"), ...de("MEI").slice(1)], [...de("LAT").slice(0, 1), ...de("ZAG"), ...de("LAT").slice(1)], de("GOL")];
  return `<p class="rotulo" style="margin:16px 0 6px">Prêmios do mundo ${p.ano}</p>
    ${bola ? `<p class="sub" style="margin-bottom:4px">Bola de Ouro${meu >= 0 ? ` · você ficou em <b>${meu + 1}º</b>` : ""}</p>${bola.ranking.map((x, i) => `<div class="premio-l${i === 0 ? " ouro" : ""}"><span class="rotulo">${i + 1}º</span><span>${quem(x)}</span><b>${extra(bola, x)}</b></div>`).join("")}` : ""}
    <p class="sub" style="margin:10px 0 4px">Os outros prêmios <small>(cada um com os seus votantes)</small></p>
    ${outros.map((pr) => `<div class="premio-l largo"><span class="rotulo">${esc(pr.nome)}</span><span>${quem(pr.ranking[0])}</span><b>${extra(pr, pr.ranking[0])}</b></div>`).join("")}
    ${p.selecao.length ? `<p class="sub" style="margin:10px 0 6px">Seleção FIFA do Ano <small>(os 11 do mundo, votados pelos jogadores)</small></p><div class="campinho">${linhas.map((l) => `<div class="sel-linha">${l.map(cart).join("")}</div>`).join("")}</div>` : ""}
    ${gal.length > 1 ? `<details style="margin-top:8px"><summary class="sub">Galeria da Bola de Ouro</summary>${[...gal].reverse().map((g) => `<div class="premio-l"><span class="rotulo">${g.ano}</span><span>${g.eu ? `<b style="color:var(--ouro)">${esc(s.jogador.apelido)}</b>` : esc(g.nome)} <small class="sub">${esc(nomeDe(g.clubeId))}</small></span><b></b></div>`).join("")}</details>` : ""}`;
}
const nomeCurtoSel = (n: string) => { const p = n.split(" "); return p.length > 2 ? `${p[0]} ${p[p.length - 1]}` : n; };
/** Artilharia e assistências da liga até a rodada atual (os outros imaginados; você com os seus números de verdade). */
function rankingsHtml(s: Save): string {
  const c = s.carreira;
  if (c.fase || c.semana <= SEMANAS_PRE) return "";
  const feitas = c.semana - SEMANAS_PRE, lid = infoLiga(c.ligaId).id;
  const lista = (tipo: "g" | "a", rot: string) => {
    const meu = tipo === "g" ? c.stats.gols : c.stats.assist; // conta os gols no profissional mesmo para quem ainda é da base
    const l = rankingDaLiga(pacote, lid, feitas, tipo, 10).map((x) => ({ ...x, eu: false }));
    if (meu > 0) l.push({ nome: s.jogador.apelido, clubeId: c.clubeId, valor: meu, jogos: c.stats.jogos, eu: true });
    const top = l.sort((a, b) => b.valor - a.valor || Number(b.eu) - Number(a.eu)).slice(0, 10);
    if (!top.length) return "";
    return `<p class="rotulo" style="margin:14px 0 6px">${rot}</p><table><tbody>${top.map((x, i) => `<tr class="${x.eu ? "meu" : ""}"><td>${i + 1}</td><td>${x.eu ? `<b>${esc(x.nome)}</b>` : `<button class="nome-hist" data-hist="${esc(x.nome)}">${esc(x.nome)}</button>`}<br><small class="sub">${esc(nomeDe(x.clubeId))} · ${x.jogos} j</small></td><td class="n"><b>${x.valor}</b></td></tr>`).join("")}</tbody></table>`;
  };
  return lista("g", "Artilharia") + lista("a", "Assistências");
}
function abaTabela(s: Save): string {
  const t = ordenar(s.carreira.tabela), c = s.carreira;
  // na base: a tabela da categoria do jogador vem primeiro (a do profissional fica num chip)
  const naBase = c.formacao && !c.fase;
  if (!naBase && vistaTabela === "base") vistaTabela = "liga";
  // quem é da base mas já joga no profissional começa vendo a tabela de cima
  if (naBase && !tabelaEscolhida && vistaTabela === "liga" && !c.stats.jogos) vistaTabela = "base";
  // liga, as copas continentais e o estadual do clube (ou do estado dele)
  const uf = ufDoClube(s.carreira.clubeId, mundo(pacote).info[s.carreira.clubeId]?.cidade ?? "");
  const vistas: [typeof vistaTabela, string][] = [...(naBase ? [["base", `Base ${categoriaBase(s.jogador.idade)}`] as [typeof vistaTabela, string]] : []), ["liga", naBase ? `${infoLiga(s.carreira.ligaId).curto} (profissional)` : infoLiga(s.carreira.ligaId).curto], ...(Object.keys(COPAS) as CopaId[]).filter((k) => k === "INT" || k === "MUN" || ehDeSelecao(k) ? !!s.carreira.copas?.[k] : !COPAS[k].uf || COPAS[k].uf === uf).map((k) => [k, COPAS[k].curto] as [CopaId, string])];
  // primeiro as competições em que você está (clube ou seleção); as outras ficam atrás de "Outras"
  const nat = idSelecao(s.jogador.nacionalidade);
  const minha = (k: typeof vistaTabela) => k === "liga" || k === "base" || !!s.carreira.copas?.[k as CopaId]?.clubes.includes(ehDeSelecao(k as CopaId) ? nat : c.clubeId);
  const minhas = vistas.filter(([k]) => minha(k) || k === vistaTabela), outras = vistas.filter(([k]) => !minha(k) && k !== vistaTabela);
  const chip = ([k, n]: [typeof vistaTabela, string]) => `<button class="chip${vistaTabela === k ? " ativo" : ""}" data-vtab="${k}">${esc(n)}</button>`;
  const chips = s.carreira.fase ? "" : `<div class="chips" style="flex-wrap:wrap;margin-bottom:10px">${minhas.map(chip).join("")}${outras.length ? `<button class="chip outras" data-outras="1" aria-expanded="${verOutras}">${verOutras ? "Menos ▴" : `Outras (${outras.length}) ▾`}</button>` : ""}${verOutras ? outras.map(chip).join("") : ""}</div>`;
  const subT = `<div class="sub-abas">${([["classificacao", "Classificação"], ["estatisticas", "Estatísticas"], ["premios", "Prêmios"]] as const).map(([k, n]) => `<button class="${subTabela === k ? "ativo" : ""}" data-subtab="${k}">${n}</button>`).join("")}</div>`;
  if ((vistaTabela === "liga" || vistaTabela === "base") && subTabela === "estatisticas") return chips + subT + (selecaoHtml(s) + rankingsHtml(s) || `<p class="sub">As estatísticas aparecem depois da primeira rodada.</p>`);
  if ((vistaTabela === "liga" || vistaTabela === "base") && subTabela === "premios") return chips + subT + (premiosLigaHtml(s) + premiosMundoHtml(s) || `<p class="sub">Os prêmios saem no fim da primeira temporada.</p>`);
  if (vistaTabela === "base") {
    const tb = c.tabelaBase && c.tabelaBase.t === c.temporada && c.tabelaBase.cat === categoriaBase(s.jogador.idade) ? ordenar(c.tabelaBase.tabela) : ordenar(novaTabelaDe(c));
    return `${chips}${subT}<div class="comp-wrap" style="${estiloIdent(identidade("BASE"))}">${bannerComp("BASE", `${esc(infoLiga(c.ligaId).curto)} ${categoriaBase(s.jogador.idade)}`, "Os times da base, mesmos confrontos")}<table><thead><tr><th>#</th><th>Clube</th><th class="n">P</th><th class="n">J</th><th class="n">SG</th></tr></thead><tbody>${tb.map((x, i) => `<tr class="${x.clube === c.clubeId ? "meu" : ""}"><td>${i + 1}</td><td>${esc(nomeDe(x.clube))} ${categoriaBase(s.jogador.idade)}</td><td class="n">${x.pts}</td><td class="n">${x.j}</td><td class="n">${x.gp - x.gc}</td></tr>`).join("")}</tbody></table></div>`;
  }
  if (vistaTabela !== "liga" && !s.carreira.fase) return chips + abaCopa(s, vistaTabela);
  const lid = infoLiga(s.carreira.ligaId).id, feitas = Math.max(0, Math.min(nRodadas(c), c.semana - SEMANAS_PRE));
  return `${chips}${subT}<div class="comp-wrap" style="${estiloIdent(identidade(lid))}">${bannerComp(lid, esc(infoLiga(s.carreira.ligaId).nome), `${ANO_INICIAL + c.temporada} · ${feitas ? `${feitas} de ${nRodadas(c)} rodadas` : "antes da 1ª rodada"}`)}<table><thead><tr><th>#</th><th>Clube</th><th class="n">P</th><th class="n">J</th><th class="n">SG</th><th class="forma-th">Forma</th></tr></thead><tbody>${t.map((x, i) => `<tr class="${x.clube === s.carreira.clubeId ? "meu" : ""}"><td>${i + 1}</td><td>${esc(nomeDe(x.clube))}</td><td class="n">${x.pts}</td><td class="n">${x.j}</td><td class="n">${x.gp - x.gc}</td><td>${bolinhasForma(x.f)}</td></tr>`).join("")}</tbody></table></div>${calendarioHtml(s)}`;
}

/** Os últimos 5 resultados em bolinhas (verde, cinza, vermelho). */
const bolinhasForma = (f?: string) => `<span class="forma">${(f ?? "").padStart(5, "·").split("").map((r) => `<i class="f-${r === "V" ? "v" : r === "E" ? "e" : r === "D" ? "d" : "x"}" title="${r === "V" ? "Vitória" : r === "E" ? "Empate" : r === "D" ? "Derrota" : ""}"></i>`).join("")}</span>`;
/** Calendário da temporada do clube: uma casinha por rodada, com resultado (passado) ou adversário (futuro). */
function calendarioHtml(s: Save): string {
  const c = s.carreira;
  if (c.fase || c.formacao || c.mercado?.semClube) return "";
  const n = nRodadas(c), atual = c.semana - SEMANAS_PRE, pl = c.placaresRodada ?? {};
  const cel: string[] = [];
  for (let r = 0; r < n; r++) {
    const g = jogosDaRodada(c, r).find((x) => x.casa === c.clubeId || x.fora === c.clubeId);
    if (!g) { cel.push(`<div class="cal-r folga"><small>${r + 1}</small><b>—</b></div>`); continue; }
    const casa = g.casa === c.clubeId, adv = casa ? g.fora : g.casa, info = infoClube(pacote, adv), p = pl[r], cl = ehClassico(pacote, c.clubeId, adv);
    const res = p ? (p[0] > p[1] ? "v" : p[0] === p[1] ? "e" : "d") : r < atual ? "x" : "";
    const [k1, k2] = info?.cores ?? ["#555", "#FFF"];
    cel.push(`<div class="cal-r ${res}${r === atual ? " agora" : ""}${cl ? " classico" : ""}" title="Rodada ${r + 1} · ${casa ? "em casa" : "fora"} contra ${esc(info?.nome ?? "")}${p ? ` · ${p[0]}×${p[1]}` : ""}"><small>${r + 1}${cl ? " 🔥" : ""}</small>
      <span class="cal-esc" style="background:linear-gradient(135deg,${k1} 55%,${k2} 55%)"></span><b>${p ? `${p[0]}-${p[1]}` : esc((info?.nome ?? "").replace(/^(CR|SE|SC|EC|FC|CA)\s+/i, "").slice(0, 3).toUpperCase())}</b><i>${casa ? "🏠" : "✈️"}</i></div>`);
  }
  const v = Object.values(pl).filter(([a, b]) => a > b).length, e = Object.values(pl).filter(([a, b]) => a === b).length, d = Object.values(pl).filter(([a, b]) => a < b).length;
  return `<p class="rotulo" style="margin-top:16px">Sua temporada <small>${v}V ${e}E ${d}D</small></p><div class="calendario">${cel.join("")}</div>`;
}
/** Tabela zerada (antes da primeira rodada da base). */
const novaTabelaDe = (c: Save["carreira"]) => c.tabela.map((x) => ({ ...x, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0 }));
let msgEvento: { titulo: string; texto: string } | undefined;
let msgVisual: { texto: string; ok: boolean } | undefined, areaTat: AreaTatuagem = "antebracoD", trajeVisto: "jogo" | "casual" = "jogo";
const CHAVE_ANUNCIO = "mycarrerinha:anuncio";
function anuncioDe(s: Save, n: Noticia): string {
  const img = n.img as Extract<ImgNoticia, { k: "transferencia" }>, info = infoClube(pacote, img.clube);
  return anuncioTransferencia({ id: info.id, clube: info.nome, apelidoClube: info.nome, cores: info.cores, liga: infoLiga(info.ligaId).nome, jogador: s.jogador.apelido, numero: s.jogador.numero, tipo: img.tipo as "transferencia", ate: img.ate, taxa: img.taxa, corpoSvg: corpoDe(s, "jogo", img.clube) });
}
function cardAnuncio(s: Save): string {
  const n = s.noticias.find((x) => x.img?.k === "transferencia");
  if (!n) return "";
  const chave = `${s.semente}|${n.semana}|${n.titulo}`;
  if (ler<string>(CHAVE_ANUNCIO) === chave) return "";
  return `<section class="painel anuncio-card"><p class="rotulo">Anúncio oficial</p><div class="anuncio-grande">${anuncioDe(s, n)}</div><button class="botao sec peq" data-acao="fechar-anuncio" data-chave="${esc(chave)}">Fechar</button></section>`;
}
function blocoVisual(s: Save): string {
  const v = visualDe(s.jogador), aviso = msgVisual ? `<p class="msg-mercado ${msgVisual.ok ? "ok" : "nao"}">${esc(msgVisual.texto)}</p>` : "";
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
    <p class="sub" style="margin:12px 0 6px;font-weight:600">Munhequeira (em campo)</p>${chips("munhequeira", [["nenhuma", "Sem"], ["uma", "Um pulso"], ["duas", "Os dois"]], v.munhequeira ?? "nenhuma")}
    ${(v.munhequeira ?? "nenhuma") !== "nenhuma" ? `<div class="cores-roupa"><button class="cor${(v.corMunhequeira ?? -1) < 0 ? " ativo" : ""}" style="--c:linear-gradient(135deg,${cores(s.carreira.clubeId)[0]} 50%,${cores(s.carreira.clubeId)[1] ?? "#fff"} 50%)" data-vis="corMunhequeira" data-val="-1" aria-label="Cor do clube"></button>${CORES_ROUPA.map((c, i) => `<button class="cor${v.corMunhequeira === i ? " ativo" : ""}" style="--c:${c}" data-vis="corMunhequeira" data-val="${i}" aria-label="${esc(NOMES_ROUPA[i])}"></button>`).join("")}</div>` : ""}
    ${blocoAparencia(s)}
    <p class="rotulo" style="margin-top:16px">Estúdio de tatuagem</p>
    <div class="chips" style="flex-wrap:wrap">${(Object.keys(NOME_AREA) as AreaTatuagem[]).map((a) => `<button class="chip${areaTat === a ? " ativo" : ""}" data-tarea="${a}">${esc(NOME_AREA[a])}${v.tatuagens[a] ? " •" : ""}</button>`).join("")}</div>
    ${atualTat ? `<p class="sub" style="margin-top:8px">${esc(NOME_AREA[areaTat])}: <b>${esc(TATUAGEM[atualTat].nome)}</b>. <button class="botao sec peq" data-tat-remover="${areaTat}">Tirar com laser (${dinheiro(custoRemocao(atualTat))})</button></p>`
      : `<div class="tat-lista">${designs.map((t) => `<button class="tat-op" data-tat="${t.id}"><span class="tat-prev">${previaTatuagem(t.id)}</span><b>${esc(t.nome)}</b><small>${dinheiro(t.preco)}</small></button>`).join("")}</div>`}
    ${!tatuagemVisivel(areaTat, v, trajeVisto) ? `<p class="sub">Com essa roupa, a tatuagem nessa parte fica escondida.</p>` : ""}`;
}
let abaAp: "cabelo" | "acessorios" | "rosto" = "cabelo";
/** Barbearia, acessórios e rosto: mexe na aparência do jogador. */
function blocoAparencia(s: Save): string {
  const a = { ...APARENCIA_PADRAO, ...((s.jogador.aparencia as Partial<Aparencia>) ?? {}) }, v = visualDe(s.jogador);
  const chipsAp = <T extends string>(campo: string, ops: { id: T; nome: string }[], atual: T | undefined) => `<div class="chips" style="flex-wrap:wrap">${ops.map((o) => `<button class="chip${atual === o.id ? " ativo" : ""}" data-ap="${campo}" data-val="${o.id}">${esc(o.nome)}</button>`).join("")}</div>`;
  const coresAp = (campo: string, lista: string[], nomes: string[], atual: number) => `<div class="cores-roupa">${lista.map((c, i) => `<button class="cor${atual === i ? " ativo" : ""}" style="--c:${c}" data-ap="${campo}" data-val="${i}" aria-label="${esc(nomes[i])}"></button>`).join("")}</div>`;
  const liga = (campo: string, nome: string, on: boolean | undefined) => `<button class="chip${on ? " ativo" : ""}" data-ap="${campo}" data-val="${on ? "0" : "1"}">${esc(nome)}</button>`;
  const sub = (t: string) => `<p class="sub" style="margin:12px 0 6px;font-weight:600">${t}</p>`;
  const ac = acessoriosAtivos(s.carreira.patrocinios), temPatro = Object.keys(ac).length > 0;
  let corpo = "";
  if (abaAp === "cabelo") corpo = sub("Corte") + chipsAp("cabelo", CABELOS, a.cabelo) + sub("Cor") + coresAp("corCabelo", CORES_CABELO, NOMES_CABELO_COR, a.corCabelo) + sub("Barba") + chipsAp("barba", BARBAS, a.barba);
  else if (abaAp === "acessorios") corpo = sub("Na cabeça") + chipsAp("acessorio", ACESSORIOS, a.acessorio ?? "nenhum") +
    ((a.acessorio === "faixa" || a.acessorio === "bandana") ? coresAp("corAcessorio", CORES_ROUPA, NOMES_ROUPA, a.corAcessorio ?? 0) : "") +
    sub("Piercing") + chipsAp("piercing", PIERCINGS, a.piercing ?? "nenhum") +
    sub("Joias") + `<div class="chips" style="flex-wrap:wrap">${liga("brinco", "Brinco esquerdo", a.brinco)}${liga("brinco2", "Brinco direito", a.brinco2)}${liga("corrente", "Corrente", a.corrente)}</div>` +
    sub("Dos patrocinadores") + (temPatro
      ? `<p class="sub">${Object.values(ac).map((x) => x!.tipo === "oculos" ? "Óculos escuros" : x!.tipo === "relogio" ? "Relógio" : "Fone").join(", ")} por contrato (aparecem fora de campo).</p><div class="chips">${`<button class="chip${v.semAcessorioPatro ? "" : " ativo"}" data-vis="semAcessorioPatro" data-val="${v.semAcessorioPatro ? "" : "1"}">${v.semAcessorioPatro ? "Usar de novo" : "Usando"}</button>`}</div>`
      : `<p class="sub">Óculos, relógio e fone de marca só chegam quando você for muito seguido: as marcas de acessório procuram a partir de alguns milhões de seguidores.</p>`);
  else corpo = `<p class="sub">Ajuste fino do rosto (o que a genética não decidiu, a câmera decide).</p>` + sub("Formato") + chipsAp("rosto", ROSTOS, a.rosto) + sub("Olhos") + chipsAp("formatoOlho", OLHOS, a.formatoOlho) + sub("Nariz") + chipsAp("nariz", NARIZES, a.nariz) + sub("Boca") + chipsAp("boca", BOCAS, a.boca);
  return `<p class="rotulo" style="margin-top:16px">Aparência</p><div class="chips">${([["cabelo", "Cabelo e barba"], ["acessorios", "Acessórios"], ["rosto", "Rosto"]] as const).map(([k, n]) => `<button class="chip${abaAp === k ? " ativo" : ""}" data-abaap="${k}">${n}</button>`).join("")}</div>${corpo}`;
}
let cartazNovo: ContratoPatrocinio | undefined;
/** Na campanha de acessório, a foto é fora de campo e com o produto no rosto. */
const fotoCampanha = (s: Save, m: Marca) => m.acessorio ? svgFoto({ aparencia: apDe(s, m), traje: "social", pescoco: tatuagemPescoco(visualDe(s.jogador).tatuagens.pescoco) }) : foto(s);
const cartaz = (s: Save, k: ContratoPatrocinio) => cartazPatrocinio(MARCA[k.marca], fotoCampanha(s, MARCA[k.marca]), s.jogador.apelido, s.jogador.numero, k.desde);
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
/** Alcance do agente em poucas palavras: o Brasil inteiro vira "Brasil (todas as divisões)". */
function alcanceCurto(ligas: string[]): string {
  const br = ligas.filter((x) => x.startsWith("BRA")), fora = ligas.filter((x) => !x.startsWith("BRA"));
  return [...(br.length >= 4 ? ["Brasil (todas as divisões)"] : br.map((x) => infoLiga(x).curto)), ...fora.map((x) => infoLiga(x).curto)].join(", ");
}
function blocoPatrocinios(s: Save): string {
  const ks = s.carreira.patrocinios ?? [];
  if (!ks.length) return `<p class="rotulo" style="margin-top:16px">Patrocinadores</p><p class="sub">Nenhum ainda. As marcas aparecem conforme a sua fama cresce: uma por categoria, até quatro ao mesmo tempo.</p>`;
  return `<p class="rotulo" style="margin-top:16px">Patrocinadores · ${dinheiro(receitaPatrocinios(s.carreira))}/mês fixos</p>
    <div class="patro-galeria carrossel">${ks.map((k) => `<div class="patro-item">${cartaz(s, k)}<b>${esc(MARCA[k.marca].nome)}</b><small>${esc(NOME_CONTRATO[k.tipo].nome)} · ${dinheiro(k.mensal)}/mês · faltam ${k.restantes} ${k.restantes === 1 ? "mês" : "meses"}</small></div>`).join("")}</div>`;
}
function blocoVida(s: Save): string {
  const c = s.carreira, pd = padraoDe(c), g = gastosDoMes(pd, c.ligaId, c.salario, c.fama, c.formacao, manutencaoMensal(s.casa));
  const ir = c.formacao ? 0 : imposto(c.salario, c.ligaId), ag = AGENTES[c.agente].comissao * c.salario, liq = salarioLiquido(c);
  const sobra = liq + receitaPatrocinios(c) - g.total - (imovelAtual(s.casa).categoria === "alojamento" || ehDono(s.casa) ? 0 : imovelAtual(s.casa).aluguel);
  const pct = Math.round(100 * aliquota(c.ligaId));
  return `<p class="rotulo" style="margin-top:16px">Dinheiro do mês</p>
    <div class="kv" style="margin-top:6px"><span>Salário bruto</span><b>${dinheiro(c.salario)}</b>${ir ? `<span>Imposto (${pct}%)</span><b class="neg">−${dinheiro(ir)}</b>` : c.formacao ? "" : `<span>Imposto</span><b>${aliquota(c.ligaId) === 0 ? "isento no Golfo" : "isento (salário abaixo da faixa)"}</b>`}${ag ? `<span>Agente</span><b class="neg">−${dinheiro(ag)}</b>` : ""}${c.patrocinioMensal ? `<span>Campanhas (${c.mesesPatrocinio} meses)</span><b class="pos">+${dinheiro(c.patrocinioMensal)}</b>` : ""}${receitaPatrocinios(c) ? `<span>Patrocinadores (fixo)</span><b class="pos">+${dinheiro(receitaPatrocinios(c))}</b>` : ""}
    ${g.itens.filter((x) => x.valor).map((x) => `<span>${esc(x.nome)}</span><b class="neg">−${dinheiro(x.valor)}</b>`).join("")}
    ${!ehDono(s.casa) && imovelAtual(s.casa).aluguel ? `<span>Aluguel</span><b class="neg">−${dinheiro(imovelAtual(s.casa).aluguel)}</b>` : ""}
    <span><b>Sobra no mês</b></span><b class="${sobra >= 0 ? "pos" : "neg"}">${sobra >= 0 ? "" : "−"}${dinheiro(Math.abs(sobra))}</b></div>
    <p class="rotulo" style="margin-top:16px">Padrão de vida</p>
    ${ITENS_VIDA.map((k) => `<p class="sub" style="margin:10px 0 6px;font-weight:600">${VIDA[k].nome}</p><div class="chips" style="flex-wrap:wrap">${VIDA[k].niveis.map((n, i) => `<button class="chip${pd[k] === i ? " ativo" : ""}" data-vida="${k}" data-nivel="${i}">${esc(n.nome)}</button>`).join("")}</div><p class="sub" style="margin-top:4px">${esc(VIDA[k].niveis[pd[k]].texto)} ${dinheiro(Math.round(VIDA[k].niveis[pd[k]].custo * fCustoVida(c.ligaId)))}/mês${efeitoTxt(VIDA[k].niveis[pd[k]])}</p>`).join("")}
    <p class="rotulo" style="margin-top:16px">Redes sociais</p>
    <div class="kv" style="margin-top:6px"><span>Seguidores</span><b>${compacto(c.seguidores)}</b><span>Tendência</span><b>${tendencia(s)}</b><span>Engajamento</span><b>${Math.round(c.engajamento ?? 40)}/100</b></div><p class="sub" style="margin-top:4px">Engajamento é o quanto seus seguidores interagem: sobe quando você posta (Redes sociais no tempo livre) e cai quando some.</p>
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
    ${livreAtual ? `<div class="ferr-botoes"><button class="botao" data-num-manter="1">Manter a ${atual}</button></div>` : `<p class="sub">A ${atual} já tem dono aqui: escolha outra abaixo.</p>`}
    <details${sel || !livreAtual || msg ? " open" : ""}><summary class="sub" style="margin-top:8px">Trocar de número${lib.length ? ` · liberadas: ${lib.map((x) => x.numero).join(", ")}` : ""}</summary>
    <p class="sub">${saidas.length && c.escolhaNumero === "temporada" ? `Saíram do elenco: ${esc(saidas.join(", "))}. ` : ""}${lib.length ? `Camisas liberadas: <b>${lib.map((x) => x.numero).join(", ")}</b>. ` : ""}Toque num número livre para ficar com ele; os ocupados mostram quem usa.</p>${msg}
    <div class="grade-num">${g.map((x) => `<button class="num${x.dono ? " ocupado" : ""}${x.liberado ? " liberado" : ""}${x.meu ? " meu" : ""}${sel?.numero === x.numero ? " visto" : ""}" data-num="${x.numero}" aria-label="${x.numero}${x.dono ? `, de ${esc(x.dono)}` : ", livre"}">${x.numero}</button>`).join("")}</div>
    ${sel?.dono ? `<p class="sub" style="margin-top:8px">A <b>${sel.numero}</b> é de ${esc(sel.dono)} (${NOME_POS[sel.posicao ?? ""] ?? "Goleiro"}).</p>` : ""}
    <div class="legenda-num"><span><i class="num meu"></i>sua</span><span><i class="num liberado"></i>liberada agora</span><span><i class="num ocupado"></i>ocupada</span></div>
    </details></section>`;
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
  return `<details class="treino-pos"${msgPos ? " open" : ""}><summary class="rotulo" style="margin-top:8px">Treino de posição · ${alvo ? `${NOME_POS[alvo]} (${Math.round(fam[alvo] ?? 0)}%)` : "nenhum"}</summary>
    <div class="chips" style="flex-wrap:wrap"><button class="chip${!alvo ? " ativo" : ""}" data-tpos="">Nenhum</button>${POSICOES.filter((p) => p !== j.posicao).map((p) => `<button class="chip pos-chip${alvo === p ? " ativo" : ""}" data-tpos="${p}" title="${NOME_POS[p]}">${ICONE_POS[p]} ${NOME_POS[p]} <small>${Math.round(fam[p] ?? 0)}%</small></button>`).join("")}</div>${info}
    ${msgPos ? `<p class="msg-mercado ${msgPos.ok ? "ok" : "nao"}" style="margin:8px 0 0">${esc(msgPos.texto)}</p>` : ""}</details>`;
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
  if (s.carreira.formacao && !s.carreira.fase && escalacao(pacote, s) === "base") return ""; // jogo da base: os craques do profissional não estão lá
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
/** Contato aberto na lista (só ele mostra as ações). */
let relAberto: string | undefined;
function linhaRel(s: Save, x: Relacao, acoes: AcaoRel[], extra = "", clubeBusca?: string): string {
  const e = estrelasDoMundo(pacote).find((k) => k.nome === x.nome), cor = x.nivel >= 80 ? "#E3B341" : x.nivel >= 60 ? "#74D394" : x.nivel >= 40 ? "#6FB7E0" : "#8A968E";
  const conhecido = !!relacoesDe(s.carreira).lista[x.nome], fav = relacoesDe(s.carreira).favoritos?.includes(x.nome);
  const aberto = relAberto === x.nome;
  return `<div class="rel-linha${aberto ? " aberta" : ""}"><div class="rel-topo">${conhecido ? `<button class="fav${fav ? " on" : ""}" data-fav="${esc(x.nome)}" aria-label="${fav ? "Tirar dos favoritos" : "Pôr nos favoritos"}" aria-pressed="${!!fav}">★</button>` : ""}${camisaMini(x.clubeId, e?.numero ?? numeroDe(x.nome))}<div class="rel-nome"><button class="nome-hist" data-hist="${esc(x.nome)}"><b>${esc(x.nome)}</b></button>${x.camisa ? ` <span class="selo" title="Camisa trocada">👕</span>` : ""}${e ? ` <span class="selo estrela" title="Estrela">★ ${e.ovr}</span>` : ""}<small>${x.aposentado ? "Aposentado" : esc(nomeDe(x.clubeId))}${extra}</small></div>
    <button class="rel-nivel abre" data-relabre="${esc(x.nome)}" aria-expanded="${aberto}" aria-label="Ações com ${esc(x.nome)}"><span style="color:${cor}">${rotuloNivel(x.nivel)} <em class="seta">${aberto ? "▴" : "▾"}</em></span><span class="rel-barra"><i style="width:${x.nivel}%;background:${cor}"></i></span></button></div>
    ${aberto ? `<div class="rel-acoes">${acoes.map((a) => `<button class="chip" data-rel="${esc(x.nome)}" data-op="${a}"${clubeBusca ? ` data-clube="${clubeBusca}"` : ""}>${NOME_ACAO_REL[a]}</button>`).join("")}</div>` : ""}</div>`;
}

// ------------------------------------------------------------------ histórico de qualquer jogador (toca no nome)
function historicoHtml(s: Save, nome: string): string {
  const h = historicoDe(pacote, nome), l = h.linhas, ult = l[l.length - 1], onde = ondeJoga(pacote, nome);
  const rel = relacoesDe(s.carreira).lista[nome];
  if (!ult) return `<button class="fechar" data-acao="fechar-hist" aria-label="Fechar">✕</button><h1 style="margin-top:8px">${esc(nome)}</h1><p class="sub">Sem registro no mundo.</p>`;
  const agora = onde ? (onde.base ? `Base do ${nomeDe(onde.clubeId)}` : nomeDe(onde.clubeId)) : h.aposentouEm !== undefined ? `Aposentado em ${ANO_INICIAL + h.aposentouEm}` : "Sem clube";
  const pico = l.reduce((a, x) => (x.ovr > a.ovr ? x : a), l[0]);
  const tot = l.reduce((a, x) => { const st = statsDaLinha(pacote, nome, x); if (!st) return a; const e = x.t === s.carreira.temporada ? statsAte(st, Math.max(0, s.carreira.semana - SEMANAS_PRE), x.liga![4]) : st; return { j: a.j + e.j, g: a.g + e.g, a: a.a + e.a }; }, { j: 0, g: 0, a: 0 });
  const clubes = [...new Set(l.map((x) => x.clubeId))];
  const tag = onde && ult.idade <= 23 ? (ult.pot >= 86 ? `<span class="tag titular">Joia</span>` : ult.pot >= 78 && ult.pot - ult.ovr >= 8 ? `<span class="tag banco">Promessa</span>` : "") : "";
  const linhas = [...l].reverse().map((x, i, arr) => {
    const ant = arr[i + 1], d = ant ? x.ovr - ant.ovr : 0, mudou = ant && ant.clubeId !== x.clubeId;
    const st = statsDaLinha(pacote, nome, x), atual = x.t === s.carreira.temporada, feitas = Math.max(0, s.carreira.semana - SEMANAS_PRE);
    const e = st ? (atual ? statsAte(st, feitas, x.liga![4]) : st) : undefined;
    return `<tr${mudou ? ` class="mudou"` : ""}><td>${ANO_INICIAL + x.t}</td><td><span class="hist-clube">${escudo(x.clubeId)}<span>${esc(nomeDe(x.clubeId))}${x.base ? " <small>(base)</small>" : ""}</span></span></td><td class="n">${x.idade}</td><td class="n">${e ? e.j : "–"}</td><td class="n">${e ? e.g : "–"}</td><td class="n">${e ? e.a : "–"}</td><td class="n"><b>${x.ovr}</b>${d ? ` <small class="delta ${d > 0 ? "pos" : "neg"}">${d > 0 ? "+" : ""}${d}</small>` : ""}</td></tr>`;
  }).join("");
  return `<button class="fechar" data-acao="fechar-hist" aria-label="Fechar">✕</button>
    <div class="hist-topo">${onde ? escudo(onde.clubeId) : ""}<div><small>${esc(NOME_POS[ult.posicao] ?? "Goleiro")} · ${ult.idade} anos</small><h1>${esc(nome)}</h1><span class="sub">${esc(agora)}</span></div><div class="ovr"><strong>${ult.ovr}</strong><span>OVR</span></div></div>
    <div class="linha-info" style="margin:10px 0">${tag}<span>Pico <b>${pico.ovr}</b> em ${ANO_INICIAL + pico.t}</span><span><b>${clubes.length}</b> ${clubes.length === 1 ? "clube" : "clubes"}</span>${tot.j ? `<span><b>${tot.j}</b> jogos · <b>${tot.g}</b> gols · <b>${tot.a}</b> assist.</span>` : ""}${rel ? `<span>Relação: <b>${esc(rotuloNivel(rel.nivel))}</b></span>` : ""}</div>
    <table class="hist"><thead><tr><th>Ano</th><th>Clube</th><th class="n">Id.</th><th class="n">J</th><th class="n">G</th><th class="n">A</th><th class="n">OVR</th></tr></thead><tbody>${linhas}</tbody></table>
    ${l[0].t === 0 && !l[0].base ? `<p class="sub" style="margin-top:8px">Antes de ${ANO_INICIAL}: carreira fora do registro do jogo.</p>` : ""}`;
}
function abrirHistorico(nome: string) {
  if (!save) return;
  $("telaHist").innerHTML = historicoHtml(save, nome);
  const d = $("dlgHist") as HTMLDialogElement;
  if (!d.open) d.showModal();
}

// ------------------------------------------------------------------ celular: contatos, busca e app de namoro
let telaCel: "contatos" | "busca" | "match" | "redes" = "contatos", buscaLiga: string | undefined, buscaClube: string | undefined, buscaBase = false;
const iniciais = (nome: string) => nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
const corRelFam = (n: number) => (n >= 80 ? "#E3B341" : n >= 60 ? "#74D394" : n >= 40 ? "#6FB7E0" : n >= 20 ? "#C9A24D" : "#EC7D69");
function linhaFam(s: Save, m: Familiar): string {
  if (m.falecido) return `<div class="rel-linha em-memoria"><div class="rel-topo"><span class="avatar-fam" style="--c:#8A968E">🕊️</span><div class="rel-nome"><b>${esc(m.nome)}</b><small>${NOME_PARENTESCO[m.parentesco]} · ${m.nasc}–${m.falecido} · em memória</small></div></div></div>`;
  const ctx = ctxFamilia(pacote, s), ano = ANO_INICIAL + s.carreira.temporada, fb = m.futebol, cor = corRelFam(m.relacao);
  const fut = fb ? ` · ${fb.fase === "pro" || fb.fase === "base" ? `${NOME_FASE_IRMAO[fb.fase]}${fb.clubeId ? ` no ${esc(nomeDe(fb.clubeId))}` : ""} · OVR ${fb.ovr}` : NOME_FASE_IRMAO[fb.fase]}${fb.clubeId === s.carreira.clubeId && fb.fase === "pro" ? " · joga com você" : ""}` : "";
  return `<div class="rel-linha"><div class="rel-topo"><span class="avatar-fam" style="--c:${cor}">${esc(iniciais(m.nome))}</span><div class="rel-nome"><b>${esc(m.nome)}</b>${m.saude === "doente" ? ` <span class="selo alerta">${m.parentesco === "pai" || m.parentesco === "irmao" ? "Internado" : "Internada"}</span>` : ""}${m.traco ? ` <span class="selo estrela">${NOME_TRACO[m.traco]}</span>` : ""}<small>${esc(parentescoCompleto(m, s.jogador.idade, ano))} · ${idadeDe(m, ano)} anos · ${esc(m.profissao)}${fut}</small></div>
    <div class="rel-nivel"><span style="color:${cor}">${rotuloRelacaoFam(m.relacao)}</span><span class="rel-barra"><i style="width:${m.relacao}%;background:${cor}"></i></span></div></div>
    <div class="rel-acoes">${acoesDe(m, ctx).map((a) => `<button class="chip" data-fam="${m.id}" data-op="${a}">${NOME_ACAO_FAM[a]}</button>`).join("")}</div></div>`;
}
function abaCelular(s: Save): string {
  const abas = `<div class="cel-abas" role="tablist">${([["contatos", "Contatos"], ["busca", "Buscar"], ["match", "Match"], ["redes", midiaDe(s).pauta ? "Redes •" : "Redes"]] as const).map(([k, n]) => `<button class="${telaCel === k ? "ativo" : ""}" data-cel="${k}" role="tab" aria-selected="${telaCel === k}">${n}</button>`).join("")}</div>`;
  const msg = msgRel ? `<p class="msg-mercado ${msgRel.ok ? "ok" : "nao"}">${esc(msgRel.texto)}</p>` : "";
  msgRel = undefined;
  return `<div class="celular">${abas}${msg}${telaCel === "busca" ? celBusca(s) : telaCel === "match" ? celMatch(s) : telaCel === "redes" ? celRedes(s) : celContatos(s)}</div>`;
}
const ICONE_POST: Record<string, string> = { torcedor: "🗣️", rival: "😈", jornalista: "🎙️", meme: "😂", fa: "💛" };
function celRedes(s: Save): string {
  const c = s.carreira, m = midiaDe(s), x = ctxMidia(pacote, s), ab = semanaAbsJogo(c);
  const usados = m.posts.semana === ab ? m.posts.n : 0, disp = postsDisponiveis(m, x);
  const pauta = m.pauta ? `<section class="painel entrevista"><p class="rotulo">🎤 Entrevista · ${esc(tituloDaPauta(m.pauta))}</p><h2>“${esc(m.pauta.pergunta)}”</h2>
      <div class="ops">${respostasDaPauta(m.pauta).map((r) => `<button data-pauta="${r.id}"><span>${esc(r.rotulo)}</span><small>${{ humilde: "humilde", confiante: "confiante", polemico: "polêmico" }[r.id]}</small></button>`).join("")}</div></section>` : "";
  const feed = m.feed.length ? m.feed.map((p) => `<div class="post tom${p.tom}"><div class="post-topo"><span>${ICONE_POST[p.tipo]}</span><b>${esc(p.autor)}</b><small>${esc(p.arroba)}</small></div><p>${esc(p.texto)}</p><small class="post-cur">♥ ${compacto(p.curtidas)}</small></div>`).join("") : `<p class="sub">O feed enche depois do primeiro jogo da semana.</p>`;
  const imp = m.imprensa, rotImp = imp >= 70 ? "Queridinho da imprensa" : imp >= 50 ? "Boa relação" : imp >= 30 ? "Relação fria" : "Em guerra com a imprensa";
  return `<div class="tiles">${tile(compacto(c.seguidores), "seguidores")}${tile(`${Math.round(c.engajamento ?? 40)}`, "engajamento")}${tile(`${Math.round(imp)}`, "imprensa")}</div>
    <p class="sub" style="margin:6px 0 10px">${esc(rotImp)}. Colunista que te acompanha: <b>${esc(m.colunista.nome)}</b> (${esc(m.colunista.veiculo)}).</p>
    ${pauta}
    ${m.assunto ? `<p class="assunto">Em alta: <b>${esc(m.assunto)}</b></p>` : ""}
    <p class="rotulo" style="margin-top:12px">O que estão falando de você</p><div class="feed">${feed}</div>
    <p class="rotulo" style="margin-top:16px">Postar · ${MAX_POSTS - usados} de ${MAX_POSTS} nesta semana</p>
    ${usados >= MAX_POSTS ? `<p class="sub">Já postou o bastante nesta semana.</p>` : `<div class="posts">${(Object.keys(POSTS) as TipoPost[]).filter((t) => disp.includes(t)).map((t) => `<button class="post-op" data-post="${t}"><b>${esc(POSTS[t].nome)}</b><small>${esc(POSTS[t].desc)}</small></button>`).join("")}</div>`}`;
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
  const meuClube = cl?.id === s.carreira.clubeId, acoes: AcaoRel[] = meuClube ? ["mensagem", "jantar"] : ["mensagem"];
  const linha = (j: JogadorNPC, extra = "") => linhaRel(s, rr.lista[j.nome] ?? { nome: j.nome, clubeId: cl!.id, nivel: 0, desde: 0 }, acoes, ` · ${NOME_POS[j.posicao] ?? "Goleiro"} · OVR ${j.ovr} · ${j.idade} anos${extra}`, cl!.id);
  const base = cl ? baseDoClube(pacote, cl.id) : [], nb = cl ? nivelDaBase(pacote, cl.id) : undefined;
  const olheiro = (j: JogadorNPC) => { const p = j.pot ?? j.ovr; return p >= 86 ? " · <b style=\"color:var(--ouro)\">joia</b>" : p >= 78 && p - j.ovr >= 10 ? " · promessa" : ""; };
  const abas = cl && base.length ? `<div class="chips" style="margin-top:10px"><button class="chip${buscaBase ? "" : " ativo"}" data-bbase="0">Profissional</button><button class="chip${buscaBase ? " ativo" : ""}" data-bbase="1">Base (${base.length})</button></div>` : "";
  const lista = !cl ? `<p class="sub">Toque num clube para ver o elenco.</p>`
    : buscaBase && base.length ? `<p class="sub" style="margin:8px 0">${esc(ESTRUTURAS[nb!.estrutura])} · ${esc(NOME_CULTURA[nb!.cultura as Cultura])}. ${nb!.cultura >= 4 ? "Sobem vários garotos por temporada." : nb!.cultura <= 2 ? "Garoto só sobe se estiver pronto." : ""}</p>
        ${[["Sub-17", base.filter((j) => j.idade <= 17)], ["Sub-20", base.filter((j) => j.idade >= 18)]].map(([n, l]) => `<p class="rotulo" style="margin-top:10px">${n}</p>${(l as JogadorNPC[]).map((j) => linha(j, olheiro(j))).join("")}`).join("")}`
    : [...cl.elenco].sort((a, b) => b.ovr - a.ovr).map((j) => linha(j)).join("");
  return `${chipsLiga}<p class="rotulo" style="margin-top:12px">${esc(infoLiga(l.id).nome)}</p>${chipsClube}${cl ? `<p class="rotulo" style="margin-top:12px">${buscaBase && base.length ? "Base" : "Elenco"} do ${esc(cl.nome)}</p>` : ""}${abas}${lista}`;
}
function cartaoPar(p: Par | Perfil, botoes: string, extra = ""): string {
  const prof = PROFISSOES[p.profissao];
  return `<div class="perfil-app"><span class="avatar-app foto">${fotoDoPerfil(p)}</span><div class="perfil-app-txt"><b>${esc(p.nome.split(" ")[0])}, ${p.idade}</b><small>${esc(prof.nome)} · ${esc(p.cidade)} · ${esc(p.jeito)}</small>
    <p>“${esc(p.bio)}”</p><small class="efeito-prof">${esc(prof.efeito)}</small>${extra}</div><div class="perfil-app-botoes">${botoes}</div></div>`;
}
let escolhaNam: { id: string; op: string } | undefined;
function celMatch(s: Save): string {
  if (s.jogador.idade < IDADE_MINIMA_APP) return `<p class="sub">O app de namoro é só a partir dos ${IDADE_MINIMA_APP} anos.</p>`;
  const c = s.carreira, n = namoroDe(c), par = n.par, ab = semanaAbsJogo(c);
  const feitas = n.semana === ab ? n.feitas : 0;
  const escolha = (p: Par) => escolhaNam?.id === p.id ? (escolhaNam.op === "pedirCasamento"
      ? `<div class="escolha-nam"><p class="rotulo">Como vai ser o pedido?</p>${(Object.keys(NOME_PEDIDO) as (keyof typeof NOME_PEDIDO)[]).map((k) => `<button class="chip" data-nam="${p.id}" data-op="pedirCasamento" data-extra="${k}">${NOME_PEDIDO[k]}</button>`).join("")}</div>`
      : `<div class="escolha-nam"><p class="rotulo">Para onde?</p>${(Object.keys(LUGARES) as Lugar[]).map((k) => `<button class="chip" data-nam="${p.id}" data-op="${escolhaNam!.op}" data-extra="${k}">${LUGARES[k].nome}</button>`).join("")}</div>`) : "";
  const cena = (p: Par) => p.cena ? `<div class="cena"><p class="rotulo">No meio do encontro…</p><p>${esc(p.cena.texto)}</p><div class="ops">${p.cena.opcoes.map((o) => `<button data-cena="${p.id}" data-op="${o.id}"><span>${esc(o.rotulo)}</span><small>›</small></button>`).join("")}</div></div>` : "";
  const chat = (p: Par) => {
    const x = chatDe(pacote, s, p.id);
    if (!x) return "";
    const cv = x.conversa, nome = esc(p.nome.split(" ")[0]);
    const bolhas = cv.hist.map((m) => m.de === "ela" ? `<div class="bolha">${esc(m.texto)}</div>` : `<div class="bolha eu">${esc(m.texto)}${m.delta !== undefined ? `<small class="${m.delta >= 0 ? "pos" : "neg"}">${m.delta >= 0 ? "+" : ""}${m.delta} ❤</small>` : ""}</div>`).join("");
    const ops = x.opcoes.length ? `<div class="chat-respostas">${x.opcoes.map((o) => `<button data-chat="${p.id}" data-estilo="${o.id}"><span>${esc(o.texto)}</span><small>${esc(NOME_TOM[o.tom])}</small></button>`).join("")}</div>`
      : `<p class="sub chat-fim">${cv.total >= 8 ? `${nome} adorou a conversa.` : cv.total >= 0 ? "Conversa boa." : `${nome} esfriou um pouco.`} Ela puxa outro assunto na semana que vem.${cv.convite && p.topouSair !== undefined ? ` <b>Ela topou sair.</b>` : ""}</p>`;
    return `<details class="chat"${x.opcoes.length ? " open" : ""}><summary>💬 Conversa com ${nome}${x.opcoes.length ? " · <b>sua vez</b>" : ""}</summary><div class="chat-hist">${bolhas}</div>${ops}</details>`;
  };
  const PRINCIPAIS = new Set(["conversar", "convidar", "encontro", "jantar", "presente", "viagem", "pedirNamoro", "morarJunto", "pedirCasamento", "conhecerFamilia", "tentarFilho", "encontroEscondido", "assumir", "terminar"]);
  const acoes = (p: Par, caso = false) => {
    const bt = (a: AcaoNamoro) => `<button class="chip${a === "terminar" ? " perigo" : ""}${escolhaNam?.id === p.id && escolhaNam.op === a ? " ativo" : ""}" data-nam="${p.id}" data-op="${a}">${a === "terminar" && !caso && p.etapa === "casados" ? "Pedir o divórcio" : NOME_ACAO_NAMORO[a]}</button>`;
    const l = acoesNamoro(p, ab, caso, !!n.gravidez).filter((a) => !(p.etapa === "match" && a === "conversar")), mais = l.filter((a) => !PRINCIPAIS.has(a));
    return l.filter((a) => PRINCIPAIS.has(a)).map(bt).join("") + (mais.length ? `<details class="mais-programas"${mais.some((a) => escolhaNam?.id === p.id && escolhaNam.op === a) ? " open" : ""}><summary class="chip">Mais programas (${mais.length}) ▾</summary><div class="rel-acoes" style="margin:6px 0 0">${mais.map(bt).join("")}</div></details>` : "");
  };
  const sobreEla = (p: Par) => {
    const g = gostosDe(p), q = quimica(p, c.vidaNoturna), r = p.relacao ?? 50;
    const icoQ = q >= 75 ? "🔥" : q >= 50 ? "💞" : q >= 30 ? "🙂" : "🧊", cara = r >= 80 ? "😍" : r >= 60 ? "😊" : r >= 40 ? "🙂" : r >= 20 ? "😕" : "💔";
    const gostos = conheceGostos(p) ? `<div class="gostos">${g.gosta.map((x) => `<span class="gosto sim" title="Gosta de ${esc(NOME_GOSTO[x])}">${ICO_GOSTO[x]}<small>${esc(NOME_GOSTO[x].split(" ")[0])}</small></span>`).join("")}<span class="gosto nao" title="Não curte ${esc(NOME_GOSTO[g.odeia])}">${ICO_GOSTO[g.odeia]}<small>${esc(NOME_GOSTO[g.odeia].split(" ")[0])}</small></span></div>` : `<div class="gostos">${["❔", "❔", "❔"].map((x) => `<span class="gosto oculto">${x}<small>?</small></span>`).join("")}<small class="sub">Converse mais para descobrir</small></div>`;
    return `<div class="sobre-ela">${gostos}<div class="quim"><span class="quim-ico">${icoQ}</span><span class="rel-barra"><i style="width:${q}%;background:linear-gradient(90deg,#E58FB1,#FF5C8A)"></i></span><b>${Math.round(q)}</b></div><div class="pensa-vis"><span>${cara}</span><small>${esc(pensamentoDela(p))}</small></div>${p.famosa ? `<small>⭐ Celebridade: vocês são o casal do momento.</small>` : ""}</div>`; };
  const barra = (p: Par, rot = NOME_ETAPA[p.etapa]) => `<div class="rel-nivel" style="margin-top:6px"><span style="color:${corRelFam(p.relacao)}">${rot} · ${Math.round(p.relacao)}</span><span class="rel-barra"><i style="width:${p.relacao}%;background:${corRelFam(p.relacao)}"></i></span></div>`;
  const parHtml = par ? `<p class="rotulo">${par.etapa === "casados" ? "Sua esposa" : par.etapa === "noivos" ? "Sua noiva" : par.etapa === "morando" ? "Mora com você" : "Sua namorada"}</p>${cartaoPar(par, "", barra(par) + sobreEla(par))}${cena(par)}${chat(par)}<div class="rel-acoes" style="margin-left:0">${acoes(par)}</div>${escolha(par)}` : "";
  const fic = n.ficantes ?? [];
  const ficHtml = fic.length ? `<p class="rotulo" style="margin-top:${par ? 14 : 0}px">Casinhos <small>(${fic.length})</small></p><p class="sub">Sem compromisso: dá para sair com mais de uma pessoa, sem esconder nada. Relacionamento sério é um só: quando você pedir alguém em namoro, os outros casinhos acabam.</p>${fic.map((x) => `${cartaoPar(x, "", barra(x, "Ficando") + sobreEla(x))}${cena(x)}${chat(x)}<div class="rel-acoes" style="margin-left:0">${acoes(x)}</div>${escolha(x)}`).join("")}` : "";
  const casos = n.casos ?? [];
  const casosHtml = casos.length ? `<p class="rotulo" style="margin-top:14px">Casos escondidos <small>(${casos.length})</small></p><p class="sub">Quanto mais casos, encontros e fama, maior o risco de a mídia descobrir.${par ? ` Se descobrir, ${esc(par.nome.split(" ")[0])} fica sabendo.` : ""}</p>${casos.map((x) => `${cartaoPar(x, "", barra(x, x.exposto ? "Caso (já saiu na mídia)" : x.etapa === "namorando" ? "Namoro escondido" : "Caso"))}${cena(x)}${chat(x)}<div class="rel-acoes" style="margin-left:0">${acoes(x, true)}</div>${escolha(x)}`).join("")}` : "";
  const filhos = n.filhos ?? [];
  const ano = ANO_INICIAL + c.temporada, g = n.gravidez;
  const gravidezHtml = g ? `<div class="aviso-gravidez">🍼 <b>${esc(g.mae.split(" ")[0])} está grávida.</b> O bebê chega em ${Math.max(1, g.parto - ab)} semanas.${g.caso ? " Ninguém sabe ainda..." : ""}</div>` : "";
  const filhosHtml = filhos.length ? `<p class="rotulo" style="margin-top:14px">Filhos</p>${filhos.map((f, i) => { const r = Math.round(f.relacao ?? 70); return `<div class="filho"><div class="filho-topo"><b>${esc(f.nome)}</b><small class="sub">${Math.max(0, ano - f.ano)} ${ano - f.ano === 1 ? "ano" : "anos"} · ${["bebê", "criança", "adolescente", "adulto"][ano - f.ano < 3 ? 0 : ano - f.ano < 12 ? 1 : ano - f.ano < 18 ? 2 : 3]} · mãe: ${esc(f.mae.split(" ")[0])} · ${f.pensao ? "mora com a mãe (pensão)" : ano - f.ano >= 18 && f.adulto ? "mora sozinho" : "mora com você"}${f.futebol ? ` · ⚽ ${{ escolinha: "na escolinha", base: `na base${f.futebol.clubeId ? ` do ${esc(nomeDe(f.futebol.clubeId))}` : ""}`, pro: "jogador profissional", parou: "largou o futebol" }[f.futebol.fase]}${f.futebol.fase !== "parou" ? ` · OVR ${f.futebol.ovr}` : ""}` : ""}</small></div>
      <div class="rel-nivel"><span style="color:${corRelFam(r)}">Relação · ${r}</span><span class="rel-barra"><i style="width:${r}%;background:${corRelFam(r)}"></i></span></div>
      <div class="rel-acoes" style="margin-left:0">${(Object.keys(NOME_ACAO_FILHO) as AcaoFilho[]).map((a) => `<button class="chip" data-filho="${i}" data-op="${a}">${NOME_ACAO_FILHO[a]}</button>`).join("")}</div></div>`; }).join("")}` : "";
  const livres = `<p class="sub" style="margin-top:8px">${MAX_ACOES_NAMORO - feitas} ${MAX_ACOES_NAMORO - feitas === 1 ? "programa livre" : "programas livres"} nesta semana. Com a mesma pessoa, cada programa rende um pouco menos. Sem atenção a relação esfria; vida noturna demais incomoda.</p>`;
  const perfis = perfisDaSemana(pacote, s);
  const deck = perfis.length ? perfis.map((p) => cartaoPar(p, `<button class="botao sec peq" data-curtir="${p.id}" data-sim="0">Passar</button><button class="botao peq" data-curtir="${p.id}" data-sim="1">Curtir</button>`, `<small class="sub">Chance de match: ${Math.round(100 * chanceMatch(p, c.fama))}%</small>`)).join("") : `<p class="sub">Acabaram os perfis desta semana. Novos chegam na próxima.</p>`;
  const matches = n.matches.length ? `<p class="rotulo" style="margin-top:14px">Matches</p>${n.matches.map((m) => `${cartaoPar(m, "", `<small class="sub">${m.conversas} ${m.conversas === 1 ? "conversa" : "conversas"}${m.conversas < 2 ? " · converse mais antes de chamar para sair" : ""}</small>${conheceGostos(m) ? sobreEla(m) : ""}`)}${chat(m)}<div class="rel-acoes" style="margin-left:0">${acoes(m)}</div>${escolha(m)}`).join("")}` : "";
  const aviso = par ? `<p class="sub">Você namora sério: quem você chamar para sair vira caso escondido.</p>` : fic.length ? `<p class="sub">Sem compromisso: quem você chamar para sair vira mais um casinho.</p>` : "";
  return `${parHtml}${ficHtml}${gravidezHtml}${casosHtml}${filhosHtml}${livres}<p class="rotulo" style="margin-top:14px">Perfis da semana</p>${aviso}<p class="sub">Fama ajuda no match. A profissão dela mexe no seu jogo.</p>${deck}${matches}`;
}
function abaAmigos(s: Save): string {
  const c = s.carreira, rr = relacoesDe(c), lista = Object.values(rr.lista), est = estrelasDoMundo(pacote);
  const usadas = rr.semana === semanaAbsJogo(c) ? rr.feitas.length : 0;
  const jan = !!janelaAberta(c);
  const comp = lista.filter((x) => x.companheiro).sort((a, b) => b.nivel - a.nivel);
  const exTodos = lista.filter((x) => !x.companheiro && !est.some((e) => e.nome === x.nome)).sort((a, b) => b.nivel - a.nivel);
  const ex = exTodos.filter((x) => !x.aposentado), aposentados = exTodos.filter((x) => x.aposentado);
  const seguidas = lista.filter((x) => !x.companheiro && est.some((e) => e.nome === x.nome)).sort((a, b) => b.nivel - a.nivel);
  const ligaEst = est.filter((e) => !rr.lista[e.nome] && mundo(pacote).info[e.clubeId]?.ligaId === c.ligaId && e.clubeId !== c.clubeId).slice(0, 4);
  const mundoEst = est.filter((e) => !rr.lista[e.nome] && !ligaEst.includes(e)).slice(0, 6);
  const novo = (e: typeof est[number]) => linhaRel(s, { nome: e.nome, clubeId: e.clubeId, nivel: 0, desde: 0 }, ["redes", "mensagem"], ` · ${NOME_POS[e.posicao] ?? "Goleiro"} · ${Math.round(100 * atencao(c.fama, e.fama))}% de atenção`);
  const camisas = lista.filter((x) => x.camisa).length;
  return `<div class="amigos-topo"><div><b>${MAX_ACOES_SEMANA - usadas}</b><span>conversas livres nesta semana</span></div><div><b>${lista.filter((x) => x.nivel >= 40).length}</b><span>amigos</span></div><div><b>${camisas}</b><span>camisas trocadas</span></div></div>
    <p class="sub">Toque no nível de amizade para ver as ações. A convivência no clube cria amizade sozinha; sair com os amigos no tempo livre acelera. Estrelas respondem mais a quem tem fama. Amigo de verdade (Parceiro, 60+) pode te indicar ao clube dele na janela.</p>
    <p class="rotulo" style="margin-top:14px">Companheiros de clube</p>
    ${comp.length ? comp.slice(0, 10).map((x) => linhaRel(s, x, ["mensagem", "jantar"])).join("") : `<p class="sub">Jogue algumas semanas para conhecer o elenco.</p>`}
    ${ex.length ? `<p class="rotulo" style="margin-top:14px">Ex-companheiros</p>${ex.slice(0, 8).map((x) => linhaRel(s, x, x.nivel >= 60 && jan ? ["mensagem", "indicacao"] : ["mensagem"])).join("")}` : ""}
    ${seguidas.length ? `<p class="rotulo" style="margin-top:14px">Estrelas que você conhece</p>${seguidas.map((x) => linhaRel(s, x, x.nivel >= 60 && jan ? ["redes", "mensagem", "indicacao"] : ["redes", "mensagem"])).join("")}` : ""}
    ${ligaEst.length ? `<p class="rotulo" style="margin-top:14px">Estrelas da sua liga</p>${ligaEst.map(novo).join("")}` : ""}
    <p class="rotulo" style="margin-top:14px">Estrelas do mundo</p>${mundoEst.map(novo).join("")}
    ${aposentados.length ? `<details class="dobra" style="margin-top:14px"><summary class="rotulo">Aposentados (${aposentados.length})</summary>${aposentados.slice(0, 20).map((x) => linhaRel(s, x, ["mensagem"])).join("")}</details>` : ""}`;
}

let subJogador: "atributos" | "clube" | "saude" | "negocios" | "visual" | "dinheiro" = "atributos";
let msgJog: { ok: boolean; texto: string } | undefined, operarCerteza: string | undefined;

// ------------------------------------------------------------------ saúde e longevidade
function blocoSaude(s: Save): string {
  const c = s.carreira, j = s.jogador, sd = saudeDe(c), ic = idadeDoCorpo(sd, j.idade), prev = previsaoAltoNivel(sd, j.idade, j.personalidade.profissionalismo);
  const cor = sd.desgaste < 20 ? "#74D394" : sd.desgaste < 40 ? "#A9D46F" : sd.desgaste < 60 ? "#E3B341" : sd.desgaste < 80 ? "#F09A5B" : "#EC7D69";
  const diff = Math.round((ic - j.idade) * 10) / 10;
  const previsao = prev <= j.idade ? "Pelos exames, o corpo já está no limite do alto nível. Cada temporada agora é lucro." : `Pelos exames, o corpo aguenta alto nível até uns <b>${prev} anos</b>.`;
  const staff = (Object.keys(STAFF) as Staff[]).map((k) => { const on = !!sd.equipe[k]; return `<div class="staff${on ? " on" : ""}"><div><b>${STAFF[k].nome}</b><small>${esc(STAFF[k].desc)}</small></div><button class="botao ${on ? "sec" : ""} peq" data-staff="${k}" data-on="${on ? 0 : 1}">${on ? "Dispensar" : `Contratar<small>${dinheiro(STAFF[k].custo)}/mês</small>`}</button></div>`; }).join("");
  const cron = sd.cronicas.map((x) => `<div class="cronica n${x.nivel}"><div><b>${NOME_PARTE[x.parte]}</b><small>Dor crônica ${["", "leve", "moderada", "forte"][x.nivel]} · desde ${x.desde}${x.tratando ? " · em tratamento" : ""}</small></div>
    <div class="ferr-botoes"><button class="botao sec peq" data-tratar="${x.parte}">${x.tratando ? "Parar tratamento" : "Tratar"}</button><button class="botao sec peq" data-operar="${x.parte}">${operarCerteza === x.parte ? "Toque de novo: opera" : "Operar"}</button></div></div>`).join("");
  return `<div class="corpo-card"><div class="corpo-topo"><div><p class="rotulo">Corpo</p><h2 style="color:${cor}">${rotuloCorpo(sd.desgaste)}</h2></div><div class="corpo-idade"><b>${ic.toFixed(1).replace(".", ",")}</b><small>idade do corpo</small></div></div>
      <div class="barra-corpo"><i style="width:${Math.max(4, sd.desgaste)}%;background:${cor}"></i></div>
      <p class="sub" style="margin-top:8px">Desgaste ${Math.round(sd.desgaste)}/100. ${diff > 0.5 ? `O corpo está ${diff.toFixed(1).replace(".", ",")} anos mais velho que você.` : diff < -0.5 ? `O corpo está ${Math.abs(diff).toFixed(1).replace(".", ",")} anos mais novo que você.` : "O corpo acompanha a sua idade."} ${previsao}</p></div>
    <p class="sub" style="margin-top:8px">Jogar muito, treino puxado, cansaço alto, noitadas e a idade desgastam. Dias de descanso, boa alimentação (em Dinheiro), casa confortável e a equipe particular seguram. Corpo gasto se machuca mais e cai mais rápido com a idade.</p>
    <p class="rotulo" style="margin-top:16px">Lesões crônicas</p>
    ${cron || `<p class="sub">Nenhuma. Lesão grave às vezes deixa sequela: com fisioterapeuta, a chance é menor.</p>`}
    ${sd.cronicas.length ? `<p class="sub" style="margin-top:6px">Tratar só avança com fisioterapeuta particular. Operar resolve quase sempre, mas tira você de 8 a 15 semanas.</p>` : ""}
    <p class="rotulo" style="margin-top:16px">Equipe particular${custoEquipe(sd) ? ` · ${dinheiro(custoEquipe(sd))}/mês` : ""}</p>${staff}`;
}

// ------------------------------------------------------------------ negócios e investimentos
function blocoNegocios(s: Save): string {
  const c = s.carreira, n = negociosDe(c), saldo = s.casa.saldo, inv = patrimonioInvestido(n);
  const p = n.proposta;
  const prop = p ? `<section class="painel prop-neg${n.assessor && p.golpe ? " suspeita" : ""}"><p class="rotulo">Proposta · ${esc(p.de)}</p><h2>${esc(p.titulo)}</h2><p class="sub">${esc(p.texto)}</p>
      <div class="kv" style="margin-top:6px"><span>Valor</span><b>${dinheiro(p.valor)}</b><span>Promessa</span><b>${esc(p.promessa)}</b></div>
      ${n.assessor ? `<p class="assessor">${p.golpe ? "🧐 Seu assessor: \"Retorno garantido desse tamanho não existe. Isso tem cara de golpe.\"" : "📊 Seu assessor: \"Negócio de verdade. Tem risco, mas é honesto.\""}</p>` : ""}
      <div class="ferr-botoes"><button class="botao" data-propneg="1">Topar</button><button class="botao sec" data-propneg="0">Recusar</button></div></section>` : "";
  const emp = n.empresas.map((e) => {
    const info = EMPRESAS[e.tipo], cor = e.saude >= 65 ? "#74D394" : e.saude >= 40 ? "#E3B341" : "#EC7D69", ab = semanaAbsJogo(c), feito = e.acao === ab;
    return `<div class="empresa"><div class="emp-topo"><div><b>${esc(e.nome)}</b><small>${esc(info.nome)} · desde ${e.desde}</small></div><div class="emp-valor"><b>${dinheiro(Math.round(e.valor))}</b><small>${e.lucroUlt === undefined ? "primeiro mês" : `${e.lucroUlt >= 0 ? "+" : "−"}${dinheiro(Math.abs(e.lucroUlt))} no mês`}</small></div></div>
      <div class="emp-saude"><span>Saúde do negócio</span><span class="rel-barra"><i style="width:${e.saude}%;background:${cor}"></i></span></div>
      <div class="rel-acoes" style="margin-left:0">${feito ? `<span class="sub">Já mexeu nela nesta semana.</span>` : (["cuidar", "divulgar", "investir"] as AcaoEmpresa[]).map((a) => `<button class="chip" data-emp="${e.uid}" data-op="${a}">${{ cuidar: "Cuidar pessoalmente", divulgar: "Divulgar nas redes", investir: `Investir ${dinheiro(Math.round(info.custo * 0.25))}` }[a as "cuidar"]}</button>`).join("")}<button class="chip" data-emp="${e.uid}" data-op="vender">Vender (${dinheiro(Math.round(e.valor * (0.6 + e.saude / 250)))})</button></div></div>`;
  }).join("");
  const abrir = (Object.keys(EMPRESAS) as TipoEmpresa[]).filter((t) => !n.empresas.some((e) => e.tipo === t)).map((t) => {
    const i = EMPRESAS[t], pode = c.fama >= i.famaMin && saldo >= i.custo;
    return `<div class="abrir-emp${pode ? "" : " trava"}"><div><b>${esc(i.nome)}</b><small>${esc(i.desc)}</small>${c.fama < i.famaMin ? `<small class="falta">Precisa de fama ${i.famaMin}</small>` : ""}</div><button class="botao peq${pode ? "" : " sec"}" data-abrir="${t}" ${pode ? "" : "disabled"}>${dinheiro(i.custo)}</button></div>`;
  }).join("");
  const invs = (Object.keys(INVEST) as TipoInvest[]).map((k) => `<div class="invest"><div><b>${INVEST[k].nome}</b><small>${esc(INVEST[k].desc)}</small></div><b class="inv-v">${dinheiro(n.invest[k])}</b>
    <div class="ferr-botoes">${[100_000, 1_000_000].map((v) => `<button class="chip" data-inv="${k}" data-valor="${v}" ${saldo >= v ? "" : "disabled"}>+${dinheiroCurto(v).replace("R$ ", "")}</button>`).join("")}${n.invest[k] > 0 ? `<button class="chip" data-inv="${k}" data-valor="-1e15">Resgatar</button>` : ""}</div></div>`).join("");
  const golpes = n.golpes.map((g) => `<div class="invest"><div><b>${esc(g.nome)}</b><small>O extrato não para de subir.</small></div><b class="inv-v" style="color:#74D394">${dinheiro(g.mostrado)}</b></div>`).join("");
  return `${prop}<div class="tiles">${tile(dinheiroCurto(saldo), "Em conta")}${tile(dinheiroCurto(inv), "Investido")}${tile(dinheiroCurto(saldo + inv), "Patrimônio")}</div>
    ${n.mes ? `<p class="sub" style="margin-top:6px">Último mês: empresas ${n.mes.empresas >= 0 ? "+" : "−"}${dinheiro(Math.abs(n.mes.empresas))} · investimentos ${n.mes.invest >= 0 ? "+" : "−"}${dinheiro(Math.abs(Math.round(n.mes.invest)))}</p>` : ""}
    <p class="rotulo" style="margin-top:16px">Suas empresas</p>
    ${emp || `<p class="sub">Nenhuma ainda. Empresa dá lucro quando vai bem, perde quando vai mal e pode falir. Quem cuida, divulga e tem fama vende mais.</p>`}
    <p class="rotulo" style="margin-top:16px">Investimentos</p>${invs}${golpes}
    <div class="staff${n.assessor ? " on" : ""}" style="margin-top:10px"><div><b>Assessor financeiro</b><small>Desconfia das propostas estranhas e cuida um pouco das empresas.</small></div><button class="botao ${n.assessor ? "sec" : ""} peq" data-assessor="${n.assessor ? 0 : 1}">${n.assessor ? "Dispensar" : `Contratar<small>${dinheiro(CUSTO_ASSESSOR)}/mês</small>`}</button></div>
    <details class="dobra" style="margin-top:16px"${n.empresas.length ? "" : " open"}><summary class="rotulo">Abrir um negócio</summary>${abrir || `<p class="sub">Você já tem um de cada.</p>`}</details>`;
}
/** Jogador › Clube: técnico, vestiário, rival, torcida e contrato. */
function blocoClube(s: Save): string {
  const c = s.carreira, j = s.jogador, info = infoClube(pacote, c.clubeId), sub = (t: string) => `<p class="rotulo" style="margin-top:18px">${t}</p>`;
  if (c.fase || c.formacao || c.mercado?.semClube) return `<p class="sub">${c.mercado?.semClube ? "Sem clube, sem vestiário. Assine um contrato e esta tela ganha vida." : "Na base, o vestiário é outro: técnico, capitania, rival e torcida chegam com o contrato profissional."}</p>${blocoCidade(s, true)}`;
  const v = vestiarioDe(pacote, s), t = c.tecnico;
  const tecnico = t ? `<div class="card-clube"><div class="linha-ico"><span class="ico">📋</span><div><b>${esc(t.nome)}</b><small>${esc(NOME_ESTILO[t.estilo][0])} · ${t.idade} anos · desde ${ANO_INICIAL + t.desde}</small></div></div>
    <p class="sub">${esc(NOME_ESTILO[t.estilo][1])}</p>${barra("Relação", c.relTecnico, 100, c.relTecnico < 30 ? "#E5534B" : "#E3B341")}
    ${v.geladeira ? `<p class="aviso-geladeira">🧊 Na geladeira: mais ${v.geladeira} ${v.geladeira === 1 ? "semana" : "semanas"} fora dos relacionados.</p>` : c.relTecnico < 25 ? `<p class="sub" style="color:var(--neg)">Relação ruim: o técnico pode te tirar dos relacionados.</p>` : ""}
    ${(v.exTecnicos ?? []).length ? `<p class="sub" style="margin-top:6px">Ex-técnicos: ${v.exTecnicos!.map((x) => `${esc(x.nome)} <small>(${x.rel >= 65 ? "fã de você" : x.rel >= 40 ? "neutro" : "não gosta"})</small>`).join(" · ")}. Quem gosta de você pode te chamar quando assumir outro clube.</p>` : ""}</div>` : "";
  const prox = v.papel === "capitao" ? "Você usa a braçadeira. Discursa antes das decisões e responde pelo grupo." : v.papel === "vice" ? "Próximo passo: capitão (liderança 74, titular e 20 jogos no clube)." : v.papel === "novato" ? "Ainda é o novato: jogos, tempo de casa e as escolhas no vestiário mudam isso." : "Liderança sobe com tempo de casa, idade, carisma, fama e as escolhas nos momentos do vestiário.";
  const vest = `<div class="card-clube"><div class="linha-ico"><span class="ico">${v.papel === "capitao" ? "🅒" : "👕"}</span><div><b>${NOME_PAPEL_VEST[v.papel]}</b><small>${esc(prox)}</small></div></div>${barra("Liderança", v.lideranca, 100, "#74D394")}
    ${v.comp.length ? `<div class="vest-grupo">${v.comp.map((x) => `<div class="vg-cel" title="${esc(NOME_COMP[x.tipo][1])}"><div class="vg-foto">${fotoNpc(x.nome, c.clubeId, x.tipo === "pupilo" ? 18 : x.tipo === "mentor" ? 33 : 25)}<span class="vg-tipo">${ICO_COMP[x.tipo]}</span><span class="vg-humor">${humor(x.rel)}</span></div><b>${esc(x.nome.split(" ")[0])}</b><small>${esc(NOME_COMP[x.tipo][0])}</small><i class="vg-rel" style="--v:${Math.round(x.rel)}%;--c:${x.rel < 35 ? "#E5534B" : x.rel >= 65 ? "#74D394" : "#6FA8DC"}"></i></div>`).join("")}</div>` : ""}</div>`;
  const r = c.rival;
  const rival = r ? `<div class="card-clube rival"><div class="rival-topo"><div><span class="rv-foto">${foto(s)}</span>${escudo(c.clubeId)}<b>${esc(j.apelido)}</b></div><div class="rival-placar"><span>${r.placar.eu}</span><small>× ${r.placar.empate} ×</small><span>${r.placar.ele}</span></div><div><span class="rv-foto ele">${fotoNpc(r.nome, r.clubeId, r.idade)}</span>${escudo(r.clubeId)}<b>${esc(r.nome)}</b></div></div>
    <p class="sub" style="text-align:center">Duelos: vitórias suas × empates × vitórias dele · rivalidade desde ${r.desde}</p>${barra("Temperatura", r.temp, 100, "#E5534B")}
    ${r.duelos.length ? `<div class="kv">${r.duelos.slice(-5).reverse().map((d) => `<span>${d.ano} · contra o ${esc(d.adv)}</span><b>${d.meu.toFixed(1)} × ${d.dele.toFixed(1)}${d.golsEu || d.golsEle ? ` <small>(gols ${d.golsEu} × ${d.golsEle})</small>` : ""}</b>`).join("")}</div>` : `<p class="sub">Ainda sem duelo: quando os clubes se enfrentarem, a nota de cada um vai para o placar.</p>`}
    ${r.anos.length ? `<p class="sub" style="margin-top:6px">Gols por temporada: ${r.anos.slice(-4).map((x) => `${x.ano}: <b>${x.golsEu} × ${x.golsEle}</b>`).join(" · ")}</p>` : ""}</div>`
    : `<p class="sub">Ainda sem rival. Quando a sua fama crescer (28+ e 10 jogos como profissional), a imprensa escolhe alguém da sua geração para te comparar.</p>`;
  const passados = (c.rivaisPassados ?? []).length ? `<p class="sub">Rivais de antes: ${c.rivaisPassados!.map((x) => `${esc(x.nome)} (${x.placar.eu}×${x.placar.ele}, ${esc(x.fim?.motivo ?? "")})`).join(" · ")}</p>` : "";
  const tv = c.torcidaViva?.[c.clubeId], torc = c.torcida ?? 50;
  const [tc1, tc2] = cores(c.clubeId), corT = torc >= 70 ? "#74D394" : torc >= 40 ? "#E8D36A" : "#EC7D69";
  const torcida = `<div class="card-clube"><div class="torc-vis"><div class="termo" role="img" aria-label="Reputação ${Math.round(torc)}"><i style="height:${Math.round(torc)}%;background:${corT}"></i><b style="background:${corT}"></b></div>
    <svg class="arquibancada" viewBox="0 0 210 84" role="img" aria-label="Arquibancada">${(() => {
      // quanto mais a torcida gosta, mais gente com a camisa, mais bandeira e mais pulo
      const peles = ["#F0C29E", "#C98C63", "#8A5534", "#E2A77D", "#6B3F24"], out: string[] = [];
      for (let lin = 0; lin < 3; lin++) for (let k = 0; k < 9; k++) {
        const x = 12 + k * 23 + (lin % 2 ? 11 : 0), y = 30 + lin * 20, i = lin * 9 + k, camisa = (i * 37) % 100 < torc ? (i % 3 ? tc1 : tc2) : "#3A3A3A";
        const pula = torc >= 55 && (i * 7) % 3 === 0;
        out.push(`<g class="${pula ? "pula" : ""}" style="animation-delay:${((i * 0.17) % 1).toFixed(2)}s">${torc >= 40 && i % 7 === 3 ? `<path d="M${x + 6} ${y - 4} V${y - 26}" stroke="#DDD" stroke-width="1.4"/><path d="M${x + 6} ${y - 26} q8 -3 16 1 q-8 4 -16 9 Z" fill="${i % 2 ? tc2 : tc1}" stroke="#0006" stroke-width=".6"/>` : ""}
          <path d="M${x - 9} ${y + 16} q0 -11 9 -11 q9 0 9 11 Z" fill="${camisa}" stroke="#0005" stroke-width=".6"/><circle cx="${x}" cy="${y}" r="5.5" fill="${peles[i % 5]}"/>${pula ? `<path d="M${x - 8} ${y + 6} l-4 -10 M${x + 8} ${y + 6} l4 -10" stroke="${peles[i % 5]}" stroke-width="2.4" stroke-linecap="round"/>` : ""}</g>`);
      }
      return out.join("");
    })()}</svg>
    <div class="torc-num"><b style="color:${corT}">${Math.round(torc)}</b><small>${torc >= 80 ? "Ídolo" : torc >= 65 ? "Querido" : torc >= 45 ? "Respeitado" : torc >= 30 ? "Desconfiada" : "Na bronca"}</small></div></div>
    ${tv?.apelido ? `<p class="sub">Apelido da arquibancada: <b>"${esc(tv.apelido)}"</b></p>` : `<p class="sub">Ainda sem apelido: a arquibancada batiza quem conquista ela (reputação 68+).</p>`}
    ${tv?.musica ? `<blockquote class="musica">🎵 ${tv.musica.versos.map(esc).join("<br>")}</blockquote>` : `<p class="sub">Música própria só para ídolo: reputação 80+ e 15 jogos no clube.</p>`}
    ${tv?.faixas.length ? `<div class="faixas">${tv.faixas.slice(-4).reverse().map((f, i) => `<span class="faixa-est" style="background:${i % 2 ? tc2 : tc1};color:${luminancia(i % 2 ? tc2 : tc1) > 0.6 ? "#151515" : "#FFFFFF"}">${esc(f.texto)}</span>`).join("")}</div>` : ""}
    ${tv && (tv.protestos || tv.aeroporto) ? `<p class="sub">${tv.aeroporto ? `${tv.aeroporto} festa${tv.aeroporto > 1 ? "s" : ""} no aeroporto` : ""}${tv.aeroporto && tv.protestos ? " · " : ""}${tv.protestos ? `${tv.protestos} protesto${tv.protestos > 1 ? "s" : ""} no CT` : ""}</p>` : ""}
    ${Object.values(c.torcidaViva ?? {}).filter((x) => x.clubeId !== c.clubeId && (x.apelido || x.musica)).map((x) => `<p class="sub">No ${esc(infoClube(pacote, x.clubeId)?.nome ?? "")}: ${x.apelido ? `"${esc(x.apelido)}"` : ""}${x.musica ? " · tinha música" : ""}</p>`).join("")}</div>`;
  const k = c.contrato;
  const contrato = `<div class="card-clube"><div class="kv"><span>Salário</span><b>${dinheiro(c.salario)}/mês</b><span>Contrato</span><b>${c.anosContrato} ${c.anosContrato === 1 ? "ano" : "anos"}</b>${k ? `<span>Multa rescisória</span><b>€ ${(k.multa / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi</b>${k.pctVenda ? `<span>Da venda futura</span><b>${k.pctVenda}%</b>` : ""}<span>Bônus por gol</span><b>${k.bonusGol ? dinheiro(k.bonusGol) : "–"}</b><span>Bônus por título</span><b>${k.bonusTitulo ? dinheiro(k.bonusTitulo) : "–"}</b>` : ""}</div>
    ${!k ? `<p class="sub">Contrato antigo, sem cláusulas. A próxima renovação ou transferência traz multa, bônus e % de venda.</p>` : ""}
    <div class="ferr-botoes"><button class="botao sec peq" data-aumento="1" ${k?.pedidoAumento === c.temporada ? "disabled" : ""}>Pedir aumento à diretoria</button></div>
    <p class="sub">Uma vez por temporada. Quem é titular e está em boa fase ganha renovação melhor; quem não está, ouve um não.</p></div>`;
  return `<div style="display:flex;gap:10px;align-items:center">${escudo(c.clubeId)}<div><h2 style="margin:0">${esc(info.nome)}</h2><span class="sub">${esc(info.cidade)} · ${esc(info.estadio)}</span></div></div>
    ${sub("Técnico")}${tecnico}${sub("Vestiário")}${vest}${sub("Rival")}${rival}${passados}${sub("Torcida")}${torcida}${sub("Contrato")}${contrato}`;
}
/** A cidade onde o jogador mora. */
function blocoCidade(s: Save, curto = false): string {
  const c = s.carreira, info = infoClube(pacote, c.clubeId), nome = c.cidade?.nome ?? info?.cidade ?? "", pais = c.cidade?.pais ?? info?.pais ?? "BRA", p = perfilCidade(nome, pais);
  const lua = (n: number) => n ? "🌙".repeat(n) : "Tranquila";
  const inv = inverno(pais, c.semana);
  return `<div class="card-clube cidade"><h2 style="margin:0 0 4px">${esc(nome)}</h2><p class="sub">${esc(p.descricao)}</p>
    <div class="kv"><span>Clima</span><b>${esc(NOME_CLIMA[p.clima])}${inv && p.clima === "frio" ? " · inverno agora" : ""}</b><span>Custo de vida</span><b>${p.custo >= 1.4 ? "Muito caro" : p.custo >= 1.15 ? "Caro" : p.custo <= 0.85 ? "Barato" : "Na média"} <small>(${p.custo >= 1 ? "+" : "−"}${Math.round(Math.abs(p.custo - 1) * 100)}% nos gastos)</small></b><span>Vida noturna</span><b>${lua(p.noite)}</b><span>Praia</span><b>${p.praia ? "Sim" : "Não"}</b><span>Trânsito</span><b>${p.transito ? "Pesado" : "Tranquilo"}</b><span>Segurança</span><b>${["Tranquila", "Atenção", "Perigosa"][p.perigo]}</b>${p.festa ? `<span>Festa típica</span><b>${esc(p.festa.nome)}</b>` : ""}</div>
    ${curto ? "" : `<p class="sub" style="margin-top:8px">Para conhecer: ${p.pontos.map(esc).join(" · ")}${c.cidade?.conheceu ? " (já conheceu)" : ""}</p>
    <p class="sub">Vida noturna agitada puxa a balada; frio pesa no humor de quem vem de país quente; o custo mexe nos gastos do mês.</p>
    ${(c.cidadesMoradas ?? []).length > 1 ? `<p class="sub">Já morou em: ${c.cidadesMoradas!.map(esc).join(" · ")}</p>` : ""}`}</div>`;
}
/** Álbum de figurinhas da carreira. */
function figurinhaSvg(f: Figurinha): string {
  const cor = f.cores[0].toUpperCase() === "#FFFFFF" ? f.cores[1] : f.cores[0];
  const ap = { ...APARENCIA_PADRAO, ...(f.ap as Partial<Aparencia>) };
  const rosto = svgFoto({ aparencia: ap, camisa: { cor1: f.cores[0].toUpperCase() === "#FFFFFF" ? "#F4F4F2" : f.cores[0], cor2: f.cores[1] ?? "#111111", estilo: "lisa" }, numero: f.numero, traje: "jogo" }).replace("<svg ", '<svg x="10" y="22" width="140" height="168" ');
  return `<svg viewBox="0 0 160 230" class="fig-svg" role="img" aria-label="Figurinha ${f.ano}"><defs><linearGradient id="fg${f.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cor}"/><stop offset="1" stop-color="#0E1A15"/></linearGradient></defs>
    <rect x="1" y="1" width="158" height="228" rx="10" fill="url(#fg${f.id})"/>${rosto}
    <rect x="6" y="6" width="58" height="16" rx="4" fill="#0008"/><text x="35" y="18" text-anchor="middle" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="11" fill="#fff">${f.ano}</text>
    <text x="150" y="20" text-anchor="end" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="18" fill="#fff">${f.ovr}</text>
    <rect x="0" y="186" width="160" height="44" fill="#0E1A15" opacity=".92"/><text x="80" y="202" text-anchor="middle" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="12" fill="#fff">${esc(f.clube.toUpperCase().slice(0, 22))}</text>
    <text x="80" y="216" text-anchor="middle" font-family="sans-serif" font-size="8.5" fill="#cfd8d3">${esc(f.posicao)} · ${f.jogos} J · ${f.gols} G · ${f.assist} A</text><text x="80" y="226" text-anchor="middle" font-family="sans-serif" font-size="7.5" fill="#E3B341">${esc(f.legenda.slice(0, 34))}</text></svg>`;
}
function albumHtml(s: Save): string {
  const album = albumDe(s.carreira);
  if (!album.length) return `<p class="rotulo">Álbum de figurinhas</p><p class="sub">A primeira figurinha sai no fim da primeira temporada como profissional. Momentos grandes (capitão, seleção, título) ganham figurinha especial.</p>`;
  const ord = [...album].sort((a, b) => a.ano - b.ano || a.tipo.localeCompare(b.tipo));
  const cont = (r: string) => album.filter((f) => f.raridade === r).length;
  return `<p class="rotulo">Álbum de figurinhas · ${album.length}</p><p class="sub">${(["lenda", "brilhante", "prata", "comum"] as const).filter((r) => cont(r)).map((r) => `${cont(r)} ${NOME_RARIDADE[r].toLowerCase()}`).join(" · ")}</p>
    <div class="album">${ord.map((f) => `<div class="fig ${f.raridade}"><span class="fig-tag">${esc(NOME_TIPO_FIG[f.tipo])}</span>${figurinhaSvg(f)}</div>`).join("")}</div>`;
}
function abaJogador(s: Save): string {
  const j = s.jogador, c = s.carreira, st = c.stats;
  const visual = blocoVisual(s);
  const media = st.notas.length ? (st.notas.reduce((a, b) => a + b, 0) / st.notas.length).toFixed(2) : "–";
  const grupos: [string, Grupo][] = [["Físico", "fisico"], ["Técnico", "tecnico"], ["Tático", "tatico"]];
  const sub = `<div class="sub-abas">${([["atributos", "Atributos"], ["clube", "Clube"], ["saude", "Saúde"], ["negocios", "Negócios"], ["dinheiro", "Dinheiro"], ["visual", "Visual"]] as const).map(([k, n]) => `<button class="${subJogador === k ? "ativo" : ""}" data-subjog="${k}">${n}</button>`).join("")}</div>`;
  const msg = msgJog ? `<p class="msg-mercado ${msgJog.ok ? "ok" : "nao"}">${esc(msgJog.texto)}</p>` : "";
  msgJog = undefined;
  if (subJogador === "visual") return sub + visual;
  if (subJogador === "clube") return sub + msg + blocoClube(s);
  if (subJogador === "dinheiro") return sub + blocoPatrocinios(s) + blocoVida(s);
  if (subJogador === "saude") return sub + msg + blocoSaude(s);
  if (subJogador === "negocios") return sub + msg + blocoNegocios(s);
  return `${sub}${blocoPosicoes(s)}<p class="rotulo" style="margin-top:16px">Atributos · olheiros veem potencial ${j.faixaPot[0]}–${j.faixaPot[1]}</p>
    ${grupos.map(([n, g]) => `<p class="sub" style="margin:10px 0 6px;font-weight:600">${n}</p><div class="atrs">${ATRIBUTOS.filter((a) => GRUPO[a] === g).map((a) => barra(NOME_AT[a], j.at[a], 99, "#E3B341", j.at[a].toFixed(0))).join("")}</div>`).join("")}
    <p class="rotulo" style="margin-top:16px">Temporada</p>
    <div class="kv" style="margin-top:6px"><span>Jogos no profissional</span><b>${st.jogos} (${st.titular} como titular)</b><span>Gols / assistências</span><b>${st.gols} / ${st.assist}</b><span>Nota média</span><b>${media}</b><span>Jogos na base</span><b>${st.base} (${st.baseGols} gols)</b><span>Contrato</span><b>${c.formacao ? "Base" : "Profissional"} · ${c.anosContrato} ${c.anosContrato === 1 ? "ano" : "anos"}</b><span>Salário líquido</span><b>${dinheiro(salarioLiquido(c))}/mês</b></div>
    ${c.historico.length ? `<p class="rotulo" style="margin-top:16px">Carreira</p><table><thead><tr><th>Ano</th><th>Clube</th><th class="n">OVR</th><th class="n">J</th><th class="n">G</th><th class="n">Nota</th></tr></thead><tbody>${c.historico.map((h) => `<tr><td>${h.ano}</td><td>${esc(h.clube)}</td><td class="n">${h.ovr}</td><td class="n">${h.jogos}</td><td class="n">${h.gols}</td><td class="n">${h.nota || "–"}</td></tr>`).join("")}</tbody></table>` : ""}`;
}

// ------------------------------------------------------------------ mercado
const milhoes = (euros: number) => `€ ${(euros / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
const NOME_TIPO: Record<PropostaSave["tipo"], string> = { transferencia: "Transferência", livre: "Sem custo", emprestimo: "Empréstimo", renovacao: "Renovação" };
// ------------------------------------------------------------------ janela de transferências do mundo
let vistaMercado: "eu" | "mundo" = "eu", janelaVista: string | undefined, filtroJanela: "todas" | "liga" | "clube" | "base" | "aposentadorias" | "livres" | "tecnicos" | "lesoes" = "todas";
const NOME_NEGOCIO: Record<Negocio["tipo"], string> = { transferencia: "", livre: "Livre", exterior: "", base: "Subiu da base", aposentadoria: "Aposentou" };
function janelaHtml(s: Save): string {
  const c = s.carreira, anos = janelasFeitas(pacote);
  const filtros: [typeof filtroJanela, string][] = [["todas", "Maiores"], ["liga", infoLiga(c.ligaId).curto], ["clube", "Meu clube"], ["base", "Da base"], ["aposentadorias", "Aposentadorias"], ["livres", "Agentes livres"], ["tecnicos", "Técnicos"], ["lesoes", "Lesões"]];
  const chipsFiltro = `<div class="chips" style="flex-wrap:wrap;margin:8px 0">${filtros.map(([k, n]) => `<button class="chip${filtroJanela === k ? " ativo" : ""}" data-fjanela="${k}">${esc(n)}</button>`).join("")}</div>`;
  const clube = (id?: string, fora = "Estava sem clube") => id ? `<span class="neg-clube">${escudo(id)}<span>${esc(nomeDe(id))}</span></span>` : `<span class="neg-clube sub">${fora}</span>`;
  if (filtroJanela === "livres") {
    const al = agentesLivres(pacote);
    return `${chipsFiltro}<p class="sub" style="margin-bottom:8px">${al.length ? `${al.length} jogadores sem clube: dispensados, fim de contrato, garotos que não subiram. Contratar um deles não custa taxa.` : "Ninguém sem clube ainda: o banco de agentes livres começa a encher na primeira janela."}</p>
      ${al.slice(0, 40).map((x) => `<div class="negocio"><div class="neg-topo"><button class="nome-hist" data-hist="${esc(x.nome)}"><b>${esc(x.nome)}</b></button><span class="neg-valor">Livre</span></div><small class="sub">${esc(NOME_POS[x.posicao] ?? "Goleiro")} · ${x.idade} anos · OVR ${x.ovr}</small><div class="neg-rota">${clube(x.de)} <span class="sub">· último clube, sem clube desde ${ANO_INICIAL + x.desde}</span></div></div>`).join("")}${al.length > 40 ? `<p class="sub" style="margin-top:6px">E mais ${al.length - 40}.</p>` : ""}`;
  }
  if (filtroJanela === "tecnicos") {
    const w = mundo(pacote), linhas = anos.length ? anos.filter((a) => !a.meio).slice(0, 3).flatMap((a) => trocasDeTecnicoEm(pacote, a.t)) : [];
    const meu = c.tecnico;
    return `${chipsFiltro}${meu ? `<div class="negocio meu"><div class="neg-topo"><b>${esc(meu.nome)}</b><span class="neg-valor">${esc(NOME_ESTILO[meu.estilo][0])}</span></div><small class="sub">Seu técnico no ${esc(nomeDe(c.clubeId))} · ${meu.idade} anos · desde ${ANO_INICIAL + meu.desde} · ${esc(NOME_ESTILO[meu.estilo][1])}</small></div>` : ""}
      ${linhas.length ? [...linhas].sort((a, b) => b.t - a.t || (w.clube[b.clubeId]?.forca ?? 0) - (w.clube[a.clubeId]?.forca ?? 0)).slice(0, 40).map((x) => `<div class="negocio"><div class="neg-topo"><span class="neg-clube">${escudo(x.clubeId)}<b>${esc(nomeDe(x.clubeId))}</b></span><span class="neg-valor">${ANO_INICIAL + x.t}</span></div><small class="sub">Sai ${esc(x.saiu ?? "–")}${x.motivo === "aposentou" ? " (aposentado)" : x.motivo === "levado" ? " (levado por um clube maior)" : " (demitido)"} · chega ${esc(x.entrou)}${x.de ? ` (do ${esc(nomeDe(x.de))})` : ""}</small></div>`).join("") : `<p class="sub">A dança dos técnicos começa na virada da temporada.</p>`}`;
  }
  if (filtroJanela === "lesoes") {
    const rod = c.semana - SEMANAS_PRE, ls = lesoesDaTemporada(pacote).filter((x) => x.fim > rod && x.ini <= rod + 2).sort((a, b) => b.ovr - a.ovr).slice(0, 40);
    return `${chipsFiltro}<p class="sub" style="margin-bottom:8px">Lesões graves no mundo agora (e as que vêm nas próximas rodadas). Quem fica fora não joga, não soma números e perde terreno nos prêmios.</p>
      ${ls.map((x) => `<div class="negocio${x.clubeId === c.clubeId ? " meu" : ""}"><div class="neg-topo"><button class="nome-hist" data-hist="${esc(x.nome)}"><b>${esc(x.nome)}</b></button><span class="neg-valor">${x.fim - Math.max(rod, x.ini)} sem.</span></div><small class="sub">${esc(nomeDe(x.clubeId))} · OVR ${x.ovr} · ${esc(x.tipo)} · fora das rodadas ${x.ini + 1} a ${x.fim}</small></div>`).join("") || `<p class="sub">Ninguém machucado agora.</p>`}`;
  }
  if (!anos.length) return `${chipsFiltro}<p class="sub">A primeira janela do mundo abre na virada da temporada: transferências, reforços, garotos que sobem da base e aposentadorias aparecem aqui.</p>`;
  const chave = (x: { t: number; meio: boolean }) => `${x.t}${x.meio ? "m" : ""}`;
  const sel = anos.find((x) => chave(x) === janelaVista) ?? anos[0], t = sel.t;
  const lid = infoLiga(c.ligaId).id, naLiga = (id?: string) => !!id && mundo(pacote).info[id]?.ligaId === lid;
  const todos = janelaDoMundo(pacote, t, sel.meio);
  const lista = todos.filter((x) => filtroJanela === "todas" ? x.tipo === "transferencia" || x.tipo === "exterior"
    : filtroJanela === "liga" ? (naLiga(x.de) || naLiga(x.para)) && x.tipo !== "aposentadoria" && x.tipo !== "base"
    : filtroJanela === "clube" ? x.de === c.clubeId || x.para === c.clubeId
    : filtroJanela === "base" ? x.tipo === "base" : x.tipo === "aposentadoria");
  const ordenada = filtroJanela === "base" || filtroJanela === "aposentadorias" ? [...lista].sort((a, b) => b.ovr - a.ovr) : lista;
  const total = todos.filter((x) => x.taxa > 0).reduce((a, x) => a + x.taxa, 0);
  const linha = (x: Negocio) => `<div class="negocio${x.de === c.clubeId || x.para === c.clubeId ? " meu" : ""}">
      <div class="neg-topo"><button class="nome-hist" data-hist="${esc(x.nome)}"><b>${esc(x.nome)}</b></button><span class="neg-valor">${x.taxa ? dinheiro(x.taxa) : esc(NOME_NEGOCIO[x.tipo])}</span></div>
      <small class="sub">${esc(NOME_POS[x.posicao] ?? "Goleiro")} · ${x.idade} anos · OVR ${x.ovr}</small>
      <div class="neg-rota">${x.tipo === "aposentadoria" ? `${clube(x.de)} <span class="sub">· último clube</span>` : x.tipo === "base" ? `${clube(x.para)} <span class="sub">· sobe para o profissional</span>` : `${clube(x.de)}<span class="seta">→</span>${clube(x.para)}`}</div></div>`;
  return `<div class="chips" style="flex-wrap:wrap">${anos.slice(0, 6).map((a) => `<button class="chip${a === sel ? " ativo" : ""}" data-janela="${chave(a)}">${a.meio ? "Meio de" : "Início de"} ${ANO_INICIAL + a.t}</button>`).join("")}</div>
    <p class="sub" style="margin:8px 0">${todos.filter((x) => x.tipo === "transferencia").length} transferências entre clubes · ${dinheiro(total)} movimentados · ${todos.filter((x) => x.tipo === "aposentadoria").length} aposentadorias</p>
    ${chipsFiltro}
    ${ordenada.length ? ordenada.slice(0, 40).map(linha).join("") : `<p class="sub">Nada nesta janela.</p>`}${ordenada.length > 40 ? `<p class="sub" style="margin-top:6px">E mais ${ordenada.length - 40}.</p>` : ""}`;
}
function abaMercado(s: Save): string {
  const chips = `<div class="chips" style="margin-bottom:12px"><button class="chip${vistaMercado === "eu" ? " ativo" : ""}" data-vmerc="eu">Minha carreira</button><button class="chip${vistaMercado === "mundo" ? " ativo" : ""}" data-vmerc="mundo">Janela do mundo</button></div>`;
  return chips + (vistaMercado === "mundo" ? janelaHtml(s) : abaMercadoEu(s));
}
const rotuloDaSemanaAbs = (abs: number) => { const t = Math.floor(abs / SEMANAS_TEMPORADA), sem = abs % SEMANAS_TEMPORADA; return `semana ${sem + 1} de ${ANO_INICIAL + t}`; };
/** Cláusulas da proposta e o que dá para pedir (cada pedido gasta a paciência da diretoria). */
/** Escalação 4-3-3 desenhada: onde você entra no time (titular, rodízio ou banco). */
const XY_POS: Record<string, [number, number][]> = { ZAG: [[38, 76], [62, 76]], LAT: [[14, 70], [86, 70]], VOL: [[50, 58]], MEI: [[32, 48], [68, 48]], PON: [[16, 24], [84, 24]], ATA: [[50, 18]] };
function escalacaoPapel(pos: string, papel: "titular" | "rotacao" | "reserva", cor: string): string {
  const todos: [number, number][] = [[50, 90], [14, 70], [38, 76], [62, 76], [86, 70], [50, 58], [32, 48], [68, 48], [16, 24], [50, 18], [84, 24]];
  const meu = (XY_POS[pos] ?? [[50, 48]])[0], noTime = papel !== "reserva";
  const bolas = todos.map(([x, y]) => (x === meu[0] && y === meu[1] && noTime) ? "" : `<circle cx="${x}" cy="${y * 1.1}" r="4.2" fill="#ffffff55"/>`).join("");
  const eu = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${cor}" stroke="#FFF" stroke-width="1.6"/><text x="${x}" y="${y + 2.6}" text-anchor="middle" font-size="7" font-weight="900" fill="#FFF" paint-order="stroke" stroke="#0008" stroke-width="1.5">EU</text>`;
  const banco = `<rect x="104" y="30" width="22" height="60" rx="4" fill="#00000033" stroke="#ffffff33"/><text x="115" y="26" text-anchor="middle" font-size="6" fill="#ffffffaa">BANCO</text>${[0, 1, 2, 3].map((i) => `<circle cx="115" cy="${40 + i * 13}" r="3.6" fill="#ffffff44"/>`).join("")}`;
  const meuXY: [number, number] = noTime ? [meu[0], meu[1] * 1.1] : [115, 40];
  return `<svg class="esc-papel" viewBox="0 0 130 104" role="img" aria-label="${NOME_PAPEL[papel]}"><rect x="2" y="2" width="96" height="100" rx="4" fill="#2E7D4F"/><g fill="none" stroke="#ffffff66" stroke-width=".8"><rect x="2" y="2" width="96" height="100" rx="4"/><path d="M2 52 H98"/><circle cx="50" cy="52" r="10"/><rect x="30" y="86" width="40" height="16"/><rect x="30" y="2" width="40" height="16"/></g>
    ${bolas}${banco}${papel === "rotacao" ? `<path d="M${meu[0] + 7} ${meu[1] * 1.1} Q 102 ${meu[1] * 1.1} 112 44" fill="none" stroke="#E3B341" stroke-width="1.2" stroke-dasharray="2 2"/>${eu(meuXY[0], meuXY[1])}<circle cx="115" cy="40" r="5" fill="none" stroke="#E3B341" stroke-dasharray="2 1.5"/>` : eu(meuXY[0], meuXY[1])}</svg>`;
}
/** Contrato atual × proposta, linha a linha, com seta de melhor/pior. */
function comparaContrato(linhas: [string, string, number, string, number][]): string {
  return `<div class="compara"><div class="cmp-cab"><span></span><small>Hoje</small><small>Proposta</small></div>${linhas.map(([nome, a, va, b, vb]) => {
    const d = vb - va, cls = Math.abs(d) < 1e-9 ? "igual" : d > 0 ? "pos" : "neg";
    return `<div class="cmp-linha"><span>${esc(nome)}</span><b class="cmp-a">${a}</b><b class="cmp-b ${cls}">${b}<i>${cls === "igual" ? "=" : d > 0 ? "▲" : "▼"}</i></b></div>`;
  }).join("")}</div>`;
}
function clausulasHtml(p: PropostaSave): string {
  if (save) comClausulas(pacote, save, p);
  const pac = p.paciencia ?? 0, pedidos = p.pedidos ?? [];
  const itens = (Object.keys(NOME_ITEM) as (keyof typeof NOME_ITEM)[]).filter((k) => !pedidos.includes(k));
  return `<div class="kv clausulas"><span>Multa rescisória</span><b>€ ${((p.multa ?? 0) / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi</b>${p.pctVenda ? `<span>Da venda futura</span><b>${p.pctVenda}% para você</b>` : ""}<span>Bônus por gol</span><b>${p.bonusGol ? dinheiro(p.bonusGol) : "–"}</b><span>Bônus por título</span><b>${p.bonusTitulo ? dinheiro(p.bonusTitulo) : "–"}</b></div>
    <details class="dobra negociar"${pedidos.length ? " open" : ""}><summary class="rotulo">Negociar · paciência da diretoria ${"●".repeat(Math.max(0, pac))}${"○".repeat(Math.max(0, 4 - pac))}</summary>
    ${pac > 0 ? `<div class="chips" style="flex-wrap:wrap">${itens.map((k) => `<button class="chip" data-negoc="${p.id}" data-item="${k}" title="${esc(NOME_ITEM[k][1])}">${esc(NOME_ITEM[k][0])}</button>`).join("")}</div><p class="sub">Cada pedido que não colar gasta paciência. Quando acaba, é pegar ou largar${p.tipo === "renovacao" ? "" : ", e o clube pode desistir"}.</p>` : `<p class="sub">A diretoria encerrou a conversa: é pegar ou largar.</p>`}</details>`;
}
function abaMercadoEu(s: Save): string {
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
      : `<button class="botao" data-prop="${p.id}" data-op="aceitar">${p.tipo === "renovacao" ? "Renovar" : p.tipo === "emprestimo" ? "Aceitar o empréstimo" : "Aceitar"}</button><button class="botao sec" data-prop="${p.id}" data-op="recusar">Recusar</button>`;
    return `<div class="oferta" style="--c1:${info.cores[0].toUpperCase() === "#FFFFFF" ? info.cores[1] : info.cores[0]}"><div class="faixa"></div><div class="corpo">
      <div style="display:flex;gap:10px;align-items:center">${escudo(p.clubeId)}<div><h2 style="margin:0">${esc(info.nome)}</h2><span class="sub">${esc(infoLiga(p.ligaId).curto)} · ${esc(info.cidade)} · força ${Math.round(cl.forca)} · ${esc(NOME_CULTURA[culturaBase(p.clubeId)].toLowerCase())}</span></div></div>
      <div class="prop-vis">${escalacaoPapel(j.posicao, p.papel, info.cores[0].toUpperCase() === "#FFFFFF" ? info.cores[1] : info.cores[0])}<div class="pv-lado"><span class="tag ${p.papel === "titular" ? "titular" : p.papel === "rotacao" ? "banco" : "ruim"}">${NOME_TIPO[p.tipo]}</span><b class="pv-papel">${NOME_PAPEL[p.papel]}</b><small class="sub">${p.papel === "titular" ? "Entra no time de cara" : p.papel === "rotacao" ? "Reveza com o titular" : "Começa no banco"}</small></div></div>
        ${comparaContrato([
          ["Salário/mês", dinheiroCurto(c.salario), c.salario, dinheiroCurto(p.salario), p.salario],
          ["Anos", String(c.anosContrato), c.anosContrato, p.anos ? String(p.anos) : "½", p.anos || 0.5],
          ["Força do time", String(Math.round(meu.forca)), meu.forca, String(Math.round(cl.forca)), cl.forca],
          ["Papel", NOME_PAPEL[papel], ["reserva", "rotacao", "titular"].indexOf(papel), NOME_PAPEL[p.papel], ["reserva", "rotacao", "titular"].indexOf(p.papel)],
        ])}
      ${p.luvas || p.taxa ? `<div class="kv">${p.luvas ? `<span>Luvas</span><b>${dinheiro(p.luvas)}</b>` : ""}${p.taxa ? `<span>Pagam ao ${esc(meu.nome)}</span><b>${milhoes(p.taxa)}</b>` : ""}</div>` : ""}
      ${p.tipo !== "emprestimo" ? clausulasHtml(p) : ""}
      ${p.pagaMulta ? `<p class="sub" style="color:var(--pos)">Eles pagam a sua multa rescisória: o ${esc(meu.nome)} não pode segurar.</p>` : p.travada ? `<p class="sub" style="color:var(--neg)">O ${esc(meu.nome)} não quer vender. Forçar a saída desgasta a relação com o técnico e com a torcida.</p>` : ""}
      <div class="ferr-botoes">${botoes}</div></div></div>`;
  };
  const props = m.propostas.length ? `<div class="ofertas">${m.propostas.map(card).join("")}</div>` : `<p class="sub">${jan ? "Nenhuma proposta por enquanto. Elas chegam ao longo da janela; jogar bem e ter um bom agente ajudam." : "Fora da janela de transferências. Jogue bem: os clubes estão olhando."}</p>`;
  const agentes = (Object.keys(AGENTE_INFO) as TipoAgente[]).map((t) => {
    const a = AGENTE_INFO[t], atual = c.agente === t, pode = podeContratarAgente(s, t), alcance = AGENTES[t].ligas === "todas" ? "Todas as ligas" : alcanceCurto(AGENTES[t].ligas as string[]);
    return `<div class="agente${atual ? " atual" : ""}"><div><b>${esc(a.nome)}</b> <span class="sub">· ${esc(a.quem)}</span><p class="sub" style="margin:2px 0">${esc(a.texto)}</p><small class="sub">Alcance: ${esc(alcance)}</small></div>
      ${atual ? `<span class="tag titular">Seu agente</span>` : `<button class="botao sec peq" data-agente="${t}" ${pode.ok ? "" : "disabled"} title="${esc(pode.msg)}">Contratar</button>${pode.ok ? "" : `<small class="sub">${esc(pode.msg)}</small>`}`}</div>`;
  }).join("");
  const hist = m.transferencias.length ? `<p class="rotulo" style="margin-top:16px">Transferências</p><div class="kv">${m.transferencias.map((t) => `<span>${2026 + t.temporada}</span><b>${esc(nomeDe(t.de))} → ${esc(nomeDe(t.para))}${t.tipo === "emprestimo" ? " (empréstimo)" : t.taxa ? ` · ${milhoes(t.taxa)}` : t.tipo === "livre" ? " (de graça)" : ""}</b>`).join("")}</div>` : "";
  const sc = m.semClube;
  const semClube = sc ? `<section class="painel" style="border-color:var(--ouro);margin-bottom:12px"><p class="rotulo" style="color:var(--ouro)">Agente livre</p>
      <p style="margin:4px 0">Você está sem clube desde ${esc(rotuloDaSemanaAbs(sc.desde))}. Último clube: <b>${esc(nomeDe(sc.ultimo))}</b>, último salário ${dinheiro(sc.salario)}/mês.</p>
      <p class="sub">Pode assinar a qualquer momento, sem taxa. Quanto mais tempo parado, menos propostas chegam, os salários caem e a moral sofre. Você treina sozinho e não joga.</p>
      ${(sc.oferecendoAte ?? -1) >= semanaAbsJogo(c) ? `<p class="sub" style="color:var(--ouro-claro)">O agente está oferecendo você aos clubes.</p>` : `<button class="botao peq" data-acao="oferecer" style="margin-top:8px">Pedir ao agente para me oferecer</button>`}</section>` : "";
  return `${aviso}${semClube}${sc ? "" : `<p class="rotulo">Seu contrato</p>${contrato}`}
    <p class="rotulo" style="margin-top:16px">Propostas</p>${props}
    <p class="rotulo" style="margin-top:16px">Agente</p><div style="display:flex;flex-direction:column;gap:8px">${agentes}</div>${hist}
    <p class="sub" style="margin-top:12px">Janelas: semanas ${JANELAS.map((x) => `${x.ini + 1}–${x.fim + 1}`).join(" e ")} de cada temporada.</p>`;
}

let casualMini: string | undefined;
function imgNoticia(s: Save, n: Noticia, i: number): string {
  const img = n.img;
  if (img?.k === "transferencia" && s.noticias.findIndex((x) => x.img?.k === "transferencia") === i) return `<div class="noticia-img grande">${anuncioDe(s, n)}</div>`;
  const ci = (id: string) => { const c = infoClube(pacote, id); return [c.cores[0], c.cores[1] ?? "#FFFFFF"] as [string, string]; };
  if (img?.k === "placar") return miniNoticia({ k: "placar", casa: ci(img.casa), fora: ci(img.fora), gc: img.gc, gf: img.gf, idCasa: idClube(img.casa), idFora: idClube(img.fora), nomeCasa: infoClube(pacote, img.casa).nome, nomeFora: infoClube(pacote, img.fora).nome });
  if (img?.k === "transferencia") return miniNoticia({ k: "transferencia", cores: ci(img.clube), corpoSvg: corpoDe(s, "jogo", img.clube) });
  if (img?.k === "patrocinio" && MARCA[img.marca]) return miniNoticia({ k: "patrocinio", logoSvg: logoSvg(MARCA[img.marca]), cor: MARCA[img.marca].cores[2] });
  if (img?.k === "trofeu") return miniNoticia({ k: "trofeu" });
  if (img?.k === "capa") return `<div class="noticia-img grande">${capaDe(s, img.edicao, img.clube, !!img.regional)}</div>`;
  if (img?.k === "vida" || img?.k === "tatuagem") return miniNoticia({ k: "vida", corpoSvg: casualMini ??= corpoDe(s, "casual") });
  const t = n.titulo + " " + n.texto;
  if (/[Rr]ival|[Dd]uelo/.test(t) && s.carreira.rival) return miniNoticia({ k: "rival", cores: ci(s.carreira.clubeId), outro: ci(s.carreira.rival.clubeId) });
  if (/[Tt]orcida|[Ff]aixa|[Mm]úsica|[Aa]pelido|[Pp]rotesto|aeroporto/.test(t)) return miniNoticia({ k: "torcida", cores: ci(s.carreira.clubeId), nivel: s.carreira.torcida ?? 50 });
  if (/[Cc]ampeã|[Tt]aça|[Tt]ítulo/.test(n.titulo) && n.titulo.includes(infoClube(pacote, s.carreira.clubeId).nome)) return miniNoticia({ k: "trofeu" });
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
const tile = (valor: string, rotulo: string, icone?: string) => `<div class="tile${icone ? " com-ico" : ""}">${icone ? `<i aria-hidden="true">${icone}</i>` : ""}<b>${valor}</b><span>${rotulo}</span></div>`;
/** Barras de gols (dourado) e assistências (verde) por temporada. */
function barrasCarreira(hist: { ano: number; jogos: number; gols: number; assist: number; titulo?: boolean }[]): string {
  const h = hist.filter((x) => x.jogos > 0).slice(-14);
  if (h.length < 2) return "";
  const max = Math.max(4, ...h.map((x) => x.gols + x.assist)), W = 340, H = 120, bw = Math.min(26, (W - 10) / h.length - 4);
  const barras = h.map((x, i) => {
    const cx = 6 + i * ((W - 10) / h.length) + ((W - 10) / h.length - bw) / 2, hg = (x.gols / max) * (H - 34), ha = (x.assist / max) * (H - 34), base = H - 18;
    return `<rect x="${cx.toFixed(1)}" y="${(base - hg).toFixed(1)}" width="${bw.toFixed(1)}" height="${hg.toFixed(1)}" rx="3" fill="#E3B341"><title>${x.ano}: ${x.gols} gols</title></rect>
      <rect x="${cx.toFixed(1)}" y="${(base - hg - ha).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, ha - 1).toFixed(1)}" rx="3" fill="#74D394"><title>${x.ano}: ${x.assist} assistências</title></rect>
      ${hg >= 14 ? `<text x="${(cx + bw / 2).toFixed(1)}" y="${(base - hg + 12).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="#1A1A1A">${x.gols}</text>` : ""}${ha >= 14 ? `<text x="${(cx + bw / 2).toFixed(1)}" y="${(base - hg - ha + 12).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="800" fill="#123">${x.assist}</text>` : ""}
      <text x="${(cx + bw / 2).toFixed(1)}" y="${H - 5}" text-anchor="middle" font-size="9" fill="#A3B6AD">${String(x.ano).slice(2)}</text>`;
  }).join("");
  return `<div class="barras-car"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gols e assistências por temporada">${barras}</svg><small><i style="background:#E3B341"></i>Gols <i style="background:#74D394"></i>Assistências</small></div>`;
}
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
      <div class="tiles">${tile(String(t.jogos), "Jogos", "🏟️")}${tile(String(t.gols), "Gols", "⚽")}${tile(String(t.assist), "Assistências", "👟")}${tile(t.nota ? t.nota.toFixed(2) : "–", "Nota média", "⭐")}${tile(String(t.titulos.length), "Títulos", "🏆")}${tile(String(t.premios.length), "Prêmios", "🌟")}</div>
      ${(() => { const soma = (k: "mvp" | "selRodada" | "selMes") => c.historico.reduce((a, h) => a + (h[k] ?? 0), 0) + (c.stats[k] ?? 0); return `<div class="tiles">${tile(String(soma("mvp")), "Melhor em campo", "🥇")}${tile(String(soma("selRodada")), "Seleção da rodada", "📋")}${tile(String(soma("selMes")), "Seleção do mês", "🗓️")}</div>`; })()}
      ${barrasCarreira(hist)}

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
      <div class="barras">${barra(`Torcida · ${rotuloTorcida(torc)}`, torc, 100, "#74D394")}${barra(`Técnico${c.tecnico ? ` ${c.tecnico.nome}` : ""} · ${rotuloTecnico(c.relTecnico)}`, c.relTecnico, 100, "#B9A3E8")}${barra(`Mundo · ${rotuloFama(c.fama)}`, c.fama, 100, "#E3B341")}</div>

      <p class="rotulo">Clubes</p>
      <div class="lista-clubes">${clubes.map((k) => { const id = idClube(k); return `<div class="linha-clube">${id ? escudo(id) : ""}<div><b>${esc(k.clube)}</b><small>${k.de === k.ate ? k.de : `${k.de}–${k.ate}`}</small></div><span>${k.jogos} j · ${k.gols} g · ${k.assist} a${k.titulos ? ` · 🏆 ${k.titulos}` : ""}</span></div>`; }).join("") || `<p class="sub">Ainda na base.</p>`}</div>

      ${recordesHtml(s)}

      <p class="rotulo">Armário de troféus</p>
      ${arm.length ? `<div class="armario">${arm.map((x) => `<button class="trofeu-cel${trofeuAberto === x.nome ? " ativo" : ""}" data-trofeu="${esc(x.nome)}" aria-expanded="${trofeuAberto === x.nome}"><svg viewBox="-13 -30 26 32" aria-hidden="true">${trofeuSvg(0, 0, x.modelo, x.cores)}</svg><b>${x.vezes.length}×</b><small>${esc(x.nome)}</small></button>`).join("")}</div>
        ${aberto ? `<div class="trofeu-detalhe"><b>${esc(aberto.nome)}</b>${[...aberto.vezes].sort((a, b) => b.ano - a.ano).map((v) => `<div><span>${v.ano}</span>${esc(v.clube)}${v.liga ? ` · <small>${esc(v.liga)}</small>` : ""}</div>`).join("")}</div>` : `<p class="sub">Toque num troféu para ver as temporadas.</p>`}` : `<p class="sub">Nenhum ainda. A estante da casa está esperando.</p>`}

      ${armarioCamisas(s)}
      ${(c.capas ?? []).length ? `<p class="rotulo">Capas de videogame</p><div class="capas">${c.capas!.map((x) => `<div class="capa-cel">${capaDe(s, x.edicao, x.clube, x.regional)}</div>`).join("")}</div>` : ""}

      ${evolucaoHtml(s)}
      ${linhaDaVidaHtml(s)}
      ${albumHtml(s)}
      <p class="rotulo">Temporada a temporada <small>(toque no ano para ver a retrospectiva)</small></p>
      <table><thead><tr><th>Ano</th><th>Clube</th><th class="n">OVR</th><th class="n">J</th><th class="n">G</th><th class="n">A</th><th class="n">Nota</th></tr></thead><tbody>${hist.map((h) => `<tr><td>${c.historico.includes(h) ? `<button class="nome-hist" data-retro="${h.ano}">${h.ano}</button>` : h.ano}</td><td>${esc(h.clube)}${h.titulo ? " 🏆" : ""}${(h as { parcial?: boolean }).parcial ? " <small class=\"sub\">(até a troca)</small>" : ""}</td><td class="n">${h.ovr}</td><td class="n">${h.jogos}</td><td class="n">${h.gols}</td><td class="n">${h.assist}</td><td class="n">${h.nota ? h.nota.toFixed(1) : "–"}</td></tr>`).join("")}</tbody></table>
    </div>`;
}
// ------------------------------------------------------------------ evolução da carreira (gráfico no perfil)
type MetricaEvo = "ovr" | "valor" | "salario" | "fama" | "seguidores";
let metricaEvo: MetricaEvo = "ovr";
const METRICAS: [MetricaEvo, string][] = [["ovr", "OVR"], ["valor", "Valor"], ["salario", "Salário"], ["fama", "Fama"], ["seguidores", "Seguidores"]];
/** Um ponto por ano (a passagem de meia temporada fica de fora; vale a linha do fim do ano) e o "agora". */
function pontosEvolucao(s: Save, m: MetricaEvo): { rot: string; v: number; agora?: boolean }[] {
  const c = s.carreira, j = s.jogador, porAno = new Map<number, ResumoTemporada>();
  for (const h of c.historico) if (!h.parcial) porAno.set(h.ano, h);
  const pts = [...porAno.values()].map((h) => ({ rot: String(h.ano), v: m === "ovr" ? h.ovr : h[m] })).filter((x): x is { rot: string; v: number } => typeof x.v === "number");
  const fl = mundo(pacote).liga[infoLiga(c.ligaId).id]?.fLiga ?? 0.6;
  const agora = { ovr: Math.round(ovr(j)), valor: Math.round(valorMercado(ovr(j), j.idade, Math.max(1, c.anosContrato), fl)), salario: c.salario, fama: Math.round(c.fama), seguidores: c.seguidores }[m];
  return [...pts, { rot: "Agora", v: agora, agora: true }];
}
const fmtEvo = (m: MetricaEvo, v: number) => m === "valor" || m === "salario" ? dinheiroCurto(v) : m === "seguidores" ? compacto(v) : String(Math.round(v));
function dinheiroCurto(v: number): string {
  const a = Math.abs(v), n = a >= 1e9 ? `${(v / 1e9).toFixed(1)} bi` : a >= 1e6 ? `${(v / 1e6).toFixed(a >= 1e7 ? 0 : 1)} mi` : a >= 1e3 ? `${Math.round(v / 1e3)} mil` : String(Math.round(v));
  return `R$ ${n.replace(".", ",")}`;
}
function evolucaoHtml(s: Save): string {
  const pts = pontosEvolucao(s, metricaEvo);
  const chips = `<div class="chips evo-chips">${METRICAS.map(([k, n]) => `<button class="chip${metricaEvo === k ? " ativo" : ""}" data-evo="${k}">${n}</button>`).join("")}</div>`;
  if (pts.length < 2) return `<p class="rotulo">Evolução</p>${chips}<p class="sub">O gráfico começa a aparecer depois da primeira temporada fechada${metricaEvo !== "ovr" ? " (esse número passou a ser guardado agora)" : ""}.</p>`;
  const W = 340, H = 170, e = 40, d = 14, t = 16, b = 26, vs = pts.map((p) => p.v);
  let lo = Math.min(...vs), hi = Math.max(...vs);
  if (metricaEvo === "ovr" || metricaEvo === "fama") { lo = Math.max(0, Math.floor((lo - 3) / 5) * 5); hi = Math.min(100, Math.ceil((hi + 3) / 5) * 5); }
  else { lo = Math.min(0, lo); hi = hi > lo ? hi * 1.08 : lo + 1; }
  const x = (i: number) => e + (i * (W - e - d)) / (pts.length - 1), y = (v: number) => t + (1 - (v - lo) / (hi - lo || 1)) * (H - t - b);
  const linha = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
  const area = `${linha} L${x(pts.length - 1).toFixed(1)} ${H - b} L${e} ${H - b} Z`;
  const passo = Math.ceil(pts.length / 6), imax = vs.indexOf(Math.max(...vs));
  const grade = [0, 0.5, 1].map((f) => { const v = lo + f * (hi - lo); return `<line x1="${e}" x2="${W - d}" y1="${y(v)}" y2="${y(v)}" class="evo-grade"/><text x="${e - 6}" y="${y(v) + 4}" text-anchor="end" class="evo-eixo">${esc(fmtEvo(metricaEvo, v))}</text>`; }).join("");
  const rots = pts.map((p, i) => i % passo === 0 || i === pts.length - 1 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="evo-eixo${p.agora ? " agora" : ""}">${esc(p.agora ? "Agora" : "’" + p.rot.slice(2))}</text>` : "").join("");
  const bolas = pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.v)}" r="${p.agora || i === imax ? 4.5 : 3}" class="${p.agora ? "evo-agora" : i === imax ? "evo-max" : "evo-ponto"}"><title>${esc(p.rot)}: ${esc(fmtEvo(metricaEvo, p.v))}</title></circle>`).join("");
  const pico = pts[imax], ini = pts[0], fim = pts[pts.length - 1], dif = fim.v - ini.v;
  return `<p class="rotulo">Evolução</p>${chips}
    <svg class="evo" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(METRICAS.find((k) => k[0] === metricaEvo)![1])} por temporada">${grade}<path d="${area}" class="evo-area"/><path d="${linha}" class="evo-linha"/>${bolas}${rots}</svg>
    <p class="sub evo-leg">Pico: <b>${esc(fmtEvo(metricaEvo, pico.v))}</b> (${esc(pico.rot)}) · desde ${esc(ini.rot)}: <b class="${dif >= 0 ? "pos" : "neg"}">${dif >= 0 ? "+" : "−"}${esc(fmtEvo(metricaEvo, Math.abs(dif)))}</b></p>`;
}

// ------------------------------------------------------------------ linha da vida (perfil)
type ItemLinha = { ano: number; tipo: TipoMarco | "titulo" | "premio" | "capa" | "nasce" | "fim"; texto: string };
const ICONE_VIDA: Record<ItemLinha["tipo"], string> = { clube: "🏟️", amor: "❤️", filho: "👶", casa: "🏠", recorde: "📈", lesao: "🩹", escandalo: "📰", selecao: "🎽", marco: "⚽", titulo: "🏆", premio: "🌟", capa: "🎮", nasce: "🍼", fim: "👋" };
let vidaAberta = false;
/** Tudo o que marcou a vida do jogador, ano a ano: o que ficou guardado (namoros, casas, transferências...) e o que sai do histórico. */
function itensDaVida(s: Save): ItemLinha[] {
  const c = s.carreira, j = s.jogador, anoAtual = ANO_INICIAL + c.temporada, it: ItemLinha[] = [];
  const pais = PAISES.find((x) => x.id === j.pais);
  it.push({ ano: anoAtual - j.idade, tipo: "nasce", texto: `Nasce ${j.nome.split(" ")[0]}${pais ? `, ${pais.local}` : ""}` });
  const marcos = c.marcos ?? [], temClube = new Set(marcos.filter((m) => m.tipo === "clube").map((m) => m.ano));
  let ant: string | undefined, estreou = false;
  for (const h of c.historico) {
    if (h.clube !== ant && !temClube.has(h.ano)) it.push({ ano: h.ano, tipo: "clube", texto: ant ? `Chega ao ${h.clube}` : `Começa no ${h.clube}${h.fase ? "" : h.base && !h.jogos ? " (base)" : ""}` });
    ant = h.clube;
    if (!estreou && h.jogos > 0 && !h.fase) { estreou = true; it.push({ ano: h.ano, tipo: "marco", texto: "Primeira temporada como profissional" }); }
    for (const p of h.premios ?? []) it.push({ ano: h.ano, tipo: /^Taça|campe/i.test(p) ? "titulo" : "premio", texto: p });
  }
  if (c.selecao?.estreia) it.push({ ano: c.selecao.estreia, tipo: "selecao", texto: "Estreia pela seleção" });
  for (const k of c.capas ?? []) it.push({ ano: k.edicao - 1, tipo: "capa", texto: `Capa do IAFC ${k.edicao}${k.regional ? " (edição regional)" : ""}` });
  for (const f of namoroDe(c).filhos ?? []) it.push({ ano: f.ano, tipo: "filho", texto: `Nasce ${f.nome} · mãe: ${f.mae.split(" ")[0]}` });
  for (const m of marcos) if (!(m.tipo === "filho" && /^Nasceu/.test(m.texto))) it.push(m);
  if (c.encerrada) it.push({ ano: anoAtual, tipo: "fim", texto: "Pendura as chuteiras" });
  const ordem = (t: ItemLinha["tipo"]) => ["nasce", "clube", "marco", "selecao", "amor", "filho", "casa", "lesao", "escandalo", "recorde", "titulo", "premio", "capa", "fim"].indexOf(t);
  return it.sort((a, b) => a.ano - b.ano || ordem(a.tipo) - ordem(b.tipo));
}
function linhaDaVidaHtml(s: Save): string {
  const it = itensDaVida(s), c = s.carreira, anoAtual = ANO_INICIAL + c.temporada;
  const anos = [...new Set(it.map((x) => x.ano))];
  const visiveis = vidaAberta ? anos : anos.slice(-4);
  const clubeDoAno = (a: number) => [...c.historico].reverse().find((h) => h.ano === a)?.clube ?? (a === anoAtual ? infoClube(pacote, c.clubeId).nome : "");
  const bloco = (a: number) => {
    const l = it.filter((x) => x.ano === a), idade = s.jogador.idade - (anoAtual - a), clube = idade >= 14 ? clubeDoAno(a) : "";
    const trof = l.filter((x) => x.tipo === "titulo" || x.tipo === "premio"), outros = l.filter((x) => x.tipo !== "titulo" && x.tipo !== "premio");
    return `<div class="vida-ano"><div class="vida-cab"><b>${a}</b><small>${idade > 0 ? `${idade} anos` : "nascimento"}${clube ? ` · ${esc(clube)}` : ""}</small></div>
      ${outros.map((x) => `<div class="vida-item t-${x.tipo}"><span aria-hidden="true">${ICONE_VIDA[x.tipo]}</span><span>${esc(x.texto)}</span></div>`).join("")}
      ${trof.length ? `<div class="vida-item t-titulo"><span aria-hidden="true">🏆</span><span>${[...trof.filter((x) => x.tipo === "titulo"), ...trof.filter((x) => x.tipo === "premio")].map((x) => esc(x.texto.replace(new RegExp(` ${a}$`), ""))).join(" · ")}</span></div>` : ""}</div>`;
  };
  // fita ilustrada: um ano por coluna, com a cor do clube e os ícones do que aconteceu
  const corDoAno = (a: number) => { const h = [...c.historico].reverse().find((x) => x.ano === a); const id = h?.clubeId ?? (a === anoAtual ? c.clubeId : undefined); return id ? infoClube(pacote, id)?.cores ?? ["#33463D", "#FFFFFF"] : ["#33463D", "#FFFFFF"]; };
  const fita = `<div class="fita-vida" tabindex="0" aria-label="Linha da vida em ícones">${anos.map((a) => {
    const l = it.filter((x) => x.ano === a), [k1, k2] = corDoAno(a), idade = s.jogador.idade - (anoAtual - a);
    const tits = l.filter((x) => x.tipo === "titulo").length, prems = l.filter((x) => x.tipo === "premio").length;
    const icos = [...new Set(l.filter((x) => x.tipo !== "titulo" && x.tipo !== "premio").map((x) => ICONE_VIDA[x.tipo]))];
    return `<div class="fv-ano" title="${esc(l.map((x) => x.texto).join(" · "))}"><div class="fv-icos">${tits ? `<span class="fv-tit">🏆${tits > 1 ? `<b>${tits}</b>` : ""}</span>` : ""}${prems ? `<span class="fv-tit">🌟${prems > 1 ? `<b>${prems}</b>` : ""}</span>` : ""}${icos.map((i) => `<span>${i}</span>`).join("")}</div>
      <div class="fv-faixa" style="background:linear-gradient(90deg,${k1},${k1} 70%,${k2})"></div><b>${String(a).slice(2)}</b><small>${idade > 0 ? idade : "0"}a</small></div>`;
  }).join("")}</div>`;
  return `<p class="rotulo">Linha da vida</p>${fita}<details class="vida-det"><summary>Ver ano a ano</summary><div class="vida">${anos.length > visiveis.length ? `<button class="botao sec peq vida-mais" data-acao="vida-toda">Ver desde o começo (${anos.length - visiveis.length} anos antes)</button>` : ""}${visiveis.map(bloco).join("")}${vidaAberta && anos.length > 4 ? `<button class="botao sec peq vida-mais" data-acao="vida-toda">Mostrar só os últimos anos</button>` : ""}</div></details>`;
}

// ------------------------------------------------------------------ retrospectiva da temporada (abre no fim do ano e pelo perfil)
let retro: { ano: number; passo: number } | undefined;
function abrirRetro(ano: number) {
  if (!save) return;
  retro = { ano, passo: 0 };
  $("telaRetro").innerHTML = retroHtml(save, ano, 0);
  const d = $("dlgRetro") as HTMLDialogElement;
  if (!d.open) d.showModal();
}
function retroHtml(s: Save, ano: number, passo: number): string {
  const c = s.carreira, j = s.jogador, linhas = c.historico.filter((h) => h.ano === ano);
  if (!linhas.length) return `<p class="sub">Sem dados dessa temporada.</p>`;
  const fim = linhas[linhas.length - 1], ant = [...c.historico].reverse().find((h) => h.ano < ano && !h.parcial);
  const soma = (k: "jogos" | "gols" | "assist" | "base" | "mvp" | "selRodada" | "selMes") => linhas.reduce((a, h) => a + (h[k] ?? 0), 0);
  const jogos = soma("jogos"), nota = jogos ? linhas.reduce((a, h) => a + h.nota * h.jogos, 0) / jogos : 0;
  const premios = linhas.flatMap((h) => h.premios ?? []);
  const camp = linhas.flatMap((h) => [h.estadual, h.copa, ...(h.extras ?? [])].filter(Boolean)) as NonNullable<ResumoTemporada["copa"]>[];
  const dlt = (a?: number, b?: number, f: (v: number) => string = (v) => String(Math.round(v))) => a === undefined || b === undefined || Math.round(a) === Math.round(b) ? "" : `<span class="retro-delta ${a - b >= 0 ? "pos" : "neg"}">${a - b >= 0 ? "▲" : "▼"} ${f(Math.abs(a - b))}</span>`;
  const big = (v: string, r: string, extra = "") => `<div class="retro-num"><b>${v}</b><span>${r}</span>${extra}</div>`;
  const clubes = [...new Set(linhas.map((h) => h.clube))];
  // prêmios do mundo e da liga (só os do ano que acabou de fechar ficam guardados inteiros)
  const mundoEu = c.premiosMundo?.ano === ano ? c.premiosMundo.premios.flatMap((p) => { const i = p.ranking.findIndex((x) => x.eu); return i >= 0 ? [`${i + 1}º · ${p.nome}`] : []; }) : [];
  if (c.premiosMundo?.ano === ano && c.premiosMundo.selecao.some((x) => x.eu)) mundoEu.push("Seleção FIFA do Ano");
  const vida = [...new Set(s.noticias.filter((n) => (n.tipo === "vida" || n.tipo === "polemica") && n.semana.includes(String(ano)) && !n.semana.startsWith("Fim") && !n.titulo.startsWith("Relíquia")).map((n) => n.titulo))].slice(0, 5).map((titulo) => ({ titulo }));
  const ultimo = c.historico[c.historico.length - 1]?.ano === ano;
  const slides: [string, string][] = [
    ["Temporada", `<p class="rotulo">Retrospectiva</p><h1 class="retro-ano">${ano}</h1>
      <p class="retro-sub">${esc(j.apelido)} · ${fim.idade} anos · ${clubes.map(esc).join(" → ")}</p>
      ${fim.clubeId ? `<div class="retro-escudo">${escudo(fim.clubeId)}</div>` : ""}
      <p class="retro-destaque">${fim.fase ? "Ano de formação" : fim.titulo ? "🏆 CAMPEÃO" : `${fim.posicao}º lugar · ${esc(fim.liga ?? "")}`}</p>
      <div class="retro-nums">${big(String(fim.ovr), "OVR", dlt(fim.ovr, ant?.ovr))}${big(String(jogos || soma("base")), jogos ? "jogos" : "jogos na base")}</div>`],
    ["Em campo", `<p class="rotulo">Em campo</p><h2>Os números</h2>
      <div class="retro-nums tres">${big(String(soma("gols")), "gols", dlt(soma("gols"), ant?.gols))}${big(String(soma("assist")), "assistências")}${big(nota ? nota.toFixed(2).replace(".", ",") : "–", "nota média")}</div>
      <div class="retro-nums tres">${big(String(soma("mvp")), "melhor em campo")}${big(String(soma("selRodada")), "seleção da rodada")}${big(String(soma("selMes")), "seleção do mês")}</div>
      ${camp.length ? `<div class="retro-lista">${camp.map((k) => `<div><span>${esc(COPAS[k.id]?.curto ?? k.nome)}</span><b class="${k.campeao ? "ouro" : ""}">${esc(k.fase || "–")}</b><small>${k.jogos} j · ${k.gols} g</small></div>`).join("")}</div>` : ""}`],
    ["Conquistas", `<p class="rotulo">Conquistas</p><h2>${premios.length + mundoEu.length ? "Para a estante" : "Sem taça desta vez"}</h2>
      ${premios.length ? `<div class="retro-trofeus">${premios.map((x) => `<div><span>🏆</span>${esc(x)}</div>`).join("")}</div>` : `<p class="sub">Nenhum troféu neste ano. A próxima temporada é a chance de mudar isso.</p>`}
      ${mundoEu.length ? `<p class="rotulo" style="margin-top:14px">No mundo</p><div class="retro-trofeus mundo">${mundoEu.map((x) => `<div><span>🌍</span>${esc(x)}</div>`).join("")}</div>` : ""}`],
    ["Fora de campo", `<p class="rotulo">Fora de campo</p><h2>O ano em volta da bola</h2>
      <div class="retro-lista">${fim.fama !== undefined ? `<div><span>Fama</span><b>${fim.fama}</b>${dlt(fim.fama, ant?.fama)}</div>` : ""}${fim.seguidores !== undefined ? `<div><span>Seguidores</span><b>${compacto(fim.seguidores)}</b>${dlt(fim.seguidores, ant?.seguidores, compacto)}</div>` : ""}${fim.valor !== undefined ? `<div><span>Valor de mercado</span><b>${dinheiroCurto(fim.valor)}</b>${dlt(fim.valor, ant?.valor, dinheiroCurto)}</div>` : ""}${fim.salario !== undefined ? `<div><span>Salário</span><b>${dinheiroCurto(fim.salario)}/mês</b>${dlt(fim.salario, ant?.salario, dinheiroCurto)}</div>` : ""}${fim.saldo !== undefined ? `<div><span>Saldo</span><b>${dinheiroCurto(fim.saldo)}</b>${dlt(fim.saldo, ant?.saldo, dinheiroCurto)}</div>` : ""}</div>
      ${fim.fama === undefined ? `<p class="sub">Os números fora de campo passam a ser guardados a partir desta versão do jogo.</p>` : ""}
      ${vida.length ? `<p class="rotulo" style="margin-top:14px">Na vida</p><div class="retro-vida">${vida.map((n) => `<div>${esc(n.titulo)}</div>`).join("")}</div>` : ""}`],
    ["O que vem", `<p class="rotulo">${ultimo ? "O que vem" : "Depois disso"}</p><h2>${ultimo ? `Temporada ${ano + 1}` : `Fim de ${ano}`}</h2>
      ${ultimo ? `<p class="retro-sub">Agora você tem ${j.idade} anos${c.encerrada || c.fase ? "" : ` · contrato até ${ANO_INICIAL + c.temporada + Math.max(0, c.anosContrato) - 1}`}.</p><p class="sub">A pré-temporada começa já. Treino, descanso e as escolhas da semana decidem o próximo capítulo.</p>` : `<p class="sub">Toque em outro ano no seu perfil para ver as outras temporadas.</p>`}`],
  ];
  const n = slides.length, p = Math.max(0, Math.min(n - 1, passo));
  return `<div class="retro">
    <div class="retro-topo"><div class="retro-pontos">${slides.map((x, i) => `<button class="${i === p ? "ativo" : i < p ? "visto" : ""}" data-retro-ir="${i}" aria-label="${esc(x[0])}"></button>`).join("")}</div><button class="fechar" data-acao="fechar-retro" aria-label="Fechar">✕</button></div>
    <div class="retro-slide">${slides[p][1]}</div>
    <div class="retro-nav">${p ? `<button class="botao sec" data-retro-ir="${p - 1}">Voltar</button>` : "<span></span>"}${p < n - 1 ? `<button class="botao" data-retro-ir="${p + 1}">${esc(slides[p + 1][0])} →</button>` : `<button class="botao" data-acao="fechar-retro">${ultimo && !c.encerrada ? "Bora pra próxima" : "Fechar"}</button>`}</div>
  </div>`;
}

// ------------------------------------------------------------------ save: baixar e carregar (protege a carreira fora do navegador)
type Downloads = { save: (r: { filename: string; data: string }) => Promise<unknown> };
const claudeRt = (window as unknown as { claude?: { use: (n: string) => Promise<unknown> } }).claude;
const downloadsP: Promise<Downloads | null> = claudeRt ? claudeRt.use("downloads").then((x) => x as Downloads | null).catch(() => null) : Promise.resolve(null);
async function baixarSave() {
  if (!save) return;
  const conteudo = JSON.stringify({ app: "mycarrerinha", v: 1, salvoEm: new Date().toISOString(), save, plano, jogador: ler(CHAVE_JOGADOR) });
  const nome = `mycarrerinha-${save.jogador.apelido.normalize("NFD").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "jogador"}-${ANO_INICIAL + save.carreira.temporada}.json`;
  const dl = await Promise.race([downloadsP, new Promise<null>((r) => setTimeout(() => r(null), 800))]);
  if (dl) {
    try { await dl.save({ filename: nome, data: conteudo }); avisoSave("Save baixado. Guarde o arquivo: com ele você continua de onde parou em qualquer aparelho."); return; }
    catch (e) { if ((e as { code?: string }).code === "declined") return; }
  }
  try {
    const url = URL.createObjectURL(new Blob([conteudo], { type: "application/json" })), a = document.createElement("a");
    a.href = url; a.download = nome; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    avisoSave("Save baixado. Guarde o arquivo: com ele você continua de onde parou em qualquer aparelho.");
  } catch { avisoSave("Não deu para baixar o save aqui.", true); }
}
function avisoSave(msg: string, erro = false) {
  const el = document.getElementById("avisoSave");
  if (el) { el.textContent = msg; el.className = `sub aviso-save${erro ? " erro" : ""}`; }
}
function carregarSave(arquivo: File) {
  arquivo.text().then((txt) => {
    let d: { app?: string; save?: Save; plano?: Plano; jogador?: unknown };
    try { d = JSON.parse(txt); } catch { avisoSave("Esse arquivo não é um save do Mycarrerinha.", true); return; }
    if (d.app !== "mycarrerinha" || !d.save?.carreira || !d.save?.jogador) { avisoSave("Esse arquivo não é um save do Mycarrerinha.", true); return; }
    gravar(CHAVE_SAVE, d.save);
    if (d.plano) gravar(CHAVE_PLANO, d.plano);
    if (d.jogador) gravar(CHAVE_JOGADOR, d.jogador);
    location.reload();
  }).catch(() => avisoSave("Não deu para ler o arquivo.", true));
}
let trofeuAberto: string | undefined, camisaAberta: string | undefined;
/** Recordes: em cada clube por onde passou e na seleção, o top 5 da história com o jogador dentro (ou quanto falta). */
function recordesHtml(s: Save): string {
  const listas = recordesDoJogador(pacote, s);
  if (!listas.length) return "";
  const linha = (l: ListaRecorde) => {
    const quinto = l.lista[l.lista.length - 1], falta = l.pos ? 0 : quinto.valor - l.valor + 1;
    const resumo = l.chave.startsWith("liga-") ? (l.pos ? `<b style="color:var(--ouro)">seu: ${l.valor}</b>` : `recorde: ${quinto.valor} · seu melhor: ${l.valor}`) : l.pos ? `<b style="color:var(--ouro)">você: ${l.pos}º</b>` : `faltam ${falta} para o top 5`;
    return `<details class="recorde"><summary><span>${esc(l.titulo)}</span><small>${resumo}</small></summary>${l.lista.map((x, i) => `<div class="premio-l${x.eu ? " ouro" : ""}"><span class="rotulo">${l.chave.startsWith("liga-") ? "" : `${i + 1}º`}</span><span>${x.eu ? `<b style="color:var(--ouro)">${esc(s.jogador.apelido)}</b>` : esc(x.nome)}</span><b>${x.valor} ${l.unidade}</b></div>`).join("")}</details>`;
  };
  const c = s.carreira, apos = c.encerrada ? "" : c.aposentadoria
    ? `<p class="sub" style="margin-top:10px">Última temporada: a despedida é no fim do ano.</p><button class="botao sec" data-acao="desistir-aposentadoria">Voltar atrás e continuar jogando</button>`
    : !c.fase && !c.formacao && s.jogador.idade >= (c.mercado?.semClube ? 28 : 30) ? `<button class="botao sec" style="margin-top:10px" data-acao="aposentar">Anunciar a aposentadoria (esta é a última temporada)</button>` : "";
  return `<p class="rotulo">Recordes <small>(a história de cada clube e da seleção)</small></p>${listas.map(linha).join("")}${apos}`;
}
/** Fim da carreira: a despedida, com tudo o que ficou. */
function telaDespedida(s: Save): string {
  const d = s.carreira.encerrada!, j = s.jogador, hist = s.carreira.historico, t = totaisDaCarreira(hist), sl = s.carreira.selecao;
  const clubes = clubesDaCarreira(hist.filter((h) => h.jogos));
  const ini = hist.find((h) => h.jogos && !h.fase)?.ano ?? hist[0]?.ano;
  return `<header class="marca"><strong>Mycarrerinha</strong><span>Fim de carreira</span></header>
    <section class="painel despedida">
      <p class="rotulo">${ini ?? ""}–${d.ano} · ${d.idade} anos</p>
      <h1>${esc(j.apelido)} pendura as chuteiras</h1>
      <p class="nivel-lenda">${esc(d.nivel.titulo)}</p>
      <p class="sub">${esc(d.nivel.texto)}</p>
      <p>${esc(d.texto)}</p>
      <div class="tiles">${tile(String(t.jogos), "Jogos")}${tile(String(t.gols), "Gols")}${tile(String(t.assist), "Assistências")}${tile(String(t.titulos.length), "Títulos")}${tile(String(t.premios.length), "Prêmios")}${tile(sl?.jogos ? `${sl.jogos}/${sl.gols}` : "–", "Seleção (j/g)")}</div>
      ${d.casa?.camisa ? `<p class="rotulo">Camisa aposentada</p><div class="linha-clube">${escudo(d.casa.clubeId)}<div><b>${esc(nomeDe(d.casa.clubeId))}</b><small>Ninguém mais veste a ${esc(d.casa.camisa)}</small></div><span>${d.casa.jogos} j · ${d.casa.gols} g</span></div>` : ""}
      ${d.recordes.length ? `<p class="rotulo">Recordes que ficam</p>${d.recordes.map((r) => `<div class="premio-l largo ouro"><span class="rotulo">★</span><span>${esc(r)}</span><b></b></div>`).join("")}` : ""}
      <p class="rotulo">Clubes</p>
      <div class="lista-clubes">${clubes.filter((k, i) => !k.clubeId || clubes.findIndex((x) => x.clubeId === k.clubeId) === i).map((k) => { const n = k.clubeId ? numerosNoClube(s, k.clubeId) : k; return `<div class="linha-clube">${k.clubeId ? escudo(k.clubeId) : ""}<div><b>${esc(k.clube)}</b><small>${k.de === k.ate ? k.de : `${k.de}–${k.ate}`}</small></div><span>${n.jogos} j · ${n.gols} g</span></div>`; }).join("")}</div>
      <p class="sub">Todas as competições pelo clube.</p>
      ${t.titulos.length ? `<p class="rotulo">Títulos</p><p class="sub">${t.titulos.map((x) => `${esc(x.nome)} ${x.ano}`).join(" · ")}</p>` : ""}
      ${t.premios.length ? `<p class="rotulo">Prêmios</p><p class="sub">${t.premios.map((x) => `${esc(x.nome)} ${x.ano}`).join(" · ")}</p>` : ""}
      <button class="botao grande" data-acao="perfil">Ver o perfil completo</button>
      <button class="botao sec" data-acao="recomecar">Começar uma nova carreira</button>
    </section>`;
}
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
  document.querySelectorAll<HTMLElement>(".fita-vida").forEach((e) => { e.scrollLeft = e.scrollWidth; });
  ($("dlgPerfil") as HTMLDialogElement).showModal();
  $("telaPerfil").scrollTop = 0;
}
let filtroNoticia: "todas" | "jogo" | "clube" | "vida" | "dinheiro" | "polemica" = "todas";
function abaNoticias(s: Save): string {
  casualMini = undefined;
  if (!s.noticias.length) return `<p class="sub">Nada por enquanto.</p>`;
  const filtros: [typeof filtroNoticia, string][] = [["todas", "Todas"], ["jogo", "Jogos"], ["clube", "Clube e mundo"], ["vida", "Vida"], ["dinheiro", "Dinheiro"], ["polemica", "Polêmicas e lesões"]];
  const chips = `<div class="chips" style="flex-wrap:wrap;margin-bottom:12px">${filtros.map(([k, n]) => `<button class="chip${filtroNoticia === k ? " ativo" : ""}" data-fnot="${k}">${n}</button>`).join("")}</div>`;
  const base = filtroNoticia === "todas" ? s.noticias : s.noticias.filter((n) => filtroNoticia === "polemica" ? n.tipo === "polemica" || n.tipo === "lesao" : n.tipo === filtroNoticia);
  if (!base.length) return chips + `<p class="sub">Nenhuma notícia desse tipo por enquanto.</p>`;
  // notícia sem imagem própria e sem arte temática vira uma linha curta com ícone
  const meuClube = infoClube(pacote, s.carreira.clubeId).nome;
  // taça de outro clube não ganha arte grande
  const temArte = (n: Noticia) => (!!n.img && !(n.img.k === "trofeu" && / é campeã/.test(n.titulo) && !n.titulo.includes(meuClube))) || /[Rr]ival|[Dd]uelo|[Tt]orcida|[Ff]aixa|[Mm]úsica|[Aa]pelido|[Pp]rotesto|aeroporto/.test(n.titulo + " " + n.texto) || (/[Cc]ampeã|[Tt]aça|[Tt]ítulo/.test(n.titulo) && n.titulo.includes(infoClube(pacote, s.carreira.clubeId).nome));
  const card = (n: Noticia, i: number) => temArte(n)
    ? `<div class="noticia ${n.tipo}">${imgNoticia(s, n, i)}<div><strong>${esc(n.titulo)}</strong><span class="sub">${esc(n.texto)}</span></div></div>`
    : `<details class="noticia-curta ${n.tipo}"><summary><span class="nc-ico">${catEvento(n.titulo + " " + n.texto).ico !== "•" ? catEvento(n.titulo + " " + n.texto).ico : ICO_TIPO_NOT[n.tipo]}</span><b>${esc(n.titulo)}</b></summary><span class="sub">${esc(n.texto)}</span></details>`;
  // fim de temporada: as conquistas (taças, relíquias, prêmios) viram um card só, que abre a lista
  const lista = base.slice(0, 40), out: string[] = [], semanaDe: string[] = [], feitos = new Set<string>();
  const ehConquista = (n: Noticia) => n.img?.k === "trofeu" && n.semana.startsWith("Fim da temporada");
  for (let i = 0; i < lista.length && out.length < 25; i++) {
    const n = lista[i];
    if (ehConquista(n)) {
      if (feitos.has(n.semana)) continue;
      const grupo = lista.map((x, k) => [x, k] as [Noticia, number]).filter(([x]) => ehConquista(x) && x.semana === n.semana);
      if (grupo.length >= 3) {
        feitos.add(n.semana);
        semanaDe[out.length] = n.semana;
        out.push(`<details class="noticia trofeu grupo-noticias"><summary>${miniNoticia({ k: "trofeu" })}<div><strong>${grupo.length} conquistas e prêmios</strong><span class="sub">${esc(grupo.slice(0, 3).map(([x]) => x.titulo).join(" · "))}${grupo.length > 3 ? "…" : ""} <b style="color:var(--ouro)">Ver tudo</b></span></div></summary><div class="grupo-lista">${grupo.map(([x, k]) => card(x, k)).join("")}</div></details>`);
        continue;
      }
    }
    semanaDe[out.length] = n.semana;
    out.push(card(n, i));
  }
  // agrupa por semana, com cabeçalho
  const semanas: string[] = [], porSemana = new Map<string, string[]>();
  out.forEach((h, k) => { const sem = semanaDe[k]; if (!porSemana.has(sem)) { porSemana.set(sem, []); semanas.push(sem); } porSemana.get(sem)!.push(h); });
  return `${chips}<div class="feed-not">${semanas.map((sem) => `<div class="feed-sem"><p class="feed-cab"><span>${esc(sem)}</span><i>${porSemana.get(sem)!.length}</i></p><div class="feed-lista">${porSemana.get(sem)!.join("")}</div></div>`).join("")}</div>`;
}
const ICO_TIPO_NOT: Record<Noticia["tipo"], string> = { jogo: "⚽", clube: "🏟️", vida: "🌴", dinheiro: "💰", polemica: "🔥", lesao: "🩹" };

// ------------------------------------------------------------------ vida fora de campo (aba Vida)
let subVida: "agenda" | "casa" | "cidade" | "parcas" | "garagem" | "rotina" | "fundacao" = "agenda";
let msgVida: { ok: boolean; texto: string } | undefined, afastarCerteza: string | undefined;
/** Cena de cabeçalho de cada tipo de momento: cores do fundo, ícone principal e dois enfeites. */
const CENA_ORIGEM: Record<string, [string, string, string, string, string]> = {
  amor: ["#5A1E3A", "#9B3563", "❤️", "🌹", "✨"], familia: ["#3D2A14", "#7A5428", "🏡", "👵", "🍲"], filho: ["#1E3A5A", "#2F6A9B", "🧒", "⚽", "🎈"],
  parca: ["#3A2A0E", "#7A5A18", "🍖", "🤙", "🎶"], convite: ["#2A1A4A", "#5A3A9B", "🎬", "📸", "✨"], encrenca: ["#3A1414", "#7A2828", "⚖️", "🚨", "📄"],
  exterior: ["#0E2A4A", "#1F5A8A", "✈️", "🗺️", "🧳"], fundacao: ["#4A3A0E", "#9B7A1F", "💛", "🤝", "🏫"], ferias: ["#0E4A4A", "#1F8A8A", "🏝️", "☀️", "🍹"],
  hobby: ["#2A2A3A", "#4A4A6A", "🎲", "🎮", "🎣"], garagem: ["#1E1E1E", "#4A4A4A", "🏎️", "🔑", "💨"], vestiario: ["#123A2A", "#1F6A4A", "👕", "🧴", "🗣️"],
  tecnico: ["#14283A", "#26507A", "📋", "🧠", "⚽"], rival: ["#3A0E14", "#7A1F2A", "⚔️", "😤", "🔥"], torcida: ["#0E3A1E", "#1F7A3E", "📣", "🏟️", "🎉"],
  cidade: ["#1E2A3A", "#3A5A7A", "🏙️", "🗺️", "📍"], contrato: ["#2A2A14", "#5A5A28", "✍️", "📄", "💰"], acontece: ["#2A1E3A", "#5A3A7A", "⚡", "📰", "📱"],
};
function htmlOcasiao(s: Save, o: ReturnType<typeof agendaDe>["pendentes"][number], compacto = false): string {
  const falta = o.expira - semanaAbsJogo(s.carreira);
  const ce = CENA_ORIGEM[o.origem] ?? CENA_ORIGEM.acontece;
  return `<section class="painel ocasiao o-${o.origem}"><div class="oca-cena" style="--c1:${ce[0]};--c2:${ce[1]}"><span class="oc-deco a">${ce[3]}</span><span class="oc-ico">${ce[2]}</span><span class="oc-deco b">${ce[4]}</span><span class="oc-tag">${NOME_ORIGEM[o.origem]}</span><span class="prazo">${falta <= 0 ? "⏳ esta semana" : `⏳ ${falta + 1} semanas`}</span></div><h2>${esc(o.titulo)}</h2><p class="sub">${esc(o.texto)}</p>
    <div class="ops">${o.opcoes.map((x) => `<button data-oca="${o.uid}" data-op="${x.id}"><span>${esc(x.rotulo)}</span>${iconesEfeito(x.ef as unknown as Record<string, unknown>, !!x.risco)}</button>`).join("")}</div>${compacto ? "" : ""}</section>`;
}
function cardAgenda(s: Save): string {
  const a = agendaDe(s.carreira), m = msgVida && aba !== "casa" ? msgVida : undefined;
  if (m) msgVida = undefined;
  const res = m ? `<section class="painel ocasiao feita"><p>${esc(m.texto)}</p></section>` : "";
  if (!a.pendentes.length) return res;
  const o = a.pendentes[0], mais = a.pendentes.length - 1;
  return res + htmlOcasiao(s, o, true) + (mais ? `<button class="painel aviso-mercado" data-aba="casa" data-ir="agenda"><span>📅</span><span><b>Mais ${mais} ${mais === 1 ? "momento" : "momentos"} na agenda</b><small>Responda na aba Vida.</small></span></button>` : "");
}
function abaVida(s: Save): string {
  const a = agendaDe(s.carreira), n = a.pendentes.length;
  const subs: [typeof subVida, string][] = [["agenda", n ? `Agenda (${n})` : "Agenda"], ["casa", "Casa"], ["cidade", "Cidade"], ["parcas", "Parças"], ["garagem", "Garagem"], ["rotina", "Rotina"], ["fundacao", "Fundação"]];
  const sub = `<div class="sub-abas rolar">${subs.map(([k, t]) => `<button class="${subVida === k ? "ativo" : ""}" data-subvida="${k}">${t}</button>`).join("")}</div>`;
  const msg = msgVida ? `<p class="msg-mercado ${msgVida.ok ? "ok" : "nao"}">${esc(msgVida.texto)}</p>` : "";
  msgVida = undefined;
  const corpo = subVida === "cidade" ? blocoCidade(s) : subVida === "casa" ? abaCasa(s) : subVida === "parcas" ? vidaParcas(s) : subVida === "garagem" ? vidaGaragem(s) : subVida === "rotina" ? vidaRotina(s) : subVida === "fundacao" ? vidaFundacao(s) : vidaAgenda(s);
  return sub + msg + corpo;
}
function vidaAgenda(s: Save): string {
  const a = agendaDe(s.carreira);
  const luto = a.luto ? `<section class="painel luto"><p>🕊️ Tempo de luto. A moral pesa por mais ${a.luto.semanas} ${a.luto.semanas === 1 ? "semana" : "semanas"}.</p></section>` : "";
  return `${luto}${a.pendentes.length ? a.pendentes.map((o) => htmlOcasiao(s, o)).join("") : `<p class="sub">Nada pendente. A vida fora de campo chega aqui: família, filhos, parças, convites, encrencas, a vida no exterior e as férias. Quem não responde a tempo fica com a última opção.</p>`}`;
}
function vidaParcas(s: Save): string {
  const ps = parcasDe(s), c = s.carreira, ab = semanaAbsJogo(c);
  const card = (p: typeof ps[number]) => {
    const cor = p.lealdade >= 70 ? "#74D394" : p.lealdade >= 45 ? "#E3B341" : "#EC7D69";
    return `<div class="parca"><div class="parca-topo"><span class="avatar-fam" style="--c:${cor}">${esc(p.apelido.slice(0, 2).toUpperCase())}</span><div><b>${esc(p.apelido)}</b> <span class="selo">${NOME_PERFIL[p.perfil]}</span><small>${esc(p.nome)} · amigo desde ${p.desde}${p.funcao ? ` · ${FUNCOES[p.funcao].nome.toLowerCase()}` : ""}${p.divida ? ` · te deve R$ ${p.divida.toLocaleString("pt-BR")}` : ""}</small></div></div>
      <div class="emp-saude"><span>Lealdade</span><span class="rel-barra"><i style="width:${p.lealdade}%;background:${cor}"></i></span></div>
      <div class="rel-acoes" style="margin-left:0">${(Object.keys(FUNCOES) as FuncaoParca[]).map((f) => `<button class="chip${p.funcao === f ? " ativo" : ""}" data-parca="${p.id}" data-funcao="${p.funcao === f ? "" : f}">${FUNCOES[f].nome}${p.funcao === f ? " ✓" : ""}</button>`).join("")}<button class="chip" data-afastar="${p.id}">${afastarCerteza === p.id ? "Toque de novo para afastar" : "Afastar"}</button></div></div>`;
  };
  return `<p class="sub">Os amigos de sempre. Leais seguram a sua cabeça; festeiros puxam para a noite; interesseiros pedem dinheiro; boca solta conta tudo quando fica chateado. Dar uma função paga salário e deixa o parça mais fiel.</p>
    <div class="ferr-botoes" style="margin:10px 0"><button class="botao${c.churrasco === ab ? " sec" : ""}" data-acao="churrasco" ${c.churrasco === ab ? "disabled" : ""}>🍖 Churrasco com os parças</button></div>
    ${ps.length ? ps.map(card).join("") : `<p class="sub">Ninguém por perto. Quando a fama sobe, aparece gente nova.</p>`}
    <p class="rotulo" style="margin-top:14px">Funções</p>${(Object.keys(FUNCOES) as FuncaoParca[]).map((f) => `<p class="sub" style="margin:2px 0"><b>${FUNCOES[f].nome}</b> (${dinheiro(FUNCOES[f].custo)}/mês): ${esc(FUNCOES[f].desc)}</p>`).join("")}`;
}
function vidaGaragem(s: Save): string {
  const c = s.carreira, l = luxoDe(c), saldo = s.casa.saldo;
  const tem = l.map((i) => { const x = LUXO[i.tipo], d = i.valor - x.preco; return `<div class="luxo"><span class="luxo-ic">${x.emoji}</span><div><b>${esc(x.nome)}</b><small>desde ${i.ano} · pagou ${dinheiro(x.preco)}</small></div><div class="emp-valor"><b>${dinheiro(i.valor)}</b><small class="${d >= 0 ? "pos" : "neg"}">${d >= 0 ? "+" : "−"}${dinheiro(Math.abs(d))}</small></div><button class="chip" data-vender-luxo="${i.uid}">Vender</button></div>`; }).join("");
  const loja = (Object.keys(LUXO) as TipoLuxo[]).map((t) => { const x = LUXO[t], pode = c.fama >= x.famaMin && saldo >= x.preco && l.length < MAX_LUXO; return `<div class="abrir-emp${pode ? "" : " trava"}"><div><b>${x.emoji} ${esc(x.nome)}</b><small>${x.mes < 0 ? `perde ~${Math.abs(x.mes * 1200).toFixed(0)}% ao ano` : `valoriza ~${(x.mes * 1200).toFixed(0)}% ao ano`}${x.vol ? " (oscila)" : ""}</small>${c.fama < x.famaMin ? `<small class="falta">Precisa de fama ${x.famaMin}</small>` : ""}</div><button class="botao peq${pode ? "" : " sec"}" data-luxo="${t}" ${pode ? "" : "disabled"}>${dinheiro(x.preco)}</button></div>`; }).join("");
  return `<p class="sub">Carro, relógio e arte dão status (a fama sobe um pouco) e alegria nas primeiras semanas. Carro perde valor; relógio e arte podem valorizar. Esportivo na garagem traz multa; relógio em casa sem segurança atrai ladrão.</p>
    <p class="rotulo" style="margin-top:12px">Na garagem e no cofre · ${l.length}/${MAX_LUXO}</p>${tem || `<p class="sub">Nada ainda.</p>`}
    <details class="dobra" style="margin-top:14px"${l.length ? "" : " open"}><summary class="rotulo">Comprar</summary>${loja}</details>`;
}
function vidaRotina(s: Save): string {
  const c = s.carreira, j = s.jogador, h = hobbiesDe(c), e = estudosDe(c), ad = c.adaptacao, nativa = linguaNativa(j.nacionalidade) as Lingua;
  const hob = (Object.keys(HOBBIES) as Hobby[]).map((k) => { const on = h.ativos.includes(k), nv = Math.round(h.nivel[k] ?? 0); return `<button class="hobby${on ? " on" : ""}" data-hobby="${k}"><span>${HOBBIES[k].emoji}</span><b>${HOBBIES[k].nome}</b><small>${esc(HOBBIES[k].desc)}</small>${nv ? `<i style="width:${nv}%"></i>` : ""}</button>`; }).join("");
  const extra = [h.esports ? `🎮 Time de e-sports: ${dinheiro(h.esports.valor)}${h.esports.titulos ? ` · ${h.esports.titulos} ${h.esports.titulos === 1 ? "título" : "títulos"}` : ""}` : "", h.musica ? `🎤 Música gravada em ${h.musica}` : ""].filter(Boolean);
  const atual = e.atual ? (() => { const i = infoCurso(e.atual!.curso), p = Math.min(100, Math.round(100 * e.atual!.progresso / i.semanas)); return `<div class="curso"><div><b>${esc(i.nome)}</b><small>${Math.round(e.atual!.progresso)} de ${i.semanas} semanas · ${dinheiro(i.custo)}/mês</small></div><span class="rel-barra"><i style="width:${p}%;background:#6FB7E0"></i></span><button class="chip" data-curso="">Trancar</button></div>`; })() : "";
  const disp = e.atual ? "" : cursosDisponiveis(e, nativa).map((k: Curso) => { const i = infoCurso(k); return `<div class="abrir-emp"><div><b>${esc(i.nome)}</b><small>${esc(i.desc)} · ${i.semanas} semanas · ${dinheiro(i.custo)}/mês</small></div><button class="botao peq" data-curso="${k}">Estudar</button></div>`; }).join("");
  const idiomas = (Object.keys(NOME_LINGUA) as Lingua[]).filter((l) => l !== nativa && (e.idiomas[l] ?? 0) > 0).map((l) => `${NOME_LINGUA[l]}: ${NIVEL_LINGUA[e.idiomas[l]!].toLowerCase()}`);
  const adapt = ad ? `<div class="corpo-card" style="margin-bottom:14px"><p class="rotulo">✈️ Vida lá fora · ${esc(NOME_PAIS[ad.pais] ?? ad.pais)}</p><h2 style="margin:2px 0 6px">Adaptação ${Math.round(ad.valor)}%</h2><div class="barra-corpo"><i style="width:${Math.max(4, ad.valor)}%;background:${ad.valor >= 65 ? "#74D394" : ad.valor >= 40 ? "#E3B341" : "#EC7D69"}"></i></div><p class="sub" style="margin-top:8px">Pouca adaptação tira moral toda semana e um pouco do seu jogo. Ajudam: o idioma do país (estude aqui embaixo), a companheira morando junto, um parça com função e trazer a família.</p></div>` : "";
  return `${adapt}<p class="rotulo">Hobbies · até ${MAX_HOBBIES}</p><div class="hobbies">${hob}</div>${extra.length ? `<p class="sub" style="margin-top:6px">${extra.map(esc).join(" · ")}</p>` : ""}
    <p class="rotulo" style="margin-top:16px">Estudos</p>${atual}${disp}
    ${idiomas.length || e.formacoes.length ? `<p class="sub" style="margin-top:8px">${[...idiomas, ...e.formacoes.map((f) => `🎓 ${f}`)].map(esc).join(" · ")}</p>` : ""}
    <p class="sub" style="margin-top:6px">Estudar cansa um pouco por semana. Idioma ajuda a se adaptar fora; as licenças e a faculdade preparam a vida depois da bola.</p>`;
}
function vidaFundacao(s: Save): string {
  const f = s.carreira.fundacao;
  if (!f) return `<p class="sub">Uma fundação na sua cidade natal: escolinha social, cestas, ajuda nas tragédias. Sobe a torcida e a relação com a imprensa, e quem faz a diferença no ano ganha o Prêmio Coração de Ouro.</p><div class="ferr-botoes" style="margin-top:10px"><button class="botao" data-acao="fundacao" ${s.casa.saldo >= CUSTO_FUNDACAO ? "" : "disabled"}>Criar a fundação (${dinheiro(CUSTO_FUNDACAO)})</button></div>`;
  const meta = Math.min(100, Math.round(f.impactoAno / 60 * 100));
  return `<div class="corpo-card"><p class="rotulo">💛 ${esc(f.nome)}</p><h2 style="margin:2px 0">${esc(f.cidade)}</h2><p class="sub">Desde ${f.criada} · ${f.impacto} pontos de impacto no total${f.premios.length ? ` · Coração de Ouro: ${f.premios.join(", ")}` : ""}</p>
      <div class="emp-saude" style="margin-top:10px"><span>Rumo ao Coração de Ouro</span><span class="rel-barra"><i style="width:${meta}%;background:#E58FB1"></i></span></div><p class="sub">${f.impactoAno} de 60 pontos neste ano.</p></div>
    <p class="rotulo" style="margin-top:14px">Doação mensal</p><div class="chips" style="flex-wrap:wrap">${NOME_DOACAO.map((n, i) => `<button class="chip${f.nivel === i ? " ativo" : ""}" data-doacao="${i}">${n}${DOACAO[i] ? ` · ${dinheiro(DOACAO[i])}` : ""}</button>`).join("")}</div>
    <p class="sub" style="margin-top:8px">Quanto mais doação, mais impacto por mês. Tragédias e visitas aparecem na agenda e rendem impacto extra.</p>`;
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
type ItemFila = { min: number; html?: string; cls?: string; jogador?: boolean; decisao?: Decisao; gol?: "casa" | "fora"; meu?: "gol" | "assist"; texto?: string; saida?: boolean; fim?: boolean; acrescimo?: boolean };
let fila: ItemFila[] = [];
let placar = [0, 0], timer = 0, minutoAtual = 0, nDec = 0, amarelos = 0, expulso = false, comemorou = false, posFeito = false, disputaFeita = false, notaMostrada = 0;
/** Disputa de pênaltis em andamento (só no mata-mata empatado no agregado). */
let pen: { d: Disputa; vez: number; cob: { meu: boolean; ok: boolean }[]; bm: number; ba: number; slot: number; bateu?: boolean; converteu?: boolean; venceu?: boolean } | undefined;
const decisoesAbertas: Record<number, Decisao> = {};

function htmlGol(p: Partida, lado: "casa" | "fora", meu?: "gol" | "assist", texto?: string) {
  const nome = save!.jogador.apelido, time = lado === "casa" ? p.nomeCasa : p.nomeFora, meuTime = (lado === "casa") === p.souCasa;
  const extra = meu === "gol" ? ` GOL de ${esc(nome)}!` : meu === "assist" ? ` Assistência de ${esc(nome)}.` : "";
  return `<span class="${meuTime ? (meu ? "meu" : "") : "contra"}">Gol do ${esc(time)}!${extra}</span>${texto ? `<br><small class="detalhe">${esc(texto)}</small>` : ""}`;
}

function abrirJogo() {
  if (!save) return;
  // quarta primeiro: jogo da copa continental, se houver
  const jc = jogoCopaDaSemana(pacote, save);
  partida = jc ? prepararPartida(pacote, save, plano, jc) : prepararPartida(pacote, save, plano);
  resultados = [];
  if (jc && partida && (partida.escalacao === "lesionado" || partida.escalacao === "fora" || partida.escalacao === "suspenso" || (partida.escalacao === "banco" && partida.entrada > 90 && partida.lances.length === 0))) {
    concluirJogoDaCopa(pacote, save, plano, partida, []); partida = undefined; salvar(); abrirJogo(); return;
  }
  if (!partida || partida.escalacao === "lesionado" || partida.escalacao === "fora" || partida.escalacao === "suspenso" || (partida.escalacao === "banco" && partida.entrada > 90 && partida.lances.length === 0)) { fecharSemana(); return; }
  const p = partida, nome = save.jogador.apelido;
  placar = [0, 0]; minutoAtual = 0; amarelos = 0; expulso = false; comemorou = false; posFeito = false; disputaFeita = false; pen = undefined; notaMostrada = 0;
  fila = [];
  if (p.clima) fila.push({ min: 0, html: esc(p.clima.texto), cls: "clima" });
  fila.push({ min: 0, html: `${esc(p.abertura || "Bola rolando.")}${p.entrada === 0 ? ` ${esc(nome)} começa jogando.` : ` ${esc(nome)} começa no banco.`}` });
  for (const l of p.narracao ?? []) fila.push({ min: l.min, html: esc(l.texto), cls: l.cls, jogador: l.jogador || l.texto.includes(nome) });
  if (p.entrada > 0 && p.entrada <= 90) fila.push({ min: p.entrada, html: `Substituição: ${esc(nome)} entra em campo.` });
  if (p.saida < 90) fila.push({ min: p.saida, saida: true, html: `${esc(nome)} sente o cansaço e é substituído.` });
  fila.push({ min: 45, html: "Intervalo." });
  fila.push({ min: 89, acrescimo: true });
  for (const l of p.lances) fila.push({ min: l.min, gol: l.lado, meu: l.meu, texto: l.texto });
  p.decisoes.forEach((d) => fila.push({ min: d.min, decisao: d }));
  fila.sort((a, b) => a.min - b.min || (a.decisao ? 1 : 0) - (b.decisao ? 1 : 0));
  fila.push({ min: 90, fim: true, html: "Fim de jogo." });
  ($("dlgJogo") as HTMLDialogElement).classList.toggle("jogo-grande", (p.clima?.peso ?? 1) >= 1.25);
  const idComp = p.copa ? p.copa.id : p.tipo === "base" ? "BASE" : infoLiga(save.carreira.ligaId).id, idt = identidade(idComp);
  $("telaJogo").innerHTML = `<div class="placar ident" style="${estiloIdent(idt)}">${p.clima ? `<p class="selo-jogo"><span>${esc(p.clima.tag)}</span></p>` : ""}<p class="comp-linha">${seloSvg(idt, 22)}<span>${p.copa ? `${esc(COPAS[p.copa.id].curto)} · ${esc(p.copa.rotulo)}${p.copa.neutro ? " · campo neutro" : ""}` : p.tipo === "base" ? `${esc(infoLiga(save.carreira.ligaId).curto)} ${categoriaBase(save.jogador.idade).replace("s", "S")}` : `${esc(infoLiga(save.carreira.ligaId).curto)} · ${esc(rotuloSemana(save.carreira))}`}</span></p>
    <div class="linha"><div class="time">${escudo(p.casa)}<span>${esc(p.nomeCasa)}</span></div><div class="gols" id="gols">0 × 0</div><div class="time dir"><span>${esc(p.nomeFora)}</span>${escudo(p.fora)}</div></div>
    <div class="min" id="minuto">0'</div><div class="placar-extra"><span id="agregado"></span><span class="nota-viva" id="notaViva"></span></div>
    ${campinhoSvg(p)}<div class="pressao" aria-label="Quem está melhor no jogo"><span>${esc(p.souCasa ? p.nomeCasa : p.nomeFora)}</span><i><b id="pressaoBar"></b></i><span>${esc(p.souCasa ? p.nomeFora : p.nomeCasa)}</span></div></div>
    <div class="lances" id="lances"></div><div class="rodape" id="rodapeJogo"><button class="botao sec grande" data-acao="acelerar">Pular para o próximo lance</button></div>`;
  ($("dlgJogo") as HTMLDialogElement).showModal();
  atualizarPlacar();
  avancar();
}

/** Nota ao vivo: cresce do 6,0 até a nota do jogo conforme o tempo em campo, mais o que cada decisão rendeu. */
function notaViva(): number | undefined {
  const p = partida;
  if (!p || minutoAtual < p.entrada || p.entrada > 90) return undefined;
  const fim = Math.min(90, p.saida), frac = Math.max(0, Math.min(1, (Math.min(minutoAtual, fim) - p.entrada) / Math.max(1, fim - p.entrada)));
  const dec = resultados.filter((r) => SITUACAO[r.situacao]?.momento !== "pos").reduce((a, r) => a + r.nota, 0);
  return Math.max(3, Math.min(10, 6 + (p.base.nota - 6) * frac + dec));
}
const meuIdx = () => (partida!.souCasa ? 0 : 1);
/** Agregado do mata-mata (gols da ida + deste jogo), na ordem casa/fora deste jogo. */
const agregado = (): [number, number] | undefined => partida?.copa?.ida ? [placar[0] + partida.copa.ida[0], placar[1] + partida.copa.ida[1]] : undefined;

function botaoFimJogo() {
  return partida?.copa ? `<button class="botao grande" data-acao="fimcopa">Voltar para a semana</button>` : `<button class="botao grande" data-acao="fimjogo">Ver a semana</button>`;
}
/** Fim do jogo de quarta: fecha a rodada da copa e volta para a semana (o jogo da liga é no domingo). */
function fecharJogoDaCopa() {
  if (!save || !partida?.copa) return;
  const st = pen ? placarDisputa(pen.cob) : undefined;
  const r = concluirJogoDaCopa(pacote, save, plano, partida, resultados, pen && st?.fim ? { venceu: !!st.venceu, bateu: pen.bateu, converteu: pen.converteu, placar: `${Math.max(st.meu, st.adv)} × ${Math.min(st.meu, st.adv)}` } : undefined);
  partida = undefined; resultados = []; pen = undefined;
  salvar();
  ($("dlgJogo") as HTMLDialogElement).close();
  render();
  void r;
  document.querySelector(".jogo-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
}
function atualizarPlacar() {
  $("gols").textContent = `${placar[0]} × ${placar[1]}`; $("minuto").textContent = pen ? "Pênaltis" : `${minutoAtual}'`;
  const ag = agregado(), el = $("agregado");
  el.textContent = ag ? `Agregado ${ag[0]} × ${ag[1]}` : "";
  const n = notaViva(), nv = $("notaViva");
  if (n === undefined) { nv.innerHTML = ""; return; }
  const r = Math.round(n * 10) / 10;
  nv.innerHTML = `Sua nota <b>${r.toFixed(1).replace(".", ",")}</b>`;
  if (notaMostrada && Math.abs(r - notaMostrada) >= 0.15) { nv.classList.remove("sobe", "desce"); void nv.offsetWidth; nv.classList.add(r > notaMostrada ? "sobe" : "desce"); }
  notaMostrada = r;
}
function adicionarLance(min: number, html: string, cls = "") {
  const el = document.createElement("div"); el.className = `lance ${cls}`; el.innerHTML = `<span class="m">${min}'</span><span>${html}</span>`;
  $("lances").appendChild(el); el.scrollIntoView({ behavior: "smooth", block: "end" });
}

// ------------------------------------------------------------------ campinho: a bola anda conforme o lance
let pressao = 0, passoBola = 0;
function campinhoSvg(p: Partida): string {
  pressao = 0; passoBola = 0;
  const [m1] = cores(p.souCasa ? p.casa : p.fora), [a1] = cores(p.souCasa ? p.fora : p.casa);
  const faixas = Array.from({ length: 8 }, (_, i) => `<rect x="${i * 37.5}" y="0" width="37.5" height="110" fill="${i % 2 ? "#2F7A45" : "#2A6E3F"}"/>`).join("");
  return `<svg class="campinho" viewBox="0 0 300 110" aria-hidden="true">${faixas}<g fill="none" stroke="#ffffffaa" stroke-width="1.4"><rect x="4" y="4" width="292" height="102"/><path d="M150 4 V106"/><circle cx="150" cy="55" r="15"/><rect x="4" y="30" width="34" height="50"/><rect x="262" y="30" width="34" height="50"/><rect x="4" y="44" width="10" height="22"/><rect x="286" y="44" width="10" height="22"/></g>
    <rect x="0" y="45" width="4" height="20" fill="${m1}" stroke="#fff" stroke-width=".8"/><rect x="296" y="45" width="4" height="20" fill="${a1}" stroke="#fff" stroke-width=".8"/>
    <g id="voce" class="voce" transform="translate(180 55)" style="opacity:${p.entrada === 0 ? 1 : 0}"><circle r="7" fill="${m1}" stroke="#fff" stroke-width="1.6"/><text y="3" text-anchor="middle" font-size="8" font-weight="900" fill="${luzCor(m1) > 0.6 ? "#111" : "#fff"}">${esc(save!.jogador.numero)}</text></g>
    <g id="bola" class="bola" transform="translate(150 55)"><circle r="4.2" fill="#fff" stroke="#111" stroke-width="1"/></g></svg>`;
}
const luzCor = (hex: string) => { const n = parseInt(hex.replace("#", "").slice(0, 6), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
/** Leva a bola para uma faixa do campo (0 = nosso gol, 300 = gol deles) e mexe na barra de pressão. */
function moverBola(xMin: number, xMax: number, dPressao: number, voce = false) {
  passoBola++;
  const x = xMin + ((passoBola * 37) % 100) / 100 * (xMax - xMin), y = 18 + ((passoBola * 53) % 100) / 100 * 74;
  document.getElementById("bola")?.setAttribute("transform", `translate(${x.toFixed(0)} ${y.toFixed(0)})`);
  const v = document.getElementById("voce");
  const emCampo = !!partida && !expulso && minutoAtual >= partida.entrada && minutoAtual <= Math.min(90, partida.saida);
  if (v) v.style.opacity = emCampo ? "1" : "0";
  if (v) { v.setAttribute("transform", voce ? `translate(${(x - 10).toFixed(0)} ${(y + 6).toFixed(0)})` : `translate(${Math.min(250, Math.max(110, x - 30 + ((passoBola * 17) % 40))).toFixed(0)} ${(30 + ((passoBola * 29) % 50)).toFixed(0)})`); v.classList.toggle("ativo", voce); }
  pressao = Math.max(-1, Math.min(1, pressao * 0.8 + dPressao));
  const b = document.getElementById("pressaoBar");
  if (b) { b.style.width = `${Math.abs(pressao) * 50}%`; b.style.left = pressao >= 0 ? "50%" : `${50 - Math.abs(pressao) * 50}%`; b.className = pressao >= 0 ? "pos" : "neg"; }
}
function flashGol(meu: boolean, nome: string) {
  const t = $("telaJogo"), d = document.createElement("div");
  d.className = `flash-gol ${meu ? "meu" : "contra"}`; d.innerHTML = `<b>GOL!</b><span>${esc(nome)}</span>`;
  t.appendChild(d); setTimeout(() => d.remove(), 1500);
}
function avancar() {
  clearTimeout(timer);
  const item = fila.shift();
  if (!partida || !save) return;
  if (!item) { $("rodapeJogo").innerHTML = botaoFimJogo(); return; }
  minutoAtual = item.min;
  if (item.decisao) {
    // lance de campo só com o jogador em campo: nada antes de entrar, depois de sair ou de ser expulso
    const momento = SITUACAO[item.decisao.situacao]?.momento ?? (item.decisao.situacao === "comemoracao" ? "comemoracao" : "");
    const deCampo = momento !== "pos" && momento !== "comemoracao";
    if (deCampo && (expulso || item.min < partida.entrada || item.min > Math.min(90, partida.saida))) { avancar(); return; }
    if (deCampo) moverBola(200, 255, 0.2, true);
    mostrarDecisao(item.decisao); atualizarPlacar(); return;
  }
  if (item.acrescimo) {
    const t = textoAcrescimo();
    if (!t) { avancar(); return; }
    item.html = t; item.cls = "tenso";
  }
  if (item.gol) { if (item.gol === "casa") placar[0]++; else placar[1]++; }
  atualizarPlacar();
  { // a bola no campinho
    const meuLado = partida.souCasa ? "casa" : "fora";
    if (item.gol) { const meu = item.gol === meuLado; moverBola(meu ? 292 : 6, meu ? 296 : 8, meu ? 0.6 : -0.6, item.meu === "gol"); flashGol(meu, item.meu === "gol" ? save.jogador.apelido : meu ? (partida.souCasa ? partida.nomeCasa : partida.nomeFora) : (partida.souCasa ? partida.nomeFora : partida.nomeCasa)); }
    else if (item.jogador) moverBola(170, 240, 0.12, true);
    else if (item.cls === "meu") moverBola(200, 270, 0.18);
    else if (item.cls === "contra") moverBola(30, 100, -0.18);
    else if (!item.fim && !item.acrescimo && item.min > 0) moverBola(100, 200, 0);
  }
  adicionarLance(item.min, item.html ?? htmlGol(partida, item.gol!, item.meu, item.texto), item.gol ? "gol" : item.cls ?? "");
  if (item.gol && !item.meu) { const re = reacaoGol(item.gol); if (re) adicionarLance(item.min, re, "reacao"); }
  if (item.meu === "gol") abrirComemoracao(item.min);
  if (item.fim && !disputaFeita && precisaDisputa()) { disputaFeita = true; iniciarDisputa(); return; }
  if (item.fim && !posFeito) posApito();
  if (!fila.length) { $("rodapeJogo").innerHTML = botaoFimJogo(); return; }
  timer = window.setTimeout(avancar, item.gol ? 1100 : 650);
}

/** Depois do apito, às vezes ainda tem entrevista, troca de camisa, conversa com o técnico... */
function posApito() {
  posFeito = true;
  const pos = decisaoPosJogo(save!, partida!, resultados);
  if (pos) fila.unshift({ min: 90, decisao: pos });
}

/** Os acréscimos: a frase muda com o placar (e o agregado, no mata-mata). */
function textoAcrescimo(): string | undefined {
  const p = partida!, grande = (p.clima?.peso ?? 1) >= 1.2, i = meuIdx(), dif = placar[i] - placar[1 - i], ag = agregado();
  const mins = 3 + ((p.nomes.estadio?.length ?? 0) + placar[0] * 2 + placar[1]) % 4;
  if (p.copa?.mataMata && (ag ? ag[i] === ag[1 - i] : dif === 0)) return `${mins} minutos de acréscimo. ${ag ? "No agregado está empate" : "Empate"}: se ficar assim, vai para os pênaltis.`;
  if (dif === 0) return grande ? `${mins} minutos de acréscimo. Tudo igual, e quem marcar agora vira herói.` : undefined;
  if (dif === 1) return `${mins} minutos de acréscimo. A torcida assobia pedindo o apito final.`;
  if (dif === -1) return `${mins} minutos de acréscimo. Todo mundo na área: é tudo ou nada.`;
  return undefined;
}
/** A reação do estádio e do banco a cada decisão (só nos lances de campo, e não nos neutros). */
function reacaoDecisao(r: ResultadoDecisao, d: Decisao): string | undefined {
  const p = partida!, mom = SITUACAO[d.situacao]?.momento;
  if (mom === "pos" || mom === "comemoracao" || r.nivel === 2) return;
  const sel = !!p.copa && ehDeSelecao(p.copa.id), tec = sel ? "O técnico da seleção" : save!.carreira.tecnico ? `O técnico ${save!.carreira.tecnico.nome.split(" ").slice(-1)[0]}` : "O técnico";
  const grande = (p.clima?.peso ?? 1) >= 1.25, cap = p.nomes.capitao ?? "capitão", fora = !p.souCasa && !p.copa?.neutro;
  const pools: Record<number, string[]> = {
    0: grande ? ["O estádio inteiro de pé, gritando o seu nome.", `${tec} corre até a beira do campo e vibra com o punho fechado.`, "Arrepio na arquibancada. Isso é jogo grande!"] : fora ? ["Até a torcida rival ficou em silêncio.", `${tec} aplaude na beira do campo.`, "Os companheiros vêm te abraçar."] : ["A torcida canta o seu nome.", `${tec} aplaude na beira do campo.`, "Os companheiros vêm te abraçar."],
    1: ["Aplausos da arquibancada.", `${tec} faz sinal de positivo.`, `O ${cap} bate palmas para você.`],
    3: ["Um murmúrio na arquibancada.", `${tec} cruza os braços na beira do campo.`, `O ${cap} pede calma com as mãos.`],
    4: fora ? [`A torcida do ${p.nomes.adv} faz a festa.`, `${tec} chuta a garrafinha na beira do campo.`, "Você ouve o estádio inteiro rindo."] : ["Vaias da própria torcida.", `${tec} chuta a garrafinha na beira do campo.`, "A torcida perde a paciência com você."],
  };
  const l = pools[r.nivel];
  return l ? `<span class="reacao">${esc(l[(d.min + d.situacao.length + r.nivel) % l.length])}</span>` : undefined;
}
/** Reação a um gol que não é do jogador (o do time, ou o sofrido em jogo grande). */
function reacaoGol(lado: "casa" | "fora"): string | undefined {
  const p = partida!, meu = (lado === "casa") === p.souCasa, grande = (p.clima?.peso ?? 1) >= 1.25;
  if (!grande) return;
  const l = meu ? ["A arquibancada treme.", "Abraço coletivo perto da bandeirinha.", "O banco inteiro invade o campo para comemorar."] : ["Silêncio no estádio.", "A torcida rival explode.", "Mãos na cabeça por todo lado."];
  return `<span class="reacao">${esc(l[(placar[0] * 3 + placar[1] + minutoAtual) % l.length])}</span>`;
}

// ------------------------------------------------------------------ pênaltis (mata-mata empatado no agregado)
function precisaDisputa(): boolean {
  const p = partida!, i = meuIdx(), ag = agregado() ?? [placar[0], placar[1]];
  return !!p.copa?.mataMata && ag[i] === ag[1 - i];
}
function iniciarDisputa() {
  const p = partida!, d = disputaDePenaltis(save!, p);
  pen = { d, vez: 0, cob: [], bm: 0, ba: 0, slot: 0 };
  atualizarPlacar();
  const apto = !expulso && p.entrada <= 90 && Math.min(90, p.saida) >= 90;
  const el = document.createElement("div"); el.className = "disputa"; el.id = "disputa";
  el.innerHTML = `<p class="rotulo" style="color:var(--ouro)">Disputa de pênaltis</p><h2>${esc(p.nomes.meu)} <span id="penPlacar">0 × 0</span> ${esc(p.nomes.adv)}</h2><div class="pen-bolas" id="penBolas"></div>
    ${apto ? `<p class="sub" style="font-size:15px;color:var(--giz)">O técnico olha para o grupo: quem bate?</p><div class="ops" id="penEscolha"><button data-pen="1"><span>Eu bato o primeiro</span><small>›</small></button><button data-pen="5"><span>Eu bato o quinto, o decisivo</span><small>›</small></button><button data-pen="0"><span>Deixar para os outros</span><small>›</small></button></div>` : `<p class="sub">Você já não está em campo. Só resta assistir.</p>`}`;
  $("lances").appendChild(el); el.scrollIntoView({ behavior: "smooth", block: "end" });
  if (apto) $("rodapeJogo").innerHTML = `<p class="sub" style="text-align:center">Escolha uma opção.</p>`;
  else { $("rodapeJogo").innerHTML = ""; timer = window.setTimeout(proximaCobranca, 900); }
}
function escolherSlot(n: number) {
  if (!pen) return;
  pen.slot = n;
  $("penEscolha").outerHTML = `<p class="sub">${n === 1 ? "Você vai abrir a série." : n === 5 ? "A quinta cobrança é sua." : "Você assiste do meio de campo, abraçado aos companheiros."}</p>`;
  timer = window.setTimeout(proximaCobranca, 700);
}
function bolasDisputa() {
  const c = pen!.cob, l = (meu: boolean) => c.filter((x) => x.meu === meu).map((x) => `<i class="${x.ok ? "ok" : "erro"}"></i>`).join("");
  $("penBolas").innerHTML = `<div><small>${esc(partida!.nomes.meu)}</small>${l(true)}</div><div><small>${esc(partida!.nomes.adv)}</small>${l(false)}</div>`;
  const pl = placarDisputa(c); $("penPlacar").textContent = `${pl.meu} × ${pl.adv}`;
}
function proximaCobranca() {
  if (!pen || !partida) return;
  const p = partida, st = placarDisputa(pen.cob);
  if (st.fim) {
    pen.venceu = st.venceu;
    if (pen.slot && !pen.bateu) adicionarLance(120, "A disputa acabou antes da sua vez.", "reacao");
    adicionarLance(120, `<b>${st.venceu ? `${esc(p.nomes.meu)} vence nos pênaltis, ${st.meu} × ${st.adv}!` : `${esc(p.nomes.adv)} vence nos pênaltis, ${st.adv} × ${st.meu}.`}</b>`, st.venceu ? "gol" : "tenso");
    posApito();
    if (fila.length) timer = window.setTimeout(avancar, 1200); else $("rodapeJogo").innerHTML = botaoFimJogo();
    return;
  }
  const minhaVez = (pen.vez % 2 === 0) === pen.d.meuPrimeiro;
  if (minhaVez && pen.slot && pen.bm + 1 === pen.slot && !pen.bateu) {
    pen.bateu = true;
    mostrarDecisao(decisaoDisputa(save!, p));
    return;
  }
  let ok: boolean, txt: string;
  const fal = ["bate e o {g} defende.", "manda na trave.", "chuta por cima.", "bate fraco e o {g} segura."];
  if (minhaVez) { const nome = pen.d.batMeu[pen.bm % pen.d.batMeu.length]; ok = pen.d.meu[pen.bm]; txt = ok ? `${nome} converte.` : `${nome} ${fal[pen.bm % 4].replace("{g}", p.nomes.gol)}`; pen.bm++; }
  else { const nome = pen.d.batAdv[pen.ba % pen.d.batAdv.length]; ok = pen.d.adv[pen.ba]; txt = ok ? `${nome} converte.` : `${nome} ${fal[(pen.ba + 1) % 4].replace("{g}", p.nomes.goleiro)}`; pen.ba++; }
  pen.cob.push({ meu: minhaVez, ok }); pen.vez++;
  adicionarLance(120, `${ok ? "⚽" : "✖"} ${esc(txt)}`, minhaVez ? (ok ? "" : "contra") : ok ? "contra" : "");
  bolasDisputa();
  timer = window.setTimeout(proximaCobranca, 1000);
}

/** Na primeira vez que o jogador marca no jogo, ele escolhe como comemorar. */
function abrirComemoracao(min: number) {
  if (comemorou || expulso) return;
  comemorou = true;
  fila.unshift({ min, decisao: decisaoComemoracao(save!, partida!, min) });
}

/** Diagrama do lance: você, o goleiro, o zagueiro e o companheiro, com uma seta numerada para cada opção. */
type TipoSeta = "gol" | "passe" | "drible" | "defesa" | "outro";
function tipoDaOpcao(teste: Record<string, number> | undefined, rotulo: string): TipoSeta {
  const t = teste ?? {}, top = Object.entries(t).sort((a, b) => b[1] - a[1])[0]?.[0];
  // primeiro o verbo da opção; só sem verbo conhecido vale o atributo principal do teste
  if (/chut|bat|finaliz|cabece|encher|cobrar|colocad|cavadinha|mergulh|encobr|bicicleta|voleio/i.test(rotulo)) return "gol";
  if (/pass|toc|rol|cruz|lanç|enfi|abr|tabel|escor|ajeit|deix|servir|ger/i.test(rotulo)) return "passe";
  if (/dribl|conduz|arranc|corte|caneta|chapéu|pedalada|avanç|corrida/i.test(rotulo)) return "drible";
  if (/desarm|carrinho|marc|cobertura|antecip|bote|afast/i.test(rotulo)) return "defesa";
  if (top === "FIN" || top === "CAB") return "gol";
  if (top === "PAS" || top === "VIS" || top === "CRU") return "passe";
  if (top === "DRI" || top === "VEL") return "drible";
  if (top === "MAR" || top === "POS") return "defesa";
  return "outro";
}
function diagramaLance(d: Decisao): string {
  const sit = SITUACAO[d.situacao];
  if (!sit || sit.momento) return "";
  const tipos = d.opcoes.map((o) => tipoDaOpcao(sit.opcoes.find((x) => x.id === o.id)?.teste as Record<string, number> | undefined, o.rotulo));
  if (tipos.every((t) => t === "outro")) return "";
  const defesa = tipos.filter((t) => t === "defesa").length > tipos.length / 2;
  const [m1] = cores(partida!.souCasa ? partida!.casa : partida!.fora), [a1] = cores(partida!.souCasa ? partida!.fora : partida!.casa);
  const eu: [number, number] = defesa ? [120, 60] : [165, 62], gol: [number, number] = defesa ? [12, 60] : [288, 60];
  const seta = (t: TipoSeta, k: number) => {
    const [x, y] = eu, n = k + 1, iguais = tipos.filter((u) => u === t).length, j = tipos.slice(0, k).filter((u) => u === t).length, off = (j - (iguais - 1) / 2) * 18;
    const fim: [number, number] = t === "gol" ? [defesa ? 18 : 282, 60 + off] : t === "passe" ? [222 + off, 98] : t === "drible" ? [248, 30 + off] : t === "defesa" ? [168, 58 + off] : [x + 20 + off, 16];
    const ctrl: [number, number] = t === "drible" ? [x + 40, y - 50] : t === "passe" ? [x + 30, y + 40] : [(x + fim[0]) / 2, (y + fim[1]) / 2];
    const curva = `M${x} ${y} Q${ctrl[0]} ${ctrl[1]} ${fim[0]} ${fim[1]}`;
    // o número fica a 70% do caminho (ponto da curva quadrática)
    const tt = 0.7, lx = (1 - tt) ** 2 * x + 2 * (1 - tt) * tt * ctrl[0] + tt * tt * fim[0], ly = (1 - tt) ** 2 * y + 2 * (1 - tt) * tt * ctrl[1] + tt * tt * fim[1];
    const cor = ["#E3B341", "#74D394", "#6FA8DC", "#E58FB1"][k % 4];
    return `<defs><marker id="ponta${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="${cor}"/></marker></defs><path d="${curva}" stroke="${cor}" stroke-width="2.4" fill="none" stroke-dasharray="${t === "outro" ? "4 4" : "0"}" marker-end="url(#ponta${k})"/>
      <circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="7.5" fill="${cor}" stroke="#0008" stroke-width="1"/><text x="${lx.toFixed(1)}" y="${(ly + 3.2).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="900" fill="#111">${n}</text>`;
  };
  const jog = (x: number, y: number, cor: string, txt = "") => `<circle cx="${x}" cy="${y}" r="7" fill="${cor}" stroke="#fff" stroke-width="1.4"/>${txt ? `<text x="${x}" y="${y + 3}" text-anchor="middle" font-size="7.5" font-weight="900" fill="${luzCor(cor) > 0.6 ? "#111" : "#fff"}">${txt}</text>` : ""}`;
  return `<svg class="diagrama-lance" viewBox="0 0 300 120" aria-hidden="true"><rect width="300" height="120" rx="8" fill="#2A6E3F"/><g fill="none" stroke="#ffffff88" stroke-width="1.2">${defesa ? `<rect x="2" y="30" width="44" height="60"/><rect x="2" y="46" width="14" height="28"/><path d="M290 2 V118"/>` : `<rect x="254" y="30" width="44" height="60"/><rect x="284" y="46" width="14" height="28"/><path d="M10 2 V118"/>`}<circle cx="${defesa ? 290 : 10}" cy="60" r="18"/></g>
    <rect x="${gol[0] - 3}" y="50" width="6" height="20" fill="#fff"/>
    ${defesa ? jog(170, 56, a1) + jog(30, 60, m1, "GK") : jog(282, 60, a1, "GK") + jog(222, 46, a1) + jog(222, 98, m1)}
    ${tipos.map(seta).join("")}${jog(eu[0], eu[1], m1, esc(save!.jogador.numero))}</svg>`;
}
function mostrarDecisao(d: Decisao) {
  const i = nDec++; decisoesAbertas[i] = d;
  const el = document.createElement("div"); el.className = "decisao"; el.id = `dec${i}`;
  const pos = SITUACAO[d.situacao]?.momento === "pos";
  const diag = diagramaLance(d);
  el.innerHTML = `<p class="rotulo" style="color:var(--ouro)">${pos ? "Depois do jogo" : `${d.min}' · Sua decisão`}</p><h2>${esc(d.titulo)}</h2>${diag}<p class="sub" style="font-size:15px;color:var(--giz)">${esc(d.texto)}</p>
    <div class="ops">${d.opcoes.map((o, k) => `<button data-decidir="${i}" data-op="${o.id}">${diag ? `<i class="num-op n${k % 4}">${k + 1}</i>` : ""}<span>${esc(o.rotulo)}</span><small>›</small></button>`).join("")}</div>`;
  $("lances").appendChild(el); el.scrollIntoView({ behavior: "smooth", block: "end" });
  $("rodapeJogo").innerHTML = `<p class="sub" style="text-align:center">Escolha uma opção.</p>`;
}

function decidir(i: number, op: string) {
  const p = partida!, d = decisoesAbertas[i];
  if (!d) return;
  delete decisoesAbertas[i];
  const r = resolverDecisao(save!, p, d, op);
  const el = $(`dec${i}`);
  if (d.situacao === "disputaPenaltis" && pen) {
    // a sua cobrança: entra nos pênaltis, não no placar do jogo
    const ok = r.nivel <= 1;
    pen.converteu = ok;
    el.querySelector(".ops")!.innerHTML = `<div class="resultado n${ok ? 0 : 4}">${esc(r.texto)}</div>`;
    pen.cob.push({ meu: true, ok }); pen.bm++; pen.vez++;
    bolasDisputa();
    $("rodapeJogo").innerHTML = "";
    timer = window.setTimeout(proximaCobranca, 1400);
    return;
  }
  resultados.push(r);
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
    fila = fila.filter((x) => !x.decisao && !x.saida && !x.jogador).map((x) => (x.meu ? { ...x, meu: undefined } : x));
  } else if (r.sai) {
    expulso = true;
    novos.push({ min: d.min, html: `${esc(save!.jogador.apelido)} deixa o campo.` });
    fila = fila.filter((x) => !(x.decisao && SITUACAO[x.decisao.situacao]?.momento !== "pos") && !x.saida && !x.jogador).map((x) => (x.meu ? { ...x, meu: undefined } : x));
  } else if (r.amarelo) novos.push({ min: d.min, html: `<span class="cartao"></span>Cartão amarelo para ${esc(save!.jogador.apelido)}.` });
  const re = reacaoDecisao(r, d);
  if (re && !r.vermelho && !r.sai) novos.push({ min: d.min, html: re, cls: "reacao" });
  fila.unshift(...novos);
  atualizarPlacar();
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
  const c = save!.carreira;
  /** Card de partida: escudos e placar, anel da nota, gols e assistências em ícones, minutos em barra. */
  const cardPartida = (p: ResumoPartida, faixa: string) => {
    const jogou = p.minutos > 0;
    return `<section class="painel res-jogo"><p class="rotulo">${faixa}${p.melhorEmCampo ? ` <span class="selo-mvp">★ Melhor em campo</span>` : ""}</p>
      <div class="res-placar">${p.idCasa ? escudo(p.idCasa) : ""}<span class="rp-nome">${esc(p.nomeCasa)}</span><b>${p.golsCasa}<i>×</i>${p.golsFora}</b><span class="rp-nome">${esc(p.nomeFora)}</span>${p.idFora ? escudo(p.idFora) : ""}</div>
      ${p.penaltis ? `<p class="sub" style="text-align:center">${esc(p.penaltis)} venceu nos pênaltis</p>` : ""}
      ${jogou ? `<div class="res-eu">${anelNota(p.nota)}<div class="res-stats"><div class="res-min"><span>⏱ ${p.minutos}'</span><i style="--v:${Math.min(100, (p.minutos / 90) * 100)}%"></i></div>
        <div class="res-ico">${p.gols ? `<span title="gols">${repetir("⚽", p.gols)}</span>` : ""}${p.assist ? `<span title="assistências">${repetir("👟", p.assist)}</span>` : ""}${!p.gols && !p.assist ? `<span class="sub">sem gol nem assistência</span>` : ""}</div></div></div>`
        : `<p class="sub res-nao">🪑 ${p.escalacao && p.escalacao !== "banco" && p.escalacao !== "titular" ? esc(NOME_ESCALACAO[p.escalacao]) : "Não entrou em campo"}</p>`}</section>`;
  };
  const p = r.partida, ligaId = infoLiga(c.ligaId).id;
  const partidaHtml = p ? cardPartida(p, faixaComp(p.competicao ? compPorNome(p.competicao) : p.tipo === "base" ? "BASE" : ligaId, p.tipo === "base" ? "Jogo da base" : esc(p.competicao ?? infoLiga(c.ligaId).curto)))
    : `<section class="painel res-semjogo"><span class="rs-ico">${r.escalacao === "lesionado" ? "🩹" : r.escalacao === "suspenso" ? "🟥" : r.escalacao === "semJogo" ? "🏋️" : "🪑"}</span><div><p class="rotulo">${esc(r.rotulo)}</p><b>${esc(NOME_ESCALACAO[r.escalacao])}</b>${r.escalacao === "semJogo" ? `<small>Semana de treinos</small>` : ""}</div></section>`;
  const q = r.copa, copaHtml = q ? cardPartida(q, faixaComp(compPorNome(q.competicao), `Quarta · ${esc(q.competicao ?? "Copa")}${q.rotulo ? ` · ${esc(q.rotulo)}` : ""}`)) : "";
  const ft = r.fimDeTemporada;
  const fim = ft ? `<section class="painel res-fim"><p class="rotulo">Fim da temporada ${ft.ano}</p><div class="res-fim-topo"><span class="rf-pos">${ft.titulo ? "🏆" : `${ft.posicao}º`}</span><div><h2 style="margin:0">${esc(ft.clube)}</h2><small class="sub">${ft.titulo ? "Campeão!" : `${ft.posicao}º lugar`}</small></div></div>
      <div class="cartas-num">${[["Jogos", ft.jogos, "🏟️"], ["Gols", ft.gols, "⚽"], ["Assist.", ft.assist, "👟"], ["OVR", ft.ovr, "📈"]].map(([n, v, i]) => `<div class="carta-num"><span>${i}</span><b>${v}</b><small>${n}</small></div>`).join("")}</div>
      ${[ft.estadual, ft.copa, ...(ft.extras ?? [])].filter(Boolean).map((k) => `<p class="res-copa">${faixaComp(k!.id, esc(COPAS[k!.id].curto))}<span>${k!.jogos} j · ${k!.gols} g · ${esc(k!.fase ?? "")}</span></p>`).join("")}
      ${ft.premios?.length ? `<div class="res-premios">${ft.premios.map((x) => `<span>🏆 ${esc(x)}</span>`).join("")}</div>` : ""}
      <button class="botao" style="width:100%;margin-top:10px" data-retro="${ft.ano}">Ver a retrospectiva de ${ft.ano}</button></section>` : "";
  const blocos = [
    blocoDelta("❤️", "Moral", r.moral[0], r.moral[1]), blocoDelta("🔋", "Cansaço", r.cansaco[0], r.cansaco[1], undefined, true), blocoDelta("⭐", "Fama", r.fama[0], r.fama[1]),
    ...(r.seguidores ? [blocoDelta("📱", "Seguidores", r.seguidores[0], r.seguidores[1], compacto)] : []),
    ...(r.saldo ? [blocoDelta("💰", "Saldo", r.saldo[0], r.saldo[1], dinheiroCurto)] : []),
    ...(r.relTecnico && !c.fase ? [blocoDelta("📋", "Técnico", r.relTecnico[0], r.relTecnico[1])] : []),
    ...(r.torcida && !c.formacao && !c.fase ? [blocoDelta("📣", "Torcida", r.torcida[0], r.torcida[1])] : []),
    ...(r.posicaoTabela && !ft && c.semana > SEMANAS_PRE ? [`<div class="bloco-delta"><span class="bd-ico">🏟️</span><b>${r.posicaoTabela}º</b><small>Na tabela</small><i>${esc(infoLiga(c.ligaId).curto)}</i></div>`] : []),
  ].join("");
  const maxG = Math.max(0.01, ...r.ganhos.map(([, v]) => Math.abs(v)));
  const evo = `<section class="painel res-evo"><div class="res-ovr"><span class="rotulo">OVR</span><b>${Math.round(r.ovrDepois)}</b><i class="${r.ovrDepois - r.ovrAntes > 0.005 ? "pos" : ""}">${sinal(r.ovrDepois - r.ovrAntes, 2)}</i></div>
    <div class="res-ganhos">${r.ganhos.map(([a, v]) => `<div><span>${NOME_AT[a]}</span><i style="--v:${Math.max(4, (Math.abs(v) / maxG) * 100)}%" class="${v > 0 ? "pos" : v < 0 ? "neg" : ""}"></i><b>${sinal(v, 2)}</b></div>`).join("")}</div></section>`;
  const eventos = r.eventos.filter((e) => !/seguidores nas redes/.test(e));
  $("telaResumo").innerHTML = `<div class="resumo"><p class="rotulo">${esc(r.rotulo)}</p><h1>Resumo da semana</h1>${copaHtml}${partidaHtml}${fim}${ft && c.premiosLiga ? `<section class="painel">${premiosLigaHtml(save!)}</section>` : ""}${ft && c.premiosMundo ? `<section class="painel">${premiosMundoHtml(save!)}</section>` : ""}
    <div class="blocos-delta">${blocos}</div>
    ${r.dinheiro ? `<div class="res-dinheiro"><span>💵 Salário <b class="pos">+${dinheiroCurto(r.dinheiro.salario)}</b></span>${r.dinheiro.aluguel ? `<span>🏠 Aluguel <b class="neg">−${dinheiroCurto(r.dinheiro.aluguel)}</b></span>` : ""}${r.dinheiro.gastos ? `<span>🛒 Gastos <b class="neg">−${dinheiroCurto(r.dinheiro.gastos)}</b></span>` : ""}</div>` : ""}
    ${evo}
    ${eventos.length ? cartoesEventos(eventos) : ""}
    </div><div class="rodape"><button class="botao grande" data-acao="proxima">Próxima semana</button></div>`;
  ($("dlgResumo") as HTMLDialogElement).showModal();
}

// ------------------------------------------------------------------ eventos
document.addEventListener("click", (ev) => {
  const b = (ev.target as Element).closest<HTMLElement>("[data-acao],[data-chat],[data-cena],[data-oca],[data-subvida],[data-parca],[data-afastar],[data-luxo],[data-vender-luxo],[data-hobby],[data-curso],[data-doacao],[data-staff],[data-tratar],[data-operar],[data-emp],[data-abrir],[data-inv],[data-propneg],[data-assessor],[data-post],[data-pauta],[data-retro],[data-retro-ir],[data-evo],[data-subjog],[data-filho],[data-subtab],[data-outras],[data-fnot],[data-relabre],[data-assinar],[data-foco],[data-int],[data-dia],[data-aba],[data-decidir],[data-pen],[data-prop],[data-agente],[data-evento],[data-vida],[data-patro],[data-negoc],[data-aumento],[data-vis],[data-ap],[data-abaap],[data-traje],[data-tarea],[data-tat],[data-tat-remover],[data-sair],[data-trofeu],[data-camisa],[data-rel],[data-tpos],[data-mudapos],[data-sug],[data-caminho],[data-cidade],[data-convite],[data-num],[data-num-manter],[data-cel],[data-fav],[data-fam],[data-bliga],[data-bclube],[data-curtir],[data-nam],[data-vtab],[data-bbase],[data-hist],[data-vmerc],[data-janela],[data-fjanela],[data-vsel]");
  if (!b) return;
  const d = b.dataset;
  if (d.assinar) {
    const dados = ler<DadosCriacao>(CHAVE_JOGADOR)!;
    dados.aparencia = aparenciaCompat(dados.aparencia);
    dados.caminho = caminhoSel; dados.cidade = caminhoSel === "varzea" ? cidadeSel ?? cidadeDaVarzea(pacote, dados.clube) : undefined;
    save = novoJogo(pacote, dados, d.assinar); plano = planoPadrao(); salvar(); render(); window.scrollTo(0, 0);
  } else if (d.foco) { plano.foco = d.foco as Grupo; salvar(); render(); }
  else if (d.int) { plano.intensidade = d.int as Intensidade; salvar(); render(); }
  else if (d.dia) { plano.acoes[+d.dia] = d.a as Acao; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.oca) { const r = responderOcasiaoJogo(pacote, save!, d.oca, d.op!); msgVida = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.subvida) { subVida = d.subvida as typeof subVida; const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.parca !== undefined && d.funcao !== undefined) { const r = funcaoParcaJogo(save!, d.parca, d.funcao as FuncaoParca | ""); msgVida = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.afastar) {
    if (afastarCerteza !== d.afastar) afastarCerteza = d.afastar;
    else { afastarCerteza = undefined; const r = afastarParcaJogo(pacote, save!, d.afastar); msgVida = { ok: r.ok, texto: r.msg }; salvar(); }
    const y = window.scrollY; render(); window.scrollTo(0, y);
  }
  else if (d.luxo) { const r = comprarLuxoJogo(save!, d.luxo as TipoLuxo); msgVida = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.venderLuxo) { const r = venderLuxoJogo(save!, d.venderLuxo); msgVida = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.hobby) { const r = hobbyJogo(save!, d.hobby as Hobby); msgVida = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.curso !== undefined) { const r = matricularJogo(save!, d.curso as Curso | ""); msgVida = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.doacao !== undefined) { const r = nivelFundacaoJogo(save!, +d.doacao as 0 | 1 | 2 | 3); msgVida = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.staff) { const r = equipeJogo(save!, d.staff as Staff, d.on === "1"); msgJog = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.tratar) { const r = tratarJogo(save!, d.tratar as ParteCorpo); msgJog = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.operar) {
    if (operarCerteza !== d.operar) operarCerteza = d.operar;
    else { operarCerteza = undefined; const r = operarJogo(save!, d.operar as ParteCorpo); msgJog = { ok: r.ok, texto: r.msg }; salvar(); }
    const y = window.scrollY; render(); window.scrollTo(0, y);
  }
  else if (d.emp) { const r = agirEmpresaJogo(pacote, save!, d.emp, d.op as AcaoEmpresa); msgJog = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.abrir) { const r = abrirEmpresaJogo(pacote, save!, d.abrir as TipoEmpresa); msgJog = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.inv) { const r = aplicarJogo(save!, d.inv as TipoInvest, +d.valor!); msgJog = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.propneg) { const r = responderPropostaNegocio(pacote, save!, d.propneg === "1"); msgJog = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.assessor) { const r = assessorJogo(save!, d.assessor === "1"); msgJog = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.post) { const r = postarJogo(pacote, save!, d.post as TipoPost); msgRel = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.pauta) { const r = responderEntrevistaJogo(pacote, save!, d.pauta); msgRel = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.aba) { aba = d.aba as typeof aba; if (d.ir === "negocios" || d.ir === "saude") subJogador = d.ir; if (d.ir === "redes") telaCel = "redes"; if (d.ir === "agenda") subVida = "agenda"; render(); if (b.classList.contains("aviso-mercado")) document.querySelector(".abas")?.scrollIntoView({ behavior: "smooth" }); }
  else if (d.negoc && save) { const r = negociarItem(pacote, save, d.negoc, d.item as never); msgMercado = { texto: r.msg, ok: r.ok }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.aumento && save) { const r = pedirAumento(pacote, save, forma(save.carreira)); msgJog = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.prop && save) {
    const r = d.op === "aceitar" ? aceitar(pacote, save, d.prop) : d.op === "forcar" ? aceitar(pacote, save, d.prop, true) : d.op === "negociar" ? negociar(pacote, save, d.prop) : recusar(pacote, save, d.prop);
    msgMercado = { texto: r.msg, ok: r.ok }; salvar(); render();
    if (r.ok && (d.op === "aceitar" || d.op === "forcar")) window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (d.agente && save) { const r = trocarAgente(save, d.agente as TipoAgente); msgMercado = { texto: r.msg, ok: r.ok }; salvar(); render(); }
  else if (d.decidir) decidir(+d.decidir, d.op!);
  else if (d.pen !== undefined) escolherSlot(+d.pen);
  else if (d.patro && save) {
    if (d.patro === "recusar") recusarPatrocinio(save); else cartazNovo = aceitarPatrocinio(save, d.patro as TipoContrato);
    salvar(); const y = window.scrollY; render(); window.scrollTo(0, y);
  }
  else if (d.vis && save) {
    const v = visualDe(save.jogador) as unknown as Record<string, unknown>;
    v[d.vis] = d.vis === "corCasual" || d.vis === "corMunhequeira" ? +d.val! : d.vis === "semAcessorioPatro" ? !!d.val : d.val; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y);
  } else if (d.ap && save) {
    const ap = (save.jogador.aparencia ??= { ...APARENCIA_PADRAO }) as unknown as Record<string, unknown>;
    ap[d.ap] = ["corCabelo", "corAcessorio"].includes(d.ap) ? +d.val! : ["brinco", "brinco2", "corrente"].includes(d.ap) ? d.val === "1" : d.val;
    salvar(); const y = window.scrollY; render(); window.scrollTo(0, y);
  } else if (d.abaap) { abaAp = d.abaap as typeof abaAp; const y = window.scrollY; render(); window.scrollTo(0, y);
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
  else if (d.hist) abrirHistorico(d.hist);
  else if (d.vsel) { vistaSelecao = d.vsel as typeof vistaSelecao; const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.vmerc || d.janela || d.fjanela) {
    if (d.vmerc) vistaMercado = d.vmerc as typeof vistaMercado;
    if (d.janela) janelaVista = d.janela;
    if (d.fjanela) filtroJanela = d.fjanela as typeof filtroJanela;
    const y = window.scrollY; render(); window.scrollTo(0, y);
  }
  else if (d.bbase) { buscaBase = d.bbase === "1"; const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.retro) abrirRetro(+d.retro);
  else if (d.retroIr !== undefined && retro) { retro.passo = +d.retroIr; $("telaRetro").innerHTML = retroHtml(save!, retro.ano, retro.passo); }
  else if (d.evo) { metricaEvo = d.evo as MetricaEvo; const t = $("telaPerfil"), y = t.scrollTop; t.innerHTML = perfilHtml(save!); t.scrollTop = y; }
  else if (d.subtab || d.outras || d.fnot || d.relabre) {
    if (d.subtab) subTabela = d.subtab as typeof subTabela;
    else if (d.outras) verOutras = !verOutras;
    else if (d.fnot) filtroNoticia = d.fnot as typeof filtroNoticia;
    else relAberto = relAberto === d.relabre ? undefined : d.relabre;
    const y = window.scrollY; render(); window.scrollTo(0, y);
  }
  else if (d.subjog) { subJogador = d.subjog as typeof subJogador; const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.vtab) { vistaTabela = d.vtab as typeof vistaTabela; tabelaEscolhida = true; const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.cel) { telaCel = d.cel as typeof telaCel; render(); }
  else if (d.fav && save) { alternarFavorito(relacoesDe(save.carreira), d.fav); salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.fam && save) { const r = agirFamiliaJogo(pacote, save, d.fam, d.op as AcaoFamilia); msgRel = { texto: r.msg, ok: r.ok }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.bliga) { buscaLiga = d.bliga; buscaClube = undefined; render(); }
  else if (d.bclube) { buscaClube = d.bclube; const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.curtir && save) { const r = curtirPerfil(pacote, save, d.curtir, d.sim === "1"); msgRel = { texto: r.msg, ok: r.ok }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.filho !== undefined && save) { const r = agirFilhoJogo(pacote, save, Number(d.filho), d.op as AcaoFilho); msgRel = { texto: r.msg, ok: r.ok }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.nam && save && !d.extra && (d.op === "encontro" || d.op === "convidar" || d.op === "pedirCasamento")) { escolhaNam = escolhaNam?.id === d.nam && escolhaNam.op === d.op ? undefined : { id: d.nam, op: d.op }; const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.nam && save) { escolhaNam = undefined; const r = agirNamoroJogo(pacote, save, d.nam, d.op as AcaoNamoro, d.extra); msgRel = { texto: r.msg, ok: r.ok }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.chat && save) { const r = responderChatJogo(pacote, save, d.chat, d.estilo!); if (r.msg) msgRel = { texto: r.msg, ok: r.ok }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
  else if (d.cena && save) { const r = responderCenaJogo(save, d.cena, d.op!); msgRel = { texto: r.msg, ok: r.ok }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); }
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
      gravar(CHAVE_JOGADOR, { resultado: criarJogador(e), aparencia: { ...APARENCIA_PADRAO, cabelo: "cacheado", pele: 4 }, clube: "FLA", perfil: undefined, decisao: null });
      render(); break;
    }
    case "jogar": abrirJogo(); break;
    case "perfil": abrirPerfil(); break;
    case "aposentar":
      if (b.dataset.certeza) { const r = anunciarAposentadoria(save!); salvar(); abrirPerfil(); render(); void r; }
      else { b.dataset.certeza = "1"; b.textContent = "Toque de novo para confirmar: é a última temporada"; }
      break;
    case "desistir-aposentadoria": desistirAposentadoria(save!); salvar(); abrirPerfil(); render(); break;
    case "fechar-perfil": ($("dlgPerfil") as HTMLDialogElement).close(); break;
    case "vida-toda": { vidaAberta = !vidaAberta; const t = $("telaPerfil"), y = t.scrollTop; t.innerHTML = perfilHtml(save!); t.scrollTop = y; break; }
    case "churrasco": { const r = churrascoJogo(save!); msgVida = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); break; }
    case "fundacao": { const r = criarFundacaoJogo(pacote, save!); msgVida = { ok: r.ok, texto: r.msg }; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); break; }
    case "fechar-retro": ($("dlgRetro") as HTMLDialogElement).close(); retro = undefined; break;
    case "baixar-save": void baixarSave(); break;
    case "carregar-save":
      if (save && !b.dataset.certeza) { b.dataset.certeza = "1"; b.textContent = "Toque de novo: substitui a carreira atual"; break; }
      ($("arqSave") as HTMLInputElement).click(); break;
    case "oferecer": if (save) { const r2 = oferecerJogador(save); msgMercado = { texto: r2.msg, ok: r2.ok }; salvar(); render(); } break;
    case "fechar-hist": ($("dlgHist") as HTMLDialogElement).close(); break;
    case "fechar-anuncio": gravar(CHAVE_ANUNCIO, b.dataset.chave); render(); break;
    case "sair": case "ficar": if (save) { const r = pedirParaSair(save, d.acao === "sair"); msgMercado = { texto: r.msg, ok: r.ok }; salvar(); render(); } break;
    case "pular": if (save) {
      // atalho de teste: o jogo segue no automático (sem mexer no mercado) até abrir a próxima janela com você profissional
      const c = save.carreira;
      let n = 0, saiu = !janelaAberta(c);
      const vida = { familia: 0, filhos: 0, par: 0, outros: 0, amigos: 0 };
      let erro = "";
      while (n < 60) {
        let r: ReturnType<typeof semanaAutomatica>;
        try { r = semanaAutomatica(pacote, save, false); } catch (e) { erro = String((e as Error)?.message ?? e); console.error(e); break; }
        n++;
        for (const k of Object.keys(vida) as (keyof typeof vida)[]) vida[k] += r.vidaAuto?.[k] ?? 0;
        if (save.carreira.encerrada) break;
        const jan = janelaAberta(c);
        if (!jan) saiu = true;
        else if (saiu && save.jogador.idade >= 18 && !c.formacao && (mercadoDe(c).propostas.length || c.semana >= jan.fim)) break;
      }
      plano = planoPadrao(); aba = "mercado"; const feito = [vida.familia && `${vida.familia}× falou com a família`, vida.par && `${vida.par} programas a dois`, vida.filhos && `${vida.filhos}× com os filhos`, vida.outros && `${vida.outros} conversas com casinhos e matches`, vida.amigos && `${vida.amigos} mensagens para amigos`].filter(Boolean);
      msgMercado = erro ? { texto: `A simulação parou depois de ${n} semanas por um erro: ${erro}. Baixe o save (aba Vida) e mande para corrigir.`, ok: false } : { texto: `${n} semanas simuladas.${feito.length ? ` Nesse tempo, você ${feito.join(", ")}.` : ""}`, ok: true }; salvar(); render(); window.scrollTo(0, 0);
    } break;
    case "acelerar": clearTimeout(timer); avancar(); break;
    case "fimjogo": fecharSemana(); break;
    case "fimcopa": fecharJogoDaCopa(); break;
    case "proxima": ($("dlgResumo") as HTMLDialogElement).close(); window.scrollTo(0, 0); break;
    case "recomecar":
      if (b.dataset.certeza) { try { localStorage.removeItem(CHAVE_SAVE); localStorage.removeItem(CHAVE_PLANO); } catch { /* ok */ } save = null; render(); }
      else { b.dataset.certeza = "1"; b.textContent = "Toque de novo para apagar tudo"; }
      break;
  }
});
$("dlgJogo").addEventListener("cancel", (ev) => ev.preventDefault());
document.addEventListener("keydown", (ev) => { if ((ev.key === "Enter" || ev.key === " ") && (ev.target as HTMLElement).classList?.contains("card-jogador")) { ev.preventDefault(); abrirPerfil(); } });
$("arqSave").addEventListener("change", (ev) => { const i = ev.target as HTMLInputElement, f = i.files?.[0]; if (f) carregarSave(f); i.value = ""; });
void SEMANAS_PRE;
render();
