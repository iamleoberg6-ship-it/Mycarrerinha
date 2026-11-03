// Motor das cadeias de evento: um evento com passos (escolhas que levam a outras), marcas no save e consequências
// com personagem nomeado e ficha. Cada evento é só dado (src/cadeias-dados.ts); este arquivo interpreta tudo.
// O primeiro passo é o próprio evento de vida; os seguintes entram na agenda; a consequência vira painel na Semana.
import type { OrigemOcasiao, Ocasiao, OpcaoOcasiao, EfeitoVida } from "./agenda.js";
import type { EfeitoEvento } from "./eventos.js";

export interface OpcaoCadeia {
  id: string;
  rotulo: string;
  /** o que acontece logo depois da escolha */
  resultado: string;
  /** marca deixada no save: escolhe a consequência */
  marca?: string;
  /** próximo passo, que entra na agenda */
  proximo?: string;
  /** efeitos imediatos, quando a escolha é no próprio evento */
  efeitos?: EfeitoEvento;
  /** efeitos quando a escolha é na agenda */
  ef?: EfeitoVida;
}
export interface PassoCadeia { titulo: string; texto: string; origem: OrigemOcasiao; prazo?: number; opcoes: OpcaoCadeia[] }
export interface ConsequenciaCadeia {
  titulo: string; texto: string; ficha: string;
  /** semanas até chegar (padrão 3) */
  semanas?: number;
  /** espera a fama de estrela (65) em vez de um prazo */
  quando?: "fama65";
}
export interface Cadeia {
  id: string;
  personagem: { nome: string; bio: string };
  /** linha da ficha no primeiro contato; {quando} vira a semana */
  fichaInicio: string;
  inicio: PassoCadeia;
  passos: Record<string, PassoCadeia>;
  consequencias: Record<string, ConsequenciaCadeia>;
  /** marca → consequência */
  marcas: Record<string, string>;
  /** marca → linha da ficha */
  fichaMarca: Record<string, string>;
}
export interface EstadoCadeia { ficha: string[]; marcas: string[]; agendada?: { cons: string; quando: number }; painel?: string; feitas: string[] }
export const novaCadeia = (): EstadoCadeia => ({ ficha: [], marcas: [], feitas: [] });

/** Marca uma escolha: guarda a marca, põe a linha na ficha e agenda a consequência dela. */
export function registrarMarca(e: EstadoCadeia, cad: Cadeia, marca: string | undefined, ab: number) {
  if (!marca) return;
  e.marcas.push(marca);
  if (cad.fichaMarca[marca]) e.ficha.push(cad.fichaMarca[marca]);
  const consId = cad.marcas[marca];
  if (!consId) return;
  const cons = cad.consequencias[consId];
  e.agendada = { cons: consId, quando: cons.quando === "fama65" ? Number.MAX_SAFE_INTEGER : ab + (cons.semanas ?? 3) };
}

/** Chamado a cada semana. Devolve a consequência que abriu um painel agora, se houver. */
export function semanaCadeia(e: EstadoCadeia, cad: Cadeia, ab: number, fama: number): string | undefined {
  if (!e.agendada || e.painel) return undefined;
  const a = e.agendada, cons = cad.consequencias[a.cons];
  const pronta = cons.quando === "fama65" ? fama >= 65 : ab >= a.quando;
  if (!pronta) return undefined;
  e.painel = a.cons;
  e.feitas.push(a.cons);
  e.ficha.push(cons.ficha);
  e.agendada = undefined;
  return a.cons;
}

/** Opções de um passo na forma da agenda: a escolha carrega a marca e o próximo passo no gatilho. */
export function opcoesDaAgenda(cadId: string, passo: PassoCadeia): OpcaoOcasiao[] {
  return passo.opcoes.map((o) => ({ id: o.id, rotulo: o.rotulo, texto: o.resultado, ef: { ...(o.ef ?? {}), gatilho: `cadeia|${cadId}|${o.marca ?? ""}|${o.proximo ?? ""}` } }));
}
/** Um passo da cadeia como momento da agenda. A primeira opção é a que vale se o jogador não responder. */
export function passoDaAgenda(cad: Cadeia, passoId: string): Omit<Ocasiao, "uid" | "expira"> & { prazo?: number } {
  const p = cad.passos[passoId];
  return { origem: p.origem, chave: `cadeia-${cad.id}-${passoId}`, titulo: p.titulo, texto: p.texto, prazo: p.prazo ?? 2, opcoes: opcoesDaAgenda(cad.id, p) };
}
/** Gatilho "cadeia|id|marca|proximo" lido pela agenda. */
export function lerGatilho(g: string): { cadId: string; marca?: string; proximo?: string } | undefined {
  const [k, cadId, marca, proximo] = g.split("|");
  if (k !== "cadeia" || !cadId) return undefined;
  return { cadId, marca: marca || undefined, proximo: proximo || undefined };
}
