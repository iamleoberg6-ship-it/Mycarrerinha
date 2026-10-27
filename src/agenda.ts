// Agenda da vida fora de campo: momentos com escolha que chegam de todos os lados (família, filhos, parças, convites
// de celebridade, encrencas, vida no exterior, fundação, férias). Cada um tem opções com efeitos (e às vezes um risco),
// e vence em poucas semanas: quem não responde fica com a primeira opção de "deixar para lá".
import type { RNG } from "./rng.js";

export type OrigemOcasiao = "amor" | "familia" | "filho" | "parca" | "convite" | "encrenca" | "exterior" | "fundacao" | "ferias" | "hobby" | "garagem" | "vestiario" | "tecnico" | "rival" | "torcida" | "cidade" | "contrato" | "acontece";
export const ICONE_ORIGEM: Record<OrigemOcasiao, string> = { amor: "❤️", familia: "👨‍👩‍👧", filho: "🧒", parca: "🤙", convite: "✨", encrenca: "⚖️", exterior: "✈️", fundacao: "💛", ferias: "🏝️", hobby: "🎲", garagem: "🏎️", vestiario: "👕", tecnico: "📋", rival: "⚔️", torcida: "📣", cidade: "🏙️", contrato: "✍️", acontece: "⚡" };
export const NOME_ORIGEM: Record<OrigemOcasiao, string> = { amor: "Amor", familia: "Família", filho: "Filhos", parca: "Parças", convite: "Convite", encrenca: "Encrenca", exterior: "Vida lá fora", fundacao: "Fundação", ferias: "Férias", hobby: "Hobby", garagem: "Garagem", vestiario: "Vestiário", tecnico: "Técnico", rival: "Rival", torcida: "Torcida", cidade: "Cidade", contrato: "Contrato", acontece: "Acontecimento" };

/** O que uma escolha mexe na vida do jogador. */
export interface EfeitoVida {
  moral?: number; fama?: number; torcida?: number; relTecnico?: number; cansaco?: number; dinheiro?: number; engajamento?: number; hype?: number;
  imprensa?: number; vidaNoturna?: number; desgaste?: number; pressao?: number; adaptacao?: number; impacto?: number;
  /** semanas de lesão (gripe, pancada no treino) */
  lesao?: number;
  /** bônus de evolução nas próximas semanas (0,03 = +3%) */
  evolucao?: number;
  /** relação com um familiar (id), um filho (índice) ou um parça (id) */
  familiar?: [string, number]; filho?: [number, number]; parca?: [string, number];
  /** semanas de luto (moral pesada que passa devagar) */
  luto?: number;
  noticia?: { titulo: string; texto: string; tipo?: "vida" | "polemica" | "dinheiro" | "clube" };
  marco?: { tipo: "amor" | "filho" | "casa" | "marco" | "escandalo" | "selecao" | "clube"; texto: string };
  /** chave para o sistema de origem tratar (ex.: "parca-afastar:p2", "filho-boleiro:0") */
  gatilho?: string;
}
export interface OpcaoOcasiao { id: string; rotulo: string; texto: string; ef: EfeitoVida; risco?: { chance: number; texto: string; ef: EfeitoVida } }
export interface Ocasiao { uid: string; origem: OrigemOcasiao; titulo: string; texto: string; opcoes: OpcaoOcasiao[]; expira: number; chave: string }
export interface EstadoAgenda { pendentes: Ocasiao[]; vistas: Record<string, number>; uid: number; luto?: { semanas: number; quem: string } }
export const novaAgenda = (): EstadoAgenda => ({ pendentes: [], vistas: {}, uid: 0 });
export const MAX_PENDENTES = 5;

/** Põe um momento na agenda (sem repetir a mesma chave dentro do intervalo e sem passar do limite). */
export function agendar(a: EstadoAgenda, semanaAbs: number, o: Omit<Ocasiao, "uid" | "expira"> & { prazo?: number }, intervalo = 30): boolean {
  if (a.pendentes.length >= MAX_PENDENTES || a.pendentes.some((x) => x.chave === o.chave)) return false;
  const ult = a.vistas[o.chave];
  if (ult !== undefined && semanaAbs - ult < intervalo) return false;
  a.vistas[o.chave] = semanaAbs;
  const { prazo, ...resto } = o;
  a.pendentes.push({ ...resto, uid: `o${++a.uid}`, expira: semanaAbs + (prazo ?? 2) });
  return true;
}
/** Resolve um momento: devolve o texto e o efeito (com o risco sorteado). */
export function resolverOcasiao(a: EstadoAgenda, uid: string, opcao: string, rng: RNG): { o: Ocasiao; texto: string; ef: EfeitoVida } | undefined {
  const o = a.pendentes.find((x) => x.uid === uid);
  const op = o?.opcoes.find((x) => x.id === opcao);
  if (!o || !op) return;
  a.pendentes = a.pendentes.filter((x) => x !== o);
  if (op.risco && rng.chance(op.risco.chance)) return { o, texto: op.risco.texto, ef: op.risco.ef };
  return { o, texto: op.texto, ef: op.ef };
}
/** Momentos vencidos: fica valendo a última opção (a de "deixar para lá"). */
export function vencidas(a: EstadoAgenda, semanaAbs: number): { o: Ocasiao; texto: string; ef: EfeitoVida }[] {
  const out = a.pendentes.filter((x) => semanaAbs > x.expira).map((o) => { const op = o.opcoes[o.opcoes.length - 1]; return { o, texto: op.texto, ef: op.ef }; });
  a.pendentes = a.pendentes.filter((x) => semanaAbs <= x.expira);
  return out;
}
