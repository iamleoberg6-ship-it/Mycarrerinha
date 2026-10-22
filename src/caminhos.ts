// Caminhos até o profissional. Além da base de clube (aos 16), o jogador pode começar:
//  • na várzea da sua cidade (aos 14): joga contra adultos, aparece para os olheiros e ganha convites de peneira
//    das bases de clubes da Série A à Série D; se chegar aos 18 na várzea, clubes pequenos oferecem contrato;
//  • nos EUA, se a família for rica:
//    – academia de clube da liga americana (aos 14, a família se muda junto): o clube pode assinar um contrato
//      "homegrown" a partir dos 15 anos (como fez o garoto de 14 anos do Filadélfia), ou aos 18;
//    – high school (aos 15) e depois universidade: a partir do segundo ano de faculdade ele pode entrar no draft da
//      liga; quem é escolhido cedo e tem potencial ganha o contrato especial de jovem talento.
// As fases amadoras (várzea, colegial, universidade) não pagam salário: a família banca o custo de vida.
import { RNG, clamp } from "./rng.js";
import type { Clube, Liga, PacoteDados } from "./liga.js";
import { mundo, infoClube } from "./mundo.js";
import { CIDADES_VARZEA, infoLiga } from "./ligas.js";
import { salarioMensal } from "./mercado.js";
import { mudarDeClube, mercadoDe } from "./transferencias.js";
import { ANO_INICIAL, SEMANAS_TEMPORADA, noticia, ovr, type Carreira, type Save } from "./jogo.js";
import type { FamiliaId, PaisId } from "./dna.js";

export type Caminho = "base" | "varzea" | "eua_academia" | "eua_escola";
export type Fase = "varzea" | "academia" | "colegial" | "universidade";
export type TipoConvite = "peneira" | "profissional" | "universidade" | "draft" | "homegrown";
export interface Convite {
  id: string; tipo: TipoConvite; clubeId: string; titulo: string; texto: string;
  /** R$ por mês (0 = amador) */ salario: number; anos: number;
  /** semana absoluta em que o convite cai */ expira: number;
  /** escolha do draft */ pick?: number; generation?: boolean;
}
export interface EstadoCaminho { convites: Convite[]; seq: number; temporadasFase: number; cidade?: string }
export const caminhoDe = (c: Carreira): EstadoCaminho => (c.caminho ??= { convites: [], seq: 0, temporadasFase: 0 });

export const NOME_FASE: Record<Fase, string> = { varzea: "Várzea", academia: "Academia nos EUA", colegial: "High school", universidade: "Universidade" };
export const IDADE_INICIAL: Record<Caminho, number> = { base: 16, varzea: 14, eua_academia: 14, eua_escola: 15 };
export const FASE_INICIAL: Record<Caminho, Fase | undefined> = { base: undefined, varzea: "varzea", eua_academia: "academia", eua_escola: "colegial" };

export interface InfoCaminho { id: Caminho; nome: string; idade: number; texto: string }
export const CAMINHOS: Record<Caminho, InfoCaminho> = {
  base: { id: "base", nome: "Base de clube", idade: 16, texto: "Três clubes da Série A querem você na base. O caminho mais direto." },
  varzea: { id: "varzea", nome: "Várzea", idade: 14, texto: "Começa aos 14 no time do bairro, contra marmanjo. Jogando bem, aparece olheiro e chegam convites de peneira, da Série A à Série D." },
  eua_academia: { id: "eua_academia", nome: "EUA: academia da liga americana", idade: 14, texto: "A família se muda para os EUA. Você entra na academia de um clube da liga; se se destacar, assina profissional já aos 15." },
  eua_escola: { id: "eua_escola", nome: "EUA: high school e universidade", idade: 15, texto: "Estuda num colégio americano e joga pelo time da escola. Depois, bolsa numa universidade e, a partir do segundo ano, o draft da liga." },
};
export function caminhosDisponiveis(pais: PaisId | string, familia: FamiliaId): Caminho[] {
  const r: Caminho[] = ["base"];
  if (pais === "BRA") r.push("varzea");
  if (familia === "rica") r.push("eua_academia", "eua_escola");
  return r;
}
/** Cidade da várzea: a do clube do coração, se tiver liga de várzea; senão São Paulo. */
export function cidadeDaVarzea(pacote: PacoteDados, clubeCoracao: string | null | undefined): string {
  const cid = clubeCoracao ? infoClube(pacote, clubeCoracao)?.cidade : undefined;
  return Object.entries(CIDADES_VARZEA).find(([, nome]) => nome === cid)?.[0] ?? "SP";
}

// ------------------------------------------------------------------ utilidades
const semanaAbs = (c: Carreira) => c.temporada * SEMANAS_TEMPORADA + c.semana;
const rngDe = (s: Save, ...p: (string | number)[]) => new RNG(`${s.semente}|caminho|${s.carreira.temporada}|${s.carreira.semana}|${p.join("|")}`);
export const faseAmadora = (c: Carreira) => c.fase === "varzea" || c.fase === "colegial" || c.fase === "universidade";
/** O que os olheiros enxergam: o nível de hoje e um pouco do potencial. */
const nivelVisto = (s: Save) => ovr(s.jogador) + 0.3 * Math.max(0, s.jogador.pot - ovr(s.jogador));
function novoConvite(s: Save, x: Omit<Convite, "id" | "expira">, semanas = 6): Convite {
  const e = caminhoDe(s.carreira), cv = { id: `c${++e.seq}`, expira: semanaAbs(s.carreira) + semanas, ...x };
  e.convites.push(cv);
  return cv;
}
/** Sorteia um clube das ligas; os da cidade do jogador têm mais chance (o olheiro mora perto). */
function sortearClube(pacote: PacoteDados, rng: RNG, ligas: Liga[], cidade?: string, evitar: string[] = []): Clube | undefined {
  const w = mundo(pacote), pool = ligas.flatMap((l) => l.clubes).filter((c) => !evitar.includes(c.id));
  if (!pool.length) return;
  const peso = (c: Clube) => (cidade && w.info[c.id]?.cidade === cidade ? 5 : 1);
  const total = pool.reduce((a, c) => a + peso(c), 0);
  let r = rng.next() * total;
  for (const c of pool) { r -= peso(c); if (r <= 0) return c; }
  return pool[pool.length - 1];
}
const ligasBR = (pacote: PacoteDados, ids: string[]) => { const w = mundo(pacote); return ids.flatMap((id) => (id === "BRA4" ? "ABCDEFGH".split("").map((g) => w.liga[`BRA4${g}`]) : [w.liga[id]])).filter(Boolean); };

/** Ajuda de custo na base (R$/mês) pelo nível da liga do clube. */
const ajudaBase = (ligaId: string) => (ligaId === "BRA1" ? 3000 : ligaId === "BRA2" ? 2000 : ligaId === "BRA3" ? 1200 : 800);

// ------------------------------------------------------------------ convites
function convitePeneira(pacote: PacoteDados, s: Save, rng: RNG, garantido = false): Convite | undefined {
  const n = nivelVisto(s), e = caminhoDe(s.carreira);
  const ids = n >= 60 ? ["BRA1", "BRA2"] : n >= 55 ? ["BRA1", "BRA2", "BRA3"] : n >= 50 ? ["BRA2", "BRA3", "BRA4"] : garantido ? ["BRA4"] : ["BRA3", "BRA4"];
  const ja = e.convites.map((x) => x.clubeId);
  const clube = sortearClube(pacote, rng, ligasBR(pacote, ids), CIDADES_VARZEA[e.cidade ?? "SP"], ja);
  if (!clube) return;
  const li = infoLiga(clube.ligaId);
  return novoConvite(s, { tipo: "peneira", clubeId: clube.id, titulo: `Peneira no ${clube.nome}`, salario: ajudaBase(li.id), anos: 2,
    texto: `Um olheiro do ${clube.nome} (${li.curto}) viu você jogar e chamou para a base. Ajuda de custo de R$ ${ajudaBase(li.id).toLocaleString("pt-BR")} por mês e alojamento do clube.` });
}
function conviteProfissional(pacote: PacoteDados, s: Save, rng: RNG, ids: string[], motivo: string): Convite | undefined {
  const w = mundo(pacote), e = caminhoDe(s.carreira);
  const clube = sortearClube(pacote, rng, ligasBR(pacote, ids).concat(ids.includes("USA1") ? [w.liga.USA1] : []).filter(Boolean), CIDADES_VARZEA[e.cidade ?? "SP"], e.convites.map((x) => x.clubeId));
  if (!clube) return;
  const liga = w.liga[clube.ligaId], j = s.jogador;
  const sal = Math.round(salarioMensal({ ovr: ovr(j), idade: j.idade, liga, clube, agente: s.carreira.agente, fama: s.carreira.fama }));
  return novoConvite(s, { tipo: "profissional", clubeId: clube.id, titulo: `Contrato com o ${clube.nome}`, salario: sal, anos: 2,
    texto: `${motivo} O ${clube.nome} (${infoLiga(liga.id).curto}) oferece contrato profissional de 2 anos: R$ ${sal.toLocaleString("pt-BR")} por mês.` });
}
function convitesUniversidade(pacote: PacoteDados, s: Save, rng: RNG) {
  const w = mundo(pacote), unis = [...w.liga["USA-NCAA"].clubes].sort((a, b) => b.forca - a.forca);
  // os melhores programas chamam quem tem mais nível
  const n = nivelVisto(s), ini = clamp(Math.round((62 - n) * 0.8), 0, unis.length - 3);
  const escolhidas = unis.slice(ini, ini + 5).sort(() => rng.next() - 0.5).slice(0, 3);
  for (const u of escolhidas) novoConvite(s, { tipo: "universidade", clubeId: u.id, titulo: `Bolsa em ${u.nome}`, salario: 0, anos: 4,
    texto: `${u.nome} oferece bolsa de estudos completa para jogar no time da universidade. Quatro anos de faculdade; a partir do segundo, você pode entrar no draft.` }, 10);
}
/** Draft da liga americana: pior campanha escolhe primeiro. Devolve undefined se ninguém escolher. */
function draft(pacote: PacoteDados, s: Save, rng: RNG): Convite | undefined {
  const w = mundo(pacote), j = s.jogador, e = caminhoDe(s.carreira);
  const nota = ovr(j) + 0.45 * Math.max(0, j.pot - ovr(j)) + rng.range(-1.5, 1.5);
  const pick = Math.round(clamp((67 - nota) * 4.5, 0, 200)) + 1;
  if (pick > 90) return;
  const ordem = [...w.liga.USA1.clubes].sort((a, b) => a.forca - b.forca), clube = ordem[(pick - 1) % ordem.length];
  const generation = e.temporadasFase <= 3 && j.pot >= 76 && pick <= 15;
  const base = Math.round(salarioMensal({ ovr: ovr(j), idade: j.idade, liga: w.liga.USA1, clube, agente: s.carreira.agente, fama: s.carreira.fama }));
  const sal = Math.max(base, generation ? 75000 : 40000);
  const rodada = Math.ceil(pick / 30);
  return novoConvite(s, { tipo: "draft", clubeId: clube.id, titulo: `Draft: ${pick}ª escolha`, salario: sal, anos: generation ? 4 : 3, pick, generation,
    texto: `O ${clube.nome} escolheu você na ${rodada}ª rodada do draft (${pick}ª escolha geral).${generation ? " Contrato especial de jovem talento: salário acima do piso de novato." : ""} Oferta: R$ ${sal.toLocaleString("pt-BR")} por mês.` }, 8);
}

// ------------------------------------------------------------------ semana e fim de temporada
/** Semana: convites vencem; na várzea, quem joga bem chama a atenção dos olheiros. */
export function semanaDoCaminho(pacote: PacoteDados, s: Save, nota: number, jogou: boolean, eventos: string[]) {
  const c = s.carreira, e = caminhoDe(c), agora = semanaAbs(c);
  const caiu = e.convites.filter((x) => x.expira <= agora);
  if (caiu.length) { e.convites = e.convites.filter((x) => x.expira > agora); eventos.push(caiu.length === 1 ? `O convite do ${infoClube(pacote, caiu[0].clubeId).nome} expirou.` : `${caiu.length} convites expiraram.`); }
  // ninguém fica preso: terminou o colégio, a universidade ou a academia sem decidir, novos convites chegam
  if (!e.convites.length && c.semana === 6) {
    const rng = rngDe(s, "de-novo"), j = s.jogador;
    if ((c.fase === "colegial" || c.fase === "academia") && j.idade >= 18) { convitesUniversidade(pacote, s, rng); eventos.push("Universidades voltaram a oferecer bolsa."); }
    if ((c.fase === "universidade" && e.temporadasFase >= 4) || ((c.fase === "colegial" || c.fase === "academia") && j.idade >= 19)) {
      const cv = conviteProfissional(pacote, s, rng, ovr(j) >= 60 ? ["BRA2", "BRA3"] : ["BRA3", "BRA4"], "Um clube brasileiro quer você.");
      if (cv) { eventos.push(cv.titulo); noticia(s, "clube", cv.titulo, cv.texto); }
    }
  }
  if (c.fase !== "varzea" || !jogou || e.convites.length >= 3) return;
  const rng = rngDe(s, "olheiro"), n = nivelVisto(s);
  const p = 0.015 + Math.max(0, nota - 7) * 0.05 + Math.max(0, n - 50) * 0.004;
  if (!rng.chance(p)) return;
  const cv = s.jogador.idade >= 18 ? conviteProfissional(pacote, s, rng, n >= 56 ? ["BRA3", "BRA4"] : ["BRA4"], "Os olheiros não param de falar de você na várzea.") : convitePeneira(pacote, s, rng);
  if (cv) { eventos.push(`Olheiro na arquibancada: ${cv.titulo.toLowerCase()}!`); noticia(s, "clube", cv.titulo, cv.texto); }
}

/** Fim de temporada (a idade já subiu): passagens de fase. */
export function fimDeTemporadaDoCaminho(pacote: PacoteDados, s: Save, eventos: string[]) {
  const c = s.carreira, j = s.jogador, e = caminhoDe(c), rng = rngDe(s, "fim");
  if (!c.fase) return;
  e.temporadasFase++;
  const avisar = (cv: Convite | undefined) => { if (cv) { eventos.push(cv.titulo); noticia(s, "clube", cv.titulo, cv.texto); } };
  if (c.fase === "varzea") {
    if (j.idade >= 18) {
      avisar(conviteProfissional(pacote, s, rng, nivelVisto(s) >= 56 ? ["BRA3", "BRA4"] : ["BRA4"], "Aos 18, a várzea ficou pequena."));
      avisar(conviteProfissional(pacote, s, rng, ["BRA4"], "Um clube do interior acompanhou sua temporada."));
    } else if (j.idade >= 16 && !e.convites.length) avisar(convitePeneira(pacote, s, rng, true));
  } else if (c.fase === "colegial" && j.idade >= 18) {
    convitesUniversidade(pacote, s, rng);
    eventos.push("Formatura no colégio: três universidades oferecem bolsa.");
    noticia(s, "clube", "Fim do high school", `${j.apelido} se forma no colégio. Universidades oferecem bolsa; dá também para voltar ao Brasil como profissional.`);
    avisar(conviteProfissional(pacote, s, rng, ovr(j) >= 60 ? ["BRA2", "BRA3"] : ["BRA3", "BRA4"], "Um clube brasileiro acompanhou seus jogos nos EUA."));
    if (ovr(j) >= 66) avisar(conviteProfissional(pacote, s, rng, ["USA1"], "Talento raro, sem passar pelo draft:"));
  } else if (c.fase === "universidade") {
    if (e.temporadasFase >= 2) {
      const cv = draft(pacote, s, rng);
      if (cv) avisar(cv);
      else {
        eventos.push("Ninguém te escolheu no draft.");
        noticia(s, "clube", "Fora do draft", `${j.apelido} não foi escolhido no draft da liga americana.`);
        if (e.temporadasFase >= 4) avisar(conviteProfissional(pacote, s, rng, ovr(j) >= 60 ? ["BRA2", "BRA3"] : ["BRA3", "BRA4"], "Formado e fora do draft, você recebe uma proposta do Brasil."));
      }
    }
  } else if (c.fase === "academia") {
    const clube = mundo(pacote).clube[c.clubeId];
    if (j.idade >= 15 && ovr(j) >= clube.forca - (j.idade >= 18 ? 14 : 9) && !e.convites.some((x) => x.tipo === "homegrown")) {
      const sal = Math.max(40000, Math.round(salarioMensal({ ovr: ovr(j), idade: j.idade, liga: mundo(pacote).liga.USA1, clube, agente: c.agente, fama: c.fama })));
      avisar(novoConvite(s, { tipo: "homegrown", clubeId: c.clubeId, titulo: `Contrato homegrown com o ${clube.nome}`, salario: sal, anos: 4,
        texto: `Cria da academia, você pode assinar com o time principal do ${clube.nome} sem passar pelo draft: 4 anos, R$ ${sal.toLocaleString("pt-BR")} por mês.` }, 10));
    } else if (j.idade >= 18) {
      eventos.push("A academia não vai te profissionalizar.");
      noticia(s, "clube", "Fim da academia", `O ${clube.nome} não vai oferecer contrato profissional. Hora de procurar outro caminho.`);
      convitesUniversidade(pacote, s, rng);
      avisar(conviteProfissional(pacote, s, rng, ["BRA3", "BRA4"], "De volta ao Brasil?"));
    }
  }
}

// ------------------------------------------------------------------ decisões
export function aceitarConvite(pacote: PacoteDados, s: Save, id: string): { ok: boolean; msg: string } {
  const c = s.carreira, e = caminhoDe(c), cv = e.convites.find((x) => x.id === id);
  if (!cv) return { ok: false, msg: "Convite não encontrado." };
  const w = mundo(pacote), destino = w.clube[cv.clubeId], j = s.jogador;
  e.convites = []; // aceitar um convite encerra os outros
  if (cv.tipo === "homegrown") {
    c.fase = undefined; c.formacao = false; c.salario = cv.salario; c.anosContrato = cv.anos; c.escolhaNumero = "chegada";
    noticia(s, "clube", "Contrato homegrown", `${j.apelido} assina com o time principal do ${destino.nome} aos ${j.idade} anos: ${cv.anos} anos, R$ ${cv.salario.toLocaleString("pt-BR")} por mês.`, { k: "transferencia", clube: destino.id, tipo: "livre", ate: ANO_INICIAL + c.temporada + cv.anos, taxa: 0 });
    return { ok: true, msg: `Você é profissional do ${destino.nome}!` };
  }
  if (cv.tipo === "universidade") { c.fase = "universidade"; c.formacao = true; e.temporadasFase = 0; }
  else if (cv.tipo === "peneira") { c.fase = undefined; c.formacao = true; }
  else { c.fase = undefined; c.formacao = false; }
  c.salario = cv.salario; c.anosContrato = cv.anos;
  mudarDeClube(pacote, s, destino, "livre", 0);
  if (cv.tipo === "draft") noticia(s, "clube", `${j.apelido} assina com o ${destino.nome}`, `${cv.pick}ª escolha do draft, ${j.apelido} assina contrato de novato${cv.generation ? " de jovem talento" : ""}.`);
  mercadoDe(c).semRenovacao = undefined;
  return { ok: true, msg: cv.tipo === "peneira" ? `Aprovado na peneira: você agora é da base do ${destino.nome}.` : cv.tipo === "universidade" ? `Bolsa aceita: ${destino.nome}.` : `Contrato assinado com o ${destino.nome}.` };
}
export function recusarConvite(pacote: PacoteDados, s: Save, id: string): { ok: boolean; msg: string } {
  const c = s.carreira, e = caminhoDe(c), cv = e.convites.find((x) => x.id === id);
  if (!cv) return { ok: false, msg: "Convite não encontrado." };
  e.convites = e.convites.filter((x) => x.id !== id);
  if (cv.tipo === "draft" && e.temporadasFase >= 4) {
    const r = conviteProfissional(pacote, s, rngDe(s, "pos-draft"), ["BRA2", "BRA3"], "Sem o contrato da liga americana, o Brasil chama.");
    if (r) noticia(s, "clube", r.titulo, r.texto);
  }
  return { ok: true, msg: cv.tipo === "draft" ? (e.temporadasFase >= 4 ? "Você recusou o draft." : "Você recusou o draft e volta para mais um ano de faculdade.") : "Convite recusado." };
}
/** Política automática (testes e simulação): aceita o melhor convite que aparecer. */
export function decidirCaminhoAutomatico(pacote: PacoteDados, s: Save) {
  const e = caminhoDe(s.carreira);
  if (!e.convites.length) return;
  const w = mundo(pacote), ordem: TipoConvite[] = ["homegrown", "draft", "profissional", "peneira", "universidade"];
  const melhor = [...e.convites].sort((a, b) => ordem.indexOf(a.tipo) - ordem.indexOf(b.tipo) || (w.clube[b.clubeId]?.forca ?? 0) - (w.clube[a.clubeId]?.forca ?? 0))[0];
  aceitarConvite(pacote, s, melhor.id);
}
