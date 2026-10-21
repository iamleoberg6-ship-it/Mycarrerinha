// Tela da casa: maquete isométrica com móveis arrastáveis, catálogo por categoria e estilo,
// reforma de paredes e piso, depósito e imobiliária.
import {
  CATALOGO, CATEGORIAS, CATEGORIAS_IMOVEL, ESTILOS, IMOVEIS, IMOVEL, ITENS, NOMES_EFEITO, REVEST, REVESTIMENTOS, TETO, TIPOS,
  acabamento, areaM2, bonusDeEstilo, cabe, comodoDe, comprar, conforto, dinheiro, efeitosDaCasa, fecharMes, girar, guardar,
  imovelAtual, mover, mudar, novoEstado, patrimonio, podeMudar, podeReformar, precoAcabamento, precoTrocaCor, reformar,
  rendaMinima, tirarDoDeposito, trocarCor, vender, VALOR_REVENDA, alojamentosDoClube, estruturaDoClube, ESTRUTURAS, ehDono, motivoNaoCabe, nomeImovel, travado, NOME_COMODO,
  type Acabamento, type Categoria, type CategoriaImovel, type Efeitos, type Estilo, type EstadoCasa, type Item, type Objeto, type TipoComodo,
} from "../../src/casa";
import { CLUBES_CASA } from "../../src/clubes";
import { salarioLiquido, type Save } from "../../src/jogo";
import { svgComodo, svgFantasma, svgItem, svgRevestimento, telaParaChao } from "./iso";

const FASES = [
  { id: "base", nome: "Base", salario: 2000 },
  { id: "contrato", nome: "Primeiro contrato", salario: 25000 },
  { id: "titular", nome: "Titular", salario: 180000 },
  { id: "estrela", nome: "Estrela", salario: 1200000 },
  { id: "lenda", nome: "Lenda", salario: 4000000 },
];
const CAT_DO_COMODO: Record<TipoComodo, Categoria> = {
  quarto: "dormir", kitnet: "dormir", sala: "sala", cozinha: "cozinha", banheiro: "banheiro", escritorio: "sala",
  academia: "treino", jogos: "lazer", trofeus: "decoracao", externo: "externo", garagem: "garagem",
};

const CHAVE = "mycarrerinha-casa-v3";
interface Salvo { e: EstadoCasa; fase: string; comodo: string }
const CLUBE_PADRAO = CLUBES_CASA.find((c) => c.id === "PAL") ?? CLUBES_CASA[0];
/** No jogo completo a casa vive dentro do save da carreira: dinheiro e salário vêm de lá. */
const CHAVE_CARREIRA = "mycarrerinha:save";
const carreira: Save | null = (() => { try { return JSON.parse(localStorage.getItem(CHAVE_CARREIRA) ?? "null") as Save | null; } catch { return null; } })();
function carregar(): Salvo {
  if (carreira?.casa) return { e: carreira.casa, fase: "carreira", comodo: carreira.casa.imovel ? IMOVEL[carreira.casa.imovel].comodos[0].id : "quarto" };
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE) ?? "null") as Salvo | null;
    if (s && IMOVEL[s.e.imovel] && s.e.objetos.every((o) => ITENS[o.item])) return s;
  } catch { /* sem armazenamento */ }
  return { e: novoEstado(3000, "aloj-ct", CLUBE_PADRAO), fase: "base", comodo: "quarto" };
}
const st = carregar();
const salvar = () => { try { if (carreira) { carreira.casa = st.e; localStorage.setItem(CHAVE_CARREIRA, JSON.stringify(carreira)); } else localStorage.setItem(CHAVE, JSON.stringify(st)); } catch { /* ok */ } };
const ui = {
  sel: undefined as string | undefined, brilho: undefined as string | undefined,
  aba: "moveis" as "moveis" | "reforma" | "deposito",
  cat: "auto" as Categoria | "todos" | "auto", estilo: "todos" as Estilo | "todos",
  lugarReforma: "parede" as "parede" | "piso", previa: undefined as { lugar: "parede" | "piso"; ac: Acabamento } | undefined,
  corCompra: {} as Record<string, number>, catImob: "auto" as CategoriaImovel | "auto",
};

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const salario = () => (carreira ? salarioLiquido(carreira.carreira) : FASES.find((f) => f.id === st.fase)!.salario);
const cacheItem = new Map<string, string>();
const miniItem = (id: string, cor = 0) => { const k = `${id}:${cor}`; if (!cacheItem.has(k)) cacheItem.set(k, svgItem(id, cor)); return cacheItem.get(k)!; };
const cacheRev = new Map<string, string>();
const miniRev = (l: "parede" | "piso", id: string, cor: number) => { const k = `${l}:${id}:${cor}`; if (!cacheRev.has(k)) cacheRev.set(k, svgRevestimento(l, id, cor)); return cacheRev.get(k)!; };

let avisoT = 0;
function aviso(msg: string, erro = false) {
  if (!msg) return;
  const a = $("aviso");
  a.textContent = msg; a.className = erro ? "ver erro" : "ver";
  clearTimeout(avisoT); avisoT = window.setTimeout(() => (a.className = erro ? "erro" : ""), 2600);
}
function textoEfeitos(ef: Partial<Efeitos>): string {
  return Object.entries(ef).filter(([, v]) => v).map(([k, v]) => {
    const n = v as number, s = `${n > 0 ? "+" : "−"}${Math.abs(n)}`;
    const t = k === "lesao" ? `${s}% proteção` : k === "evolucao" ? `${s}% evolução` : `${s} ${NOMES_EFEITO[k as keyof Efeitos].toLowerCase()}`;
    return n < 0 ? `<span class="neg">${t}</span>` : t;
  }).join(" · ");
}
const comodoAtual = () => { const m = imovelAtual(st.e); return m.comodos.find((c) => c.id === st.comodo) ?? m.comodos[0]; };
const objSel = (): Objeto | undefined => st.e.objetos.find((o) => o.uid === ui.sel);

// ------------------------------------------------------------------ render
function renderConta() {
  const m = imovelAtual(st.e), dono = st.e.proprios.includes(m.id);
  const s = $("saldo"); s.textContent = dinheiro(st.e.saldo); s.classList.toggle("neg", st.e.saldo < 0);
  $("linhas").innerHTML = `<span>Salário <b>${dinheiro(salario())}</b>/mês${carreira ? " líquido" : ""}</span><span>${m.aluguel === 0 ? "Sem aluguel" : dono ? "Imóvel próprio" : `Aluguel <b>${dinheiro(m.aluguel)}</b>`}</span><span>Patrimônio <b>${dinheiro(patrimonio(st.e))}</b></span>${carreira ? "" : `<span>Mês <b>${st.e.mes + 1}</b></span>`}`;
  $("clubes").innerHTML = CLUBES_CASA.map((c) => `<button class="chip${c.id === st.e.clube?.id ? " ativo" : ""}" data-clube="${c.id}"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c.cores[0]};border:1px solid #0008;margin-right:6px;vertical-align:-1px"></span>${c.nome} · ${"★".repeat(estruturaDoClube(c))}</button>`).join("");
  $("fases").innerHTML = FASES.map((f) => `<button class="chip${f.id === st.fase ? " ativo" : ""}" data-fase="${f.id}">${f.nome} · ${dinheiro(f.salario)}</button>`).join("");
}

function renderCena() {
  const c = comodoAtual(), m = imovelAtual(st.e);
  st.comodo = c.id;
  const estr = m.categoria === "alojamento" && st.e.clube && m.id !== "aloj-familia" ? ` · estrutura ${ESTRUTURAS[estruturaDoClube(st.e.clube)].toLowerCase()} ${"★".repeat(estruturaDoClube(st.e.clube))}` : "";
  $("local").textContent = `${CATEGORIAS_IMOVEL[m.categoria].replace(/s$/, "").replace(/õe$/, "ão")} · ${m.local}${estr}${st.e.proprios.includes(m.id) ? " · seu" : ""}`;
  $("imovel").textContent = nomeImovel(st.e, m);
  $("abas").innerHTML = m.comodos.map((x) => `<button class="aba${x.id === c.id ? " ativa" : ""}" data-comodo="${x.id}">${x.nome}</button>`).join("");
  const previa = ui.previa ? { [ui.previa.lugar]: ui.previa.ac } : undefined;
  $("cena").innerHTML = `<div class="conforto"><strong>${conforto(st.e)}</strong><span>Conforto</span></div>${ui.previa ? '<span class="previa-aviso">Prévia</span>' : ""}` +
    svgComodo(st.e, c.id, { selecionado: ui.sel, brilho: ui.brilho, previa });
  $("cena").classList.toggle("editando", !!objSel() && !travado(st.e, objSel()!));
  ui.brilho = undefined;
  renderFerramentas();
  const { total, bruto } = efeitosDaCasa(st.e);
  const bonus = bonusDeEstilo(st.e);
  $("efeitos").innerHTML = (Object.keys(NOMES_EFEITO) as (keyof Efeitos)[]).map((k) => {
    const v = total[k], txt = k === "lesao" || k === "evolucao" ? `${v > 0 ? "+" : ""}${v}%` : `${v > 0 ? "+" : ""}${v}`;
    return `<span class="efeito${v < 0 ? " neg" : ""}">${NOMES_EFEITO[k]} <b>${txt}</b>${bruto[k] > TETO[k] ? " (máx.)" : ""}</span>`;
  }).join("") + bonus.map((b) => `<span class="efeito estilo">${comodoDe(st.e, b.comodo).nome} ${ESTILOS[b.estilo].nome.toLowerCase()} · +${b.moral} moral</span>`).join("");
}

function renderFerramentas() {
  const o = objSel(), f = $("ferramentas");
  if (!o) { f.hidden = true; return; }
  const it = ITENS[o.item];
  f.hidden = false;
  if (travado(st.e, o)) { const m = imovelAtual(st.e); f.innerHTML = `<div class="ferr-topo"><strong>${esc(it.nome)}</strong><span>Do imóvel</span></div><p class="sub">${m.categoria === "alojamento" ? "É do clube. Fica onde está." : "Veio com o imóvel alugado. Só o dono pode tirar ou trocar."}</p><div class="ferr-botoes"><button class="botao sec peq" data-acao="pronto">Pronto</button></div>`; return; }
  const parede = TIPOS[it.tipo].camada === "parede";
  const setas = parede ? `<button class="botao sec seta" data-acao="mov" data-d="-1" aria-label="Para a esquerda">‹</button><button class="botao sec seta" data-acao="mov" data-d="1" aria-label="Para a direita">›</button><button class="botao sec peq" data-acao="parede">Outra parede</button>`
    : `<button class="botao sec seta" data-acao="mov" data-dx="-1" data-dy="0" aria-label="Para trás à esquerda">↖</button><button class="botao sec seta" data-acao="mov" data-dx="0" data-dy="-1" aria-label="Para trás à direita">↗</button><button class="botao sec seta" data-acao="mov" data-dx="0" data-dy="1" aria-label="Para a frente à esquerda">↙</button><button class="botao sec seta" data-acao="mov" data-dx="1" data-dy="0" aria-label="Para a frente à direita">↘</button><button class="botao sec peq" data-acao="girar">Girar</button>`;
  const cores = it.cores.length > 1 ? `<div><p class="rotulo" style="margin-bottom:6px">Trocar cor · ${dinheiro(precoTrocaCor(it.id))}</p><div class="cores">${it.cores.map((c, i) => `<button class="amostra${i === o.cor ? " ativa" : ""}" style="background:${c}" data-acao="cor" data-cor="${i}" aria-label="Cor ${i + 1}"></button>`).join("")}</div></div>` : "";
  f.innerHTML = `<div class="ferr-topo"><strong>${esc(it.nome)}</strong><span>${ESTILOS[it.estilo].nome} · ${textoEfeitos(it.efeitos)}</span></div>
    <p class="sub">Arraste na maquete, toque no chão para levar até lá ou use as setas.</p>
    <div class="ferr-botoes">${setas}${o.incluso ? "" : '<button class="botao sec peq" data-acao="guardar">Guardar</button>'}<button class="botao sec peq" data-acao="vender">Vender ${dinheiro(Math.round(it.preco * VALOR_REVENDA))}</button><button class="botao peq" data-acao="pronto">Pronto</button></div>${cores}`;
}

function renderSeg() { for (const b of $("seg").querySelectorAll<HTMLButtonElement>("button")) { b.classList.toggle("ativo", b.dataset.aba === ui.aba); b.setAttribute("aria-selected", String(b.dataset.aba === ui.aba)); if (b.dataset.aba === "deposito") b.textContent = `Depósito${st.e.deposito.length ? ` (${st.e.deposito.length})` : ""}`; } }

function renderPainel() {
  renderSeg();
  if (ui.aba === "moveis") renderCatalogo();
  else if (ui.aba === "reforma") renderReforma();
  else renderDeposito();
}

function renderCatalogo() {
  const c = comodoAtual(), cat = ui.cat === "auto" ? CAT_DO_COMODO[c.tipo] : ui.cat;
  const cats = `<div class="chips">${[["todos", "Todos"], ...Object.entries(CATEGORIAS)].map(([k, n]) => `<button class="chip${k === cat ? " ativo" : ""}" data-cat="${k}">${n}</button>`).join("")}</div>`;
  const ests = `<div class="chips">${[["todos", "Todos os estilos"], ...Object.entries(ESTILOS).map(([k, v]) => [k, v.nome])].map(([k, n]) => `<button class="chip${k === ui.estilo ? " ativo" : ""}" data-estilo="${k}">${n}</button>`).join("")}</div>`;
  const lista = CATALOGO.filter((i) => i.aVenda && (cat === "todos" || TIPOS[i.tipo].categoria === cat) && (ui.estilo === "todos" || i.estilo === ui.estilo))
    .sort((a, b) => a.tipo.localeCompare(b.tipo) || a.preco - b.preco);
  const card = (it: Item) => {
    const cor = ui.corCompra[it.id] ?? 0, falta = it.preco - st.e.saldo;
    const motivo = motivoNaoCabe(st.e, it.id), ok = TIPOS[it.tipo].comodos, aqui = ok.includes(c.tipo);
    const outro = imovelAtual(st.e).comodos.find((x) => ok.includes(x.tipo));
    const destino = motivo ? `<span class="falta">${esc(motivo)}</span>` : aqui ? "" : `<span class="vai">Vai para: ${esc(outro!.nome)}</span>`;
    const cores = it.cores.length > 1 ? `<div class="cores">${it.cores.map((h, i) => `<button class="amostra peq${i === cor ? " ativa" : ""}" style="background:${h}" data-corcompra="${it.id}" data-cor="${i}" aria-label="Cor ${i + 1}"></button>`).join("")}</div>` : "";
    return `<div class="op"><div class="fig">${miniItem(it.id, cor)}</div><span class="tag">${ESTILOS[it.estilo].nome} · ${TIPOS[it.tipo].nome}</span><div class="n">${esc(it.nome)}</div><div class="p">${dinheiro(it.preco)}</div><div class="ef">${textoEfeitos(it.efeitos)}</div>${cores}${destino}
      <button class="botao" data-comprar="${it.id}" ${falta > 0 || motivo ? "disabled" : ""}>Comprar</button>${falta > 0 && !motivo ? `<span class="falta">Faltam ${dinheiro(falta)}</span>` : ""}</div>`;
  };
  $("painel").innerHTML = cats + ests + (lista.length ? `<div class="grade">${lista.map(card).join("")}</div>` : `<div class="vazio">Nada nesse estilo para essa categoria.</div>`);
}

function renderReforma() {
  const c = comodoAtual(), regra = podeReformar(st.e), atual = acabamento(st.e, c.id), l = ui.lugarReforma;
  const trava = regra === "nada" ? `<div class="trava">No alojamento não dá para reformar. Na kitnet alugada já dá para pintar e trocar o papel de parede.</div>`
    : regra === "parede" && l === "piso" ? `<div class="trava">Imóvel alugado: dá para mexer nas paredes. O piso só se o imóvel for seu.</div>` : "";
  const tog = `<div class="chips"><button class="chip${l === "parede" ? " ativo" : ""}" data-lugar="parede">${c.ambiente === "externo" ? "Muro" : "Paredes"}</button><button class="chip${l === "piso" ? " ativo" : ""}" data-lugar="piso">Piso</button></div>`;
  const pode = regra === "tudo" || (regra === "parede" && l === "parede");
  const ops = REVESTIMENTOS.filter((r) => r.lugar === l && r.ambientes.includes(c.ambiente) && r.id !== "faixa" && r.id !== "descascada");
  const card = (r: typeof ops[number]) => {
    const ehAtual = atual[l].id === r.id, corSel = ui.previa?.lugar === l && ui.previa.ac.id === r.id ? ui.previa.ac.cor : ehAtual ? atual[l].cor : 0;
    const preco = precoAcabamento(c, l, r.id), mesmo = ehAtual && atual[l].cor === corSel;
    const cores = r.cores.length > 1 ? `<div class="cores">${r.cores.map((h, i) => `<button class="amostra peq${i === corSel ? " ativa" : ""}" style="background:${h}" data-previa="${r.id}" data-cor="${i}" title="${r.nomesCores?.[i] ?? ""}" aria-label="${r.nomesCores?.[i] ?? `Cor ${i + 1}`}"></button>`).join("")}</div>` : "";
    return `<div class="op${ehAtual ? " atual" : ""}"><button class="fig" style="border:0;cursor:pointer" data-previa="${r.id}" data-cor="${corSel}" aria-label="Ver ${esc(r.nome)}">${miniRev(l, r.id, corSel)}</button><div class="n">${esc(r.nome)}</div><span class="tag">${"★".repeat(r.qualidade)}${"☆".repeat(5 - r.qualidade)}</span><div class="p">${dinheiro(preco)}</div>${cores}
      ${pode ? `<button class="botao" data-reformar="${r.id}" data-cor="${corSel}" ${mesmo || st.e.saldo < preco ? "disabled" : ""}>${mesmo ? "Atual" : "Aplicar"}</button>` : ""}</div>`;
  };
  const prev = ui.previa ? `<div class="ferr-botoes"><button class="botao sec peq" data-acao="semprevia">Tirar a prévia</button></div>` : "";
  $("painel").innerHTML = tog + trava + `<p class="sub">Toque numa amostra para ver na maquete antes de pagar.</p>` + prev + `<div class="grade">${ops.map(card).join("")}</div>`;
}

function renderDeposito() {
  const g = st.e.deposito;
  $("painel").innerHTML = g.length ? g.map((x) => {
    const it = ITENS[x.item];
    return `<div class="guardado"><div class="mini">${miniItem(x.item, x.cor)}</div><span><span style="font-weight:600">${esc(it.nome)}</span><br><span class="sub">${TIPOS[it.tipo].nome}</span></span>
      <button class="botao peq" data-colocar="${x.uid}">Colocar</button><button class="botao sec peq" data-venderdep="${x.uid}">${dinheiro(Math.round(it.preco * VALOR_REVENDA))}</button></div>`;
  }).join("") : `<div class="vazio">Nada guardado. O que você tirar da casa ou não couber na mudança aparece aqui.</div>`;
}

// ------------------------------------------------------------------ imobiliária
const cachePrevia = new Map<string, string>();
function previaImovel(id: string): string {
  const chave = `${id}:${st.e.clube?.id}`;
  if (cachePrevia.has(chave)) return cachePrevia.get(chave)!;
  const m = IMOVEL[id], e = novoEstado(1e9, id, st.e.clube); e.proprios.push(id);
  const vitrine = m.comodos.find((c) => c.tipo === "externo" && m.categoria !== "kitnet") ?? m.comodos.find((c) => c.tipo === "sala") ?? m.comodos[0];
  const est: Estilo = ({ alojamento: "basico", kitnet: "brasileiro", apartamento: "moderno", casa: "rustico", mansao: "classico" } as const)[m.categoria];
  const nivelMax = { alojamento: 1, kitnet: 1, apartamento: 2, casa: 3, mansao: 4 }[m.categoria];
  const cats = vitrine.tipo === "externo" ? ["externo", "decoracao"] : vitrine.tipo === "sala" ? ["sala", "decoracao"] : ["dormir", "decoracao", "sala"];
  const feitos = new Set<string>();
  for (const it of CATALOGO) {
    if (!it.aVenda || feitos.has(it.tipo) || !cats.includes(TIPOS[it.tipo].categoria) || it.nivel > nivelMax) continue;
    const doEstilo = CATALOGO.find((o) => o.tipo === it.tipo && o.estilo === est && o.nivel <= nivelMax);
    if (doEstilo && doEstilo.id !== it.id) continue;
    feitos.add(it.tipo); comprar(e, it.id, 0, vitrine.id);
  }
  const svg = svgComodo(e, vitrine.id);
  cachePrevia.set(chave, svg);
  return svg;
}

function renderImobiliaria() {
  const atual = imovelAtual(st.e).categoria, cat = ui.catImob === "auto" ? atual : ui.catImob;
  $("catImob").innerHTML = (Object.entries(CATEGORIAS_IMOVEL) as [CategoriaImovel, string][]).map(([k, n]) => `<button class="chip${k === cat ? " ativo" : ""}" data-catimob="${k}">${n}</button>`).join("");
  $("imoveis").innerHTML = IMOVEIS.filter((m) => m.categoria === cat && (cat !== "alojamento" || alojamentosDoClube(st.e.clube).includes(m.id))).map((m) => {
    const aqui = m.id === st.e.imovel, dono = st.e.proprios.includes(m.id);
    const alug = podeMudar(st.e, m.id, "alugar", salario()), comp = m.compra ? podeMudar(st.e, m.id, "comprar", salario()) : undefined;
    const acoes = aqui ? `<button class="botao sec" disabled>Você mora aqui</button>`
      : dono ? `<button class="botao" data-mudar="${m.id}" data-modo="alugar">Voltar para cá</button>`
      : `<button class="botao" data-mudar="${m.id}" data-modo="alugar" ${alug.ok ? "" : "disabled"}>${m.aluguel ? "Alugar" : "Morar aqui"}</button>${comp ? `<button class="botao sec" data-mudar="${m.id}" data-modo="comprar" ${comp.ok ? "" : "disabled"}>Comprar</button>` : ""}`;
    const motivo = !aqui && !dono && !alug.ok ? `<span class="req">${esc(alug.msg)}</span>` : "";
    return `<div class="morada${aqui ? " atual" : ""}"><div class="vista">${previaImovel(m.id)}</div><div class="txt">
      <p class="rotulo">${m.categoria === "alojamento" && st.e.clube && m.id !== "aloj-familia" ? `Estrutura ${ESTRUTURAS[estruturaDoClube(st.e.clube)].toLowerCase()} ${"★".repeat(estruturaDoClube(st.e.clube))} · ` : ""}${esc(m.local)} · ${areaM2(m)} m² · ${m.comodos.length} ${m.comodos.length > 1 ? "ambientes" : "ambiente"}</p><h2>${esc(nomeImovel(st.e, m))}</h2><p class="sub">${esc(m.descricao)}</p>
      <p class="sub">${m.comodos.map((c) => c.nome).join(" · ")}</p>
      <p class="preco">${m.aluguel ? `Aluguel <b>${dinheiro(m.aluguel)}</b>/mês · renda mínima ${dinheiro(rendaMinima(m))}` : "<b>Pago pelo clube</b>"}${m.compra ? ` · compra <b>${dinheiro(m.compra)}</b>` : ""}</p>
      <div class="acoes">${acoes}${motivo}</div></div></div>`;
  }).join("");
}

function tudo() { renderConta(); renderCena(); renderPainel(); salvar(); }
function soCena() { renderConta(); renderCena(); salvar(); }

// ------------------------------------------------------------------ arrastar na maquete
let fimArrasto = 0;
let arrasto: { uid: string; x0: number; y0: number; inicio: { x: number; y: number }; moveu: boolean; alvo?: Partial<Objeto>; ok?: boolean; id: number } | undefined;
function pontoSvg(ev: PointerEvent): { sx: number; sy: number } | undefined {
  const svg = $("cena").querySelector("svg"); if (!svg) return;
  const m = svg.getScreenCTM(); if (!m) return;
  const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse());
  return { sx: p.x, sy: p.y };
}
function alvoParede(sx: number, sy: number, largura: number): Partial<Objeto> {
  const c = comodoAtual(), A = 14;
  if (sx < 0) return { parede: "esq", x: Math.round((Math.max(largura / 2, Math.min(c.d - largura / 2, -sx / A))) * 2) / 2, y: 0 };
  return { parede: "dir", x: Math.round((Math.max(largura / 2, Math.min(c.w - largura / 2, sx / A))) * 2) / 2, y: 0 };
  void sy;
}
const cena = $("cena");
cena.addEventListener("pointerdown", (ev) => {
  const g = (ev.target as Element).closest<SVGGElement>(".obj");
  const o = g ? st.e.objetos.find((x) => x.uid === g.dataset.uid) : undefined;
  const p = pontoSvg(ev); if (!p) return;
  if (o && o.uid === ui.sel && !travado(st.e, o)) {
    const ch = telaParaChao(p.sx, p.sy);
    arrasto = { uid: o.uid, x0: o.x, y0: o.y, inicio: ch, moveu: false, id: ev.pointerId };
    cena.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  }
});
cena.addEventListener("pointermove", (ev) => {
  if (!arrasto || ev.pointerId !== arrasto.id) return;
  const p = pontoSvg(ev); if (!p) return;
  const o = st.e.objetos.find((x) => x.uid === arrasto!.uid)!, t = TIPOS[ITENS[o.item].tipo];
  const ch = telaParaChao(p.sx, p.sy);
  let alvo: Partial<Objeto>;
  if (t.camada === "parede") alvo = alvoParede(p.sx, p.sy, t.w);
  else alvo = { x: Math.round(arrasto.x0 + ch.x - arrasto.inicio.x), y: Math.round(arrasto.y0 + ch.y - arrasto.inicio.y) };
  if (!arrasto.moveu && Math.hypot(ch.x - arrasto.inicio.x, ch.y - arrasto.inicio.y) < 0.4) return;
  arrasto.moveu = true;
  const cand = { ...o, ...alvo };
  arrasto.alvo = alvo; arrasto.ok = cabe(st.e, cand);
  cena.querySelector(`.obj[data-uid="${o.uid}"]`)?.classList.add("arrastando");
  const f = cena.querySelector("#fantasma"); if (f) f.innerHTML = svgFantasma(cand, arrasto.ok);
});
const soltar = (ev: PointerEvent) => {
  if (!arrasto || ev.pointerId !== arrasto.id) return;
  const a = arrasto; arrasto = undefined;
  if (a.moveu) {
    fimArrasto = Date.now();
    if (a.ok && a.alvo) mover(st.e, a.uid, a.alvo as { x: number; y: number }); else aviso("Não cabe aí.", true);
    soCena();
  }
};
cena.addEventListener("pointerup", soltar);
cena.addEventListener("pointercancel", soltar);

// toque: selecionar móvel ou levar o selecionado até o ponto tocado
cena.addEventListener("click", (ev) => {
  if (Date.now() - fimArrasto < 350) return;
  const alvo = ev.target as Element;
  const g = alvo.closest<SVGGElement>(".obj");
  if (g && g.dataset.uid !== ui.sel) { ui.sel = g.dataset.uid; soCena(); return; }
  if (g) return;
  const o = objSel(); if (!o || travado(st.e, o)) return;
  const p = pontoSvg(ev as PointerEvent); if (!p) return;
  const t = TIPOS[ITENS[o.item].tipo];
  if (t.camada === "parede") { if (!alvo.closest("[data-parede]")) return; const r = mover(st.e, o.uid, alvoParede(p.sx, p.sy, t.w) as { x: number; y: number }); aviso(r.msg, !r.ok); soCena(); return; }
  if (!alvo.closest("[data-chao]")) return;
  const ch = telaParaChao(p.sx, p.sy), a = o.rot % 2 ? { w: t.d, d: t.w } : { w: t.w, d: t.d };
  const r = mover(st.e, o.uid, { x: Math.round(ch.x - a.w / 2), y: Math.round(ch.y - a.d / 2) });
  aviso(r.msg, !r.ok); soCena();
});

// ------------------------------------------------------------------ botões
document.addEventListener("click", (ev) => {
  const b = (ev.target as Element).closest<HTMLElement>("[data-fase],[data-clube],[data-comodo],[data-aba],[data-cat],[data-estilo],[data-corcompra],[data-comprar],[data-acao],[data-lugar],[data-previa],[data-reformar],[data-colocar],[data-venderdep],[data-catimob],[data-mudar],[data-fechar]");
  if (!b) return;
  const d = b.dataset;
  if (d.fase) { st.fase = d.fase; renderConta(); salvar(); }
  else if (d.clube) {
    st.e.clube = CLUBES_CASA.find((c) => c.id === d.clube);
    const m = imovelAtual(st.e);
    if (m.categoria === "alojamento" && !alojamentosDoClube(st.e.clube).includes(m.id)) { mudar(st.e, alojamentosDoClube(st.e.clube)[0], "alugar", salario()); st.comodo = imovelAtual(st.e).comodos[0].id; ui.sel = undefined; }
    aviso(`Agora você joga no ${st.e.clube!.nome}.`); tudo();
  }
  else if (d.comodo) { st.comodo = d.comodo; ui.sel = undefined; ui.previa = undefined; ui.cat = "auto"; tudo(); }
  else if (d.aba) { ui.aba = d.aba as typeof ui.aba; if (ui.aba !== "reforma" && ui.previa) { ui.previa = undefined; renderCena(); } renderPainel(); }
  else if (d.cat) { ui.cat = d.cat as typeof ui.cat; renderCatalogo(); }
  else if (d.estilo) { ui.estilo = d.estilo as typeof ui.estilo; renderCatalogo(); }
  else if (d.corcompra) { ui.corCompra[d.corcompra] = +d.cor!; const fig = b.closest(".op")?.querySelector(".fig"); if (fig) fig.innerHTML = miniItem(d.corcompra, +d.cor!); b.parentElement!.querySelectorAll(".amostra").forEach((x) => x.classList.toggle("ativa", x === b)); }
  else if (d.comprar) {
    const r = comprar(st.e, d.comprar, ui.corCompra[d.comprar] ?? 0, st.comodo);
    aviso(r.msg, !r.ok);
    if (r.ok) { if (r.uid && r.comodo) { st.comodo = r.comodo; ui.sel = r.uid; ui.brilho = r.uid; } tudo(); $("cena").scrollIntoView({ behavior: "smooth", block: "center" }); }
  } else if (d.acao) acao(d.acao, d);
  else if (d.lugar) { ui.lugarReforma = d.lugar as "parede" | "piso"; ui.previa = undefined; renderCena(); renderReforma(); }
  else if (d.previa) { ui.previa = { lugar: ui.lugarReforma, ac: { id: d.previa, cor: +d.cor! } }; renderCena(); renderReforma(); }
  else if (d.reformar) {
    const r = reformar(st.e, st.comodo, ui.lugarReforma, d.reformar, +d.cor!);
    aviso(r.msg, !r.ok); if (r.ok) ui.previa = undefined; tudo();
  } else if (d.colocar) {
    const r = tirarDoDeposito(st.e, d.colocar, st.comodo); aviso(r.msg, !r.ok);
    if (r.ok && r.uid) { st.comodo = r.comodo!; ui.sel = r.uid; ui.brilho = r.uid; } tudo();
  } else if (d.venderdep) { const r = vender(st.e, d.venderdep); aviso(r.msg, !r.ok); tudo(); }
  else if (d.catimob) { ui.catImob = d.catimob as CategoriaImovel; renderImobiliaria(); }
  else if (d.mudar) {
    const r = mudar(st.e, d.mudar, d.modo as "alugar" | "comprar", salario());
    aviso(r.msg, !r.ok);
    if (r.ok) { ($("dlgImob") as HTMLDialogElement).close(); st.comodo = imovelAtual(st.e).comodos[0].id; ui.sel = undefined; ui.previa = undefined; ui.cat = "auto"; tudo(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  } else if ("fechar" in d) (b.closest("dialog") as HTMLDialogElement).close();
});

function acao(a: string, d: DOMStringMap) {
  const o = objSel(); if (!o && a !== "semprevia") return;
  let r: { ok: boolean; msg: string } = { ok: true, msg: "" };
  switch (a) {
    case "pronto": ui.sel = undefined; break;
    case "mov": {
      const t = TIPOS[ITENS[o!.item].tipo];
      r = t.camada === "parede" ? mover(st.e, o!.uid, { x: o!.x + +d.d! * 0.5, y: 0 }) : mover(st.e, o!.uid, { x: o!.x + +d.dx!, y: o!.y + +d.dy! });
      if (!r.ok) r.msg = "Não dá para ir mais para lá.";
      break;
    }
    case "parede": { const outra = o!.parede === "esq" ? "dir" : "esq"; const c = comodoAtual(); const L = outra === "esq" ? c.d : c.w; r = { ok: false, msg: "Não tem espaço na outra parede." }; for (let x = 1.5; x < L; x += 0.5) { const t = mover(st.e, o!.uid, { x, y: 0, parede: outra }); if (t.ok) { r = t; break; } } break; }
    case "girar": r = girar(st.e, o!.uid); break;
    case "guardar": r = guardar(st.e, o!.uid); ui.sel = undefined; break;
    case "vender": r = vender(st.e, o!.uid); ui.sel = undefined; break;
    case "cor": r = trocarCor(st.e, o!.uid, +d.cor!); break;
    case "semprevia": ui.previa = undefined; break;
  }
  aviso(r.msg, !r.ok);
  if (a === "guardar" || a === "vender" || a === "cor" || a === "semprevia") tudo(); else soCena();
}

$("fecharMes").addEventListener("click", () => {
  const { aluguel } = fecharMes(st.e, salario());
  aviso(`Caiu o salário: +${dinheiro(salario())}${aluguel ? `, aluguel −${dinheiro(aluguel)}` : ""}.`);
  renderConta(); renderPainel(); salvar();
});
$("imobiliaria").addEventListener("click", () => { ui.catImob = "auto"; renderImobiliaria(); ($("dlgImob") as HTMLDialogElement).showModal(); });
$("dlgImob").addEventListener("click", (ev) => { if (ev.target === ev.currentTarget) ($("dlgImob") as HTMLDialogElement).close(); });
$("recomecar").addEventListener("click", () => { st.e = novoEstado(3000, "aloj-ct", st.e.clube ?? CLUBE_PADRAO); st.fase = "base"; st.comodo = "quarto"; ui.sel = undefined; ui.previa = undefined; tudo(); aviso("De volta ao alojamento."); });
void REVEST; void ehDono; void NOME_COMODO;
if (carreira) {
  // dentro da carreira: o mês fecha na semana, não aqui; nada de modo de teste
  $("fecharMes").hidden = true;
  document.querySelector<HTMLElement>("details.teste")!.hidden = true;
  document.querySelector(".marca span")!.innerHTML = `<a href="index.html" style="color:var(--ouro-claro);text-decoration:none;font-weight:700">← Voltar à semana</a>`;
}
tudo();
