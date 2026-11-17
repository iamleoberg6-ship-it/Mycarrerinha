// Vestiário (inspirado no Football Manager): hierarquia (líderes, influentes, novatos), grupos (pela língua e os jovens),
// clima geral, promessas cobradas no prazo, papel prometido na contratação, mentoria (veterano ensina garoto), treino
// individual (foco próprio e posição nova) e bônus de contrato por jogo e por gol.
// O clima mexe um pouco no rendimento em campo; líder insatisfeito puxa o grupo dele para baixo, líder feliz puxa para cima.
import { RNG, clamp } from "../rng.js";
import { linguaDe, NOME_LINGUA } from "../idiomas.js";
import { exDe, ovrDe, disponivel, type Atleta, type PosT, type PromessaT, type TipoPromessa } from "./modelo.js";
import type { SaveTecnico } from "./motor.js";

export type Nivel = "lider" | "influente" | "membro" | "novato";
export const NOME_NIVEL: Record<Nivel, string> = { lider: "Líder", influente: "Influente", membro: "Membro", novato: "Novato" };
const pontos = (s: SaveTecnico, a: Atleta, media: number) =>
  (exDe(a).LID - 50) * 0.6 + Math.min(a.idade, 34) * 1.1 + Math.min(6, s.temporada - (a.desde ?? s.temporada)) * 4 + (ovrDe(a) - media) * 0.7 + (s.esc.capitao === a.id ? 12 : 0) + (a.base ? 3 : 0);
/** Hierarquia do elenco (mesma para a semana toda). */
export function hierarquia(s: SaveTecnico): Map<string, { nivel: Nivel; pts: number }> {
  const media = s.elenco.reduce((x, a) => x + ovrDe(a), 0) / Math.max(1, s.elenco.length);
  const l = s.elenco.map((a) => ({ a, p: pontos(s, a, media) })).sort((x, y) => y.p - x.p), m = new Map<string, { nivel: Nivel; pts: number }>();
  const nl = Math.max(2, Math.round(s.elenco.length / 10)), ni = Math.max(4, Math.round(s.elenco.length / 5));
  l.forEach(({ a, p }, i) => m.set(a.id, { pts: p, nivel: i < nl ? "lider" : i < nl + ni ? "influente" : a.desde === s.temporada && a.idade <= 25 ? "novato" : "membro" }));
  return m;
}
export interface GrupoV { id: string; nome: string; membros: Atleta[]; lider?: Atleta; moral: number }
/** Grupos do vestiário: quem fala a mesma língua anda junto; os garotos formam o deles. */
export function gruposDe(s: SaveTecnico): GrupoV[] {
  const h = hierarquia(s), por = new Map<string, Atleta[]>();
  for (const a of s.elenco) { const k = a.idade <= 21 ? "jovens" : `l:${linguaDe(a.nac)}`; (por.get(k) ?? por.set(k, []).get(k)!).push(a); }
  const out: GrupoV[] = [];
  for (const [k, l] of por) {
    if (l.length < 2) continue;
    const lider = [...l].sort((x, y) => (h.get(y.id)?.pts ?? 0) - (h.get(x.id)?.pts ?? 0))[0];
    out.push({ id: k, nome: k === "jovens" ? "Os garotos" : `Quem fala ${(NOME_LINGUA[k.slice(2)] ?? k.slice(2)).toLowerCase()}`, membros: l, lider, moral: Math.round(l.reduce((x, a) => x + a.moral, 0) / l.length) });
  }
  return out.sort((a, b) => b.membros.length - a.membros.length);
}
/** Clima do vestiário (0 a 100): a moral de cada um, com peso maior para quem manda no grupo. */
export function clima(s: SaveTecnico): number {
  if (!s.elenco.length) return 60;
  const h = hierarquia(s), peso = (n: Nivel) => (n === "lider" ? 3 : n === "influente" ? 2 : n === "novato" ? 0.6 : 1);
  let t = 0, w = 0;
  for (const a of s.elenco) { const p = peso(h.get(a.id)?.nivel ?? "membro"); t += a.moral * p; w += p; }
  const quebradas = (s.promessasQuebradas ?? 0) * 3;
  return Math.round(clamp(t / w - quebradas, 0, 100));
}
export const nomeClima = (c: number) => (c >= 80 ? "Excelente" : c >= 66 ? "Bom" : c >= 52 ? "Estável" : c >= 40 ? "Instável" : "Rachado");
/** Efeito do clima na chance de gol (±5%). */
export const fatorClima = (c: number) => 1 + clamp((c - 60) / 800, -0.05, 0.03);

// ------------------------------------------------------------------ promessas
export const NOME_PROMESSA: Record<TipoPromessa, string> = { titular: "Ser titular", minutos: "Mais minutos", reforco: "Contratar reforço", naoVender: "Não vender", renovar: "Renovar o contrato" };
export function prometer(s: SaveTecnico, id: string, tipo: TipoPromessa, ab: number, fimJanela: number, fimTemporada: number): { ok: boolean; msg: string } {
  const a = s.elenco.find((x) => x.id === id);
  if (!a) return { ok: false, msg: "Jogador não encontrado." };
  if ((a.promessas ?? []).some((p) => p.tipo === tipo)) return { ok: false, msg: `Você já prometeu isso a ${a.nome}.` };
  if ((a.promessas ?? []).length >= 2) return { ok: false, msg: `${a.nome} já tem duas promessas suas em aberto.` };
  let p: PromessaT;
  if (tipo === "titular") p = { tipo, ate: ab + 4, alvo: 3, feitos: 0 };
  else if (tipo === "minutos") p = { tipo, ate: ab + 6, alvo: 3, feitos: 0 };
  else if (tipo === "reforco") p = { tipo, ate: fimJanela, pos: a.pos, alvo: s.elenco.filter((x) => x.pos === a.pos).length };
  else if (tipo === "renovar") { if (a.contratoAte > s.temporada + 1) return { ok: false, msg: `O contrato de ${a.nome} ainda tem tempo.` }; p = { tipo, ate: fimTemporada }; }
  else p = { tipo, ate: fimTemporada };
  (a.promessas ??= []).push(p);
  a.moral = clamp(a.moral + 9, 0, 100); a.relacao = clamp(a.relacao + 4, 0, 100);
  const txt: Record<TipoPromessa, string> = {
    titular: "Ele espera ser titular em pelo menos 3 dos próximos 4 jogos.", minutos: "Ele espera entrar em campo em pelo menos 3 dos próximos 6 jogos.",
    reforco: `Ele espera um reforço para a posição dele até o fim da janela.`, naoVender: "Ele quer ficar até o fim da temporada.", renovar: "Ele espera a renovação até o fim da temporada.",
  };
  return { ok: true, msg: `Promessa feita a ${a.nome}. ${txt[tipo]}` };
}
/** Toda semana: cobra as promessas, o papel prometido na contratação, o grupo puxa a moral, mentoria e treino individual. */
export function semanaVestiario(s: SaveTecnico, ab: number, rodada: number, titulares: Set<string>, jogaram: Set<string>, teveJogo: boolean, aux: number, noticia: (t: string) => void) {
  const rng = new RNG(`${s.semente}|vest|${ab}`), h = hierarquia(s);
  const quebrar = (a: Atleta, txt: string) => {
    a.moral = clamp(a.moral - 15, 0, 100); a.relacao = clamp(a.relacao - 20, 0, 100);
    s.promessasQuebradas = (s.promessasQuebradas ?? 0) + 1;
    const n = h.get(a.id)?.nivel;
    if (n === "lider" || n === "influente") { const g = gruposDe(s).find((x) => x.membros.includes(a)); for (const o of g?.membros ?? []) if (o !== a) o.moral = clamp(o.moral - (n === "lider" ? 6 : 3), 0, 100); }
    noticia(`${a.nome}: ${txt}${n === "lider" ? " Como é um dos líderes, o grupo dele sentiu." : ""}`);
  };
  for (const a of s.elenco) {
    if (titulares.has(a.id)) a.titT = (a.titT ?? 0) + 1;
    const ps = a.promessas ?? [];
    for (const p of [...ps]) {
      let cumpriu = false, falhou = false;
      if (p.tipo === "titular" || p.tipo === "minutos") {
        if (teveJogo && disponivel(a)) { if ((p.tipo === "titular" ? titulares : jogaram).has(a.id)) p.feitos = (p.feitos ?? 0) + 1; }
        if ((p.feitos ?? 0) >= (p.alvo ?? 3)) cumpriu = true; else if (ab >= p.ate) falhou = true;
      } else if (p.tipo === "reforco") {
        if (s.elenco.filter((x) => x.pos === p.pos && x.desde === s.temporada && x.id !== a.id).length > 0 && s.elenco.filter((x) => x.pos === p.pos).length > (p.alvo ?? 0)) cumpriu = true; else if (ab >= p.ate) falhou = true;
      } else if (p.tipo === "renovar") {
        if (a.contratoAte > s.temporada) cumpriu = true; else if (ab >= p.ate) falhou = true;
      } else if (p.tipo === "naoVender" && ab >= p.ate) cumpriu = true;
      if (cumpriu) { a.promessas = (a.promessas ?? []).filter((x) => x !== p); a.relacao = clamp(a.relacao + 6, 0, 100); a.moral = clamp(a.moral + 4, 0, 100); if (p.tipo !== "naoVender") noticia(`${a.nome} reconhece que você cumpriu a promessa (${NOME_PROMESSA[p.tipo].toLowerCase()}).`); }
      if (falhou) { a.promessas = (a.promessas ?? []).filter((x) => x !== p); quebrar(a, `diz que você não cumpriu a promessa (${NOME_PROMESSA[p.tipo].toLowerCase()}).`); }
    }
    // papel prometido na contratação: cobrado a cada 6 rodadas
    if (a.papel && rodada > 0 && rodada % 6 === 0 && teveJogo && a.desde === s.temporada) {
      const taxa = (a.titT ?? 0) / rodada, precisa = a.papel === "estrela" ? 0.7 : a.papel === "titular" ? 0.5 : a.papel === "rotacao" ? 0.25 : 0;
      if (precisa && taxa < precisa && a.lesao === 0) { a.moral = clamp(a.moral - 7, 0, 100); a.relacao = clamp(a.relacao - 6, 0, 100); noticia(`${a.nome} reclama: veio para ser ${a.papel === "estrela" ? "a estrela do time" : a.papel === "titular" ? "titular" : "parte da rotação"} e foi titular em ${a.titT ?? 0} de ${rodada} jogos.`); }
    }
    // quem não joga e é bom pede conversa (uma vez a cada 6 semanas)
    if (a.semJogar >= 4 && a.moral < 55 && !(a.promessas ?? []).length && (a.pedeConversa ?? -99) < ab - 6 && rng.chance(0.4)) { a.pedeConversa = ab; noticia(`${a.nome} pediu uma conversa: quer saber por que não está jogando. Abra a ficha dele para responder.`); }
    // mentoria: o garoto pega o jeito do mentor
    const m = a.mentor ? s.elenco.find((x) => x.id === a.mentor) : undefined;
    if (a.mentor && !m) a.mentor = undefined;
    if (m) {
      if (m.prof > a.prof && rng.chance(0.05 + aux * 0.006)) { a.prof++; if (a.prof === m.prof) noticia(`${a.nome} já é tão profissional quanto o mentor, ${m.nome}.`); }
      if (Math.abs(m.temp - a.temp) > 1 && rng.chance(0.04)) a.temp += m.temp > a.temp ? 1 : -1;
      a.moral = clamp(a.moral + 0.6, 0, 100);
    }
    // treino individual: posição nova
    const np = a.treinoInd?.pos;
    if (np && np !== a.pos) {
      const fam = (a.posExtra ??= {})[np] ?? 0, perto = ["ZAG|VOL", "VOL|ZAG", "LAT|ZAG", "ZAG|LAT", "LAT|PON", "PON|LAT", "VOL|MEI", "MEI|VOL", "MEI|PON", "PON|MEI", "MEI|ATA", "ATA|MEI", "PON|ATA", "ATA|PON"].includes(`${a.pos}|${np}`);
      const ganho = (2 + a.prof * 0.12 + aux * 0.25) * (perto ? 1.5 : 1) * (a.idade <= 24 ? 1.2 : a.idade >= 31 ? 0.75 : 1);
      a.posExtra[np] = clamp(fam + ganho, 0, 100);
      if (fam < 100 && a.posExtra[np]! >= 100) { noticia(`${a.nome} já joga de ${np} como se fosse a posição dele.`); a.treinoInd = { ...a.treinoInd, pos: undefined }; }
      else if (fam < 50 && a.posExtra[np]! >= 50) noticia(`${a.nome} está pegando o jeito de ${np} nos treinos.`);
    }
  }
  // o grupo puxa a moral: o líder do grupo leva os outros junto (para cima ou para baixo)
  for (const g of gruposDe(s)) {
    const l = g.lider; if (!l || g.membros.length < 3) continue;
    const nv = h.get(l.id)?.nivel; if (nv !== "lider" && nv !== "influente") continue;
    const puxa = (l.moral - 60) / 60 * (nv === "lider" ? 1.4 : 0.8);
    for (const o of g.membros) if (o !== l) o.moral = clamp(o.moral + puxa, 0, 100);
    if (l.moral < 32 && rng.chance(0.25)) noticia(`${l.nome}, um dos que mandam no grupo "${g.nome.toLowerCase()}", está insatisfeito e o clima no grupo piorou.`);
  }
  s.promessasQuebradas = Math.max(0, (s.promessasQuebradas ?? 0) - 0.15);
}
/** Mentor: veterano (26+) com até 3 garotos (até 23 anos). */
export function definirMentor(s: SaveTecnico, garotoId: string, mentorId?: string): { ok: boolean; msg: string } {
  const g = s.elenco.find((x) => x.id === garotoId);
  if (!g) return { ok: false, msg: "Jogador não encontrado." };
  if (!mentorId) { g.mentor = undefined; return { ok: true, msg: `${g.nome} está sem mentor.` }; }
  const m = s.elenco.find((x) => x.id === mentorId);
  if (!m) return { ok: false, msg: "Mentor não encontrado." };
  if (g.idade > 23) return { ok: false, msg: "Mentoria é para jogadores de até 23 anos." };
  if (m.idade < 26) return { ok: false, msg: `${m.nome} ainda é novo demais para ser mentor.` };
  if (s.elenco.filter((x) => x.mentor === m.id).length >= 3) return { ok: false, msg: `${m.nome} já cuida de três garotos.` };
  g.mentor = m.id; g.moral = clamp(g.moral + 3, 0, 100);
  return { ok: true, msg: `${m.nome} vai ser o mentor de ${g.nome}: profissionalismo e temperamento passam para o garoto com o tempo.` };
}
export const mentoresPossiveis = (s: SaveTecnico) => s.elenco.filter((x) => x.idade >= 26).sort((a, b) => b.prof - a.prof || exDe(b).LID - exDe(a).LID);
/** Bônus de contrato pagos depois de um jogo. */
export function bonusDoJogo(s: SaveTecnico, notas: { id: string; min: number; gols: number }[]): number {
  let t = 0;
  for (const n of notas) { const a = s.elenco.find((x) => x.id === n.id); if (!a || n.min <= 0) continue; t += (a.bonusJogo ?? 0) + (a.bonusGol ?? 0) * n.gols; }
  return t;
}
export type { PosT };
