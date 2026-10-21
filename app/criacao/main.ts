// Tela de criação do jogador em história guiada. Usa o DNA do motor (src/dna.ts).
import {
  ESCOLAS, FORMACOES, FAMILIAS, TRACOS, criarJogador, formacaoPermitida,
  type EscolaId, type FamiliaId, type FormacaoId, type Pe, type EscolhasCriacao, type ResultadoCriacao,
} from "../../src/dna.js";
import { ATRIBUTOS, GRUPO, peso, type Atributo, type Posicao } from "../../src/atributos.js";
import { svgAvatar, APARENCIA_PADRAO, PELES, CORES_CABELO, NOMES_CABELO_COR, CORES_OLHOS, NOMES_OLHOS, ROSTOS, CABELOS, type Aparencia } from "./avatar.js";

const NOME_ATR: Record<Atributo, string> = {
  VEL: "Velocidade", RES: "Resistência", FOR: "Força", PAS: "Passe", CRU: "Cruzamento", DRI: "Drible",
  FIN: "Finalização", CAB: "Cabeceio", MAR: "Marcação", VIS: "Visão", POS: "Posicionamento", COM: "Compostura",
};
const POSICOES: { id: Posicao; nome: string; frase: string }[] = [
  { id: "ZAG", nome: "Zagueiro", frase: "o último homem, que ganha no alto e não deixa passar" },
  { id: "LAT", nome: "Lateral", frase: "quem sobe e desce o jogo inteiro pela linha" },
  { id: "VOL", nome: "Volante", frase: "o primeiro a roubar e o primeiro a passar" },
  { id: "MEI", nome: "Meia", frase: "o cérebro que enxerga o passe antes de todo mundo" },
  { id: "PON", nome: "Ponta", frase: "o que encara o lateral no um contra um" },
  { id: "ATA", nome: "Centroavante", frase: "o nome que a torcida grita depois do gol" },
];
const LOCAL: Record<EscolaId, string> = {
  BRA: "no Brasil", ARG_URU: "na Argentina", ESP_NED: "na Espanha", GER: "na Alemanha", ITA: "na Itália",
  ENG: "na Inglaterra", FRA: "na França", AFO: "no Senegal", JPN_KOR: "no Japão",
};
const FAMILIA_FRASE: Record<FamiliaId, string> = { humilde: "numa família humilde", media: "numa família de classe média", rica: "numa família rica" };
const FORMACAO_FRASE: Record<FormacaoId, string> = {
  rua: "aprendeu a jogar na rua", futsal: "cresceu nas quadras de futsal", praia: "aprendeu na areia da praia",
  escolinha: "começou na escolinha do bairro", academia: "treinou numa academia particular", base_grande: "tentou a peneira de um clube grande",
};

interface Estado {
  passo: number;
  nome: string;
  apelido: string;
  escola: EscolaId | null;
  familia: FamiliaId | null;
  formacao: FormacaoId | null;
  alturaCm: number;
  pe: Pe;
  posicao: Posicao | null;
  aparencia: Aparencia;
  tentativa: number;
  resultado: ResultadoCriacao | null;
  virado: boolean;
}

const estado: Estado = {
  passo: 0, nome: "Gabriel Souza", apelido: "Gabi", escola: "BRA", familia: null, formacao: null, alturaCm: 178, pe: "direito",
  posicao: null, aparencia: { ...APARENCIA_PADRAO }, tentativa: 0, resultado: null, virado: false,
};

const PASSOS = ["Nome", "Origem", "Família", "Formação", "Corpo", "Posição", "Aparência", "DNA"];
const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const sinal = (n: number) => (n > 0 ? `+${n}` : `${n}`);

function chips(mods: Partial<Record<Atributo, number>>): string {
  return Object.entries(mods).filter(([, v]) => v).map(([a, v]) => `<span class="chip ${v! > 0 ? "pos" : "neg"}">${sinal(v!)} ${a}</span>`).join("");
}

function historia(): string {
  const partes: string[] = [];
  const nome = esc(estado.nome.trim() || "Você");
  if (estado.escola) partes.push(`${nome} nasceu ${LOCAL[estado.escola]}`);
  if (estado.familia) partes.push(FAMILIA_FRASE[estado.familia]);
  let t = partes.join(", ");
  if (estado.formacao) t += ` e ${FORMACAO_FRASE[estado.formacao]}`;
  return t ? t + "." : "";
}

function opcao(id: string, grupo: string, titulo: string, texto: string, ativo: boolean, extra = "", desabilitado = "") {
  return `<button type="button" class="opcao${ativo ? " ativa" : ""}" data-grupo="${grupo}" data-id="${id}" ${desabilitado ? "disabled" : ""} aria-pressed="${ativo}">
    <span class="opcao-titulo">${titulo}</span><span class="opcao-texto">${texto}</span>${extra ? `<span class="chips">${extra}</span>` : ""}
    ${desabilitado ? `<span class="opcao-aviso">${desabilitado}</span>` : ""}</button>`;
}

function telaPasso(): string {
  const p = estado.passo;
  const resumo = historia();
  const cab = (cap: string, titulo: string, sub = "") =>
    `<p class="capitulo">Capítulo ${p + 1} · ${cap}</p><h1>${titulo}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}${resumo && p > 1 ? `<p class="historia">${resumo}</p>` : ""}`;
  switch (p) {
    case 0:
      return `${cab("O nome", "Toda carreira começa com um nome na camisa.", "É assim que a torcida, a imprensa e o seu celular vão te chamar.")}
      <div class="campos">
        <label for="nome">Nome completo</label><input id="nome" maxlength="32" value="${esc(estado.nome)}" autocomplete="off">
        <label for="apelido">Nome na camisa</label><input id="apelido" maxlength="14" value="${esc(estado.apelido)}" autocomplete="off">
      </div>
      <button type="button" class="botao texto" id="exemplo">Ver um jogador de exemplo pronto</button>`;
    case 1:
      return `${cab("A origem", `${esc(estado.nome || "Você")} nasceu em…`, "O país define a escola de futebol, a língua e a seleção. As tendências são só o ponto de partida.")}
      <div class="opcoes">${ESCOLAS.map((e) => opcao(e.id, "escola", e.nome, e.descricao, estado.escola === e.id, chips(e.mods))).join("")}</div>`;
    case 2:
      return `${cab("A família", "Em casa, a realidade era…")}
      <div class="opcoes">${FAMILIAS.map((f) => opcao(f.id, "familia", f.nome, f.descricao, estado.familia === f.id, chips(f.mods) + `<span class="chip neutro">R$ ${f.dinheiro.toLocaleString("pt-BR")} iniciais</span>`)).join("")}</div>`;
    case 3:
      return `${cab("A formação", "A bola entrou na sua vida…")}
      <div class="opcoes">${FORMACOES.map((f) => {
        const ok = !estado.familia || formacaoPermitida(f.id, estado.familia);
        const extra = chips(f.mods) + (f.pot ? `<span class="chip pos">+${f.pot} potencial</span>` : "") + (f.id === "base_grande" ? `<span class="chip neutro">depende da peneira</span>` : "");
        return opcao(f.id, "formacao", f.nome, f.descricao, estado.formacao === f.id, extra, ok ? "" : "Exige família de classe média ou rica");
      }).join("")}</div>`;
    case 4: {
      const cm = estado.alturaCm;
      const ef: string[] = [];
      if (cm > 180) ef.push(`+${Math.floor((cm - 180) / 5)} CAB e FOR`);
      if (cm > 185) ef.push(`${-Math.floor((cm - 185) / 5)} VEL`);
      return `${cab("O corpo", "Aos 16 anos, no espelho do vestiário…")}
      <div class="campos">
        <label for="altura">Altura <output id="altura-valor">${(cm / 100).toFixed(2).replace(".", ",")} m</output></label>
        <input id="altura" type="range" min="165" max="195" step="1" value="${cm}">
        <p class="efeito" id="altura-efeito">${ef.length ? ef.join(" · ") : "Sem efeito nos atributos"}</p>
        <span class="rotulo">Pé dominante</span>
        <div class="segmentado" role="group" aria-label="Pé dominante">
          ${(["direito", "esquerdo", "ambidestro"] as Pe[]).map((pe) => `<button type="button" data-grupo="pe" data-id="${pe}" class="${estado.pe === pe ? "ativa" : ""}" aria-pressed="${estado.pe === pe}">${pe[0].toUpperCase() + pe.slice(1)}</button>`).join("")}
        </div>
        <p class="efeito">${estado.pe === "ambidestro" ? "+3 DRI e FIN, custa 10 pontos nos outros atributos" : "Sem custo"}</p>
      </div>`;
    }
    case 5:
      return `${cab("A posição", "Em campo, você se via como…")}
      <div class="opcoes">${POSICOES.map((po) => {
        const principais = ATRIBUTOS.filter((a) => peso(po.id, a) === 3).join(" · ");
        return opcao(po.id, "posicao", po.nome, po.frase, estado.posicao === po.id, `<span class="chip neutro">${principais}</span>`);
      }).join("")}</div>`;
    case 6:
      return `${cab("A aparência", "E era assim que você chegava no treino.")}
      <div class="avatar-editor">
        <div class="avatar-grande">${svgAvatar(estado.aparencia)}</div>
        <div class="controles">
          ${grupoCores("pele", "Tom de pele", PELES, estado.aparencia.pele)}
          ${grupoTexto("rosto", "Rosto", ROSTOS, estado.aparencia.rosto)}
          ${grupoTexto("cabelo", "Cabelo", CABELOS, estado.aparencia.cabelo)}
          ${grupoCores("corCabelo", "Cor do cabelo", CORES_CABELO, estado.aparencia.corCabelo, NOMES_CABELO_COR)}
          ${grupoCores("olhos", "Olhos", CORES_OLHOS, estado.aparencia.olhos, NOMES_OLHOS)}
          <label for="sobrancelha" class="rotulo">Sobrancelha</label>
          <input id="sobrancelha" type="range" min="2" max="5" step="0.5" value="${estado.aparencia.sobrancelha}">
        </div>
      </div>`;
    default:
      return telaRevelacao();
  }
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
    nome: estado.nome.trim() || "Jogador", apelido: estado.apelido.trim() || undefined, escola: estado.escola!, familia: estado.familia!,
    formacao: estado.formacao!, alturaCm: estado.alturaCm, pe: estado.pe, posicao: estado.posicao!,
    semente: `${estado.nome}|${estado.escola}|${estado.familia}|${estado.formacao}|${estado.alturaCm}|${estado.pe}|${estado.posicao}|${estado.tentativa}`,
  };
}

function telaRevelacao(): string {
  const r = estado.resultado!;
  const e = r.escolhas;
  const pos = POSICOES.find((p) => p.id === e.posicao)!;
  const escola = ESCOLAS.find((x) => x.id === e.escola)!;
  const grupos: [string, Atributo[]][] = [
    ["Físico", ATRIBUTOS.filter((a) => GRUPO[a] === "fisico")],
    ["Técnico", ATRIBUTOS.filter((a) => GRUPO[a] === "tecnico")],
    ["Tático", ATRIBUTOS.filter((a) => GRUPO[a] === "tatico")],
  ];
  const linha = (a: Atributo) => {
    const v = r.atributos[a], m = r.modsAplicados[a] ?? 0, principal = peso(e.posicao, a) === 3;
    return `<li class="${principal ? "principal" : ""}"><span class="sigla" title="${NOME_ATR[a]}">${a}</span>
      <span class="barra"><span style="width:${v}%"></span></span><span class="valor">${v}</span>
      <span class="mod ${m > 0 ? "pos" : m < 0 ? "neg" : ""}">${m ? sinal(m) : ""}</span></li>`;
  };
  const camisa = esc((e.apelido ?? e.nome).toUpperCase());
  return `<p class="capitulo">Capítulo 8 · O DNA</p>
    <h1>${esc(e.nome)}, ${pos.nome.toLowerCase()}, 16 anos.</h1>
    <p class="historia">${historia().replace(/\.$/, "")}${r.peneira ? `. ${esc(r.peneira.texto)}` : "."}</p>
    <div class="cena">
      <div class="card${estado.virado ? " virado" : ""}" id="card">
        <div class="face frente">
          <div class="card-topo">
            <div class="ovr"><span class="ovr-num">${r.ovr}</span><span class="ovr-pos">${e.posicao}</span><span class="ovr-nac">${escola.nacionalidade}</span></div>
            <div class="card-avatar">${svgAvatar({ ...estado.aparencia, camisa: "#17362D" }, "16")}</div>
          </div>
          <p class="card-nome">${camisa}</p>
          <div class="card-grade">
            ${grupos.map(([g, ats]) => `<div><span class="card-grupo">${g}</span><span class="card-media">${Math.round(ats.reduce((s, a) => s + r.atributos[a], 0) / ats.length)}</span></div>`).join("")}
          </div>
          <p class="card-pot">Olheiros: potencial ${r.faixaPotencial[0]}–${r.faixaPotencial[1]}</p>
          <p class="card-dica">Toque para ver o DNA completo</p>
        </div>
        <div class="face verso">
          <p class="verso-titulo">DNA completo</p>
          ${grupos.map(([g, ats]) => `<p class="verso-grupo">${g}</p><ul class="atributos">${ats.map(linha).join("")}</ul>`).join("")}
          <p class="legenda">Em destaque, os atributos principais da posição. À direita, quanto veio do país, da formação, da família e do corpo.</p>
        </div>
      </div>
    </div>
    <section class="painel">
      <h2>Traços de nascença</h2>
      <ul class="tracos">${r.tracos.map((t) => `<li><strong>${TRACOS[t].nome}</strong><span>${TRACOS[t].efeito}</span></li>`).join("")}</ul>
    </section>
    <section class="painel ficha">
      <div><span class="rotulo">Altura</span><strong>${(e.alturaCm / 100).toFixed(2).replace(".", ",")} m</strong></div>
      <div><span class="rotulo">Pé</span><strong>${e.pe[0].toUpperCase() + e.pe.slice(1)}</strong></div>
      <div><span class="rotulo">Dinheiro</span><strong>R$ ${r.dinheiroInicial.toLocaleString("pt-BR")}</strong></div>
      <div><span class="rotulo">Agente</span><strong>Seu pai</strong></div>
      <div class="larga"><span class="rotulo">Personalidade</span><strong>Será revelada nos primeiros meses de clube</strong></div>
    </section>
    <div class="acoes-final">
      <button type="button" class="botao primario" id="guardar">Guardar este jogador</button>
      <button type="button" class="botao" id="sortear">Sortear outro DNA</button>
      <button type="button" class="botao texto" id="refazer">Mudar escolhas</button>
    </div>
    <p class="aviso" id="aviso" role="status"></p>`;
}

function podeAvancar(): boolean {
  switch (estado.passo) {
    case 0: return estado.nome.trim().length >= 2;
    case 1: return !!estado.escola;
    case 2: return !!estado.familia;
    case 3: return !!estado.formacao && (!estado.familia || formacaoPermitida(estado.formacao, estado.familia));
    case 5: return !!estado.posicao;
    default: return true;
  }
}

function render() {
  const p = estado.passo;
  $("#progresso").innerHTML = PASSOS.map((n, i) => `<li class="${i < p ? "feito" : i === p ? "atual" : ""}"><span>${n}</span></li>`).join("");
  $("#conteudo").innerHTML = telaPasso();
  const nav = $("#navegacao");
  nav.hidden = p >= 7;
  ($("#voltar") as HTMLButtonElement).disabled = p === 0;
  const av = $("#avancar") as HTMLButtonElement;
  av.disabled = !podeAvancar();
  av.textContent = p === 6 ? "Revelar o DNA" : "Continuar";
  ligarEventos();
}

function ligarEventos() {
  const nome = document.getElementById("nome") as HTMLInputElement | null;
  if (nome) nome.addEventListener("input", () => { estado.nome = nome.value; ($("#avancar") as HTMLButtonElement).disabled = !podeAvancar(); });
  const apelido = document.getElementById("apelido") as HTMLInputElement | null;
  if (apelido) apelido.addEventListener("input", () => { estado.apelido = apelido.value; });
  const altura = document.getElementById("altura") as HTMLInputElement | null;
  if (altura) altura.addEventListener("input", () => {
    estado.alturaCm = Number(altura.value);
    const cm = estado.alturaCm, ef: string[] = [];
    if (cm > 180) ef.push(`+${Math.floor((cm - 180) / 5)} CAB e FOR`);
    if (cm > 185) ef.push(`${-Math.floor((cm - 185) / 5)} VEL`);
    $("#altura-valor").textContent = `${(cm / 100).toFixed(2).replace(".", ",")} m`;
    $("#altura-efeito").textContent = ef.length ? ef.join(" · ") : "Sem efeito nos atributos";
  });
  const sob = document.getElementById("sobrancelha") as HTMLInputElement | null;
  if (sob) sob.addEventListener("input", () => { estado.aparencia.sobrancelha = Number(sob.value); $(".avatar-grande").innerHTML = svgAvatar(estado.aparencia); });
  document.querySelectorAll<HTMLButtonElement>("[data-grupo]").forEach((b) => b.addEventListener("click", () => escolher(b.dataset.grupo!, b.dataset.id!)));
  const card = document.getElementById("card");
  if (card) card.addEventListener("click", () => { estado.virado = !estado.virado; card.classList.toggle("virado", estado.virado); });
  document.getElementById("exemplo")?.addEventListener("click", () => {
    Object.assign(estado, { escola: "BRA", familia: "humilde", formacao: "rua", posicao: "PON", alturaCm: 174, pe: "esquerdo" });
    estado.aparencia = { ...estado.aparencia, pele: 3, cabelo: "cacheado", corCabelo: 0 };
    gerar(); estado.passo = 7; render(); window.scrollTo(0, 0);
  });
  document.getElementById("sortear")?.addEventListener("click", () => { estado.tentativa++; gerar(); render(); });
  document.getElementById("refazer")?.addEventListener("click", () => { estado.passo = 1; estado.virado = false; render(); window.scrollTo(0, 0); });
  document.getElementById("guardar")?.addEventListener("click", () => {
    const aviso = $("#aviso");
    try {
      localStorage.setItem("mycarrerinha:jogador", JSON.stringify({ resultado: estado.resultado, aparencia: estado.aparencia }));
      aviso.textContent = "Jogador guardado neste navegador. A próxima tela, a primeira semana no clube, vai começar com ele.";
    } catch {
      aviso.textContent = "Este navegador não deixou guardar o jogador. Ele continua aqui enquanto a página estiver aberta.";
    }
  });
}

function escolher(grupo: string, id: string) {
  if (grupo === "escola") estado.escola = id as EscolaId;
  else if (grupo === "familia") {
    estado.familia = id as FamiliaId;
    if (estado.formacao && !formacaoPermitida(estado.formacao, estado.familia)) estado.formacao = null;
  } else if (grupo === "formacao") estado.formacao = id as FormacaoId;
  else if (grupo === "pe") estado.pe = id as Pe;
  else if (grupo === "posicao") estado.posicao = id as Posicao;
  else if (grupo.startsWith("ap-")) {
    const chave = grupo.slice(3) as keyof Aparencia;
    const numerico = chave === "pele" || chave === "corCabelo" || chave === "olhos";
    (estado.aparencia as unknown as Record<string, unknown>)[chave] = numerico ? Number(id) : id;
  }
  render();
}

function gerar() {
  estado.resultado = criarJogador(escolhas());
  estado.virado = false;
}

$("#voltar").addEventListener("click", () => { if (estado.passo > 0) { estado.passo--; render(); window.scrollTo(0, 0); } });
$("#avancar").addEventListener("click", () => {
  if (!podeAvancar()) return;
  if (estado.passo === 6) gerar();
  estado.passo++;
  render();
  window.scrollTo(0, 0);
});

// Exemplo pronto para quem abre a página: um jogador já com algumas escolhas feitas.
render();
