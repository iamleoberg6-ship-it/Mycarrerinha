// Quem joga cada torneio de seleções (o mesmo nos dois modos): Copa do Mundo e os continentais.
import type { PacoteDados } from "./liga.js";
import { todasSelecoes } from "./mundo.js";
import { confederacao, type TorneioId } from "./copas.js";

export function participantesTorneio(pacote: PacoteDados, id: TorneioId, t: number): string[] {
  const sel = todasSelecoes(pacote), por = (cf: string) => sel.filter((x) => confederacao(x.pais) === cf).sort((a, b) => b.forca - a.forca);
  const sedes: Record<string, string[]> = { "EUR-2": ["ENG", "SCO"], "EUR-6": ["ITA", "TUR"], "AME-2": ["USA"], "AFR-2": ["MAR"], "ASI-2": ["KSA"] };
  let lista = id === "AME" ? [...por("CONMEBOL").slice(0, 10), ...por("CONCACAF").slice(0, 6)] : por(id === "EUR" ? "UEFA" : id === "AFR" ? "CAF" : "AFC");
  const n = id === "EUR" || id === "AME" ? 16 : 8, fixas = sedes[`${id}-${t}`] ?? [];
  lista = [...lista.filter((x) => fixas.includes(x.pais)), ...lista.filter((x) => !fixas.includes(x.pais))].slice(0, n);
  const forca = (x: { forca: number }) => x.forca;
  return lista.sort((a, b) => forca(b) - forca(a)).map((x) => x.id).slice(0, Math.floor(lista.length / 4) * 4);
}
/** As 32 da Copa do Mundo: por continente, as mais fortes (Europa 13, América do Sul 5, África 5, Ásia 5, Concacaf 3, Oceania 1), com as sedes garantidas. */
export function participantesCopa(pacote: PacoteDados, t: number): string[] {
  const sel = todasSelecoes(pacote), sedes = t === 4 ? ["ESP", "POR", "MAR"] : t === 8 ? ["KSA"] : t === 12 ? ["USA", "CAN"] : [];
  const cotas: Record<string, number> = { UEFA: 13, CONMEBOL: 5, CAF: 5, AFC: 5, CONCACAF: 3, OFC: 1 };
  const lista = sel.filter((x) => sedes.includes(x.pais)).map((x) => x.id);
  for (const [cf, n] of Object.entries(cotas)) {
    const ja = lista.filter((id) => confederacao(id.slice(4)) === cf).length;
    lista.push(...sel.filter((x) => confederacao(x.pais) === cf && !lista.includes(x.id)).sort((a, b) => b.forca - a.forca).slice(0, Math.max(0, n - ja)).map((x) => x.id));
  }
  const forca = (id: string) => sel.find((x) => x.id === id)?.forca ?? 60;
  return lista.slice(0, 32).sort((a, b) => forca(b) - forca(a));
}
