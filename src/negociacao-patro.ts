// Negociação de patrocínio (clube e seleção): em vez de só um valor, o pacote tem valor fixo por mês, anos de contrato,
// luvas na assinatura, bônus por título e por vaga em copa, cláusula de redução se o clube cair e preferência na
// renovação. Cada marca tem um jeito (agressiva, conservadora ou parceira), um orçamento escondido e paciência: ela
// responde com contraproposta no formato que prefere (a conservadora troca fixo por bônus de resultado, por exemplo).
import { RNG, clamp } from "./rng.js";
import { valorBrl } from "./moeda.js";

export type PerfilMarca = "agressiva" | "conservadora" | "parceira";
export const NOME_PERFIL_MARCA: Record<PerfilMarca, string> = { agressiva: "Marca agressiva", conservadora: "Marca conservadora", parceira: "Marca parceira" };
export const TEXTO_PERFIL_MARCA: Record<PerfilMarca, string> = {
  agressiva: "Quer aparecer: paga luvas grandes e gosta de contrato longo, mas tem pouca paciência.",
  conservadora: "Não gosta de risco: prefere pagar por resultado (bônus) do que fixo alto.",
  parceira: "Pensa em relação longa: valoriza preferência na renovação e conversa mais.",
};
export interface PacotePatro { fixo: number; anos: number; luvas: number; bonusTitulo: number; bonusVaga: number; rebaixamento: boolean; renovacao: boolean }
export interface MesaPatro {
  marca: string; perfil: PerfilMarca; paciencia: number; rodadas: number;
  /** orçamento por mês (equivalente) que a marca topa, e os anos que ela prefere: escondidos */ orcamento: number; anosPref: number;
  pTitulo: number; pVaga: number; podeCair: boolean; contra: PacotePatro; log: { quem: "voce" | "marca" | "info"; texto: string }[]; saiu?: boolean;
}
const arred = (v: number) => (v >= 1e6 ? Math.round(v / 1e5) * 1e5 : v >= 1e4 ? Math.round(v / 1e3) * 1e3 : Math.round(v / 100) * 100);
const PESOS: Record<PerfilMarca, { luvas: number; variavel: number; renov: number; paciencia: number }> = {
  agressiva: { luvas: 0.75, variavel: 1, renov: 1.02, paciencia: 2 },
  conservadora: { luvas: 1.2, variavel: 0.6, renov: 1.03, paciencia: 3 },
  parceira: { luvas: 1, variavel: 0.85, renov: 1.08, paciencia: 4 },
};
/** Abre a mesa a partir da oferta da marca (valor e anos dela, e o teto escondido). */
export function abrirMesaPatro(semente: string, marca: string, valor: number, anos: number, teto: number, pTitulo: number, pVaga: number, podeCair: boolean): MesaPatro {
  const r = new RNG(`${semente}|mesa|${marca}`), x = r.next(), perfil: PerfilMarca = x < 0.33 ? "agressiva" : x < 0.7 ? "conservadora" : "parceira";
  const luvas = perfil === "agressiva" ? arred(valor * r.range(2, 4)) : perfil === "parceira" ? arred(valor * r.range(0.5, 1.5)) : 0;
  const bonusTitulo = perfil === "conservadora" ? arred(valor * r.range(3, 6)) : arred(valor * r.range(0, 2));
  const contra: PacotePatro = { fixo: valor, anos, luvas, bonusTitulo, bonusVaga: perfil === "conservadora" ? arred(valor * r.range(1, 2)) : 0, rebaixamento: podeCair && perfil !== "agressiva", renovacao: perfil === "parceira" };
  const m: MesaPatro = { marca, perfil, paciencia: PESOS[perfil].paciencia, rodadas: 0, orcamento: 0, anosPref: perfil === "agressiva" ? Math.max(anos, 4) : anos, pTitulo, pVaga, podeCair, contra, log: [] };
  // o orçamento: o teto da oferta antiga vira o máximo equivalente por mês, já contando o pacote inicial
  m.orcamento = Math.max(teto, custoMarca(m, contra) * 1.02);
  m.log.push({ quem: "info", texto: `${NOME_PERFIL_MARCA[perfil]}: ${TEXTO_PERFIL_MARCA[perfil]}` });
  m.log.push({ quem: "marca", texto: `Proposta inicial: ${textoPatro(contra)}.` });
  return m;
}
/** Quanto o pacote custa para a marca, por mês, do jeito que ela enxerga. */
export function custoMarca(m: MesaPatro, p: PacotePatro): number {
  const w = PESOS[m.perfil], meses = Math.max(1, p.anos * 12);
  return p.fixo + (p.luvas / meses) * w.luvas + ((p.bonusTitulo * m.pTitulo + p.bonusVaga * m.pVaga) / 12) * w.variavel;
}
const fatorAnos = (anos: number, pref: number) => clamp(1 + (anos - pref) * 0.035, 0.82, 1.1);
const orcamentoPara = (m: MesaPatro, p: PacotePatro) => m.orcamento * fatorAnos(p.anos, m.anosPref) * (p.rebaixamento && m.podeCair ? 1.07 : 1) * (p.renovacao ? PESOS[m.perfil].renov : 1);
export const textoPatro = (p: PacotePatro) => [
  `${valorBrl(p.fixo)}/mês por ${p.anos} ${p.anos === 1 ? "ano" : "anos"}`, p.luvas ? `${valorBrl(p.luvas)} de luvas` : "", p.bonusTitulo ? `${valorBrl(p.bonusTitulo)} por título` : "",
  p.bonusVaga ? `${valorBrl(p.bonusVaga)} por vaga em copa continental` : "", p.rebaixamento ? "redução de 40% se cair" : "", p.renovacao ? "preferência na renovação" : "",
].filter(Boolean).join(", ");
/** Você manda um pacote: a marca fecha, faz contraproposta ou sai da mesa. */
export function proporPatro(m: MesaPatro, p: PacotePatro): { status: "fechado" | "contra" | "saiu"; texto: string } {
  if (m.saiu) return { status: "saiu", texto: "A marca já saiu da mesa." };
  p = { ...p, fixo: arred(Math.max(0, p.fixo)), luvas: arred(Math.max(0, p.luvas)), bonusTitulo: arred(Math.max(0, p.bonusTitulo)), bonusVaga: arred(Math.max(0, p.bonusVaga)), anos: clamp(Math.round(p.anos), 1, 10), rebaixamento: !!p.rebaixamento && m.podeCair, renovacao: !!p.renovacao };
  m.rodadas++; m.log.push({ quem: "voce", texto: `Você pediu ${textoPatro(p)}.` });
  const custo = custoMarca(m, p), orc = orcamentoPara(m, p);
  if (custo <= orc) { m.contra = p; m.log.push({ quem: "marca", texto: "Fechado!" }); return { status: "fechado", texto: `Fechado: ${textoPatro(p)}.` }; }
  m.paciencia -= custo > orc * 1.6 ? 2 : 1;
  if (m.paciencia <= 0) { m.saiu = true; m.log.push({ quem: "marca", texto: "A marca agradeceu e saiu da negociação." }); return { status: "saiu", texto: "A marca saiu da mesa." }; }
  // a contraproposta no jeito dela: mantém o que você pediu e ajusta o que ela prefere ajustar
  const c: PacotePatro = { ...p };
  const w = PESOS[m.perfil], meses = c.anos * 12, variavel = ((c.bonusTitulo * m.pTitulo + c.bonusVaga * m.pVaga) / 12) * w.variavel;
  if (m.perfil === "conservadora") {
    // corta fixo e luvas, empurra para bônus de resultado
    c.luvas = arred(c.luvas * 0.5);
    const sobra = orc * 0.97 - (c.luvas / meses) * w.luvas - variavel;
    const corte = Math.max(0, c.fixo - sobra);
    c.fixo = arred(Math.max(c.fixo * 0.5, c.fixo - corte));
    c.bonusTitulo = arred(c.bonusTitulo + corte * 12 * 0.5);
    const ainda = custoMarca(m, c) - orc * 0.97;
    if (ainda > 0) c.fixo = arred(Math.max(0, c.fixo - ainda));
  } else if (m.perfil === "agressiva") {
    // segura o fixo um pouco mais baixo, mas oferece luvas maiores e mais anos
    if (c.anos < m.anosPref) c.anos = m.anosPref;
    const o2 = orcamentoPara(m, c);
    c.luvas = arred(Math.max(c.luvas, c.fixo * 2));
    c.fixo = arred(Math.max(0, o2 * 0.97 - (c.luvas / (c.anos * 12)) * w.luvas - variavel));
  } else {
    // parceira: topa com preferência na renovação e ajusta o fixo
    c.renovacao = true;
    const o2 = orcamentoPara(m, c);
    c.fixo = arred(Math.max(0, o2 * 0.97 - (c.luvas / meses) * w.luvas - variavel));
  }
  m.contra = c;
  m.log.push({ quem: "marca", texto: `${custo > orc * 1.6 ? "Muito acima do que pensávamos. " : ""}Contraproposta: ${textoPatro(c)}.` });
  return { status: "contra", texto: `A marca fez uma contraproposta: ${textoPatro(c)}.` };
}
/** Aceitar a última proposta da marca. */
export function aceitarMesa(m: MesaPatro): { status: "fechado" | "saiu"; texto: string } {
  if (m.saiu) return { status: "saiu", texto: "A marca já saiu da mesa." };
  m.log.push({ quem: "voce", texto: "Você aceitou a proposta da marca." });
  return { status: "fechado", texto: `Fechado: ${textoPatro(m.contra)}.` };
}
