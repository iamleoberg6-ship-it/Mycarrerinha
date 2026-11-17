// Beira do campo (inspirado no Football Manager): preleção antes do jogo, no intervalo e no apito final, gritos durante o
// jogo, gols esperados (xG) e o relatório do analista sobre o adversário.
// O ânimo do time vira um ajuste pequeno na chance de gol (para cima ou para baixo) que vai sumindo com o tempo; o tom
// certo depende da situação (favorito, zebra, ganhando, perdendo) e do jeito dos jogadores (profissionalismo e
// temperamento). Tom errado irrita: o ânimo cai e a moral de quem reagiu mal também.
import { RNG, clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { mundo } from "../mundo.js";
import { onzeProvavel } from "../relacoes.js";
import { ovrDe, forcaDoTime, type Atleta } from "./modelo.js";
import type { SaveTecnico, AoVivo } from "./motor.js";

export type Tom = "motivar" | "calma" | "cobrar" | "sem_pressao" | "elogiar" | "confiar";
export const TONS: { id: Tom; nome: string; dica: string }[] = [
  { id: "motivar", nome: "Motivar", dica: "Levanta o time. Funciona quase sempre, melhor ainda quando é zebra ou perdendo." },
  { id: "confiar", nome: "Mostrar confiança", dica: "\"Vocês são melhores.\" Bom quando é favorito; se perder, vira cobrança." },
  { id: "sem_pressao", nome: "Tirar a pressão", dica: "\"Ninguém espera nada da gente.\" Bom quando é zebra; com time favorito, acomoda." },
  { id: "calma", nome: "Pedir calma", dica: "Segura a ansiedade. Bom ganhando ou em jogo grande; perdendo, soa passivo." },
  { id: "cobrar", nome: "Cobrar", dica: "Bronca. Acorda o time quando está perdendo sendo melhor; ganhando, revolta. Os profissionais aguentam melhor." },
  { id: "elogiar", nome: "Elogiar", dica: "Reconhece o esforço. Ótimo ganhando; perdendo, parece que você não viu o jogo." },
];
export type Grito = "incentivar" | "exigir" | "concentrar" | "pra_cima" | "segurar";
export const GRITOS: { id: Grito; nome: string; dica: string }[] = [
  { id: "incentivar", nome: "Incentivar", dica: "Dá força ao time." },
  { id: "exigir", nome: "Exigir mais", dica: "Bom perdendo; ganhando, irrita." },
  { id: "concentrar", nome: "Concentração!", dica: "Menos chance para eles, um pouco menos para você." },
  { id: "pra_cima", nome: "Pra cima deles!", dica: "Mais chance para os dois lados." },
  { id: "segurar", nome: "Segurar o resultado", dica: "Bem menos chance para os dois lados." },
];

/** Situação do jogo: diferença de força (positiva = favorito) e de placar (positiva = ganhando). */
export function situacao(pacote: PacoteDados, s: SaveTecnico, av: AoVivo): { forca: number; placar: number } {
  const f = forcaDoTime(s.elenco, s.esc, s.tatica, s.entrosamento[s.tatica.formacao] ?? 40).geral, fAdv = mundo(pacote).clube[av.adv]?.forca ?? 65;
  return { forca: f - fAdv + (av.souCasa ? 2 : -2), placar: av.gMe - av.gAdv };
}
/** O quanto o tom combina com a situação (-1 a +1). */
function encaixe(tom: Tom, momento: "antes" | "intervalo" | "fim", fz: number, pl: number): number {
  const fav = fz >= 4, zebra = fz <= -4, ganhando = pl > 0, perdendo = pl < 0;
  if (momento === "antes") {
    return ({ motivar: zebra ? 0.8 : 0.5, confiar: fav ? 0.8 : zebra ? -0.2 : 0.3, sem_pressao: zebra ? 0.9 : fav ? -0.5 : 0.2, calma: fav ? 0.3 : 0.2, cobrar: -0.3, elogiar: 0.1 } as Record<Tom, number>)[tom];
  }
  if (momento === "intervalo") {
    if (perdendo) return ({ motivar: 0.7, confiar: fav ? 0.5 : 0.1, sem_pressao: zebra ? 0.4 : -0.3, calma: -0.3, cobrar: fav ? 0.9 : 0.3, elogiar: -0.7 } as Record<Tom, number>)[tom];
    if (ganhando) return ({ motivar: 0.4, confiar: 0.3, sem_pressao: 0.1, calma: 0.7, cobrar: -0.8, elogiar: 0.8 } as Record<Tom, number>)[tom];
    return ({ motivar: 0.6, confiar: fav ? 0.5 : 0.2, sem_pressao: zebra ? 0.5 : 0, calma: 0.1, cobrar: fav ? 0.4 : -0.2, elogiar: zebra ? 0.4 : -0.1 } as Record<Tom, number>)[tom];
  }
  // fim de jogo
  if (pl > 0) return ({ motivar: 0.3, confiar: 0.4, sem_pressao: 0.1, calma: 0.3, cobrar: -0.9, elogiar: 0.9 } as Record<Tom, number>)[tom];
  if (pl < 0) return ({ motivar: 0.5, confiar: fav ? 0.2 : 0.4, sem_pressao: zebra ? 0.6 : -0.2, calma: 0.4, cobrar: fav ? 0.6 : -0.3, elogiar: zebra ? 0.3 : -0.8 } as Record<Tom, number>)[tom];
  return ({ motivar: 0.4, confiar: 0.3, sem_pressao: zebra ? 0.5 : 0, calma: 0.3, cobrar: fav ? 0.3 : -0.4, elogiar: zebra ? 0.6 : 0 } as Record<Tom, number>)[tom];
}
const reacaoIndividual = (a: Atleta, tom: Tom, base: number, rng: RNG) =>
  clamp(base + (tom === "cobrar" ? (a.prof - 11) * 0.06 - (a.temp - 10) * 0.05 : 0) + (tom === "elogiar" || tom === "confiar" ? (a.moral < 50 ? 0.2 : 0) : 0) + rng.normal(0, 0.35), -1.2, 1.2);

/** Preleção: antes do jogo, no intervalo ou no apito final. Devolve o que o time sentiu. */
export function prelecao(pacote: PacoteDados, s: SaveTecnico, momento: "antes" | "intervalo" | "fim", tom: Tom): { texto: string; reacoes: string[] } {
  const av = s.aoVivo; if (!av) return { texto: "", reacoes: [] };
  (av.falas ??= {});
  if (av.falas[momento]) return { texto: "Você já falou com o time agora.", reacoes: [] };
  const sit = situacao(pacote, s, av), base = encaixe(tom, momento, sit.forca, sit.placar), rng = new RNG(`${s.semente}|prel|${av.rodada}|${momento}|${tom}`);
  const ids = momento === "fim" ? Object.keys(av.stats) : s.esc.titulares.filter((x): x is string => !!x);
  const jog = ids.map((id) => s.elenco.find((a) => a.id === id)).filter((a): a is Atleta => !!a);
  const reacoes = jog.map((a) => ({ a, r: reacaoIndividual(a, tom, base, rng) }));
  const media = reacoes.reduce((x, y) => x + y.r, 0) / Math.max(1, reacoes.length);
  for (const { a, r } of reacoes) a.moral = clamp(a.moral + r * (momento === "fim" ? 5 : 3), 0, 100);
  if (momento !== "fim") av.animo = clamp((av.animo ?? 0) + media * 0.07, -0.1, 0.12);
  av.falas[momento] = tom;
  const bons = reacoes.filter((x) => x.r >= 0.6).sort((p, q) => q.r - p.r).slice(0, 2), ruins = reacoes.filter((x) => x.r <= -0.4).sort((p, q) => p.r - q.r).slice(0, 2);
  const linhas = [...bons.map((x) => `${x.a.nome} ${rng.pick(["saiu motivado", "ficou ligado", "gostou do que ouviu", "bateu palma"])}.`), ...ruins.map((x) => `${x.a.nome} ${rng.pick(["não gostou", "ficou de cara fechada", "pareceu nervoso", "baixou a cabeça"])}.`)];
  const texto = media >= 0.55 ? "O vestiário comprou a ideia." : media >= 0.2 ? "O time reagiu bem." : media >= -0.15 ? "O time ouviu, sem grande reação." : "A fala caiu mal no vestiário.";
  return { texto, reacoes: linhas };
}
/** Grito da beira do campo (um a cada 10 minutos). */
export function gritar(s: SaveTecnico, g: Grito): { ok: boolean; texto: string } {
  const av = s.aoVivo; if (!av) return { ok: false, texto: "" };
  const m = av.minuto ?? 0;
  if (av.gritoMin !== undefined && m - av.gritoMin < 10) return { ok: false, texto: `O time ainda está absorvendo o último recado (dá para gritar de novo aos ${av.gritoMin + 10}').` };
  av.gritoMin = m;
  const pl = av.gMe - av.gAdv, n = (av.gritos ?? 0) + 1; av.gritos = n;
  const desgaste = n > 3 ? 0.5 : 1; // gritar o jogo todo perde efeito
  let ef = 0, txt = "";
  if (g === "incentivar") { ef = 0.03; txt = "O time ouviu o incentivo."; }
  if (g === "exigir") { ef = pl < 0 ? 0.05 : pl > 0 ? -0.03 : 0.02; txt = pl > 0 ? "Exigir ganhando irritou alguns jogadores." : "O time subiu a intensidade."; }
  if (g === "concentrar") { av.risco = { me: 0.94, adv: 0.85, ate: m + 15 }; txt = "O time fechou as linhas e se concentrou."; }
  if (g === "pra_cima") { av.risco = { me: 1.18, adv: 1.12, ate: m + 15 }; ef = 0.01; txt = "O time partiu para cima: o jogo vai ficar aberto."; }
  if (g === "segurar") { av.risco = { me: 0.75, adv: 0.72, ate: m + 20 }; txt = "O time recuou para segurar o resultado."; }
  av.animo = clamp((av.animo ?? 0) + ef * desgaste, -0.1, 0.12);
  return { ok: true, texto: n > 3 ? `${txt} (Já são muitos gritos: o efeito é menor.)` : txt };
}
/** O que o ânimo e o grito fazem nas chances de um trecho (e o ânimo vai voltando ao normal). */
export function efeitoBeira(av: AoVivo, ini: number): { me: number; adv: number } {
  const a = av.animo ?? 0, r = av.risco && ini < av.risco.ate ? av.risco : { me: 1, adv: 1 };
  av.animo = a * 0.93;
  return { me: (1 + a) * r.me, adv: (1 - a * 0.5) * r.adv };
}
export const xgTexto = (x: number) => x.toFixed(2).replace(".", ",");

/** Relatório do analista sobre o próximo adversário (mais detalhado com analista melhor). */
export function relatorioAdversario(pacote: PacoteDados, s: SaveTecnico, adv: string, nivelAnalista: number): { forca: number; destaques: string[]; dica: string; posTabela?: number; forma?: string } {
  const w = mundo(pacote), c = w.clube[adv];
  if (!c) return { forca: 65, destaques: [], dica: "" };
  const onze = onzeProvavel(c.elenco), top = [...onze].sort((a, b) => b.ovr - a.ovr).slice(0, nivelAnalista >= 3 ? 3 : 2);
  const f = forcaDoTime(s.elenco, s.esc, s.tatica, s.entrosamento[s.tatica.formacao] ?? 40);
  const linhas = (p: string[]) => { const l = onze.filter((j) => p.includes(j.posicao)); return l.length ? l.reduce((x, j) => x + j.ovr, 0) / l.length : c.forca; };
  const ata = linhas(["ATA", "PON"]), mei = linhas(["MEI", "VOL"]), def = linhas(["ZAG", "LAT", "GOL"]);
  const dif = { ataque: f.ataque - def, meio: f.meio - mei, defesa: f.defesa - ata };
  let dica = "";
  if (f.geral - c.forca >= 5) dica = "Somos favoritos: pressione e jogue no campo deles.";
  else if (f.geral - c.forca <= -5) dica = "Eles são mais fortes: feche o meio e aposte no contra-ataque.";
  else if (dif.meio < -3) dica = "O meio deles é melhor que o nosso: congestione o meio (mais um volante) e jogue pelos lados.";
  else if (dif.defesa < -3) dica = "O ataque deles é perigoso: linha mais baixa e pouca exposição.";
  else if (dif.ataque > 3) dica = "A defesa deles é frágil: ataque com velocidade nas costas.";
  else dica = "Jogo parelho: o detalhe (bola parada, banco) deve decidir.";
  const t = s.tabela.find((x) => x.clube === adv), ord = [...s.tabela].sort((a, b) => b.pts - a.pts || (b.gp - b.gc) - (a.gp - a.gc));
  return {
    forca: Math.round(c.forca),
    destaques: top.map((j) => `${j.nome} (${j.posicao}, ${nivelAnalista >= 2 ? j.ovr : j.ovr >= 80 ? "craque" : j.ovr >= 72 ? "muito bom" : "bom"})`),
    dica: nivelAnalista >= 1.5 ? dica : "Contrate um analista melhor para ter a leitura do jogo.",
    posTabela: t ? ord.indexOf(t) + 1 : undefined,
    forma: t ? `${t.v}V ${t.e}E ${t.d}D` : undefined,
  };
}
void ovrDe;
