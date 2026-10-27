// Lances de decisão. Cada situação testa atributos, traços e temperamento contra o nível
// do adversário, com um sorteio por cima: o resultado sai em cinco níveis, do lance perfeito
// ao desastre. A chance nunca aparece na tela.
// O catálogo fica em src/lances/: ataque, defesa, cabeça (contexto, raros) e fora (comemoração, pós-jogo).
import type { RNG } from "./rng.js";
import type { Atributo, Atributos } from "./atributos.js";
import type { PersonalidadeDNA, TracoId } from "./dna.js";
import { texto, type Contexto, type Efeito, type Nivel, type OpcaoLance, type Situacao } from "./lances/base.js";
import { ATAQUE } from "./lances/ataque.js";
import { DEFESA } from "./lances/defesa.js";
import { CABECA } from "./lances/cabeca.js";
import { COMEMORACAO, POS_JOGO } from "./lances/fora.js";
import { DECISIVOS, DISPUTA } from "./lances/decisivos.js";

export { contextoPadrao, preencher, type Contexto, type Efeito, type Nivel, type OpcaoLance, type Situacao } from "./lances/base.js";
export { COMEMORACAO, POS_JOGO, DISPUTA };
export const SITUACOES: Situacao[] = [...ATAQUE, ...DEFESA, ...CABECA, ...DECISIVOS];
export const SITUACAO: Record<string, Situacao> = Object.fromEntries([...SITUACOES, COMEMORACAO, DISPUTA, ...POS_JOGO].map((s) => [s.id, s]));

/** O que o jogador já viveu: evita repetir o mesmo lance e favorece os que ele nunca viu. */
export interface Memoria { vistos: Record<string, number>; recentes: string[] }
export const MEMORIA_RECENTE = 14;

export function pesoComMemoria(s: Situacao, c: Contexto, mem?: Memoria): number {
  let p = s.peso(c);
  if (p <= 0 || !mem) return Math.max(0, p);
  if (mem.recentes.includes(s.id)) p *= 0.25;
  else if (!mem.vistos[s.id] && !s.rara) p *= 1.6;
  return p;
}

/** Escolhe a situação pelo contexto (posição, minuto, placar, clássico, clima...) e pela memória. */
export function escolherSituacao(rng: RNG, c: Contexto, usadas: string[], mem?: Memoria, catalogo: Situacao[] = SITUACOES): Situacao {
  const lista = catalogo.filter((s) => !usadas.includes(s.id)).map((s) => ({ s, p: pesoComMemoria(s, c, mem) })).filter((x) => x.p > 0);
  const total = lista.reduce((a, x) => a + x.p, 0);
  let r = rng.next() * total;
  for (const x of lista) { r -= x.p; if (r <= 0) return x.s; }
  return lista[0]?.s ?? catalogo[0];
}

export interface DecisaoMontada { titulo: string; texto: string; opcoes: { id: string; rotulo: string }[]; situacao: string }
/** Monta o que a tela mostra: título e texto com nomes, e as opções válidas (sorteadas quando há mais que o limite). */
export function montarDecisao(rng: RNG, sit: Situacao, c: Contexto, nomes: Record<string, string>): DecisaoMontada {
  const validas = sit.opcoes.filter((o) => !o.quando || o.quando(c));
  let ops = validas;
  if (sit.mostrar && validas.length > sit.mostrar) {
    const idx = validas.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const escolhidos = new Set(idx.slice(0, sit.mostrar));
    ops = validas.filter((_, i) => escolhidos.has(i));
  }
  return { titulo: texto(rng, sit.titulo, nomes), texto: texto(rng, sit.texto, nomes), opcoes: ops.map((o) => ({ id: o.id, rotulo: o.rotulo })), situacao: sit.id };
}

/** O efeito do nível sorteado, com o texto escolhido entre as variantes e os nomes preenchidos. */
export function resolverEfeito(rng: RNG, op: OpcaoLance, nivel: Nivel, nomes: Record<string, string>): Efeito {
  const d = op.niveis[nivel];
  return { ...d, texto: texto(rng, d.texto, nomes), noticia: d.noticia ? texto(rng, d.noticia, nomes) : undefined };
}

/** Habilidade numa opção: média ponderada de atributos e da personalidade (em escala de atributo). */
export function habilidade(at: Atributos, pers: PersonalidadeDNA, tracos: TracoId[], op: OpcaoLance): number {
  const valor = (k: string) => k === "CALMA" ? 95 - 4 * pers.temperamento : k === "CARISMA" ? 15 + 4 * pers.carisma : k === "PROF" ? 15 + 4 * pers.profissionalismo : at[k as Atributo];
  const peso = Object.values(op.teste).reduce((a, b) => a + (b ?? 0), 0) || 1;
  const base = Object.entries(op.teste).reduce((s, [k, w]) => s + valor(k) * (w ?? 0), 0) / peso;
  return base + Object.entries(op.tracos ?? {}).reduce((s, [t, v]) => s + (tracos.includes(t as TracoId) ? (v ?? 0) : 0), 0);
}

/** Testes de personalidade (calma, carisma, profissionalismo) não dependem do adversário: a referência é 50. */
function referencia(adversario: number, op: OpcaoLance): number {
  const tot = Object.values(op.teste).reduce((a, b) => a + (b ?? 0), 0) || 1;
  const pers = Object.entries(op.teste).filter(([k]) => k === "CALMA" || k === "CARISMA" || k === "PROF").reduce((a, [, w]) => a + (w ?? 0), 0) / tot;
  return adversario * (1 - pers) + 50 * pers;
}
const nivelDaMargem = (m: number): Nivel => (m >= 12 ? 0 : m >= 3 ? 1 : m >= -7 ? 2 : m >= -16 ? 3 : 4);
/** Margem = habilidade − (nível do adversário + dificuldade) + sorte. Quanto maior, melhor o nível do resultado. */
export function sortearNivel(rng: RNG, hab: number, adversario: number, op: OpcaoLance): Nivel {
  return nivelDaMargem(hab - (referencia(adversario, op) + op.dif) + rng.normal(0, 10));
}
/** Valor esperado de uma opção (usado só pela política automática). */
export function notaEsperada(hab: number, adversario: number, op: OpcaoLance): number {
  const pts = [-30, -20, -10, 0, 10, 20, 30];
  return pts.reduce((s, z) => {
    const ef = op.niveis[nivelDaMargem(hab - (referencia(adversario, op) + op.dif) + z)];
    return s + ef.nota + (ef.golPro ? 0.5 : 0) - (ef.golContra ? 0.7 : 0) - (ef.vermelho ? 2 : 0) + 0.05 * (ef.moral ?? 0) + 0.05 * (ef.relTecnico ?? 0) - 0.15 * (ef.lesao ?? 0);
  }, 0) / pts.length;
}
