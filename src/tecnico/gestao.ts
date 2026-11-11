// A gestão do clube no modo técnico: a comissão técnica como no Football Manager (várias pessoas por função, com vagas
// que a diretoria autoriza ou manda cortar), as contas do clube (encargos, dívida, repasse ao clube social), as
// eleições de presidente (de 3 em 3 ou de 4 em 4 anos) e a virada para SAF quando um grupo compra o futebol.
import { RNG, clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { mundo, infoClube } from "../mundo.js";
import { infoLiga } from "../ligas.js";
import { gerarNome } from "../nomes.js";
import { FUNCOES, type Funcao, type Membro } from "./modelo.js";
import { DEPS, NOME_DEP, HABS, HABS_DEP, CARGOS, CARGOS_DEP, LIMITE_DEP, vagasIniciaisDep, notaNoCargo, type Dep, type Cargo, type Hab } from "./staff.js";
import type { SaveTecnico } from "./motor.js";

// ------------------------------------------------------------------ comissão técnica (departamentos)
/** Habilidades de um profissional (1 a 20): fortes no que é a especialidade, medianas no resto do departamento. */
export function gerarHabs(rng: RNG, d: Dep, spec: Cargo, nivel: number): Partial<Record<Hab, number>> {
  const h: Partial<Record<Hab, number>> = {}, base = 1 + nivel * 3.4, foco = CARGOS[spec].peso;
  for (const k of HABS) {
    const v = foco[k] ? base + 1.8 + rng.normal(0, 1.4) : HABS_DEP[d].includes(k) ? base - 4 + rng.normal(0, 2.2) : rng.int(1, 9);
    h[k] = clamp(Math.round(v), 1, 20);
  }
  return h;
}
/** Uma pessoa nova para o cargo (nível de 1 a 5 vira as habilidades). */
export function gerarMembro(rng: RNG, d: Dep, cargo: Cargo, nivel: number, nome: string, nac: string, salario: (n: number) => number): Membro {
  const m: Membro = { nome, nac, idade: rng.int(29, 64), nivel: 1, salario: 0, cargo, hab: gerarHabs(rng, d, cargo, nivel) };
  m.nivel = clamp(Math.round(notaNoCargo(m, cargo)), 1, 5);
  const topo = Math.max(...CARGOS_DEP(d).map((c) => notaNoCargo(m, c)));
  m.salario = salario(topo);
  return m;
}
export const membrosDe = (s: SaveTecnico, d: Dep): Membro[] => s.deps?.[d] ?? [];
/** De função antiga para departamento e cargo (saves de antes dos departamentos). */
const ANTIGO: Record<Funcao, [Dep, Cargo[]]> = {
  auxiliar: ["tecnica", ["assistente", "auxiliar"]], treinador: ["tecnica", ["t_ataque", "t_defesa", "t_posse", "t_bp", "auxiliar"]],
  preparador: ["fisica", ["preparador"]], goleiros: ["tecnica", ["t_goleiros"]], medico: ["medica", ["chefe_med", "medico"]], fisio: ["medica", ["fisio"]],
  analista: ["analise", ["chefe_ana", "ana_adv", "ana_des"]], base: ["base", ["coord_base", "t_base"]], olheiro: ["scout", ["chefe_scout", "olheiro"]],
};
/** Saves antigos (uma pessoa por função, ou equipes por função) viram departamentos com cargos e habilidades. */
export function migrarEquipe(pacote: PacoteDados, s: SaveTecnico) {
  if (!s.deps) {
    const velhas: Partial<Record<Funcao, Membro[]>> = s.equipe ?? Object.fromEntries(FUNCOES.map((f) => [f, (s.staff as Partial<Record<Funcao, Membro>>)[f] ? [(s.staff as Partial<Record<Funcao, Membro>>)[f]!] : []]));
    s.deps = {};
    for (const f of FUNCOES) {
      const [d, cargos] = ANTIGO[f];
      (velhas[f] ?? []).forEach((m, i) => {
        let cargo = cargos[Math.min(i, cargos.length - 1)];
        if (CARGOS[cargo].chefe && (s.deps![d] ?? []).some((x) => x.cargo === cargo)) cargo = cargos.find((c) => !CARGOS[c].chefe) ?? CARGOS_DEP(d).find((c) => !CARGOS[c].chefe)!;
        const hab = m.hab ?? gerarHabs(new RNG(`${s.semente}|migra|${m.nome}`), d, cargo, m.nivel);
        (s.deps![d] ??= []).push({ ...m, cargo, hab });
      });
    }
  }
  const ini = vagasIniciaisDep(nivelDoClube(pacote, s));
  s.vagasDep ??= ini;
  for (const d of DEPS) { s.deps[d] ??= []; s.vagasDep[d] = Math.max(s.vagasDep[d] ?? ini[d], s.deps[d]!.length); }
}
export function nivelDoClube(pacote: PacoteDados, s: SaveTecnico): number {
  const c = mundo(pacote).clube[s.clubeId];
  return clamp(Math.round(1 + (c?.fClube ?? 0.5) * 1.4 + (infoLiga(s.ligaId).nivel <= 1 ? 1 : 0)), 1, 5);
}
/** Pedir mais uma vaga num departamento: a diretoria olha a confiança, o caixa e o quanto a comissão já custa. */
export function pedirVagaStaff(s: SaveTecnico, d: Dep, folha: number, folhaStaff: number): { ok: boolean; msg: string } {
  const v = s.vagasDep![d], conf = s.diretoria.confianca, austero = s.governo?.perfil === "austero", nome = NOME_DEP[d].toLowerCase();
  if (v >= LIMITE_DEP[d]) return { ok: false, msg: `A ${nome} já está do tamanho máximo que um clube mantém.` };
  if (s.diretoria.corte) return { ok: false, msg: "A diretoria está pedindo corte na comissão. Agora não dá para crescer." };
  if (conf < (austero ? 65 : 55)) return { ok: false, msg: `A diretoria não confia o bastante para aumentar a estrutura (precisa de ${austero ? 65 : 55}).` };
  if (s.clube.saldo < (austero ? 8 : 5) * (folha + folhaStaff)) return { ok: false, msg: `O caixa não sustenta mais gente: a diretoria quer ${austero ? 8 : 5} meses de salários guardados.` };
  if (folhaStaff > folha * (austero ? 0.12 : 0.18)) return { ok: false, msg: "A estrutura já está cara perto da folha do elenco. A diretoria disse não." };
  s.vagasDep![d] = v + 1; s.diretoria.confianca = clamp(conf - 2, 0, 100);
  return { ok: true, msg: `Aprovado: mais uma vaga na ${nome} (agora ${v + 1}).` };
}
/** Diretoria cortando: tira uma vaga de cada departamento indicado (nunca abaixo de 1). */
export function cortarVagas(s: SaveTecnico, deps: Dep[]) { for (const d of deps) s.vagasDep![d] = Math.max(1, (s.vagasDep![d] ?? 1) - 1); }

// ------------------------------------------------------------------ dívida e governo do clube
export type TipoGoverno = "associativo" | "saf" | "empresa";
export interface Candidato { nome: string; plataforma: "continuidade" | "gastador" | "austero"; texto: string }
export interface Governo {
  tipo: TipoGoverno; presidente: string; desde: number;
  /** associativo: mandato (anos) e a temporada da próxima eleição */ mandato?: number; proxEleicao?: number;
  /** SAF: o grupo dono e o jeito dele */ dono?: string; perfil?: "investidor" | "austero";
  eleicao?: { situacao: Candidato; oposicao: Candidato; apoio?: "situacao" | "oposicao" | "neutro"; votacao: number };
}
/** Clubes que já são SAF ou de dono no começo (no Brasil, os que viraram SAF de verdade). */
const SAF_INICIAL = new Set(["BOT", "CRU", "VAS", "BAH", "CAM", "RBB", "FOR", "CUI", "ATH"]);
/** Onde o clube é dos sócios (com eleição): América do Sul e alguns clubes de sócios da Europa. */
const ASSOCIATIVOS_EUROPA = new Set(["ES-RMA", "ES-BAR", "ES-ATH", "ES-OSA", "PT-SLB", "PT-FCP", "PT-SCP", "DE-FCB", "DE-BVB"]);
const GRUPOS = ["Grupo Atlântico Capital", "Fundo Horizonte Sports", "Aurora Football Partners", "Consórcio Vale Verde", "Pacífico Holdings", "Grupo Estrela do Sul", "Northwind Sports Group", "Fundo Cordilheira"];
const hash = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
export function governoInicial(pacote: PacoteDados, s: SaveTecnico): Governo {
  const pais = infoClube(pacote, s.clubeId)?.pais ?? "", h = hash(`${s.semente}|gov|${s.clubeId}`), rng = new RNG(`${s.semente}|gov|${s.clubeId}`);
  const presidente = gerarNome(rng, pais.length === 3 ? pais : "BRA", new Set());
  if (SAF_INICIAL.has(s.clubeId)) return { tipo: "saf", presidente, desde: s.temporada, dono: GRUPOS[h % GRUPOS.length], perfil: h % 3 ? "investidor" : "austero" };
  if (["BRA", "ARG", "URU", "CHI", "PAR"].includes(pais) || ASSOCIATIVOS_EUROPA.has(s.clubeId)) {
    const mandato = h % 2 ? 3 : 4;
    return { tipo: "associativo", presidente, desde: s.temporada, mandato, proxEleicao: s.temporada + (h >>> 3) % mandato };
  }
  return { tipo: "empresa", presidente, desde: s.temporada, dono: GRUPOS[(h >>> 5) % GRUPOS.length] };
}
/** Dívida de começo: clubes associativos do Brasil e da Argentina costumam dever bastante; o resto, pouco. */
export function dividaInicial(pacote: PacoteDados, s: SaveTecnico, base: number): number {
  const pais = infoClube(pacote, s.clubeId)?.pais ?? "", h = hash(`${s.semente}|div|${s.clubeId}`) % 1000 / 1000;
  const meses = ["BRA", "ARG"].includes(pais) ? (SAF_INICIAL.has(s.clubeId) ? 2 + h * 5 : 4 + h * 14) : h * 6;
  return Math.round(base * meses / 1e5) * 1e5;
}
/** Parcela mensal da dívida (juros de 0,4% ao mês, quitando em ~10 anos). */
export const parcelaDivida = (divida: number) => (divida > 0 ? Math.round(divida / 120 + divida * 0.004) : 0);

// ------------------------------------------------------------------ eleição
const TEXTO_PLAT: Record<Candidato["plataforma"], string> = {
  continuidade: "Promete manter o projeto (e o técnico) e arrumar as contas aos poucos.",
  gastador: "Promete reforços de peso: vai buscar dinheiro emprestado para montar um time campeão.",
  austero: "Promete arrumar a casa: cortar gastos, vender quem valoriza e pagar a dívida.",
};
/** Na temporada de eleição, na semana 22: os dois candidatos (situação e oposição). */
export function abrirEleicao(pacote: PacoteDados, s: SaveTecnico): Governo["eleicao"] | undefined {
  const g = s.governo;
  if (!g || g.tipo !== "associativo" || g.proxEleicao !== s.temporada || g.eleicao) return undefined;
  const pais = infoClube(pacote, s.clubeId)?.pais ?? "BRA", rng = new RNG(`${s.semente}|eleicao|${s.temporada}`), usados = new Set([g.presidente]);
  const sit: Candidato = { nome: rng.chance(0.55) ? g.presidente : gerarNome(rng, pais.length === 3 ? pais : "BRA", usados), plataforma: "continuidade", texto: TEXTO_PLAT.continuidade };
  const plat = rng.chance(s.clube.divida && s.clube.divida > (s.clube.folhaBase ?? 1) * 12 ? 0.6 : 0.4) ? "austero" : "gastador";
  const opo: Candidato = { nome: gerarNome(rng, pais.length === 3 ? pais : "BRA", usados), plataforma: plat, texto: TEXTO_PLAT[plat] };
  g.eleicao = { situacao: sit, oposicao: opo, votacao: 32 };
  return g.eleicao;
}
/** Chance da situação ganhar: o momento do time, a torcida e as contas. */
export function chanceSituacao(s: SaveTecnico, pos: number, esperado: number): number {
  const base = s.clube.folhaBase ?? 1;
  return clamp(0.5 + (s.diretoria.confianca - 50) / 140 + clamp(esperado - pos, -6, 6) * 0.03 + (s.clube.torcida - 60) / 220 - ((s.clube.divida ?? 0) > base * 12 ? 0.1 : 0) - (s.clube.saldo < 0 ? 0.08 : 0), 0.12, 0.88);
}
/** A votação: o vencedor assume, o apoio do técnico pesa na confiança, e a plataforma mexe nas contas. */
export function votar(pacote: PacoteDados, s: SaveTecnico, pos: number, esperado: number): { venceu: "situacao" | "oposicao"; texto: string } | undefined {
  const g = s.governo, e = g?.eleicao;
  if (!g || !e) return undefined;
  const rng = new RNG(`${s.semente}|voto|${s.temporada}`), venceu = rng.chance(chanceSituacao(s, pos, esperado)) ? "situacao" : "oposicao";
  const quem = e[venceu], base = s.clube.folhaBase ?? 1, apoio = e.apoio ?? "neutro";
  let texto = `${quem.nome} ${venceu === "situacao" ? "foi eleito pela situação" : "venceu pela oposição"} e é o presidente pelos próximos ${g.mandato} anos.`;
  if (venceu === "oposicao") {
    s.diretoria.confianca = apoio === "oposicao" ? clamp(s.diretoria.confianca + 10, 0, 100) : apoio === "situacao" ? 22 : 45;
    texto += apoio === "situacao" ? " Você apoiou o outro lado: a nova diretoria assume desconfiada do seu trabalho." : apoio === "oposicao" ? " Você apoiou o vencedor e ganhou crédito." : " A nova diretoria chega sem compromisso com você.";
    if (quem.plataforma === "gastador") { s.clube.saldo += base * 4; s.clube.divida = (s.clube.divida ?? 0) + base * 6; s.clube.tetoFolha = Math.round(s.clube.tetoFolha * 1.15); texto += " Ele pegou um empréstimo para reforçar o time: mais dinheiro agora, mais dívida depois."; }
    if (quem.plataforma === "austero") { s.clube.tetoFolha = Math.round(s.clube.tetoFolha * 0.88); cortarVagas(s, ["tecnica", "scout"]); texto += " Ele cortou o teto salarial e duas vagas da comissão."; }
  } else {
    s.diretoria.confianca = clamp(s.diretoria.confianca + (apoio === "situacao" ? 8 : apoio === "oposicao" ? -20 : 0), 0, 100);
    if (apoio === "oposicao") texto += " Você apoiou a oposição e perdeu: a diretoria não esquece.";
  }
  g.presidente = quem.nome; g.desde = s.temporada; g.proxEleicao = s.temporada + (g.mandato ?? 3); g.eleicao = undefined;
  return { venceu, texto };
}

// ------------------------------------------------------------------ SAF
/** Na virada da temporada: um grupo pode comprar o futebol de um clube associativo (mais provável com dívida alta). */
export function talvezSaf(s: SaveTecnico): string | undefined {
  const g = s.governo, base = s.clube.folhaBase ?? 1;
  if (!g || g.tipo !== "associativo") return undefined;
  const rng = new RNG(`${s.semente}|saf|${s.clubeId}|${s.temporada}`);
  if (!rng.chance(0.04 + ((s.clube.divida ?? 0) > base * 12 ? 0.12 : 0) + (s.clube.saldo < 0 ? 0.08 : 0))) return undefined;
  const dono = rng.pick(GRUPOS), perfil = rng.chance(0.6) ? "investidor" : "austero";
  g.tipo = "saf"; g.dono = dono; g.perfil = perfil; g.mandato = undefined; g.proxEleicao = undefined; g.eleicao = undefined; g.desde = s.temporada;
  if (perfil === "investidor") {
    const aporte = Math.round(base * (10 + rng.next() * 20) / 1e5) * 1e5;
    s.clube.saldo += aporte; s.clube.divida = Math.round((s.clube.divida ?? 0) * 0.5); s.clube.tetoFolha = Math.round(s.clube.tetoFolha * 1.3); s.diretoria.confianca = 55;
    return `${dono} comprou o futebol do clube e virou SAF! Aporte de ${(aporte / 1e6).toFixed(1).replace(".", ",")} milhões, metade da dívida paga e teto salarial 30% maior. O novo dono quer resultado rápido.`;
  }
  s.clube.divida = 0; s.clube.saldo = Math.max(s.clube.saldo, base * 2); s.clube.tetoFolha = Math.round(s.clube.tetoFolha * 0.88); s.diretoria.confianca = 50;
  cortarVagas(s, ["tecnica", "scout"]);
  return `${dono} comprou o futebol do clube e virou SAF. O grupo assumiu a dívida inteira, mas chegou cortando: teto salarial menor, comissão enxuta e contratação só com caixa sobrando (seis folhas guardadas).`;
}
/** SAF austera: só libera contratação se sobrar caixa. */
export function travaContratacao(s: SaveTecnico, valor: number): string | undefined {
  if (s.governo?.perfil !== "austero") return undefined;
  const base = s.clube.folhaBase ?? 1;
  return s.clube.saldo - valor < base * 6 ? `${s.governo.dono} não libera: depois da compra, o caixa precisa ter pelo menos seis folhas guardadas.` : undefined;
}
