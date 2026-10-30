// Moeda da carreira, escolhida no começo. O jogo guarda os valores em reais (R$) e os de mercado em euros (€);
// na tela, cada valor é convertido pela taxa fixa da moeda escolhida.

export const MOEDAS = {
  BRL: { simbolo: "R$", nome: "Real brasileiro", curto: "Real", porBrl: 1 },
  EUR: { simbolo: "€", nome: "Euro", curto: "Euro", porBrl: 0.17 },
  USD: { simbolo: "US$", nome: "Dólar americano", curto: "Dólar", porBrl: 0.19 },
  GBP: { simbolo: "£", nome: "Libra esterlina", curto: "Libra", porBrl: 0.15 },
  CNY: { simbolo: "¥", nome: "Yuan chinês", curto: "Yuan", porBrl: 1.35 },
} as const;
export type Moeda = keyof typeof MOEDAS;

let atual: Moeda = "BRL";
/** Define a moeda usada pelas funções de formatação (chamado ao desenhar a tela e ao criar a carreira). */
export function definirMoeda(m?: string): void { atual = m && m in MOEDAS ? (m as Moeda) : "BRL"; }
export const moedaAtual = (): Moeda => atual;
export const simboloAtual = (): string => MOEDAS[atual].simbolo;
/** Moeda sugerida pelo caminho de início (EUA → dólar, academia europeia → euro, o resto → real). */
export function moedaSugerida(caminho?: string): Moeda {
  return caminho === "eua_academia" ? "USD" : caminho === "academia_elite" ? "EUR" : "BRL";
}

const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");
/** Número de reais convertido para a moeda da carreira. */
export const numBrl = (v: number): number => v * MOEDAS[atual].porBrl;
/** Número de euros convertido para a moeda da carreira. */
export const numEur = (v: number): number => (v * MOEDAS[atual].porBrl) / MOEDAS.EUR.porBrl;
/** Valor em reais (base do jogo) → texto na moeda da carreira. */
export const valorBrl = (v: number): string => `${MOEDAS[atual].simbolo} ${fmt(numBrl(v))}`;
/** Valor em euros (mercado e transferências) → texto na moeda da carreira. */
export const valorEur = (v: number): string => `${MOEDAS[atual].simbolo} ${fmt(numEur(v))}`;

const curto = (x: number): string => {
  const a = Math.abs(x);
  const t = a >= 1e6 ? `${(a / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi` : a >= 1e3 ? `${Math.round(a / 1e3).toLocaleString("pt-BR")} mil` : fmt(a);
  return `${x < 0 ? "−" : ""}${MOEDAS[atual].simbolo} ${t}`;
};
/** Valor em reais → texto curto (mil/mi) na moeda da carreira. */
export const curtoBrl = (v: number): string => curto(numBrl(v));
/** Valor em euros → texto curto (mil/mi) na moeda da carreira. */
export const curtoEur = (v: number): string => curto(numEur(v));
