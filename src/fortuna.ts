// Fortuna dos clubes: o tamanho de um clube não é para sempre. Um investidor compra um clube médio e ele vira força
// nova; uma crise financeira obriga a vender os melhores; títulos trazem dinheiro (e reforços), rebaixamento tira.
// Os gigantes tradicionais (Real Madri, Barça, os grandes do Brasil...) também têm fases ruins, mas nunca desabam:
// a queda deles tem piso e a recuperação é mais rápida.
// O "ajuste" de cada clube (em pontos de força) muda o nível dos reforços que ele busca na virada (src/evolucao.ts).
import { RNG, clamp } from "./rng.js";

export interface Fortuna {
  /** ajuste atual vindo de investidor/crise (anda metade do caminho até o alvo por ano) */ aj: number;
  alvo: number;
  /** embalo de resultados: título soma, rebaixamento tira; some aos poucos */ emb: number;
  tipo?: "investidor" | "crise"; desde?: number; ate?: number;
}
export type TipoEventoClube = "investidor" | "crise" | "investidorSaiu" | "recuperou";
export interface EventoClube { t: number; clubeId: string; tipo: TipoEventoClube; /** investidor muito rico / crise muito feia */ forte?: boolean }

/** Quantos clubes de cada país contam como gigantes tradicionais (os de maior força na primeira divisão de 2026). */
const GIGANTES: Record<string, number> = { BRA: 8, ENG: 6, ESP: 3, ITA: 4, GER: 3, FRA: 2, POR: 3, ARG: 2 };
export function tradicionaisDe(ligas: { pais: string; divisao?: number; clubes: { id: string; forca: number }[] }[]): Set<string> {
  const out = new Set<string>();
  for (const l of ligas) if (l.divisao === 1) for (const c of [...l.clubes].sort((a, b) => b.forca - a.forca).slice(0, GIGANTES[l.pais] ?? 2)) out.add(c.id);
  return out;
}
/** Ajuste total do clube (pontos de força): fortuna + embalo, com o piso dos gigantes. */
export function ajusteDe(f: Fortuna | undefined, tradicional: boolean): number {
  if (!f) return 0;
  return clamp(f.aj + f.emb, tradicional ? -4 : -9, 10);
}
/** Uma virada: fim dos ciclos, investidores e crises novos, e o embalo dos títulos e do rebaixamento. Muta `fort`. */
export function atualizarFortunas(clubes: { id: string; divisao: number }[], fort: Record<string, Fortuna>, trad: Set<string>, semente: string, t: number,
  res: { campeoes: Set<string>; caiu: Set<string>; subiu: Set<string> }): EventoClube[] {
  const ev: EventoClube[] = [];
  for (const c of clubes) {
    if (c.divisao > 2) continue;
    const r = new RNG(`${semente}|fortuna|${t}|${c.id}`), f = (fort[c.id] ??= { aj: 0, alvo: 0, emb: 0 }), g = trad.has(c.id);
    // o ciclo acabou: investidor vai embora (às vezes deixando dívida), crise passa
    if (f.tipo && f.ate !== undefined && t >= f.ate) {
      if (f.tipo === "investidor" && r.chance(0.4)) { f.tipo = "crise"; f.alvo = -r.int(3, 6); f.desde = t; f.ate = t + r.int(2, 4); ev.push({ t, clubeId: c.id, tipo: "investidorSaiu" }); }
      else { if (f.tipo === "crise") ev.push({ t, clubeId: c.id, tipo: "recuperou" }); f.tipo = undefined; f.alvo = 0; f.desde = f.ate = undefined; }
    }
    // começo de ciclo
    if (!f.tipo) {
      const pInv = g ? 0.003 : c.divisao === 1 ? 0.009 : 0.012, pCri = g ? 0.006 : 0.01;
      if (r.chance(pInv)) {
        const forte = !g && r.chance(0.25);
        f.tipo = "investidor"; f.alvo = g ? r.int(2, 3) : forte ? r.int(7, 10) : r.int(3, 6); f.desde = t; f.ate = t + r.int(5, 12);
        ev.push({ t, clubeId: c.id, tipo: "investidor", ...(forte ? { forte } : {}) });
      } else if (r.chance(pCri)) {
        const forte = !g && r.chance(0.3);
        f.tipo = "crise"; f.alvo = -(g ? r.int(2, 4) : forte ? r.int(6, 8) : r.int(3, 5)); f.desde = t; f.ate = t + (g ? r.int(1, 3) : r.int(2, 5));
        ev.push({ t, clubeId: c.id, tipo: "crise", ...(forte ? { forte } : {}) });
      }
    }
    // o ajuste anda metade do caminho por ano (o dinheiro novo leva tempo para virar time; a crise também)
    f.aj = Math.round((f.aj + (f.alvo - f.aj) * 0.5) * 10) / 10;
    // embalo: título enche o caixa, rebaixamento esvazia; o gigante se recompõe mais rápido. O embalo do título é pequeno
    // e tem teto: senão o campeão fica cada vez mais forte e vira dinastia eterna
    f.emb = clamp(f.emb * (g && f.emb < 0 ? 0.5 : 0.6) + (res.campeoes.has(c.id) ? 0.5 : 0) + (res.subiu.has(c.id) ? 0.6 : 0) - (res.caiu.has(c.id) ? 1.5 : 0), -3, 1.2);
    f.emb = Math.round(f.emb * 10) / 10;
    if (!f.tipo && Math.abs(f.aj) < 0.2 && Math.abs(f.emb) < 0.2) delete fort[c.id];
  }
  return ev;
}

/** A notícia de um evento de fortuna (com o nome do clube). */
export function textoEventoClube(ev: EventoClube, nome: string): string {
  switch (ev.tipo) {
    case "investidor": return ev.forte ? `💰 ${nome} foi comprado por um investidor bilionário: dinheiro novo de sobra e promessa de time para brigar por tudo.` : `💼 ${nome} ganhou um investidor: o clube vai ao mercado mais forte nas próximas temporadas.`;
    case "crise": return ev.forte ? `📉 ${nome} afundou numa crise financeira grave: salários atrasados e os melhores à venda.` : `📉 ${nome} entrou em crise financeira e vai precisar vender jogadores.`;
    case "investidorSaiu": return `🚪 O investidor deixou o ${nome}, e com ele foi o dinheiro: o clube entra em crise.`;
    case "recuperou": return `📈 ${nome} saiu da crise e voltou a respirar.`;
  }
}
