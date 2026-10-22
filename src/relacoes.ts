// Relacionamento com outros jogadores: companheiros de clube (convivência, jantar, sair junto) e estrelas do mundo
// (redes sociais, conversa no túnel). Amizade abre portas: troca de camisa com a estrela depois do jogo e indicação
// para o clube do amigo.
import { RNG, clamp } from "./rng.js";
import type { Clube, JogadorNPC, PacoteDados } from "./liga.js";
import { mundo } from "./mundo.js";

export interface Relacao { nome: string; clubeId: string; nivel: number; desde: number; companheiro?: boolean; camisa?: boolean; indicacao?: number }
export interface Estrela { nome: string; clubeId: string; ovr: number; posicao: string; idade: number; numero: number; fama: number }

export const NIVEIS: [number, string][] = [[80, "Melhor amigo"], [60, "Parceiro"], [40, "Amigo"], [20, "Colega"], [0, "Conhecido"]];
export const rotuloNivel = (n: number) => NIVEIS.find(([m]) => n >= m)![1];

// ------------------------------------------------------------------ estrelas
let cacheEstrelas: { pacote: PacoteDados; lista: Estrela[] } | undefined;
/** Estrelas: todo jogador de OVR 85+ e, em cada liga (até a segunda divisão), o craque de cada clube da metade de cima. */
export function estrelas(pacote: PacoteDados): Estrela[] {
  if (cacheEstrelas?.pacote === pacote) return cacheEstrelas.lista;
  const w = mundo(pacote), lista: Estrela[] = [], vistos = new Set<string>();
  const add = (j: JogadorNPC, c: Clube) => {
    if (vistos.has(j.nome)) return;
    vistos.add(j.nome);
    lista.push({ nome: j.nome, clubeId: c.id, ovr: j.ovr, posicao: j.posicao, idade: j.idade, numero: j.numero ?? numeroDe(j.nome), fama: clamp((j.ovr - 58) * 3.2, 20, 100) });
  };
  for (const l of w.ligas) {
    const fortes = [...l.clubes].sort((a, b) => b.forca - a.forca).slice(0, Math.ceil(l.clubes.length / 2));
    for (const c of l.clubes) for (const j of c.elenco) if (j.ovr >= 85) add(j, c);
    for (const c of fortes) { const melhor = [...c.elenco].sort((a, b) => b.ovr - a.ovr)[0]; if (melhor && melhor.ovr >= (l.nivel >= 5 ? 58 : 64)) add(melhor, c); }
  }
  lista.sort((a, b) => b.ovr - a.ovr);
  cacheEstrelas = { pacote, lista };
  return lista;
}
const hash = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
/** Química natural com um jogador (0,4 a 1,8). */
export const quimica = (nome: string) => 0.4 + 1.4 * Math.pow((hash(nome) % 1000) / 999, 1.6);
export const numeroDe = (nome: string) => { let h = 0; for (const ch of nome) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return [7, 9, 10, 11, 8, 17, 19, 21, 22][h % 9]; };
export const ehEstrela = (pacote: PacoteDados, nome: string) => estrelas(pacote).some((e) => e.nome === nome);

// ------------------------------------------------------------------ estado
export interface EstadoRelacoes { lista: Record<string, Relacao>; semana: number; feitas: string[]; camisaPedida?: string; favoritos?: string[] }
/** Favoritos: os contatos de acesso rápido no celular (melhores amigos ou quem você quer perto). */
export function alternarFavorito(r: EstadoRelacoes, nome: string): boolean {
  const f = (r.favoritos ??= []), i = f.indexOf(nome);
  if (i >= 0) { f.splice(i, 1); return false; }
  f.push(nome); return true;
}
export const relacoesDe = (c: { relacoes?: EstadoRelacoes }): EstadoRelacoes => (c.relacoes ??= { lista: {}, semana: -1, feitas: [] });

export function relacao(r: EstadoRelacoes, nome: string, clubeId: string, ano: number, companheiro = false): Relacao {
  const x = (r.lista[nome] ??= { nome, clubeId, nivel: companheiro ? 8 : 0, desde: ano });
  x.clubeId = clubeId;
  if (companheiro) x.companheiro = true;
  return x;
}
export const subir = (x: Relacao, v: number) => { x.nivel = clamp(x.nivel + v, 0, 100); };

/** Semana: convivência no clube, um pouco de distância de quem está longe. */
export function semanaRelacoes(r: EstadoRelacoes, rng: RNG, elenco: JogadorNPC[], clubeId: string, ano: number, saiuComAmigos: number) {
  // quem não é mais companheiro (você saiu do clube) vira ex-companheiro
  for (const x of Object.values(r.lista)) if (x.companheiro && x.clubeId === clubeId && !elenco.some((j) => j.nome === x.nome)) x.companheiro = false;
  for (const x of Object.values(r.lista)) if (x.companheiro && x.clubeId !== clubeId) x.companheiro = false;
  // a "química" com cada um é fixa (idade parecida, jeito de ser): alguns viram amigos naturalmente, outros nunca
  const sortear = (n: number) => [...elenco].map((j) => ({ j, k: rng.next() * quimica(j.nome) })).sort((x, y) => y.k - x.k).slice(0, n).map((x) => x.j);
  for (const j of sortear(4)) subir(relacao(r, j.nome, clubeId, ano, true), rng.range(0.6, 1.6) * quimica(j.nome));
  for (let k = 0; k < saiuComAmigos; k++) for (const j of sortear(2)) subir(relacao(r, j.nome, clubeId, ano, true), rng.range(2, 4));
  for (const x of Object.values(r.lista)) if (!x.companheiro && x.nivel > 25) x.nivel = Math.max(25, x.nivel - 0.2);
}

// ------------------------------------------------------------------ ações
export type AcaoRel = "mensagem" | "jantar" | "redes" | "camisa" | "indicacao";
export const NOME_ACAO_REL: Record<AcaoRel, string> = { mensagem: "Mandar mensagem", jantar: "Chamar para jantar", redes: "Comentar nas redes", camisa: "Pedir a camisa no jogo", indicacao: "Pedir indicação ao clube dele" };
export const MAX_ACOES_SEMANA = 3;
export function podeAgir(r: EstadoRelacoes, semanaAbs: number, nome: string): string | undefined {
  if (r.semana !== semanaAbs) { r.semana = semanaAbs; r.feitas = []; }
  if (r.feitas.length >= MAX_ACOES_SEMANA) return `Já foram ${MAX_ACOES_SEMANA} conversas nesta semana. Volte na próxima.`;
  if (r.feitas.includes(nome)) return "Você já falou com ele nesta semana.";
  return undefined;
}
/** Quanto a estrela dá bola para você: estrela grande responde mais para quem também é conhecido. */
export const atencao = (famaJogador: number, famaEstrela: number) => clamp((famaJogador + 25) / famaEstrela, 0.15, 1.2);
/** Chance da troca de camisa depois do jogo. */
export const chanceCamisa = (nivel: number, famaJogador: number, famaEstrela: number) => clamp(0.08 + (nivel / 100) * 0.75 + (famaJogador - famaEstrela) / 250, 0.05, 0.95);
/** Chance de o amigo conseguir que o clube dele faça uma proposta. */
export const chanceIndicacao = (nivel: number, ovr: number, forcaClube: number) => clamp((nivel - 50) / 60 + (ovr - forcaClube + 6) / 20, 0, 0.9);
