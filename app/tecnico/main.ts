// Modo técnico: a página. Mesmo mundo e mesmo visual do modo jogador; o save fica em outra chave.
import pacoteJson from "../../data/pacote-brasil-serie-a-v0.3.json";
import type { PacoteDados } from "../../src/liga";
import { ordenar } from "../../src/liga";
import { mundo, infoClube, idClube, sincronizarMundo } from "../../src/mundo";
import { infoLiga } from "../../src/ligas";
import { ATRIBUTOS } from "../../src/atributos";
import { valorBrl, curtoBrl, definirMoeda, numBrl, simboloAtual, moedaAtual, MOEDAS } from "../../src/moeda";
import { svgEscudo, corpoEscudo } from "../visual/escudos";
import { camisaFrente } from "../visual/camisas";
import { nomeNoPeito } from "../visual/peito";
import { simboloMarca, logoSvg } from "../jogo/poster";
import { MARCA, NOME_CATEGORIA } from "../../src/marcas";
import { UNIFORME_CLUBE } from "../../src/reliquias";
import { responderEvento, rankingT, TIPO_CONTATO } from "../../src/tecnico/vida";
import { patrociniosDe, ofertasPatro, assinarPatro, corDoPatro, receitaPatro, arenaDoClube, COTAS, ORDEM_COTAS, type Cota } from "../../src/tecnico/patrocinio";
import { svgEstadio, aparenciaDoEstadio } from "../visual/estadio";
import { fotoDoPerfil } from "../visual/mulheres";
import { svgFoto, APARENCIA_PADRAO, CABELOS, CABELOS_TECNICO, NOMES_CABELO_COR, CORES_CABELO, BARBAS, ROUPAS_TECNICO, type Aparencia, type RoupaTecnico } from "../criacao/avatar";
import { rostoParente } from "../visual/rostos";
import { NOME_ACAO_FAM, NOME_PARENTESCO, rotuloRelacaoFam, falaSobreVoce, idadeDe, type AcaoFamilia, type EstadoFamilia } from "../../src/familia";
import { NOME_ACAO_NAMORO, NOME_ACAO_FILHO, NOME_ACAO_EX, NOME_ETAPA, PROFISSOES, TEXTO_FIM, gravidasDe, type AcaoNamoro, type AcaoFilho, type AcaoEx, type EstadoNamoro } from "../../src/namoro";
import { IMOVEL, nomeImovel, patrimonio, type EstadoCasa } from "../../src/casa";
import { EMPRESAS, INVEST, DECISOES, FRANQUIAVEIS, MAX_UNIDADES, CUSTO_ASSESSOR, patrimonioInvestido, type EstadoNegocios, type TipoEmpresa, type TipoInvest, type AcaoEmpresa, type DecisaoMes } from "../../src/negocios";
import { negociosT, abrirEmpresaT, agirEmpresaT, decidirMesT, franquiaT, aplicarT, responderPropostaNegT, assessorT, semanaVida, casaT, acoesFamiliaT, agirFamiliaT, acoesParT, agirParT, acoesFilhoT, agirFilhoT, exesT, acoesExT, agirExT, perfisDaSemanaT, curtirT, salarioTecnico, bolso, trazerVida, anoVida } from "../../src/tecnico/familia-t";
import { titulosDoClube, timeDeTodosOsTempos, recordesHistoricosDoClube, plantelDoClube, type TemporadaUsuario, type RecordeNome, type TitularHistorico } from "../../src/perfil-clube";
import { EXTRAS, NOME_EXTRA, DICA_EXTRA } from "../../src/detalhes";
import { funcoesDa, encaixe, estrelasEncaixe } from "../../src/funcoes";
import { NOME_LINGUA, rotuloNivel, linguaDe, nivelEm, idiomasIniciais } from "../../src/idiomas";
/** Do save do jogador aposentado: licença (dos Estudos) e idiomas (nível de 0 a 3 vira 0 a 95). */
type HistJ = { ano: number; idade: number; clube: string; clubeId?: string; nota?: number; jogos: number; gols: number; assist: number; titulo: boolean; base: number; parcial?: boolean; premios?: string[] };
type SaveJogador = { semente: string; casa?: { saldo?: number }; jogador: { nome: string; apelido: string; nacionalidade: string; idade: number; posicao?: string; aparencia?: Partial<Aparencia> };
  carreira: { encerrada?: { ano: number; idade: number; texto: string; nivel?: { titulo: string }; recordes?: string[] }; fama: number; temporada: number; historico?: HistJ[];
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
  return { semente: jog.semente, temporada: ano - ANO_INICIAL_T, pausa, bio: bioCompleta, contatos, familia, vida };
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
import { criarAgendador, chaveNuvem, ultimoDaNuvem, nuvemDisponivel } from "../nuvem";
import {
  CHAVE_TECNICO, ANO_INICIAL_T, SEMANAS_PRE_T, avancarSemana, novaCarreiraTecnico, prepararMundo, ligasParaComecar, clubesDaLiga, reputacaoInicial, rotuloSemanaT,
  proximoJogo, folhaDe, folhaStaff, nivelStaff, candidatos, contratarStaff, demitirStaff, custoPedido, pedirDiretoria, conversar, NOME_CONVERSA, pedidoRenovacao,
  renovar, dispensar, agentesLivresT, contratarLivre, trocarNaVaga, mudarFormacao, nRodadasT, semanaAbs,
  janelaT, buscarJogadores, interesseDo, fazerProposta, alvoPorNome, alternarVenda, responderPropostaT,
  iniciarPartida, jogarAte, moverEscalacao, alternarBanco, trazerFamiliar, trocasNoIntervalo, reorganizarNoIntervalo, MAX_TROCAS, recomendarCurso, pagarAulas, estudarLicenca, licencaT, idiomasT,
  toleranciaLicenca, aceitarEmprego, recusarEmprego, assumirNovoClube,
  type SaveTecnico, type Relatorio, type Conversa, type Pedido, type DadosTecnico,
} from "../../src/tecnico/motor";
import {
  FORMACOES, NOMES_FORMACAO, NOME_MENTALIDADE, NOME_NIVEL3, NOME_AT, NOME_AT_GOL, NOME_POS_T, FUNCOES, NOME_FUNCAO, EFEITO_FUNCAO,
  forcaDoTime, ladoDe, ladoDaVaga, rotuloPos, type Lado, melhorEscalacao, ovrDe, ovrNaVaga, formaDe, disponivel, rotuloEncaixe, valorAtleta, precoIngresso, exDe, idiomasDe, funcaoNaVaga, ovrPos, type Atleta, type PosT, type Funcao,
} from "../../src/tecnico/modelo";

const pacote = pacoteJson as unknown as PacoteDados;
const $ = (id: string) => document.getElementById(id)!;
const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const ler = <T>(k: string): T | null => { try { return JSON.parse(localStorage.getItem(k) ?? "null") as T | null; } catch { return null; } };
const gravar = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } };

let save: SaveTecnico | null = ler<SaveTecnico>(CHAVE_TECNICO);
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
  // vindo do jogador: as ligas e os clubes são os do mesmo mundo, no ano em que ele começa a treinar
  const anoParou = ex ? (ex.carreira.encerrada?.ano ?? ANO_INICIAL_T + ex.carreira.temporada) : 0;
  if (ex && !anterior) sincronizarMundo(pacote, ex.semente, anoParou - ANO_INICIAL_T + 1 + pausaEscolhida, 0, {}, 0);
  const rep = anterior ? anterior.tecnico.reputacao : reputacaoInicial(d), ligas = ligasParaComecar(pacote);
  const prest = anterior ? anterior.tecnico.prestigio ?? 0 : d.prestigio ?? 0, tol = toleranciaLicenca(prest);
  const fama = ex && !anterior ? prestigioDe(ex, d.idiomas ?? {}) : undefined;
  const nivelNome = prest >= 80 ? "Lenda mundial" : prest >= 60 ? "Ídolo conhecido" : prest >= 40 ? "Nome respeitado" : "Começando do zero";
  if (!ligas.some((l) => l.id === ligaEscolhida)) ligaEscolhida = ligas[0]?.id ?? "BRA1";
  const clubes = clubesDaLiga(pacote, ligaEscolhida);
  return `<header class="marca"><strong>Mycarrerinha</strong><span>Técnico</span></header>
    <h1>Carreira de técnico</h1>
    <p class="sub" style="font-size:16px">Monte o time, escolha a tática, cuide do vestiário, das finanças e da estrutura do clube. A diretoria cobra resultado.</p>
    ${anterior ? `<section class="painel"><p class="rotulo">De volta ao mercado</p><h2>${esc(anterior.tecnico.nome)} procura clube</h2><p class="sub">${anterior.historico.length} temporada${anterior.historico.length === 1 ? "" : "s"} de carreira, reputação ${rep}.</p></section>` : ex ? `<section class="painel"><p class="rotulo">Depois das chuteiras</p><h2>${esc(ex.jogador.apelido)} vira técnico</h2><p class="sub">O mesmo mundo da sua carreira, com os mesmos clubes, jogadores e amigos. A fama abre portas: começa com reputação ${rep}.</p>
      <p class="rotulo" style="margin-top:8px">Quando começar</p><div class="chips">${[0, 1, 2].map((n) => `<button class="chip${pausaEscolhida === n ? " ativo" : ""}" data-pausa="${n}">${n === 0 ? "Já na próxima temporada" : `Parar ${n} ano${n > 1 ? "s" : ""} antes`}</button>`).join("")}</div>
      <p class="sub">Parou em ${anoParou}. Começa em ${anoParou + 1 + pausaEscolhida}.${pausaEscolhida ? " Na pausa, você descansa, estuda o jogo e chega mais maduro (+3 de reputação por ano)." : ""}</p></section>` : ""}
    <section class="painel form-ini">
      <label>Nome do técnico<input id="iNome" value="${esc(d.nome)}" maxlength="28" autocomplete="off" placeholder="Seu nome"></label>
      <label>Nacionalidade<select id="iNac">${["BRA", "ARG", "POR", "ESP", "ITA", "ENG", "GER", "FRA", "NED", "URU", "COL", "MEX", "USA", "JPN"].map((p) => `<option ${p === d.nac ? "selected" : ""}>${p}</option>`).join("")}</select></label>
      <label>Liga<select id="iLiga">${ligas.map((l) => `<option value="${l.id}" ${l.id === ligaEscolhida ? "selected" : ""}>${esc(l.nome)}</option>`).join("")}</select></label>
      <p class="sub">Sua reputação: <b style="color:var(--giz)">${rep}</b> · ${LICENCAS[lic]}.${fama ? ` <b style="color:var(--giz)">${nivelNome}</b>${fama.resumo ? ` (${esc(fama.resumo)})` : ""}.` : ""} ${tol ? `Com o seu nome, clubes grandes aceitam você com até ${tol === 1 ? "uma licença" : "duas licenças"} a menos e pagam o curso.` : "Clubes grandes só aceitam técnico com nome e licença alta; comece por baixo e suba."}</p>
    </section>
    <section class="painel"><p class="rotulo">Escolha o clube</p>${clubes.map((c) => {
      const ok = c.exige <= rep && c.licenca <= lic + tol;
      return `<div class="clube-op${ok ? "" : " trancado"}">${escudo(c.id)}<div><b>${esc(c.nome)}</b><br><small class="sub">Força ${c.forca}${c.exige > rep ? ` · exige reputação ${c.exige}` : ""}${c.licenca > lic + tol ? ` · exige ${LICENCAS[c.licenca]}` : c.licenca > lic ? ` · paga o curso da ${LICENCAS[lic + 1]}` : ""}</small></div>${ok ? `<button class="botao peq" data-assumir="${c.id}" data-ex="${ex ? 1 : 0}">Assumir</button>` : `<span class="pill">Fechado</span>`}</div>`;
    }).join("")}</section>
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
  return `<header class="marca"><strong>Mycarrerinha</strong><span>${esc(rotuloSemanaT(s))}</span></header>
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
    ...sair.map((a) => `<span class="pill ruim">${esc(a.nome)} quer sair</span>`), ...((s.propostas ?? []).length ? [`<button class="pill aviso" data-ir-propostas style="cursor:pointer">${s.propostas!.length} proposta${s.propostas!.length > 1 ? "s" : ""} por jogadores seus ›</button>`] : []), ...(contratos.length ? [`<span class="pill aviso">${contratos.length} contrato${contratos.length > 1 ? "s" : ""} acabando</span>`] : []),
  ];
  const ev = s.evento ? `<section class="painel evento-t"><p class="rotulo">Acontecendo agora</p><h2 style="font-size:19px">${esc(s.evento.titulo)}</h2><p>${esc(s.evento.texto)}</p><div class="botoes">${s.evento.opcoes.map((o) => `<button class="botao sec" data-evt="${o.id}">${esc(o.rotulo)}</button>`).join("")}</div></section>` : "";
  const of = s.ofertaEmprego, ofC = of ? infoClube(pacote, of.clubeId) : undefined;
  const oferta = of && ofC ? `<section class="painel evento-t"><p class="rotulo">Proposta de emprego</p><div style="display:flex;gap:10px;align-items:center">${escudo(of.clubeId)}<div><h2 style="font-size:19px;margin:0">${esc(ofC.nome)} quer você</h2><p class="sub" style="margin:2px 0 0">${esc(infoLiga(ofC.ligaId).curto)} · força ${Math.round(w.clube[of.clubeId]?.forca ?? 0)}</p></div></div>
    <p>${esc(of.texto)} ${s.semana < SEMANAS_PRE_T ? "Se aceitar agora, assume já nesta pré-temporada." : "Com a temporada rolando, você termina aqui e assume lá na próxima."}</p>
    <div class="botoes"><button class="botao" data-emprego="1">Aceitar e mudar de clube</button><button class="botao sec" data-emprego="0">Recusar</button><button class="botao sec" data-perfil="${of.clubeId}">Ver o clube</button></div></section>` : "";
  const acerto = s.novoClube ? `<section class="painel"><p class="sub">Pré-contrato assinado: na próxima temporada você assume o <b>${esc(nomeClube(s.novoClube))}</b>.</p></section>` : "";
  return `${oferta}${acerto}${ev}${jogo}${ult}
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
    return `<button class="lin" data-jog="${esc(a.id)}"><span class="num">${a.numero}</span><span class="nm"><b>${esc(a.nome)}</b><small>${rotuloPos(a)} · ${a.idade}a · moral ${barra(a.moral)} · físico ${barra(a.condicao)}${tags}</small></span><span class="ov"><strong>${ovrDe(a)}</strong><span>${potTexto(s, a)}</span></span></button>`;
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
    ${campo}
    <p class="sub" style="margin:8px 0">Toque num jogador e depois em outro (no campo ou na lista) para trocar os dois de lugar. Entrosamento no ${t.formacao}: <b style="color:var(--giz)">${Math.round(s.entrosamento[t.formacao] ?? 40)}%</b>. Contorno vermelho: improvisado, lesionado ou suspenso.</p>
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
function abaLiga(s: SaveTecnico): string {
  const li = infoLiga(s.ligaId), tab = ordenar(s.tabela), n = tab.length;
  const ult = Math.max(-1, ...Object.keys(s.rodadas).map(Number));
  const rodada = ult >= 0 ? `<section class="painel" style="margin-top:12px"><p class="rotulo">Rodada ${ult + 1}</p>${s.rodadas[ult].map(([c, f, gc, gf]) => `<div class="not" style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;${c === s.clubeId || f === s.clubeId ? "font-weight:700" : ""}"><span style="text-align:right">${esc(nomeClube(c))}</span><b>${gc} × ${gf}</b><span>${esc(nomeClube(f))}</span></div>`).join("")}</section>` : "";
  const subs = `<div class="sub-abas">${[["tabela", "Tabela"], ["artilharia", "Artilharia"], ["assist", "Assistências"], ["elenco", "Seu elenco"]].map(([k, n2]) => `<button class="${(sub.liga ?? "tabela") === k ? "ativo" : ""}" data-sub="liga:${k}">${n2}</button>`).join("")}</div>`;
  if (sub.liga === "artilharia" || sub.liga === "assist") {
    const l = rankingT(pacote, s, sub.liga === "artilharia" ? "g" : "a", 15);
    return `${subs}<p class="rotulo">${sub.liga === "artilharia" ? "Artilharia" : "Assistências"} · ${esc(li.curto)} ${ANO_INICIAL_T + s.temporada}</p>${l.length ? `<table class="tab"><thead><tr><th>#</th><th style="text-align:left">Jogador</th><th>J</th><th>${sub.liga === "artilharia" ? "Gols" : "Assist."}</th></tr></thead><tbody>${l.map((x, i) => `<tr class="${x.meu ? "eu" : ""}"><td>${i + 1}</td><td class="cl">${escudo(x.clubeId, "escudo esc-p")}${esc(x.nome)}</td><td>${x.jogos}</td><td><b>${x.valor}</b></td></tr>`).join("")}</tbody></table>` : `<p class="sub">A bola ainda não rolou nesta temporada.</p>`}`;
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
function perfilClubeT(s: SaveTecnico, clubeId: string): string {
  const info = infoClube(pacote, clubeId);
  if (!info) return `<p class="sub">Clube não encontrado.</p>`;
  completarBio(s);
  const feitas = Math.max(0, s.semana - SEMANAS_PRE_T), meu = clubeId === s.clubeId;
  const dele = (s.temporadasElenco ?? []).filter((x) => x.clubeId === clubeId);
  const ignorar = [...new Set([...dele.map((x) => x.t), ...s.historico.filter((h) => h.clubeId === clubeId).map((h) => h.t), ...(meu ? [s.temporada] : [])])];
  const usuario: TemporadaUsuario[] = [
    ...dele.map((x) => ({ nome: x.nome, t: x.t, j: x.j, g: x.g, a: x.a, pos: x.pos, nota: x.nota, outro: true })),
    ...(meu ? s.elenco.filter((a) => a.jogos > 0).map((a) => ({ nome: a.nome, t: s.temporada, j: a.jogos, g: a.gols, a: a.assist, pos: a.pos, nota: a.notas.length ? a.notas.reduce((x, y) => x + y, 0) / a.notas.length : undefined, outro: true })) : []),
    ...(s.bio?.temporadas ?? []).filter((x) => x.clubeId === clubeId).map((x) => ({ nome: s.bio!.apelido, t: x.t, j: x.j, g: x.g, a: x.a, pos: s.bio!.pos, nota: x.nota })),
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
    <p class="rotulo" style="margin-top:14px">Títulos</p>${trofeus}
    ${passagem}
    <p class="rotulo" style="margin-top:14px">Time de todos os tempos</p><p class="sub" style="margin-bottom:4px">Quem mais vezes foi o melhor da posição numa temporada. Ao lado, o melhor ano e a nota.</p><table class="tab"><tbody>${xiOrd.map(linhaXi).join("")}</tbody></table>
    ${bloco("Mais gols em uma temporada", rec.golsTemp, true)}${bloco("Mais assistências em uma temporada", rec.assistTemp, true)}${bloco("Maiores artilheiros da história", rec.artilheiros, false)}${bloco("Maiores assistentes da história", rec.assistentes, false)}${bloco("Goleiros com mais jogos sem tomar gol", rec.semGol, false)}
    ${elenco.length ? `<p class="rotulo" style="margin-top:14px">Destaques do elenco atual</p>${elenco.map((j) => `<div class="not">${esc(j.nome)} <small class="sub">${j.posicao} · ${j.ovr}</small></div>`).join("")}` : ""}
    <div class="botoes" style="margin-top:14px"><button class="botao sec" data-fechar>Fechar</button></div>`;
}

// ------------------------------------------------------------------ Clube
function abaClube(s: SaveTecnico): string {
  const subs = `<div class="sub-abas">${[["historia", "História do clube"], ["noticias", "Notícias"], ["financas", "Finanças"], ["patrocinios", "Patrocínios"], ["diretoria", "Diretoria"], ["comissao", "Comissão técnica"]].map(([k, n]) => `<button class="${sub.clube === k ? "ativo" : ""}" data-sub="clube:${k}">${n}</button>`).join("")}</div>`;
  return subs + aviso() + (sub.clube === "diretoria" ? abaDiretoria(s) : sub.clube === "comissao" ? abaComissao(s) : sub.clube === "patrocinios" ? abaPatrocinios(s) : sub.clube === "carreira" ? abaCarreira(s) : sub.clube === "historia" ? perfilClubeT(s, s.clubeId).replace(/<div class="botoes" style="margin-top:14px"><button class="botao sec" data-fechar>Fechar<\/button><\/div>/, "") : sub.clube === "noticias" ? abaNoticias(s) : abaFinancas(s));
}
// ------------------------------------------------------------------ patrocínios do clube
const hexRgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) || 0);
const claro = (c: string) => { const [r, g, b] = hexRgb(c); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6; };
/** A camisa de frente com os patrocínios atuais (escudo, master, fornecedor e manga). */
function camisaDoClube(s: SaveTecnico): string {
  const info = infoClube(pacote, s.clubeId), u = UNIFORME_CLUBE[s.clubeId], [a, b] = u ? u.cores : [info?.cores[0] ?? "#888", info?.cores[1] ?? "#FFF"];
  const p = patrociniosDe(pacote, s), contraste = claro(a) ? "#111111" : "#FFFFFF";
  const m = p.master && MARCA[p.master.marca], f = p.fornecedor && MARCA[p.fornecedor.marca], g = p.manga && MARCA[p.manga.marca];
  const ec = u?.escudo ?? [info?.cores[0] ?? "#888", info?.cores[1] ?? "#FFF"];
  return camisaFrente({ cores: [a, b], modelo: u?.padrao ?? info?.padrao ?? "lisa", faixas: u?.faixas }, {
    escudo: corpoEscudo(idClube(s.clubeId), ec[0], ec[1], info?.nome),
    master: m ? nomeNoPeito(m.nome, p.master!.cor ?? contraste) : undefined,
    fornecedor: f ? simboloMarca(f, p.fornecedor!.cor ?? contraste, a) : undefined,
    manga: g ? simboloMarca(g, contraste, a) : undefined,
  });
}
function abaPatrocinios(s: SaveTecnico): string {
  const p = patrociniosDe(pacote, s), ofs = ofertasPatro(pacote, s), arena = arenaDoClube(pacote, s);
  const info = infoClube(pacote, s.clubeId), corClube = (UNIFORME_CLUBE[s.clubeId]?.cores ?? info?.cores ?? ["#888", "#FFF"])[1];
  const total = Object.values(receitaPatro(pacote, s)).reduce((x, y) => x + y, 0), ano = (t: number) => ANO_INICIAL_T + t;
  const coresDe = (marca: string) => [["#FFFFFF", "Branco"], ["#111111", "Preto"], ["#D4AF37", "Dourado"], [corClube, "Cor do clube"], [MARCA[marca]?.cores[0] ?? "#888", "Cor da marca"]].filter((x, i, l) => l.findIndex((y) => y[0].toLowerCase() === x[0].toLowerCase()) === i);
  const cartao = (cota: Cota) => {
    const c = p[cota], m = c ? MARCA[c.marca] : undefined, l = ofs[cota] ?? [];
    const atual = c && m ? `<div class="patro-atual">${logoSvg(m, 24)}<div><b>${curtoBrl(c.valor)}/mês</b><small class="sub">${esc(NOME_CATEGORIA[m.categoria])} · até ${ano(c.ate)}${c.ate <= s.temporada ? " · último ano" : ""}${c.nome ? ` · ${esc(c.nome)}` : ""}</small></div></div>
      ${cota === "master" || cota === "fornecedor" ? `<div class="chips" style="flex-wrap:wrap;margin-top:6px">${coresDe(c.marca).map(([cor, nome]) => `<button class="chip cor-chip${(c.cor ?? "") === cor ? " ativo" : ""}" data-patro-cor="${cota}|${cor}"><i style="background:${cor}"></i>${nome}</button>`).join("")}</div>` : ""}` : "";
    const travada = cota === "arena" && arena.travada ? `<p class="sub">${esc(arena.travada)}</p>` : "";
    const ofertas = l.length ? `<p class="rotulo" style="margin-top:10px">${c ? "Ofertas para depois do contrato atual" : "Ofertas"}</p>${l.map((o) => {
      const mo = MARCA[o.marca]; if (!mo) return "";
      const nomes = [`${mo.nome} Arena`, `Arena ${mo.nome}`, `Estádio ${mo.nome}`, `${mo.nome} Park`];
      return `<div class="patro-oferta">${logoSvg(mo, 22)}<small class="sub">${esc(NOME_CATEGORIA[mo.categoria])} · oferece <b>${curtoBrl(o.valor)}/mês</b> por ${o.anos} ${o.anos === 1 ? "temporada" : "temporadas"}${o.recusou ? " · última proposta" : ""}</small>
        ${campoValor(`pv-${cota}-${o.marca}`, o.valor)}
        ${cota === "arena" ? `<select class="campo-sel" id="pn-${o.marca}" aria-label="Nome da arena">${nomes.map((n) => `<option>${esc(n)}</option>`).join("")}</select>` : ""}
        <button class="botao peq" data-patro="${cota}|${o.marca}">Pedir este valor</button></div>`;
    }).join("")}` : !c && !travada ? `<p class="sub">Nenhuma marca na mesa agora. Novas propostas chegam a cada 8 semanas.</p>` : "";
    return `<section class="painel patro-cota"><p class="rotulo">${esc(COTAS[cota].nome)}</p><p class="sub" style="margin-top:0">${esc(COTAS[cota].texto)}</p>${cota === "arena" ? `<p class="sub">Estádio: <b>${esc(arena.nome)}</b></p>` : ""}${atual}${travada}${ofertas}</section>`;
  };
  return `<div class="patro-topo"><div class="camisa-patro">${camisaDoClube(s)}</div><div><p class="rotulo">Patrocínios do clube</p><b class="patro-total">${curtoBrl(total)}/mês</b><p class="sub">Peça o valor que quiser: a marca aceita até o limite dela. Se passar, ela faz uma última proposta; passou de novo, desiste.</p></div></div>
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
function vidaPerfil(s: SaveTecnico): string {
  completarVida(s); casaT(pacote, s);
  const t = s.tecnico, n = s.namoro, par = n?.par, filhos = n?.filhos ?? [];
  const resumoFam = [par ? `${({ casados: "Casado com", noivos: "Noivo de", morando: "Mora com", namorando: "Namorando", saindo: "Saindo com", match: "Conversando com" } as Record<string, string>)[par.etapa]} ${par.nome.split(" ")[0]}` : "Solteiro", filhos.length ? `${filhos.length} ${filhos.length === 1 ? "filho" : "filhos"}` : ""].filter(Boolean).join(" · ");
  const cab = `<section class="painel"><div class="v-topo"><button class="v-mini" data-sub="vida:visual" aria-label="Mudar o visual">${fotoTecnico(s)}</button><div><p class="rotulo">Técnico</p><h2 style="margin:0">${esc(t.nome)}</h2><p class="sub">${t.idade} anos · ${esc(t.nac)}${t.exJogador ? ` · ex-jogador (${esc(t.exJogador.apelido)})` : ""}</p></div></div>
    <div class="dl" style="margin-top:8px"><span>Clube</span><b>${esc(nomeClube(s.clubeId))}</b><span>Reputação</span><b>${t.reputacao}/100</b><span>Salário</span><b>${curtoBrl(salarioTecnico(s))}/mês</b><span>No bolso</span><b>${curtoBrl(bolso(s))}</b><span>Vida pessoal</span><b>${esc(resumoFam)}</b></div>
    <div class="botoes" style="margin-top:10px"><button class="botao sec" data-sub="vida:familia">Ver a família</button></div></section>
    <section class="painel"><p class="rotulo">Sua casa</p>${(() => { const c = casaT(pacote, s), m = IMOVEL[c.imovel]; return `<h3 style="margin:0">${esc(nomeImovel(c, m))}</h3><p class="sub">${esc(m.local)} · ${c.proprios.includes(c.imovel) ? "imóvel próprio" : `aluguel ${curtoBrl(m.aluguel)}/mês`} · ${c.objetos.length} itens · ${(c.carros ?? []).length} ${(c.carros ?? []).length === 1 ? "carro" : "carros"}</p><p class="sub">Patrimônio: ${curtoBrl(patrimonio(c))}</p>`; })()}
    <div class="botoes" style="margin-top:10px"><button class="botao" data-casa>Entrar em casa</button></div></section>`;
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
  const est = `<div class="estadio-box">${svgEstadio({ ...(ap?.dados ?? { nome: "Estádio", cores: ["#2E7D4F", "#FFFFFF"] }), nome: arenaDoClube(pacote, s).nome, capacidade: s.clube.capacidade, obra: !!obraEst })}</div>${ap?.divideCom.length ? `<p class="sub" style="text-align:center;margin:-4px 0 8px">Estádio dividido com ${ap.divideCom.map(esc).join(" e ")}.</p>` : ""}
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
    <div><p class="rotulo">Lances</p>${p.eventos.some((e) => e.tipo !== "lance") ? p.eventos.filter((e) => e.tipo !== "lance").map((e) => `<div class="evento${minha(e) ? "" : " adv"}"><span class="m">${e.min}'</span><span>${e.tipo === "gol" ? "⚽" : e.tipo === "amarelo" ? "🟨" : e.tipo === "vermelho" ? "🟥" : e.tipo === "lesao" ? "✚" : "⇄"}</span><span>${esc(e.texto)}</span></div>`).join("") : `<p class="sub">Jogo sem gols nem grandes lances.</p>`}</div>
    ${p.eventos.some((e) => e.narra) ? `<details class="not"><summary>Narração do jogo</summary>${p.eventos.map((e) => `<div class="evento${minha(e) ? "" : " adv"}"><span class="m">${e.min}'</span><span>${ICO_EV[e.tipo] ?? "•"}</span><span>${esc(e.narra ?? e.texto)}</span></div>`).join("")}</details>` : ""}
    <div><p class="rotulo">Notas</p><div class="lista">${[...p.notas].sort((a, b) => b.nota - a.nota).map((n) => `<div class="lin" style="cursor:default;grid-template-columns:40px 1fr auto"><span class="num" style="font-size:13px">${n.pos}</span><span class="nm"><b>${esc(n.nome)}</b><small>${n.min}'${n.gols ? ` · ${n.gols} gol${n.gols > 1 ? "s" : ""}` : ""}${n.assist ? ` · ${n.assist} assist.` : ""}</small></span><span class="ov"><strong style="font-size:20px;color:${n.nota >= 7 ? "var(--pos)" : n.nota < 6 ? "var(--neg)" : "var(--ouro-claro)"}">${n.nota.toFixed(1).replace(".", ",")}</strong></span></div>`).join("")}</div></div>`;
}

// ------------------------------------------------------------------ partida ao vivo
/** Estado da tela do jogo: minuto mostrado, velocidade (ms por minuto), pausa pedida e se parou no intervalo. */
const vivo = { mostrado: 0, vel: 260, pausado: true, pedirPausa: false, intervalo: false, passouIntervalo: false, timer: 0 as number, avisos: [] as string[] };
const ICO_EV: Record<string, string> = { gol: "⚽", amarelo: "🟨", vermelho: "🟥", lesao: "✚", sub: "⇄", lance: "▸" };
function abrirVivo(s: SaveTecnico, avisos: string[]) {
  const av = s.aoVivo; if (!av) return;
  vivo.mostrado = av.minuto ?? 0; vivo.avisos = avisos; vivo.pausado = true; clearTimeout(vivo.timer); vivo.pedirPausa = false; vivo.intervalo = false; vivo.passouIntervalo = vivo.mostrado >= 45;
  abrir(`<div id="vivo"></div>`);
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
  el.innerHTML = `<button class="fechar" data-fechar aria-label="Fechar">×</button>
    <p class="rotulo">Rodada ${av.rodada + 1} · ao vivo</p>
    <div class="relogio-vivo${parado ? "" : " correndo"}">${fim ? "Fim de jogo" : vivo.intervalo ? "Intervalo" : `${m}'`}</div>
    <div class="prox"><div class="lado">${escudo(casa)}<span>${esc(nomeClube(casa))}</span></div><span class="placar">${gc} × ${gf}</span><div class="lado">${escudo(fora)}<span>${esc(nomeClube(fora))}</span></div></div>
    <div class="barra-tempo"><i style="width:${(m / 90) * 100}%"></i><b style="left:50%"></b></div>
    ${vivo.avisos.map((x) => `<p class="sub">${esc(x)}</p>`).join("")}
    <div class="feed-vivo">${evs.length ? [...evs].reverse().map((e) => `<div class="evento${e.meu ? "" : " adv"}${e.tipo === "gol" ? " gol" : e.tipo === "lance" ? " lance" : ""}"><span class="m">${e.min}'</span><span>${ICO_EV[e.tipo] ?? "•"}</span><span>${esc(e.narra ?? e.texto)}</span></div>`).join("") : `<p class="sub">${m ? "Jogo truncado, sem grandes lances." : "A bola vai rolar."}</p>`}</div>
    ${parado && !fim && cansados.length ? `<p class="sub">Cansados: ${cansados.map((n) => esc(n!)).join(", ")}.</p>` : ""}
    ${fim ? `<button class="botao grande" data-avancar>Ver o resultado</button>`
      : parado ? `<div class="botoes"><button class="botao" data-vivo-seguir>▶ ${m === 0 ? "Começar" : vivo.intervalo ? "Começar o 2º tempo" : "Continuar"}</button><button class="botao sec" data-vivo-mexer>Mexer no time e na tática</button></div>
        <p class="sub">Trocas: ${trocasNoIntervalo(s)} de ${MAX_TROCAS}. <button class="link-inline" data-avancar>Pular para o fim</button></p>`
      : `<div class="botoes"><button class="botao" data-vivo-pausa>${vivo.pedirPausa ? "Parando…" : "⏸ Pausar"}</button><div class="chips">${vel}</div></div>`}`;
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
  const corpo = aba === "inicio" ? abaInicio(s) : aba === "elenco" ? abaElenco(s) : aba === "tatica" ? abaTatica(s) : aba === "liga" ? abaLiga(s) : aba === "vida" ? abaVida(s) : abaClube(s);
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
  if (d.pausa !== undefined && !save) { pausaEscolhida = +d.pausa; render(); return; }
  if (d.assumir) {
    const nome = ($("iNome") as HTMLInputElement).value.trim() || "Técnico", nac = ($("iNac") as HTMLSelectElement).value;
    const jog = ler<SaveJogador>("mycarrerinha:save");
    const ex = d.ex === "1" && jog?.carreira?.encerrada ? { apelido: jog.jogador.apelido, fama: jog.carreira.fama } : undefined;
    if (anterior) { save = assumirNovoClube(pacote, anterior, d.assumir); anterior = null; aba = "inicio"; msg = undefined; salvar(); nuvem.agora(); render(); window.scrollTo(0, 0); return; }
    save = novaCarreiraTecnico(pacote, { nome, nac, idade: ex ? jog!.jogador.idade + 1 + pausaEscolhida : 38, ...(ex ? { exJogador: ex, ...heranca(jog!), vindoDe: vindoDoJogador(jog!, pausaEscolhida) } : {}) }, d.assumir);
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
  if (d.emprego !== undefined) {
    if (d.emprego === "1") {
      const alvo = s.ofertaEmprego?.clubeId, r = aceitarEmprego(pacote, s);
      if (r.ok && r.agora && alvo) { save = assumirNovoClube(pacote, s, alvo); aba = "inicio"; }
      msg = { texto: r.msg, ok: r.ok }; salvar(); render(); window.scrollTo(0, 0); return;
    }
    const r = recusarEmprego(pacote, s); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return;
  }
  if (d.evt) { const r = responderEvento(pacote, s, d.evt); msg = r ? { texto: r, ok: true } : undefined; redesenhar(); return; }
  if (d.familia) { const r = trazerFamiliar(pacote, s, d.familia); msg = { texto: r.msg, ok: r.ok }; redesenhar(); return; }
  if (d.filtro) { filtro = d.filtro; render(); return; }
  if (d.patro) { const [cota, marca] = d.patro.split("|"), nome = (document.getElementById(`pn-${marca}`) as HTMLSelectElement | null)?.value; const r = assinarPatro(pacote, s, cota as Cota, marca, lerValor(`pv-${cota}-${marca}`), nome ? { nome } : undefined); msg = { texto: r.msg, ok: r.ok }; salvar(); render(); return; }
  if (d.patroCor) { const [cota, cor] = d.patroCor.split("|"); corDoPatro(pacote, s, cota as Cota, cor); salvar(); render(); return; }
  if (d.avancar !== undefined || d.avancarTatica !== undefined) {
    const r = avancarSemana(pacote, s);
    // virou a temporada com pré-contrato assinado: assume o clube novo
    if (s.novoClube && s.semana === 0 && !s.demitido) { const nome = nomeClube(s.novoClube); save = assumirNovoClube(pacote, s, s.novoClube); r.fimDeTemporada = `${r.fimDeTemporada ?? ""} Começa a sua passagem pelo ${nome}.`.trim(); }
    msg = undefined; salvar(); render(); window.scrollTo(0, 0);
    if (r.partida) abrir(relatorioHtml(r.partida) + (r.eventos.length > 1 ? `<div><p class="rotulo">Na semana</p>${r.eventos.slice(1).map((e) => `<div class="not">${esc(e)}</div>`).join("")}</div>` : "") + (r.fimDeTemporada ? `<div class="aviso-t ok">${esc(r.fimDeTemporada)}</div>` : ""));
    else if (r.fimDeTemporada || r.eventos.length) msg = { texto: [r.fimDeTemporada, ...r.eventos].filter(Boolean).join(" "), ok: true }, render();
    return;
  }
  if (d.verPartida !== undefined && s.ultima) { abrir(relatorioHtml(s.ultima)); return; }
  if (d.vivo !== undefined) { const r = s.aoVivo ? { avisos: [] } : iniciarPartida(pacote, s); salvar(); render(); if (r) abrirVivo(s, r.avisos); return; }
  if (d.vivoPausa !== undefined) { vivo.pedirPausa = true; atualizarVivo(s); return; }
  if (d.vivoSeguir !== undefined) { vivo.pausado = false; vivo.pedirPausa = false; vivo.intervalo = false; atualizarVivo(s); passoVivo(s); return; }
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
