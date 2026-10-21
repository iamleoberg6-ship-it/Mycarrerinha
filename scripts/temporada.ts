// Valida o placar: simula N temporadas da Série A do pacote e compara com a realidade.
import { RNG } from "../src/rng.js";
import { ligaDoPacote, simularTemporada } from "../src/liga.js";
import { carregarPacote } from "../src/pacote.js";

const N = Number(process.argv[2] ?? 500);
const liga = ligaDoPacote(carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname));
const rng = new RNG("temporada");
let gpj = 0, vc = 0, emp = 0, campeao = 0, z4 = 0, lanterna = 0;
const titulos: Record<string, number> = {};
for (let i = 0; i < N; i++) {
  const r = simularTemporada(rng, liga);
  gpj += r.golsPorJogo; vc += r.vitCasa; emp += r.empates;
  campeao += r.tabela[0].pts; z4 += r.tabela[16].pts; lanterna += r.tabela[19].pts;
  titulos[r.tabela[0].clube] = (titulos[r.tabela[0].clube] ?? 0) + 1;
}
const nome = Object.fromEntries(liga.clubes.map((c) => [c.id, c.nome]));
const res = {
  temporadas: N,
  golsPorJogo: +(gpj / N).toFixed(2),
  vitoriaMandante: +((100 * vc) / N).toFixed(1),
  empates: +((100 * emp) / N).toFixed(1),
  pontosCampeao: +(campeao / N).toFixed(1),
  pontos17o: +(z4 / N).toFixed(1),
  pontosLanterna: +(lanterna / N).toFixed(1),
  titulos: Object.entries(titulos).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c, n]) => `${nome[c]} ${((100 * n) / N).toFixed(0)}%`),
};
console.log(JSON.stringify(res, null, 1));
