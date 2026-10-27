// Vida fora de campo: seguidores (com ganho e perda), impostos por país, padrão de vida e equipe pessoal.
import { clamp } from "./rng.js";
import { infoLiga } from "./ligas.js";

// ------------------------------------------------------------------ visibilidade dos clubes
/** Quanto o clube projeta um jogador nas redes (0,2 = clube pequeno de segunda divisão; 2 = gigante mundial). */
const VIS_LIGA: Record<string, number> = {
  ENG1: 1.25, ESP1: 1.15, ITA1: 0.95, GER1: 0.9, FRA1: 0.85, BRA1: 0.9, POR1: 0.65, NED1: 0.55, KSA1: 0.6, ARG1: 0.7, ENG2: 0.45, ESP2: 0.3, BRA2: 0.4,
  USA1: 0.8, BRA3: 0.25, BRA4: 0.15,
};
const VIS_CLUBE: Record<string, number> = {
  "ES-RMA": 2.0, "ES-BAR": 2.0, "EN-MUN": 1.85, "EN-LIV": 1.7, "EN-MCI": 1.65, "EN-CHE": 1.55, "EN-ARS": 1.55, "FR-PSG": 1.7, "DE-FCB": 1.6, "IT-JUV": 1.45,
  "IT-MIL": 1.35, "IT-INT": 1.3, "DE-BVB": 1.25, "ES-ATM": 1.2, "EN-TOT": 1.2, "SA-NAS": 1.4, "SA-HIL": 1.0, "SA-ITT": 0.95, "SA-AHL": 0.9,
  FLA: 1.35, COR: 1.15, PAL: 1.05, SPA: 1.0, SAN: 1.05, VAS: 0.95, CAM: 0.9, GRE: 0.9, INT: 0.9, CRU: 0.9, BOT: 0.9, FLU: 0.85,
  "US-MIA": 1.5, "US-LAF": 1.05, "US-LAG": 1.05,
  "AR-BOC": 1.3, "AR-RIV": 1.25, "PT-SLB": 1.0, "PT-FCP": 0.95, "PT-SCP": 0.9, "NL-AJA": 1.0, "IT-NAP": 1.1, "IT-ROM": 1.05,
};
export function visibilidade(clubeId: string, ligaId: string | undefined, fClube: number): number {
  if (VIS_CLUBE[clubeId]) return VIS_CLUBE[clubeId];
  const li = infoLiga(ligaId);
  if (li.amador) return 0.12;
  return clamp((VIS_LIGA[li.id] ?? VIS_LIGA[li.id.slice(0, 4)] ?? 0.6) * (0.55 + 0.45 * fClube), 0.1, 1.6);
}

// ------------------------------------------------------------------ seguidores
/** Teto suave: ninguém passa muito de 650 milhões (o maior perfil de jogador do mundo fica perto disso). */
const TETO_SEG = 700e6;
export interface EstadoRedes { engajamento: number; hype: number }

/** Até onde o clube e a liga deixam o jogador chegar nas redes: um garoto de Série C não passa de uns 2 milhões,
 *  por mais gol que faça. A seleção quebra esse teto (e uma Copa do Mundo quebra mais ainda). */
const TETO_LIGA: Record<string, number> = {
  BRA4: 0.5e6, BRA3: 2e6, BRA2: 6e6, BRA1: 30e6, ARG1: 25e6, POR1: 30e6, NED1: 25e6, USA1: 60e6, KSA1: 150e6,
  ENG2: 10e6, ESP2: 8e6, ITA1: 120e6, GER1: 120e6, FRA1: 120e6, ESP1: 300e6, ENG1: 300e6,
};
export interface SelecaoRedes { convocacoes: number; copas: number }
export function tetoSeguidores(clubeId: string, ligaId: string | undefined, fClube: number, sel?: SelecaoRedes): number {
  const li = infoLiga(ligaId);
  let t = li.amador ? 0.15e6 : (TETO_LIGA[li.id] ?? TETO_LIGA[li.id.slice(0, 4)] ?? 15e6) * (0.5 + 0.5 * clamp(fClube, 0, 1.4));
  if (VIS_CLUBE[clubeId]) t *= VIS_CLUBE[clubeId];
  const n = sel?.convocacoes ?? 0;
  if (n > 0) {
    // camisa da seleção: o país inteiro passa a olhar para ele, jogue onde jogar
    t = Math.max(t * (1 + 3 * Math.min(1, n / 3)), 10e6 + 5e6 * Math.min(n, 4));
    if ((sel?.copas ?? 0) > 0) t = Math.max(t * 2, 60e6);
  }
  return Math.min(TETO_SEG, t);
}

/** Quantos seguidores o jogador "deveria" ter agora: fama, clube, jeito de marqueteiro e quanto ele posta (até o teto). */
export function alvoSeguidores(fama: number, vis: number, carisma: number, engajamento: number, hype: number, teto = TETO_SEG): number {
  const base = 2500 * Math.exp(fama / 8.4); // fama 30 ≈ 90 mil; 60 ≈ 3 mi; 90 ≈ 110 mi
  const marqueteiro = 0.6 + (0.9 * carisma) / 20; // 0,65 a 1,5
  const posta = 0.6 + (0.8 * engajamento) / 100; // 0,6 a 1,4
  const bruto = base * vis * marqueteiro * posta * (1 + hype);
  const t = Math.min(TETO_SEG, teto);
  return t * (1 - Math.exp(-bruto / t));
}

/** Uma semana nas redes: sobe rápido quando está abaixo do alvo, cai devagar quando está acima. */
export function semanaRedes(seg: number, alvo: number): number {
  if (!(seg > 0) || seg > 5 * TETO_SEG) return Math.round(alvo); // save quebrado / números de antes da correção
  // acima do alvo cai devagar; muito acima (número que não cabe no clube) cai rápido
  const taxa = alvo > seg ? 0.06 : seg > 2 * alvo ? 0.1 : 0.02;
  return Math.max(100, Math.round(seg + (alvo - seg) * taxa));
}

/** Troca de clube: parte da torcida nova chega (ou a antiga vai embora) de uma vez. */
export function saltoTransferencia(seg: number, alvoNovo: number): number {
  return Math.max(100, Math.round(seg + (alvoNovo - seg) * (alvoNovo > seg ? 0.35 : 0.15)));
}

// ------------------------------------------------------------------ impostos
/** Alíquota efetiva sobre o salário de jogador, por país da liga. O Golfo não cobra imposto de renda. */
const IMPOSTO: Record<string, number> = { BRA: 0.275, ARG: 0.35, ENG: 0.45, ESP: 0.47, ITA: 0.43, GER: 0.45, FRA: 0.45, POR: 0.28, NED: 0.45, KSA: 0, USA: 0.37 };
export const aliquota = (ligaId: string | undefined) => IMPOSTO[infoLiga(ligaId).pais] ?? 0.275;
export function imposto(salario: number, ligaId: string | undefined): number {
  return aliquota(ligaId) * Math.max(0, salario - 5000);
}

// ------------------------------------------------------------------ padrão de vida
export type ItemVida = "alimentacao" | "lazer" | "familia";
export interface NivelVida { nome: string; texto: string; custo: number; moral?: number; recuperacao?: number; evolucao?: number; fama?: number; noite?: number }
export const VIDA: Record<ItemVida, { nome: string; niveis: NivelVida[] }> = {
  alimentacao: { nome: "Alimentação", niveis: [
    { nome: "Básica", texto: "Mercado do bairro, marmita congelada.", custo: 900, recuperacao: -3 },
    { nome: "Balanceada", texto: "Feira toda semana e comida de verdade.", custo: 2500 },
    { nome: "Nutricionista", texto: "Plano alimentar e suplementos.", custo: 9000, recuperacao: 3, evolucao: 2 },
    { nome: "Chef particular", texto: "Cardápio de atleta preparado em casa.", custo: 38000, recuperacao: 6, evolucao: 4 },
  ] },
  lazer: { nome: "Lazer e viagens", niveis: [
    { nome: "Em casa", texto: "Série, videogame e família.", custo: 300, moral: -2 },
    { nome: "Simples", texto: "Cinema, restaurante no fim de semana.", custo: 1200 },
    { nome: "Viagens nas férias", texto: "Praia, resort, um destino novo por ano.", custo: 18000, moral: 2 },
    { nome: "Jet set", texto: "Iate, camarote e jatinho fretado.", custo: 160000, moral: 4, fama: 2, noite: 2 },
  ] },
  familia: { nome: "Família", niveis: [
    { nome: "Cada um por si", texto: "Os pais se viram sozinhos.", custo: 0, moral: -1 },
    { nome: "Ajuda mensal", texto: "Uma mesada para as contas de casa.", custo: 4000, moral: 1 },
    { nome: "Sustenta a família", texto: "Casa, plano de saúde e estudo dos irmãos.", custo: 30000, moral: 3 },
  ] },
};
export type PadraoVida = Record<ItemVida, number>;
export const PADRAO_INICIAL: PadraoVida = { alimentacao: 0, lazer: 1, familia: 0 };
export const ITENS_VIDA: ItemVida[] = ["alimentacao", "lazer", "familia"];

/** Morar fora custa mais caro. */
const CUSTO_REGIAO: Record<string, number> = { BRA: 1, SUL: 0.8, EUR: 1.6, ARA: 1.3, NAM: 1.8 };
export const fCustoVida = (ligaId: string | undefined) => CUSTO_REGIAO[infoLiga(ligaId).regiao] ?? 1;

/** Equipe pessoal (assessor de imprensa, segurança, personal, advogado): cresce com a fama, em % do salário. */
export function pctEquipe(fama: number, formacao: boolean): number {
  if (formacao || fama < 25) return 0;
  return clamp(0.03 + (fama - 25) * 0.0013, 0, 0.12);
}

export interface Gastos { itens: { nome: string; valor: number }[]; total: number }
export function gastosDoMes(padrao: PadraoVida, ligaId: string | undefined, salario: number, fama: number, formacao: boolean, manutencao: { nome: string; valor: number }[] = [], fCidade = 1): Gastos {
  const f = fCustoVida(ligaId) * fCidade;
  const itens = ITENS_VIDA.map((k) => formacao && k === "alimentacao" && padrao[k] <= 1
    ? { nome: "Alimentação: refeitório do clube", valor: 0 }
    : { nome: `${VIDA[k].nome}: ${VIDA[k].niveis[padrao[k]].nome}`, valor: Math.round(VIDA[k].niveis[padrao[k]].custo * f) });
  const eq = Math.round(pctEquipe(fama, formacao) * salario);
  if (eq) itens.push({ nome: "Equipe pessoal (assessoria, segurança, personal)", valor: eq });
  for (const m of manutencao) if (m.valor > 0) itens.push(m);
  return { itens, total: itens.reduce((a, x) => a + x.valor, 0) };
}

/** Fama "natural" para o nível do jogador e o tamanho do clube: a fama sobe acima disso com gols e títulos, mas volta devagar. */
export function famaDeReferencia(ovr: number, vis: number): number {
  return clamp((ovr - 50) * 2 * (0.7 + 0.3 * vis), 0, 100);
}

/** Efeitos semanais do padrão de vida (somam com os da casa). */
export function efeitosVida(padrao: PadraoVida) {
  const r = { moral: 0, recuperacao: 0, evolucao: 0, fama: 0, noite: 0 };
  for (const k of ITENS_VIDA) {
    const n = VIDA[k].niveis[padrao[k]];
    r.moral += n.moral ?? 0; r.recuperacao += n.recuperacao ?? 0; r.evolucao += n.evolucao ?? 0; r.fama += n.fama ?? 0; r.noite += n.noite ?? 0;
  }
  return r;
}
