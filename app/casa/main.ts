// Tela da casa: maquete isométrica do cômodo, catálogo por lugar, guardados e mudança de casa.
import {
  CATALOGO, ITENS, MORADIA, MORADIAS, NOMES_EFEITO, FORMATO, chave, comprar, conforto, dinheiro, efeitosDaCasa, fecharMes,
  instalarGuardado, mudar, novoEstado, opcoesDoTipo, patrimonio, vender, VALOR_REVENDA,
  type Efeitos, type EstadoCasa, type Item, type TipoMovel,
} from "../../src/casa";
import { svgComodo, svgItem } from "./iso";

const NOME_TIPO: Record<TipoMovel, string> = {
  beliche: "Beliche", cama: "Cama", armario: "Armário", tv: "TV", videogame: "Videogame", sofa: "Sofá", mesa: "Escrivaninha",
  tapete: "Tapete", quadro: "Parede", planta: "Planta", luminaria: "Luminária", geladeira: "Geladeira", fogao: "Fogão",
  mesaJantar: "Mesa de jantar", som: "Som", esteira: "Cardio", pesos: "Musculação", espreguicadeira: "Espreguiçadeira",
  piscina: "Piscina", churrasqueira: "Churrasqueira", estante: "Estante", trofeus: "Troféus", carro: "Vaga",
};
const FASES = [
  { id: "base", nome: "Base", salario: 2000 },
  { id: "contrato", nome: "Primeiro contrato", salario: 25000 },
  { id: "titular", nome: "Titular", salario: 180000 },
  { id: "estrela", nome: "Estrela", salario: 1200000 },
  { id: "lenda", nome: "Lenda", salario: 4000000 },
];

const CHAVE = "mycarrerinha-casa-v1";
interface Salvo { e: EstadoCasa; fase: string; comodo: string }
function carregar(): Salvo {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE) ?? "null") as Salvo | null;
    if (s && MORADIA[s.e.moradia]) return s;
  } catch { /* sem armazenamento: começa do zero */ }
  return { e: novoEstado(), fase: "base", comodo: "quarto" };
}
const st = carregar();
const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(st)); } catch { /* ok */ } };

let selecionado: string | undefined;
let recemComprado: string | undefined;
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function textoEfeitos(ef: Partial<Efeitos>): string {
  const partes: string[] = [];
  const f = (k: keyof Efeitos, v: number) => {
    const sinal = v > 0 ? "+" : "−", a = Math.abs(v);
    const t = k === "lesao" ? `${sinal}${a}% proteção` : k === "evolucao" ? `${sinal}${a}% evolução` : k === "recuperacao" ? `${sinal}${a} recuperação` : `${sinal}${a} ${NOMES_EFEITO[k].toLowerCase()}`;
    return v < 0 ? `<span class="neg">${t}</span>` : t;
  };
  for (const [k, v] of Object.entries(ef)) if (v) partes.push(f(k as keyof Efeitos, v as number));
  return partes.join(" · ");
}

let avisoT = 0;
function aviso(msg: string, erro = false) {
  const a = $("aviso");
  a.textContent = msg; a.className = erro ? "ver erro" : "ver";
  clearTimeout(avisoT); avisoT = window.setTimeout(() => (a.className = erro ? "erro" : ""), 2600);
}

function comodoAtual() {
  const m = MORADIA[st.e.moradia];
  return m.comodos.find((c) => c.id === st.comodo) ?? m.comodos[0];
}

function renderConta() {
  const fase = FASES.find((f) => f.id === st.fase)!;
  const m = MORADIA[st.e.moradia], dono = st.e.propria.includes(m.id);
  const s = $("saldo"); s.textContent = dinheiro(st.e.saldo); s.classList.toggle("neg", st.e.saldo < 0);
  $("linhas").innerHTML = `<span>Salário <b>${dinheiro(fase.salario)}</b>/mês</span><span>${dono ? "Casa própria" : `Aluguel <b>${dinheiro(m.aluguel)}</b>`}</span><span>Patrimônio <b>${dinheiro(patrimonio(st.e))}</b></span><span>Mês <b>${st.e.mes + 1}</b></span>`;
  $("fases").innerHTML = FASES.map((f) => `<button class="chip${f.id === st.fase ? " ativo" : ""}" data-fase="${f.id}" aria-pressed="${f.id === st.fase}">${f.nome} · ${dinheiro(f.salario)}</button>`).join("");
}

function renderCasa() {
  const m = MORADIA[st.e.moradia], c = comodoAtual();
  st.comodo = c.id;
  $("fase").textContent = `${m.fase}${st.e.propria.includes(m.id) ? " · casa própria" : ""}`;
  $("moradia").textContent = m.nome;
  $("abas").innerHTML = m.comodos.map((x) => `<button class="aba${x.id === c.id ? " ativa" : ""}" data-comodo="${x.id}" aria-pressed="${x.id === c.id}">${x.nome}</button>`).join("");
  $("cena").innerHTML = `<div class="conforto"><strong>${conforto(st.e)}</strong><span>Conforto</span></div>` + svgComodo(st.e, c.id, { selecionado, marcarVazios: true, brilho: recemComprado });
  recemComprado = undefined;
  const ef = efeitosDaCasa(st.e);
  $("efeitos").innerHTML = (Object.keys(NOMES_EFEITO) as (keyof Efeitos)[]).map((k) => {
    const v = ef[k], txt = k === "lesao" || k === "evolucao" ? `${v > 0 ? "+" : ""}${v}%` : `${v > 0 ? "+" : ""}${v}`;
    return `<span class="efeito${v < 0 ? " neg" : ""}">${NOMES_EFEITO[k]} <b>${txt}</b></span>`;
  }).join("");
  $("tituloCatalogo").textContent = `Catálogo · ${c.nome}`;
  renderLugares();
  renderGuardados();
}

function cartao(it: Item, slotId: string, atual?: Item): string {
  const tem = atual?.id === it.id, falta = it.preco - st.e.saldo;
  const acao = tem ? `<button class="botao sec" disabled>No lugar</button>`
    : `<button class="botao" data-comprar="${it.id}" data-slot="${slotId}" ${falta > 0 ? "disabled" : ""}>Comprar</button>${falta > 0 ? `<span class="falta">Faltam ${dinheiro(falta)}</span>` : ""}`;
  return `<div class="op${tem ? " tem" : ""}"><div class="fig">${svgItem(it.id)}</div><div class="n">${esc(it.nome)}</div><div class="p">${dinheiro(it.preco)}</div><div class="ef">${textoEfeitos(it.efeitos)}</div>${acao}</div>`;
}

function renderLugares() {
  const c = comodoAtual();
  $("lugares").innerHTML = c.slots.map((sl) => {
    const it = ITENS[st.e.instalados[chave(c.id, sl.id)] ?? ""];
    const aberto = selecionado === sl.id;
    const nome = sl.tipo === "carro" ? `Vaga ${sl.id.replace("vaga", "")}` : NOME_TIPO[sl.tipo];
    const det = sl.fixo ? "Do clube, não dá para trocar" : it ? `${it.nome}${it.nivel < Math.max(...opcoesDoTipo(sl.tipo).map((o) => o.nivel)) ? " · dá para melhorar" : " · o melhor"}` : "Vazio";
    const mini = it ? `<div class="mini">${svgItem(it.id)}</div>` : `<div class="mini vazio">+</div>`;
    const ops = aberto && !sl.fixo ? `<div class="opcoes">${opcoesDoTipo(sl.tipo).map((o) => cartao(o, sl.id, it)).join("")}</div>` : "";
    return `<div class="lugar${aberto ? " aberto" : ""}" id="lugar-${sl.id}"><button data-abrir="${sl.id}" aria-expanded="${aberto}"${sl.fixo ? " disabled" : ""}>${mini}<span><span class="nome">${nome}</span><br><span class="det">${esc(det)}</span></span><span class="seta" aria-hidden="true">${sl.fixo ? "" : "›"}</span></button>${ops}</div>`;
  }).join("");
}

function lugarLivre(tipo: TipoMovel): { comodo: string; slot: string } | undefined {
  const m = MORADIA[st.e.moradia];
  const atual = comodoAtual();
  for (const c of [atual, ...m.comodos.filter((x) => x !== atual)]) for (const sl of c.slots)
    if (sl.tipo === tipo && !sl.fixo && !st.e.instalados[chave(c.id, sl.id)]) return { comodo: c.id, slot: sl.id };
}

function renderGuardados() {
  const g = st.e.guardados;
  $("secGuardados").hidden = g.length === 0;
  $("guardados").innerHTML = g.map((id, i) => {
    const it = ITENS[id], livre = lugarLivre(it.tipo);
    const cabe = MORADIA[st.e.moradia].comodos.some((c) => c.slots.some((sl) => sl.tipo === it.tipo && !sl.fixo));
    return `<div class="guardado"><div class="mini">${svgItem(id)}</div><span><span class="nome" style="font-weight:600">${esc(it.nome)}</span><br><span class="det" style="font-size:13px;color:var(--giz-2)">${livre ? "Tem lugar livre" : cabe ? "Troca com o que está no lugar" : "Não cabe nesta casa"}</span></span>
      <button class="botao" data-colocar="${i}" ${cabe ? "" : "disabled"}>Colocar</button><button class="botao sec" data-vender="${i}">${dinheiro(Math.round(it.preco * VALOR_REVENDA))}</button></div>`;
  }).join("");
}

function renderMoradas() {
  $("moradas").innerHTML = MORADIAS.map((m) => {
    const atual = m.id === st.e.moradia, dono = st.e.propria.includes(m.id);
    // vitrine: o ambiente mais bonito de cada casa, mobiliado num nível que combina com a fase
    const nivel = Math.min(3, Math.max(1, MORADIAS.indexOf(m)));
    const previa = novoEstado(); previa.moradia = m.id; previa.instalados = {};
    for (const c of m.comodos) for (const sl of c.slots) {
      const op = sl.fixo ?? CATALOGO.filter((i) => i.tipo === sl.tipo && i.preco > 0 && i.nivel <= nivel).at(-1)?.id;
      if (op) previa.instalados[chave(c.id, sl.id)] = op;
    }
    const mostrar = m.comodos.find((c) => c.id === "externa") ?? m.comodos.find((c) => c.id === "sala") ?? m.comodos[0];
    const acoes = atual ? `<button class="botao sec" disabled>Você mora aqui</button>`
      : dono ? `<button class="botao" data-mudar="${m.id}" data-modo="alugar">Voltar para cá</button>`
      : `<button class="botao" data-mudar="${m.id}" data-modo="alugar" ${st.e.saldo < m.aluguel * 2 ? "disabled" : ""}>${m.aluguel ? `Alugar` : "Voltar ao alojamento"}</button>${m.compra ? `<button class="botao sec" data-mudar="${m.id}" data-modo="comprar" ${st.e.saldo < m.compra ? "disabled" : ""}>Comprar</button>` : ""}`;
    return `<div class="morada${atual ? " atual" : ""}"><div class="vista">${svgComodo(previa, mostrar.id, {})}</div><div class="txt">
      <p class="rotulo">${m.fase} · ${m.comodos.length} ${m.comodos.length > 1 ? "ambientes" : "ambiente"}</p><h2>${m.nome}</h2><p class="sub" style="font-size:14px">${m.descricao}</p>
      <p class="preco">${m.aluguel ? `Aluguel <b>${dinheiro(m.aluguel)}</b>/mês` : "<b>Grátis</b> enquanto estiver na base"}${m.compra ? ` · compra <b>${dinheiro(m.compra)}</b>` : ""}</p>
      <div class="acoes">${acoes}</div></div></div>`;
  }).join("");
}

function tudo() { renderConta(); renderCasa(); salvar(); }

document.addEventListener("click", (ev) => {
  const alvo = ev.target as Element;
  const b = alvo.closest<HTMLElement>("[data-fase],[data-comodo],[data-abrir],[data-comprar],[data-colocar],[data-vender],[data-mudar],[data-fechar]");
  const slotG = alvo.closest<SVGGElement>("#cena .slot");
  if (slotG && !b) {
    const id = slotG.dataset.slot!;
    const sl = comodoAtual().slots.find((x) => x.id === id);
    selecionado = sl?.fixo ? undefined : id;
    if (sl?.fixo) aviso("Esse é do clube. Quando tiver sua casa, você escolhe.");
    renderCasa();
    document.getElementById(`lugar-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  if (!b) return;
  const d = b.dataset;
  if (d.fase) { st.fase = d.fase; renderConta(); salvar(); }
  else if (d.comodo) { st.comodo = d.comodo; selecionado = undefined; tudo(); }
  else if (d.abrir) { selecionado = selecionado === d.abrir ? undefined : d.abrir; renderCasa(); }
  else if (d.comprar) {
    const r = comprar(st.e, st.comodo, d.slot!, d.comprar);
    aviso(r.msg, !r.ok);
    if (r.ok) { recemComprado = d.slot; tudo(); $("cena").scrollIntoView({ behavior: "smooth", block: "center" }); }
  } else if (d.colocar) {
    const id = st.e.guardados[+d.colocar], it = ITENS[id];
    const alvoSlot = lugarLivre(it.tipo) ?? (() => {
      for (const c of MORADIA[st.e.moradia].comodos) for (const sl of c.slots) if (sl.tipo === it.tipo && !sl.fixo) return { comodo: c.id, slot: sl.id };
    })();
    if (!alvoSlot) return;
    const r = instalarGuardado(st.e, alvoSlot.comodo, alvoSlot.slot, id);
    aviso(r.msg, !r.ok);
    if (r.ok) { st.comodo = alvoSlot.comodo; recemComprado = alvoSlot.slot; selecionado = alvoSlot.slot; tudo(); }
  } else if (d.vender) {
    const r = vender(st.e, st.e.guardados[+d.vender]); aviso(r.msg, !r.ok); tudo();
  } else if (d.mudar) {
    const r = mudar(st.e, d.mudar, d.modo as "alugar" | "comprar");
    aviso(r.msg, !r.ok);
    if (r.ok) { ($("dlgMudar") as HTMLDialogElement).close(); st.comodo = MORADIA[st.e.moradia].comodos[0].id; selecionado = undefined; tudo(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  } else if ("fechar" in d) (b.closest("dialog") as HTMLDialogElement).close();
});

$("fecharMes").addEventListener("click", () => {
  const fase = FASES.find((f) => f.id === st.fase)!;
  const { aluguel } = fecharMes(st.e, fase.salario);
  aviso(`Caiu o salário: +${dinheiro(fase.salario)}${aluguel ? `, aluguel −${dinheiro(aluguel)}` : ""}.`);
  tudo();
});
$("mudar").addEventListener("click", () => { renderMoradas(); ($("dlgMudar") as HTMLDialogElement).showModal(); });
$("recomecar").addEventListener("click", () => {
  st.e = novoEstado(); st.fase = "base"; st.comodo = "quarto"; selecionado = undefined; tudo(); aviso("De volta ao alojamento.");
});
$("dlgMudar").addEventListener("click", (ev) => { if (ev.target === ev.currentTarget) ($("dlgMudar") as HTMLDialogElement).close(); });

void FORMATO;
tudo();
