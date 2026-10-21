// Simula N carreiras e mostra as distribuições usadas para calibrar as fórmulas.
import { writeFileSync } from "node:fs";
import { RNG } from "../src/rng.js";
import { carregarPacote, criarMundo } from "../src/liga.js";
import { Carreira } from "../src/carreira.js";
import type { Posicao } from "../src/atributos.js";

const N = Number(process.argv[2] ?? 1000);
const pacote = carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
const mundo = criarMundo(new RNG("mundo"), pacote);

const q = (xs: number[], p: number) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const r1 = (x: number) => Math.round(x * 10) / 10;

const cs: Carreira[] = [];
const t0 = Date.now();
for (let i = 0; i < N; i++) cs.push(new Carreira(`carreira-${i}`, mundo).simularCarreira());
const seg = (Date.now() - t0) / 1000;

const faixas: [string, number, number][] = [["POT 60–67", 60, 67], ["POT 68–75", 68, 75], ["POT 76–83", 76, 83], ["POT 84+", 84, 99]];
const porPot = faixas.map(([nome, a, b]) => {
  const g = cs.filter((c) => c.pot >= a && c.pot <= b);
  return {
    faixa: nome, carreiras: g.length,
    ovrPico: r1(media(g.map((c) => c.totais.ovrMax))), gapPot: r1(media(g.map((c) => c.pot - c.totais.ovrMax))),
    idadePico: r1(media(g.map((c) => c.totais.idadeOvrMax))),
    europaTop: Math.round((100 * g.filter((c) => c.totais.nivelMax === 1).length) / Math.max(1, g.length)) + "%",
    salarioMaxMediano: Math.round(q(g.map((c) => c.totais.salarioMax), 0.5)),
    patrimonioFinalMediano: Math.round(q(g.map((c) => c.patrimonio), 0.5)),
  };
});

const posicoes: Posicao[] = ["ZAG", "LAT", "VOL", "MEI", "PON", "ATA"];
const porPos = posicoes.map((p) => {
  const g = cs.filter((c) => c.posicao === p);
  const temporadasTitular = g.flatMap((c) => c.historico.filter((h) => h.titular >= 25));
  return {
    posicao: p,
    golsPorTemporadaTitular: r1(media(temporadasTitular.map((h) => h.gols))),
    assistPorTemporadaTitular: r1(media(temporadasTitular.map((h) => h.assist))),
    maxGolsTemporada: Math.max(0, ...temporadasTitular.map((h) => h.gols)),
    notaMediaTitular: r1(media(temporadasTitular.map((h) => h.notaMedia))),
    golsCarreiraMediana: q(g.map((c) => c.totais.gols), 0.5),
  };
});

const temporadas = cs.reduce((a, c) => a + c.historico.length, 0);
const geral = {
  carreiras: N, segundos: r1(seg),
  idadeAposentadoria: r1(media(cs.map((c) => c.idade))),
  temporadasPorCarreira: r1(temporadas / N),
  jogosCarreiraMediana: q(cs.map((c) => c.totais.jogos), 0.5),
  lesoesPorTemporada: r1(cs.reduce((a, c) => a + c.totais.lesoes, 0) / temporadas),
  semanasLesionadoPorTemporada: r1(cs.reduce((a, c) => a + c.totais.semanasLesionado, 0) / temporadas),
  transferenciasPorCarreira: r1(media(cs.map((c) => c.totais.transferencias))),
  titulosPorCarreira: r1(media(cs.map((c) => c.totais.titulos))),
  chegaramEuropaTop: Math.round((100 * cs.filter((c) => c.totais.nivelMax === 1).length) / N) + "%",
  nuncaSairamDaSerieB: Math.round((100 * cs.filter((c) => c.totais.nivelMax >= 4).length) / N) + "%",
  patrimonio: { p10: Math.round(q(cs.map((c) => c.patrimonio), 0.1)), mediana: Math.round(q(cs.map((c) => c.patrimonio), 0.5)), p90: Math.round(q(cs.map((c) => c.patrimonio), 0.9)) },
  salarioMax: { p10: Math.round(q(cs.map((c) => c.totais.salarioMax), 0.1)), mediana: Math.round(q(cs.map((c) => c.totais.salarioMax), 0.5)), p90: Math.round(q(cs.map((c) => c.totais.salarioMax), 0.9)) },
};

const saida = { geral, porPotencial: porPot, porPosicao: porPos };
console.log(JSON.stringify(saida, null, 1));
writeFileSync(new URL("../resultados-balanceamento.json", import.meta.url), JSON.stringify(saida, null, 2));
