// Motor das cadeias de evento: um evento com passos (escolhas que levam a outras), marcas no save e consequências
// com personagem nomeado e ficha. Cada evento é só dado (src/cadeias-dados.ts); este arquivo interpreta tudo.
// O personagem depende do país do clube no momento do evento e fica fixo até o fim da cadeia.
// O primeiro passo é o próprio evento de vida; os seguintes entram na agenda; a consequência vira painel na Semana.
import type { OrigemOcasiao, Ocasiao, OpcaoOcasiao, EfeitoVida } from "./agenda.js";
import type { EfeitoEvento, CtxEvento, Fase } from "./eventos.js";
import { MOEDAS } from "./moeda.js";

/** Valores em dinheiro de cada uso, na moeda local (o motor converte para reais pela taxa do jogo). */
export type ChaveValor = "chuteira" | "investimentoPequeno" | "investimentoTotal" | "lucro" | "adiantamento" | "gala" | "comentario" | "curso";
export const VALORES: Record<ChaveValor, Record<string, number>> = {
  chuteira: { BRL: 600, EUR: 100, GBP: 90, USD: 115 },
  investimentoPequeno: { BRL: 5000, EUR: 850, GBP: 750, USD: 950 },
  investimentoTotal: { BRL: 50000, EUR: 8500, GBP: 7500, USD: 9500 },
  lucro: { BRL: 400, EUR: 70, GBP: 60, USD: 75 },
  adiantamento: { BRL: 2000, EUR: 340, GBP: 300, USD: 380 },
  gala: { BRL: 80000, EUR: 13600, GBP: 12000, USD: 15200 },
  comentario: { BRL: 150000, EUR: 25500, GBP: 22500, USD: 28500 },
  curso: { BRL: 30000, EUR: 5100, GBP: 4500, USD: 5700 },
};
/** Todo país do jogo cai num grupo de nomes (países com língua e cultura parecidas dividem o mesmo conjunto). */
export const GRUPO_DO_PAIS: Record<string, string> = {
  BRA: "BRA", POR: "POR", ESP: "ESP", ITA: "ITA", FRA: "FRA", ENG: "ENG", USA: "USA", GER: "GER", NED: "NED", TUR: "TUR", CRO: "CRO",
  MAR: "MAR", KSA: "KSA", IRN: "IRN", NGA: "NGA", JPN: "JPN", KOR: "KOR",
  ARG: "LATAM", URU: "LATAM", COL: "LATAM", CHI: "LATAM", PAR: "LATAM", ECU: "LATAM", PER: "LATAM", VEN: "LATAM", BOL: "LATAM", MEX: "LATAM", CRC: "LATAM", HON: "LATAM", PAN: "LATAM",
  SCO: "ENG", AUS: "ENG", NZL: "ENG", RSA: "ENG", CAN: "ENG", JAM: "ENG", INT: "ENG",
  AUT: "GER", SUI: "GER", BEL: "NED", DEN: "NED", NOR: "NED", SWE: "NED",
  POL: "CRO", UKR: "CRO", SRB: "CRO", ALG: "MAR", TUN: "MAR", EGY: "MAR", CIV: "FRA", CMR: "FRA", MLI: "FRA", SEN: "FRA",
  UAE: "KSA", QAT: "KSA", IRQ: "KSA", GHA: "NGA", CHN: "KOR", THA: "KOR", MAS: "KOR",
};
/** Personagem do país (ou do grupo dele) para uma cadeia. */
export const temPersonagem = (cad: { personagens: Record<string, unknown> }, pais?: string): boolean => !!pais && cad.personagens[GRUPO_DO_PAIS[pais] ?? pais] !== undefined;

/** Moeda de cada país onde há personagem de cadeia. */
const MOEDA_DO_PAIS: Record<string, keyof typeof MOEDAS> = {
  BRA: "BRL", FRA: "EUR", ESP: "EUR", ITA: "EUR", POR: "EUR", GER: "EUR", NED: "EUR", AUT: "EUR", BEL: "EUR", CRO: "EUR",
  ENG: "GBP", SCO: "GBP",
};
/** Países sem moeda própria no jogo usam dólar, como padrão. */
const moedaDoPais = (pais: string): keyof typeof MOEDAS => MOEDA_DO_PAIS[pais] ?? "USD";

/** Valor de um uso, convertido para reais (o save guarda reais). */
export function valorDoPais(chave: ChaveValor, pais: string): number {
  const m = moedaDoPais(pais);
  const local = VALORES[chave][m];
  return Math.round(local / MOEDAS[m].porBrl);
}

export interface PessoaCadeia { nome: string; bio: string }
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
  /** dinheiro do uso no país (sinal 1 entra, −1 sai); vale no evento ou na agenda */
  valor?: { chave: ChaveValor; sinal: 1 | -1 };
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
  /** fases da carreira em que o evento pode sair */
  fases: Fase[];
  /** só uma vez na carreira */
  unico?: boolean;
  /** condição extra além do país e da fase */
  quando?: (c: CtxEvento) => boolean;
  /** um personagem por país do clube; o evento só sai nesses países */
  personagens: Record<string, PessoaCadeia>;
  /** linha da ficha no primeiro contato; {quando} vira a semana e {pessoa} o nome */
  fichaInicio: string;
  inicio: PassoCadeia;
  passos: Record<string, PassoCadeia>;
  consequencias: Record<string, ConsequenciaCadeia>;
  /** marca → consequência */
  marcas: Record<string, string>;
  /** marca → linha da ficha */
  fichaMarca: Record<string, string>;
}
export interface EstadoCadeia { ficha: string[]; marcas: string[]; agendada?: { cons: string; quando: number }; painel?: string; feitas: string[]; pessoa?: PessoaCadeia; pais?: string }
export const novaCadeia = (): EstadoCadeia => ({ ficha: [], marcas: [], feitas: [] });

/** Personagem de um país; o nome e a bio ficam no save quando o evento começa. */
export function pessoaDaCadeia(cad: Cadeia, pais = "BRA"): PessoaCadeia {
  return cad.personagens[GRUPO_DO_PAIS[pais] ?? pais] ?? cad.personagens[pais] ?? Object.values(cad.personagens)[0];
}
/** Troca {pessoa} pelo nome do personagem. */
export const preencherPessoa = (t: string, p?: PessoaCadeia): string => t.replaceAll("{pessoa}", p?.nome ?? "");
/** Efeitos de uma escolha no evento, com o dinheiro do país. */
export function efeitosDaOpcao(o: OpcaoCadeia, pais: string): EfeitoEvento {
  return { ...(o.efeitos ?? {}), ...(o.valor ? { dinheiro: o.valor.sinal * valorDoPais(o.valor.chave, pais) } : {}) };
}

/** Marca uma escolha: guarda a marca, põe a linha na ficha e agenda a consequência dela. */
export function registrarMarca(e: EstadoCadeia, cad: Cadeia, marca: string | undefined, ab: number) {
  if (!marca) return;
  e.marcas.push(marca);
  if (cad.fichaMarca[marca]) e.ficha.push(preencherPessoa(cad.fichaMarca[marca], e.pessoa));
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
  e.ficha.push(preencherPessoa(cons.ficha, e.pessoa));
  e.agendada = undefined;
  return a.cons;
}

/** Opções de um passo na forma da agenda: a escolha carrega a marca e o próximo passo no gatilho. */
export function opcoesDaAgenda(cadId: string, passo: PassoCadeia, pais: string, pessoa?: PessoaCadeia): OpcaoOcasiao[] {
  return passo.opcoes.map((o) => ({
    id: o.id, rotulo: o.rotulo, texto: preencherPessoa(o.resultado, pessoa),
    ef: { ...(o.ef ?? {}), ...(o.valor ? { dinheiro: o.valor.sinal * valorDoPais(o.valor.chave, pais) } : {}), gatilho: `cadeia|${cadId}|${o.marca ?? ""}|${o.proximo ?? ""}` },
  }));
}
/** Um passo da cadeia como momento da agenda. A primeira opção é a que vale se o jogador não responder. */
export function passoDaAgenda(cad: Cadeia, passoId: string, pais: string, pessoa?: PessoaCadeia): Omit<Ocasiao, "uid" | "expira"> & { prazo?: number } {
  const p = cad.passos[passoId];
  return { origem: p.origem, chave: `cadeia-${cad.id}-${passoId}`, titulo: preencherPessoa(p.titulo, pessoa), texto: preencherPessoa(p.texto, pessoa), prazo: p.prazo ?? 2, opcoes: opcoesDaAgenda(cad.id, p, pais, pessoa) };
}
/** Gatilho "cadeia|id|marca|proximo" lido pela agenda. */
export function lerGatilho(g: string): { cadId: string; marca?: string; proximo?: string } | undefined {
  const [k, cadId, marca, proximo] = g.split("|");
  if (k !== "cadeia" || !cadId) return undefined;
  return { cadId, marca: marca || undefined, proximo: proximo || undefined };
}
