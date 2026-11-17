// Peças comuns do robô: a foto do mundo (força das ligas) e a varredura de números quebrados no save.
import type { Mundo } from "../../src/mundo.js";

/** Força média, mínima e máxima dos clubes de cada liga principal, e a idade média dos elencos. */
export function fotoMundo(w: Mundo, ligas = ["BRA1", "ENG1", "ESP1", "ITA1", "GER1", "FRA1", "POR1", "ARG1"]) {
  const out: Record<string, { media: number; min: number; max: number; idade: number }> = {};
  for (const id of ligas) {
    const l = w.liga[id]; if (!l) continue;
    const f = l.clubes.map((c) => c.forca), idades = l.clubes.flatMap((c) => c.elenco.map((j) => (j as { idade?: number }).idade ?? 0)).filter(Boolean);
    out[id] = { media: +(f.reduce((a, b) => a + b, 0) / f.length).toFixed(1), min: Math.min(...f), max: Math.max(...f), idade: idades.length ? +(idades.reduce((a, b) => a + b, 0) / idades.length).toFixed(1) : 0 };
  }
  return out;
}

/** Caminhos do save com NaN, Infinity ou números absurdos (mais de 1e13). */
export function varrerNumeros(o: unknown, caminho = "", out: string[] = [], vistos = new WeakSet<object>()): string[] {
  if (out.length > 10) return out;
  if (typeof o === "number") { if (!Number.isFinite(o) || Math.abs(o) > 1e13) out.push(`${caminho} = ${o}`); return out; }
  if (!o || typeof o !== "object" || vistos.has(o as object)) return out;
  vistos.add(o as object);
  for (const [k, v] of Object.entries(o as Record<string, unknown>)) varrerNumeros(v, caminho ? `${caminho}.${/^\d+$/.test(k) ? "[]" : k}` : k, out, vistos);
  return out;
}
