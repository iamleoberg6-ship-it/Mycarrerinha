// Ligações entre jogadores do mundo que dividiram clube na mesma temporada: amizade ou rivalidade, sorteada
// de forma fixa pelo par de nomes. Vem do histórico (e.hist), então aparece igual em qualquer carreira com a mesma semente.
import type { PacoteDados } from "./liga.js";
import { historicoDe, infoClube } from "./mundo.js";
import { RNG } from "./rng.js";
import { nomeCurto } from "./narracao.js";

/** a e b: nomes curtos (narração); x e y: nomes completos (notícias); clube: apelido do clube em comum. */
export interface Ligacao { a: string; b: string; x: string; y: string; clube: string; tipo: "amizade" | "rivalidade" }

/** Pares do elenco (nomes curtos, como a narração usa) que jogaram juntos antes, no mesmo clube e temporada. */
export function ligacoesDoElenco(pacote: PacoteDados, elenco: { nome: string }[], limite = 6): Ligacao[] {
  const marcas = elenco.map((j) => {
    const m = new Map<string, string>();
    for (const x of historicoDe(pacote, j.nome).linhas) if (!x.base) m.set(`${x.t}|${x.clubeId}`, x.clubeId);
    return { nome: j.nome, m };
  });
  const out: Ligacao[] = [];
  for (let i = 0; i < marcas.length && out.length < limite; i++)
    for (let k = i + 1; k < marcas.length && out.length < limite; k++) {
      const A = marcas[i], B = marcas[k];
      const chave = [...A.m.keys()].find((c) => B.m.has(c));
      if (!chave) continue;
      const clubeId = A.m.get(chave)!;
      const a = nomeCurto(A.nome), b = nomeCurto(B.nome);
      if (a === b) continue;
      const tipo = new RNG(`ligacao|${[A.nome, B.nome].sort().join("|")}`).chance(0.6) ? "amizade" : "rivalidade";
      out.push({ a, b, x: A.nome, y: B.nome, clube: infoClube(pacote, clubeId)?.apelido ?? "clube antigo", tipo });
    }
  return out;
}
