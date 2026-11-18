// Modo técnico: a página. Mesmo mundo e mesmo visual do modo jogador; o save fica em outra chave.
import pacoteJson from "../../data/pacote-brasil-serie-a-v0.3.json";
import type { PacoteDados } from "../../src/liga";
import { ordenar } from "../../src/liga";
import { mundo, infoClube, idClube, sincronizarMundo, momentoDoClube } from "../../src/mundo";
import { infoLiga } from "../../src/ligas";
import { ATRIBUTOS } from "../../src/atributos";
import { valorBrl, curtoBrl, definirMoeda, numBrl, simboloAtual, moedaAtual, MOEDAS } from "../../src/moeda";
import { svgEscudo, corpoEscudo } from "../visual/escudos";
import { camisaFrente } from "../visual/camisas";
import { nomeNoPeito, nomeNaManga, emblemaTouros, coresAtras, corQueAparece, comFilete, type ParteCamisa } from "../visual/peito";
import { simboloMarca, logoSvg, LOGO_E_NOME, fonteDaMarca } from "../jogo/poster";
import { patroDoClube, type EstadoPatroMundo } from "../../src/patro-mundo";
import { MARCA, NOME_CATEGORIA } from "../../src/marcas";
import { UNIFORME_CLUBE } from "../../src/reliquias";
import { responderEvento, rankingT, TIPO_CONTATO } from "../../src/tecnico/vida";
import { patrociniosDe, ofertasPatro, mesaPatro, negociarPatro, corDoPatro, formaDoPatro, receitaPatro, arenaDoClube, COTAS, ORDEM_COTAS, type Cota } from "../../src/tecnico/patrocinio";
import { svgEstadio, aparenciaDoEstadio } from "../visual/estadio";
import { fotoDoPerfil } from "../visual/mulheres";
import { gerarEstatCompleta } from "../../src/estatisticas-completas";
import { montarRevista, type EdicaoRevista, type ListaRevista } from "../../src/revista";
import { revistaHtml } from "../visual/revista";
import { estatCompletaHtml } from "../visual/estat-campo";
import { svgFoto, APARENCIA_PADRAO, CABELOS, CABELOS_TECNICO, NOMES_CABELO_COR, CORES_CABELO, BARBAS, ROUPAS_TECNICO, type Aparencia, type RoupaTecnico } from "../criacao/avatar";
import { rostoParente } from "../visual/rostos";
import { NOME_ACAO_FAM, NOME_PARENTESCO, rotuloRelacaoFam, falaSobreVoce, idadeDe, type AcaoFamilia, type EstadoFamilia } from "../../src/familia";
import { NOME_ACAO_NAMORO, NOME_ACAO_FILHO, NOME_ACAO_EX, NOME_ETAPA, PROFISSOES, TEXTO_FIM, gravidasDe, type AcaoNamoro, type AcaoFilho, type AcaoEx, type EstadoNamoro } from "../../src/namoro";
import { IMOVEL, nomeImovel, patrimonio, type EstadoCasa } from "../../src/casa";
import { EMPRESAS, INVEST, DECISOES, FRANQUIAVEIS, MAX_UNIDADES, CUSTO_ASSESSOR, patrimonioInvestido, type EstadoNegocios, type TipoEmpresa, type TipoInvest, type AcaoEmpresa, type DecisaoMes } from "../../src/negocios";
import { negociosT, abrirEmpresaT, agirEmpresaT, decidirMesT, franquiaT, aplicarT, responderPropostaNegT, assessorT, semanaVida, casaT, acoesFamiliaT, agirFamiliaT, acoesParT, agirParT, acoesFilhoT, agirFilhoT, exesT, acoesExT, agirExT, perfisDaSemanaT, curtirT, salarioTecnico, bolso, trazerVida, anoVida } from "../../src/tecnico/familia-t";
import { rankingCopaT, copasT, jogoCopaT } from "../../src/tecnico/copas-t";
import { chanceSituacao } from "../../src/tecnico/gestao";
import { patroSel, ofertasSel, mesaSel, negociarSel, COTAS_SEL, NOME_COTA_SEL, type CotaSel } from "../../src/tecnico/patro-sel";
import { poolSel, convocarMelhores, convocadosDe, forcaMinhaSel, copasSel, proximoJogoSel, metaNoTorneio, textoMeta, aceitarSelecao, deixarSelecao, listaSelecoes, declararInteresseSel, FORMACOES_SEL, POS_ORDEM, type Candidato, type Formacao, type Estilo } from "../../src/tecnico/selecao-t";
import { Album, figurinhaArte, type CtxFig, type CapaAlbum } from "../visual/album";
import type { Figurinha } from "../../src/figurinhas";
import { bandeiraSvg } from "../../src/bandeiras";
import { rankingCamisas, totalCamisas, fmtMil, precoCamisa } from "../../src/camisas";
import { scoutDe, faixaDe, textoFaixa, textoPot, statusObs, observar, mudarFoco, vagasFoco, vagasObs, forcaScout, olhoScout, FOCO_JOVENS, FOCO_LIVRES, type Faixa } from "../../src/tecnico/scout";
import { DEPS, NOME_DEP, HABS, HABS_DEP, NOME_HAB, CARGOS, CARGOS_DEP, CHEFE_DEP, notaNoCargo, fatorChefe, melhoresHabs, type Dep, type Cargo, type Hab } from "../../src/tecnico/staff";
import { listaEmpregos, ligasDoMercado, vagasAbertas, situacaoDoClube, declararInteresse, candidatar, NOME_STATUS, type SituacaoClube } from "../../src/tecnico/empregos";
import { ENTREVISTA, NOME_PERFIL, perfilDoClube, abrirNegociacao, responderEntrevista, negociarContrato } from "../../src/tecnico/contrato";
import { COPAS, NOME_FASE, rotuloJogo, type EstadoCopa } from "../../src/copas";
import { titulosDoClube, timeDeTodosOsTempos, recordesHistoricosDoClube, plantelDoClube, type TemporadaUsuario, type RecordeNome, type TitularHistorico } from "../../src/perfil-clube";
import { EXTRAS, NOME_EXTRA, DICA_EXTRA } from "../../src/detalhes";
import { funcoesDa, encaixe, estrelasEncaixe } from "../../src/funcoes";
import { NOME_LINGUA, rotuloNivel, linguaDe, nivelEm, idiomasIniciais } from "../../src/idiomas";
/** Do save do jogador aposentado: licença (dos Estudos) e idiomas (nível de 0 a 3 vira 0 a 95). */
type HistJ = { ano: number; idade: number; clube: string; clubeId?: string; nota?: number; jogos: number; gols: number; assist: number; titulo: boolean; base: number; parcial?: boolean; premios?: string[] };
type SaveJogador = { semente: string; casa?: { saldo?: number }; jogador: { nome: string; apelido: string; nacionalidade: string; idade: number; posicao?: string; aparencia?: Partial<Aparencia> };
  carreira: { album?: Figurinha[]; encerrada?: { ano: number; idade: number; texto: string; nivel?: { titulo: string }; recordes?: string[] }; fama: number; temporada: number; historico?: HistJ[];
    estudos?: { idiomas: Record<string, number>; formacoes: string[] };
    relacoes?: { lista: Record<string, { nome: string; clubeId: string; nivel: number; aposentado?: boolean; companheiro?: boolean }> };
    namoro?: { filhos?: { nome: string; ano: number; menina?: boolean; futebol?: { fase: string; ovr: number; pot: number; clubeId?: string } }[] };
    familia?: { membros: { id: string; nome: string; parentesco: string; nasc: number; falecido?: number; futebol?: { fase: string; posicao: string; ovr: number; pot: number; clubeId?: string } }[] } } };
/** Tudo o que vem da carreira de jogador para a de técnico: o mesmo mundo, a bio, os amigos e a família que ainda joga. */
function vindoDoJogador(jog: SaveJogador, pausa: number): NonNullable<DadosTecnico["vindoDe"]> {
  const c = jog.carreira, h = (c.historico ?? []).filter((x) => x.jogos > 0 || x.base === 0), enc = c.encerrada;
  const ano = enc?.ano ?? (h.at(-1)?.ano ?? ANO_INICIAL_T + c.temporada);
  const clubes = h.map((x) => x.clube).filter((x, i, l) => x && l.indexOf(x) === i);
  const bio = { apelido: jog.jogador.apelido, nivel: enc?.nivel?.titulo, texto: enc?.texto, clubes, jogos: h.reduce((a, x) => a + x.jogos, 0), gols: h.reduce((a, x) => a + x.gols, 0), assist: h.reduce((a, x) => a + x.assist, 0), titulos: h.filter((x) => x.titulo).length, aposentouEm: ano, idade: enc?.idade ?? jog.jogador.idade, recordes: enc?.recordes?.slice(0, 4), premios: [...new Set(h.flatMap((x) => x.premios ?? []))].slice(0, 6) };
  const contatos = Object.values(c.relacoes?.lista ?? {}).filter((r) => !r.aposentado && r.nivel >= 20).map((r) => ({ nome: r.nome, nivel: r.nivel, tipo: (r.nivel >= 40 ? "amigo" : "excompanheiro") as "amigo" | "excompanheiro" }));
  const POS = ["ZAG", "LAT", "VOL", "MEI", "PON", "ATA"] as const, hh = (t: string) => { let x = 0; for (const ch of t) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return x; };
  const familia = [
    ...(c.namoro?.filhos ?? []).filter((f) => f.futebol && f.futebol.fase !== "parou").map((f) => ({ nome: f.nome, parentesco: f.menina ? "filha" : "filho", idade: ano - f.ano, ovr: f.futebol!.ovr, pot: f.futebol!.pot, pos: POS[hh(f.nome) % POS.length], clubeId: f.futebol!.clubeId, fase: f.futebol!.fase })),
    ...(c.familia?.membros ?? []).filter((m) => !m.falecido && m.futebol && ["base", "pro", "amador"].includes(m.futebol.fase) && (m.parentesco === "irmao" || m.parentesco === "irma")).map((m) => ({ nome: m.nome, parentesco: m.parentesco === "irma" ? "irmã" : "irmão", idade: ano - m.nasc, ovr: m.futebol!.ovr, pot: m.futebol!.pot, pos: (m.futebol!.posicao as PosT) ?? "MEI", clubeId: m.futebol!.clubeId, fase: m.futebol!.fase })),
  ].filter((f) => f.idade >= 15 && f.idade <= 37);
  // as temporadas de jogador, clube a clube: entram na história de cada clube (recordes e time de todos os tempos)
  const temporadas = h.filter((x) => x.clubeId && x.jogos > 0).map((x) => ({ clubeId: x.clubeId!, t: x.ano - ANO_INICIAL_T, j: x.jogos, g: x.gols, a: x.assist, ...(x.nota ? { nota: x.nota } : {}) }));
  const bioCompleta = { ...bio, ...(jog.jogador.posicao ? { pos: jog.jogador.posicao } : {}), temporadas };
  // a temporada em que ele parou (a carreira de técnico começa na seguinte, mais a pausa)
  // a vida fora do campo vem inteira: pais, irmãos, companheira, filhos, ex e o dinheiro guardado
  const vida = { familia: c.familia as unknown as EstadoFamilia | undefined, namoro: c.namoro as unknown as EstadoNamoro | undefined, saldo: jog.casa?.saldo, casa: jog.casa as unknown as EstadoCasa | undefined, negocios: (c as { negocios?: EstadoNegocios }).negocios };
  return { semente: jog.semente, temporada: ano - ANO_INICIAL_T, pausa, bio: bioCompleta, contatos, familia, vida, album: (c.album ?? []).map((f) => ({ ...f })) };
}
let pausaEscolhida = 0;
/** O tamanho do nome que o jogador fez (0 a 100): fama, títulos, prêmios individuais, gigantes em que jogou e idiomas. */
function prestigioDe(jog: SaveJogador, idiomas: Record<string, number>): { valor: number; resumo: string } {
  const h = (jog.carreira.historico ?? []).filter((x) => !x.base), w = mundo(pacote);
  const titulos = h.filter((x) => x.titulo).length, premios = h.reduce((a, x) => a + (x.premios?.length ?? 0), 0);
  const gigantes = new Set(h.filter((x) => x.clubeId && (w.clube[x.clubeId]?.forca ?? 0) >= 80).map((x) => x.clubeId)).size;
  const linguas = Object.values(idiomas).filter((n) => n >= 65).length;
  const valor = Math.round(Math.min(100, jog.carreira.fama * 0.45 + Math.min(20, titulos * 3) + Math.min(15, premios * 1.5) + Math.min(12, gigantes * 4) + Math.min(8, Math.max(0, linguas - 1) * 3)));
  const partes = [titulos ? `${titulos} ${titulos === 1 ? "título" : "títulos"}` : "", premios ? `${premios} ${premios === 1 ? "prêmio individual" : "prêmios individuais"}` : "", gigantes ? `${gigantes} ${gigantes === 1 ? "gigante" : "gigantes"} no currículo` : "", linguas > 1 ? `${linguas} idiomas` : ""].filter(Boolean);
  return { valor, resumo: partes.join(" · ") };
}
function heranca(jog: SaveJogador): { licenca: number; idiomas: Record<string, number>; prestigio: number } {
  const f = jog.carreira.estudos?.formacoes ?? [], licenca = f.includes("Licença Pro de técnico") ? 4 : f.includes("Licença A de técnico") ? 3 : f.includes("Licença B de técnico") ? 2 : f.includes("Licença C de técnico") ? 1 : 0;
  const idiomas = idiomasIniciais(jog.jogador.nome, jog.jogador.nacionalidade, jog.jogador.idade);
  for (const [l, n] of Object.entries(jog.carreira.estudos?.idiomas ?? {})) idiomas[l] = Math.max(idiomas[l] ?? 0, [0, 35, 65, 95][n] ?? 0);
  return { licenca, idiomas, prestigio: prestigioDe(jog, idiomas).valor };
}
import { LICENCAS, CURSO_LICENCA } from "../../src/licencas";
import { baseDe, categorias, daCat, faixaPot, faixaOvrCand, vagasSub, aprovar, reprovar, subirParaCat2, descerParaCat1, subirProfissional, dispensar as dispensarJovem, mandarParaBase, posicaoCampanha, custoBase, LIMITE_CAT, pendentesBase, type Jovem } from "../../src/tecnico/base-t";
import { hierarquia, gruposDe, clima, nomeClima, NOME_NIVEL, NOME_PROMESSA, definirMentor, mentoresPossiveis } from "../../src/tecnico/vestiario";
import { anunciar, tirarAnuncio, oferecerJogador, candidatosParceiro, firmarParceria, emprestarAoParceiro, ultimoDia, NOME_NIVEL_NEC, type Necessidade } from "../../src/tecnico/mercado-extra";
import { planoDe } from "../../src/tecnico/plano-dir";
import { buscarInvestidor, venderSaf } from "../../src/tecnico/gestao";
import type { TipoPromessa } from "../../src/tecnico/modelo";
import { svgCampo, quadro, moverCampo } from "./campo2d";
import { clamp } from "../../src/rng";
import { TONS, GRITOS, prelecao, gritar, xgTexto, relatorioAdversario, type Tom, type Grito } from "../../src/tecnico/beira";
import { NOME_PERFIL_MARCA, textoPatro, type MesaPatro, type PacotePatro } from "../../src/negociacao-patro";
import {
  abrirNeg, abrirLivre, proporClube, proporEmprestimo, aceitarContraClube, proporJogador, aceitarContraJogador, desistir, textoPac, textoEmp, NOME_PAPEL, NOME_PERFIL as NOME_PERFIL_CLUBE,
  contraVenda, leilao, aceitarVenda, recusarVenda, valorVenda, alternarEmprestimo, responderEmp, decidirOpcao, contratoRestante,
  type Negociacao, type Papel, type PacoteTransf,
} from "../../src/tecnico/negociacao";
import { criarAgendador, chaveNuvem, nuvemDisponivel, apagarDaNuvem } from "../nuvem";
import {
  CHAVE_TECNICO, ANO_INICIAL_T, SEMANAS_PRE_T, avancarSemana, novaCarreiraTecnico, prepararMundo, ligasParaComecar, clubesDaLiga, propostasIniciais, reputacaoInicial, rotuloSemanaT,
  proximoJogo, outrosDaRodada, estrangeirosT, prometerT, revistaT, folhaDe, folhaStaff, nivelStaff, candidatos, contratarStaff, demitirStaff, pedirVaga, mudarCargo, nivelDoCargo, estiloDoTime, ajustarGrama, custoPedido, pedirDiretoria, conversar, NOME_CONVERSA, pedidoRenovacao,
  renovar, dispensar, agentesLivresT, trocarNaVaga, mudarFormacao, nRodadasT, semanaAbs,
  janelaT, buscarJogadores, interesseDo, alvoPorNome, alternarVenda,
  iniciarPartida, jogarAte, moverEscalacao, alternarBanco, trazerFamiliar, trocasNoIntervalo, reorganizarNoIntervalo, MAX_TROCAS, recomendarCurso, pagarAulas, estudarLicenca, licencaT, idiomasT,
  toleranciaLicenca, aceitarEmprego, recusarEmprego, assumirNovoClube, creditar,
  type SaveTecnico, type Relatorio, type Conversa, type Pedido, type DadosTecnico,
} from "../../src/tecnico/motor";
import { responderShow, recebeShows } from "../../src/tecnico/shows";
import { botaoAjuda, tour, tourFeito, abrirAjuda } from "../visual/guia";
import { TOUR_TECNICO, AJUDA_TECNICO, AJUDA_INICIO } from "../visual/guia-textos";
import { situacaoEstadio, orcamentoEstadio, iniciarEstadio, ANOS_PARCERIA, PADRAO_EST, GRAMADO_EST, LUGARES_EST, type ProjetoEstadio, type PadraoEstadio, type GramadoTipo } from "../../src/tecnico/estadio-proprio";
import { ORIGENS, ORDEM_ORIGENS, NIVEL_EX, FILOSOFIAS, PERSONALIDADES, ATRIBS_T, NOME_ATRIB_T, TEXTO_ATRIB_T, PONTOS_LIVRES, MAX_ATRIB, montarPerfil, combinaFilosofia, biografia, licencaDaOrigem, type Origem, type NivelEx, type Filosofia, type Personalidade, type AtribT } from "../../src/tecnico/perfil-tecnico";
import {
  FORMACOES, NOMES_FORMACAO, NOME_MENTALIDADE, NOME_NIVEL3, NOME_AT, NOME_AT_GOL, NOME_POS_T, FUNCOES, NOME_FUNCAO, NOME_FUNCAO_PL, EFEITO_FUNCAO,
  forcaDoTime, ladoDe, ladoDaVaga, rotuloPos, type Lado, melhorEscalacao, ovrDe, ovrNaVaga, formaDe, disponivel, rotuloEncaixe, valorAtleta, precoIngresso, exDe, idiomasDe, funcaoNaVaga, ovrPos, type Atleta, type PosT, type Funcao,
} from "../../src/tecnico/modelo";

const pacote = pacoteJson as unknown as PacoteDados;
const $ = (id: string) => document.getElementById(id)!;
const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const ler = <T>(k: string): T | null => { try { return JSON.parse(localStorage.getItem(k) ?? "null") as T | null; } catch { return null; } };
const gravar = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } };

let save: SaveTecnico | null = ler<SaveTecnico>(CHAVE_TECNICO);
// carreiras de técnico de antes do álbum: as figurinhas do jogador vêm do save dele (o mesmo jogador)
if (save && !save.album && save.bio) { const jog = ler<SaveJogador>("mycarrerinha:save"); if (jog?.carreira.album?.length && jog.jogador.apelido === save.bio.apelido) save.album = jog.carreira.album.map((f) => ({ ...f })); }
let aba: "inicio" | "elenco" | "tatica" | "liga" | "clube" | "vida" = "inicio";
let sub = { elenco: "jogadores", clube: "financas", vida: "perfil" } as Record<string, string>;
let filtro = "todos";
/** escalação: quem está selecionado para trocar ("j:id" jogador, "v:3" vaga vazia) */
let selEsc: string | undefined;
let filtroMercado: { pos?: PosT; idadeMax?: number; minhaLiga: boolean; alcance: boolean } = { minhaLiga: true, alcance: true };
/** Valor digitado (na moeda da tela) para reais, que é como o jogo guarda. */
const lerValor = (id: string) => { const el = document.getElementById(id) as HTMLInputElement | null, n = +(el?.value ?? "").replace(/\D/g, ""); return n > 0 ? Math.round(n / MOEDAS[moedaAtual()].porBrl) : 0; };
const naTela = (brl: number) => Math.round(numBrl(brl)).toLocaleString("pt-BR");
/** Campo de valor com + e − por casa (as quatro casas que importam para o tamanho do valor): dá para ajustar sem digitar. */
const rotuloPasso = (v: number) => v >= 1e6 ? `${v / 1e6} mi` : v >= 1e3 ? `${v / 1e3} mil` : String(v);
const campoValor = (id: string, brl: number) => {
  const tela = Math.max(1, Math.round(numBrl(brl))), base = Math.max(100, Math.pow(10, Math.floor(Math.log10(tela)) - 2));
  const passos = [base * 1000, base * 100, base * 10, base];
  return `<label class="campo-valor"><span>${esc(simboloAtual())}</span><input id="${id}" inputmode="numeric" autocomplete="off" value="${naTela(brl)}" aria-label="Valor em ${esc(simboloAtual())}"></label>
    <div class="passos" role="group" aria-label="Ajustar o valor">${passos.map((p) => `<div class="passo"><button type="button" data-passo="${id}|${p}" aria-label="Mais ${rotuloPasso(p)}">+</button><small>${rotuloPasso(p)}</small><button type="button" data-passo="${id}|-${p}" aria-label="Menos ${rotuloPasso(p)}">−</button></div>`).join("")}</div>`;
};
let msgNeg: { texto: string; ok: boolean; pedido?: number } | undefined;
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
const escudo = (id: string, cls = "escudo") => { if (id.startsWith("NAT-")) return bandeiraSvg(id.slice(4), cls); const [a, b] = cores(id); return svgEscudo(idClube(id), a, b, infoClube(pacote, id)?.nome, cls).replace("<svg ", `<svg data-verclube="${id}" `); };
const nomeClube = (id: string) => infoClube(pacote, id)?.nome ?? id;
const estrelas = (n: number) => `<span class="estrelas" aria-label="nível ${n} de 5">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
const barra = (v: number, cor?: string) => `<span class="mini-barra"><i style="--v:${Math.round(v)}%;--c:${cor ?? (v >= 66 ? "var(--pos)" : v >= 40 ? "var(--ouro)" : "var(--neg)")}"></i></span>`;
const corPos = (p: PosT) => (p === "GOL" ? "#F2B705" : p === "ZAG" || p === "LAT" ? "#4C8BD9" : p === "VOL" || p === "MEI" ? "#3FAE6A" : "#E5534B");

// ------------------------------------------------------------------ início de carreira
/** O técnico que está sendo criado (origem, idade, filosofia, personalidade e os pontos a mais). */
const cria: { nome: string; nac: string; origem: Origem; nivelEx: NivelEx; idade: number; filosofia: Filosofia; personalidade: Personalidade; extra: Partial<Record<AtribT, number>> } =
  { nome: "", nac: "BRA", origem: "exJogador", nivelEx: "bom", idade: 38, filosofia: "posse", personalidade: "motivador", extra: {} };
const livresCria = () => PONTOS_LIVRES - ATRIBS_T.reduce((t, k) => t + (cria.extra[k] ?? 0), 0);
/** Os dados da criação, prontos para o motor (ex-jogador do modo jogador: a origem e a idade vêm da carreira). */
function dadosCriados(ex: SaveJogador | null): DadosTecnico {
  if (ex) {
    const fama = ex.carreira.fama, nivelEx: NivelEx = fama >= 70 ? "craque" : fama >= 40 ? "bom" : "modesto";
    return { nome: cria.nome || ex.jogador.apelido, nac: cria.nac, idade: ex.jogador.idade + 1 + pausaEscolhida, exJogador: { apelido: ex.jogador.apelido, fama }, ...heranca(ex),
      perfil: montarPerfil({ ...cria, origem: "exJogador", nivelEx }, ex.jogador.apelido) };
  }
  const nome = cria.nome.trim() || "Técnico", idade = Math.max(cria.idade, ORIGENS[cria.origem].idadeMin);
  return { nome, nac: cria.nac, idade, licenca: licencaDaOrigem(cria.origem, cria.nivelEx), perfil: montarPerfil(cria, nome) };
}
function telaInicio(): string {
  const jog = ler<SaveJogador>("mycarrerinha:save");
  const ex = jog?.carreira?.encerrada ? jog : null;
  if (ex && !cria.nome) { cria.nome = ex.jogador.apelido; cria.nac = ex.jogador.nacionalidade; }
  if (anterior) { cria.nome = anterior.tecnico.nome; cria.nac = anterior.tecnico.nac; }
  // vindo do jogador: as ligas e os clubes são os do mesmo mundo, no ano em que ele começa a treinar
  const anoParou = ex ? (ex.carreira.encerrada?.ano ?? ANO_INICIAL_T + ex.carreira.temporada) : 0;
  if (ex && !anterior) sincronizarMundo(pacote, ex.semente, anoParou - ANO_INICIAL_T + 1 + pausaEscolhida, 0, {}, 0);
  const d = dadosCriados(ex);
  const lic = anterior ? licencaT(anterior) : Math.max(1, d.licenca ?? 2);
  const rep = anterior ? anterior.tecnico.reputacao : reputacaoInicial(d) + (ex ? 3 * pausaEscolhida : 0), ligas = ligasParaComecar(pacote);
  const prest = anterior ? anterior.tecnico.prestigio ?? 0 : d.prestigio ?? 0, tol = toleranciaLicenca(prest);
  const fama = ex && !anterior ? prestigioDe(ex, d.idiomas ?? {}) : undefined;
  const nivelNome = prest >= 80 ? "Lenda mundial" : prest >= 60 ? "Ídolo conhecido" : prest >= 40 ? "Nome respeitado" : "Começando do zero";
  if (!ligas.some((l) => l.id === ligaEscolhida)) ligaEscolhida = ligas[0]?.id ?? "BRA1";
  const clubes = clubesDaLiga(pacote, ligaEscolhida);
  const p = d.perfil!, o = ORIGENS[p.origem], livres = livresCria();
  const listaClubes = clubes.map((c) => {
    const ok = c.exige <= rep && c.licenca <= lic + tol;
    return `<div class="clube-op${ok ? "" : " trancado"}">${escudo(c.id)}<div><b>${esc(c.nome)}</b><br><small class="sub">Força ${c.forca}${c.exige > rep ? ` · exige reputação ${c.exige}` : ""}${c.licenca > lic + tol ? ` · exige ${LICENCAS[c.licenca]}` : c.licenca > lic ? ` · paga o curso da ${LICENCAS[lic + 1]}` : ""}</small></div>${ok ? `<button class="botao peq" data-assumir="${c.id}" data-ex="${ex ? 1 : 0}">Assumir</button>` : `<span class="pill">Fechado</span>`}</div>`;
  }).join("");
  if (anterior) return `<header class="marca"><strong>Mycarrerinha</strong><span>Técnico</span>${botaoAjuda()}</header>
    <section class="painel"><p class="rotulo">De volta ao mercado</p><h2>${esc(anterior.tecnico.nome)} procura clube</h2><p class="sub">${anterior.historico.length} temporada${anterior.historico.length === 1 ? "" : "s"} de carreira, reputação ${rep}.</p></section>
    <section class="painel form-ini"><label>Liga<select id="iLiga">${ligas.map((l) => `<option value="${l.id}" ${l.id === ligaEscolhida ? "selected" : ""}>${esc(l.nome)}</option>`).join("")}</select></label></section>
    <section class="painel"><p class="rotulo">Escolha o clube</p>${listaClubes}</section>`;
  const props = propostasIniciais(pacote, ligaEscolhida, d, ex?.semente ?? d.nome);
  const chip = (attr: string, v: string, at: boolean, nome: string) => `<button class="chip${at ? " ativo" : ""}" ${attr}="${v}">${esc(nome)}</button>`;
  return `<header class="marca"><strong>Mycarrerinha</strong><span>Técnico</span>${botaoAjuda()}</header>
    <h1>Crie o seu técnico</h1>
    <p class="sub" style="font-size:16px">De onde ele veio, como pensa o jogo e o que sabe fazer de melhor. Tudo isso muda o começo e o dia a dia da carreira.</p>
    ${ex ? `<section class="painel"><p class="rotulo">Depois das chuteiras</p><h2>${esc(ex.jogador.apelido)} vira técnico</h2><p class="sub">O mesmo mundo da sua carreira, com os mesmos clubes, jogadores e amigos. A origem é a sua carreira de jogador.</p>
      <p class="rotulo" style="margin-top:8px">Quando começar</p><div class="chips">${[0, 1, 2].map((n) => `<button class="chip${pausaEscolhida === n ? " ativo" : ""}" data-pausa="${n}">${n === 0 ? "Já na próxima temporada" : `Parar ${n} ano${n > 1 ? "s" : ""} antes`}</button>`).join("")}</div>
      <p class="sub">Parou em ${anoParou}. Começa em ${anoParou + 1 + pausaEscolhida}, com ${d.idade} anos.${pausaEscolhida ? " Na pausa, você descansa, estuda o jogo e chega mais maduro (+3 de reputação por ano)." : ""}</p></section>` : ""}
    <section class="painel form-ini">
      <label>Nome do técnico<input id="iNome" value="${esc(cria.nome)}" maxlength="28" autocomplete="off" placeholder="Seu nome"></label>
      <label>Nacionalidade<select id="iNac">${["BRA", "ARG", "POR", "ESP", "ITA", "ENG", "GER", "FRA", "NED", "URU", "COL", "MEX", "USA", "JPN"].map((x) => `<option ${x === cria.nac ? "selected" : ""}>${x}</option>`).join("")}</select></label>
      ${ex ? "" : `<label>Idade: <b id="iIdadeV" style="color:var(--giz)">${d.idade} anos</b><input id="iIdade" type="range" min="${o.idadeMin}" max="60" value="${d.idade}"></label>
      <p class="sub" style="margin-top:-4px">Quem começa novo tem tempo para crescer; quem começa mais velho chega com mais bagagem (um pouco mais de reputação).</p>`}
    </section>
    ${ex ? "" : `<section class="painel"><p class="rotulo">Origem</p><div class="orig-grid">${ORDEM_ORIGENS.map((k) => `<button class="orig${k === cria.origem ? " ativo" : ""}" data-origem="${k}"><b>${ORIGENS[k].nome}</b><small>${ORIGENS[k].texto}</small></button>`).join("")}</div>
      <p class="sub" style="margin-top:8px"><b style="color:var(--giz)">${o.nome}:</b> ${o.efeito}</p>
      ${cria.origem === "exJogador" ? `<p class="rotulo" style="margin-top:10px">Que jogador ele foi</p><div class="chips quebra">${(Object.keys(NIVEL_EX) as NivelEx[]).map((k) => chip("data-nivelex", k, k === cria.nivelEx, NIVEL_EX[k].nome)).join("")}</div><p class="sub">${NIVEL_EX[cria.nivelEx].texto}</p>` : ""}
      ${p.mentor ? `<p class="sub">Foi auxiliar de <b style="color:var(--giz)">${esc(p.mentor)}</b>.</p>` : ""}</section>`}
    <section class="painel"><p class="rotulo">Filosofia de jogo</p><div class="chips quebra">${(Object.keys(FILOSOFIAS) as Filosofia[]).map((k) => chip("data-filo", k, k === cria.filosofia, FILOSOFIAS[k].nome)).join("")}</div>
      <p class="sub">${FILOSOFIAS[cria.filosofia].texto} Quando a tática do time combina com a filosofia, o time rende um pouco mais.</p>
      <p class="rotulo" style="margin-top:10px">Personalidade</p><div class="chips quebra">${(Object.keys(PERSONALIDADES) as Personalidade[]).map((k) => chip("data-perso", k, k === cria.personalidade, PERSONALIDADES[k].nome)).join("")}</div>
      <p class="sub">${PERSONALIDADES[cria.personalidade].texto}</p></section>
    <section class="painel"><p class="rotulo">Pontos fortes · <span style="color:var(--ouro)">${livres} ${livres === 1 ? "ponto livre" : "pontos livres"}</span></p>
      ${ATRIBS_T.map((k) => `<div class="atr-linha"><div><b>${NOME_ATRIB_T[k]}</b><small>${TEXTO_ATRIB_T[k]}</small></div>${barra(p.atrib[k] * 5)}<span class="atr-n">${p.atrib[k]}</span><button class="botao peq sec" data-ponto="${k}|-1" ${(cria.extra[k] ?? 0) > 0 ? "" : "disabled"}>−</button><button class="botao peq sec" data-ponto="${k}|1" ${livres > 0 && p.atrib[k] < MAX_ATRIB ? "" : "disabled"}>+</button></div>`).join("")}</section>
    <section class="painel"><p class="rotulo">Quem é ${esc(d.nome)}</p><p class="sub" style="color:var(--giz)">${esc(biografia(p, { nome: d.nome, idade: d.idade, pais: d.nac, apelidoEx: d.exJogador?.apelido }))}</p>
      <p class="sub" style="margin-top:6px">Reputação <b style="color:var(--giz)">${rep}</b> · ${LICENCAS[lic]}.${fama ? ` <b style="color:var(--giz)">${nivelNome}</b>${fama.resumo ? ` (${esc(fama.resumo)})` : ""}.` : ""}</p></section>
    <section class="painel form-ini"><p class="rotulo">Primeiro emprego</p>
      <label>País e liga<select id="iLiga">${ligas.map((l) => `<option value="${l.id}" ${l.id === ligaEscolhida ? "selected" : ""}>${esc(l.nome)}</option>`).join("")}</select></label>
      <p class="sub">Chegaram ${props.length} propostas de clubes que toparam o seu nome:</p>
      ${props.map((c) => `<div class="clube-op">${escudo(c.id)}<div><b>${esc(c.nome)}</b><br><small class="sub">${esc(c.liga)} · força ${c.forca}<br>${esc(c.texto)}</small></div><button class="botao peq" data-assumir="${c.id}" data-ex="${ex ? 1 : 0}">Aceitar</button></div>`).join("")}
      <details><summary class="sub">Ver todos os clubes da liga</summary>${listaClubes}</details>
    </section>
    <a class="botao sec" href="index.html">Voltar para a carreira de jogador</a>`;
}

// ------------------------------------------------------------------ cabeçalho e abas
const ICONES: Record<string, string> = {
  inicio: '<path d="M3 11 12 4l9 7v9H3z"/>', elenco: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.4c3 .2 5.5 2.4 5.5 5.6"/>',
  tatica: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M3 12h18"/>', liga: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M12 14v4M8 20h8M17 6h3a3 3 0 0 1-3 4M7 6H4a3 3 0 0 0 3 4"/>',
  clube: '<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>',
  vida: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
};
const ic = (p: string) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
function nav(s: SaveTecnico): string {
  const alertas = s.elenco.filter((a) => a.querSair || (a.contratoAte <= s.temporada && s.semana - SEMANAS_PRE_T >= nRodadasT(s) - 8)).length;
  return `<nav class="abas" role="tablist" aria-label="Menu">${([["inicio", "Início"], ["elenco", "Elenco"], ["tatica", "Tática"], ["liga", "Liga"], ["clube", "Clube"], ["vida", "Vida"]] as const).map(([k, n]) =>
    `<button class="${aba === k ? "ativo" : ""}" data-aba="${k}" role="tab" aria-selected="${aba === k}"><span class="aba-ico">${ic(ICONES[k])}${k === "elenco" && alertas ? `<i class="aba-badge">${alertas}</i>` : ""}</span><span class="aba-nome">${n}</span></button>`).join("")}</nav>`;
}
function topo(s: SaveTecnico): string {
  const li = infoLiga(s.ligaId), pos = ordenar(s.tabela).findIndex((t) => t.clube === s.clubeId) + 1;
  return `<header class="marca"><strong>Mycarrerinha</strong><span>${esc(rotuloSemanaT(s))}</span>${botaoAjuda()}</header>
    <section class="painel topo-clube">${escudo(s.clubeId)}<div><b>${esc(nomeClube(s.clubeId))}</b><small><button class="link-clube" data-aba="vida" data-sub="vida:perfil" style="text-decoration:underline">${esc(s.tecnico.nome)}</button> · ${esc(li.curto)}${s.semana >= SEMANAS_PRE_T ? ` · ${pos}º` : ""}</small></div>
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
      ${(() => { const r = relatorioAdversario(pacote, s, pj.adv, nivelStaff(s, "analista")); return `<details class="rel-adv"><summary class="sub" style="cursor:pointer;text-align:center">Relatório do analista ›</summary><div class="dl" style="margin-top:6px">${r.posTabela ? `<span>Na tabela</span><b>${r.posTabela}º · ${r.forma}</b>` : ""}<span>Destaques</span><b>${r.destaques.map(esc).join(", ") || "–"}</b></div><p class="sub" style="margin-top:4px">💡 ${esc(r.dica)}</p></details>`; })()}
      ${s.aoVivo ? `<p class="placar-vivo">Jogo parado no ${s.aoVivo.minuto ?? 0}': <b>${s.aoVivo.souCasa ? s.aoVivo.gMe : s.aoVivo.gAdv} × ${s.aoVivo.souCasa ? s.aoVivo.gAdv : s.aoVivo.gMe}</b></p><div class="botoes" style="justify-content:center"><button class="botao sec" data-aba="tatica">Mexer no time</button></div><button class="botao grande" data-vivo style="margin-top:10px">Voltar para o jogo</button>`
        : `<button class="botao grande" data-vivo style="margin-top:10px">▶ Jogar ao vivo</button><button class="botao sec" data-avancar style="margin-top:8px;width:100%">Simular direto</button>`}</section>`
    : `<section class="painel"><p class="rotulo">${s.semana < SEMANAS_PRE_T ? "Pré-temporada" : "Fim de temporada"}</p><h2>${s.semana < SEMANAS_PRE_T ? "Treinos e ajustes antes da estreia" : "Última semana do ano"}</h2>
      <p class="sub">${s.semana < SEMANAS_PRE_T ? "Defina a tática e o treino. O entrosamento sobe com o foco tático." : "A temporada fecha: premiação, balanço da diretoria e contratos que acabam."}</p>
      <button class="botao grande" data-avancar style="margin-top:10px">Avançar semana</button></section>`;
  const ult = s.ultima ? `<button class="painel lin" data-ver-partida style="grid-template-columns:1fr auto"><div class="nm"><small>Último jogo · rodada ${s.ultima.rodada + 1}</small><b>${esc(nomeClube(s.ultima.casa))} ${s.ultima.gc} × ${s.ultima.gf} ${esc(nomeClube(s.ultima.fora))}</b></div><span class="pill">Ver relatório ›</span></button>` : "";
  const lesionados = s.elenco.filter((a) => a.lesao > 0), susp = s.elenco.filter((a) => a.suspenso > 0), sair = s.elenco.filter((a) => a.querSair);
  const contratos = s.elenco.filter((a) => a.contratoAte <= s.temporada);
  const alertas = [
    ...lesionados.map((a) => `<span class="pill ruim">${esc(a.nome)} · ${a.lesao} sem.</span>`), ...susp.map((a) => `<span class="pill aviso">${esc(a.nome)} suspenso</span>`),
    ...sair.map((a) => `<span class="pill ruim">${esc(a.nome)} quer sair</span>`), ...(((s.propostasV ?? []).length + (s.ofertasEmp ?? []).length) ? [(() => { const k = (s.propostasV ?? []).length + (s.ofertasEmp ?? []).length; return `<button class="pill aviso" data-ir-propostas style="cursor:pointer">${k} proposta${k > 1 ? "s" : ""} por jogadores seus ›</button>`; })()] : []), ...((s.opcoesCompra ?? []).length ? [`<button class="pill aviso" data-ir-propostas style="cursor:pointer">Opção de compra para decidir ›</button>`] : []), ...(contratos.length ? [`<span class="pill aviso">${contratos.length} contrato${contratos.length > 1 ? "s" : ""} acabando</span>`] : []),
  ];
  const ev = s.evento ? `<section class="painel evento-t"><p class="rotulo">Acontecendo agora</p><h2 style="font-size:19px">${esc(s.evento.titulo)}</h2><p>${esc(s.evento.texto)}</p><div class="botoes">${s.evento.opcoes.map((o) => `<button class="botao sec" data-evt="${o.id}">${esc(o.rotulo)}</button>`).join("")}</div></section>` : "";
  const of = s.ofertaEmprego, ofC = of ? infoClube(pacote, of.clubeId) : undefined;
  const oferta = of && ofC ? `<section class="painel evento-t"><p class="rotulo">Proposta de emprego</p><div style="display:flex;gap:10px;align-items:center">${escudo(of.clubeId)}<div><h2 style="font-size:19px;margin:0">${esc(ofC.nome)} quer você</h2><p class="sub" style="margin:2px 0 0">${esc(infoLiga(ofC.ligaId).curto)} · força ${Math.round(w.clube[of.clubeId]?.forca ?? 0)}</p></div></div>
    <p>${esc(of.texto)} ${s.semana < SEMANAS_PRE_T ? "Se aceitar agora, assume já nesta pré-temporada." : "Com a temporada rolando, você termina aqui e assume lá na próxima."}</p>
    <div class="botoes"><button class="botao" data-emprego="1">Aceitar e mudar de clube</button><button class="botao sec" data-emprego="0">Recusar</button><button class="botao sec" data-perfil="${of.clubeId}">Ver o clube</button></div></section>` : "";
  const acerto = s.novoClube ? `<section class="painel"><p class="sub">Pré-contrato assinado: na próxima temporada você assume o <b>${esc(nomeClube(s.novoClube))}</b>.</p></section>` : "";
  const jcp = jogoCopaT(pacote, s);
  const copa = jcp ? `<section class="painel"><p class="rotulo" style="color:${COPAS[jcp.copa.id].cores[0]}">Meio de semana · ${esc(COPAS[jcp.copa.id].curto)} · ${esc(rotuloJogo(jcp.jogo))}</p>
    <div class="prox"><div class="lado">${escudo(jcp.jogo.casa)}<span>${esc(nomeClube(jcp.jogo.casa))}</span></div><span class="x">×</span><div class="lado">${escudo(jcp.jogo.fora)}<span>${esc(nomeClube(jcp.jogo.fora))}</span></div></div>
    <p class="sub" style="text-align:center;margin:6px 0 0">Joga com a sua escalação quando você avançar a semana, antes da rodada da liga.${jcp.jogo.neutro ? " Campo neutro." : ""}</p></section>` : "";
  return `${oferta}${ofertaSelHtml(s)}${acerto}${ev}${copa}${cardJogoSel(s)}${jogo}${ult}
    <section class="painel"><p class="rotulo">Diretoria</p><h2 style="font-size:19px">${esc(d.expectativa.texto)}</h2>
      <div class="medidor"><i style="--v:${Math.round(d.confianca)}%;--c:${d.confianca >= 60 ? "var(--pos)" : d.confianca >= 30 ? "var(--ouro)" : "var(--neg)"}"></i></div>
      <p class="sub">Confiança ${Math.round(d.confianca)}/100 · meta: ${d.expectativa.pos}º lugar${s.semana >= SEMANAS_PRE_T ? ` · hoje: ${pos}º` : ""} · torcida ${Math.round(s.clube.torcida)}/100</p></section>
    ${alertas.length ? `<section class="painel"><p class="rotulo">Atenção</p><div class="botoes" style="margin-top:6px">${alertas.join("")}</div></section>` : ""}
    <section class="painel"><p class="rotulo">Notícias <button class="link-inline" data-sub="clube:noticias" data-aba="clube" style="float:right;font-size:12px">Ver todas</button></p>${s.noticias.slice(0, 8).map((n) => `<div class="not"><small>${esc(n.quando)}</small>${esc(n.texto)}</div>`).join("")}</section>
    <section class="painel"><p class="rotulo">Carreira</p><div class="dl"><span>Reputação</span><b>${s.tecnico.reputacao}/100</b><span>Licença</span><b>${LICENCAS[licencaT(s)]}${s.tecnico.curso?.estudando ? ` · estudando a ${LICENCAS[s.tecnico.curso.estudando].replace("Licença ", "")} (${Math.round(100 * (s.tecnico.curso.progresso ?? 0) / CURSO_LICENCA[s.tecnico.curso.estudando].semanas)}%)` : ""}</b>
      <span>Idiomas</span><b>${Object.entries(idiomasT(s)).filter(([, n]) => n >= 15).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${NOME_LINGUA[l] ?? l} (${rotuloNivel(n).toLowerCase()})`).join(", ")}</b><span>Temporadas</span><b>${s.historico.length}</b><span>Títulos</span><b>${s.historico.filter((h) => h.campeao).length}</b></div>
      ${s.historico.length ? `<div class="lista" style="margin-top:8px">${s.historico.slice().reverse().map((h) => `<div class="not"><small>${ANO_INICIAL_T + h.t} · ${esc(infoLiga(h.ligaId).curto)}</small>${h.pos}º de ${h.n} (meta ${h.esperado}º)${h.campeao ? " · 🏆 campeão" : ""}</div>`).join("")}</div>` : ""}
      <div class="botoes" style="margin-top:10px">${licencaT(s) < 4 && !s.tecnico.curso?.estudando ? `<button class="botao sec peq" data-licenca>Estudar a ${LICENCAS[licencaT(s) + 1]} (${curtoBrl(CURSO_LICENCA[licencaT(s) + 1].custo * Math.max(0.5, infoLiga(s.ligaId).fLiga))})</button>` : ""}<button class="botao sec peq" data-apagar>Apagar carreira</button><a class="botao sec peq" href="index.html">Modo jogador</a></div></section>`;
}

// ------------------------------------------------------------------ Elenco
const grupoPos = (p: PosT) => (p === "GOL" ? "gol" : p === "ZAG" || p === "LAT" ? "def" : p === "VOL" || p === "MEI" ? "mei" : "ata");
function abaElenco(s: SaveTecnico): string {
  const nProp = (s.propostasV ?? []).length + (s.ofertasEmp ?? []).length + (s.opcoesCompra ?? []).length;
  const subs = `<div class="sub-abas">${[["jogadores", `Jogadores (${s.elenco.length})`], ["vestiario", "Vestiário"], ["planejador", "Planejador"], ["mercado", "Mercado"], ["anuncios", `Anúncios${(s.oferecidos ?? []).length ? ` (${s.oferecidos!.length})` : ""}`], ["propostas", `Propostas${nProp ? ` (${nProp})` : ""}`], ["base", `Base${pendentesBase(s) ? " (!)" : ""}`], ["livres", "Agentes livres"], ["scout", "Scout"]].map(([k, n]) => `<button class="${sub.elenco === k ? "ativo" : ""}" data-sub="elenco:${k}">${n}</button>`).join("")}</div>`;
  if (sub.elenco === "livres") return subs + abaLivres(s);
  if (sub.elenco === "scout") return subs + abaScout(s);
  if (sub.elenco === "vestiario") return subs + abaVestiario(s);
  if (sub.elenco === "planejador") return subs + abaPlanejador(s);
  if (sub.elenco === "anuncios") return subs + abaAnuncios(s);
  if (sub.elenco === "base") return subs + abaBase(s);
  if (sub.elenco === "mercado") return subs + abaMercadoT(s);
  if (sub.elenco === "propostas") return subs + abaPropostas(s);
  const filtros = `<div class="chips" style="margin-bottom:8px">${[["todos", "Todos"], ["gol", "Goleiros"], ["def", "Defesa"], ["mei", "Meio"], ["ata", "Ataque"]].map(([k, n]) => `<button class="chip${filtro === k ? " ativo" : ""}" data-filtro="${k}">${n}</button>`).join("")}</div>`;
  const ordemPos: Record<string, number> = { GOL: 0, ZAG: 1, LAT: 2, VOL: 3, MEI: 4, PON: 5, ATA: 6 };
  const lista = s.elenco.filter((a) => filtro === "todos" || grupoPos(a.pos) === filtro).sort((a, b) => ordemPos[a.pos] - ordemPos[b.pos] || ovrDe(b) - ovrDe(a));
  const tit = new Set(s.esc.titulares);
  return `${subs}${filtros}<p class="sub" style="margin-bottom:6px">Folha: <b style="color:var(--giz)">${curtoBrl(folhaDe(s))}</b>/mês · teto ${curtoBrl(s.clube.tetoFolha)}${(() => { const e = estrangeirosT(s); return e.lim ? ` · estrangeiros: <b style="color:var(--giz)">${e.lim.inscritos ? `${e.noElenco}/${e.lim.inscritos} no elenco` : `${e.noElenco} no elenco`}${e.lim.relacionados ? `, ${e.relacionados}/${e.lim.relacionados} relacionados` : ""}</b>` : ""; })()}</p><div class="lista">${lista.map((a) => {
    const tags = [tit.has(a.id) ? `<span class="pill bom">Titular</span>` : "", a.lesao > 0 ? `<span class="pill ruim">Lesão ${a.lesao} sem.</span>` : "", a.suspenso > 0 ? `<span class="pill aviso">Suspenso</span>` : "",
      a.querSair ? `<span class="pill ruim">Quer sair</span>` : "", a.contratoAte <= s.temporada ? `<span class="pill aviso">Contrato acaba</span>` : "", a.promessa !== undefined || (a.promessas ?? []).length ? `<span class="pill">Promessa</span>` : "", a.pedeConversa !== undefined && a.pedeConversa >= semanaAbs(s) - 2 ? `<span class="pill aviso">Quer conversar</span>` : "", a.base ? `<span class="pill">Base</span>` : "", (s.aVenda ?? []).includes(a.id) ? `<span class="pill aviso">À venda</span>` : "", (s.aEmprestimo ?? []).includes(a.id) ? `<span class="pill aviso">Para empréstimo</span>` : "", a.emprestadoDe ? `<span class="pill">Emprestado</span>` : ""].join("");
    return `<button class="lin" data-jog="${esc(a.id)}"><span class="num">${a.numero}</span><span class="nm"><b>${esc(a.nome)}</b><small>${rotuloPos(a)} · ${a.idade}a · moral ${barra(a.moral)} · físico ${barra(a.condicao)}${tags}</small></span><span class="ov"><strong>${ovrDe(a)}</strong><span>${potTexto(s, a)}</span></span></button>`;
  }).join("")}</div>`;
}
// ------------------------------------------------------------------ categorias de base
const fx = (f: [number, number]) => (f[0] === f[1] ? `${f[0]}` : `${f[0]}–${f[1]}`);
const mediaNota = (j: Jovem) => (j.notas.length ? (j.notas.reduce((a, b) => a + b, 0) / j.notas.length).toFixed(1).replace(".", ",") : "–");
function abaBase(s: SaveTecnico): string {
  const b = baseDe(s), [c1, c2] = categorias(infoLiga(s.ligaId).pais), p = b.peneira, aberta = !!p && p.t === s.temporada && s.semana <= p.ate;
  const linha = (j: Jovem) => { const o = ovrDe(j.a), d = o - j.ovr0;
    return `<button class="lin" data-jovem="${esc(j.a.id)}"><span class="num">${j.a.pos}</span><span class="nm"><b>${esc(j.a.nome)}</b><small>${j.a.idade}a · ${j.j} jogos · ${j.g}g ${j.as}a · nota ${mediaNota(j)}${j.doPro ? `<span class="pill">Do profissional</span>` : ""}${j.estourou ? `<span class="pill ruim">Passou da idade</span>` : ""}</small></span><span class="ov"><strong>${o}${d > 0 ? `<small style="color:var(--pos);font-size:11px"> +${d}</small>` : ""}</strong><span>pot ${fx(faixaPot(s, j.a.pot, j.semanas, j.a.id))}</span></span></button>`; };
  const cat = (n: 1 | 2) => { const c = n === 1 ? c1 : c2, l = daCat(b, n), cp = b.campanha[n], jg = cp.v + cp.e + cp.d;
    return `<div class="painel" style="margin-top:12px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><h3 style="margin:0">${esc(c.nome)}</h3><small class="sub">${l.length}/${LIMITE_CAT} · até ${c.max} anos</small></div>
      <p class="sub" style="margin:2px 0 8px">${esc(c.liga)}: ${jg ? `${cp.v}V ${cp.e}E ${cp.d}D · ${cp.gp} gols pró, ${cp.gc} contra · por volta do ${posicaoCampanha(cp)}º lugar` : "ainda não começou"}</p>
      <div class="lista">${l.map(linha).join("") || `<p class="sub">Ninguém nesta categoria.</p>`}</div></div>`; };
  const pend = b.jovens.filter((j) => j.estourou);
  const pen = !aberta ? (p && p.t === s.temporada ? `<p class="sub">A peneira deste ano acabou: ${p.candidatos.filter((c) => c.aprovado).length} aprovados. A próxima é na pré-temporada.</p>` : "")
    : `<div class="painel" style="margin-top:12px"><h3 style="margin:0">Peneira ${ANO_INICIAL_T + s.temporada}</h3>
      <p class="sub" style="margin:4px 0 8px">Até a ${p!.ate - SEMANAS_PRE_T + 1}ª rodada · ${vagasSub(b, 1)} vagas no ${esc(c1.nome)}. A avaliação vai fechando as faixas a cada semana, mas outro clube pode levar quem você demorar para aprovar.</p>
      <div class="lista">${p!.candidatos.map((c) => { const fo = faixaOvrCand(s, c), fp = faixaPot(s, c.pot, c.semanas * 2, c.id);
        return `<div class="not" style="display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center${c.levado ? ";opacity:.5" : ""}"><span><b>${esc(c.nome)}</b> <small class="sub">${c.pos} · ${c.idade}a${c.nac !== infoLiga(s.ligaId).pais ? ` · ${c.nac}` : ""}</small><small class="sub" style="display:block">${esc(c.destaque)} · nível ${fx(fo)} · potencial ${fx(fp)}</small></span>
          <span class="botoes" style="flex-wrap:nowrap">${c.aprovado ? `<span class="pill bom">Aprovado</span>` : c.levado ? `<span class="pill">Foi para outro clube</span>` : `<button class="botao peq" data-pen-ok="${esc(c.id)}">Aprovar</button><button class="botao sec peq" data-pen-nao="${esc(c.id)}">✕</button>`}</span></div>`; }).join("")}</div></div>`;
  return `${aviso()}<p class="sub">Base nível ${s.clube.baseNivel} · coordenação ${(Math.round(nivelStaff(s, "base") * 10) / 10).toString().replace(".", ",")} · custo ${curtoBrl(custoBase(s))}/mês. Quanto melhor a base e o coordenador, mais rápido os garotos evoluem e mais justa fica a faixa do potencial. Quem joga evolui mais.</p>
    ${pend.length ? `<div class="aviso-t erro" style="margin-top:8px">${pend.length === 1 ? "Um garoto passou" : `${pend.length} garotos passaram`} da idade do ${esc(c2.nome)}: suba para o profissional até o fim da temporada ou ${pend.length === 1 ? "ele vai" : "eles vão"} embora.</div>` : ""}
    ${pen}${cat(2)}${cat(1)}
    ${(b.copinha ?? []).length ? `<p class="rotulo" style="margin-top:14px">Copinha ${ANO_INICIAL_T + b.copinha![0].t}</p><div class="not">${b.copinha![0].campeao ? "🏆 Campeão!" : `Parou na ${esc(b.copinha![0].chegou.toLowerCase())}`}</div>${b.copinha![0].jogos.map((j) => `<div class="not" style="display:flex;justify-content:space-between;gap:8px"><small>${esc(j.fase)}</small><span>${esc(nomeCurto(j.adv))} <b>${j.gp} × ${j.gc}</b>${j.pen ? ` <small>(pên. ${j.pen[0]}–${j.pen[1]})</small>` : ""}</span></div>`).join("")}` : ""}
    ${b.hist.length ? `<p class="rotulo" style="margin-top:14px">Campanhas</p>${b.hist.map((h) => `<div class="not"><small>${ANO_INICIAL_T + h.t}</small>${esc(h.cat === 1 ? c1.nome : c2.nome)}: ${h.titulo ? (h.copinha ? "🏆 campeão da Copinha" : "🏆 campeão") : `${h.pos}º lugar`}</div>`).join("")}` : ""}`;
}
function fichaJovem(s: SaveTecnico, id: string): string {
  const b = baseDe(s), j = b.jovens.find((x) => x.a.id === id), [c1, c2] = categorias(infoLiga(s.ligaId).pais);
  if (!j) return `<button class="fechar" data-fechar aria-label="Fechar">×</button><p class="sub">Esse garoto não está mais na base.</p>`;
  const a = j.a, o = ovrDe(a), nomeAt = (k: (typeof ATRIBUTOS)[number]) => (a.pos === "GOL" ? NOME_AT_GOL[k] ?? NOME_AT[k] : NOME_AT[k]);
  return `<button class="fechar" data-fechar aria-label="Fechar">×</button>
    <div><p class="rotulo">${NOME_POS_T[a.pos]} · ${a.idade} anos · ${a.nac} · ${esc(j.cat === 1 ? c1.nome : c2.nome)}</p><h2>${esc(a.nome)}</h2></div>
    <div class="forca3"><div><strong>${o}</strong><span>OVR${o > j.ovr0 ? ` (+${o - j.ovr0})` : ""}</span></div><div><strong>${fx(faixaPot(s, a.pot, j.semanas, a.id))}</strong><span>Potencial</span></div><div><strong>${j.j}</strong><span>Jogos · ${j.g}g ${j.as}a</span></div></div>
    <div class="atr">${ATRIBUTOS.map((k) => `<div class="barra"><span>${nomeAt(k)}</span><b>${Math.round(a.at[k])}</b><i style="--v:${Math.round(a.at[k])}%;--c:${a.at[k] >= 75 ? "var(--pos)" : a.at[k] >= 55 ? "var(--ouro)" : "var(--giz-2)"}"></i></div>`).join("")}</div>
    <div class="dl"><span>Nota média</span><b>${mediaNota(j)}</b><span>Profissionalismo · temperamento</span><b>${a.prof} · ${a.temp}</b><span>${j.doPro ? "Salário (profissional)" : "Ajuda de custo"}</span><b>${valorBrl(a.salario)}/mês</b><span>Valor de mercado</span><b>${curtoBrl(valorAtleta(a, infoLiga(s.ligaId).fLiga, s.temporada))}</b></div>
    ${msg ? `<p class="aviso-t ${msg.ok ? "ok" : "erro"}">${esc(msg.texto)}</p>` : ""}
    <div class="botoes"><button class="botao" data-jov-pro="${esc(a.id)}">${j.doPro ? "Trazer de volta ao profissional" : "Subir para o profissional"}</button>
      ${j.cat === 1 ? `<button class="botao sec" data-jov-c2="${esc(a.id)}">Subir para o ${esc(c2.nome)}</button>` : a.idade <= c1.max ? `<button class="botao sec" data-jov-c1="${esc(a.id)}">Voltar para o ${esc(c1.nome)}</button>` : ""}
      ${j.doPro ? "" : `<button class="botao sec" data-jov-fora="${esc(a.id)}">Dispensar</button>`}</div>
    <p class="sub">Subindo, ele ganha contrato profissional de três anos. Na base ele joga toda rodada e evolui mais rápido do que parado no banco do profissional.</p>`;
}
// ------------------------------------------------------------------ vestiário, planejador e anúncios
const POS_T: PosT[] = ["GOL", "ZAG", "LAT", "VOL", "MEI", "PON", "ATA"];
function abaVestiario(s: SaveTecnico): string {
  const h = hierarquia(s), c = clima(s), gs = gruposDe(s), por = (n: string) => s.elenco.filter((a) => h.get(a.id)?.nivel === n).sort((a, b) => (h.get(b.id)?.pts ?? 0) - (h.get(a.id)?.pts ?? 0));
  const nome = (a: Atleta) => `<button class="link-inline" data-jog="${esc(a.id)}">${esc(a.nome)}</button>`;
  const prom = s.elenco.flatMap((a) => (a.promessas ?? []).map((p) => ({ a, p })));
  const ments = s.elenco.filter((a) => a.mentor).map((a) => ({ a, m: s.elenco.find((x) => x.id === a.mentor) })).filter((x) => x.m);
  return `${aviso()}<div class="painel"><p class="rotulo">Clima do vestiário</p><div style="display:flex;align-items:center;gap:12px"><strong style="font-family:var(--display);font-size:34px;color:var(--ouro-claro)">${c}</strong><div><b>${nomeClima(c)}</b><br><small class="sub">Moral do elenco, com peso maior para quem manda. Clima bom rende um pouco mais em campo; promessa quebrada pesa.</small></div></div></div>
    <p class="rotulo" style="margin-top:12px">Hierarquia</p>
    <div class="dl"><span>Líderes</span><b>${por("lider").map(nome).join(", ") || "–"}</b><span>Influentes</span><b>${por("influente").map(nome).join(", ") || "–"}</b><span>Novatos</span><b>${por("novato").map(nome).join(", ") || "–"}</b></div>
    <p class="sub">Liderança, idade, tempo de casa, nível e a braçadeira definem quem manda. Líder feliz puxa o grupo dele para cima; líder insatisfeito puxa para baixo.</p>
    <p class="rotulo" style="margin-top:12px">Grupos</p>
    ${gs.map((g) => `<div class="not"><b>${esc(g.nome)}</b> <small class="sub">· ${g.membros.length} jogadores · moral ${g.moral}${g.lider ? ` · quem puxa: ${esc(g.lider.nome)}` : ""}</small><br><small>${g.membros.map((a) => esc(a.nome.split(" ").slice(-1)[0])).join(", ")}</small></div>`).join("")}
    <p class="rotulo" style="margin-top:12px">Promessas em aberto</p>
    ${prom.length ? prom.map(({ a, p }) => `<div class="not">${nome(a)}: ${NOME_PROMESSA[p.tipo].toLowerCase()}${p.alvo && (p.tipo === "titular" || p.tipo === "minutos") ? ` (${p.feitos ?? 0} de ${p.alvo})` : ""} <small class="sub">· prazo: ${p.ate - semanaAbs(s)} semanas</small></div>`).join("") : `<p class="sub">Nenhuma. Prometa algo na ficha do jogador (e cumpra).</p>`}
    <p class="rotulo" style="margin-top:12px">Mentorias</p>
    ${ments.length ? ments.map(({ a, m }) => `<div class="not">${nome(m!)} → ${nome(a)} <small class="sub">· profissionalismo ${m!.prof} → ${a.prof}</small></div>`).join("") : `<p class="sub">Nenhuma. Na ficha de um jogador de até 23 anos, escolha um veterano para ser o mentor dele.</p>`}`;
}
function fichaVestiario(s: SaveTecnico, a: Atleta): string {
  const h = hierarquia(s).get(a.id), tipos: TipoPromessa[] = ["titular", "minutos", "reforco", "naoVender", "renovar"], ja = new Set((a.promessas ?? []).map((p) => p.tipo));
  const mentores = a.idade <= 23 ? mentoresPossiveis(s).filter((m) => m.id !== a.id) : [];
  const ti = a.treinoInd ?? {};
  return `<div><p class="rotulo">Vestiário · ${h ? NOME_NIVEL[h.nivel] : "Membro"}</p>
      ${(a.promessas ?? []).length ? `<p class="sub">Promessas: ${(a.promessas ?? []).map((p) => NOME_PROMESSA[p.tipo].toLowerCase()).join(", ")}.</p>` : ""}
      <div class="botoes" style="margin-top:6px">${tipos.filter((t) => !ja.has(t)).map((t) => `<button class="botao sec peq" data-prometer="${t}" data-id="${esc(a.id)}">Prometer: ${NOME_PROMESSA[t].toLowerCase()}</button>`).join("")}</div>
      <p class="sub" style="font-size:12px">Promessa dá moral na hora, mas é cobrada no prazo. Quebrar uma promessa com um líder abala o grupo dele.</p></div>
    <div><p class="rotulo">Treino individual</p>
      <div class="chips" style="flex-wrap:wrap">${[["", "Igual ao time"], ["fisico", "Físico"], ["tecnico", "Técnico"], ["tatico", "Tático"]].map(([k, n]) => `<button class="chip${(ti.foco ?? "") === k ? " ativo" : ""}" data-tind="${esc(a.id)}|${k}">${n}</button>`).join("")}</div>
      <p class="sub" style="margin:8px 0 4px">Aprender posição nova${ti.pos ? ` · ${ti.pos}: ${Math.round(a.posExtra?.[ti.pos] ?? 0)}%` : ""}</p>
      <div class="chips" style="flex-wrap:wrap">${POS_T.filter((p) => p !== a.pos && !(a.pos === "GOL") && p !== "GOL").map((p) => `<button class="chip${ti.pos === p ? " ativo" : ""}" data-tpos="${esc(a.id)}|${ti.pos === p ? "" : p}">${p}${(a.posExtra?.[p] ?? 0) >= 100 ? " ✔" : (a.posExtra?.[p] ?? 0) > 0 ? ` ${Math.round(a.posExtra![p]!)}%` : ""}</button>`).join("")}</div></div>
    ${a.idade <= 23 ? `<div><p class="rotulo">Mentor</p><select class="campo-sel" data-mentor="${esc(a.id)}"><option value="">Sem mentor</option>${mentores.map((m) => `<option value="${esc(m.id)}"${a.mentor === m.id ? " selected" : ""}>${esc(m.nome)} (${m.idade}a · profissionalismo ${m.prof} · liderança ${Math.round(exDe(m).LID)})</option>`).join("")}</select><p class="sub" style="font-size:12px">O garoto pega o profissionalismo e o temperamento do mentor com o tempo e evolui um pouco mais.</p></div>` : ""}
    ${a.bonusJogo || a.bonusGol ? `<p class="sub">Bônus no contrato: ${a.bonusJogo ? `${valorBrl(a.bonusJogo)} por jogo` : ""}${a.bonusJogo && a.bonusGol ? " · " : ""}${a.bonusGol ? `${valorBrl(a.bonusGol)} por gol` : ""}.</p>` : ""}`;
}
function abaPlanejador(s: SaveTecnico): string {
  const fL = infoLiga(s.ligaId).fLiga, med = s.elenco.reduce((x, a) => x + ovrDe(a), 0) / Math.max(1, s.elenco.length);
  const precisa: Record<PosT, number> = { GOL: 2, ZAG: 4, LAT: 4, VOL: 3, MEI: 3, PON: 3, ATA: 3 };
  const linhas = POS_T.map((p) => {
    const l = s.elenco.filter((a) => a.pos === p || (a.posExtra?.[p] ?? 0) >= 100).sort((a, b) => ovrDe(b) - ovrDe(a)), bons = l.filter((a) => ovrDe(a) >= med - 3).length;
    const acaba = l.filter((a) => a.contratoAte <= s.temporada).length, velhos = l.filter((a) => a.idade >= 32).length;
    const st = l.length < precisa[p] - 1 || bons === 0 ? ["Falta gente", "ruim"] : l.length < precisa[p] || bons < Math.ceil(precisa[p] / 2) ? ["Fino", "aviso"] : ["Bem servido", "bom"];
    return `<div class="not"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>${NOME_POS_T[p]}</b><span class="pill ${st[1]}">${st[0]}</span></div>
      <small>${l.map((a) => `${esc(a.nome.split(" ").slice(-1)[0])} ${ovrDe(a)}${a.idade >= 32 ? "⌛" : a.idade <= 21 ? "🌱" : ""}${a.contratoAte <= s.temporada ? "✎" : ""}`).join(" · ") || "ninguém"}</small>
      <small class="sub" style="display:block">${l.length} de ${precisa[p]} ideais · média ${l.length ? Math.round(l.reduce((x, a) => x + ovrDe(a), 0) / l.length) : "–"}${acaba ? ` · ${acaba} com contrato acabando` : ""}${velhos ? ` · ${velhos} veterano(s)` : ""}</small></div>`;
  }).join("");
  const vencem = s.elenco.filter((a) => a.contratoAte <= s.temporada + 1).sort((a, b) => a.contratoAte - b.contratoAte || ovrDe(b) - ovrDe(a));
  return `${aviso()}<p class="sub">Profundidade de cada posição (⌛ veterano, 🌱 jovem, ✎ contrato acabando). Quem aprendeu uma posição nova conta nela também.</p>${linhas}
    <p class="rotulo" style="margin-top:12px">Contratos que vencem em até 12 meses</p>
    ${vencem.length ? vencem.map((a) => `<div class="not" style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span><button class="link-inline" data-jog="${esc(a.id)}">${esc(a.nome)}</button> <small class="sub">${a.pos} · ${a.idade}a · ${ovrDe(a)} · vale ${curtoBrl(valorAtleta(a, fL, s.temporada))}</small></span><small>${a.contratoAte <= s.temporada ? "acaba nesta temporada" : "acaba na próxima"}</small></div>`).join("") : `<p class="sub">Nenhum.</p>`}
    ${(s.emprestados ?? []).length ? `<p class="rotulo" style="margin-top:12px">Voltam de empréstimo</p>${s.emprestados!.map((e) => `<div class="not">${esc(e.atleta.nome)} <small class="sub">${e.atleta.pos} · ${ovrDe(e.atleta)} · no ${esc(nomeCurto(e.clubeId))}</small></div>`).join("")}` : ""}`;
}
let formNec: Omit<Necessidade, "id" | "desde"> = { pos: "ATA", idadeMax: 30, tipo: "qualquer", nivel: "elenco" };
function abaAnuncios(s: SaveTecnico): string {
  const jan = janelaT(s), ofs = s.oferecidos ?? [], procs = s.procurando ?? [], ult = ultimoDia(s);
  const ch = (k: keyof typeof formNec, v: string | number, txt: string) => `<button class="chip${String(formNec[k]) === String(v) ? " ativo" : ""}" data-fnec="${k}|${v}">${txt}</button>`;
  const parc = candidatosParceiro(pacote, s), meus = s.parceiros ?? [];
  return `${aviso()}${ult ? `<div class="aviso-t erro">Último dia da janela! O que não fechar hoje fica para a próxima.</div>` : ""}<p class="sub">${esc(jan.texto)}</p>
    <div class="painel" style="margin-top:8px"><p class="rotulo">Anunciar o que você procura</p>
      <div class="chips" style="flex-wrap:wrap">${POS_T.map((p) => ch("pos", p, p)).join("")}</div>
      <div class="chips" style="flex-wrap:wrap;margin-top:6px">${[21, 23, 25, 28, 30, 40].map((n) => ch("idadeMax", n, n === 40 ? "qualquer idade" : `até ${n}`)).join("")}</div>
      <div class="chips" style="flex-wrap:wrap;margin-top:6px">${(["titular", "elenco", "jovem"] as const).map((n) => ch("nivel", n, NOME_NIVEL_NEC[n])).join("")}</div>
      <div class="chips" style="flex-wrap:wrap;margin-top:6px">${(["qualquer", "compra", "emprestimo"] as const).map((n) => ch("tipo", n, n === "qualquer" ? "Compra ou empréstimo" : n === "compra" ? "Só compra" : "Só empréstimo")).join("")}</div>
      <button class="botao peq" data-anunciar style="margin-top:8px">Publicar anúncio</button>
      ${(s.necessidades ?? []).map((n) => `<div class="not" style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span><b>${n.pos}</b> <small class="sub">${n.idadeMax < 40 ? `até ${n.idadeMax} anos · ` : ""}${NOME_NIVEL_NEC[n.nivel].toLowerCase()} · ${n.tipo === "qualquer" ? "compra ou empréstimo" : n.tipo}</small></span><button class="botao sec peq" data-tirar-nec="${esc(n.id)}">Tirar</button></div>`).join("")}</div>
    <p class="rotulo" style="margin-top:12px">Jogadores oferecidos a você</p>
    ${ofs.length ? ofs.map((o) => `<div class="not" style="display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center">${escudo(o.clubeId, "escudo esc-p")}<span><b>${esc(o.nome)}</b> <small class="sub">${o.pos} · ${o.idade}a · ${o.nac}</small><small class="sub" style="display:block">${esc(nomeCurto(o.clubeId))} · ${o.tipo === "compra" ? `pede ~${curtoBrl(o.valor)}` : "empréstimo"} · ${esc(o.nota)}</small></span><button class="botao sec peq" data-alvo="${esc(o.nome)}" data-clube="${o.clubeId}">Negociar</button></div>`).join("") : `<p class="sub">${(s.necessidades ?? []).length ? "Os clubes vão oferecendo a cada semana com a janela aberta." : "Publique um anúncio para receber ofertas."}</p>`}
    <p class="rotulo" style="margin-top:12px">Clubes procurando jogadores</p>
    ${procs.length ? procs.map((p) => { const cand = s.elenco.filter((a) => a.pos === p.pos && a.idade <= p.idadeMax && !a.emprestadoDe);
      return `<div class="not">${escudo(p.clubeId, "escudo esc-p")} <b>${esc(nomeCurto(p.clubeId))}</b> <small class="sub">procura ${p.pos} até ${p.idadeMax} anos · ${p.tipo === "compra" ? "compra" : "empréstimo"}</small>
        ${cand.length ? `<div style="display:flex;gap:6px;margin-top:6px"><select class="campo-sel" id="proc-${esc(p.id)}">${cand.map((a) => `<option value="${esc(a.id)}">${esc(a.nome)} (${ovrDe(a)}, ${a.idade}a)</option>`).join("")}</select><button class="botao sec peq" data-oferecer="${esc(p.id)}">Oferecer</button></div>` : `<small class="sub" style="display:block">Você não tem ninguém assim.</small>`}</div>`; }).join("") : `<p class="sub">Nenhum anúncio de outros clubes agora.</p>`}
    <p class="rotulo" style="margin-top:12px">Clubes parceiros (${meus.length}/2)</p>
    <p class="sub">Parceiro recebe seus garotos (até 23) como titulares, paga 60% do salário deles e mostra os melhores garotos dele para você antes de todo mundo. Você ajuda com um valor por mês.</p>
    ${meus.map((id) => `<div class="not" style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span>${escudo(id, "escudo esc-p")} <b>${esc(nomeCurto(id))}</b></span><button class="botao sec peq" data-parceria="${id}">Encerrar</button></div>`).join("")}
    ${meus.length < 2 ? `<details><summary class="sub" style="cursor:pointer">Escolher parceiro</summary>${parc.filter((c) => !meus.includes(c.id)).map((c) => `<div class="not" style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span>${escudo(c.id, "escudo esc-p")} <b>${esc(c.nome)}</b> <small class="sub">${esc(c.liga)} · força ${c.forca} · ${curtoBrl(c.custo)}/mês</small></span><button class="botao sec peq" data-parceria="${c.id}">Fechar</button></div>`).join("")}</details>` : ""}`;
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
    <div><p class="rotulo">${NOME_POS_T[a.pos]}${ladoDe(a) ? (ladoDe(a) === "E" ? " pela esquerda" : " pela direita") : ""} · ${a.idade} anos · ${a.nac} · camisa ${a.numero}</p><h2>${esc(a.nome)}</h2></div>
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
    ${fichaVestiario(s, a)}
    <div><p class="rotulo">Renovar · pede ${valorBrl(pedido)}/mês</p><div class="botoes" style="margin-top:6px">${[1, 2, 3, 4].map((n) => `<button class="botao sec peq" data-renovar="${n}" data-id="${esc(a.id)}">${n} ano${n > 1 ? "s" : ""}</button>`).join("")}</div></div>
    <div><p class="rotulo">Mercado · vale ${curtoBrl(valorAtleta(a, infoLiga(s.ligaId).fLiga, s.temporada))}</p><div class="botoes" style="margin-top:6px"><button class="botao sec peq" data-venda="${esc(a.id)}">${(s.aVenda ?? []).includes(a.id) ? "Tirar da lista de venda" : "Colocar à venda"}</button>${(() => { const [, c2] = categorias(infoLiga(s.ligaId).pais), [c1] = categorias(infoLiga(s.ligaId).pais); return a.idade <= c2.max && !a.emprestadoDe ? `<button class="botao sec peq" data-mandar-base="${esc(a.id)}">Mandar jogar no ${esc(a.idade <= c1.max ? c1.nome : c2.nome)}</button>` : ""; })()}${!a.emprestadoDe && a.idade <= 23 ? (s.parceiros ?? []).map((pid) => `<button class="botao sec peq" data-emp-parc="${esc(a.id)}|${pid}">Emprestar ao ${esc(nomeCurto(pid))} (parceiro)</button>`).join("") : ""}${a.emprestadoDe ? "" : `<button class="botao sec peq" data-emp-lista="${esc(a.id)}">${(s.aEmprestimo ?? []).includes(a.id) ? "Tirar da lista de empréstimo" : "Colocar para empréstimo"}</button>`}</div>
      <p class="sub" style="margin-top:4px">${a.emprestadoDe ? `Emprestado pelo ${esc(nomeClube(a.emprestadoDe.clubeId))} até ${ANO_INICIAL_T + a.emprestadoDe.ate}${a.emprestadoDe.opcao ? ` · ${a.emprestadoDe.obrigacao ? "obrigação" : "opção"} de compra de ${curtoBrl(a.emprestadoDe.opcao)}` : ""}.` : ""}${a.multa ? ` Multa rescisória: ${curtoBrl(a.multa)}.` : ""}${a.papel ? ` Prometido: ${NOME_PAPEL[a.papel].toLowerCase()}.` : ""}${a.revenda ? ` ${a.revenda.pct}% de uma venda vai para o ${esc(nomeClube(a.revenda.clubeId))}.` : ""}</p></div>
    <div><p class="rotulo">Dispensar · rescisão de ${curtoBrl(multa)}</p><div class="botoes" style="margin-top:6px"><button class="botao sec peq" data-dispensar data-id="${esc(a.id)}">Dispensar ${esc(a.nome)}</button></div></div>`;
}
/** O número da direita na lista: a faixa de OVR (e o potencial embaixo), com a marca do relatório. */
function ovFaixa(s: SaveTecnico, f: Faixa, nome: string, clubeId?: string): string {
  const st = statusObs(s, nome, clubeId);
  return `<span class="ov"><strong style="${f.exato ? "" : "font-size:15px"}">${textoFaixa(f)}</strong><span>${st === "pronto" ? "relatório · " : st === "andando" ? "observando · " : ""}pot ${textoPot(f)}</span></span>`;
}
function relatorioScout(s: SaveTecnico, f: Faixa, nome: string, clubeId?: string): string {
  const st = statusObs(s, nome, clubeId);
  return `<div class="dl"><span>Nível (OVR)</span><b>${textoFaixa(f)}</b><span>Potencial</span><b>${textoPot(f)}</b><span>Conhecimento da liga</span><b>${Math.round(f.con)}%</b></div>
    ${st === "pronto" ? `<p class="sub">Relatório do scout pronto: a faixa já está a mais justa que os seus olheiros conseguem.</p>` : st === "andando" ? `<p class="sub">Um olheiro está acompanhando os jogos dele. O relatório sai em breve.</p>` : `<div class="botoes"><button class="botao sec peq" data-observar="${esc(nome)}" data-clube="${clubeId ?? ""}">Mandar um olheiro observar</button></div>`}`;
}
function abaScout(s: SaveTecnico): string {
  const e = scoutDe(s), ab = semanaAbs(s), ligas = ligasDoMercado(s);
  const barraCon = (v: number) => `<i style="display:block;height:6px;border-radius:3px;background:linear-gradient(90deg,var(--ouro) ${Math.round(v)}%,var(--giz-2) ${Math.round(v)}%);margin-top:4px"></i>`;
  const linha = (id: string, nome: string, extra = "") => { const on = e.focos.includes(id), v = e.con[id] ?? 0; return `<div class="not" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span style="flex:1"><b>${esc(nome)}</b> <small class="sub">${Math.round(v)}%${extra}</small>${barraCon(v)}</span><button class="${on ? "botao" : "botao sec"} peq" data-foco="${id}" style="white-space:nowrap">${on ? "Com foco ✓" : "Mandar olheiros"}</button></div>`; };
  const andando = Object.entries(e.obs).filter(([, v]) => v > ab), prontos = Object.entries(e.obs).filter(([, v]) => v <= ab).slice(-12).reverse();
  return `<section class="painel"><p class="rotulo">Departamento de scout</p><div class="dl"><span>Pessoas no scout</span><b>${(s.deps?.scout ?? []).length}</b><span>Força da rede</span><b>${forcaScout(s).toFixed(1).replace(".", ",")}</b><span>Melhor olheiro</span><b>${olhoScout(s).toFixed(1).replace(".", ",")} de 5</b><span>Focos</span><b>${e.focos.length} de ${vagasFoco(s)}</b><span>Relatórios ao mesmo tempo</span><b>${vagasObs(s)}</b></div>
    <p class="sub" style="margin-top:6px">Você não vê o nível exato de quem é de outro clube: vê a faixa que o seu scout estima. Onde você manda os olheiros procurar, o conhecimento cresce toda semana e a faixa fecha. Onde ninguém olha, cai devagar. Mais olheiros e melhores = mais focos ao mesmo tempo e faixas mais justas. Para um jogador específico, peça um relatório (uma ou duas semanas).</p></section>
    <section class="painel"><p class="rotulo">Onde procurar</p>${linha(FOCO_JOVENS, "Jovens talentos (até 21 anos)", " · qualquer liga")}${linha(FOCO_LIVRES, "Agentes livres")}${ligas.map((id) => linha(id, infoLiga(id).nome, id === s.ligaId ? " · a sua liga" : "")).join("")}</section>
    <section class="painel"><p class="rotulo">Relatórios</p>${andando.map(([k, v]) => `<div class="not">${esc(k.split("|")[0])} <small class="sub">· sai em ${v - ab} ${v - ab === 1 ? "semana" : "semanas"}</small></div>`).join("")}${prontos.map(([k]) => `<div class="not">${esc(k.split("|")[0])} <small class="sub">· pronto${k.split("|")[1] !== "livre" ? ` (${esc(nomeClube(k.split("|")[1]))})` : " (livre)"}</small></div>`).join("") || (andando.length ? "" : `<p class="sub">Nenhum relatório. Peça na ficha de um jogador do mercado.</p>`)}</section>`;
}
function abaMercadoT(s: SaveTecnico): string {
  const jan = janelaT(s), f = filtroMercado, lista = buscarJogadores(pacote, s, f);
  const chip = (on: boolean, attrs: string, n: string) => `<button class="chip${on ? " ativo" : ""}" ${attrs}>${n}</button>`;
  return `<p class="aviso-t ${jan.aberta ? "ok" : ""}" style="margin-bottom:10px">${esc(jan.texto)} Caixa: <b>${curtoBrl(s.clube.saldo)}</b> · folha ${curtoBrl(folhaDe(s))} de ${curtoBrl(s.clube.tetoFolha)}.</p>
    <div class="chips" style="margin-bottom:6px">${chip(!f.pos, 'data-mpos=""', "Todas")}${(["GOL", "ZAG", "LAT", "VOL", "MEI", "PON", "ATA"] as PosT[]).map((p) => chip(f.pos === p, `data-mpos="${p}"`, p)).join("")}</div>
    <div class="chips" style="margin-bottom:6px">${chip(!f.idadeMax, 'data-midade="0"', "Qualquer idade")}${chip(f.idadeMax === 23, 'data-midade="23"', "Até 23")}${chip(f.idadeMax === 28, 'data-midade="28"', "Até 28")}</div>
    <div class="chips" style="margin-bottom:6px">${chip(f.minhaLiga, 'data-mliga="1"', `Só na ${esc(infoLiga(s.ligaId).curto)}`)}${chip(!f.minhaLiga, 'data-mliga="0"', "Todas as ligas")}</div>
    <div class="chips" style="margin-bottom:10px">${chip(f.alcance, 'data-malc="1"', "Ao seu alcance")}${chip(!f.alcance, 'data-malc="0"', "Todos")}</div>
    <div class="lista">${lista.map((x) => `<button class="lin" data-alvo="${esc(x.nome)}" data-clube="${x.clubeId}"><span class="num" style="font-size:13px">${x.pos}</span><span class="nm"><b>${esc(x.nome)}</b><small>${escudo(x.clubeId, "escudo esc-p")}${esc(nomeClube(x.clubeId))} · ${x.idade}a${x.titular ? ` <span class="pill">Titular</span>` : ""}</small><small>Valor ${curtoBrl(x.valor)}</small></span>${ovFaixa(s, faixaDe(s, x, x.ligaId, x.clubeId), x.nome, x.clubeId)}</button>`).join("") || `<p class="sub">Ninguém com esse filtro.</p>`}</div>
    <p class="sub" style="margin-top:8px">O nível de quem não é seu aparece como uma faixa: o que o seu scout acha. Ela fecha quando você manda os olheiros procurar naquela liga (aba Scout) ou pede um relatório do jogador.</p>`;
}
// ------------------------------------------------------------------ mesa de negociação de patrocínio (clube e seleção)
const PAPEIS: Papel[] = ["estrela", "titular", "rotacao", "reserva", "promessa"];
const logMesa = (l: { quem: string; texto: string }[]) => `<div class="neg-log">${l.slice(-8).map((x) => `<div class="neg-l ${x.quem}"><small>${x.quem === "voce" ? "Você" : x.quem === "info" ? "Situação" : x.quem === "marca" ? "Marca" : x.quem === "clube" ? "Clube" : "Jogador"}</small>${esc(x.texto)}</div>`).join("")}</div>`;
const marcar = (id: string, on: boolean, txt: string) => `<label class="neg-check"><input type="checkbox" id="${id}"${on ? " checked" : ""}> ${txt}</label>`;
const selNum = (id: string, ops: number[], atual: number, rot: (n: number) => string) => `<select class="campo-sel" id="${id}">${ops.map((n) => `<option value="${n}"${n === atual ? " selected" : ""}>${rot(n)}</option>`).join("")}</select>`;
function mesaPatroHtml(m: MesaPatro, chave: string, sel: boolean, extra = ""): string {
  const mk = MARCA[m.marca], c = m.contra;
  return `<button class="fechar" data-fechar aria-label="Fechar">×</button>
    <div style="display:flex;gap:10px;align-items:center">${mk ? logoSvg(mk, 30) : ""}<div><p class="rotulo" style="margin:0">Negociação de patrocínio${sel ? " · seleção" : ""}</p><h2 style="margin:0">${esc(mk?.nome ?? m.marca)}</h2></div></div>
    <div class="dl"><span>Perfil</span><b>${NOME_PERFIL_MARCA[m.perfil]}</b><span>Paciência</span><b>${m.saiu ? "saiu da mesa" : "●".repeat(Math.max(0, m.paciencia)) + "○".repeat(Math.max(0, 4 - m.paciencia))}</b><span>Rodadas</span><b>${m.rodadas}</b></div>
    ${logMesa(m.log)}
    ${msgNeg ? `<p class="aviso-t ${msgNeg.ok ? "ok" : "erro"}" role="status">${esc(msgNeg.texto)}</p>` : ""}
    ${m.saiu ? "" : `<div class="neg-form"><p class="rotulo">Na mesa agora</p><p class="sub">${esc(textoPatro(c))}</p>
      <button class="botao" data-mp-aceitar="${esc(chave)}" style="width:100%;margin-bottom:12px">Aceitar a proposta da marca</button>
      <p class="rotulo">Sua contraproposta</p>
      <p class="sub" style="margin:0 0 4px">Valor fixo por mês</p>${campoValor("mp-fixo", c.fixo)}
      <p class="sub" style="margin:8px 0 4px">Anos de contrato</p>${selNum("mp-anos", sel ? [2, 3, 4, 5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 5, 6], c.anos, (n) => `${n} ${n === 1 ? "ano" : "anos"}`)}
      <p class="sub" style="margin:8px 0 4px">Luvas (na assinatura)</p>${campoValor("mp-luvas", c.luvas)}
      <p class="sub" style="margin:8px 0 4px">Bônus por título</p>${campoValor("mp-bt", c.bonusTitulo)}
      <p class="sub" style="margin:8px 0 4px">Bônus por ${sel ? "vaga na Copa do Mundo" : "vaga em copa continental"}</p>${campoValor("mp-bv", c.bonusVaga)}
      <div style="margin-top:8px">${sel ? "" : marcar("mp-reb", c.rebaixamento, "Aceito cláusula de redução de 40% se cair (a marca topa pagar mais)")}${marcar("mp-ren", c.renovacao, "Preferência da marca na renovação")}</div>
      ${extra}
      <button class="botao sec" data-mp-enviar="${esc(chave)}" style="width:100%;margin-top:10px">Enviar contraproposta</button>
      <p class="sub" style="margin-top:6px">Cada marca pesa diferente: a agressiva paga luvas e quer contrato longo; a conservadora prefere pagar bônus por resultado do que fixo; a parceira valoriza a preferência na renovação. Pedir demais gasta a paciência dela.</p></div>`}`;
}
function lerPacotePatro(): PacotePatro {
  const ck = (id: string) => !!(document.getElementById(id) as HTMLInputElement | null)?.checked;
  return { fixo: lerValor("mp-fixo"), anos: +((document.getElementById("mp-anos") as HTMLSelectElement | null)?.value ?? 3), luvas: lerValor("mp-luvas"), bonusTitulo: lerValor("mp-bt"), bonusVaga: lerValor("mp-bv"), rebaixamento: ck("mp-reb"), renovacao: ck("mp-ren") };
}
function abrirMesaPatroUI(s: SaveTecnico, chave: string): boolean {
  const [tipo, cota, marca] = chave.split("|");
  if (tipo === "s") { const m = mesaSel(pacote, s, cota as CotaSel, marca); if (!m) return false; abrir(mesaPatroHtml(m, chave, true)); return true; }
  const m = mesaPatro(pacote, s, cota as Cota, marca); if (!m) return false;
  const mo = MARCA[marca], nomes = mo ? [`${mo.nome} Arena`, `Arena ${mo.nome}`, `Estádio ${mo.nome}`, `${mo.nome} Park`] : [];
  abrir(mesaPatroHtml(m, chave, false, cota === "arena" ? `<p class="sub" style="margin:8px 0 4px">Nome da arena</p><select class="campo-sel" id="mp-nome">${nomes.map((n) => `<option>${esc(n)}</option>`).join("")}</select>` : ""));
  return true;
}

// ------------------------------------------------------------------ mesa de transferência (clube e depois jogador/empresário)
function negociarHtml(s: SaveTecnico, nome: string, clubeId: string): string {
  const fecharB = `<button class="fechar" data-fechar aria-label="Fechar">×</button>`, jan = janelaT(s), id = `${clubeId}|${nome}`;
  const n = s.negs?.[id];
  let topo = "";
  if (clubeId === "livre") {
    const x = agentesLivresT(pacote, s).find((l) => l.nome === nome);
    if (!x && !n) return `${fecharB}<p class="sub">Esse jogador já acertou com outro clube.</p>`;
    topo = `<div><p class="rotulo">${x ? `${NOME_POS_T[x.pos]} · ${x.idade} anos · ${x.nac} · ` : ""}agente livre</p><h2>${esc(nome)}</h2></div>${x ? relatorioScout(s, faixaDe(s, x), x.nome) : ""}`;
  } else {
    const a = alvoPorNome(pacote, s, nome, clubeId);
    if (!a) return `${fecharB}<p class="sub">Esse jogador não está mais nesse clube.</p>`;
    const int = interesseDo(pacote, s, a), fx = faixaDe(s, a, a.ligaId, a.clubeId), anos = contratoRestante(s, a.nome, a.clubeId);
    topo = `<div><p class="rotulo">${NOME_POS_T[a.pos]} · ${a.idade} anos · ${a.nac}</p><h2>${esc(a.nome)}</h2></div>
    <div class="clube-op" style="border:0">${escudo(a.clubeId)}<div><b>${esc(nomeClube(a.clubeId))}</b><br><small class="sub">${esc(infoLiga(a.ligaId).curto)}${a.titular ? " · titular" : ""} · contrato por mais ${anos} ${anos === 1 ? "ano" : "anos"}</small></div><span class="ov"><strong style="font-family:var(--display);font-size:26px;color:var(--ouro-claro)">${textoFaixa(fx)}</strong><span>OVR</span></span></div>
    ${relatorioScout(s, fx, a.nome, a.clubeId)}
    <div class="dl"><span>Valor de mercado</span><b>${valorBrl(a.valor)}</b><span>Salário que ele pede</span><b>${valorBrl(int.salario)}/mês</b><span>Seu caixa</span><b>${valorBrl(s.clube.saldo)}</b><span>Folha</span><b>${curtoBrl(folhaDe(s))} de ${curtoBrl(s.clube.tetoFolha)}</b></div>
    <p class="aviso-t ${int.topa ? "ok" : "erro"}">${esc(int.motivo)}</p>`;
    if (!n || n.fase === "fechada") {
      if (!jan.aberta) return `${fecharB}${topo}<p class="sub">${esc(jan.texto)}</p>`;
      if (!int.topa) return `${fecharB}${topo}`;
      return `${fecharB}${topo}${msgNeg ? `<p class="aviso-t ${msgNeg.ok ? "ok" : "erro"}">${esc(msgNeg.texto)}</p>` : ""}<div class="botoes"><button class="botao" data-tn-abrir="compra" data-tn-nome="${esc(a.nome)}" data-tn-clube="${a.clubeId}">Negociar a compra</button><button class="botao sec" data-tn-abrir="emprestimo" data-tn-nome="${esc(a.nome)}" data-tn-clube="${a.clubeId}">Pedir emprestado</button></div>
        <p class="sub">A negociação tem duas partes: primeiro com o clube (valor, parcelas, bônus, porcentagem de revenda, até um jogador na troca), depois com o jogador e o empresário (salário, anos, luvas, multa, papel no time e comissão).</p>`;
    }
  }
  if (!n) return `${fecharB}${topo}<div class="botoes"><button class="botao" data-tn-abrir="livre" data-tn-nome="${esc(nome)}" data-tn-clube="livre">Conversar com o empresário</button></div>`;
  return `${fecharB}${topo}${mesaTransfHtml(s, n)}`;
}
function mesaTransfHtml(s: SaveTecnico, n: Negociacao): string {
  const idA = esc(n.id), nomeC = n.clubeId === "livre" ? "" : nomeClube(n.clubeId);
  const cab = `<div class="dl"><span>Negociação</span><b>${n.tipo === "compra" ? "Compra" : n.tipo === "emprestimo" ? "Empréstimo" : "Agente livre"} · ${n.fase === "clube" ? `com o ${esc(nomeC)}` : n.fase === "jogador" ? "com o jogador e o empresário" : "encerrada"}</b>${n.tipo !== "livre" ? `<span>Jeito do clube</span><b>${NOME_PERFIL_CLUBE[n.perfil]}</b>` : ""}<span>Paciência</span><b>${(() => { const pc = n.fase === "jogador" ? n.jogador?.paciencia ?? 0 : n.paciencia; return "●".repeat(Math.max(0, pc)) + "○".repeat(Math.max(0, (n.fase === "jogador" ? 3 : 5) - pc)); })()}</b>${n.rival ? `<span>Disputa</span><b class="neg">${esc(nomeClube(n.rival))} também quer</b>` : ""}</div>`;
  const aviso = msgNeg ? `<p class="aviso-t ${msgNeg.ok ? "ok" : "erro"}" role="status">${esc(msgNeg.texto)}</p>` : "";
  const sair = `<button class="botao sec peq" data-tn-desistir="${idA}">Desistir</button>`;
  if (n.fase === "encerrada") return `${cab}${logMesa(n.log)}${aviso}<p class="sub">A conversa acabou nesta janela.</p>`;
  if (n.fase === "clube" && n.tipo === "compra") {
    const c = n.contraClube ?? { avista: n.pedido, parcelado: 0, parcelas: 0, bonus: 0, revenda: 0 };
    const trocas = s.elenco.filter((x) => !x.emprestadoDe).sort((a, b) => ovrDe(b) - ovrDe(a));
    return `${cab}${logMesa(n.log)}${aviso}
      <div class="neg-form"><p class="rotulo">O ${esc(nomeC)} pede</p><p class="sub">${esc(textoPac(c, s))}</p>
      <div class="botoes" style="margin-bottom:12px"><button class="botao peq" data-tn-aceitar-clube="${idA}">Aceitar o que o clube pede</button>${sair}</div>
      <p class="rotulo">Sua proposta</p>
      <p class="sub" style="margin:0 0 4px">À vista</p>${campoValor("tn-av", Math.round(c.avista * (n.rodadas ? 0.92 : 0.75)))}
      <p class="sub" style="margin:8px 0 4px">Parcelado (pago nas próximas temporadas)</p>${campoValor("tn-pa", c.parcelado || 0)}
      ${selNum("tn-pn", [0, 2, 3], c.parcelas || 0, (x) => x ? `em ${x} parcelas anuais` : "sem parcelas")}
      <p class="sub" style="margin:8px 0 4px">Bônus por metas (só paga se ele jogar 20 jogos)</p>${campoValor("tn-bo", c.bonus || 0)}
      <p class="sub" style="margin:8px 0 4px">Porcentagem de uma venda futura para eles</p>${selNum("tn-rv", [0, 5, 10, 15, 20, 25, 30], c.revenda, (x) => x ? `${x}% de revenda` : "sem revenda")}
      <p class="sub" style="margin:8px 0 4px">Jogador na troca</p><select class="campo-sel" id="tn-tr"><option value="">Ninguém</option>${trocas.map((x) => `<option value="${esc(x.id)}">${esc(x.nome)} (${x.pos}, ${ovrDe(x)}, ${x.idade}a)</option>`).join("")}</select>
      <button class="botao" data-tn-clube-env="${idA}" style="width:100%;margin-top:10px">Enviar proposta ao clube</button>
      <p class="sub" style="margin-top:6px">Parcela pesa menos no seu caixa, mas vale menos para quem vende. Bônus é incerto (vale pouco para eles). Revenda pesa em garoto. Clube vendedor gosta de dinheiro à vista; clube duro cede devagar. Oferta muito baixa irrita.</p></div>`;
  }
  if (n.fase === "clube" && n.tipo === "emprestimo") {
    const e = n.contraEmp ?? { taxa: 0, salarioPct: 100, opcao: 0, obrigacao: false };
    return `${cab}${logMesa(n.log)}${aviso}
      <div class="neg-form"><p class="rotulo">O ${esc(nomeC)} pede</p><p class="sub">${esc(textoEmp(e))}</p>
      <div class="botoes" style="margin-bottom:12px"><button class="botao peq" data-tn-aceitar-clube="${idA}">Aceitar</button>${sair}</div>
      <p class="rotulo">Sua proposta de empréstimo (até o fim da temporada)</p>
      <p class="sub" style="margin:0 0 4px">Taxa de empréstimo</p>${campoValor("tn-tx", Math.round(e.taxa * 0.6))}
      <p class="sub" style="margin:8px 0 4px">Quanto do salário você paga</p>${selNum("tn-sp", [30, 40, 50, 60, 70, 80, 90, 100], Math.max(30, e.salarioPct - 20), (x) => `${x}% do salário`)}
      <p class="sub" style="margin:8px 0 4px">Valor da opção de compra (0 = sem opção)</p>${campoValor("tn-op", e.opcao)}
      ${marcar("tn-ob", e.obrigacao, "Transformar em obrigação de compra (o clube gosta, mas você paga no fim)")}
      <button class="botao" data-tn-emp-env="${idA}" style="width:100%;margin-top:10px">Enviar proposta</button></div>`;
  }
  // fase do jogador
  const d = n.jogador!, q = d.quer, emp = n.tipo === "emprestimo";
  return `${cab}${logMesa(n.log)}${aviso}
    <div class="neg-form"><p class="rotulo">O empresário pede</p><p class="sub">${valorBrl(q.salario)}/mês${emp ? "" : ` por ${q.anos} ${q.anos === 1 ? "ano" : "anos"}, ${valorBrl(q.luvas)} de luvas, multa de ${valorBrl(q.multa)}`}, papel de ${NOME_PAPEL[q.papel].toLowerCase()} e ${valorBrl(q.comissao)} de comissão.</p>
    <div class="botoes" style="margin-bottom:12px"><button class="botao peq" data-tn-aceitar-jog="${idA}">Aceitar o pedido</button>${sair}</div>
    <p class="rotulo">Sua proposta ao jogador</p>
    <p class="sub" style="margin:0 0 4px">Salário por mês${emp ? ` (você paga ${n.acordoEmp?.salarioPct ?? 100}%)` : ""}</p>${campoValor("tn-sal", Math.round(q.salario * 0.88))}
    ${emp ? "" : `<p class="sub" style="margin:8px 0 4px">Anos de contrato</p>${selNum("tn-an", [1, 2, 3, 4, 5], q.anos, (x) => `${x} ${x === 1 ? "ano" : "anos"}`)}
    <p class="sub" style="margin:8px 0 4px">Luvas (na assinatura)</p>${campoValor("tn-lu", Math.round(q.luvas * 0.5))}
    <p class="sub" style="margin:8px 0 4px">Multa rescisória (quem pagar leva ele)</p>${campoValor("tn-mu", q.multa)}`}
    ${emp ? "" : `<p class="sub" style="margin:8px 0 4px">Bônus por jogo (quando entra em campo)</p>${campoValor("tn-bj", q.bonusJogo ?? 0)}
    <p class="sub" style="margin:8px 0 4px">Bônus por gol</p>${campoValor("tn-bg", q.bonusGol ?? 0)}`}
    <p class="sub" style="margin:8px 0 4px">Papel prometido no time</p><select class="campo-sel" id="tn-pp">${PAPEIS.map((x) => `<option value="${x}"${x === q.papel ? " selected" : ""}>${NOME_PAPEL[x]}</option>`).join("")}</select>
    <p class="sub" style="margin:8px 0 4px">Comissão do empresário</p>${campoValor("tn-co", Math.round(q.comissao * 0.6))}
    <button class="botao" data-tn-jog-env="${idA}" style="width:100%;margin-top:10px">Enviar proposta ao jogador</button>
    <p class="sub" style="margin-top:6px">Prometer um papel maior baixa o salário que ele pede, mas ele cobra depois se não jogar. Contrato mais curto que o que ele quer, ou multa alta, encarece. Luvas maiores reduzem o salário. Bônus por jogo e por gol também baixam o salário fixo (ele desconta o risco de não jogar). O empresário tem um mínimo de comissão.</p></div>`;
}
function abaPropostas(s: SaveTecnico): string {
  const jan = janelaT(s), por = new Map(s.elenco.map((a) => [a.id, a])), fL = infoLiga(s.ligaId).fLiga, ano = (t: number) => ANO_INICIAL_T + t;
  const pv = s.propostasV ?? [], oe = s.ofertasEmp ?? [], opc = s.opcoesCompra ?? [], hist = (s.transferencias ?? []).slice(0, 15);
  const negs = Object.values(s.negs ?? {}).filter((n) => n.fase === "clube" || n.fase === "jogador");
  const venda = pv.map((p, i) => { const a = por.get(p.atletaId); if (!a) return ""; const outras = pv.filter((x) => x.atletaId === p.atletaId && x !== p && valorVenda(x) > valorVenda(p)).length;
    return `<div class="painel" style="margin-bottom:8px"><div class="clube-op" style="border:0;padding:0">${escudo(p.clubeId)}<div><b>${esc(a.nome)}</b> <small class="sub">(${a.pos}, ${ovrDe(a)}, ${a.idade}a)</small><br><small class="sub">${esc(nomeClube(p.clubeId))} quer comprar</small></div><b style="font-size:16px">${curtoBrl(p.avista + p.parcelado)}</b></div>
      <p class="sub" style="margin:6px 0">${esc(textoPac({ ...p, troca: undefined }))}. Vale ${curtoBrl(valorAtleta(a, fL, s.temporada))} no mercado.${a.revenda ? ` O ${esc(nomeClube(a.revenda.clubeId))} leva ${a.revenda.pct}% da venda.` : ""}</p>
      <div class="botoes" style="margin-bottom:8px"><button class="botao peq" data-pv-aceitar="${esc(p.id)}">Vender</button><button class="botao sec peq" data-pv-recusar="${esc(p.id)}">Recusar</button>${outras && !p.leilao ? `<button class="botao sec peq" data-pv-leilao="${esc(p.id)}">Usar a proposta maior para eles cobrirem</button>` : ""}</div>
      <details><summary class="sub" style="cursor:pointer">Fazer contraproposta</summary>
      <p class="sub" style="margin:6px 0 4px">À vista</p>${campoValor(`pv-av-${i}`, Math.round(p.avista * 1.2))}
      <p class="sub" style="margin:8px 0 4px">Parcelado</p>${campoValor(`pv-pa-${i}`, p.parcelado)}${selNum(`pv-pn-${i}`, [0, 2, 3], p.parcelas, (x) => x ? `em ${x} parcelas anuais` : "sem parcelas")}
      <p class="sub" style="margin:8px 0 4px">Bônus por metas</p>${campoValor(`pv-bo-${i}`, p.bonus)}
      <p class="sub" style="margin:8px 0 4px">Sua porcentagem numa venda futura</p>${selNum(`pv-rv-${i}`, [0, 5, 10, 15, 20, 25, 30], p.revenda, (x) => x ? `${x}% para você` : "sem revenda")}
      <button class="botao sec peq" data-pv-contra="${esc(p.id)}" data-i="${i}" style="margin-top:8px">Mandar contraproposta</button></details></div>`; }).join("");
  const emp = oe.map((o, i) => { const a = por.get(o.atletaId); if (!a) return "";
    return `<div class="painel" style="margin-bottom:8px"><div class="clube-op" style="border:0;padding:0">${escudo(o.clubeId)}<div><b>${esc(a.nome)}</b> <small class="sub">(${a.pos}, ${ovrDe(a)}, ${a.idade}a)</small><br><small class="sub">${esc(nomeClube(o.clubeId))} quer emprestado</small></div><b style="font-size:14px">${o.salarioPct}% do salário</b></div>
      <p class="sub" style="margin:6px 0">Até o fim da temporada · taxa de ${valorBrl(o.taxa)} · papel: ${NOME_PAPEL[o.papel].toLowerCase()}${o.opcao ? ` · opção de compra de ${valorBrl(o.opcao)}` : " · sem opção de compra"}. Eles pagam ${o.salarioPct}% do salário, você paga o resto.</p>
      <div class="botoes" style="margin-bottom:8px"><button class="botao peq" data-oe-aceitar="${esc(o.id)}">Emprestar</button><button class="botao sec peq" data-oe-recusar="${esc(o.id)}">Recusar</button></div>
      <details><summary class="sub" style="cursor:pointer">Pedir condições melhores</summary>
      <p class="sub" style="margin:6px 0 4px">Quanto do salário eles pagam</p>${selNum(`oe-sp-${i}`, [30, 40, 50, 60, 70, 80, 90, 100], Math.min(100, o.salarioPct + 20), (x) => `${x}%`)}
      <p class="sub" style="margin:8px 0 4px">Taxa</p>${campoValor(`oe-tx-${i}`, o.taxa || 10000)}
      ${o.opcao ? marcar(`oe-so-${i}`, false, "Sem opção de compra (ele volta com certeza)") : ""}${marcar(`oe-ti-${i}`, o.papel === "titular", "Exigir que ele seja titular lá")}
      <button class="botao sec peq" data-oe-contra="${esc(o.id)}" data-i="${i}" style="margin-top:8px">Mandar contraproposta</button></details></div>`; }).join("");
  const ops = opc.map((o) => { const a = por.get(o.atletaId); return a ? `<div class="not" style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span><b>${esc(a.nome)}</b> <small class="sub">opção de compra do ${esc(nomeClube(o.clubeId))}: ${curtoBrl(o.valor)} (vale ${curtoBrl(valorAtleta(a, fL, s.temporada))})</small></span><span class="botoes"><button class="botao peq" data-opc="${esc(a.id)}|1">Comprar</button><button class="botao sec peq" data-opc="${esc(a.id)}|0">Devolver</button></span></div>` : ""; }).join("");
  const fora = (s.emprestados ?? []).map((e) => `<div class="not">${escudo(e.clubeId, "escudo esc-p")} <b>${esc(e.atleta.nome)}</b> <small class="sub">no ${esc(nomeClube(e.clubeId))} até ${ano(e.ate)} · ${NOME_PAPEL[e.papel].toLowerCase()} · ${e.jogos} jogos, ${e.gols} gols${e.opcao ? ` · opção de ${curtoBrl(e.opcao)}` : ""}</small></div>`).join("");
  const contas = (s.contas ?? []).map((c) => `<div class="not"><small>${ano(c.t)}</small>${c.tipo === "pagar" ? "↑ Pagar" : "↓ Receber"} ${curtoBrl(c.valor)} · ${esc(c.texto)}${c.cond ? " (se bater a meta)" : ""}</div>`).join("");
  const abertas = negs.map((n) => `<div class="not" style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span><b>${esc(n.nome)}</b><small class="sub" style="display:block">${n.clubeId === "livre" ? "agente livre" : esc(nomeClube(n.clubeId))} · ${n.tipo === "emprestimo" ? "empréstimo" : n.tipo === "livre" ? "contrato" : "compra"} · ${n.fase === "clube" ? "falando com o clube" : "falando com o empresário"}</small></span><button class="botao sec peq" data-tn-ver="${esc(n.id)}">Abrir</button></div>`).join("");
  return `${aviso()}<p class="sub" style="margin-bottom:8px">${esc(jan.texto)} Na ficha do jogador dá para colocar à venda ou para empréstimo: garotos da base sem espaço também recebem propostas de empréstimo.</p>
    ${abertas ? `<p class="rotulo">Suas negociações abertas</p><div style="margin-bottom:12px">${abertas}</div>` : ""}
    <p class="rotulo">Propostas de compra</p>${venda || `<p class="sub">Nenhuma agora.</p>`}
    <p class="rotulo" style="margin-top:12px">Propostas de empréstimo</p>${emp || `<p class="sub">Nenhuma agora.</p>`}
    ${ops ? `<p class="rotulo" style="margin-top:12px">Opções de compra para decidir</p>${ops}` : ""}
    ${fora ? `<p class="rotulo" style="margin-top:12px">Seus jogadores emprestados</p>${fora}` : ""}
    ${contas ? `<p class="rotulo" style="margin-top:12px">Parcelas e bônus a vencer</p>${contas}` : ""}
    ${(s.revendas ?? []).length ? `<p class="rotulo" style="margin-top:12px">Revendas a seu favor</p>${s.revendas!.map((r) => `<div class="not">${esc(r.nome)} <small class="sub">· ${r.pct}% de uma venda futura pelo ${esc(nomeClube(r.clubeId))}</small></div>`).join("")}` : ""}
    ${hist.length ? `<p class="rotulo" style="margin-top:14px">Transferências</p>${hist.map((t) => `<div class="not"><small>${ano(t.t)} · ${t.venda ? "saída" : "chegada"}</small>${esc(t.nome)}: ${t.venda ? `para o ${esc(nomeClube(t.para))}` : `do ${esc(nomeClube(t.de))}`}${t.valor ? ` · ${curtoBrl(t.valor)}` : ""}</div>`).join("")}` : ""}`;
}
function abaLivres(s: SaveTecnico): string {
  const l = agentesLivresT(pacote, s);
  return `<p class="sub" style="margin-bottom:8px">Sem custo de transferência, mas jogador livre pede luvas e o empresário cobra comissão. A lista muda todo mês. Jogador bom demais para o clube pode recusar. O nível e o potencial são o que o seu scout acha: mande olheiros procurar agentes livres na aba Scout ou peça um relatório para fechar a faixa.</p>${aviso()}
    <div class="lista">${l.map((x) => `<div class="lin" style="cursor:default"><span class="num" style="font-size:13px">${x.pos}</span><span class="nm"><b>${esc(x.nome)}</b><small>${x.idade}a · ${x.nac} · ${valorBrl(x.pedido)}/mês</small>
      <span class="botoes" style="margin-top:5px"><button class="botao sec peq" data-alvo="${esc(x.nome)}" data-clube="livre">Negociar</button>${statusObs(s, x.nome) === "nao" ? `<button class="botao sec peq" data-observar="${esc(x.nome)}" data-clube="">Relatório</button>` : ""}</span></span>${ovFaixa(s, faixaDe(s, x), x.nome)}</div>`).join("")}</div>
`;
}

// ------------------------------------------------------------------ Tática
/** O elenco inteiro na tela da escalação: titulares (na vaga), banco e quem está fora, com condição, moral e alertas. */
function elencoEscalacao(s: SaveTecnico, reservas: Atleta[]): string {
  const vagas = FORMACOES[s.tatica.formacao], av = s.aoVivo, tit = s.esc.titulares;
  // titular: a função escolhida ali mesmo, embaixo do nome (estrelas = encaixe dele naquela função)
  const funcao = (a: Atleta, pos: PosT) => { const atual = funcaoNaVaga(s.esc, a, pos);
    return `<div class="esc-funcao"><select class="campo-sel sel-funcao" data-funcao="${esc(a.id)}" aria-label="Função de ${esc(a.nome)}">${funcoesDa(pos).map((f) => `<option value="${f.id}" ${f.id === atual?.id ? "selected" : ""}>${"★".repeat(estrelasEncaixe(encaixe(a.at, exDe(a), f), ovrPos(a.at, pos)))} ${esc(f.nome)}</option>`).join("")}</select><small>${esc(atual?.desc ?? "")}</small></div>`; };
  const linha = (a: Atleta, rot: string, pos: PosT, onde: "tit" | "banco" | "fora", lado?: Lado) => {
    const cond = Math.round(av?.cond[a.id] ?? a.condicao), enc = rotuloEncaixe(a, pos, lado), ov = Math.round(onde === "tit" ? ovrNaVaga(a, pos, lado) : ovrDe(a));
    const saiu = av && (av.fora.includes(a.id) || (av.stats[a.id] && !(av.emCampo ?? []).includes(a.id)));
    const alertas = [a.lesao > 0 ? `<span class="pill ruim">Lesão ${a.lesao} sem.</span>` : "", a.suspenso > 0 ? `<span class="pill ruim">Suspenso</span>` : "", onde === "tit" && enc ? `<span class="pill aviso">${esc(enc)}</span>` : "", saiu ? `<span class="pill">Saiu do jogo</span>` : "", a.querSair ? `<span class="pill aviso">Quer sair</span>` : ""].join("");
    const corC = cond >= 80 ? "#74D394" : cond >= 62 ? "#E3B341" : "#EC7D69", humor = a.moral >= 75 ? "😄" : a.moral >= 55 ? "🙂" : a.moral >= 35 ? "😐" : "😠";
    const banco = onde === "tit" || av ? "" : `<button class="chip mini" data-banco="${esc(a.id)}">${onde === "banco" ? "Tirar" : "+ Banco"}</button>`;
    return `<div class="esc-lin${selEsc === `j:${a.id}` ? " sel" : ""}${!disponivel(a) || saiu ? " apagado" : ""}"><button class="esc-toque" data-sel="j:${esc(a.id)}"><span class="pos-chip" style="background:${corPos(onde === "tit" ? pos : a.pos)}">${esc(rot)}</span>
      <span class="nm"><b>${esc(a.nome)}</b><small>${rotuloPos(a)} · ${a.idade} anos · <span class="mini-barra" title="Condição"><i style="--v:${cond}%;--c:${corC}"></i></span> ${cond}% · ${humor}${alertas ? ` ${alertas}` : ""}</small></span>
      <span class="ov"><strong>${ov}</strong></span></button>${banco}${onde === "tit" ? funcao(a, pos) : ""}</div>`;
  };
  const titulares = vagas.map((v, i) => { const a = s.elenco.find((x) => x.id === tit[i]); return a ? linha(a, v.rot, v.pos, "tit", ladoDaVaga(v)) : `<div class="esc-lin${selEsc === `v:${i}` ? " sel" : ""}"><button class="esc-toque" data-sel="v:${i}"><span class="pos-chip vazio">${v.rot}</span><span class="nm"><b>Vaga vazia</b><small>Toque para escolher quem entra</small></span><span></span></button></div>`; }).join("");
  const usados = new Set([...tit.filter(Boolean) as string[], ...s.esc.reservas]);
  const fora = s.elenco.filter((a) => !usados.has(a.id)).sort((a, b) => Number(disponivel(b)) - Number(disponivel(a)) || ovrDe(b) - ovrDe(a));
  const sel = selEsc ? (selEsc.startsWith("j:") ? s.elenco.find((a) => a.id === selEsc!.slice(2))?.nome : `a vaga ${vagas[+selEsc.slice(2)]?.rot ?? ""}`) : undefined;
  const vagaSel = selEsc?.startsWith("v:") ? +selEsc.slice(2) : selEsc ? tit.indexOf(selEsc.slice(2)) : -1;
  return `${sel ? `<div class="sel-barra"><span>Selecionado: <b>${esc(sel)}</b>. Toque em quem vai trocar de lugar.</span><span class="botoes">${vagaSel >= 0 ? `<button class="chip mini" data-vaga="${vagaSel}">Ver opções</button>` : ""}<button class="chip mini" data-sel-cancelar>Cancelar</button></span></div>` : ""}
    <p class="rotulo" style="margin-top:14px">Titulares</p><div class="lista esc-lista">${titulares}</div>
    <p class="rotulo" style="margin-top:14px">Banco <small>(${reservas.length} de 9)</small></p><div class="lista esc-lista">${reservas.map((a) => linha(a, rotuloPos(a), a.pos, "banco")).join("") || `<p class="sub">Ninguém no banco.</p>`}</div>
    <p class="rotulo" style="margin-top:14px">Fora do jogo <small>(${fora.length})</small></p><div class="lista esc-lista">${fora.map((a) => linha(a, rotuloPos(a), a.pos, "fora")).join("") || `<p class="sub">Todo o elenco está relacionado.</p>`}</div>`;
}
function abaTatica(s: SaveTecnico): string {
  const vagas = FORMACOES[s.tatica.formacao], por = new Map(s.elenco.map((a) => [a.id, a])), t = s.tatica;
  const f = forcaDoTime(s.elenco, s.esc, t, s.entrosamento[t.formacao] ?? 40);
  const campo = `<div class="campo"><div class="area cima"></div><div class="area baixo"></div><div class="circ"></div>${vagas.map((v, i) => {
    const a = por.get(s.esc.titulares[i] ?? "");
    if (!a) return `<button class="vaga vazia${selEsc === `v:${i}` ? " sel" : ""}" data-sel="v:${i}" style="left:${v.x}%;top:${v.y}%"><span class="bola">+</span><span class="nomev">${v.rot}</span></button>`;
    const ruim = !disponivel(a) || rotuloEncaixe(a, v.pos, ladoDaVaga(v)) !== "";
    return `<button class="vaga${ruim ? " alerta" : ""}${selEsc === `j:${a.id}` ? " sel" : ""}" data-sel="j:${a.id}" style="left:${v.x}%;top:${v.y}%" aria-label="${v.rot}: ${esc(a.nome)}"><span class="bola" style="background:${corPos(v.pos)}">${a.numero}</span><span class="nomev">${esc(a.nome.split(" ").slice(-1)[0])}</span><span class="notav">${v.rot} · ${Math.round(ovrNaVaga(a, v.pos, ladoDaVaga(v)))}</span></button>`;
  }).join("")}</div>`;
  const chips = (campo: string, nomes: string[], atual: number) => `<div class="chips">${nomes.map((n, i) => `<button class="chip${i === atual ? " ativo" : ""}" data-tat="${campo}" data-v="${i}">${n}</button>`).join("")}</div>`;
  const reservas = s.esc.reservas.map((id) => por.get(id)).filter(Boolean) as Atleta[];
  return `<div class="chips" style="margin-bottom:10px">${NOMES_FORMACAO.map((n) => `<button class="chip${n === t.formacao ? " ativo" : ""}" data-form="${n}">${n}</button>`).join("")}</div>
    <div class="forca3" style="margin-bottom:10px"><div><strong>${Math.round(f.defesa)}</strong><span>Defesa</span></div><div><strong>${Math.round(f.meio)}</strong><span>Meio</span></div><div><strong>${Math.round(f.ataque)}</strong><span>Ataque</span></div></div>
    <div class="botoes" style="margin-bottom:8px"><button class="botao sec peq" data-melhor-time>Escalar o melhor time</button><button class="botao sec peq" data-salvar-esc>Salvar esta escalação</button>${(s.escSalvas ?? []).map((e, i) => `<button class="chip" data-usar-esc="${i}" title="${esc(e.formacao)}">${esc(e.nome)}</button><button class="chip" data-apagar-esc="${i}" aria-label="Apagar ${esc(e.nome)}">✕</button>`).join("")}</div>
    ${campo}
    <p class="sub" style="margin:8px 0"><b style="color:var(--giz)">Arraste</b> um jogador (no campo, ou pela etiqueta da posição na lista) para outra vaga, para o banco ou para cima de outro jogador. Ou toque num e depois no outro. Entrosamento no ${t.formacao}: <b style="color:var(--giz)">${Math.round(s.entrosamento[t.formacao] ?? 40)}%</b>. Contorno vermelho: improvisado, lesionado ou suspenso.</p>
    ${s.aoVivo ? `<p class="aviso-t ok" style="margin-top:8px">Jogo parado no ${s.aoVivo.minuto ?? 0}' · ${s.aoVivo.souCasa ? s.aoVivo.gMe : s.aoVivo.gAdv} × ${s.aoVivo.souCasa ? s.aoVivo.gAdv : s.aoVivo.gMe}. As mudanças valem quando o jogo voltar. Trocas: ${trocasNoIntervalo(s)} de ${MAX_TROCAS}.</p><button class="botao grande" data-vivo style="margin-top:8px">▶ Voltar para o jogo</button>` : `<div class="botoes"><button class="botao peq" data-melhor>Melhor escalação</button></div>`}
    ${elencoEscalacao(s, reservas)}

    <p class="sub" style="font-size:12.5px;margin-top:4px">Se você não mexer durante o jogo, o auxiliar faz até 3 trocas a partir dos 60', tirando quem estiver mais cansado.</p>
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
  const av = s.aoVivo, podeVoltar = (a: Atleta) => !av || (!av.fora.includes(a.id) && ((av.emCampo ?? []).includes(a.id) || !av.stats[a.id]));
  const lista = [...s.elenco].filter((a) => !av || podeVoltar(a)).sort((a, b) => Number(disponivel(b)) - Number(disponivel(a)) || ovrNaVaga(b, v.pos, ladoDaVaga(v)) - ovrNaVaga(a, v.pos, ladoDaVaga(v)));
  return `<button class="fechar" data-fechar aria-label="Fechar">×</button><div><p class="rotulo">Vaga</p><h2>${v.rot} · ${NOME_POS_T[v.pos]}</h2></div>
    <div class="lista">${lista.map((a) => {
      const enc = rotuloEncaixe(a, v.pos, ladoDaVaga(v)), onde = s.esc.titulares.indexOf(a.id);
      return `<button class="lin" data-escolher="${esc(a.id)}" data-i="${i}" ${disponivel(a) ? "" : "disabled style=\"opacity:.45\""}><span class="num" style="font-size:13px">${rotuloPos(a)}</span><span class="nm"><b>${esc(a.nome)}${a.id === atual ? " ✓" : ""}</b><small>${enc ? `<span class="pill aviso">${enc}</span>` : ""}${onde >= 0 && a.id !== atual ? `<span class="pill">Escalado</span>` : ""} físico ${Math.round(a.condicao)}% · forma ${formaDe(a).toFixed(1).replace(".", ",")}${a.lesao > 0 ? " · lesionado" : a.suspenso > 0 ? " · suspenso" : ""}</small></span><span class="ov"><strong>${Math.round(ovrNaVaga(a, v.pos, ladoDaVaga(v)))}</strong><span>na vaga</span></span></button>`;
    }).join("")}${atual ? `<button class="botao sec" data-escolher="" data-i="${i}" style="margin-top:8px">Deixar a vaga vazia</button>` : ""}</div>`;
}

// ------------------------------------------------------------------ Liga
// ------------------------------------------------------------------ Clube › Empregos (mercado de técnicos)
let ligaEmprego = "", filtroEmprego: "todos" | "balancando" | "vaga" = "todos";
function abaEmpregos(s: SaveTecnico): string {
  const ligas = ligasDoMercado(s);
  if (!ligas.includes(ligaEmprego)) ligaEmprego = s.ligaId;
  const cor: Record<string, string> = { vaga: "#5FC08A", balancando: "#E06A5A", pressao: "#E3B341", estavel: "#8FA39A" };
  const vagas = vagasAbertas(s).map((id) => situacaoDoClube(pacote, s, id));
  const linha = (c: SituacaoClube) => {
    const tec = c.status === "vaga" ? `<span style="color:${cor.vaga}">Vaga aberta</span>${c.saiu ? ` · ${esc(c.saiu)} caiu` : ""}` : c.seu ? "Você" : c.tecnico ? `${esc(c.tecnico.nome)} · ${c.tecnico.idade} anos${c.tecnico.desde < s.temporada ? ` · ${s.temporada - c.tecnico.desde + 1}ª temporada` : " · chegou neste ano"}` : "—";
    const interesse = s.interesses?.[c.clubeId] !== undefined;
    const acoes = c.seu ? "" : c.status === "vaga" ? `<button data-cand="${c.clubeId}">Candidatar-se</button>` : `${interesse ? `<span class="sub">Interesse declarado</span>` : `<button data-int="${c.clubeId}|0">Declarar interesse na mídia</button><button data-int="${c.clubeId}|1">Empresário sonda (discreto)</button>`}`;
    const req = c.seu ? "" : `<small class="sub" style="display:block">Pede reputação ${c.exige} (você tem ${s.tecnico.reputacao})${c.licenca > (s.tecnico.curso?.licenca ?? 2) ? " · licença maior" : ""}</small>`;
    return `<div class="v-card"><div style="display:flex;gap:10px;align-items:center"><button class="link-clube" data-perfil="${c.clubeId}">${escudo(c.clubeId)}</button><div style="flex:1;min-width:0"><b>${esc(nomeClube(c.clubeId))}</b><small class="sub" style="display:block">${c.semJogos ? `liga ainda sem jogos (esperado ${c.esperado}º)` : `${c.pos}º de ${c.n} (esperado ${c.esperado}º)`} · ${tec}</small>${req}</div><span style="font-size:12px;font-weight:700;color:${cor[c.status]};white-space:nowrap">${NOME_STATUS[c.status]}</span></div>
      ${c.seu ? "" : `<div class="v-barra" style="margin:6px 0"><i style="width:${c.pressao}%;background:${cor[c.status]}"></i></div>`}${acoes ? `<div class="v-acoes">${acoes}</div>` : ""}</div>`;
  };
  const l = listaEmpregos(pacote, s, ligaEmprego).filter((c) => filtroEmprego === "todos" || (filtroEmprego === "vaga" ? c.status === "vaga" : c.status === "balancando" || c.status === "pressao"));
  return `<section class="painel"><p class="rotulo">Mercado de técnicos</p><p class="sub" style="margin:0">Quem está estável, sob pressão ou balançando. Declarar interesse em público irrita a sua diretoria e a torcida; o empresário é discreto, mas pode vazar. Se o técnico de lá cair, quem demonstrou interesse é lembrado. Clube sem técnico contrata na hora.</p></section>
    ${vagas.length ? `<section class="painel"><p class="rotulo">Vagas abertas agora</p>${vagas.map(linha).join("")}</section>` : ""}
    <section class="painel"><div class="v-acoes" style="margin-bottom:6px">${ligas.map((id) => `<button class="${id === ligaEmprego ? "v-ativo" : ""}" data-ligaemp="${id}">${esc(infoLiga(id).curto)}</button>`).join("")}</div>
      <div class="v-acoes" style="margin-bottom:8px">${([["todos", "Todos"], ["balancando", "Balançando"], ["vaga", "Sem técnico"]] as const).map(([k, n]) => `<button class="${filtroEmprego === k ? "v-ativo" : ""}" data-filtroemp="${k}">${n}</button>`).join("")}</div>
      ${l.map(linha).join("") || `<p class="sub">Ninguém nessa situação nesta liga.</p>`}</section>`;
}

// ------------------------------------------------------------------ entrevista com o presidente e o contrato
let notaEntrevista: string | undefined;
function negociacaoHtml(s: SaveTecnico): string {
  const n = s.negociacaoT;
  if (!n) return "";
  const info = infoClube(pacote, n.clubeId), forca = mundo(pacote).clube[n.clubeId]?.forca ?? 65;
  const cab = `<button class="fechar" data-fechar aria-label="Fechar">×</button><div style="display:flex;gap:10px;align-items:center">${escudo(n.clubeId)}<div><p class="rotulo" style="margin:0">Reunião com o presidente</p><h2 style="margin:0">${esc(info?.nome ?? "")}</h2><p class="sub" style="margin:0">${esc(NOME_PERFIL[perfilDoClube(forca)])}</p></div></div>`;
  if (n.nota === undefined) {
    return cab + `<p class="sub" style="margin-top:10px">Antes de falar de dinheiro, o presidente quer te conhecer. As respostas pesam no quanto ele vai topar pagar.</p>
      ${ENTREVISTA.map((q) => `<p class="rotulo" style="margin:12px 0 6px">${esc(q.texto)}</p><div class="v-acoes" style="flex-direction:column;align-items:stretch">${q.opcoes.map((o) => `<button class="${n.respostas[q.id] === o.id ? "v-ativo" : ""}" data-resp="${q.id}|${o.id}" style="text-align:left">${esc(o.texto)}</button>`).join("")}</div>`).join("")}
      <div class="botoes" style="margin-top:14px"><button class="botao" data-entrevista ${ENTREVISTA.every((q) => n.respostas[q.id]) ? "" : "disabled"}>Terminar a entrevista</button></div>`;
  }
  const o = n.oferta;
  return cab + `${notaEntrevista ? `<p class="aviso-t ok" style="margin-top:10px">${esc(notaEntrevista)}</p>` : ""}
    <p class="rotulo" style="margin:12px 0 4px">Proposta do clube</p><div class="dl"><span>Salário</span><b>${curtoBrl(o.salario)}/mês</b><span>Contrato</span><b>${o.anos} ${o.anos === 1 ? "temporada" : "temporadas"}</b><span>Multa rescisória</span><b>${o.multaMeses} salários (${curtoBrl(o.salario * o.multaMeses)})</b></div>
    <p class="sub" style="margin-top:6px">A multa é o que o clube te paga se te demitir antes do fim do contrato.${n.recusou ? " <b>Esta é a última proposta: se pedir mais, eles desistem.</b>" : ""}</p>
    <p class="rotulo" style="margin:12px 0 4px">Seu pedido</p>
    <p class="sub" style="margin:0 0 4px">Salário por mês</p>${campoValor("negSal", o.salario)}
    <p class="sub" style="margin:10px 0 4px">Tempo de contrato</p><div class="v-acoes">${[1, 2, 3, 4].map((a) => `<button class="${negAnos === a ? "v-ativo" : ""}" data-neganos="${a}">${a} ${a === 1 ? "temporada" : "temporadas"}</button>`).join("")}</div>
    <p class="sub" style="margin:10px 0 4px">Multa rescisória</p><div class="v-acoes">${[0, 3, 6, 12, 18, 24].map((m) => `<button class="${negMulta === m ? "v-ativo" : ""}" data-negmulta="${m}">${m === 0 ? "Sem multa" : `${m} salários`}</button>`).join("")}</div>
    <div class="botoes" style="margin-top:14px"><button class="botao" data-negpropor>Fazer a proposta</button><button class="botao sec" data-negaceitar>Aceitar a do clube</button><button class="botao sec" data-negdesistir>Desistir</button></div>`;
}
let negAnos = 2, negMulta = 6;
function fecharContrato(s: SaveTecnico, c: NonNullable<SaveTecnico["contratoNovo"]>, texto: string) {
  s.contratoNovo = c;
  const alvo = s.ofertaEmprego?.clubeId, r = aceitarEmprego(pacote, s);
  fechar();
  if (r.ok && r.agora && alvo) { save = assumirNovoClube(pacote, s, alvo, true); save.contratoNovo = undefined; aba = "inicio"; }
  msg = { texto: `${texto} ${r.msg}`, ok: r.ok }; salvar(); render(); window.scrollTo(0, 0);
}

// ------------------------------------------------------------------ Revista ISPN (os 100 melhores)
let rvLista: ListaRevista = "mundo", rvAno: number | "previa" = "previa";
const previaCache = new Map<string, EdicaoRevista>();
function abaRevista(s: SaveTecnico): string {
  const anos = Object.keys(s.revista ?? {}).map(Number).sort((a, b) => b - a);
  if (rvAno !== "previa" && !anos.includes(rvAno)) rvAno = anos[0] ?? "previa";
  let ed: EdicaoRevista | undefined;
  if (rvAno === "previa") { const k = `${s.semente}|${s.temporada}|${s.semana}`; ed = previaCache.get(k); if (!ed) { ed = montarRevista(pacote, ANO_INICIAL_T + s.temporada, [], [], Math.max(1, s.semana - SEMANAS_PRE_T), revistaT(s)); previaCache.clear(); previaCache.set(k, ed); } }
  else ed = s.revista?.[rvAno];
  return `<section class="painel">${revistaHtml(ed, { lista: rvLista, ano: rvAno, anos: ["previa", ...anos], nomeClube, escudo: (id) => escudo(id, "escudo esc-p"), foto: (x) => fotoNpcT(x.nome, x.clubeId, x.idade) })}</section>`;
}
/** Rosto de um jogador do mundo, sorteado pelo nome (sempre o mesmo), com a camisa do clube. */
function fotoNpcT(nome: string, clubeId: string, idade = 25): string {
  let h = 2166136261; for (const ch of nome) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const pick = <T,>(l: readonly T[], k: number) => l[(h >>> k) % l.length];
  const info = infoClube(pacote, clubeId), u = UNIFORME_CLUBE[clubeId], [a, b] = u ? u.cores : [info?.cores[0] ?? "#888", info?.cores[1] ?? "#FFF"];
  const ap: Aparencia = { ...APARENCIA_PADRAO, pele: (h >>> 3) % 8, rosto: pick(["oval", "redondo", "quadrado", "longo", "largo", "diamante"] as const, 5),
    cabelo: pick(["raspado", "curto", "degrade", "topete", "ondulado", "cacheado", "crespo", "blackpower", "trancas", "undercut", "careca", "moicano"] as const, 7),
    corCabelo: (h >>> 11) % 5, olhos: (h >>> 13) % 4, nariz: pick(["reto", "pequeno", "largo", "achatado", "aquilino", "batata"] as const, 9),
    boca: pick(["neutra", "sorriso", "lado", "fina", "cheia"] as const, 15), barba: idade < 21 ? "nenhuma" : pick(["nenhuma", "sombra", "rala", "cavanhaque", "curta", "cheia", "bigode"] as const, 17) };
  return svgFoto({ aparencia: ap, camisa: { cor1: a.toUpperCase() === "#FFFFFF" ? "#F4F4F2" : a, cor2: b ?? "#111111", estilo: "lisa", fonte: clubeId }, numero: String(((h >>> 19) % 30) + 2), traje: "jogo" });
}

// ------------------------------------------------------------------ copas (estadual, nacional, continental, Intercontinental, Mundial)
const nomeSel = (pais: string) => infoClube(pacote, `NAT-${pais}`)?.nome ?? pais;
/** Proposta de uma federação (vai também na tela inicial). */
function ofertaSelHtml(s: SaveTecnico): string {
  const of = s.ofertaSel;
  if (!of) return "";
  return `<section class="painel evento-t"><p class="rotulo">Proposta de seleção</p><div style="display:flex;gap:10px;align-items:center">${bandeiraSvg(of.pais)}<div><h2 style="font-size:19px;margin:0">${esc(nomeSel(of.pais))} quer você</h2><small class="sub">${valorBrl(of.salario)}/mês · contrato até a próxima Copa do Mundo</small></div></div>
    <p>${esc(of.texto)}</p><div class="botoes"><button class="botao" data-sel-aceitar>Aceitar</button><button class="botao sec" data-sel-recusar>Recusar</button></div></section>`;
}
/** O próximo jogo da seleção (aparece na tela inicial quando está perto). */
function cardJogoSel(s: SaveTecnico, sempre = false): string {
  const p = s.selecao ? proximoJogoSel(pacote, s) : undefined;
  if (!p || (!sempre && p.j.semana - s.semana > 2)) return "";
  const sel = s.selecao!, adv = p.j.casa === sel.id ? p.j.fora : p.j.casa, fm = forcaMinhaSel(pacote, s), fa = mundo(pacote).clube[adv]?.forca ?? 0;
  const comp = p.e.id === "SEL" ? NOME_FASE[p.j.fase] ?? "Data FIFA" : `${COPAS[p.e.id].curto} · ${NOME_FASE[p.e.fase] ?? p.e.fase}`;
  return `<section class="painel"><p class="rotulo">Seleção · ${esc(comp)} · semana ${p.j.semana + 1}${p.j.semana === s.semana ? " (nesta semana)" : ""}</p>
    <div class="prox"><div class="lado">${escudo(p.j.casa)}<span>${esc(nomeClube(p.j.casa))}</span></div><span class="x">×</span><div class="lado">${escudo(p.j.fora)}<span>${esc(nomeClube(p.j.fora))}</span></div></div>
    <p class="sub" style="text-align:center">Seu time: <b style="color:var(--giz)">${fm.forca.toFixed(1).replace(".", ",")}</b> · ${esc(nomeClube(adv))}: <b style="color:var(--giz)">${fa.toFixed(1).replace(".", ",")}</b> · ${sel.convocados.length}/23 convocados</p>
    ${sempre ? "" : `<div class="botoes" style="justify-content:center"><button class="botao sec peq" data-ir-sel>Convocação e time</button></div>`}</section>`;
}
function abaSelecao(s: SaveTecnico): string {
  const sel = s.selecao;
  if (!sel) {
    const l = listaSelecoes(pacote, s);
    return `${ofertaSelHtml(s)}<section class="painel"><p class="rotulo">Técnico de seleção</p><p class="sub" style="margin:0">Dá para treinar uma seleção junto com o clube. A federação escolhe pelo seu nome: seleção grande pede reputação alta. As propostas chegam na virada da temporada (mais no fim do ciclo da Copa do Mundo); declarar interesse aumenta a chance. Sua reputação: <b>${Math.round(s.tecnico.reputacao)}</b>.</p></section>
      <section class="painel">${l.map((x) => `<div class="clube-op" style="grid-template-columns:auto 1fr auto;align-items:center;gap:10px">${bandeiraSvg(x.pais)}<div><b>${esc(x.nome)}</b><br><small class="sub">força ${x.forca.toFixed(0)} · pede reputação ${x.exige} · ${curtoBrl(x.salario)}/mês</small></div>${x.cabe ? (x.interesse ? `<span class="pill bom">interesse enviado</span>` : `<button class="botao sec peq" data-int-sel="${x.pais}">Declarar interesse</button>`) : `<span class="pill">falta nome</span>`}</div>`).join("")}</section>`;
  }
  const w = mundo(pacote), conv = convocadosDe(pacote, s), fm = forcaMinhaSel(pacote, s), titularesK = new Set(fm.onze.map((x) => x.c.chave));
  const st = sel.stats, cor = sel.confianca >= 60 ? "var(--pos)" : sel.confianca >= 30 ? "var(--ouro)" : "var(--neg)";
  const cab = `<section class="painel"><div style="display:flex;gap:12px;align-items:center">${bandeiraSvg(sel.pais, "escudo grande")}<div><h2 style="margin:0">${esc(nomeSel(sel.pais))}</h2><small class="sub">Desde ${ANO_INICIAL_T + sel.desde} · contrato até a Copa de ${ANO_INICIAL_T + sel.ate} · ${curtoBrl(sel.salario)}/mês</small></div></div>
    <p class="rotulo" style="margin-top:10px">Confiança da federação</p><div class="medidor"><i style="--v:${Math.round(sel.confianca)}%;--c:${cor}"></i></div>
    <div class="dl" style="margin-top:8px"><span>Jogos</span><b>${st.j} · ${st.v}V ${st.e}E ${st.d}D</b><span>Gols</span><b>${st.gp} pró · ${st.gc} contra</b><span>Entrosamento</span><b>${Math.round(sel.entrosamento)}/100</b>${sel.elim.j ? `<span>Eliminatórias no ciclo</span><b>${sel.elim.p} pts em ${sel.elim.j} jogos${sel.elim.p / sel.elim.j >= 1.5 ? " · vaga encaminhada" : sel.elim.p / sel.elim.j < 1.1 ? " · vaga em risco" : ""}</b>` : ""}</div></section>`;
  const tat = `<section class="painel"><p class="rotulo">Formação e estilo</p><div class="chips">${(Object.keys(FORMACOES_SEL) as Formacao[]).map((f) => `<button class="chip${sel.formacao === f ? " ativo" : ""}" data-sel-form="${f}">${f}</button>`).join("")}</div>
    <div class="chips" style="margin-top:6px">${(["ofensivo", "equilibrado", "defensivo"] as Estilo[]).map((e) => `<button class="chip${sel.estilo === e ? " ativo" : ""}" data-sel-estilo="${e}">${e[0].toUpperCase() + e.slice(1)}</button>`).join("")}</div>
    <p class="sub">Ofensivo rende contra seleção mais fraca; defensivo segura a mais forte; equilibrado não arrisca. Repetir a base entre as datas FIFA sobe o entrosamento; mudar muito derruba. Força do seu time titular: <b>${fm.forca.toFixed(1).replace(".", ",")}</b> (a seleção inteira vale ${fm.base.toFixed(1).replace(".", ",")}).</p>
    <p class="rotulo" style="margin-top:8px">Time titular</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 10px">${fm.onze.map((x) => `<div style="display:flex;justify-content:space-between;gap:6px;font-size:13px;padding:3px 0;border-bottom:1px solid #ffffff14"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><small class="sub">${x.vaga}</small> ${esc(x.c.nome)}${x.improvisado ? " ⚠" : ""}</span><b>${x.c.ovr}</b></div>`).join("")}</div>${fm.onze.some((x) => x.improvisado) ? `<p class="sub">⚠ improvisado fora da posição: falta gente dessa posição na lista.</p>` : ""}</section>`;
  const lin = (c: Candidato) => `<div class="clube-op" style="grid-template-columns:auto 1fr auto auto;align-items:center;gap:8px">${escudo(c.clubeId, "escudo esc-p")}<div><b>${esc(c.nome)}</b>${c.meu ? ` <span class="pill bom">seu clube</span>` : ""}<br><small class="sub">${c.pos} · ${c.idade} anos · ${esc(nomeClube(c.clubeId))}</small></div><span><b>${c.ovr}</b></span><span style="display:flex;gap:4px"><button class="botao ${sel.titulares.includes(c.chave) ? "" : "sec "}peq" data-sel-tit="${esc(c.chave)}" title="Titular">${titularesK.has(c.chave) ? "★" : "☆"}</button><button class="botao sec peq" data-sel-desc="${esc(c.chave)}" title="Tirar da lista">✕</button></span></div>`;
  const lista = `<section class="painel"><p class="rotulo">Convocados · ${conv.length}/23</p><div class="botoes" style="margin-bottom:6px"><button class="botao sec peq" data-sel-auto>Convocar os melhores</button><button class="botao sec peq" data-sel-pool>Chamar outro jogador</button></div>
    <p class="sub">★ = titular (marque para forçar a escolha; sem marca, entra o melhor da posição). Os do seu clube voltam cansados das datas FIFA.</p>
    ${POS_ORDEM.map((p) => { const l = conv.filter((c) => c.pos === p); return l.length ? `<p class="rotulo" style="margin-top:8px">${p}</p>${l.map(lin).join("")}` : ""; }).join("")}</section>`;
  const copas = Object.values(copasSel(pacote, s)).filter((e): e is EstadoCopa => !!e);
  const comp = copas.map((e) => { const meus = e.jogos.filter((j) => j.casa === sel.id || j.fora === sel.id); const grupo = Object.entries(e.tabelas).find(([, t]) => t.some((x) => x.clube === sel.id));
    const meta = e.id !== "SEL" && e.id !== "FIN" ? ` · meta: ${textoMeta(metaNoTorneio(pacote, e, sel.id))}` : "";
    return `<div class="not"><b>${esc(e.id === "SEL" ? (meus[0]?.fase === "eliminatorias" ? "Eliminatórias (datas FIFA)" : "Amistosos (datas FIFA)") : COPAS[e.id].nome)}</b><small class="sub">${meta}${e.fase === "fim" ? (e.campeao === sel.id ? " · 🏆 campeão" : e.campeao ? ` · campeão: ${esc(nomeClube(e.campeao))}` : "") : ""}</small>
      ${grupo && e.id !== "SEL" ? `<table class="tab" style="margin:6px 0"><tbody>${ordenar(grupo[1]).map((x, i) => `<tr${x.clube === sel.id ? ' class="eu"' : ""}><td>${i + 1}</td><td style="text-align:left">${esc(nomeClube(x.clube))}</td><td>${x.j}</td><td>${x.pts}</td></tr>`).join("")}</tbody></table>` : ""}
      ${meus.map((j) => `<div style="display:grid;grid-template-columns:auto 1fr auto 1fr;gap:6px;font-size:13px;margin-top:3px"><small class="sub">S${j.semana + 1}</small><span style="text-align:right">${esc(nomeClube(j.casa))}</span><b>${j.gc === undefined ? "×" : `${j.gc} × ${j.gf}${j.penaltis ? "*" : ""}`}</b><span>${esc(nomeClube(j.fora))}</span></div>`).join("")}</div>`; }).join("");
  const art = Object.values(sel.jog).filter((x) => x.g || x.a).sort((a, b) => b.g - a.g || b.a - a.a).slice(0, 8);
  const ult = sel.jogos.slice(0, 6).map((j) => `<div class="not"><small class="sub">${ANO_INICIAL_T + j.t} · ${esc(j.copa === "SEL" ? NOME_FASE[j.fase] ?? "Data FIFA" : COPAS[j.copa].curto)}</small><br><b>${esc(nomeClube(j.casa))} ${j.gc} × ${j.gf} ${esc(nomeClube(j.fora))}</b>${j.gols.length ? `<br><small class="sub">⚽ ${esc(j.gols.join(", "))}</small>` : ""}</div>`).join("");
  return `${cab}${cardJogoSel(s, true)}${tat}${lista}
    <section class="painel"><p class="rotulo">Competições de ${ANO_INICIAL_T + s.temporada}</p>${comp || `<p class="sub">Sem jogos da seleção nesta temporada.</p>`}</section>
    ${ult ? `<section class="painel"><p class="rotulo">Últimos jogos</p>${ult}</section>` : ""}
    ${art.length ? `<section class="painel"><p class="rotulo">Artilheiros com você</p>${art.map((x) => `<div class="not" style="display:flex;justify-content:space-between"><span>${esc(x.nome)} <small class="sub">${x.pos} · ${x.j} jogos</small></span><span><b>${x.g}</b> gols · ${x.a} assist.</span></div>`).join("")}</section>` : ""}
    ${sel.titulos.length ? `<section class="painel"><p class="rotulo">Títulos pela seleção</p>${sel.titulos.map((x) => `<div class="not">🏆 <b>${esc(x.nome)}</b> · ${ANO_INICIAL_T + x.t}</div>`).join("")}</section>` : ""}
    ${patroSelHtml(s)}
    <div class="botoes"><button class="botao sec" data-sel-sair>Deixar o cargo na seleção</button></div>`;
}
/** Patrocínios da federação: a camisa só leva o fornecedor; os oficiais aparecem fora do uniforme. */
function patroSelHtml(s: SaveTecnico): string {
  const sel = s.selecao!, p = patroSel(pacote, s), ofs = ofertasSel(pacote, s), info = infoClube(pacote, sel.id), [a, b] = info?.cores ?? ["#888", "#FFF"];
  const f = p.contratos.fornecedor && MARCA[p.contratos.fornecedor.marca], contraste = claro(a) ? "#111111" : "#FFFFFF", ano = (t: number) => ANO_INICIAL_T + t;
  const camisa = camisaFrente({ cores: [a, b], modelo: "lisa" }, { escudo: corpoEscudo(idClube(sel.id), a, b, info?.nome), fornecedor: f ? simboloMarca(f, contraste, a) : undefined });
  const mes = Object.values(p.contratos).reduce((x, c) => x + (c && c.ate >= s.temporada ? c.valor : 0), 0);
  const cartao = (k: CotaSel) => {
    const c = p.contratos[k], m = c ? MARCA[c.marca] : undefined, l = ofs[k] ?? [];
    const atual = c && m ? `<div class="patro-atual">${logoSvg(m, 24)}<div><b>${curtoBrl(c.valor)}/mês</b><small class="sub">${esc(NOME_CATEGORIA[m.categoria])} · ${c.anos} anos · até ${ano(c.ate)}${c.ate <= s.temporada ? " · último ano" : ""}${c.bonusTitulo ? ` · ${curtoBrl(c.bonusTitulo)} por título` : ""}${c.bonusVaga ? ` · ${curtoBrl(c.bonusVaga)} pela vaga na Copa` : ""}${c.renovacao ? " · preferência na renovação" : ""}</small></div></div>` : `<p class="sub">Cota livre.</p>`;
    const ofertas = l.map((o) => { const mo = MARCA[o.marca]; if (!mo) return "";
      return `<div class="patro-oferta">${logoSvg(mo, 22)}<small class="sub">${esc(NOME_CATEGORIA[mo.categoria])} · oferece <b>${curtoBrl(o.valor)}/mês</b> por ${o.anos} anos (${curtoBrl(o.valor * 12 * o.anos)} no total)${o.recusou ? " · última chance" : ""}</small>
        <button class="botao peq" data-mp-abrir="s|${k}|${o.marca}">${p.mesas?.[`${k}|${o.marca}`] ? "Voltar à mesa" : "Negociar"}</button></div>`; }).join("");
    return `<div class="not"><p class="rotulo" style="margin:0">${NOME_COTA_SEL[k]}${k === "fornecedor" ? " · a única marca na camisa" : " · fora do uniforme"}</p>${atual}${ofertas ? `<p class="rotulo" style="margin-top:8px">${c ? "Ofertas para depois do contrato" : "Ofertas"}</p>${ofertas}` : ""}</div>`;
  };
  return `<section class="painel"><p class="rotulo">Patrocínios da seleção</p>
    <div style="display:flex;gap:12px;align-items:center"><div style="width:90px;flex:none">${camisa}</div><p class="sub" style="margin:0">Na camisa de seleção só entra o fornecedor de material: nada de master nem manga. Os patrocinadores oficiais (banco, companhia aérea, bebida...) aparecem em propaganda, nas placas e no fundo das entrevistas. Os valores sobem muito com o tamanho da seleção, e as marcas preferem contrato longo.</p></div>
    <div class="dl" style="margin-top:8px"><span>Entra por mês</span><b>${curtoBrl(mes)}</b><span>Arrecadado com você</span><b>${curtoBrl(p.arrecadado)}</b></div>
    ${COTAS_SEL.map(cartao).join("")}<p class="sub">O dinheiro é da federação. Contrato acima do valor da oferta agrada a federação, e com confiança alta a renovação do seu contrato vem com aumento.</p></section>`;
}
/** Lista de quem dá para chamar (os melhores de cada posição que ainda não estão na lista). */
function poolSelHtml(s: SaveTecnico): string {
  const sel = s.selecao!, pool = poolSel(pacote, s, sel.pais).filter((c) => !sel.convocados.includes(c.chave));
  return `<h2>Chamar jogador · ${esc(nomeSel(sel.pais))}</h2><p class="sub">${sel.convocados.length}/23 na lista. ${sel.convocados.length >= 23 ? "Para chamar alguém, tire outro antes." : ""}</p>${POS_ORDEM.map((p) => `<p class="rotulo" style="margin-top:8px">${p}</p>${pool.filter((c) => c.pos === p).slice(0, 8).map((c) => `<div class="clube-op" style="grid-template-columns:auto 1fr auto auto;align-items:center;gap:8px">${escudo(c.clubeId, "escudo esc-p")}<div><b>${esc(c.nome)}</b><br><small class="sub">${c.idade} anos · ${esc(nomeClube(c.clubeId))}</small></div><b>${c.ovr}</b><button class="botao peq" data-sel-conv="${esc(c.chave)}" ${sel.convocados.length >= 23 ? "disabled" : ""}>Chamar</button></div>`).join("")}`).join("")}<div class="botoes" style="margin-top:10px"><button class="botao sec" data-fechar>Fechar</button></div>`;
}
function abaCopas(s: SaveTecnico): string {
  const copas = Object.values(copasT(pacote, s)).filter((e): e is EstadoCopa => !!e && e.clubes.includes(s.clubeId));
  const titulos = (s.titulosCopa ?? []).slice().reverse();
  const sala = titulos.length ? `<section class="painel"><p class="rotulo">Sua sala de troféus</p>${titulos.map((x) => `<div class="not">🏆 <b>${esc(x.nome)}</b> · ${ANO_INICIAL_T + x.t} · ${esc(nomeClube(x.clubeId))}</div>`).join("")}</section>` : "";
  if (!copas.length) return `<section class="painel"><p class="sub">O ${esc(nomeClube(s.clubeId))} não está em nenhuma copa nesta temporada. Termine bem a liga para ir ao continental no ano que vem.</p></section>${sala}`;
  const nomeTime = (id: string) => `${id === s.clubeId ? "<b>" : ""}${esc(nomeClube(id))}${id === s.clubeId ? "</b>" : ""}`;
  return copas.map((e) => {
    const info = COPAS[e.id], meus = e.jogos.filter((j) => j.casa === s.clubeId || j.fora === s.clubeId);
    const fase = e.fase === "fim" ? (e.campeao === s.clubeId ? "🏆 Campeão!" : `Campeão: ${esc(nomeClube(e.campeao ?? ""))}`) : NOME_FASE[e.fase] ?? e.fase;
    const onde = e.campeao === s.clubeId ? "" : `<p class="sub" style="margin:0 0 6px">Você chegou até: <b>${esc(NOME_FASE[e.chegou[s.clubeId]] ?? e.chegou[s.clubeId] ?? "-")}</b></p>`;
    const grupo = Object.entries(e.tabelas).find(([, t]) => t.some((x) => x.clube === s.clubeId));
    const tabela = grupo ? `<table class="tab" style="margin:6px 0"><thead><tr><th>#</th><th style="text-align:left">${grupo[0].length === 1 ? `Grupo ${grupo[0]}` : esc(grupo[0])}</th><th>J</th><th>SG</th><th>P</th></tr></thead><tbody>${ordenar(grupo[1]).slice(0, grupo[1].length > 12 ? 12 : grupo[1].length).map((t, i) => `<tr${t.clube === s.clubeId ? ' class="eu"' : ""}><td>${i + 1}</td><td class="cl" style="text-align:left">${escudo(t.clube, "escudo esc-p")}${nomeTime(t.clube)}</td><td>${t.j}</td><td>${t.gp - t.gc}</td><td><b>${t.pts}</b></td></tr>`).join("")}</tbody></table>` : "";
    const jogos = meus.map((j) => `<div class="not" style="display:grid;grid-template-columns:auto 1fr auto 1fr;gap:6px;align-items:center"><small class="sub">S${j.semana + 1}</small><span style="text-align:right">${nomeTime(j.casa)}</span><b>${j.gc === undefined ? "×" : `${j.gc}–${j.gf}${j.penaltis ? "*" : ""}`}</b><span>${nomeTime(j.fora)}</span><small class="sub" style="grid-column:2 / 5">${esc(rotuloJogo(j))}${j.penaltis ? ` · pênaltis: ${esc(nomeClube(j.penaltis))}` : ""}</small></div>`).join("");
    const tabArt = (tipo: "g" | "a", n: number) => { const l = rankingCopaT(s, e, tipo, n); return l.length ? `<p class="rotulo" style="margin-top:8px">${tipo === "g" ? "Artilharia" : "Assistências"} da copa</p><table class="tab"><tbody>${l.map((x, i) => `<tr class="${x.meu ? "eu" : ""}"><td>${i + 1}</td><td class="cl">${escudo(x.clubeId, "escudo esc-p")}${esc(x.nome)}</td><td>${x.jogos}</td><td><b>${x.valor}</b></td></tr>`).join("")}</tbody></table>` : ""; };
    const artH = tabArt("g", 8) + tabArt("a", 5);
    return `<section class="painel"><p class="rotulo" style="color:${info.cores[0]}">${esc(info.nome)}</p><p style="margin:0 0 4px"><b>${fase}</b></p>${onde}${tabela}${jogos}${artH}</section>`;
  }).join("") + sala;
}
function abaLiga(s: SaveTecnico): string {
  const li = infoLiga(s.ligaId), tab = ordenar(s.tabela), n = tab.length;
  const ult = Math.max(-1, ...Object.keys(s.rodadas).map(Number));
  const rodada = ult >= 0 ? `<section class="painel" style="margin-top:12px"><p class="rotulo">Rodada ${ult + 1}</p>${s.rodadas[ult].map(([c, f, gc, gf]) => { const gl = s.lancesRodada?.[ult]?.[c] ?? [];
      return `<div class="not" style="display:grid;grid-template-columns:1fr auto 1fr;gap:2px 8px;${c === s.clubeId || f === s.clubeId ? "font-weight:700" : ""}"><span style="text-align:right">${esc(nomeClube(c))}</span><b>${gc} × ${gf}</b><span>${esc(nomeClube(f))}</span>${gl.length ? `<small class="sub" style="text-align:right;font-weight:400">${gl.filter((x) => x[1]).map((x) => `${esc(sobrenome(x[2]))} ${x[0]}'`).join(", ")}</small><span></span><small class="sub" style="font-weight:400">${gl.filter((x) => !x[1]).map((x) => `${esc(sobrenome(x[2]))} ${x[0]}'`).join(", ")}</small>` : ""}</div>`; }).join("")}</section>` : "";
  const subs = `<div class="sub-abas">${[["tabela", "Tabela"], ["copas", "Copas"], ["selecao", "Seleção"], ["revista", "Revista ISPN"], ["artilharia", "Artilharia"], ["assist", "Assistências"], ["elenco", "Seu elenco"]].map(([k, n2]) => `<button class="${(sub.liga ?? "tabela") === k ? "ativo" : ""}" data-sub="liga:${k}">${n2}</button>`).join("")}</div>`;
  if (sub.liga === "copas") return subs + abaCopas(s);
  if (sub.liga === "selecao") return subs + abaSelecao(s);
  if (sub.liga === "revista") return subs + abaRevista(s);
  if (sub.liga === "artilharia" || sub.liga === "assist") {
    const l = rankingT(pacote, s, sub.liga === "artilharia" ? "g" : "a", 15);
    return `${subs}<p class="rotulo">${sub.liga === "artilharia" ? "Artilharia" : "Assistências"} · ${esc(li.curto)} ${ANO_INICIAL_T + s.temporada}</p><p class="sub" style="margin:-4px 0 8px">Só os jogos da liga. Os gols das copas ficam na aba Copas.</p>${l.length ? `<table class="tab"><thead><tr><th>#</th><th style="text-align:left">Jogador</th><th>J</th><th>${sub.liga === "artilharia" ? "Gols" : "Assist."}</th></tr></thead><tbody>${l.map((x, i) => `<tr class="${x.meu ? "eu" : ""}"><td>${i + 1}</td><td class="cl">${escudo(x.clubeId, "escudo esc-p")}${esc(x.nome)}</td><td>${x.jogos}</td><td><b>${x.valor}</b></td></tr>`).join("")}</tbody></table>` : `<p class="sub">A bola ainda não rolou nesta temporada.</p>`}`;
  }
  if (sub.liga === "elenco") {
    const l = [...s.elenco].filter((a) => a.jogos > 0).sort((a, b) => b.gols - a.gols || b.assist - a.assist || b.jogos - a.jogos);
    const media = (a: Atleta) => (a.notas.length ? a.notas.reduce((x, y) => x + y, 0) / a.notas.length : 0);
    return `${subs}<p class="rotulo">Seu elenco na temporada</p>${l.length ? `<table class="tab"><thead><tr><th style="text-align:left">Jogador</th><th>J</th><th>G</th><th>A</th><th>Nota</th><th>🟨</th></tr></thead><tbody>${l.map((a) => `<tr><td class="cl">${esc(a.nome)} <small class="sub">${rotuloPos(a)}</small></td><td>${a.jogos}</td><td>${a.gols}</td><td>${a.assist}</td><td>${media(a).toFixed(1)}</td><td>${a.amarelosT}</td></tr>`).join("")}</tbody></table>` : `<p class="sub">Ninguém jogou ainda nesta temporada.</p>`}`;
  }
  return `${subs}<p class="rotulo">${esc(li.nome)} · ${ANO_INICIAL_T + s.temporada}</p>
    <table class="tab" style="margin-top:6px"><thead><tr><th>#</th><th style="text-align:left">Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>Pts</th></tr></thead><tbody>${tab.map((t, i) =>
      `<tr class="${t.clube === s.clubeId ? "eu" : ""}${li.acima && i < (li.rebaixados ?? 3) ? " sobe" : ""}${li.abaixo && i >= n - li.rebaixados ? " cai" : ""}"><td>${i + 1}</td><td class="cl"><button class="link-clube" data-perfil="${t.clube}">${escudo(t.clube, "escudo esc-p")}${esc(nomeClube(t.clube))}</button></td><td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp - t.gc}</td><td><b>${t.pts}</b></td></tr>`).join("")}</tbody></table>
    ${rodada}`;
}

// ------------------------------------------------------------------ perfil do clube (história)
/** Carreira de técnico começada antes de a bio guardar as temporadas de jogador: completa com o save do modo jogador. */
function completarBio(s: SaveTecnico) {
  if (!s.bio || s.bio.temporadas) return;
  const jog = ler<SaveJogador>("mycarrerinha:save");
  if (!jog || jog.jogador.apelido !== s.bio.apelido) { s.bio.temporadas = []; return; }
  s.bio.pos ??= jog.jogador.posicao;
  s.bio.temporadas = (jog.carreira.historico ?? []).filter((x) => x.clubeId && x.jogos > 0).map((x) => ({ clubeId: x.clubeId!, t: x.ano - ANO_INICIAL_T, j: x.jogos, g: x.gols, a: x.assist, ...(x.nota ? { nota: x.nota } : {}) }));
}
/** Perfil do clube no modo técnico: títulos, o time de todos os tempos e os recordes. O mundo simulado conta a história
 *  de todos os clubes; nas temporadas em que você treinou o clube, valem os números de verdade do seu elenco; e as suas
 *  temporadas de jogador entram como em qualquer outro clube em que você jogou. */
/** O momento do clube no mundo: investidor, crise, ou gigante tradicional (o seu clube não entra: ele é você). */
function momentoHtml(s: SaveTecnico, clubeId: string): string {
  if (clubeId === s.clubeId) return "";
  const m = momentoDoClube(pacote, clubeId), desde = m.desde !== undefined ? ` desde ${ANO_INICIAL_T + m.desde}` : "";
  const pills = [m.tradicional ? `<span class="pill">Gigante tradicional</span>` : "", m.tipo === "investidor" ? `<span class="pill" style="color:var(--pos)">💼 Com investidor${desde}</span>` : m.tipo === "crise" ? `<span class="pill" style="color:var(--neg)">📉 Em crise financeira${desde}</span>` : ""].filter(Boolean);
  return pills.length ? `<div class="botoes" style="margin-top:8px">${pills.join("")}</div>` : "";
}
function perfilClubeT(s: SaveTecnico, clubeId: string): string {
  const info = infoClube(pacote, clubeId);
  if (!info) return `<p class="sub">Clube não encontrado.</p>`;
  completarBio(s);
  const feitas = Math.max(0, s.semana - SEMANAS_PRE_T), meu = clubeId === s.clubeId;
  const dele = (s.temporadasElenco ?? []).filter((x) => x.clubeId === clubeId);
  // temporadas da sua liga que você jogou: os números desse clube saem dos jogos de verdade (não da estimativa do mundo)
  const arq = meu ? [] : Object.entries({ ...(s.artHist ?? {}), ...(s.artLiga?.t === s.temporada ? { [s.temporada]: s.artLiga } : {}) }).filter(([, v]) => Object.values(v.x).some((x) => x.c === clubeId)).map(([t, v]) => ({ t: +t, l: Object.values(v.x).filter((x) => x.c === clubeId) }));
  const ignorar = [...new Set([...dele.map((x) => x.t), ...s.historico.filter((h) => h.clubeId === clubeId).map((h) => h.t), ...arq.map((x) => x.t), ...(meu ? [s.temporada] : [])])];
  const usuario: TemporadaUsuario[] = [
    ...dele.map((x) => ({ nome: x.nome, t: x.t, j: x.j, g: x.g, a: x.a, pos: x.pos, nota: x.nota, outro: true })),
    ...(meu ? s.elenco.filter((a) => a.jogos > 0).map((a) => ({ nome: a.nome, t: s.temporada, j: a.jogos, g: a.gols, a: a.assist, pos: a.pos, nota: a.notas.length ? a.notas.reduce((x, y) => x + y, 0) / a.notas.length : undefined, outro: true })) : []),
    ...(s.bio?.temporadas ?? []).filter((x) => x.clubeId === clubeId).map((x) => ({ nome: s.bio!.apelido, t: x.t, j: x.j, g: x.g, a: x.a, pos: s.bio!.pos, nota: x.nota })),
    ...arq.flatMap(({ t, l }) => l.map((x) => ({ nome: x.n, t, j: x.j, g: x.g, a: x.a, pos: x.p ?? "MEI", outro: true }))),
  ];
  const tit = titulosDoClube(pacote, clubeId), xi = timeDeTodosOsTempos(pacote, clubeId, usuario, feitas, ignorar), rec = recordesHistoricosDoClube(pacote, clubeId, usuario, feitas, ignorar);
  const ano = (t?: number) => (t === undefined ? "" : String(ANO_INICIAL_T + t));
  const nomeEu = (nome: string, eu?: boolean) => eu ? `<b style="color:var(--ouro, #E3B341)">${esc(nome)}</b>` : esc(nome);
  const bloco = (titulo: string, l: RecordeNome[], comAno: boolean) => l.length ? `<p class="rotulo" style="margin-top:14px">${titulo}</p><table class="tab"><tbody>${l.map((x, i) => `<tr${x.eu ? ' class="eu"' : ""}><td>${i + 1}</td><td class="cl" style="text-align:left">${nomeEu(x.nome, x.eu)}</td>${comAno ? `<td class="sub">${ano(x.ano)}</td>` : ""}<td><b>${x.valor}</b></td></tr>`).join("")}</tbody></table>` : "";
  const ordemPos = ["GOL", "LAT", "ZAG", "VOL", "MEI", "PON", "ATA"], NOMES: Record<string, string> = { GOL: "Goleiro", LAT: "Lateral", ZAG: "Zagueiro", VOL: "Volante", MEI: "Meia", PON: "Ponta", ATA: "Atacante" };
  const xiOrd = [...xi].sort((a, b) => ordemPos.indexOf(a.posicao) - ordemPos.indexOf(b.posicao));
  const linhaXi = (x: TitularHistorico) => `<tr${x.eu ? ' class="eu"' : ""}><td class="sub" style="text-align:left">${NOMES[x.posicao] ?? x.posicao}</td><td class="cl" style="text-align:left">${nomeEu(x.nome, x.eu)}</td><td class="sub">${x.vezes ? `${ano(x.melhorAno)} · ${x.melhorNota.toFixed(2).replace(".", ",")}` : "elenco atual"}</td></tr>`;
  const trofeus = tit.ligas.length ? tit.ligas.map((l) => `<div class="not"><b>${"🏆".repeat(Math.min(l.anos.length, 6))}${l.anos.length > 6 ? ` ×${l.anos.length}` : ""} ${esc(l.curto)}</b><br><small class="sub">${l.anos.map((a) => ANO_INICIAL_T + a).join(", ")}</small></div>`).join("") : `<p class="sub">Ainda sem títulos de liga.</p>`;
  // a sua passagem pelo clube: como técnico (temporada a temporada) e como jogador
  const comoTec = s.historico.filter((h) => h.clubeId === clubeId);
  const comoJog = (s.bio?.temporadas ?? []).filter((x) => x.clubeId === clubeId);
  const passagem = comoTec.length || comoJog.length || meu ? `<p class="rotulo" style="margin-top:14px">Sua história no clube</p>
    ${comoJog.length ? `<div class="not">Como jogador: ${comoJog.length} ${comoJog.length === 1 ? "temporada" : "temporadas"} (${comoJog.map((x) => ANO_INICIAL_T + x.t).join(", ")}) · ${comoJog.reduce((a, x) => a + x.j, 0)} jogos, ${comoJog.reduce((a, x) => a + x.g, 0)} gols, ${comoJog.reduce((a, x) => a + x.a, 0)} assistências</div>` : ""}
    ${comoTec.map((h) => `<div class="not">Técnico em ${ANO_INICIAL_T + h.t}: ${h.pos}º lugar na ${esc(infoLiga(h.ligaId).curto)}${h.campeao ? " · CAMPEÃO" : ""}</div>`).join("")}
    ${meu ? `<div class="not">Técnico em ${ANO_INICIAL_T + s.temporada}: temporada em andamento</div>` : ""}` : "";
  const elenco = meu ? [] : plantelDoClube(pacote, clubeId).slice(0, 5);
  return `<div style="display:flex;gap:12px;align-items:center">${escudo(clubeId)}<div><h2 style="margin:0">${esc(info.nome)}</h2><span class="sub">${esc(info.cidade ?? "")} · ${esc(infoLiga(info.ligaId).curto)}${info.estadio ? ` · ${esc(info.estadio)}` : ""}</span></div></div>
    ${momentoHtml(s, clubeId)}
    ${uniformeNoPerfil(s, clubeId)}
    <p class="rotulo" style="margin-top:14px">Títulos</p>${trofeus}
    ${passagem}
    <p class="rotulo" style="margin-top:14px">Time de todos os tempos</p><p class="sub" style="margin-bottom:4px">Quem mais vezes foi o melhor da posição numa temporada. Ao lado, o melhor ano e a nota.</p><table class="tab"><tbody>${xiOrd.map(linhaXi).join("")}</tbody></table>
    ${bloco("Mais gols em uma temporada", rec.golsTemp, true)}${bloco("Mais assistências em uma temporada", rec.assistTemp, true)}${bloco("Maiores artilheiros da história", rec.artilheiros, false)}${bloco("Maiores assistentes da história", rec.assistentes, false)}${bloco("Goleiros com mais jogos sem tomar gol", rec.semGol, false)}
    ${elenco.length ? `<p class="rotulo" style="margin-top:14px">Destaques do elenco atual</p>${elenco.map((j) => `<div class="not">${esc(j.nome)} <small class="sub">${j.posicao} · ${textoFaixa(faixaDe(s, j, info.ligaId, clubeId))}</small></div>`).join("")}` : ""}
    <div class="botoes" style="margin-top:14px"><button class="botao sec" data-fechar>Fechar</button></div>`;
}

// ------------------------------------------------------------------ Clube
function abaClube(s: SaveTecnico): string {
  const subs = `<div class="sub-abas">${[["historia", "História do clube"], ["empregos", "Empregos"], ["noticias", "Notícias"], ["financas", "Finanças"], ["patrocinios", "Patrocínios"], ["diretoria", "Diretoria"], ["comissao", "Comissão técnica"]].map(([k, n]) => `<button class="${sub.clube === k ? "ativo" : ""}" data-sub="clube:${k}">${n}</button>`).join("")}</div>`;
  return subs + aviso() + (sub.clube === "empregos" ? abaEmpregos(s) : sub.clube === "diretoria" ? abaDiretoria(s) : sub.clube === "comissao" ? abaComissao(s) : sub.clube === "patrocinios" ? abaPatrocinios(s) : sub.clube === "carreira" ? abaCarreira(s) : sub.clube === "historia" ? perfilClubeT(s, s.clubeId).replace(/<div class="botoes" style="margin-top:14px"><button class="botao sec" data-fechar>Fechar<\/button><\/div>/, "") : sub.clube === "noticias" ? abaNoticias(s) : abaFinancas(s));
}
// ------------------------------------------------------------------ patrocínios do clube
const hexRgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) || 0);
const claro = (c: string) => { const [r, g, b] = hexRgb(c); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6; };
/** A camisa de frente com os patrocínios atuais (escudo, master, fornecedor e manga). */
/** Os patrocínios de qualquer clube: o seu (os contratos que você fechou) ou os dos outros (o mercado do mundo decide). */
function patrocClube(s: SaveTecnico, clubeId: string): { master?: { marca: string; cor?: string; ate?: number; forma?: "logo" | "nome" }; fornecedor?: { marca: string; cor?: string; ate?: number }; manga?: { marca: string; cor?: string; ate?: number; forma?: "logo" | "nome" } } {
  if (clubeId === s.clubeId) { const p = patrociniosDe(pacote, s); return { master: p.master, fornecedor: p.fornecedor, manga: p.manga }; }
  const est = ((s as SaveTecnico & { patroMundo?: EstadoPatroMundo }).patroMundo ??= {});
  return patroDoClube(pacote, est, s.semente, clubeId, s.temporada).pc;
}
/** A camisa de frente de qualquer clube, com o escudo e as marcas (cada marca numa cor que aparece sobre o tecido). */
function camisaClubeT(s: SaveTecnico, clubeId: string): string {
  const info = infoClube(pacote, clubeId), u = UNIFORME_CLUBE[clubeId], [a, b] = u ? u.cores : [info?.cores[0] ?? "#888", info?.cores[1] ?? "#FFF"];
  const p = patrocClube(s, clubeId), contraste = claro(a) ? "#111111" : "#FFFFFF";
  const m = p.master && MARCA[p.master.marca], f = p.fornecedor && MARCA[p.fornecedor.marca], g = p.manga && MARCA[p.manga.marca];
  const ec = u?.escudo ?? [info?.cores[0] ?? "#888", info?.cores[1] ?? "#FFF"], modelo = u?.padrao ?? info?.padrao ?? "lisa";
  const atras = (parte: ParteCamisa) => coresAtras(modelo, a, b, u?.faixas, parte);
  // a cor que você escolheu vale como está (sem trava); sem escolha, o jogo pega uma cor que apareça sobre o tecido
  const livre = (cor: string | undefined, parte: ParteCamisa, cand: (string | undefined)[]) => (cor ? { cor, filete: null as string | null | undefined } : corQueAparece(atras(parte), cand));
  const cm = m ? livre(p.master!.cor, "peito", [contraste, b, ...m.cores]) : undefined;
  const cf = f ? livre(p.fornecedor!.cor, "alto", [contraste, b, ...f.cores]) : undefined, cg = g ? livre(p.manga!.cor, "manga", [contraste, b, ...g.cores]) : undefined;
  const mangaNome = g && (p.manga!.forma ? p.manga!.forma === "nome" : LOGO_E_NOME.has(g.id)) ? nomeNaManga(g.nome, cg!.cor, cg!.filete, fonteDaMarca(g)) : undefined;
  const masterLogo = m && m.id !== "redboi" && p.master!.forma === "logo";
  return camisaFrente({ cores: [a, b], modelo, faixas: u?.faixas }, {
    escudo: corpoEscudo(idClube(clubeId), ec[0], ec[1], info?.nome),
    master: m ? (m.id === "redboi" ? emblemaTouros(m.cores[1], m.cores[2]) : masterLogo ? `<g transform="translate(29 1) scale(1.05)">${comFilete(simboloMarca(m, cm!.cor, a), cm!.filete ?? undefined)}</g>` : nomeNoPeito(m.nome, cm!.cor, cm!.filete, fonteDaMarca(m))) : undefined,
    fornecedor: f ? comFilete(simboloMarca(f, cf!.cor, a), cf!.filete ?? undefined) : undefined,
    manga: g ? comFilete(simboloMarca(g, cg!.cor, a), cg!.filete ?? undefined) : undefined,
    ...(mangaNome ? { mangaNome } : {}),
  });
}
const camisaDoClube = (s: SaveTecnico) => camisaClubeT(s, s.clubeId);
/** O uniforme no perfil do clube: a camisa e a lista dos patrocinadores, com até quando vai cada contrato. */
function uniformeNoPerfil(s: SaveTecnico, clubeId: string): string {
  const p = patrocClube(s, clubeId);
  const linha = (rot: string, c?: { marca: string; ate?: number }) => (c && MARCA[c.marca] ? `<div class="not" style="display:flex;gap:8px;align-items:center">${logoSvg(MARCA[c.marca], 22)}<span><small class="sub">${rot}${c.ate !== undefined && c.ate < s.temporada + 50 ? ` · até ${ANO_INICIAL_T + c.ate}` : ""}</small></span></div>` : "");
  const lista = linha("Patrocinador master", p.master) + linha("Fornecedor de material", p.fornecedor) + linha("Patrocinador de manga", p.manga);
  return `<p class="rotulo" style="margin-top:14px">Uniforme e patrocinadores</p><div class="patro-topo"><div class="camisa-patro">${camisaClubeT(s, clubeId)}</div><div>${lista || `<p class="sub">Sem patrocinadores na camisa.</p>`}</div></div>`;
}
function abaPatrocinios(s: SaveTecnico): string {
  const p = patrociniosDe(pacote, s), ofs = ofertasPatro(pacote, s), arena = arenaDoClube(pacote, s);
  const info = infoClube(pacote, s.clubeId), corClube = (UNIFORME_CLUBE[s.clubeId]?.cores ?? info?.cores ?? ["#888", "#FFF"])[1];
  const total = Object.values(receitaPatro(pacote, s)).reduce((x, y) => x + y, 0), ano = (t: number) => ANO_INICIAL_T + t;
  const coresDe = (marca: string) => [["#FFFFFF", "Branco"], ["#111111", "Preto"], ["#D4AF37", "Dourado"], ["#C0C0C0", "Prata"], [corClube, "Cor do clube"], [MARCA[marca]?.cores[0] ?? "#888", "Cor da marca"]].filter((x, i, l) => l.findIndex((y) => y[0].toLowerCase() === x[0].toLowerCase()) === i);
  const cartao = (cota: Cota) => {
    const c = p[cota], m = c ? MARCA[c.marca] : undefined, l = ofs[cota] ?? [];
    const atual = c && m ? `<div class="patro-atual">${logoSvg(m, 24)}<div><b>${curtoBrl(c.valor)}/mês</b><small class="sub">${esc(NOME_CATEGORIA[m.categoria])} · até ${ano(c.ate)}${c.ate <= s.temporada ? " · último ano" : ""}${c.nome ? ` · ${esc(c.nome)}` : ""}${c.bonusTitulo ? ` · ${curtoBrl(c.bonusTitulo)} por título` : ""}${c.bonusVaga ? ` · ${curtoBrl(c.bonusVaga)} por vaga` : ""}${c.rebaixamento ? " · cai 40% se rebaixar" : ""}${c.renovacao ? " · preferência na renovação" : ""}</small></div></div>
      ${cota !== "arena" ? `<div class="chips" style="flex-wrap:wrap;margin-top:6px"><button class="chip cor-chip${!c.cor ? " ativo" : ""}" data-patro-cor="${cota}|">Automático</button>${coresDe(c.marca).map(([cor, nome]) => `<button class="chip cor-chip${(c.cor ?? "") === cor ? " ativo" : ""}" data-patro-cor="${cota}|${cor}"><i style="background:${cor}"></i>${nome}</button>`).join("")}</div>` : ""}
      ${cota === "master" || cota === "manga" ? (() => { const atual = c.forma ?? (cota === "manga" && LOGO_E_NOME.has(c.marca) ? "nome" : cota === "master" ? "nome" : "logo"); return `<div class="chips" style="margin-top:4px">${(["logo", "nome"] as const).map((fm) => `<button class="chip${atual === fm ? " ativo" : ""}" data-patro-forma="${cota}|${fm}">${fm === "logo" ? "Logo" : "Nome escrito"}</button>`).join("")}</div>`; })() : ""}` : "";
    const travada = cota === "arena" && arena.travada ? `<p class="sub">${esc(arena.travada)}</p>` : "";
    const ofertas = l.length ? `<p class="rotulo" style="margin-top:10px">${c ? "Ofertas para depois do contrato atual" : "Ofertas"}</p>${l.map((o) => {
      const mo = MARCA[o.marca]; if (!mo) return "";
      return `<div class="patro-oferta">${logoSvg(mo, 22)}<small class="sub">${esc(NOME_CATEGORIA[mo.categoria])} · oferece <b>${curtoBrl(o.valor)}/mês</b> por ${o.anos} ${o.anos === 1 ? "temporada" : "temporadas"}${o.recusou ? " · última proposta" : ""}</small>
        <button class="botao peq" data-mp-abrir="c|${cota}|${o.marca}">${p.mesas?.[`${cota}|${o.marca}`] ? "Voltar à mesa" : "Negociar"}</button></div>`;
    }).join("")}` : !c && !travada ? `<p class="sub">Nenhuma marca na mesa agora. Novas propostas chegam a cada 8 semanas.</p>` : "";
    return `<section class="painel patro-cota"><p class="rotulo">${esc(COTAS[cota].nome)}</p><p class="sub" style="margin-top:0">${esc(COTAS[cota].texto)}</p>${cota === "arena" ? `<p class="sub">Estádio: <b>${esc(arena.nome)}</b></p>` : ""}${atual}${travada}${ofertas}</section>`;
  };
  return `<div class="patro-topo"><div class="camisa-patro">${camisaDoClube(s)}</div><div><p class="rotulo">Patrocínios do clube</p><b class="patro-total">${curtoBrl(total)}/mês</b><p class="sub">Cada contrato se negocia em pacote: fixo por mês, anos, luvas, bônus por título e por vaga, cláusula de rebaixamento e preferência na renovação. Cada marca tem um jeito e uma paciência.</p></div></div>
    ${ORDEM_COTAS.map(cartao).join("")}`;
}
// ------------------------------------------------------------------ sua carreira e notícias
function abaCarreira(s: SaveTecnico): string {
  const b = s.bio, h = s.historico, titulos = h.filter((x) => x.campeao).length;
  const jogador = b ? `<section class="painel"><p class="rotulo">Como jogador</p><h2>${esc(b.apelido)}</h2>${b.nivel ? `<p class="pill aviso" style="display:inline-block">${esc(b.nivel)}</p>` : ""}
    <div class="dl" style="margin-top:8px"><span>Jogos</span><b>${b.jogos}</b><span>Gols</span><b>${b.gols}</b><span>Assistências</span><b>${b.assist}</b><span>Títulos</span><b>${b.titulos}</b><span>Parou</span><b>${b.aposentouEm}, aos ${b.idade} anos</b></div>
    <p class="sub" style="margin-top:8px">Clubes: ${b.clubes.map(esc).join(" → ")}</p>${b.premios?.length ? `<p class="sub">Prêmios: ${b.premios.map(esc).join(" · ")}</p>` : ""}${b.recordes?.length ? `<p class="sub">Recordes: ${b.recordes.map(esc).join(" · ")}</p>` : ""}
    ${s.pausa ? `<p class="sub">Depois de parar, ficou ${s.pausa === 1 ? "um ano" : `${s.pausa} anos`} longe do campo estudando o jogo antes de assumir o primeiro time.</p>` : ""}</section>` : "";
  const tecnico = `<section class="painel"><p class="rotulo">Como técnico</p><div class="dl"><span>Temporadas</span><b>${h.length}</b><span>Títulos</span><b>${titulos}</b><span>Reputação</span><b>${s.tecnico.reputacao}/100</b><span>Licença</span><b>${LICENCAS[licencaT(s)]}</b></div>
    ${h.length ? `<div class="lista" style="margin-top:8px">${h.slice().reverse().map((x) => `<div class="not"><small>${ANO_INICIAL_T + x.t} · ${esc(infoLiga(x.ligaId).curto)}</small>${x.pos}º de ${x.n}${x.campeao ? " · 🏆 campeão" : ""} (meta ${x.esperado}º)</div>`).join("")}</div>` : `<p class="sub">Primeira temporada no comando.</p>`}</section>`;
  const premios = s.premios?.length ? `<section class="painel"><p class="rotulo">Prêmios</p>${s.premios.map((p) => `<div class="not"><small>${ANO_INICIAL_T + p.t}</small><b>${esc(p.nome)}</b> · ${esc(p.texto)}</div>`).join("")}</section>` : "";
  const fam = (s.familiaJog ?? []).length ? `<section class="painel"><p class="rotulo">Família que joga</p>${s.familiaJog!.map((f) => `<div class="lin" style="cursor:default"><span class="num" style="font-size:12px">${f.pos}</span><span class="nm"><b>${esc(f.nome)}</b><small>Seu ${esc(f.parentesco)} · ${f.idade} anos · OVR ${f.ovr} (pot. ${f.pot}) · ${f.noClube ? "no seu elenco" : f.clubeId ? esc(nomeClube(f.clubeId)) : f.fase === "base" ? "na base" : "sem clube"}</small></span>${f.noClube ? `<span class="pill bom">No time</span>` : `<button class="botao peq" data-familia="${esc(f.nome)}">Trazer</button>`}</div>`).join("")}<p class="sub">Sem clube ou na base: vem de graça. Profissional em outro clube: 80% do valor.</p></section>` : "";
  const contatos = (s.contatos ?? []).length ? `<section class="painel"><p class="rotulo">Contatos da época de jogador</p><p class="sub">Amigos topam vir para clubes menores e não pedem salário a mais.</p>${[...s.contatos!].sort((x, y) => y.nivel - x.nivel).slice(0, 20).map((c) => `<div class="not"><b>${esc(c.nome)}</b> · ${TIPO_CONTATO[c.tipo]} · ${Math.round(c.nivel)}/100</div>`).join("")}</section>` : "";
  return jogador + tecnico + premios + fam + contatos;
}
// ------------------------------------------------------------------ Vida: o técnico fora do campo
/** Carreira de técnico começada antes de a família vir junto: traz do save do modo jogador (o mesmo jogador). */
function completarVida(s: SaveTecnico) {
  if (!s.bio) return;
  // a casa que você montou como jogador (móveis, camisas na parede, carros, imóveis comprados) vem para a carreira de técnico
  if (!s.casaDoJogador) {
    const jog = ler<SaveJogador>("mycarrerinha:save");
    if (jog?.casa && jog.jogador.apelido === s.bio.apelido) { trazerVida(s, undefined, undefined, undefined, jog.casa as unknown as EstadoCasa); salvar(); }
    else s.casaDoJogador = true;
  }
  // as empresas e os investimentos também vêm
  if (!s.negocios) { const jog = ler<SaveJogador>("mycarrerinha:save"), n = (jog?.carreira as { negocios?: EstadoNegocios } | undefined)?.negocios; if (n && jog!.jogador.apelido === s.bio.apelido) { trazerVida(s, undefined, undefined, undefined, undefined, n); salvar(); } }
  if (s.familia || s.namoro) return;
  const jog = ler<SaveJogador>("mycarrerinha:save");
  if (!jog || jog.jogador.apelido !== s.bio.apelido) return;
  trazerVida(s, jog.carreira.familia as unknown as EstadoFamilia | undefined, jog.carreira.namoro as unknown as EstadoNamoro | undefined, jog.casa?.saldo, jog.casa as unknown as EstadoCasa | undefined);
  salvar();
}
// ------------------------------------------------------------------ a cara e a roupa do técnico
/** A cara do técnico: a do jogador que ele foi (com as marcas da idade); quem começou direto ganha uma padrão, já grisalha. */
function aparenciaT(s: SaveTecnico): Aparencia {
  if (!s.tecnico.aparencia) {
    const jog = ler<SaveJogador>("mycarrerinha:save"), dele = s.bio && jog?.jogador.apelido === s.bio.apelido ? jog.jogador.aparencia : undefined;
    s.tecnico.aparencia = { ...APARENCIA_PADRAO, ...(dele ?? { corCabelo: 10, barba: "sombra" }), rugas: true, oculosSol: null, fone: null, bonePatro: null, blusaoPatro: null };
    salvar();
  }
  return { ...APARENCIA_PADRAO, ...(s.tecnico.aparencia as Partial<Aparencia>) };
}
const CORES_TRAJE: [string, string][] = [["clube", "Cor do clube"], ["clube2", "Segunda cor"], ["preto", "Preto"], ["branco", "Branco"], ["marinho", "Azul-marinho"], ["cinza", "Cinza"]];
function coresClube(s: SaveTecnico): [string, string] { const info = infoClube(pacote, s.clubeId), u = UNIFORME_CLUBE[s.clubeId]; return u ? [u.cores[0], u.cores[1]] : [info?.cores[0] ?? "#1D1F22", info?.cores[1] ?? "#FFFFFF"]; }
function fotoTecnico(s: SaveTecnico): string {
  const v = s.tecnico.visual ?? { roupa: "polo", cor: "clube" }, [a, b] = coresClube(s), info = infoClube(pacote, s.clubeId);
  const base: Record<string, [string, string]> = { clube: [a, b], clube2: [b, a], preto: ["#1D1F22", a], branco: ["#F4F2EC", a], marinho: ["#1C2A44", a], cinza: ["#5B6066", a] };
  let [cor, cor2] = base[v.cor] ?? [a, b];
  if (cor.toLowerCase() === cor2.toLowerCase()) cor2 = cor.toLowerCase() === "#ffffff" ? "#1D1F22" : "#FFFFFF";
  const u = UNIFORME_CLUBE[s.clubeId], ec = u?.escudo ?? [info?.cores[0] ?? "#888", info?.cores[1] ?? "#FFF"];
  const escudoSvg = `<svg viewBox="0 0 26 30" width="26" height="30">${corpoEscudo(idClube(s.clubeId), ec[0], ec[1], info?.nome)}</svg>`;
  return svgFoto({ aparencia: aparenciaT(s), tecnico: { roupa: v.roupa as RoupaTecnico, cor, cor2, escudo: escudoSvg }, fundo: [escurecerHex(a), b] });
}
const escurecerHex = (h: string) => { const n = parseInt(h.slice(1), 16), f = (x: number) => Math.round(x * 0.55).toString(16).padStart(2, "0"); return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`; };
function vidaVisual(s: SaveTecnico): string {
  const a = aparenciaT(s), v = s.tecnico.visual ?? { roupa: "polo", cor: "clube" };
  const grupo = (titulo: string, campo: string, ops: [string, string][], atual: string) => `<p class="rotulo" style="margin:12px 0 6px">${titulo}</p><div class="v-acoes">${ops.map(([k, n]) => `<button class="${k === atual ? "v-ativo" : ""}" data-vis="${campo}|${k}">${esc(n)}</button>`).join("")}</div>`;
  return `<section class="painel"><div class="v-retrato">${fotoTecnico(s)}</div>
    ${grupo("Roupa da beira do campo", "roupa", ROUPAS_TECNICO.map((r) => [r.id, r.nome]), v.roupa)}
    ${grupo("Cor da roupa", "cor", CORES_TRAJE, v.cor)}
    ${grupo("Cabelo", "cabelo", [...CABELOS_TECNICO, ...CABELOS].map((c) => [c.id, c.nome]), a.cabelo)}
    ${grupo("Cor do cabelo", "corCabelo", NOMES_CABELO_COR.map((n, i) => [String(i), n] as [string, string]).filter(([i]) => !["8", "9"].includes(i)), String(a.corCabelo))}
    ${grupo("Barba", "barba", BARBAS.map((x) => [x.id, x.nome]), a.barba)}
    ${grupo("Marcas da idade", "rugas", [["1", "Com rugas"], ["0", "Sem rugas"]], a.rugas ? "1" : "0")}
    <p class="sub" style="margin-top:10px">O escudo no peito muda sozinho quando você troca de clube.</p></section>`;
}
void CORES_CABELO;
// ------------------------------------------------------------------ Vida › Negócios (as mesmas empresas da carreira de jogador)
function vidaNegocios(s: SaveTecnico): string {
  completarVida(s);
  const n = negociosT(s), saldo = bolso(s), inv = patrimonioInvestido(n), ab = semanaVida(s), fama = Math.max(s.tecnico.reputacao, (s.tecnico.prestigio ?? 0) * 0.8);
  const p = n.proposta;
  const prop = p ? `<section class="painel"><p class="rotulo">Proposta · ${esc(p.de)}</p><h3 style="margin:0">${esc(p.titulo)}</h3><p class="sub">${esc(p.texto)}</p>
    <div class="dl"><span>Valor</span><b>${curtoBrl(p.valor)}</b><span>Promessa</span><b>${esc(p.promessa)}</b></div>
    ${n.assessor ? `<p class="sub">${p.golpe ? "🧐 Seu assessor: \"Retorno garantido desse tamanho não existe. Isso tem cara de golpe.\"" : "📊 Seu assessor: \"Negócio de verdade. Tem risco, mas é honesto.\""}</p>` : ""}
    <div class="v-acoes"><button data-propneg="1">Topar</button><button data-propneg="0">Recusar</button></div></section>` : "";
  const emp = n.empresas.map((e) => {
    const info = EMPRESAS[e.tipo], feito = e.acao === ab, unid = (e.unidades ?? 0) + 1;
    const gest = e.tipo === "app" ? "" : `<p class="sub" style="margin:6px 0 4px">Decisão do mês: <b>${e.decisao ? esc(DECISOES[e.decisao as DecisaoMes].nome) : "nenhuma"}</b></p><div class="v-acoes">${(Object.keys(DECISOES) as DecisaoMes[]).map((k) => `<button class="${e.decisao === k ? "v-ativo" : ""}" data-decide="${e.uid}|${k}">${esc(DECISOES[k].nome)}</button>`).join("")}</div>
      ${FRANQUIAVEIS.includes(e.tipo) ? `<p class="sub" style="margin:6px 0 4px">${unid} ${unid === 1 ? "unidade" : "unidades"}</p>${unid < MAX_UNIDADES && e.saude >= 60 ? `<div class="v-acoes"><button data-franq="${e.uid}">Abrir unidade (${curtoBrl(Math.round(info.custo * 0.5 * (1 + (e.unidades ?? 0) * 0.5)))})</button></div>` : ""}` : ""}`;
    return `<div class="v-card"><div style="display:flex;justify-content:space-between;gap:8px"><div><b>${esc(e.nome)}</b><small class="sub" style="display:block">${esc(info.nome)} · desde ${e.desde}</small></div><div style="text-align:right"><b>${curtoBrl(Math.round(e.valor))}</b><small class="sub" style="display:block">${e.lucroUlt === undefined ? "primeiro mês" : `${e.lucroUlt >= 0 ? "+" : "−"}${curtoBrl(Math.abs(e.lucroUlt))} no mês`}</small></div></div>
      ${barraRel(e.saude, "Saúde do negócio")}${gest}
      <div class="v-acoes" style="margin-top:6px">${feito ? `<span class="sub">Já mexeu nela nesta semana.</span>` : (["cuidar", "divulgar", "investir"] as AcaoEmpresa[]).map((a) => `<button data-emp="${e.uid}|${a}">${{ cuidar: "Cuidar pessoalmente", divulgar: "Divulgar", investir: `Investir ${curtoBrl(Math.round(info.custo * 0.25))}` }[a as "cuidar"]}</button>`).join("")}<button data-emp="${e.uid}|vender">Vender (${curtoBrl(Math.round(e.valor))})</button></div></div>`;
  }).join("");
  const abrir = (Object.keys(EMPRESAS) as TipoEmpresa[]).filter((t) => !n.empresas.some((e) => e.tipo === t)).map((t) => {
    const i = EMPRESAS[t], pode = fama >= i.famaMin && saldo >= i.custo;
    return `<div class="v-card" style="display:flex;justify-content:space-between;gap:10px;align-items:center${pode ? "" : ";opacity:.55"}"><div><b>${esc(i.nome)}</b><small class="sub" style="display:block">${esc(i.desc)}${fama < i.famaMin ? ` · precisa de fama ${i.famaMin}` : ""}</small></div><div class="v-acoes"><button data-abrir="${t}" ${pode ? "" : "disabled"}>${curtoBrl(i.custo)}</button></div></div>`;
  }).join("");
  const invs = (Object.keys(INVEST) as TipoInvest[]).map((k) => `<div class="v-card"><div style="display:flex;justify-content:space-between"><div><b>${INVEST[k].nome}</b><small class="sub" style="display:block">${esc(INVEST[k].desc)}</small></div><b>${curtoBrl(n.invest[k])}</b></div>
    <div class="v-acoes" style="margin-top:6px">${[100_000, 1_000_000].map((v) => `<button data-inv="${k}|${v}" ${saldo >= v ? "" : "disabled"}>+${curtoBrl(v)}</button>`).join("")}${n.invest[k] > 0 ? `<button data-inv="${k}|-1e15">Resgatar</button>` : ""}</div></div>`).join("");
  const golpes = n.golpes.map((g) => `<div class="v-card"><b>${esc(g.nome)}</b><small class="sub" style="display:block">O extrato não para de subir: ${curtoBrl(g.mostrado)}</small></div>`).join("");
  return `${prop}<section class="painel"><div class="dl"><span>Em conta</span><b>${curtoBrl(saldo)}</b><span>Investido</span><b>${curtoBrl(inv)}</b><span>Patrimônio</span><b>${curtoBrl(saldo + inv)}</b></div>
    ${n.mes ? `<p class="sub" style="margin-top:6px">Último mês: empresas ${n.mes.empresas >= 0 ? "+" : "−"}${curtoBrl(Math.abs(n.mes.empresas))} · investimentos ${n.mes.invest >= 0 ? "+" : "−"}${curtoBrl(Math.abs(Math.round(n.mes.invest)))}</p>` : ""}</section>
    <section class="painel"><p class="rotulo">Suas empresas</p>${emp || `<p class="sub">Nenhuma ainda. Empresa dá lucro quando vai bem, perde quando vai mal e pode falir. Quem cuida, divulga e tem nome vende mais.</p>`}</section>
    <section class="painel"><p class="rotulo">Investimentos</p>${invs}${golpes}
      <div class="v-card" style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><b>Assessor financeiro</b><small class="sub" style="display:block">Desconfia das propostas estranhas e cuida um pouco das empresas. ${curtoBrl(CUSTO_ASSESSOR)}/mês.</small></div><div class="v-acoes"><button data-assessor="${n.assessor ? 0 : 1}">${n.assessor ? "Dispensar" : "Contratar"}</button></div></div></section>
    <section class="painel"><p class="rotulo">Abrir um negócio</p>${abrir || `<p class="sub">Você já tem um de cada.</p>`}</section>`;
}
const corRel = (r: number) => (r >= 70 ? "#5FC08A" : r >= 45 ? "#E3B341" : "#E06A5A");
const barraRel = (r: number, rot?: string) => `<div class="v-rel"><span style="color:${corRel(r)}">${esc(rot ?? rotuloRelacaoFam(r))} · ${Math.round(r)}</span><span class="v-barra"><i style="width:${Math.round(r)}%;background:${corRel(r)}"></i></span></div>`;
const chips = (attr: string, alvo: string | number, l: [string, string][]) => l.length ? `<div class="v-acoes">${l.map(([k, n]) => `<button data-${attr}="${alvo}|${k}">${esc(n)}</button>`).join("")}</div>` : "";
const inicial = (nome: string) => `<span class="v-ini">${esc(nome.trim()[0] ?? "?")}</span>`;
function abaVida(s: SaveTecnico): string {
  completarVida(s);
  const subs = `<div class="sub-abas">${[["perfil", "Seu perfil"], ["visual", "Visual"], ["familia", "Família"], ["negocios", "Negócios"], ["app", "Namoro"], ["contatos", "Contatos"]].map(([k, n]) => `<button class="${(sub.vida ?? "perfil") === k ? "ativo" : ""}" data-sub="vida:${k}">${n}</button>`).join("")}</div>`;
  const corpo = sub.vida === "familia" ? vidaFamilia(s) : sub.vida === "app" ? vidaApp(s) : sub.vida === "contatos" ? vidaContatos(s) : sub.vida === "visual" ? vidaVisual(s) : sub.vida === "negocios" ? vidaNegocios(s) : vidaPerfil(s);
  return subs + aviso() + corpo;
}
/** Card do álbum na bio: as últimas figurinhas e o botão de abrir. */
function albumCardT(s: SaveTecnico): string {
  const al = s.album ?? [], ult = [...al].sort((a, b) => b.ano - a.ano).slice(0, 3);
  return `<section class="painel"><p class="rotulo">Álbum de figurinhas</p>${al.length ? `<button class="album-t" data-album-t style="all:unset;cursor:pointer;display:flex;gap:12px;align-items:center;width:100%"><span style="display:flex;gap:4px;width:150px;flex:none">${ult.map((f) => `<span class="fig ${f.raridade}" style="width:48px">${figurinhaArte(f, ctxFigT(s))}</span>`).join("")}</span><span><b>Abrir o álbum</b><br><small class="sub">${al.length} figurinhas${al.some((f) => f.posicao !== "TEC") ? " · a carreira de jogador e a de técnico" : ""}</small></span></button>` : `<p class="sub">A primeira figurinha de técnico sai no fim da temporada: uma por ano, com jogos, vitórias e posição, e especiais para título, acesso, técnico do ano e marcas da carreira.</p>`}</section>`;
}
/** O que a arte das figurinhas precisa no modo técnico: o técnico de roupa de beira de campo, ou o jogador de uniforme (álbum antigo). */
/** A capa do álbum do técnico: ele no centro, os escudos de todos os clubes que treinou, a bandeira e a família no fundo. */
function capaAlbumT(s: SaveTecnico): CapaAlbum {
  const v = s.tecnico.visual ?? { roupa: "polo", cor: "clube" }, [a, b] = coresClube(s), info = infoClube(pacote, s.clubeId), n = s.namoro;
  const u = UNIFORME_CLUBE[s.clubeId], ec = u?.escudo ?? [info?.cores[0] ?? "#888", info?.cores[1] ?? "#FFF"];
  const esc2 = `<svg viewBox="0 0 26 30" width="26" height="30">${corpoEscudo(idClube(s.clubeId), ec[0], ec[1], info?.nome)}</svg>`;
  const cor = a.toUpperCase() === "#FFFFFF" ? "#F4F2EC" : a;
  const retrato = svgFoto({ aparencia: aparenciaT(s), tecnico: { roupa: v.roupa as RoupaTecnico, cor, cor2: b, escudo: esc2 }, semFundo: true });
  const clubes = [...(s.album ?? []).filter((f) => f.tipo === "temporada" && !f.clubeId.startsWith("sel-") && !f.clubeId.startsWith("marca-")).sort((x, y) => x.ano - y.ano).map((f) => f.clubeId), ...s.historico.map((h) => h.clubeId ?? ""), s.clubeId].filter((id) => id && !id.startsWith("NAT"));
  const pessoas: CapaAlbum["pessoas"] = [];
  for (const f of n?.filhos ?? []) pessoas.push({ nome: f.nome, papel: f.menina ? "filha" : "filho" });
  if (n?.par) pessoas.push({ svg: fotoDoPerfil(n.par), nome: n.par.nome, papel: n.par.etapa === "casados" ? "esposa" : "companheira" });
  for (const e of [...(n?.exes ?? [])].reverse()) pessoas.push({ svg: fotoDoPerfil(e.par), nome: e.par.nome, papel: "ex" });
  return { retrato, cores: [escurecerHex(a), "#0B1410"], clubes, bandeira: bandeiraSvg(s.tecnico.nac), pessoas };
}
function ctxFigT(s: SaveTecnico): CtxFig {
  const ap = (f: Figurinha) => ({ ...APARENCIA_PADRAO, ...(f.ap as Partial<Aparencia>) });
  const v = s.tecnico.visual ?? { roupa: "polo", cor: "clube" };
  return {
    nome: s.tecnico.exJogador?.apelido ?? s.tecnico.nome,
    escudo: (id) => id.startsWith("sel-") ? bandeiraSvg(id.slice(4)) : id.startsWith("marca-") ? (MARCA[id.slice(6)] ? logoSvg(MARCA[id.slice(6)], 44) : "") : escudo(id),
    bandeira: (c) => bandeiraSvg(c),
    retrato: (f) => {
      if (f.posicao === "TEC") { const [a, b] = f.cores, esc2 = f.clubeId.startsWith("sel-") ? bandeiraSvg(f.clubeId.slice(4)) : `<svg viewBox="0 0 26 30" width="26" height="30">${corpoEscudo(idClube(f.clubeId), a, b, f.clube)}</svg>`; return svgFoto({ aparencia: ap(f), tecnico: { roupa: v.roupa as RoupaTecnico, cor: a.toUpperCase() === "#FFFFFF" ? "#F4F2EC" : a, cor2: b, escudo: esc2 }, semFundo: true }); }
      if (f.tipo === "familia") return svgFoto({ aparencia: ap(f), traje: "social", semFundo: true });
      const c1 = f.cores[0];
      return svgFoto({ aparencia: ap(f), camisa: { cor1: c1.toUpperCase() === "#FFFFFF" ? "#F4F4F2" : c1, cor2: f.cores[1] ?? "#111111", estilo: "lisa", fonte: f.clubeId }, numero: f.numero, traje: "jogo", semFundo: true });
    },
    marca: (f) => { const m = f.contrato ? MARCA[f.contrato.marca] : undefined; return m ? logoSvg(m, 44) : undefined; },
  };
}
function abrirAlbumT(s: SaveTecnico) {
  abrir(`<div id="albumT" style="min-height:600px"></div>`);
  const el = document.getElementById("albumT");
  if (el) new Album(el, { figs: () => s.album ?? [], ctx: () => ctxFigT(s), nome: () => s.tecnico.exJogador?.apelido ?? s.tecnico.nome, capa: () => capaAlbumT(s), fechar: () => ($("dlg") as HTMLDialogElement).close() }).abrir(-1);
}
/** Quem é o técnico: origem, filosofia (e se a tática de agora combina), personalidade, pontos fortes e a biografia. */
function blocoPerfilTecnico(s: SaveTecnico): string {
  const p = s.tecnico.perfil;
  if (!p) return "";
  const combina = combinaFilosofia(p.filosofia, s.tatica);
  return `<section class="painel"><p class="rotulo">Quem é você</p>${p.bio ? `<p class="sub" style="color:var(--giz)">${esc(p.bio)}</p>` : ""}
    <div class="dl" style="margin-top:8px"><span>Origem</span><b>${ORIGENS[p.origem].nome}${p.nivelEx ? ` (${NIVEL_EX[p.nivelEx].nome.toLowerCase()})` : ""}</b>${p.mentor ? `<span>Mentor</span><b>${esc(p.mentor)}</b>` : ""}<span>Filosofia</span><b>${FILOSOFIAS[p.filosofia].nome}</b><span>Personalidade</span><b>${PERSONALIDADES[p.personalidade].nome}</b></div>
    <p class="sub" style="margin-top:6px">${combina ? "✅ A tática de agora combina com a sua filosofia: o time rende um pouco mais." : `A tática de agora não é a sua cara (${esc(FILOSOFIAS[p.filosofia].texto.toLowerCase())}). Ajustando na aba Tática, o time rende um pouco mais.`}</p>
    ${ATRIBS_T.map((k) => `<div class="atr-linha"><div><b>${NOME_ATRIB_T[k]}</b></div>${barra(p.atrib[k] * 5)}<span class="atr-n">${p.atrib[k]}</span></div>`).join("")}
    <p class="sub" style="margin-top:6px">${esc(ORIGENS[p.origem].efeito)}</p></section>`;
}
function vidaPerfil(s: SaveTecnico): string {
  completarVida(s); casaT(pacote, s);
  const t = s.tecnico, n = s.namoro, par = n?.par, filhos = n?.filhos ?? [];
  const resumoFam = [par ? `${({ casados: "Casado com", noivos: "Noivo de", morando: "Mora com", namorando: "Namorando", saindo: "Saindo com", match: "Conversando com" } as Record<string, string>)[par.etapa]} ${par.nome.split(" ")[0]}` : "Solteiro", filhos.length ? `${filhos.length} ${filhos.length === 1 ? "filho" : "filhos"}` : ""].filter(Boolean).join(" · ");
  const cab = `<section class="painel"><div class="v-topo"><button class="v-mini" data-sub="vida:visual" aria-label="Mudar o visual">${fotoTecnico(s)}</button><div><p class="rotulo">Técnico</p><h2 style="margin:0">${esc(t.nome)}</h2><p class="sub">${t.idade} anos · ${esc(t.nac)}${t.exJogador ? ` · ex-jogador (${esc(t.exJogador.apelido)})` : ""}</p></div></div>
    <div class="dl" style="margin-top:8px"><span>Clube</span><b>${esc(nomeClube(s.clubeId))}</b><span>Reputação</span><b>${t.reputacao}/100</b><span>Salário</span><b>${curtoBrl(salarioTecnico(s))}/mês</b>${t.contrato ? `<span>Contrato</span><b>até ${ANO_INICIAL_T + t.contrato.ate} · multa ${curtoBrl(t.contrato.multa)}</b>` : ""}<span>No bolso</span><b>${curtoBrl(bolso(s))}</b><span>Vida pessoal</span><b>${esc(resumoFam)}</b></div>
    <div class="botoes" style="margin-top:10px"><button class="botao sec" data-sub="vida:familia">Ver a família</button></div></section>
    ${blocoPerfilTecnico(s)}
    <section class="painel"><p class="rotulo">Sua casa</p>${(() => { const c = casaT(pacote, s), m = IMOVEL[c.imovel]; return `<h3 style="margin:0">${esc(nomeImovel(c, m))}</h3><p class="sub">${esc(m.local)} · ${c.proprios.includes(c.imovel) ? "imóvel próprio" : `aluguel ${curtoBrl(m.aluguel)}/mês`} · ${c.objetos.length} itens · ${(c.carros ?? []).length} ${(c.carros ?? []).length === 1 ? "carro" : "carros"}</p><p class="sub">Patrimônio: ${curtoBrl(patrimonio(c))}</p>`; })()}
    <div class="botoes" style="margin-top:10px"><button class="botao" data-casa>Entrar em casa</button></div></section>
    ${albumCardT(s)}`;
  return cab + abaCarreira(s).replace(/<section class="painel"><p class="rotulo">Contatos da época de jogador<\/p>[\s\S]*$/, "");
}
function vidaContatos(s: SaveTecnico): string {
  const m = abaCarreira(s).match(/<section class="painel"><p class="rotulo">Contatos da época de jogador<\/p>[\s\S]*$/);
  return m ? m[0] : `<p class="sub">Sem contatos da época de jogador.</p>`;
}
function vidaFamilia(s: SaveTecnico): string {
  const n = s.namoro, f = s.familia, ano = anoVida(s), pj = proximoJogo(s), emCasa = !!pj?.souCasa;
  if (!n && !f) return `<section class="painel"><p class="sub">${s.bio ? "Não achei a carreira de jogador neste aparelho para trazer a família." : "Esta carreira começou direto como técnico: a família aparece quando você vem da carreira de jogador."} Você ainda pode conhecer alguém na aba Namoro.</p></section>`;
  const blocos: string[] = [];
  const par = n?.par;
  if (par) {
    const grav = n ? gravidasDe(n).find((g) => g.mae === par.nome) : undefined;
    blocos.push(`<section class="painel"><p class="rotulo">${par.etapa === "casados" ? "Esposa" : "Companheira"}</p><div class="v-pessoa"><span class="v-foto">${fotoDoPerfil(par)}</span><div><b>${esc(par.nome)}</b><small class="sub">${NOME_ETAPA[par.etapa]} · ${par.idade} anos · ${esc(PROFISSOES[par.profissao]?.nome ?? par.profissao)}</small></div></div>
      ${barraRel(par.relacao, par.relacao >= 80 ? "Apaixonados" : par.relacao >= 60 ? "Bem" : par.relacao >= 40 ? "Morna" : "Em crise")}
      ${grav ? `<p class="sub">Grávida: o bebê nasce em ${Math.max(0, grav.parto - (s.temporada * 40 + Math.min(39, s.semana)))} semanas.</p>` : ""}
      ${chips("vp", par.id, acoesParT(s, par.id).map((a) => [a, NOME_ACAO_NAMORO[a]] as [string, string]))}</section>`);
  }
  for (const g of n ? gravidasDe(n).filter((g) => g.mae !== par?.nome) : []) blocos.push(`<section class="painel"><p class="sub">${esc(g.mae.split(" ")[0])} está grávida de você. O bebê nasce em ${Math.max(0, g.parto - (s.temporada * 40 + Math.min(39, s.semana)))} semanas.</p></section>`);
  const filhos = n?.filhos ?? [];
  if (filhos.length) blocos.push(`<section class="painel"><p class="rotulo">Filhos</p>${filhos.map((x, i) => {
    const idade = Math.max(0, ano - x.ano), r = x.relacao ?? 70;
    const fb = x.futebol ? ` · ${{ escolinha: "na escolinha", base: "na base", pro: "jogador profissional", parou: "largou o futebol" }[x.futebol.fase]}` : "";
    return `<div class="v-card"><div class="v-pessoa">${inicial(x.nome)}<div><b>${esc(x.nome)}</b><small class="sub">${x.menina ? "Filha" : "Filho"} · ${idade === 0 ? "recém-nascid" + (x.menina ? "a" : "o") : `${idade} ${idade === 1 ? "ano" : "anos"}`} · mãe: ${esc(x.mae.split(" ")[0])}${x.pensao ? " (mora com a mãe)" : ""}${fb}</small></div></div>${barraRel(r)}<p class="sub" style="margin:2px 0 4px">“${esc(falaSobreVoce(r))}”</p>${chips("vfi", i, acoesFilhoT(s, i).map((a) => [a, NOME_ACAO_FILHO[a]] as [string, string]))}</div>`;
  }).join("")}</section>`);
  const membros = (f?.membros ?? []).filter((m) => !m.falecido);
  if (membros.length) blocos.push(`<section class="painel"><p class="rotulo">Pais e irmãos</p>${membros.map((m) => {
    const rosto = rostoParente(m.parentesco, m.id, undefined);
    return `<div class="v-card"><div class="v-pessoa">${rosto ? `<span class="v-foto">${rosto}</span>` : inicial(m.nome)}<div><b>${esc(m.nome)}</b><small class="sub">${NOME_PARENTESCO[m.parentesco]} · ${idadeDe(m, ano)} anos · ${esc(m.profissao)}</small></div></div>${barraRel(m.relacao)}${chips("vf", m.id, acoesFamiliaT(pacote, s, m.id, emCasa).map((a) => [a, NOME_ACAO_FAM[a]] as [string, string]))}</div>`;
  }).join("")}${(f?.membros ?? []).filter((m) => m.falecido).map((m) => `<p class="sub">${NOME_PARENTESCO[m.parentesco]}: ${esc(m.nome)} (faleceu em ${m.falecido})</p>`).join("")}</section>`);
  const exes = exesT(s);
  if (exes.length) blocos.push(`<section class="painel"><p class="rotulo">Ex</p>${exes.map((e) => `<div class="v-card"><div class="v-pessoa"><span class="v-foto">${fotoDoPerfil(e.par)}</span><div><b>${esc(e.par.nome)}</b><small class="sub">${esc(TEXTO_FIM[e.como])}</small></div></div>${barraRel(e.relacao, e.relacao >= 60 ? "Amigos" : e.relacao >= 35 ? "Cordial" : "Frio")}${chips("vx", e.par.id, acoesExT(s, e.par.id).map((a) => [a, NOME_ACAO_EX[a]] as [string, string]))}</div>`).join("")}</section>`);
  const jog = (s.familiaJog ?? []).length ? abaCarreira(s).match(/<section class="painel"><p class="rotulo">Família que joga<\/p>[\s\S]*?<\/section>/)?.[0] ?? "" : "";
  return `<p class="sub" style="margin-bottom:8px">Programas pagos saem do seu bolso (${curtoBrl(bolso(s))}), não do caixa do clube.</p>` + blocos.join("") + jog;
}
function vidaApp(s: SaveTecnico): string {
  const n = s.namoro, par = n?.par;
  const matches = (n?.matches ?? []).concat(n?.ficantes ?? []);
  const lista = matches.length ? `<section class="painel"><p class="rotulo">Conversas</p>${matches.map((p) => `<div class="v-card"><div class="v-pessoa"><span class="v-foto">${fotoDoPerfil(p)}</span><div><b>${esc(p.nome.split(" ")[0])}, ${p.idade}</b><small class="sub">${NOME_ETAPA[p.etapa]} · ${esc(PROFISSOES[p.profissao]?.nome ?? p.profissao)}</small></div></div>${barraRel(p.relacao, "Clima")}${chips("vp", p.id, acoesParT(s, p.id).map((a) => [a, NOME_ACAO_NAMORO[a]] as [string, string]))}</div>`).join("")}</section>` : "";
  const perfis = perfisDaSemanaT(pacote, s).filter((p) => !matches.some((m) => m.id === p.id)).slice(0, 6);
  return `${par ? `<p class="aviso-t" style="margin-bottom:8px">Você está ${NOME_ETAPA[par.etapa].toLowerCase()} com ${esc(par.nome.split(" ")[0])}. Se ela descobrir o app, vai dar problema.</p>` : ""}${lista}
    <section class="painel"><p class="rotulo">Perfis da semana</p>${perfis.map((p) => `<div class="v-card"><div class="v-pessoa"><span class="v-foto">${fotoDoPerfil(p)}</span><div><b>${esc(p.nome.split(" ")[0])}, ${p.idade}</b><small class="sub">${esc(PROFISSOES[p.profissao]?.nome ?? p.profissao)} · ${esc(p.cidade)}</small><small class="sub">“${esc(p.bio)}”</small></div></div><div class="v-acoes"><button data-vc="${p.id}|1">Curtir</button><button data-vc="${p.id}|0">Passar</button></div></div>`).join("") || `<p class="sub">Acabaram os perfis desta semana.</p>`}</section>`;
}
function abaNoticias(s: SaveTecnico): string {
  const ICO: Record<string, string> = { jogo: "⚽", clube: "🏟️", elenco: "👕", diretoria: "💼", dinheiro: "💰", vida: "❤️" };
  return `<p class="rotulo">Notícias</p>${s.noticias.map((n) => `<div class="not"><small>${ICO[n.tipo] ?? "•"} ${esc(n.quando)}</small>${esc(n.texto)}</div>`).join("") || `<p class="sub">Nada por enquanto.</p>`}`;
}
/** Camisas vendidas na temporada: total, ranking por jogador (com barra) e os campeões de venda das anteriores. */
function camisasHtml(s: SaveTecnico): string {
  const v = s.camisas?.temporada === s.temporada ? s.camisas : undefined, hist = s.camisasHist ?? [];
  if (!v && !hist.length) return `<p class="rotulo" style="margin-top:14px">Camisas vendidas</p><p class="sub">A conta das camisas fecha no fim de cada mês.</p>`;
  const rk = v ? rankingCamisas(v).slice(0, 10) : [], max = rk[0]?.[2] ?? 1, tot = v ? totalCamisas(v) : 0;
  return `<p class="rotulo" style="margin-top:14px">Camisas vendidas · ${ANO_INICIAL_T + s.temporada}</p>
    ${v ? "" : `<p class="sub">A conta da temporada nova começa no fim do primeiro mês.</p>`}
    ${v ? `<div class="dl"><span>Total na temporada</span><b>${fmtMil(tot)}</b><span>Sem nome (lisas)</span><b>${fmtMil(v.semNome)}</b><span>Preço da oficial</span><b>${valorBrl(precoCamisa(infoLiga(s.ligaId).fLiga))}</b></div>
    <p class="sub" style="margin:6px 0">O clube fica com os royalties (entram no mês como "Camisas vendidas"). Craque, artilheiro, reforço novo e cria da base vendem mais.</p>
    ${rk.map(([id, nome, n], i) => { const a = s.elenco.find((x) => x.id === id); return `<div class="not" style="display:flex;align-items:center;gap:10px"><b style="width:18px;text-align:right">${i + 1}</b><span style="flex:1"><b>${esc(nome)}</b>${a ? ` <small class="sub">${a.pos} · ${a.numero}</small>` : ` <small class="sub">saiu</small>`}<i style="display:block;height:6px;border-radius:3px;margin-top:4px;background:linear-gradient(90deg,var(--ouro) ${Math.round((n / max) * 100)}%,transparent 0)"></i></span><b>${fmtMil(n)}</b></div>`; }).join("")}` : ""}
    ${hist.length ? `<details class="not"><summary>Temporadas anteriores</summary>${hist.map((h) => `<div class="not"><small>${ANO_INICIAL_T + h.temporada} · ${fmtMil(h.total)} camisas</small>${h.top.slice(0, 3).map(([n, q], i) => `${i + 1}º ${esc(n)} (${fmtMil(q)})`).join(" · ")}</div>`).join("")}</details>` : ""}`;
}
function abaFinancas(s: SaveTecnico): string {
  const li = infoLiga(s.ligaId), manut = Math.round(s.clube.capacidade * 10 * Math.max(0.4, li.fLiga)), cotas = Object.values(receitaPatro(pacote, s)).reduce((x, y) => x + y, 0), mensal = s.clube.tv + s.clube.patrocinio + cotas - folhaDe(s) - folhaStaff(s) - manut;
  const linha = (o: Record<string, number>, sinal: string) => Object.entries(o).filter(([, v]) => v).map(([k, v]) => `<span>${esc(k)}</span><b class="${sinal}">${sinal === "neg" ? "−" : "+"}${curtoBrl(v)}</b>`).join("");
  return `<section class="painel" style="padding:0;border:0;background:none"><div class="dl">
      <span>Caixa</span><b class="${s.clube.saldo < 0 ? "neg" : ""}">${valorBrl(s.clube.saldo)}</b>
      <span>Salários do elenco</span><b>${curtoBrl(folhaDe(s))}/mês</b><span>Teto da folha</span><b>${curtoBrl(s.clube.tetoFolha)}/mês</b>
      <span>Comissão técnica</span><b>${curtoBrl(folhaStaff(s))}/mês</b><span>TV</span><b>${curtoBrl(s.clube.tv)}/mês</b><span>Patrocínios (camisa e arena)</span><b>${curtoBrl(cotas)}/mês</b><span>Outros patrocínios</span><b>${curtoBrl(s.clube.patrocinio)}/mês</b>
      <span>Manutenção do estádio</span><b>${curtoBrl(manut)}/mês</b><span>Fixo do mês (sem bilheteria)</span><b class="${mensal < 0 ? "neg" : "pos"}">${curtoBrl(mensal)}</b>
      <span>Estádio</span><b>${s.clube.capacidade.toLocaleString("pt-BR")} lugares</b><span>Ingresso médio</span><b>${valorBrl(precoIngresso(li.fLiga))}</b>
    </div></section>
    ${camisasHtml(s)}
    <p class="rotulo" style="margin-top:14px">Meses fechados</p>${s.financas.length ? s.financas.slice(0, 8).map((m) => {
      const r = Object.values(m.receitas).reduce((a, b) => a + b, 0), d = Object.values(m.despesas).reduce((a, b) => a + b, 0);
      return `<details class="not"><summary>${esc(m.rotulo)} · <b class="${r - d < 0 ? "neg" : ""}" style="color:${r - d < 0 ? "var(--neg)" : "var(--pos)"}">${r - d < 0 ? "" : "+"}${curtoBrl(r - d)}</b></summary><div class="dl" style="margin-top:6px">${linha(m.receitas, "pos")}${linha(m.despesas, "neg")}</div></details>`;
    }).join("") : `<p class="sub">O primeiro mês fecha na quarta semana.</p>`}`;
}
function abaDiretoria(s: SaveTecnico): string {
  const d = s.diretoria, ab = semanaAbs(s);
  const pedido = (p: Pedido, titulo: string, texto: string) => {
    const c = custoPedido(s, p), andando = d.obras.find((o) => o.tipo === p), max = (p === "ct" && s.clube.ctNivel >= 5) || (p === "base" && s.clube.baseNivel >= 5) || (p === "gramado" && (s.clube.gramado ?? 3) >= 5) || (p === "conforto" && (s.clube.conforto ?? 3) >= 5);
    return `<div class="not"><b>${titulo}</b><small style="font-size:13px;margin:2px 0 6px">${texto}${c.custo ? ` · custo ${curtoBrl(c.custo)}` : ""}</small>${andando ? `<span class="pill aviso">Em obra · ${andando.fim - ab} semanas</span>` : max ? `<span class="pill bom">Nível máximo</span>` : `<button class="botao sec peq" data-ped="${p}">Pedir à diretoria</button>`}</div>`;
  };
  const cE = custoPedido(s, "estadio"), info = infoClube(pacote, s.clubeId), obraEst = d.obras.find((o) => o.tipo === "estadio");
  const ap = info ? aparenciaDoEstadio(info, mundo(pacote).info) : undefined;
  const est = `<div class="estadio-box">${svgEstadio({ ...(ap?.dados ?? { nome: "Estádio", cores: ["#2E7D4F", "#FFFFFF"] }), nome: arenaDoClube(pacote, s).nome, capacidade: s.clube.capacidade, obra: !!obraEst })}</div>${ap?.divideCom.length && !s.estadioProprio ? `<p class="sub" style="text-align:center;margin:-4px 0 8px">Estádio dividido com ${ap.divideCom.map(esc).join(" e ")}.</p>` : ""}
    ${obraEst ? `<p class="sub" style="text-align:center;margin:-4px 0 10px">Obra de ampliação: +${(obraEst.lugares ?? 0).toLocaleString("pt-BR")} lugares em ${obraEst.fim - ab} semanas.</p>` : ""}`;
  return `${est}<div class="dl"><span>Confiança</span><b>${Math.round(d.confianca)}/100</b><span>Meta da temporada</span><b>${esc(d.expectativa.texto)} (${d.expectativa.pos}º)</b><span>Centro de treinamento</span><b>${estrelas(s.clube.ctNivel)}</b><span>Categoria de base</span><b>${estrelas(s.clube.baseNivel)}</b></div>
    ${planoHtml(s)}
    ${gramadoHtml(s)}
    ${estadioProprioHtml(s)}
    ${governoHtml(s)}
    <p class="rotulo" style="margin-top:14px">Pedidos</p>
    ${pedido("estadio", "Ampliar o estádio", `+${(cE.lugares ?? 0).toLocaleString("pt-BR")} lugares, mais bilheteria. Precisa de confiança 55`)}
    ${pedido("ct", `Reformar o centro de treinamento (nível ${Math.min(5, s.clube.ctNivel + 1)})`, "Todo o elenco evolui mais. Precisa de confiança 50")}
    ${pedido("base", `Investir na base (nível ${Math.min(5, s.clube.baseNivel + 1)})`, "Garotos melhores e em maior número a cada temporada. Precisa de confiança 45")}
    ${pedido("gramado", `Trocar o gramado (nível ${Math.min(5, (s.clube.gramado ?? 3) + 1)})`, "Bola rola melhor para quem tem técnica e menos lesões em casa. Obra rápida (5 semanas). Precisa de confiança 40")}
    ${pedido("conforto", `Reformar arquibancadas e cadeiras (conforto ${Math.min(5, (s.clube.conforto ?? 3) + 1)})`, "Cadeiras novas, cobertura e banheiros: mais público, ingresso mais caro e torcida mais feliz. Precisa de confiança 50")}
    ${pedido("verba", "Aumentar o teto salarial (+12%)", "Espaço para renovar e contratar. Precisa de confiança 70 e caixa de quatro meses de salários")}
    <p class="sub" style="margin-top:8px">A confiança sobe com vitórias acima do esperado e com campanha melhor que a meta. Abaixo de 8, você é demitido.</p>`;
}
/** Tem jogo em casa na semana absoluta `ab`? (para avisar que o show manda o jogo para um estádio alugado) */
function proximoEmCasaNa(s: SaveTecnico, ab: number): boolean {
  const j = proximoJogo({ ...s, semana: ab - s.temporada * 60 });
  return !!j?.souCasa;
}
/** O projeto de estádio próprio que está sendo montado na tela. */
const projEst: ProjetoEstadio = { nome: "", lugares: 35000, padrao: "moderno", gramado: "hibrido" };
/** Estádio público ou dividido: aluguel, sem reformas, grama combinada; e o projeto do estádio próprio. */
function estadioProprioHtml(s: SaveTecnico): string {
  const sit = situacaoEstadio(pacote, s), o = s.obraEstadio, ano = (t: number) => ANO_INICIAL_T + t;
  if (s.estadioProprio) { const e = s.estadioProprio, ab = s.temporada * 60 + s.semana;
    const ofs = (s.showsOferta ?? []).map((o) => `<div class="not"><b>🎤 ${esc(o.artista)}</b> <small class="sub">quer o estádio daqui a ${o.semana - ab} ${o.semana - ab === 1 ? "semana" : "semanas"} · paga <b style="color:var(--pos)">${curtoBrl(o.valor)}</b> · responda em até ${o.ate - ab + 1} ${o.ate - ab + 1 === 1 ? "semana" : "semanas"}</small>${proximoEmCasaNa(s, o.semana) ? `<br><small style="color:var(--ouro)">Nessa semana tem jogo em casa: o time joga num estádio alugado (menos público e menos força de mandante).</small>` : ""}<div class="botoes" style="margin-top:6px"><button class="botao peq" data-show="${o.id}|1">Aceitar</button><button class="botao sec peq" data-show="${o.id}|0">Recusar</button></div></div>`).join("");
    const marcados = (s.shows ?? []).map((x) => `<div class="not">🎤 ${esc(x.artista)} <small class="sub">· daqui a ${x.semana - ab} ${x.semana - ab === 1 ? "semana" : "semanas"} · ${curtoBrl(x.valor)}</small></div>`).join("");
    const shows = recebeShows(s) ? `<p class="rotulo" style="margin-top:10px">Shows</p>${ofs}${marcados}${!ofs && !marcados ? `<p class="sub">Nenhuma proposta agora. ${e.padrao === "arena" ? "Arenas multiuso recebem propostas com frequência." : "Estádios modernos recebem propostas de vez em quando; arenas multiuso, bem mais."}</p>` : ""}${s.gramadoDano ? `<p class="sub">O gramado está se recuperando do último show.</p>` : ""}` : "";
    return `<p class="rotulo" style="margin-top:14px">Estádio próprio</p><div class="not"><b>${esc(e.nome)}</b><small class="sub"> · inaugurado em ${ano(e.desde)} · ${e.lugares.toLocaleString("pt-BR")} lugares · ${PADRAO_EST[e.padrao].nome.toLowerCase()} · gramado ${GRAMADO_EST[e.gramado].nome.toLowerCase()}</small><br><small>O estádio é do clube: reformas liberadas e o nome pode ser vendido.${e.parceiroAte !== undefined && e.parceiroAte >= s.temporada ? ` A construtora parceira fica com 30% da bilheteria até ${ano(e.parceiroAte)}.` : " Sem aluguel."}</small></div>${shows}`; }
  if (o) {
    const pct = Math.round((o.feitas / o.semanas) * 100);
    return `<p class="rotulo" style="margin-top:14px">Obra do estádio próprio</p><div class="not"><b>${esc(o.nome)}</b> <small class="sub">· ${o.lugares.toLocaleString("pt-BR")} lugares · ${PADRAO_EST[o.padrao].nome.toLowerCase()} · gramado ${GRAMADO_EST[o.gramado].nome.toLowerCase()}</small>
      <div style="margin:6px 0">${barra(pct, "var(--ouro)")} <b>${pct}%</b> · faltam ${o.semanas - o.feitas} semanas${o.pausada ? ` · <span style="color:var(--neg)">parada por falta de dinheiro</span>` : ""}</div>
      <small class="sub">Pago ${curtoBrl(o.pago)} de ${curtoBrl(o.custo)}${o.parceria ? " (a parte do clube; a construtora banca o resto)" : ""}. A parcela sai do caixa toda semana; sem dinheiro, a obra para.</small></div>`;
  }
  if (!sit.publico) return "";
  const outros = sit.divide.map((id) => nomeClube(id));
  const orc = orcamentoEstadio(s, projEst);
  if (!projEst.nome) projEst.nome = `Arena ${nomeClube(s.clubeId).split(" ")[0]}`;
  const chip = (attr: string, v: string, at: boolean, nome: string) => `<button class="chip${at ? " ativo" : ""}" ${attr}="${v}">${esc(nome)}</button>`;
  return `<p class="rotulo" style="margin-top:14px">O estádio não é do clube</p>
    <div class="not">O <b>${esc(sit.nome)}</b> é público${outros.length ? ` e dividido com ${esc(outros.join(" e "))}` : ""}. O clube paga <b>aluguel</b> (15% da bilheteria de cada jogo), <b>não pode reformar</b> nem ampliar${outros.length ? ` e a <b>altura da grama</b> é combinada com o ${esc(outros[0])}` : ""}. O nome também não pode ser vendido.</div>
    <p class="rotulo" style="margin-top:10px">Construir um estádio próprio</p>
    <div class="form-ini"><label>Nome do estádio<input id="iNomeEst" value="${esc(projEst.nome)}" maxlength="32" autocomplete="off"></label></div>
    <p class="sub" style="margin:8px 0 4px">Lugares</p><div class="chips quebra">${LUGARES_EST.map((n) => chip("data-est-lug", String(n), projEst.lugares === n, `${n / 1000} mil`)).join("")}</div>
    <p class="sub" style="margin:8px 0 4px">Padrão</p><div class="chips quebra">${(Object.keys(PADRAO_EST) as PadraoEstadio[]).map((k) => chip("data-est-pad", k, projEst.padrao === k, PADRAO_EST[k].nome)).join("")}</div><p class="sub">${PADRAO_EST[projEst.padrao].texto}</p>
    <p class="sub" style="margin:8px 0 4px">Gramado</p><div class="chips quebra">${(Object.keys(GRAMADO_EST) as GramadoTipo[]).map((k) => chip("data-est-gra", k, projEst.gramado === k, GRAMADO_EST[k].nome)).join("")}</div><p class="sub">${GRAMADO_EST[projEst.gramado].texto}</p>
    <p class="sub" style="margin:8px 0 4px">Quem paga</p><div class="chips quebra">${chip("data-est-par", "0", !projEst.parceria, "Só o clube")}${chip("data-est-par", "1", !!projEst.parceria, "Parceria com construtora")}</div><p class="sub">${projEst.parceria ? `A construtora banca 60% da obra e, em troca, fica com 30% da bilheteria por ${ANOS_PARCERIA} temporadas depois da inauguração.` : "O clube paga tudo e fica com toda a bilheteria desde o primeiro jogo."}</p>
    <div class="dl" style="margin-top:8px"><span>Custo total</span><b>${curtoBrl(orc.custo)}</b>${projEst.parceria ? `<span>Parte do clube</span><b>${curtoBrl(orc.doClube)}</b>` : ""}<span>Entrada (agora)</span><b>${curtoBrl(orc.entrada)}</b><span>Obra</span><b>${orc.semanas} semanas (~${(orc.semanas / 42).toFixed(1).replace(".", ",")} temporadas)</b><span>Caixa do clube</span><b>${curtoBrl(s.clube.saldo)}</b></div>
    <div class="botoes" style="margin-top:8px"><button class="botao" data-est-iniciar>Apresentar o projeto à diretoria</button></div>
    <p class="sub">A diretoria aprova com confiança de 60 ou mais e a entrada em caixa. O resto sai do caixa toda semana até a obra acabar; enquanto isso, o time segue jogando no ${esc(sit.nome)}.</p>`;
}
/** O gramado do estádio: qualidade, conforto e a altura da grama (o técnico escolhe, de 20 a 30 mm). */
function gramadoHtml(s: SaveTecnico): string {
  const h = s.clube.grama ?? 25, est = estiloDoTime(s);
  const dica = est >= 0.6 ? "Seu time toca a bola e joga com ritmo: grama mais baixa (20–23 mm) acelera o jogo a seu favor." : est <= -0.6 ? "Seu time é mais físico e se fecha: grama mais alta (27–30 mm) segura a bola e trava quem gosta de tocar." : "Seu time está no meio-termo: a altura padrão (25 mm) não atrapalha ninguém.";
  return `<p class="rotulo" style="margin-top:14px">Estádio e gramado</p><div class="dl"><span>Qualidade do gramado</span><b>${estrelas(s.clube.gramado ?? 3)}</b><span>Conforto das arquibancadas</span><b>${estrelas(s.clube.conforto ?? 3)}</b><span>Altura da grama</span><b>${h} mm</b></div>
    <div class="chips" style="margin:8px 0">${[20, 22, 24, 25, 26, 28, 30].map((v) => `<button class="chip${v === h ? " ativo" : ""}" data-grama="${v}">${v} mm</button>`).join("")}</div>
    ${situacaoEstadio(pacote, s).divide.length ? `<p class="sub" style="color:var(--ouro)">O estádio é dividido: mudar a altura é uma proposta ao ${esc(nomeClube(situacaoEstadio(pacote, s).divide[0]))}, que pode recusar (uma conversa por mês).</p>` : ""}
    <p class="sub">Vale só nos jogos em casa e fica sempre dentro da faixa usada nos gramados oficiais (20 a 30 mm). Grama baixa deixa a bola rápida; grama alta deixa o jogo lento e ajuda o time mais fraco a segurar o favorito. ${dica}</p>`;
}
/** Quem manda no clube: presidente e mandato (associativo), o dono (SAF ou empresa), a dívida e a eleição. */
function governoHtml(s: SaveTecnico): string {
  const g = s.governo, base = s.clube.folhaBase ?? 1;
  if (!g) return "";
  const tipo = g.tipo === "saf" ? `SAF · dono: ${esc(g.dono ?? "")} (${g.perfil === "austero" ? "austero: contrata só com caixa sobrando" : "investidor: põe dinheiro, cobra resultado"})` : g.tipo === "empresa" ? `Clube-empresa · dono: ${esc(g.dono ?? "")}` : `Associativo (dos sócios) · mandato de ${g.mandato} anos`;
  const div = s.clube.divida ?? 0;
  const e = g.eleicao, pos = Math.max(1, ordenar(s.tabela).findIndex((x) => x.clube === s.clubeId) + 1);
  const eleicao = e ? `<div class="evento-t painel" style="margin-top:10px"><p class="rotulo">Eleição para presidente · votação na semana ${e.votacao + 1}</p>
    ${(["situacao", "oposicao"] as const).map((k) => `<div class="not"><b>${esc(e[k].nome)}</b> <small class="sub">${k === "situacao" ? "situação" : "oposição"}</small><br><small>${esc(e[k].texto)}</small></div>`).join("")}
    <p class="sub">Pelas pesquisas, a situação tem ${Math.round(chanceSituacao(s, pos, s.diretoria.expectativa.pos) * 100)}% de chance. Se você apoiar quem ganhar, ganha crédito com a nova diretoria; se apoiar quem perder, fica marcado.</p>
    <div class="v-acoes">${(["situacao", "oposicao", "neutro"] as const).map((k) => `<button class="${(e.apoio ?? "") === k ? "v-ativo" : ""}" data-apoio="${k}">${k === "neutro" ? "Ficar neutro" : `Apoiar ${esc(e[k].nome.split(" ")[0])}`}</button>`).join("")}</div></div>` : "";
  const safHtml = g.tipo !== "associativo" ? (g.mensal ? `<p class="sub">O investidor paga ${curtoBrl(mensalSafT(s))}/mês (acompanha a divisão, nunca abaixo de ${curtoBrl(g.mensalMin ?? g.mensal)}).</p>` : "")
    : `<div class="painel" style="margin-top:10px"><p class="rotulo">Virar SAF</p><p class="sub">Vender o futebol do clube a um investidor: dinheiro na hora, dívida assumida e um pagamento todo mês. Os sócios votam no conselho.</p>
      ${g.votacaoSaf?.t === s.temporada ? `<p class="aviso-t ${g.tipo === "associativo" ? "erro" : "ok"}">${esc(g.votacaoSaf.texto)}</p>` : g.propostasSaf?.t === s.temporada ? g.propostasSaf.lista.map((p2, i) => `<div class="not"><b>${esc(p2.grupo)}</b> <small class="sub">${p2.perfil === "investidor" ? "investidor" : "austero"}</small><br><small>${p2.pct}% do futebol · ${curtoBrl(p2.compra)} na hora · ${curtoBrl(p2.mensal)}/mês · assume ${p2.divida}% da dívida · ${esc(p2.exige)}</small><div class="botoes" style="margin-top:6px"><button class="botao peq" data-saf-vender="${i}">Levar ao conselho</button></div></div>`).join("") : `<button class="botao sec peq" data-saf-buscar>Buscar investidor</button>`}</div>`;
  return `<p class="rotulo" style="margin-top:14px">Quem manda</p><div class="dl"><span>Presidente</span><b>${esc(g.presidente)}</b><span>Modelo</span><b>${tipo}</b>${g.proxEleicao !== undefined ? `<span>Próxima eleição</span><b>${ANO_INICIAL_T + g.proxEleicao}</b>` : ""}<span>Dívida</span><b>${div ? `${curtoBrl(div)} (${(div / base).toFixed(1).replace(".", ",")} folhas)` : "nenhuma"}</b></div>${eleicao}${safHtml}`;
}
const mensalSafT = (s: SaveTecnico) => { const g = s.governo; if (!g?.mensal) return 0; return Math.max(g.mensalMin ?? g.mensal, Math.round(g.mensal * infoLiga(s.ligaId).fLiga / Math.max(0.1, infoLiga(g.ligaVenda ?? s.ligaId).fLiga) / 1e3) * 1e3); };
/** O plano da diretoria para vários anos. */
function planoHtml(s: SaveTecnico): string {
  const p = planoDe(pacote, s), ic = { andamento: "◷", cumprida: "✔", falhou: "✕" } as const;
  return `<p class="rotulo" style="margin-top:14px">Plano da diretoria · ${ANO_INICIAL_T + p.inicio} a ${ANO_INICIAL_T + p.fim}</p>
    ${p.metas.map((m) => `<div class="not" style="display:flex;gap:8px;align-items:flex-start"><span style="font-size:16px;color:${m.status === "cumprida" ? "var(--pos)" : m.status === "falhou" ? "var(--neg, #e57373)" : "var(--ouro)"}">${ic[m.status]}</span><span>${esc(m.texto)}${m.progresso && m.status === "andamento" ? ` <small class="sub">(${m.progresso} de ${m.alvo})</small>` : ""}</span></div>`).join("")}
    ${p.avaliacoes.length ? `<p class="sub" style="margin-top:6px">Última avaliação (${ANO_INICIAL_T + p.avaliacoes[0].t}): ${esc(p.avaliacoes[0].texto)}</p>` : `<p class="sub" style="margin-top:6px">A diretoria avalia o plano em cada fim de temporada: meta cumprida dá confiança, meta perdida tira.</p>`}`;
}
const n1 = (x: number) => x.toFixed(1).replace(".", ",");
const est = (x: number) => estrelas(Math.max(0, Math.min(5, Math.round(x))));
/** A ficha de um profissional: as habilidades do departamento e quanto ele rende em cada cargo. */
function fichaStaff(m: import("../../src/tecnico/modelo").Membro, d: Dep, meu: boolean): string {
  const hs = HABS_DEP[d], outros = HABS.filter((h) => !hs.includes(h) && (m.hab?.[h] ?? 0) >= 12);
  const barra = (h: Hab) => { const v = m.hab?.[h] ?? 1; return `<div class="barra"><span>${NOME_HAB[h]}</span><b>${v}</b><i style="--v:${v * 5}%;--c:${v >= 15 ? "var(--pos)" : v >= 10 ? "var(--ouro)" : "var(--giz-2)"}"></i></div>`; };
  return `<details style="margin-top:6px"><summary class="sub" style="cursor:pointer">Ficha completa${meu ? " e cargo" : ""}</summary>
    <div class="atr" style="margin-top:6px">${[...hs, ...outros].map(barra).join("")}</div>
    <p class="rotulo" style="margin-top:8px">Rende como</p>
    ${CARGOS_DEP(d).map((c) => { const atual = m.cargo === c; return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:3px 0"><span>${CARGOS[c].nome} ${est(notaNoCargo(m, c))}</span>${meu ? (atual ? `<span class="pill bom">cargo atual</span>` : `<button class="botao sec peq" style="white-space:nowrap" data-poe-cargo="${d}|${esc(m.nome)}|${c}">Pôr aqui</button>`) : ""}</div>`; }).join("")}
  </details>`;
}
function abaComissao(s: SaveTecnico): string {
  const folha = folhaDe(s), custo = folhaStaff(s), corte = s.diretoria.corte;
  const total = DEPS.reduce((a, d) => a + (s.deps?.[d]?.length ?? 0), 0), vagas = DEPS.reduce((a, d) => a + (s.vagasDep?.[d] ?? 0), 0);
  const topo = `<section class="painel"><p class="rotulo">Estrutura do clube</p><div class="dl"><span>Pessoas</span><b>${total} de ${vagas} vagas</b><span>Custo por mês</span><b>${curtoBrl(custo)} (${Math.round((custo / Math.max(1, folha)) * 100)}% da folha do elenco)</b></div>
    <p class="sub" style="margin:6px 0 0">Como no Football Manager: seis departamentos, cada um com um chefe e a equipe dele. Cada profissional tem habilidades de 1 a 20 e você escolhe o cargo de cada um: o treinador de ataque melhora finalização e drible, o de defesa melhora marcação e posicionamento, o de bola parada faz o time marcar mais de bola parada, e assim por diante. Um bom chefe faz o departamento render até 10% mais; sem chefe, rende 12% menos. Quem libera as vagas é a diretoria.</p>
    ${corte ? `<p class="aviso-t" style="margin-top:8px">${esc(corte.texto)}</p>` : ""}</section>`;
  return topo + DEPS.map((d) => {
    const eq = s.deps?.[d] ?? [], v = s.vagasDep?.[d] ?? 1, cheio = eq.length >= v, sobra = eq.length - v;
    const chefe = eq.find((m) => m.cargo === CHEFE_DEP(d)), fc = fatorChefe(s.deps, d);
    const nomes = new Set(eq.map((m) => m.nome)), cs = candidatos(s, d).filter((c) => !nomes.has(c.nome));
    const entrega = CARGOS_DEP(d).map((c) => { const n = nivelDoCargo(s, c); return `<div class="not" style="display:flex;justify-content:space-between;gap:8px"><span><b>${CARGOS[c].nome}</b><br><small class="sub">${CARGOS[c].efeito}</small></span><span style="white-space:nowrap">${n ? `${n1(n)}` : `<span class="pill ruim">ninguém</span>`}</span></div>`; }).join("");
    const ordem = [...eq].sort((a, b) => Number(b.cargo === CHEFE_DEP(d)) - Number(a.cargo === CHEFE_DEP(d)));
    return `<details class="painel" style="margin-bottom:8px"${sobra > 0 ? " open" : ""}><summary style="cursor:pointer;display:flex;justify-content:space-between;gap:8px;align-items:center"><span><b>${NOME_DEP[d]}</b> <small class="sub">${eq.length}/${v}</small><br><small class="sub">${chefe ? `Chefe: ${esc(chefe.nome)}` : "Sem chefe"} · rende ${Math.round(fc * 100)}%</small></span><span>${chefe ? est(notaNoCargo(chefe, CHEFE_DEP(d))) : `<span class="pill ruim">sem chefe</span>`}</span></summary>
      ${sobra > 0 ? `<p class="aviso-t">Tem ${sobra} a mais do que a diretoria autoriza. Dispense alguém até o prazo.</p>` : ""}
      ${ordem.map((m) => `<div class="clube-op" style="grid-template-columns:1fr auto;align-items:start"><div><b>${esc(m.nome)}</b>${m.ex ? ` <span class="pill bom">Ex-atleta</span>` : ""}<br><small><b>${CARGOS[m.cargo!].nome}</b> ${est(notaNoCargo(m, m.cargo!))}</small><br><small class="sub">${melhoresHabs(m).map((h) => `${NOME_HAB[h]} ${m.hab![h]}`).join(" · ")}</small><br><small class="sub">${m.nac} · ${m.idade} anos · ${curtoBrl(m.salario)}/mês</small>${fichaStaff(m, d, true)}</div><button class="botao sec peq" data-staff-d="${d}" data-nome="${esc(m.nome)}">Dispensar</button></div>`).join("") || `<p class="sub">Ninguém no departamento.</p>`}
      <div class="botoes" style="margin:8px 0"><button class="botao sec peq" data-pede-vaga="${d}">Pedir mais uma vaga à diretoria</button></div>
      <details style="margin:6px 0"><summary class="rotulo" style="cursor:pointer">O que o departamento entrega</summary>${entrega}</details>
      <p class="rotulo" style="margin-top:6px">Disponíveis${cheio ? " (sem vaga livre)" : ""}</p>${cs.map((c) => `<div class="clube-op" style="grid-template-columns:1fr auto;align-items:start"><div><b>${esc(c.nome)}</b>${c.ex ? ` <span class="pill bom">Ex-atleta do clube</span>` : ""}<br><small>Especialidade: <b>${CARGOS[c.cargo!].nome}</b> ${est(notaNoCargo(c, c.cargo!))}</small><br><small class="sub">${melhoresHabs(c).map((h) => `${NOME_HAB[h]} ${c.hab![h]}`).join(" · ")}</small><br><small class="sub">${c.nac} · ${c.idade} anos · ${curtoBrl(c.salario)}/mês</small>${fichaStaff(c, d, false)}</div><button class="botao peq" data-staff-c="${d}" data-nome="${esc(c.nome)}" ${cheio ? "disabled" : ""}>Contratar</button></div>`).join("")}
    </details>`;
  }).join("") + `<p class="sub">A lista de disponíveis muda a cada dois meses. Dispensar custa 3 salários.</p>`;
}

// ------------------------------------------------------------------ partida
/** As estatísticas completas do jogo do técnico (o seu time com a escalação de verdade; o adversário completo). */
function estatDoRelatorio(p: Relatorio): string {
  const w = mundo(pacote), eu: 0 | 1 = p.souCasa ? 0 : 1, de = (meu: boolean): 0 | 1 => (meu ? eu : (1 - eu) as 0 | 1);
  const conta = (tipo: string, meu: boolean) => p.eventos.filter((e) => e.tipo === tipo && e.meu === meu).length;
  const par = (tipo: string): [number, number] => (eu === 0 ? [conta(tipo, true), conta(tipo, false)] : [conta(tipo, false), conta(tipo, true)]);
  const e = gerarEstatCompleta({
    semente: `${p.casa}|${p.fora}|${p.rodada}|${p.gc}|${p.gf}`, posse: eu === 0 ? p.posse : 100 - p.posse, forca: [w.clube[p.casa]?.forca ?? 65, w.clube[p.fora]?.forca ?? 65], placar: [p.gc, p.gf],
    gols: p.eventos.filter((x) => x.tipo === "gol").map((x) => ({ time: de(x.meu), min: x.min })), chutes: eu === 0 ? p.chutes : [p.chutes[1], p.chutes[0]],
    cartoes: { amarelos: par("amarelo"), vermelhos: par("vermelho") },
    jogadores: p.notas.map((n) => ({ id: n.id, nome: n.nome, pos: n.pos, min: n.min, gols: n.gols, assist: n.assist, nota: n.nota, time: eu })),
  });
  return estatCompletaHtml(e, [nomeClube(p.casa), nomeClube(p.fora)], eu);
}
function relatorioHtml(p: Relatorio): string {
  const minha = (e: { meu: boolean }) => e.meu;
  return `<button class="fechar" data-fechar aria-label="Fechar">×</button>
    <p class="rotulo">Rodada ${p.rodada + 1}${p.publico ? ` · público ${p.publico.toLocaleString("pt-BR")}` : ""}</p>
    <div class="prox"><div class="lado">${escudo(p.casa)}<span>${esc(nomeClube(p.casa))}</span></div><span class="placar">${p.gc} × ${p.gf}</span><div class="lado">${escudo(p.fora)}<span>${esc(nomeClube(p.fora))}</span></div></div>
    <div class="dl"><span>Posse de bola (seu time)</span><b>${p.posse}%</b><span>Finalizações</span><b>${p.chutes[0]} × ${p.chutes[1]}</b>${p.xg ? `<span>Gols esperados (xG)</span><b>${xgTexto(p.xg[0])} × ${xgTexto(p.xg[1])}</b>` : ""}${p.melhor ? `<span>Melhor em campo</span><b>${esc(p.melhor)}</b>` : ""}</div>
    <div><p class="rotulo">Lances</p>${p.eventos.some((e) => e.tipo !== "lance") ? p.eventos.filter((e) => e.tipo !== "lance").map((e) => `<div class="evento${minha(e) ? "" : " adv"}"><span class="m">${e.min}'</span><span>${e.tipo === "gol" ? "⚽" : e.tipo === "amarelo" ? "🟨" : e.tipo === "vermelho" ? "🟥" : e.tipo === "lesao" ? "✚" : "⇄"}</span><span>${esc(e.texto)}</span></div>`).join("") : `<p class="sub">Jogo sem gols nem grandes lances.</p>`}</div>
    ${p.eventos.some((e) => e.narra) ? `<details class="not"><summary>Narração do jogo</summary>${p.eventos.map((e) => `<div class="evento${minha(e) ? "" : " adv"}"><span class="m">${e.min}'</span><span>${ICO_EV[e.tipo] ?? "•"}</span><span>${esc(e.narra ?? e.texto)}</span></div>`).join("")}</details>` : ""}
    <div><p class="rotulo">Notas</p><div class="lista">${[...p.notas].sort((a, b) => b.nota - a.nota).map((n) => `<div class="lin" style="cursor:default;grid-template-columns:40px 1fr auto"><span class="num" style="font-size:13px">${n.pos}</span><span class="nm"><b>${esc(n.nome)}</b><small>${n.min}'${n.gols ? ` · ${n.gols} gol${n.gols > 1 ? "s" : ""}` : ""}${n.assist ? ` · ${n.assist} assist.` : ""}</small></span><span class="ov"><strong style="font-size:20px;color:${n.nota >= 7 ? "var(--pos)" : n.nota < 6 ? "var(--neg)" : "var(--ouro-claro)"}">${n.nota.toFixed(1).replace(".", ",")}</strong></span></div>`).join("")}</div></div>${estatDoRelatorio(p)}`;
}

// ------------------------------------------------------------------ partida ao vivo
const sobrenome = (n: string) => { const p = n.trim().split(/\s+/); return p.length > 1 ? p[p.length - 1] : n; };
const nomeCurto = (id: string) => { const i = infoClube(pacote, id) as { apelido?: string; nome?: string } | undefined; return i?.apelido || i?.nome || nomeClube(id); };
/** Estado da tela do jogo: minuto mostrado, velocidade (ms por minuto), pausa pedida e se parou no intervalo. */
const vivo = { outros: [] as ReturnType<typeof outrosDaRodada>, fala: undefined as undefined | { titulo: string; texto: string; reacoes: string[] }, mostrado: 0, vel: 260, pausado: true, pedirPausa: false, intervalo: false, passouIntervalo: false, timer: 0 as number, avisos: [] as string[] };
const ICO_EV: Record<string, string> = { gol: "⚽", amarelo: "🟨", vermelho: "🟥", lesao: "✚", sub: "⇄", lance: "▸" };
function abrirVivo(s: SaveTecnico, avisos: string[]) {
  const av = s.aoVivo; if (!av) return;
  try { vivo.outros = av.rodada === s.semana - SEMANAS_PRE_T ? outrosDaRodada(pacote, s) : []; } catch { vivo.outros = []; }
  vivo.fala = undefined; vivo.mostrado = av.minuto ?? 0; vivo.avisos = avisos; vivo.pausado = true; clearTimeout(vivo.timer); vivo.pedirPausa = false; vivo.intervalo = false; vivo.passouIntervalo = vivo.mostrado >= 45;
  const cm = infoClube(pacote, s.clubeId)?.cores ?? ["#2E7D4F", "#FFFFFF"], ca = infoClube(pacote, av.adv)?.cores ?? ["#C0392B", "#FFFFFF"];
  const parecido = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  const corAdv: [string, string] = parecido(cm[0], ca[0]) ? [ca[1] ?? "#FFFFFF", ca[0]] : [ca[0], ca[1] ?? "#FFFFFF"];
  abrir(`<div id="vivoTopo"></div><div id="campo2dBox" class="campo2d-box">${svgCampo([cm[0], cm[1] ?? "#FFFFFF"], corAdv)}</div><div id="vivo"></div>`);
  atualizarVivo(s);
}
function atualizarVivo(s: SaveTecnico) {
  const el = document.getElementById("vivo"), av = s.aoVivo;
  if (!el || !av) return;
  const m = vivo.mostrado, evs = av.eventos.filter((e) => e.min <= m);
  const gMe = evs.filter((e) => e.tipo === "gol" && e.meu).length, gAdv = evs.filter((e) => e.tipo === "gol" && !e.meu).length;
  const casa = av.souCasa ? s.clubeId : av.adv, fora = av.souCasa ? av.adv : s.clubeId, gc = av.souCasa ? gMe : gAdv, gf = av.souCasa ? gAdv : gMe;
  const fim = m >= 90, parado = vivo.pausado || fim;
  const vel = [[260, "1×"], [120, "2×"], [45, "4×"]].map(([v, t]) => `<button class="chip${vivo.vel === v ? " ativo" : ""}" data-vivo-vel="${v}">${t}</button>`).join("");
  const cansados = Object.entries(av.cond).filter(([id, c]) => c < 62 && s.esc.titulares.includes(id)).map(([id]) => s.elenco.find((a) => a.id === id)?.nome).filter(Boolean);
  const html = `<button class="fechar" data-fechar aria-label="Fechar">×</button>
    <p class="rotulo">Rodada ${av.rodada + 1} · ao vivo</p>
    <div class="relogio-vivo${parado ? "" : " correndo"}">${fim ? "Fim de jogo" : vivo.intervalo ? "Intervalo" : `${m}'`}</div>
    <div class="prox"><div class="lado">${escudo(casa)}<span>${esc(nomeClube(casa))}</span></div><span class="placar">${gc} × ${gf}</span><div class="lado">${escudo(fora)}<span>${esc(nomeClube(fora))}</span></div></div>
    <div class="barra-tempo"><i style="width:${(m / 90) * 100}%"></i><b style="left:50%"></b></div>
    ${vivo.avisos.map((x) => `<p class="sub">${esc(x)}</p>`).join("")}
    <div class="feed-vivo">${evs.length ? [...evs].reverse().map((e) => `<div class="evento${e.meu ? "" : " adv"}${e.tipo === "gol" ? " gol" : e.tipo === "lance" ? " lance" : ""}"><span class="m">${e.min}'</span><span>${ICO_EV[e.tipo] ?? "•"}</span><span>${esc(e.narra ?? e.texto)}</span></div>`).join("") : `<p class="sub">${m ? "Jogo truncado, sem grandes lances." : "A bola vai rolar."}</p>`}</div>
    ${av.xg && m >= 10 ? `<p class="sub" style="text-align:center;margin:4px 0">Gols esperados (xG): <b style="color:var(--giz)">${xgTexto(av.xg[0] * Math.min(1, m / (av.minuto || 1)))}</b> × <b style="color:var(--giz)">${xgTexto(av.xg[1] * Math.min(1, m / (av.minuto || 1)))}</b></p>` : ""}
    ${vivo.fala ? `<div class="aviso-t ok" role="status"><b>${esc(vivo.fala.titulo)}</b> ${esc(vivo.fala.texto)}${vivo.fala.reacoes.length ? `<br><small>${vivo.fala.reacoes.map(esc).join(" ")}</small>` : ""}</div>` : ""}
    ${(() => { const momento = m === 0 ? "antes" : fim ? "fim" : vivo.intervalo ? "intervalo" : ""; if (!momento || !parado || av.falas?.[momento as "antes"]) return "";
      const titulo = momento === "antes" ? "Preleção antes do jogo" : momento === "intervalo" ? "Conversa no intervalo" : "Conversa no vestiário depois do jogo";
      return `<div class="painel" style="margin:8px 0;padding:10px"><p class="rotulo" style="margin:0 0 6px">${titulo}</p><div class="chips" style="flex-wrap:wrap">${TONS.map((t) => `<button class="chip" data-prel="${momento}|${t.id}" title="${esc(t.dica)}">${esc(t.nome)}</button>`).join("")}</div><p class="sub" style="font-size:12px;margin-top:6px">O tom certo depende de ser favorito ou zebra e do placar. ${momento === "fim" ? "Mexe na moral para a semana." : "Mexe no ânimo do time em campo."}</p></div>`; })()}
    ${!fim && m > 0 ? `<div class="chips" style="flex-wrap:wrap;margin:6px 0"><span class="sub" style="font-size:12px;align-self:center">Gritar:</span>${GRITOS.map((g) => `<button class="chip" data-grito="${g.id}" title="${esc(g.dica)}">${esc(g.nome)}</button>`).join("")}</div>` : ""}
    ${vivo.outros.length ? `<details class="outros-vivo"${parado ? " open" : ""}><summary class="sub" style="cursor:pointer">Outros jogos da rodada</summary><div class="outros-grid">${vivo.outros.map((o) => { const g = o.gols.filter((x) => x.min <= m), gc = g.filter((x) => x.casa).length, gf = g.length - gc, novo = g.some((x) => x.min > m - 3);
      return `<div class="outro${novo && m > 0 && !fim ? " novo" : ""}"><span>${esc(nomeCurto(o.casa))}</span><b>${gc} × ${gf}</b><span>${esc(nomeCurto(o.fora))}</span>${g.length ? `<small class="outro-gols">${g.map((x) => `<span${x.casa ? "" : ' class="fora"'}>⚽ ${x.min}' ${esc(sobrenome(x.autor))}</span>`).join("")}</small>` : ""}</div>`; }).join("")}</div></details>` : ""}
    ${parado && !fim && cansados.length ? `<p class="sub">Cansados: ${cansados.map((n) => esc(n!)).join(", ")}.</p>` : ""}
    ${fim ? `<button class="botao grande" data-avancar>Ver o resultado</button>`
      : parado ? `<div class="botoes"><button class="botao" data-vivo-seguir>▶ ${m === 0 ? "Começar" : vivo.intervalo ? "Começar o 2º tempo" : "Continuar"}</button><button class="botao sec" data-vivo-mexer>Mexer no time e na tática</button></div>
        <p class="sub">Trocas: ${trocasNoIntervalo(s)} de ${MAX_TROCAS}. <button class="link-inline" data-avancar>Pular para o fim</button></p>`
      : `<div class="botoes"><button class="botao" data-vivo-pausa>${vivo.pedirPausa ? "Parando…" : "⏸ Pausar"}</button><div class="chips">${vel}</div></div>`}`;
  const topo = document.getElementById("vivoTopo"), k = html.indexOf('<div class="barra-tempo">');
  if (topo && k > 0) { topo.innerHTML = html.slice(0, k); el.innerHTML = html.slice(k); } else el.innerHTML = html;
  const box = document.getElementById("campo2dBox");
  if (box) {
    const vagas = FORMACOES[s.tatica.formacao], saiu = (id: string) => av.eventos.some((e) => e.min <= m && (e.tipo === "vermelho" || e.tipo === "lesao") && e.meu && e.texto.includes(s.elenco.find((a) => a.id === id)?.nome ?? "§"));
    const minhas = vagas.map((v, i) => { const id = s.esc.titulares[i], a = id ? s.elenco.find((x) => x.id === id) : undefined; return { x: v.x, y: v.y, num: a ? String(a.numero) : "", fora: !a || (av.fora.includes(a.id) && saiu(a.id)) }; });
    const lance = av.eventos.find((e) => e.min === m && (e.tipo === "gol" || e.tipo === "lance"));
    const fAdv = mundo(pacote).clube[av.adv]?.forca ?? 65, f = forcaDoTime(s.elenco, s.esc, s.tatica, s.entrosamento[s.tatica.formacao] ?? 40);
    const posse = clamp(50 + (f.meio - fAdv) * 1.1 + (s.tatica.mentalidade - 2) * 2, 30, 70);
    const numAdv = (mundo(pacote).clube[av.adv]?.elenco ?? []).slice(0, 11).map((_, i) => String([1, 2, 4, 3, 6, 7, 5, 8, 11, 9, 10][i] ?? i + 1));
    moverCampo(box, quadro(`${s.semente}|${av.rodada}|${av.adv}`, m, minhas, numAdv, posse, lance ? { meu: lance.meu, gol: lance.tipo === "gol" } : undefined), parado ? 400 : vivo.vel);
  }
}
/** Um minuto da tela: anda o relógio; quando chega no que o motor já jogou, joga mais 5 (ou para na pausa, no intervalo e no fim). */
function passoVivo(s: SaveTecnico) {
  clearTimeout(vivo.timer);
  const av = s.aoVivo, d = $("dlg") as HTMLDialogElement;
  if (!av || vivo.pausado || !d.open || !document.getElementById("vivo")) { vivo.pausado = true; return; }
  if (vivo.mostrado >= (av.minuto ?? 0)) {
    if (vivo.mostrado >= 90) { vivo.pausado = true; salvar(); atualizarVivo(s); return; }
    const noIntervalo = vivo.mostrado === 45 && !vivo.passouIntervalo;
    if (vivo.pedirPausa || noIntervalo) { vivo.pausado = true; vivo.intervalo = noIntervalo; if (noIntervalo) vivo.passouIntervalo = true; vivo.pedirPausa = false; salvar(); render(); atualizarVivo(s); return; }
    jogarAte(pacote, s, (av.minuto ?? 0) + 5); salvar();
  }
  vivo.mostrado++;
  atualizarVivo(s);
  const novo = av.eventos.some((e) => e.min === vivo.mostrado && (e.tipo === "gol" || e.tipo === "vermelho"));
  vivo.timer = window.setTimeout(() => passoVivo(s), novo ? Math.max(900, vivo.vel * 4) : vivo.vel);
}
// ------------------------------------------------------------------ render
function abrir(html: string) { $("tela").innerHTML = html; const d = $("dlg") as HTMLDialogElement; if (!d.open) d.showModal(); $("tela").querySelectorAll<HTMLElement>(".neg-log").forEach((e) => { e.scrollTop = e.scrollHeight; }); }
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
  const corpo = aba === "inicio" ? abaInicio(s) : aba === "elenco" ? abaElenco(s) : aba === "tatica" ? abaTatica(s) : aba === "liga" ? abaLiga(s) : aba === "vida" ? abaVida(s) : abaClube(s);
  app.innerHTML = `${topo(s)}${aba === "inicio" ? aviso() + corpo : `<section class="painel tela-aba">${corpo}</section>`}${nav(s)}`;
  // primeira vez como técnico: o tour pela tela de início
  if (aba === "inicio" && !s.aoVivo && !tourFeito("tecnico")) setTimeout(() => { if (!document.querySelector("dialog[open]") && document.querySelector(".topo-clube")) tour("tecnico", TOUR_TECNICO); }, 500);
}
// o "?" abre o Como jogar
document.addEventListener("click", (ev) => {
  if (!(ev.target as Element).closest("[data-ajuda]")) return;
  if (!save) abrirAjuda("Como jogar", "O básico para começar a carreira de técnico.", AJUDA_INICIO);
  else abrirAjuda("Como jogar", "A carreira de técnico, semana a semana.", AJUDA_TECNICO, () => { aba = "inicio"; render(); setTimeout(() => tour("tecnico", TOUR_TECNICO), 300); });
});

document.addEventListener("change", (ev) => {
  const t = ev.target as HTMLElement;
  if (t.dataset.mentor && save) { const r = definirMentor(save, t.dataset.mentor, (t as HTMLSelectElement).value || undefined); msg = { texto: r.msg, ok: r.ok }; salvar(); abrir(fichaJogador(save, t.dataset.mentor)); render(); return; }
  if (t.dataset.funcao && save) { (save.esc.funcoes ??= {})[t.dataset.funcao] = (t as HTMLSelectElement).value; salvar(); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
  if (t.id === "iLiga") { ligaEscolhida = (t as HTMLSelectElement).value; const y = window.scrollY; render(); window.scrollTo(0, y); }
  if (t.id === "iNac") cria.nac = (t as HTMLSelectElement).value;
  if (t.id === "iIdade") { cria.idade = +(t as HTMLInputElement).value; const y = window.scrollY; render(); window.scrollTo(0, y); }
});
document.addEventListener("input", (ev) => {
  const t = ev.target as HTMLInputElement;
  if (t.id === "iNome") cria.nome = t.value;
  if (t.id === "iIdade") { const v = document.getElementById("iIdadeV"); if (v) v.textContent = `${t.value} anos`; }
});
document.addEventListener("click", (ev) => {
  const b = (ev.target as Element).closest<HTMLElement>("button, [data-fechar]");
  // tocar no escudo de um clube (fora de um botão) abre o perfil dele
  const ver = !b && save ? (ev.target as Element).closest<SVGElement>("[data-verclube]") : null;
  if (ver && save) { abrir(perfilClubeT(save, ver.dataset.verclube!)); salvar(); return; }
  if (!b) return;
  const d = b.dataset;
  const y = window.scrollY, redesenhar = (manterMsg = true) => { if (!manterMsg) msg = undefined; salvar(); render(); window.scrollTo(0, y); };
  if (d.fechar !== undefined) { fechar(); return; }
  if (!save && (d.pausa !== undefined || d.origem || d.nivelex || d.filo || d.perso || d.ponto)) {
    if (d.pausa !== undefined) pausaEscolhida = +d.pausa;
    if (d.origem) { cria.origem = d.origem as Origem; cria.idade = Math.max(cria.idade, ORIGENS[cria.origem].idadeMin); }
    if (d.nivelex) cria.nivelEx = d.nivelex as NivelEx;
    if (d.filo) cria.filosofia = d.filo as Filosofia;
    if (d.perso) cria.personalidade = d.perso as Personalidade;
    if (d.ponto) { const [k, n] = d.ponto.split("|"); const a = k as AtribT; cria.extra[a] = Math.max(0, (cria.extra[a] ?? 0) + (+n > 0 ? Math.min(1, livresCria()) : -1)); }
    const y0 = window.scrollY; render(); window.scrollTo(0, y0); return;
  }
  if (d.assumir) {
    const jog = ler<SaveJogador>("mycarrerinha:save");
    const ex = d.ex === "1" && jog?.carreira?.encerrada ? jog : null;
    if (anterior) { save = assumirNovoClube(pacote, anterior, d.assumir); anterior = null; aba = "inicio"; msg = undefined; salvar(); nuvem.agora(); render(); window.scrollTo(0, 0); return; }
    const dados = dadosCriados(ex);
    save = novaCarreiraTecnico(pacote, { ...dados, ...(ex ? { vindoDe: vindoDoJogador(ex, pausaEscolhida) } : {}) }, d.assumir);
    if (ex && pausaEscolhida) save.tecnico.reputacao = Math.min(100, save.tecnico.reputacao + 3 * pausaEscolhida);
    aba = "inicio"; msg = undefined; salvar(); nuvem.agora(); render(); window.scrollTo(0, 0); return;
  }
  if (!save) return;
  const s = save;
  if (d.aba) { aba = d.aba as typeof aba; msg = undefined; selEsc = undefined; if (d.sub) { const [k, v] = d.sub.split(":"); sub[k] = v; } fechar(); salvar(); render(); window.scrollTo(0, 0); return; }
  if (d.sub) { const [k, v] = d.sub.split(":"); sub[k] = v; msg = undefined; render(); return; }
  if (d.propneg) { const r = responderPropostaNegT(s, d.propneg === "1"); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.decide) { const [u, k] = d.decide.split("|"); const r = decidirMesT(s, u, k as DecisaoMes); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.franq) { const r = franquiaT(s, d.franq); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.emp) { const [u, k] = d.emp.split("|"); const r = agirEmpresaT(s, u, k as AcaoEmpresa); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.abrir) { const r = abrirEmpresaT(s, d.abrir as TipoEmpresa); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.inv) { const [k, v] = d.inv.split("|"); const r = aplicarT(s, k as TipoInvest, +v); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.assessor) { const r = assessorT(s, d.assessor === "1"); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.vis) { const [k, v] = d.vis.split("|"); aparenciaT(s); const ap = s.tecnico.aparencia!; const vis = (s.tecnico.visual ??= { roupa: "polo", cor: "clube" });
    if (k === "roupa") vis.roupa = v; else if (k === "cor") vis.cor = v; else if (k === "corCabelo") ap.corCabelo = +v; else if (k === "rugas") ap.rugas = v === "1"; else ap[k] = v;
    redesenhar(); return; }
  if (d.casa !== undefined) { casaT(pacote, s); salvar(); location.href = "casa.html?modo=tecnico"; return; }
  if (d.vf) { const [id, ac] = d.vf.split("|"); const r = agirFamiliaT(pacote, s, id, ac as AcaoFamilia, !!proximoJogo(s)?.souCasa); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.vp) { const [id, ac] = d.vp.split("|"); const r = agirParT(pacote, s, id, ac as AcaoNamoro); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.vfi) { const [i, ac] = d.vfi.split("|"); const r = agirFilhoT(pacote, s, +i, ac as AcaoFilho); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.vx) { const [id, ac] = d.vx.split("|"); const r = agirExT(pacote, s, id, ac as AcaoEx); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.vc) { const [id, sim] = d.vc.split("|"); const r = curtirT(pacote, s, id, sim === "1"); msg = sim === "1" ? { texto: r.msg, ok: r.ok } : undefined; redesenhar(); return; }
  if (d.perfil) { abrir(perfilClubeT(s, d.perfil)); salvar(); return; }
  if (d.passo) { const [id, delta] = d.passo.split("|"), el = document.getElementById(id) as HTMLInputElement | null; if (el) { const v = Math.max(0, (+el.value.replace(/\D/g, "") || 0) + +delta); el.value = v.toLocaleString("pt-BR"); } return; }
  if (d.rvlista) { rvLista = d.rvlista as ListaRevista; render(); return; }
  if (d.rvano) { rvAno = d.rvano === "previa" ? "previa" : +d.rvano; render(); return; }
  if (d.ligaemp) { ligaEmprego = d.ligaemp; render(); return; }
  if (d.filtroemp) { filtroEmprego = d.filtroemp as typeof filtroEmprego; render(); return; }
  if (d.int) { const [id, disc] = d.int.split("|"); const r = declararInteresse(pacote, s, id, disc === "1"); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.cand) { const r = candidatar(pacote, s, d.cand); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.resp && s.negociacaoT) { const [q, o] = d.resp.split("|"); s.negociacaoT.respostas[q] = o; salvar(); abrir(negociacaoHtml(s)); return; }
  if (d.entrevista !== undefined && s.negociacaoT) { const r = responderEntrevista(pacote, s, s.negociacaoT.respostas); notaEntrevista = r.texto; negAnos = s.negociacaoT.oferta.anos; negMulta = s.negociacaoT.oferta.multaMeses; salvar(); abrir(negociacaoHtml(s)); return; }
  if (d.neganos) { negAnos = +d.neganos; const v = lerValor("negSal"); if (v && s.negociacaoT) s.negociacaoT.oferta = { ...s.negociacaoT.oferta, salario: v }; abrir(negociacaoHtml(s)); return; }
  if (d.negmulta) { negMulta = +d.negmulta; const v = lerValor("negSal"); if (v && s.negociacaoT) s.negociacaoT.oferta = { ...s.negociacaoT.oferta, salario: v }; abrir(negociacaoHtml(s)); return; }
  if (d.negaceitar !== undefined && s.negociacaoT) { const o = s.negociacaoT.oferta, r = negociarContrato(pacote, s, o); if (r.fechou) fecharContrato(s, r.fechou, r.msg); return; }
  if (d.negpropor !== undefined && s.negociacaoT) {
    const r = negociarContrato(pacote, s, { salario: lerValor("negSal") || s.negociacaoT.oferta.salario, anos: negAnos, multaMeses: negMulta });
    if (r.fechou) { fecharContrato(s, r.fechou, r.msg); return; }
    if (r.desistiu) { fechar(); msg = { texto: r.msg, ok: false }; salvar(); render(); return; }
    notaEntrevista = r.msg; negMulta = s.negociacaoT?.oferta.multaMeses ?? negMulta; salvar(); abrir(negociacaoHtml(s)); return;
  }
  if (d.negdesistir !== undefined) { s.negociacaoT = undefined; fechar(); msg = { texto: "Você saiu da reunião sem fechar. A proposta continua de pé até o prazo acabar.", ok: true }; salvar(); render(); return; }
  if (d.emprego !== undefined) {
    if (d.emprego === "1" && s.ofertaEmprego) { if (s.negociacaoT?.clubeId !== s.ofertaEmprego.clubeId) { abrirNegociacao(pacote, s, s.ofertaEmprego.clubeId); notaEntrevista = undefined; negAnos = 2; negMulta = 6; } salvar(); abrir(negociacaoHtml(s)); return; }
    const r = recusarEmprego(pacote, s); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return;
  }
  if (d.evt) { const r = responderEvento(pacote, s, d.evt); msg = r ? { texto: r, ok: true } : undefined; redesenhar(); return; }
  if (d.familia) { const r = trazerFamiliar(pacote, s, d.familia); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.filtro) { filtro = d.filtro; render(); return; }
  if (d.mpAbrir) { msgNeg = undefined; if (!abrirMesaPatroUI(s, d.mpAbrir)) { msg = { texto: "Essa oferta não está mais na mesa.", ok: false }; render(); } salvar(); return; }
  if (d.mpEnviar || d.mpAceitar) {
    const chave = (d.mpEnviar || d.mpAceitar)!, [tipo, cota, marca] = chave.split("|"), pac = d.mpAceitar ? "aceitar" as const : lerPacotePatro();
    if (pac !== "aceitar" && !pac.fixo) { msgNeg = { texto: "Digite o valor fixo por mês.", ok: false }; abrirMesaPatroUI(s, chave); return; }
    let r: { ok: boolean; msg: string; luvas?: number };
    if (tipo === "s") r = negociarSel(pacote, s, cota as CotaSel, marca, pac);
    else { const nome = (document.getElementById("mp-nome") as HTMLSelectElement | null)?.value; r = negociarPatro(pacote, s, cota as Cota, marca, pac, nome ? { nome } : undefined); if (r.ok && r.luvas) creditar(s, "Luvas de patrocínio", r.luvas); }
    salvar();
    if (r.ok || !abrirMesaPatroUI(s, chave)) { fechar(); msgNeg = undefined; msg = { texto: r.ok && r.luvas ? `${r.msg} As luvas já entraram no caixa.` : r.msg, ok: r.ok }; render(); return; }
    msgNeg = { texto: r.msg, ok: !/saiu/.test(r.msg) }; abrirMesaPatroUI(s, chave); render(); return;
  }
  if (d.patroCor !== undefined) { const [cota, cor] = d.patroCor.split("|"); corDoPatro(pacote, s, cota as Cota, cor || (undefined as unknown as string)); if (!cor) delete patrociniosDe(pacote, s)[cota as Cota]!.cor; redesenhar(); return; }
  if (d.patroForma) { const [cota, fm] = d.patroForma.split("|"); formaDoPatro(pacote, s, cota as Cota, fm as "logo" | "nome"); redesenhar(); return; }
  if (d.avancar !== undefined || d.avancarTatica !== undefined) {
    const r = avancarSemana(pacote, s);
    // virou a temporada com pré-contrato assinado: assume o clube novo
    if (s.novoClube && s.semana === 0 && !s.demitido) { const nome = nomeClube(s.novoClube); save = assumirNovoClube(pacote, s, s.novoClube); r.fimDeTemporada = `${r.fimDeTemporada ?? ""} Começa a sua passagem pelo ${nome}.`.trim(); }
    msg = undefined; salvar(); render(); window.scrollTo(0, 0);
    let copaHtml = "";
    if (r.partidaCopa) { const rc = relatorioHtml(r.partidaCopa).replace(/<p class="rotulo">Rodada \d+/, `<p class="rotulo">${esc(r.partidaCopa.copa)}`); if (!r.partida) { abrir(rc + (r.eventos.length ? `<div><p class="rotulo">Na semana</p>${r.eventos.map((e) => `<div class="not">${esc(e)}</div>`).join("")}</div>` : "")); return; } copaHtml = `${rc.replace(/<button class="fechar"[^>]*>×<\/button>/, "")}<hr style="border:0;border-top:1px solid var(--linha);margin:14px 0">`; }
    if (r.partida) abrir(relatorioHtml(r.partida).replace(/(<button class="fechar"[^>]*>×<\/button>)/, `$1${copaHtml}`) + (r.eventos.length > 1 ? `<div><p class="rotulo">Na semana</p>${r.eventos.slice(1).map((e) => `<div class="not">${esc(e)}</div>`).join("")}</div>` : "") + (r.fimDeTemporada ? `<div class="aviso-t ok">${esc(r.fimDeTemporada)}</div>` : ""));
    else if (r.fimDeTemporada || r.eventos.length) msg = { texto: [r.fimDeTemporada, ...r.eventos].filter(Boolean).join(" "), ok: true }, render();
    return;
  }
  if (d.verPartida !== undefined && s.ultima) { abrir(relatorioHtml(s.ultima)); return; }
  if (d.vivo !== undefined) { const r = s.aoVivo ? { avisos: [] } : iniciarPartida(pacote, s); salvar(); render(); if (r) abrirVivo(s, r.avisos); return; }
  if (d.vivoPausa !== undefined) { vivo.pedirPausa = true; atualizarVivo(s); return; }
  if (d.prel) { const [mo, tom] = d.prel.split("|"); const r = prelecao(pacote, s, mo as "antes", tom as Tom); vivo.fala = { titulo: TONS.find((t) => t.id === tom)!.nome + ":", texto: r.texto, reacoes: r.reacoes }; salvar(); atualizarVivo(s); return; }
  if (d.grito) { const r = gritar(s, d.grito as Grito); vivo.fala = { titulo: GRITOS.find((g) => g.id === d.grito)!.nome, texto: r.texto, reacoes: [] }; salvar(); atualizarVivo(s); return; }
  if (d.vivoSeguir !== undefined) { vivo.fala = undefined; vivo.pausado = false; vivo.pedirPausa = false; vivo.intervalo = false; atualizarVivo(s); passoVivo(s); return; }
  if (d.vivoVel) { vivo.vel = +d.vivoVel; atualizarVivo(s); return; }
  if (d.vivoMexer !== undefined) { vivo.pausado = true; fechar(); aba = "tatica"; render(); window.scrollTo(0, 0); return; }
  if (d.avancarTatica !== undefined) { aba = "inicio"; fechar(); }
  if (d.licenca !== undefined) { const r = estudarLicenca(s); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.aulas) { const r = pagarAulas(s, d.aulas); msg = { texto: r.msg, ok: r.ok }; salvar(); abrir(fichaJogador(s, d.aulas)); render(); return; }
  if (d.curso) { const r = recomendarCurso(s, d.curso); msg = { texto: r.msg, ok: r.ok }; salvar(); abrir(fichaJogador(s, d.curso)); render(); return; }
  if (d.jog) { msg = undefined; abrir(fichaJogador(s, d.jog)); return; }
  if (d.conv && d.id) { const r = conversar(s, d.id, d.conv as Conversa); msg = { texto: r.msg, ok: r.ok }; salvar(); abrir(fichaJogador(s, d.id)); render(); return; }
  if (d.renovar && d.id) { const r = renovar(pacote, s, d.id, +d.renovar); msg = { texto: r.msg, ok: r.ok }; salvar(); abrir(fichaJogador(s, d.id)); render(); return; }
  if (d.dispensar !== undefined && d.id) { const r = dispensar(s, d.id); msg = { texto: r.msg, ok: r.ok }; if (r.ok) { fechar(); prepararMundo(pacote, s); redesenhar(); } else abrir(fichaJogador(s, d.id)); return; }
  if (d.sel) {
    if (!selEsc) selEsc = d.sel;
    else if (selEsc === d.sel) selEsc = undefined;
    else { const r = moverEscalacao(s, selEsc, d.sel); selEsc = undefined; msg = r.msg ? { texto: r.msg, ok: r.ok } : undefined; }
    redesenhar(false); return;
  }
  if (d.melhorTime !== undefined) { s.esc = { ...melhorEscalacao(s.elenco.filter((a) => !a.emprestadoDe), s.tatica.formacao), capitao: s.esc.capitao, funcoes: s.esc.funcoes } as typeof s.esc; msg = { texto: "O auxiliar montou o melhor time disponível.", ok: true }; redesenhar(); return; }
  if (d.salvarEsc !== undefined) { const l = (s.escSalvas ??= []); if (l.length >= 4) l.shift(); l.push({ nome: `${s.tatica.formacao} #${l.length + 1}`, formacao: s.tatica.formacao, titulares: [...s.esc.titulares], reservas: [...s.esc.reservas], tatica: { ...s.tatica } }); msg = { texto: "Escalação salva. Use os botões para trocar entre as salvas.", ok: true }; redesenhar(); return; }
  if (d.usarEsc !== undefined) { const e = s.escSalvas?.[+d.usarEsc]; if (e) { s.tatica = { ...e.tatica }; s.entrosamento[e.formacao] ??= 40; s.esc.titulares = e.titulares.map((id) => (id && s.elenco.some((a) => a.id === id && disponivel(a)) ? id : null)); s.esc.reservas = e.reservas.filter((id) => s.elenco.some((a) => a.id === id)); msg = { texto: `Escalação "${e.nome}" carregada. Vagas de quem saiu ou está fora ficam vazias.`, ok: true }; } redesenhar(); return; }
  if (d.apagarEsc !== undefined) { s.escSalvas = (s.escSalvas ?? []).filter((_, i) => i !== +d.apagarEsc!); redesenhar(); return; }
  if (d.selCancelar !== undefined) { selEsc = undefined; redesenhar(false); return; }
  if (d.banco) { const r = alternarBanco(s, d.banco); msg = r.msg ? { texto: r.msg, ok: r.ok } : undefined; redesenhar(false); return; }
  if (d.vaga !== undefined) { selEsc = undefined; abrir(escolherVaga(s, +d.vaga)); return; }
  if (d.escolher !== undefined && d.i !== undefined) {
    if (s.aoVivo && d.escolher && !(s.aoVivo.emCampo ?? []).includes(d.escolher) && !s.esc.titulares.includes(d.escolher) && trocasNoIntervalo(s) >= MAX_TROCAS) { msg = { texto: `Já foram as ${MAX_TROCAS} trocas.`, ok: false }; fechar(); redesenhar(); return; }
    trocarNaVaga(s, +d.i, d.escolher || null); fechar(); redesenhar(false); return;
  }
  if (d.form) { if (s.aoVivo) reorganizarNoIntervalo(s, d.form); else mudarFormacao(s, d.form); redesenhar(false); return; }
  if (d.melhor !== undefined && !s.aoVivo) { s.esc = melhorEscalacao(s.elenco, s.tatica.formacao); redesenhar(false); return; }
  if (d.tat && d.v !== undefined) { const k = d.tat as keyof typeof s.tatica; (s.tatica as unknown as Record<string, number | boolean>)[k] = k === "contraAtaque" ? d.v === "1" : +d.v; redesenhar(false); return; }
  if (d.treino && d.v) { (s.treino as unknown as Record<string, string>)[d.treino] = d.v; redesenhar(false); return; }
  if (d.ped) { const r = pedirDiretoria(s, d.ped as Pedido, pacote); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.staffC && d.nome) { const r = contratarStaff(s, d.staffC as Dep, d.nome); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.staffD) { const r = demitirStaff(s, d.staffD as Dep, d.nome); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.albumT !== undefined) { abrirAlbumT(s); return; }
  if (d.selAceitar !== undefined) { const r = aceitarSelecao(pacote, s); msg = { texto: r.msg, ok: r.ok }; aba = "liga"; sub.liga = "selecao"; redesenhar(); return; }
  if (d.selRecusar !== undefined) { s.ofertaSel = undefined; msg = { texto: "Você agradeceu e recusou a seleção.", ok: true }; redesenhar(); return; }
  if (d.irSel !== undefined) { aba = "liga"; sub.liga = "selecao"; redesenhar(); return; }
  if (d.intSel) { const r = declararInteresseSel(pacote, s, d.intSel); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (s.selecao) {
    const sel = s.selecao;
    if (d.selForm) { sel.formacao = d.selForm as Formacao; redesenhar(); return; }
    if (d.selEstilo) { sel.estilo = d.selEstilo as Estilo; redesenhar(); return; }
    if (d.selAuto !== undefined) { sel.convocados = convocarMelhores(poolSel(pacote, s, sel.pais)); sel.titulares = []; msg = { texto: "Lista refeita com os melhores de cada posição.", ok: true }; redesenhar(); return; }
    if (d.selTit) { sel.titulares = sel.titulares.includes(d.selTit) ? sel.titulares.filter((k) => k !== d.selTit) : [...sel.titulares, d.selTit]; redesenhar(); return; }
    if (d.selDesc) { sel.convocados = sel.convocados.filter((k) => k !== d.selDesc); sel.titulares = sel.titulares.filter((k) => k !== d.selDesc); redesenhar(); return; }
    if (d.selPool !== undefined) { abrir(poolSelHtml(s)); return; }
    if (d.selConv) { if (sel.convocados.length < 23 && !sel.convocados.includes(d.selConv)) sel.convocados.push(d.selConv); salvar(); abrir(poolSelHtml(s)); render(); return; }
    if (d.selSair !== undefined) { const r = deixarSelecao(pacote, s); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  }
  if (d.estLug || d.estPad || d.estGra || d.estPar) { if (d.estPar) projEst.parceria = d.estPar === "1"; const nm = (document.getElementById("iNomeEst") as HTMLInputElement | null)?.value; if (nm !== undefined) projEst.nome = nm; if (d.estLug) projEst.lugares = +d.estLug; if (d.estPad) projEst.padrao = d.estPad as PadraoEstadio; if (d.estGra) projEst.gramado = d.estGra as GramadoTipo; redesenhar(); return; }
  if (d.show) { const [id, sim] = d.show.split("|"); const r = responderShow(s, id, sim === "1"); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.estIniciar !== undefined) { const nm = (document.getElementById("iNomeEst") as HTMLInputElement | null)?.value; if (nm !== undefined) projEst.nome = nm; const r = iniciarEstadio(pacote, s, projEst); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.grama) { const r = ajustarGrama(s, +d.grama, pacote); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.foco) { const r = mudarFoco(s, d.foco); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.observar) { const r = observar(s, d.observar, d.clube || undefined); msg = { texto: r.msg, ok: r.ok }; if (($("dlg") as HTMLDialogElement).open && d.clube) { msg = undefined; msgNeg = { texto: r.msg, ok: r.ok }; salvar(); abrir(negociarHtml(s, d.observar, d.clube)); render(); return; } redesenhar(); return; }
  if (d.poeCargo) { const [dep, nome, cargo] = d.poeCargo.split("|"); const r = mudarCargo(s, dep as Dep, nome, cargo as Cargo); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.pedeVaga) { const r = pedirVaga(s, d.pedeVaga as Dep); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.apoio && s.governo?.eleicao) { s.governo.eleicao.apoio = d.apoio as "situacao" | "oposicao" | "neutro"; msg = { texto: d.apoio === "neutro" ? "Você ficou neutro na eleição." : `Você declarou apoio a ${s.governo.eleicao[d.apoio as "situacao" | "oposicao"].nome}.`, ok: true }; redesenhar(); return; }
  if (d.mpos !== undefined) { filtroMercado.pos = (d.mpos || undefined) as PosT | undefined; render(); return; }
  if (d.midade !== undefined) { filtroMercado.idadeMax = +d.midade || undefined; render(); return; }
  if (d.mliga !== undefined) { filtroMercado.minhaLiga = d.mliga === "1"; render(); return; }
  if (d.malc !== undefined) { filtroMercado.alcance = d.malc === "1"; render(); return; }
  if (d.alvo && d.clube) { msgNeg = undefined; abrir(negociarHtml(s, d.alvo, d.clube)); return; }
  if (d.preencher && d.v) { const el = document.getElementById(d.preencher) as HTMLInputElement | null; if (el) { el.value = naTela(+d.v); el.focus(); } return; }
  if (d.venda) { msg = { texto: alternarVenda(s, d.venda), ok: true }; salvar(); abrir(fichaJogador(s, d.venda)); render(); return; }
  if (d.jovem) { msg = undefined; abrir(fichaJovem(s, d.jovem)); return; }
  if (d.penOk || d.penNao) { const r = d.penOk ? aprovar(s, d.penOk) : reprovar(s, d.penNao!); msg = { texto: r.msg, ok: r.ok }; salvar(); render(); return; }
  if (d.jovPro || d.jovC2 || d.jovC1 || d.jovFora) {
    const id = (d.jovPro || d.jovC2 || d.jovC1 || d.jovFora)!, r = d.jovPro ? subirProfissional(s, id) : d.jovC2 ? subirParaCat2(s, id) : d.jovC1 ? descerParaCat1(s, id) : dispensarJovem(s, id);
    msg = { texto: r.msg, ok: r.ok }; salvar();
    if (r.ok && (d.jovPro || d.jovFora)) { fechar(); if (d.jovPro) s.esc = melhorEscalacao(s.elenco, s.tatica.formacao); } else abrir(fichaJovem(s, id));
    render(); return;
  }
  if (d.mandarBase) { const r = mandarParaBase(s, d.mandarBase); msg = { texto: r.msg, ok: r.ok }; salvar(); if (r.ok) { fechar(); sub.elenco = "base"; } else abrir(fichaJogador(s, d.mandarBase)); render(); return; }
  if (d.prometer && d.id) { const r = prometerT(s, d.id, d.prometer as TipoPromessa); msg = { texto: r.msg, ok: r.ok }; salvar(); abrir(fichaJogador(s, d.id)); render(); return; }
  if (d.tind) { const [id, f] = d.tind.split("|"), a = s.elenco.find((x) => x.id === id); if (a) { a.treinoInd = { ...a.treinoInd, foco: (f || undefined) as "fisico" | undefined }; salvar(); abrir(fichaJogador(s, id)); } return; }
  if (d.tpos) { const [id, p] = d.tpos.split("|"), a = s.elenco.find((x) => x.id === id); if (a) { a.treinoInd = { ...a.treinoInd, pos: (p || undefined) as PosT | undefined }; salvar(); abrir(fichaJogador(s, id)); } return; }
  if (d.empParc) { const [id, pid] = d.empParc.split("|"); const r = emprestarAoParceiro(pacote, s, id, pid); msg = { texto: r.msg, ok: r.ok }; salvar(); if (r.ok) fechar(); else abrir(fichaJogador(s, id)); render(); return; }
  if (d.fnec) { const [k, v] = d.fnec.split("|"); (formNec as unknown as Record<string, string | number>)[k] = k === "idadeMax" ? +v : v; render(); return; }
  if (d.anunciar !== undefined) { const r = anunciar(s, { ...formNec }); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.tirarNec) { tirarAnuncio(s, d.tirarNec); redesenhar(); return; }
  if (d.oferecer) { const sel = document.getElementById(`proc-${d.oferecer}`) as HTMLSelectElement | null; const r = oferecerJogador(pacote, s, d.oferecer, sel?.value ?? ""); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.parceria) { const r = firmarParceria(pacote, s, d.parceria); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.safBuscar !== undefined) { const r = buscarInvestidor(s); msg = { texto: r.msg || "Propostas na mesa.", ok: r.ok }; redesenhar(); return; }
  if (d.safVender) { const r = venderSaf(s, +d.safVender); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.empLista) { msg = { texto: alternarEmprestimo(s, d.empLista), ok: true }; salvar(); abrir(fichaJogador(s, d.empLista)); render(); return; }
  // mesa de transferência
  const reabrirNeg = (id: string) => { const k = id.indexOf("|"); abrir(negociarHtml(s, id.slice(k + 1), id.slice(0, k))); };
  const fimNeg = (id: string, r: { ok: boolean; msg: string }) => {
    salvar();
    if (!s.negs?.[id]) { fechar(); msgNeg = undefined; msg = { texto: r.msg, ok: r.ok }; if (r.ok) sub.elenco = "jogadores"; render(); return; }
    msgNeg = { texto: r.msg, ok: r.ok || /contraproposta|aceitou/.test(r.msg) }; reabrirNeg(id); render();
  };
  if (d.tnAbrir && d.tnNome && d.tnClube) {
    const n = d.tnAbrir === "livre" ? abrirLivre(pacote, s, d.tnNome) : abrirNeg(pacote, s, d.tnNome, d.tnClube, d.tnAbrir as "compra" | "emprestimo");
    msgNeg = "erro" in n ? { texto: n.erro, ok: false } : undefined; salvar(); abrir(negociarHtml(s, d.tnNome, d.tnClube)); return;
  }
  if (d.tnVer) { msgNeg = undefined; reabrirNeg(d.tnVer); return; }
  if (d.tnDesistir) { desistir(s, d.tnDesistir); msgNeg = undefined; salvar(); reabrirNeg(d.tnDesistir); render(); return; }
  if (d.tnAceitarClube) { fimNeg(d.tnAceitarClube, aceitarContraClube(pacote, s, d.tnAceitarClube)); return; }
  if (d.tnAceitarJog) { fimNeg(d.tnAceitarJog, aceitarContraJogador(pacote, s, d.tnAceitarJog)); return; }
  if (d.tnClubeEnv) {
    const v = (id: string) => (document.getElementById(id) as HTMLSelectElement | null)?.value ?? "";
    const p: PacoteTransf = { avista: lerValor("tn-av"), parcelado: lerValor("tn-pa"), parcelas: +v("tn-pn") as 0 | 2 | 3, bonus: lerValor("tn-bo"), revenda: +v("tn-rv"), ...(v("tn-tr") ? { troca: v("tn-tr") } : {}) };
    if (p.parcelado && !p.parcelas) p.parcelas = 2;
    fimNeg(d.tnClubeEnv, proporClube(pacote, s, d.tnClubeEnv, p)); return;
  }
  if (d.tnEmpEnv) {
    const v = (id: string) => (document.getElementById(id) as HTMLSelectElement | null)?.value ?? "";
    fimNeg(d.tnEmpEnv, proporEmprestimo(pacote, s, d.tnEmpEnv, { taxa: lerValor("tn-tx"), salarioPct: +v("tn-sp"), opcao: lerValor("tn-op"), obrigacao: !!(document.getElementById("tn-ob") as HTMLInputElement | null)?.checked })); return;
  }
  if (d.tnJogEnv) {
    const n = s.negs?.[d.tnJogEnv], v = (id: string) => (document.getElementById(id) as HTMLSelectElement | null)?.value ?? "";
    if (!n?.jogador) return;
    const sal = lerValor("tn-sal"); if (!sal) { msgNeg = { texto: "Digite o salário.", ok: false }; reabrirNeg(d.tnJogEnv); return; }
    fimNeg(d.tnJogEnv, proporJogador(pacote, s, d.tnJogEnv, { salario: sal, anos: +(v("tn-an") || 1), luvas: lerValor("tn-lu"), multa: lerValor("tn-mu"), papel: (v("tn-pp") || n.jogador.quer.papel) as Papel, comissao: lerValor("tn-co"), bonusJogo: lerValor("tn-bj"), bonusGol: lerValor("tn-bg") })); return;
  }
  // propostas pelos seus jogadores
  if (d.pvAceitar) { const r = aceitarVenda(pacote, s, d.pvAceitar); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.pvRecusar) { const r = recusarVenda(pacote, s, d.pvRecusar); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.pvLeilao) { const r = leilao(pacote, s, d.pvLeilao); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.pvContra && d.i !== undefined) {
    const i = d.i, v = (id: string) => (document.getElementById(id) as HTMLSelectElement | null)?.value ?? "";
    const r = contraVenda(pacote, s, d.pvContra, { avista: lerValor(`pv-av-${i}`), parcelado: lerValor(`pv-pa-${i}`), parcelas: +v(`pv-pn-${i}`) as 0 | 2 | 3, bonus: lerValor(`pv-bo-${i}`), revenda: +v(`pv-rv-${i}`) });
    msg = { texto: r.msg, ok: r.ok }; redesenhar(); return;
  }
  if (d.oeAceitar) { const r = responderEmp(pacote, s, d.oeAceitar, "aceitar"); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.oeRecusar) { const r = responderEmp(pacote, s, d.oeRecusar, "recusar"); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.oeContra && d.i !== undefined) {
    const i = d.i, ck = (id: string) => !!(document.getElementById(id) as HTMLInputElement | null)?.checked;
    const r = responderEmp(pacote, s, d.oeContra, "contra", { salarioPct: +((document.getElementById(`oe-sp-${i}`) as HTMLSelectElement | null)?.value ?? 50), taxa: lerValor(`oe-tx-${i}`), semOpcao: ck(`oe-so-${i}`), titular: ck(`oe-ti-${i}`) });
    msg = { texto: r.msg, ok: r.ok }; redesenhar(); return;
  }
  if (d.opc) { const [id, sim] = d.opc.split("|"); const r = decidirOpcao(pacote, s, id, sim === "1"); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.irPropostas !== undefined) { aba = "elenco"; sub.elenco = "propostas"; render(); window.scrollTo(0, 0); return; }
  if (d.recomecar !== undefined) { anterior = s; save = null; render(); window.scrollTo(0, 0); return; }
  if (d.apagar !== undefined) {
    if (!b.dataset.certeza) { b.dataset.certeza = "1"; b.textContent = "Toque de novo para apagar"; return; }
    void apagarDaNuvem(chaveNuvem("tec", s.semente));
    try { localStorage.removeItem(CHAVE_TECNICO); } catch { /* ok */ }
    save = null; render(); return;
  }
});

if (save) prepararMundo(pacote, save);
render();
void (async () => { if (save && (await nuvemDisponivel())) nuvem.agora(); })();

// ------------------------------------------------------------------ arrastar para escalar (campo e lista)
{
  let arr: { de: string; x0: number; y0: number; fantasma?: HTMLElement; alvo?: HTMLElement } | undefined, ignorarClique = false;
  const alvoEm = (x: number, y: number) => { const el = document.elementFromPoint(x, y) as HTMLElement | null; return el?.closest<HTMLElement>("[data-sel]") ?? undefined; };
  document.addEventListener("pointerdown", (ev) => {
    const el = (ev.target as HTMLElement).closest<HTMLElement>("[data-sel]");
    if (!el || !save || aba !== "tatica") return;
    // no campo arrasta direto; na lista, pela etiqueta da posição (o resto da linha rola a tela no celular)
    if (!el.closest(".campo") && ev.pointerType !== "mouse" && !(ev.target as HTMLElement).closest(".pos-chip")) return;
    arr = { de: el.dataset.sel!, x0: ev.clientX, y0: ev.clientY };
  });
  document.addEventListener("pointermove", (ev) => {
    if (!arr) return;
    if (!arr.fantasma) {
      if (Math.hypot(ev.clientX - arr.x0, ev.clientY - arr.y0) < 10) return;
      const orig = document.querySelector<HTMLElement>(`[data-sel="${CSS.escape(arr.de)}"]`), f = document.createElement("div");
      f.className = "fantasma-esc"; f.textContent = orig?.querySelector(".nomev, .nm b")?.textContent ?? orig?.textContent?.trim().slice(0, 18) ?? "";
      document.body.appendChild(f); arr.fantasma = f; document.body.classList.add("arrastando");
    }
    ev.preventDefault();
    arr.fantasma.style.transform = `translate(${ev.clientX - 40}px, ${ev.clientY - 30}px)`;
    const a = alvoEm(ev.clientX, ev.clientY);
    if (a !== arr.alvo) { arr.alvo?.classList.remove("alvo-esc"); arr.alvo = a && a.dataset.sel !== arr.de ? a : undefined; arr.alvo?.classList.add("alvo-esc"); }
  }, { passive: false });
  const soltar = () => {
    if (!arr) return;
    const a = arr, s = save;
    arr = undefined; document.body.classList.remove("arrastando"); a.fantasma?.remove(); a.alvo?.classList.remove("alvo-esc");
    if (!a.fantasma || !s) return;
    ignorarClique = true; setTimeout(() => { ignorarClique = false; }, 50);
    if (!a.alvo?.dataset.sel) return;
    const r = moverEscalacao(s, a.de, a.alvo.dataset.sel); selEsc = undefined; msg = r.msg ? { texto: r.msg, ok: r.ok } : undefined;
    const y = window.scrollY; salvar(); render(); window.scrollTo(0, y);
  };
  document.addEventListener("pointerup", soltar); document.addEventListener("pointercancel", soltar);
  document.addEventListener("click", (ev) => { if (ignorarClique) { ev.stopPropagation(); ev.preventDefault(); } }, true);
}
