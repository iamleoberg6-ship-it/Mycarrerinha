// Shows no estádio próprio: uma arena moderna recebe propostas de shows (muito dinheiro), mas na semana do show o
// estádio fica ocupado. Se houver jogo em casa nessa semana, o time aluga outro estádio: menos público, menos bilheteria,
// aluguel a pagar e menos força de mandante. O gramado também sofre com o palco (o natural mais, o híbrido menos,
// o sintético nada). As propostas valem por duas semanas; dá para aceitar ou recusar.
import { clamp, RNG } from "../rng.js";
import { infoLiga } from "../ligas.js";
import type { EstadioProprio } from "./estadio-proprio.js";

export interface PropostaShow { id: string; artista: string; semana: number; valor: number; ate: number }
export interface ShowMarcado { artista: string; semana: number; valor: number }
type SaveShow = {
  semente: string; ligaId: string; temporada: number; semana: number;
  clube: { saldo: number; gramado?: number; torcida: number };
  estadioProprio?: EstadioProprio; showsOferta?: PropostaShow[]; shows?: ShowMarcado[]; gramadoDano?: { ate: number; perda: number };
};
const ARTISTAS = ["Bruninho Mars", "Coldpleia", "Taylor Suíte", "Os Rolings Estones", "Anitinha", "Gusttavo Lima e Silva", "Henrique e Julinho", "Ed Shiran", "Bionça", "Metalika", "Ivetinha Sangalo", "Jorge e Mateuzinho", "Iron Meiden", "Adéle", "The Uíkend", "Roberto Carlinhos", "Shakirita", "Dua Lipinha", "Bad Bonito", "Pablo Vitar"];
const abs = (s: SaveShow) => s.temporada * 60 + s.semana;
/** O estádio pode receber shows? (só arena moderna; o estádio "moderno" recebe de vez em quando) */
export const recebeShows = (s: SaveShow) => !!s.estadioProprio && s.estadioProprio.padrao !== "simples";
/** Há show no estádio nesta semana? (então o jogo em casa vai para um estádio alugado) */
export const estadioOcupado = (s: SaveShow) => (s.shows ?? []).some((x) => x.semana === abs(s));
/** Uma semana: talvez chegue proposta; propostas vencem; o show da semana paga e estraga o gramado; o gramado se recupera. */
export function semanaShows(s: SaveShow): { recebido: number; avisos: string[] } {
  const out = { recebido: 0, avisos: [] as string[] }, a = abs(s);
  // gramado se recuperando do palco
  if (s.gramadoDano && a >= s.gramadoDano.ate) { s.clube.gramado = clamp((s.clube.gramado ?? 3) + s.gramadoDano.perda, 1, 5); delete s.gramadoDano; out.avisos.push("🌱 O gramado se recuperou do show."); }
  // propostas vencidas
  if (s.showsOferta?.length) { const vencidas = s.showsOferta.filter((p) => p.ate < a); for (const p of vencidas) out.avisos.push(`A proposta do show de ${p.artista} venceu sem resposta.`); s.showsOferta = s.showsOferta.filter((p) => p.ate >= a); }
  // o show desta semana
  const hoje = (s.shows ?? []).find((x) => x.semana === a);
  if (hoje && s.estadioProprio) {
    s.clube.saldo += hoje.valor; out.recebido = hoje.valor;
    const e = s.estadioProprio, perda = e.gramado === "natural" ? 1 : e.gramado === "hibrido" ? 1 : 0, semanas = e.gramado === "natural" ? 4 : 2;
    if (perda && !s.gramadoDano) { s.clube.gramado = clamp((s.clube.gramado ?? 3) - perda, 1, 5); s.gramadoDano = { ate: a + semanas, perda }; }
    out.avisos.push(`🎤 Show de ${hoje.artista} no ${e.nome}: estádio lotado e ${(hoje.valor / 1e6).toFixed(1).replace(".", ",")} mi no caixa.${perda ? ` O gramado sofreu com o palco e leva ${semanas} semanas para voltar.` : ""}`);
  }
  s.shows = (s.shows ?? []).filter((x) => x.semana >= a);
  // nova proposta
  if (recebeShows(s) && (s.showsOferta ?? []).length < 2) {
    const e = s.estadioProprio!, rng = new RNG(`${s.semente}|show|${a}`);
    if (rng.chance(e.padrao === "arena" ? 0.12 : 0.05)) {
      const fL = clamp(infoLiga(s.ligaId).fLiga ?? 1, 0.35, 1.6), quando = a + rng.int(2, 6);
      if (!(s.shows ?? []).some((x) => x.semana === quando)) {
        const valor = Math.round((e.lugares * (e.padrao === "arena" ? 55 : 35) * fL * (0.7 + rng.next() * 0.9)) / 1e4) * 1e4;
        const artista = rng.pick(ARTISTAS);
        (s.showsOferta ??= []).push({ id: `sh${a}`, artista, semana: quando, valor, ate: a + 2 });
        out.avisos.push(`🎤 Proposta de show: ${artista} quer o ${e.nome} daqui a ${quando - a} semanas e paga ${(valor / 1e6).toFixed(1).replace(".", ",")} mi.`);
      }
    }
  }
  return out;
}
/** Responder a uma proposta de show. */
export function responderShow(s: SaveShow, id: string, aceitar: boolean): { ok: boolean; msg: string } {
  const p = (s.showsOferta ?? []).find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Essa proposta não existe mais." };
  s.showsOferta = (s.showsOferta ?? []).filter((x) => x.id !== id);
  if (!aceitar) return { ok: true, msg: `Você recusou o show de ${p.artista}.` };
  (s.shows ??= []).push({ artista: p.artista, semana: p.semana, valor: p.valor });
  return { ok: true, msg: `Show de ${p.artista} confirmado. Se tiver jogo em casa naquela semana, o time joga num estádio alugado.` };
}
