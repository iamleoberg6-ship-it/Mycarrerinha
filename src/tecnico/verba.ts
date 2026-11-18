// Verba de contratações: quem decide quanto do caixa vai para reforços é a diretoria (ou o dono), não o técnico.
// Cada diretoria tem um estilo: a ambiciosa abre o cofre (e até pega empréstimo), a equilibrada libera metade do que
// sobra, a cautelosa segura quase tudo, e a que pensa em lucro libera pouco para comprar mas gosta de base e de
// vender bem. A verba de cada temporada sai do caixa livre (o que passa da reserva de salários), mais uma parte do
// que você vender, ajustada pela dívida, pela confiança em você e pelo momento (ano de eleição...). Dá para pedir mais:
// a resposta depende da relação com a diretoria, do estilo dela e de quantas vezes você já pediu.
import { RNG, clamp } from "../rng.js";
import type { SaveTecnico } from "./motor.js";

export type EstiloDiretoria = "ambiciosa" | "equilibrada" | "cautelosa" | "lucro";
export const ESTILO: Record<EstiloDiretoria, { nome: string; texto: string; pctCaixa: number; pctVendas: number; reservaMeses: number; chance: number; empresta: boolean }> = {
  ambiciosa: { nome: "Ambiciosa", texto: "Quer ganhar já: libera boa parte do caixa e aceita se endividar por um título.", pctCaixa: 0.7, pctVendas: 0.9, reservaMeses: 2, chance: 0.6, empresta: true },
  equilibrada: { nome: "Equilibrada", texto: "Libera metade do que sobra e reinveste boa parte das vendas.", pctCaixa: 0.5, pctVendas: 0.65, reservaMeses: 3, chance: 0.45, empresta: false },
  cautelosa: { nome: "Cautelosa", texto: "Não gosta de abrir o cofre: contrata só o necessário e guarda muito caixa.", pctCaixa: 0.28, pctVendas: 0.4, reservaMeses: 5, chance: 0.25, empresta: false },
  lucro: { nome: "De olho no lucro", texto: "Pensa no clube como negócio: compra barato, vende caro e aposta na base.", pctCaixa: 0.25, pctVendas: 0.5, reservaMeses: 4, chance: 0.3, empresta: false },
};
export interface Verba { t: number; total: number; usado: number; vendas: number; extra: number; texto: string; pedidos: number; ultimoPedido?: number }

const hash = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
/** O estilo da diretoria de agora (o governo guarda; saves antigos ganham um pelo tipo de clube). */
export function estiloDe(s: SaveTecnico): EstiloDiretoria {
  const g = s.governo;
  if (g?.estilo) return g.estilo;
  const h = hash(`${s.semente}|estilo|${s.clubeId}|${g?.presidente ?? ""}`) % 100;
  if (g?.tipo === "saf") return g.perfil === "austero" ? "cautelosa" : h < 30 ? "lucro" : "ambiciosa";
  if (g?.tipo === "empresa") return h < 35 ? "lucro" : h < 70 ? "equilibrada" : h < 85 ? "ambiciosa" : "cautelosa";
  return h < 50 ? "equilibrada" : h < 75 ? "ambiciosa" : "cautelosa";
}
/** Estilo de quem chega ao poder: pela plataforma do presidente eleito ou pelo perfil do dono novo. */
export function estiloNovo(rng: RNG, de: { plataforma?: "continuidade" | "gastador" | "austero"; perfil?: "investidor" | "austero" }): EstiloDiretoria {
  if (de.plataforma === "gastador") return "ambiciosa";
  if (de.plataforma === "austero" || de.perfil === "austero") return "cautelosa";
  if (de.perfil === "investidor") return rng.chance(0.3) ? "lucro" : "ambiciosa";
  return "equilibrada";
}

/** A verba da temporada: definida quando a temporada começa (ou na primeira vez que alguém olha). */
export function verbaDe(s: SaveTecnico, folhaMes: number): Verba {
  if (s.verba?.t === s.temporada) return s.verba;
  const e = ESTILO[estiloDe(s)], reserva = e.reservaMeses * folhaMes, livre = Math.max(0, s.clube.saldo - reserva), base = s.clube.folhaBase ?? folhaMes;
  const motivos: string[] = [];
  let f = e.pctCaixa;
  if (s.clube.saldo <= 0) motivos.push("o caixa está no vermelho: só entra quem for pago com vendas");
  else if (livre <= 0) motivos.push(`o caixa mal cobre a reserva de ${e.reservaMeses} meses de salários`);
  if ((s.clube.divida ?? 0) > base * 12) { f *= 0.7; motivos.push("a dívida pesa, e uma parte do que sobra vai para pagá-la"); }
  if (s.governo?.tipo === "associativo" && s.governo.proxEleicao === s.temporada) { f *= 1.25; motivos.push("ano de eleição: o presidente quer reforço para ganhar votos"); }
  const conf = s.diretoria.confianca;
  f *= 0.7 + conf / 100 * 0.6;
  if (conf >= 75) motivos.push("a diretoria confia no seu trabalho"); else if (conf < 40) motivos.push("a diretoria anda desconfiada e segurou o dinheiro");
  // o que o clube costuma lucrar numa temporada (sem contar compra e venda de jogadores): a diretoria conta com uma parte
  const ult = s.financas.slice(-12), soma = (o: Record<string, number>, fora: Set<string>) => Object.entries(o).reduce((a, [k, x]) => a + (fora.has(k) ? 0 : x), 0);
  const lucroAno = ult.length >= 6 ? ult.reduce((a, l) => a + soma(l.receitas, VENDA_VERBA) - soma(l.despesas, GASTO_VERBA), 0) * 12 / ult.length : 0;
  if (lucroAno > 0) motivos.push("o clube costuma dar lucro, e a diretoria adianta uma parte do que vai entrar");
  const total = Math.round((livre + Math.max(0, lucroAno) * 0.4) * f / 1e4) * 1e4;
  const texto = `Diretoria ${e.nome.toLowerCase()} (${e.texto.charAt(0).toLowerCase()}${e.texto.slice(1, -1)}).${motivos.length ? ` ${motivos.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(". ")}.` : ""}`;
  s.verba = { t: s.temporada, total, usado: 0, vendas: 0, extra: 0, texto, pedidos: 0 };
  return s.verba;
}
/** Quanto ainda dá para gastar: a verba, o extra que você arrancou e a parte das vendas que a diretoria reinveste. */
export function verbaLivre(s: SaveTecnico, folhaMes: number): number {
  const v = verbaDe(s, folhaMes), e = ESTILO[estiloDe(s)];
  return Math.max(0, Math.round(v.total + v.extra + v.vendas * e.pctVendas - v.usado));
}
/** Uma compra cabe na verba? Devolve o motivo se não couber. */
export function travaVerba(s: SaveTecnico, folhaMes: number, valor: number, brl: (n: number) => string): string | undefined {
  if (valor <= 0) return undefined;
  const livre = verbaLivre(s, folhaMes);
  return valor > livre ? `Passa da verba de contratações: a diretoria liberou ${brl(livre)} para o que falta da temporada. Peça mais em Clube > Diretoria.` : undefined;
}
/** Gasto e venda mexem na verba (chamado pelos lançamentos de despesa e receita). */
export const GASTO_VERBA = new Set(["Contratações", "Luvas", "Comissões de empresários", "Parcelas e bônus de compras"]);
export const VENDA_VERBA = new Set(["Vendas", "Revendas", "Parcelas e bônus de vendas"]);

/** Pedir mais dinheiro para reforços: a diretoria olha a relação com você, o estilo dela, o caixa e quantas vezes você já pediu. */
export function pedirVerba(s: SaveTecnico, folhaMes: number, semanaAbs: number, brl: (n: number) => string): { ok: boolean; msg: string } {
  const v = verbaDe(s, folhaMes), est = estiloDe(s), e = ESTILO[est], conf = s.diretoria.confianca;
  if (v.ultimoPedido !== undefined && semanaAbs - v.ultimoPedido < 6) return { ok: false, msg: `Você pediu há pouco. A diretoria quer ver resultado antes de conversar de novo (daqui a ${6 - (semanaAbs - v.ultimoPedido)} semanas).` };
  v.ultimoPedido = semanaAbs; v.pedidos++;
  if (conf < 40) { s.diretoria.confianca = clamp(conf - 2, 0, 100); return { ok: false, msg: "A diretoria nem quis ouvir: primeiro recupere a confiança dela." }; }
  const r = new RNG(`${s.semente}|pedeVerba|${s.temporada}|${v.pedidos}`);
  if (!r.chance(clamp(e.chance + (conf - 60) / 90 - (v.pedidos - 1) * 0.15, 0.05, 0.92))) {
    s.diretoria.confianca = clamp(conf - (v.pedidos > 2 ? 4 : 2), 0, 100);
    const porque = est === "cautelosa" ? "o dono não mexe na reserva" : est === "lucro" ? "não vê retorno nesse gasto" : est === "ambiciosa" ? "já fez a parte dela neste ano" : "o orçamento está fechado";
    return { ok: false, msg: `A diretoria disse não: ${porque}.${v.pedidos > 2 ? " E está começando a se irritar com tantos pedidos." : ""}` };
  }
  const reserva = e.reservaMeses * folhaMes, livreCaixa = Math.max(0, s.clube.saldo - reserva - verbaLivre(s, folhaMes));
  const quer = Math.max(v.total * 0.35, (s.clube.folhaBase ?? folhaMes) * 3);
  let valor = Math.min(quer, livreCaixa), emprestimo = 0;
  // fora do orçamento: diretoria ambiciosa que confia muito em você pega empréstimo
  if (valor < quer * 0.5 && conf >= 75 && e.empresta) { emprestimo = Math.round((quer - valor) / 1e4) * 1e4; valor = quer; }
  valor = Math.round(valor / 1e4) * 1e4;
  if (valor <= 0) return { ok: false, msg: "A diretoria até concorda, mas não tem de onde tirar: o caixa só cobre a reserva de salários." };
  if (emprestimo) { s.clube.saldo += emprestimo; s.clube.divida = (s.clube.divida ?? 0) + Math.round(emprestimo * 1.1); }
  s.diretoria.confianca = clamp(conf - 3, 0, 100);
  v.extra += valor;
  return { ok: true, msg: `Aprovado: mais ${brl(valor)} para contratações${emprestimo ? `, com um empréstimo de ${brl(emprestimo)} (a dívida sobe)` : ""}.` };
}
/** Obra sem dinheiro em caixa (base, CT...): a diretoria financia? Depende da relação, do estilo e do tipo de obra. */
export function financiaObra(s: SaveTecnico, tipo: string): boolean {
  const est = estiloDe(s), conf = s.diretoria.confianca;
  if (conf < 75 || est === "cautelosa") return false;
  if (tipo === "base") return est !== "ambiciosa" || conf >= 80; // a do lucro e a equilibrada adoram base
  if (tipo === "ct") return est === "ambiciosa" ? conf >= 80 : conf >= 88;
  return est === "ambiciosa" && conf >= 85;
}
