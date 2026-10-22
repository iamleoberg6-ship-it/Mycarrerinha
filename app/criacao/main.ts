declare const __CARREIRA__: boolean;
// Tela de criação do jogador em história guiada. Usa o DNA do motor (src/dna.ts).
// As escolhas não mostram números: o DNA é surpresa até a revelação do card.
import {
  PAISES, FORMACOES, FAMILIAS, TRACOS, criarJogador, formacaoPermitida,
  type PaisId, type FamiliaId, type FormacaoId, type Pe, type EscolhasCriacao, type ResultadoCriacao,
} from "../../src/dna.js";
import { ATRIBUTOS, GRUPO, peso, type Atributo, type Posicao } from "../../src/atributos.js";
import { CAMISA_PADRAO, type Camisa } from "./avatar.js";
import {
  svgFoto, APARENCIA_PADRAO, NOMES_TOM, AMOSTRAS_TOM, NOMES_COR_CABELO, AMOSTRAS_COR_CABELO, NOMES_ROSTO, NOMES_CABELO,
  NOMES_OLHOS, NOMES_SOBRANCELHA, NOMES_NARIZ, NOMES_BOCA, CORES_CASUAL, NOMES_CASUAL_COR, type Aparencia,
} from "../visual/personagem.js";
import { NOME_CASUAL, type RoupaCasual } from "../../src/visual.js";
import { definirPerfil, estiloDeJogo, type PerfilCraque } from "../../src/perfil.js";
import { cenarioCompleto } from "./cenario.js";

const NOME_ATR: Record<Atributo, string> = {
  VEL: "Velocidade", RES: "Resistência", FOR: "Força", PAS: "Passe", CRU: "Cruzamento", DRI: "Drible",
  FIN: "Finalização", CAB: "Cabeceio", MAR: "Marcação", VIS: "Visão", POS: "Posicionamento", COM: "Compostura",
};
const POSICOES: { id: Posicao; nome: string; frase: string }[] = [
  { id: "ZAG", nome: "Zagueiro", frase: "O último homem, que ganha no alto e não deixa passar." },
  { id: "LAT", nome: "Lateral", frase: "Sobe e desce o jogo inteiro pela linha." },
  { id: "VOL", nome: "Volante", frase: "O primeiro a roubar a bola e o primeiro a passar." },
  { id: "MEI", nome: "Meia", frase: "O cérebro que enxerga o passe antes de todo mundo." },
  { id: "PON", nome: "Ponta", frase: "Encara o lateral no um contra um." },
  { id: "ATA", nome: "Centroavante", frase: "O nome que a torcida grita depois do gol." },
];
interface ClubeCoracao { id: string; nome: string; apelido: string; camisa: Camisa }
const CLUBES: ClubeCoracao[] = [
  { id: "FLA", nome: "CR Flamingo", apelido: "Flamingo", camisa: { cor1: "#C8102E", cor2: "#111111", estilo: "listrasH" } },
  { id: "PAL", nome: "SE Palmeral", apelido: "Verdão", camisa: { cor1: "#006437", cor2: "#FFFFFF", estilo: "lisa" } },
  { id: "COR", nome: "SC Coríntios", apelido: "Timão", camisa: { cor1: "#F4F4F2", cor2: "#111111", estilo: "lisa" } },
  { id: "SPA", nome: "Tricolor Paulista FC", apelido: "Tricolor", camisa: { cor1: "#F4F4F2", cor2: "#C8102E", cor3: "#111111", estilo: "faixaH" } },
  { id: "SAN", nome: "Santista FC", apelido: "Peixe", camisa: { cor1: "#F4F4F2", cor2: "#111111", estilo: "lisa" } },
  { id: "VAS", nome: "CR Navegantes da Gama", apelido: "Gigante da Colina", camisa: { cor1: "#F4F4F2", cor2: "#111111", estilo: "faixa" } },
  { id: "FLU", nome: "Fluminante FC", apelido: "Tricolor carioca", camisa: { cor1: "#7A1E2B", cor2: "#00613C", estilo: "listrasV" } },
  { id: "BOT", nome: "Botafuego FR", apelido: "Glorioso", camisa: { cor1: "#F4F4F2", cor2: "#111111", estilo: "listrasV" } },
  { id: "CRU", nome: "Cruzador EC", apelido: "Raposa", camisa: { cor1: "#003DA5", cor2: "#FFFFFF", estilo: "lisa" } },
  { id: "CAM", nome: "Atlético das Minas", apelido: "Galo", camisa: { cor1: "#F4F4F2", cor2: "#111111", estilo: "listrasV" } },
  { id: "GRE", nome: "Grêmio Gaúcho", apelido: "Imortal", camisa: { cor1: "#0D80BF", cor2: "#111111", estilo: "listrasV" } },
  { id: "INT", nome: "SC Colorado Gaúcho", apelido: "Colorado", camisa: { cor1: "#C8102E", cor2: "#FFFFFF", estilo: "lisa" } },
  { id: "BAH", nome: "EC Bahiano", apelido: "Tricolor de Aço", camisa: { cor1: "#F4F4F2", cor2: "#0047AB", cor3: "#C8102E", estilo: "faixaH" } },
  { id: "VIT", nome: "EC Vitorioso", apelido: "Leão da Barra", camisa: { cor1: "#C8102E", cor2: "#111111", estilo: "listrasH" } },
  { id: "CAP", nome: "Curitiba Athletic", apelido: "Furacão", camisa: { cor1: "#C8102E", cor2: "#111111", estilo: "listrasH" } },
  { id: "CFC", nome: "Coritibano FBC", apelido: "Coxa", camisa: { cor1: "#F4F4F2", cor2: "#00573F", estilo: "faixaH" } },
  { id: "RBB", nome: "Touro Bragantino", apelido: "Massa Bruta", camisa: { cor1: "#F4F4F2", cor2: "#C8102E", estilo: "faixaH" } },
  { id: "MIR", nome: "Mirasol FC", apelido: "Leão Caipira", camisa: { cor1: "#FFD100", cor2: "#00843D", estilo: "faixaH" } },
  { id: "REM", nome: "Clube do Remador", apelido: "Leão Azul", camisa: { cor1: "#00205B", cor2: "#FFFFFF", estilo: "lisa" } },
  { id: "CHA", nome: "Chapecoano", apelido: "Verdão do Oeste", camisa: { cor1: "#00843D", cor2: "#FFFFFF", estilo: "lisa" } },
];
const BAIRRO: ClubeCoracao = { id: "", nome: "O time do bairro", apelido: "Sem clube grande", camisa: CAMISA_PADRAO };

const FAMILIA_FRASE: Record<FamiliaId, string> = { humilde: "numa família humilde", media: "numa família de classe média", rica: "numa família rica" };
const FORMACAO_FRASE: Record<FormacaoId, string> = {
  rua: "aprendeu a jogar na rua", futsal: "cresceu nas quadras de futsal", praia: "aprendeu na areia da praia",
  escolinha: "começou na escolinha do bairro", academia: "treinou numa academia particular", base_grande: "tentou a peneira de um clube grande",
};
const NOTIF_FAMILIA: Record<FamiliaId, string> = {
  humilde: "Em casa ninguém reclama de cansaço. Essa fome vai aparecer em campo.",
  media: "Estudo e treino dividindo o dia. Disciplina vira hábito cedo.",
  rica: "Nutricionista, personal e conforto. O corpo agradece; a fome, nem tanto.",
};
const NOTIF_FORMACAO: Record<FormacaoId, string> = {
  rua: "Jogando contra os mais velhos, você aprendeu a sair de qualquer aperto.",
  futsal: "Na quadra, um toque a mais é bola perdida. Seu pé ficou rápido.",
  praia: "Areia fofa todo dia. As pernas ficaram fortes que nem pilão.",
  escolinha: "Fundamento por fundamento, sem pular etapa.",
  academia: "Metodologia europeia e vídeo de tudo. Você joga pensando.",
  base_grande: "A peneira é daqui a uma semana. O resultado sai na revelação.",
};

interface Estado {
  passo: number; nome: string; apelido: string; pais: PaisId | null; familia: FamiliaId | null; clube: string | null;
  formacao: FormacaoId | null; alturaCm: number; pe: Pe; posicao: Posicao | null; aparencia: Aparencia;
  aparenciaFeita: boolean; tentativa: number; resultado: ResultadoCriacao | null; aberto: boolean;
  aba: "rosto" | "olhos" | "nariz" | "cabelo" | "roupa"; traje: "jogo" | "social";
  perfil: PerfilCraque | null; decisao: string | null;
}
const estado: Estado = {
  passo: 0, nome: "Gabriel Souza", apelido: "Gabi", pais: null, familia: null, clube: null, formacao: null, alturaCm: 178,
  pe: "direito", posicao: null, aparencia: { ...APARENCIA_PADRAO }, aparenciaFeita: false, tentativa: 0, resultado: null, aberto: false,
  aba: "rosto", traje: "jogo", perfil: null, decisao: null,
};

let timerNotif = 0;
const PASSOS = ["Nome", "País", "Família", "Clube", "Formação", "Corpo", "Posição", "Aparência", "DNA"];
const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const pais = () => PAISES.find((p) => p.id === estado.pais);
const clube = () => (estado.clube === null ? null : CLUBES.find((c) => c.id === estado.clube) ?? BAIRRO);
const altura = (cm: number) => `${(cm / 100).toFixed(2).replace(".", ",")} m`;

function foto(numero?: string, traje: "jogo" | "social" = "jogo"): string {
  return svgFoto({
    aparencia: estado.aparenciaFeita || estado.passo >= 7 ? estado.aparencia : null,
    camisa: clube()?.camisa ?? CAMISA_PADRAO, numero, traje,
    cenario: cenarioCompleto(estado.pais, estado.familia, estado.formacao),
  });
}

function historia(): string {
  const p = pais();
  if (!p) return "";
  const nome = esc(estado.nome.trim() || "Você");
  let t = `${nome} nasceu ${p.local}`;
  if (estado.familia) t += `, ${FAMILIA_FRASE[estado.familia]}`;
  const c = clube();
  if (c) t += c.id ? `, torcendo pelo ${esc(c.nome)}` : ", torcendo pelo time do bairro";
  if (estado.formacao) t += `, e ${FORMACAO_FRASE[estado.formacao]}`;
  return t + ".";
}

function opcao(id: string, grupo: string, titulo: string, texto: string, ativo: boolean, desabilitado = "", marca = "") {
  return `<button type="button" class="opcao${ativo ? " ativa" : ""}" data-grupo="${grupo}" data-id="${id}" ${desabilitado ? "disabled" : ""} aria-pressed="${ativo}">
    ${marca}<span class="opcao-corpo"><span class="opcao-titulo">${titulo}</span>${texto ? `<span class="opcao-texto">${texto}</span>` : ""}
    ${desabilitado ? `<span class="opcao-aviso">${desabilitado}</span>` : ""}</span></button>`;
}

function polaroid(): string {
  if (estado.passo === 0 || estado.passo >= 7) return "";
  const legenda = [pais()?.nome, estado.familia ? FAMILIAS.find((f) => f.id === estado.familia)!.nome : null, clube()?.apelido, estado.formacao ? FORMACOES.find((f) => f.id === estado.formacao)!.nome : null]
    .filter(Boolean).join(" · ");
  return `<figure class="polaroid"><div class="polaroid-foto">${foto()}</div><figcaption>${legenda || "A foto vai se montando com a sua história"}</figcaption></figure>`;
}

function telaPasso(): string {
  const p = estado.passo;
  const resumo = historia();
  const cab = (cap: string, titulo: string, sub = "") =>
    `<p class="capitulo">Capítulo ${p + 1} de ${PASSOS.length} · ${cap}</p><h1>${titulo}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}${polaroid()}${resumo && p > 1 && p < 8 ? `<p class="historia">${resumo}</p>` : ""}`;
  switch (p) {
    case 0:
      return `${cab("O nome", "Toda carreira começa com um nome na camisa.", "É assim que a torcida, a imprensa e o seu celular vão te chamar.")}
      <div class="campos">
        <label for="nome">Nome completo</label><input id="nome" maxlength="32" value="${esc(estado.nome)}" autocomplete="off">
        <label for="apelido">Nome na camisa</label><input id="apelido" maxlength="14" value="${esc(estado.apelido)}" autocomplete="off">
      </div>
      <button type="button" class="botao texto" id="exemplo">Ver um jogador de exemplo pronto</button>`;
    case 1:
      return `${cab("A origem", `${esc(estado.nome.split(" ")[0] || "Você")} nasceu em…`, "Cada país tem sua escola de futebol. O que ela deixou em você, só o DNA vai dizer.")}
      <div class="opcoes grade">${PAISES.map((x) => opcao(x.id, "pais", x.nome, "", estado.pais === x.id, "", `<span class="sigla-pais">${x.nacionalidade}</span>`)).join("")}</div>`;
    case 2:
      return `${cab("A família", "Em casa, a realidade era…")}
      <div class="opcoes">${FAMILIAS.map((f) => opcao(f.id, "familia", f.nome, f.descricao, estado.familia === f.id)).join("")}</div>`;
    case 3: {
      const fora = estado.pais && estado.pais !== "BRA";
      return `${cab("O clube do coração", "A primeira camisa que você ganhou foi a do…", fora ? "Aos 12 anos, a família se mudou para o Brasil. Foi lá que um time te conquistou." : "Um dia você vai jogar contra ele. Ou por ele.")}
      <div class="opcoes grade">${[...CLUBES, BAIRRO].map((c) => opcao(c.id || "bairro", "clube", c.nome, c.apelido, estado.clube === c.id, "",
        `<span class="escudo" style="--c1:${c.camisa.cor1};--c2:${c.camisa.cor2}"></span>`)).join("")}</div>`;
    }
    case 4:
      return `${cab("A formação", "A bola entrou na sua vida…")}
      <div class="opcoes">${FORMACOES.map((f) => {
        const ok = !estado.familia || formacaoPermitida(f.id, estado.familia);
        return opcao(f.id, "formacao", f.nome, f.descricao, estado.formacao === f.id, ok ? "" : "Exige família de classe média ou rica");
      }).join("")}</div>`;
    case 5:
      return `${cab("O corpo", "Aos 16 anos, no espelho do vestiário…")}
      <div class="campos">
        <label for="altura">Altura <output id="altura-valor">${altura(estado.alturaCm)}</output></label>
        <input id="altura" type="range" min="165" max="195" step="1" value="${estado.alturaCm}">
        <p class="efeito" id="altura-efeito">${fraseAltura(estado.alturaCm)}</p>
        <span class="rotulo">Pé dominante</span>
        <div class="segmentado" role="group" aria-label="Pé dominante">
          ${(["direito", "esquerdo", "ambidestro"] as Pe[]).map((pe) => `<button type="button" data-grupo="pe" data-id="${pe}" class="${estado.pe === pe ? "ativa" : ""}" aria-pressed="${estado.pe === pe}">${pe[0].toUpperCase() + pe.slice(1)}</button>`).join("")}
        </div>
        <p class="efeito">${estado.pe === "ambidestro" ? "Raro: chuta bem com as duas, mas o treino extra cobrou seu preço em outras áreas." : estado.pe === "esquerdo" ? "Canhoto: os zagueiros sempre estranham." : "A maioria é destra. Nada de errado nisso."}</p>
      </div>`;
    case 6:
      return `${cab("A posição", "Em campo, você se via como…")}
      <div class="opcoes">${POSICOES.map((po) => opcao(po.id, "posicao", po.nome,
        `${po.frase} <span class="pesam">Pesam mais: ${ATRIBUTOS.filter((a) => peso(po.id, a) === 3).map((a) => NOME_ATR[a]).join(", ")}.</span>`, estado.posicao === po.id)).join("")}</div>`;
    case 7:
      return `${cab("A aparência", "E era assim que você chegava no treino.")}
      <div class="avatar-editor">
        <div class="previa">
          <div class="avatar-grande">${foto(undefined, estado.traje)}</div>
          <div class="segmentado duplo" role="group" aria-label="Roupa na prévia">
            <button type="button" data-grupo="traje" data-id="jogo" class="${estado.traje === "jogo" ? "ativa" : ""}" aria-pressed="${estado.traje === "jogo"}">Uniforme</button>
            <button type="button" data-grupo="traje" data-id="social" class="${estado.traje === "social" ? "ativa" : ""}" aria-pressed="${estado.traje === "social"}">Fora de campo</button>
          </div>
        </div>
        <div class="controles">
          <div class="abas" role="tablist" aria-label="Partes da aparência">
            ${([["rosto", "Rosto"], ["olhos", "Olhos"], ["nariz", "Nariz e boca"], ["cabelo", "Cabelo"], ["roupa", "Roupa"]] as const).map(([id, nome]) =>
              `<button type="button" role="tab" data-grupo="aba" data-id="${id}" class="aba${estado.aba === id ? " ativa" : ""}" aria-selected="${estado.aba === id}">${nome}</button>`).join("")}
          </div>
          ${painelAparencia()}
        </div>
      </div>`;
    default:
      return telaRevelacao();
  }
}

function painelAparencia(): string {
  const a = estado.aparencia;
  const lista = (nomes: string[]) => nomes.map((nome, i) => ({ id: String(i), nome }));
  const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
  switch (estado.aba) {
    case "rosto":
      return grupoTexto("rosto", "Formato do rosto", lista(NOMES_ROSTO), String(a.rosto)) + grupoCores("tom", "Tom de pele", AMOSTRAS_TOM, a.tom, NOMES_TOM.map(cap));
    case "olhos":
      return grupoTexto("olhos", "Olhos", lista(NOMES_OLHOS), String(a.olhos)) + grupoTexto("sobrancelha", "Sobrancelha", lista(NOMES_SOBRANCELHA), String(a.sobrancelha))
        + `<p class="efeito">A sobrancelha acompanha a cor do cabelo.</p>`;
    case "nariz":
      return grupoTexto("nariz", "Nariz", lista(NOMES_NARIZ), String(a.nariz)) + grupoTexto("boca", "Boca", lista(NOMES_BOCA), String(a.boca));
    case "cabelo":
      return grupoTexto("cabelo", "Corte", lista(NOMES_CABELO), String(a.cabelo)) + grupoCores("corCabelo", "Cor do cabelo", AMOSTRAS_COR_CABELO, a.corCabelo, NOMES_COR_CABELO.map(cap))
        + `<p class="efeito">Dá para mudar o corte e pintar o cabelo depois, no salão.</p>`;
    case "roupa":
      return grupoTexto("roupaSocial", "Roupa fora de campo", (Object.keys(NOME_CASUAL) as RoupaCasual[]).map((id) => ({ id, nome: NOME_CASUAL[id] })), a.roupaSocial)
        + grupoCores("corSocial", "Cor", CORES_CASUAL, a.corSocial, NOMES_CASUAL_COR)
        + `<p class="efeito">Em campo, você veste o uniforme do clube. A camisa da foto é a do seu clube do coração até assinar o primeiro contrato.</p>`;
  }
}

function fraseAltura(cm: number): string {
  if (cm >= 188) return "Alto: vai bem no jogo aéreo, mas perde um pouco de arranque.";
  if (cm >= 181) return "Acima da média: o corpo ajuda nas divididas.";
  if (cm <= 170) return "Baixo: centro de gravidade lá embaixo.";
  return "Altura comum no futebol.";
}

function grupoCores(chave: keyof Aparencia, titulo: string, cores: string[], atual: number, nomes?: string[]) {
  return `<span class="rotulo">${titulo}</span><div class="amostras" role="group" aria-label="${titulo}">${cores.map((c, i) =>
    `<button type="button" class="amostra${i === atual ? " ativa" : ""}" data-grupo="ap-${chave}" data-id="${i}" style="--c:${c}" aria-label="${nomes ? nomes[i] : `Tom ${i + 1}`}" aria-pressed="${i === atual}"></button>`).join("")}</div>`;
}
function grupoTexto(chave: keyof Aparencia, titulo: string, itens: { id: string; nome: string }[], atual: string) {
  return `<span class="rotulo">${titulo}</span><div class="pilulas" role="group" aria-label="${titulo}">${itens.map((it) =>
    `<button type="button" class="pilula${it.id === atual ? " ativa" : ""}" data-grupo="ap-${chave}" data-id="${it.id}" aria-pressed="${it.id === atual}">${it.nome}</button>`).join("")}</div>`;
}

function escolhas(): EscolhasCriacao {
  return {
    nome: estado.nome.trim() || "Jogador", apelido: estado.apelido.trim() || undefined, pais: estado.pais!, familia: estado.familia!,
    formacao: estado.formacao!, alturaCm: estado.alturaCm, pe: estado.pe, posicao: estado.posicao!, clubeCoracao: estado.clube || undefined,
    semente: `${estado.nome}|${estado.pais}|${estado.familia}|${estado.formacao}|${estado.alturaCm}|${estado.pe}|${estado.posicao}|${estado.tentativa}`,
  };
}

function telaRevelacao(): string {
  const r = estado.resultado!;
  const e = r.escolhas;
  const pos = POSICOES.find((p) => p.id === e.posicao)!;
  const grupos: [string, Atributo[]][] = [
    ["Físico", ATRIBUTOS.filter((a) => GRUPO[a] === "fisico")],
    ["Técnico", ATRIBUTOS.filter((a) => GRUPO[a] === "tecnico")],
    ["Tático", ATRIBUTOS.filter((a) => GRUPO[a] === "tatico")],
  ];
  const linha = (a: Atributo) => {
    const v = r.atributos[a], principal = peso(e.posicao, a) === 3;
    return `<li class="${principal ? "principal" : ""}"><span class="sigla">${NOME_ATR[a]}</span><span class="barra"><span style="width:${v}%"></span></span><span class="valor">${v}</span></li>`;
  };
  const camisa = esc((e.apelido ?? e.nome).toUpperCase());
  const c = clube();
  const peneira = r.peneira ? `<p class="peneira ${r.peneira.aprovado ? "ok" : "nao"}">${esc(r.peneira.texto)}</p>` : "";
  return `<p class="capitulo">Capítulo 9 de 9 · O DNA</p>
    <h1>${esc(e.nome)}, ${pos.nome.toLowerCase()}, 16 anos.</h1>
    <p class="historia">${historia()}</p>
    ${peneira}
    <div class="cena">
      <div class="card${estado.aberto ? " aberto" : ""}" id="card" role="button" tabindex="0" aria-label="${estado.aberto ? "Card do jogador" : "Abrir o card"}">
        <div class="face costas">
          <div class="costas-marca"><span>Mycarrerinha</span><strong>16</strong><em>Toque para abrir</em></div>
        </div>
        <div class="face frente">
          <div class="card-topo">
            <div class="ovr"><span class="ovr-num">${r.ovr}</span><span class="ovr-pos">${e.posicao}</span><span class="ovr-nac">${r.nacionalidade}</span></div>
            <div class="card-foto">${foto("16")}</div>
          </div>
          <p class="card-nome">${camisa}</p>
          <p class="card-estilo">${estiloDeJogo(r).rotulo}</p>
          <div class="card-grade">
            ${grupos.map(([g, ats]) => `<div><span class="card-grupo">${g}</span><span class="card-media">${Math.round(ats.reduce((s, a) => s + r.atributos[a], 0) / ats.length)}</span></div>`).join("")}
          </div>
          <p class="card-pot">Olheiros: potencial ${r.faixaPotencial[0]}–${r.faixaPotencial[1]}</p>
        </div>
      </div>
    </div>
    <div class="depois"${estado.aberto ? "" : " hidden"}>
      ${painelPerfil()}
      <section class="painel">
        <h2>DNA completo</h2>
        ${grupos.map(([g, ats]) => `<p class="verso-grupo">${g}</p><ul class="atributos">${ats.map(linha).join("")}</ul>`).join("")}
        <p class="legenda">Em dourado, o que mais pesa para um ${pos.nome.toLowerCase()}.</p>
      </section>
      <section class="painel">
        <h2>Traços de nascença</h2>
        <ul class="tracos">${r.tracos.map((t) => `<li><strong>${TRACOS[t].nome}</strong><span>${TRACOS[t].efeito}</span></li>`).join("")}</ul>
      </section>
      <section class="painel ficha">
        <div class="larga fora-de-campo"><div class="mini-foto">${foto(undefined, "social")}</div><div><span class="rotulo">Fora de campo</span><strong>${NOME_CASUAL[estado.aparencia.roupaSocial]} ${NOMES_CASUAL_COR[estado.aparencia.corSocial].toLowerCase()}</strong></div></div>
        <div><span class="rotulo">Altura</span><strong>${altura(e.alturaCm)}</strong></div>
        <div><span class="rotulo">Pé</span><strong>${e.pe[0].toUpperCase() + e.pe.slice(1)}</strong></div>
        <div><span class="rotulo">Dinheiro</span><strong>R$ ${r.dinheiroInicial.toLocaleString("pt-BR")}</strong></div>
        <div><span class="rotulo">Agente</span><strong>Seu pai</strong></div>
        <div class="larga"><span class="rotulo">Clube do coração</span><strong>${c && c.id ? esc(c.nome) : "Time do bairro"}</strong></div>
        <div class="larga"><span class="rotulo">Personalidade</span><strong>Será revelada nos primeiros meses de clube</strong></div>
      </section>
      <div class="acoes-final">
        <button type="button" class="botao primario" id="guardar">${__CARREIRA__ ? "Começar a carreira" : "Guardar este jogador"}</button>
        <button type="button" class="botao" id="sortear">Sortear outro DNA</button>
        <button type="button" class="botao texto" id="refazer">Mudar escolhas</button>
      </div>
      <p class="aviso" id="aviso" role="status"></p>
    </div>`;
}

function painelPerfil(): string {
  const pf = estado.perfil;
  if (!pf) return "";
  const ev = pf.evento;
  const escolhida = ev?.opcoes.find((o) => o.id === estado.decisao);
  const efeitos = [
    pf.efeitos.seguidores ? `${pf.efeitos.seguidores.toLocaleString("pt-BR")} seguidores` : "",
    pf.efeitos.fama ? `fama ${pf.efeitos.fama}` : "",
    pf.efeitos.bonusEvolucao ? "evolui mais rápido no treino" : "",
    pf.efeitos.forcaMinimaClubeInicial ? "começa na base de um clube grande" : "",
    pf.efeitos.vidaNoturna ? "atraído pela noite" : "",
  ].filter(Boolean);
  return `<section class="painel perfil">
    <p class="perfil-rotulo">Seu perfil</p>
    <h2 class="perfil-nome">${pf.nome}</h2>
    <p class="perfil-texto">${pf.descricao}</p>
    ${efeitos.length ? `<p class="perfil-efeitos">${efeitos.join(" · ")}</p>` : ""}
    ${ev ? `<div class="mensagem">
      <p class="mensagem-de">${esc(ev.remetente)}</p>
      <p class="mensagem-titulo">${esc(ev.titulo)}</p>
      <p class="mensagem-texto">${esc(ev.texto)}</p>
      ${ev.opcoes.length ? (escolhida ? `<p class="mensagem-resultado">${esc(escolhida.resultado)}</p>` : `<div class="mensagem-opcoes">${ev.opcoes.map((o, i) =>
        `<button type="button" class="botao${i === 0 ? " primario" : ""}" data-grupo="decisao" data-id="${o.id}">${esc(o.rotulo)}</button>`).join("")}</div>`) : ""}
    </div>` : ""}
  </section>`;
}

function podeAvancar(): boolean {
  switch (estado.passo) {
    case 0: return estado.nome.trim().length >= 2;
    case 1: return !!estado.pais;
    case 2: return !!estado.familia;
    case 3: return estado.clube !== null;
    case 4: return !!estado.formacao && (!estado.familia || formacaoPermitida(estado.formacao, estado.familia));
    case 6: return !!estado.posicao;
    default: return true;
  }
}

let passoAnterior = -1;
function render() {
  const p = estado.passo;
  if (p !== passoAnterior) { clearTimeout(timerNotif); $("#notificacao").hidden = true; passoAnterior = p; }
  $("#progresso").innerHTML = PASSOS.map((n, i) => `<li class="${i < p ? "feito" : i === p ? "atual" : ""}"><span>${n}</span></li>`).join("");
  $("#conteudo").innerHTML = telaPasso();
  $("#navegacao").hidden = p >= 8;
  ($("#voltar") as HTMLButtonElement).disabled = p === 0;
  const av = $("#avancar") as HTMLButtonElement;
  av.disabled = !podeAvancar();
  av.textContent = p === 7 ? "Revelar o DNA" : "Continuar";
  ligarEventos();
}

function notificar(titulo: string, texto: string) {
  const n = $("#notificacao");
  n.innerHTML = `<strong>${esc(titulo)}</strong><span>${esc(texto)}</span>`;
  n.hidden = false;
  n.classList.remove("sai");
  clearTimeout(timerNotif);
  timerNotif = window.setTimeout(() => { n.classList.add("sai"); timerNotif = window.setTimeout(() => (n.hidden = true), 300); }, 4200);
}

function ligarEventos() {
  const nome = document.getElementById("nome") as HTMLInputElement | null;
  nome?.addEventListener("input", () => { estado.nome = nome.value; ($("#avancar") as HTMLButtonElement).disabled = !podeAvancar(); });
  const apelido = document.getElementById("apelido") as HTMLInputElement | null;
  apelido?.addEventListener("input", () => { estado.apelido = apelido.value; });
  const alt = document.getElementById("altura") as HTMLInputElement | null;
  alt?.addEventListener("input", () => {
    estado.alturaCm = Number(alt.value);
    $("#altura-valor").textContent = altura(estado.alturaCm);
    $("#altura-efeito").textContent = fraseAltura(estado.alturaCm);
  });
  document.querySelectorAll<HTMLButtonElement>("[data-grupo]").forEach((b) => b.addEventListener("click", () => escolher(b.dataset.grupo!, b.dataset.id!)));
  const card = document.getElementById("card");
  const abrir = () => {
    if (estado.aberto) return;
    estado.aberto = true;
    card!.classList.add("aberto");
    card!.setAttribute("aria-label", "Card do jogador");
    window.setTimeout(() => { const d = document.querySelector<HTMLElement>(".depois"); if (d) d.hidden = false; }, 700);
  };
  card?.addEventListener("click", abrir);
  card?.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); abrir(); } });
  document.getElementById("exemplo")?.addEventListener("click", () => {
    Object.assign(estado, { pais: "BRA", familia: "humilde", clube: "FLA", formacao: "rua", posicao: "PON", alturaCm: 174, pe: "esquerdo", aparenciaFeita: true });
    estado.aparencia = { ...estado.aparencia, tom: 4, cabelo: 4, corCabelo: 1, olhos: 0, boca: 1 };
    gerar(); estado.passo = 8; render(); window.scrollTo(0, 0);
  });
  document.getElementById("sortear")?.addEventListener("click", () => { estado.tentativa++; gerar(); render(); window.scrollTo(0, 0); });
  document.getElementById("refazer")?.addEventListener("click", () => { estado.passo = 1; render(); window.scrollTo(0, 0); });
  document.getElementById("guardar")?.addEventListener("click", () => {
    const aviso = $("#aviso");
    try {
      localStorage.setItem("mycarrerinha:jogador", JSON.stringify({ resultado: estado.resultado, aparencia: estado.aparencia, clube: estado.clube, perfil: estado.perfil?.id, decisao: estado.decisao }));
      if (__CARREIRA__) { localStorage.removeItem("mycarrerinha:save"); localStorage.removeItem("mycarrerinha:plano"); location.href = "index.html"; return; }
      aviso.textContent = "Jogador guardado neste navegador. A próxima tela, a primeira semana no clube, vai começar com ele.";
    } catch {
      aviso.textContent = "Este navegador não deixou guardar o jogador. Ele continua aqui enquanto a página estiver aberta.";
    }
  });
}

function escolher(grupo: string, id: string) {
  if (grupo === "pais") {
    estado.pais = id as PaisId;
    const p = pais()!;
    notificar(`Nascido ${p.local}`, p.nota);
  } else if (grupo === "familia") {
    estado.familia = id as FamiliaId;
    if (estado.formacao && !formacaoPermitida(estado.formacao, estado.familia)) estado.formacao = null;
    notificar(FAMILIAS.find((f) => f.id === id)!.nome, NOTIF_FAMILIA[id as FamiliaId]);
  } else if (grupo === "clube") {
    estado.clube = id === "bairro" ? "" : id;
    const c = clube()!;
    notificar(c.id ? `Torcedor do ${c.apelido}` : "Time do bairro", c.id ? "A camisa já está na foto. Um dia você pode vestir a de verdade." : "Sem clube grande no coração. Livre para vestir qualquer camisa.");
  } else if (grupo === "formacao") {
    estado.formacao = id as FormacaoId;
    notificar(FORMACOES.find((f) => f.id === id)!.nome, NOTIF_FORMACAO[id as FormacaoId]);
  } else if (grupo === "pe") estado.pe = id as Pe;
  else if (grupo === "posicao") estado.posicao = id as Posicao;
  else if (grupo === "aba") { estado.aba = id as Estado["aba"]; if (id === "roupa") estado.traje = "social"; }
  else if (grupo === "traje") estado.traje = id as Estado["traje"];
  else if (grupo === "decisao") {
    estado.decisao = id;
    const op = estado.perfil?.evento?.opcoes.find((o) => o.id === id);
    if (op) notificar("Decisão tomada", op.resultado);
  }
  else if (grupo.startsWith("ap-")) {
    const chave = grupo.slice(3) as keyof Aparencia;
    const numerico = chave !== "roupaSocial";
    (estado.aparencia as unknown as Record<string, unknown>)[chave] = numerico ? Number(id) : id;
  }
  render();
}

function gerar() {
  estado.resultado = criarJogador(escolhas());
  estado.perfil = definirPerfil(estado.resultado);
  estado.decisao = null;
  estado.aberto = false;
}

$("#voltar").addEventListener("click", () => { if (estado.passo > 0) { estado.passo--; render(); window.scrollTo(0, 0); } });
$("#avancar").addEventListener("click", () => {
  if (!podeAvancar()) return;
  if (estado.passo === 7) { estado.aparenciaFeita = true; gerar(); }
  estado.passo++;
  render();
  window.scrollTo(0, 0);
});

render();
