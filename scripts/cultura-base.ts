// Compara a estreia no profissional do mesmo garoto em clubes de culturas diferentes.
import { carregarPacote } from "../src/pacote.js";
import { criarJogador } from "../src/dna.js";
import { novoJogo, semanaAutomatica, SEMANAS_TEMPORADA } from "../src/jogo.js";
import { culturaBase } from "../src/identidade.js";
const pacote = carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
const clubes = ["SAN", "PAL", "FLA", "COR", "BOT", "BAH"];
for (const id of clubes) {
  let jogos17 = 0, jogos18 = 0, jogos19 = 0, estreia: number[] = [];
  const N = 16;
  for (let k = 0; k < N; k++) {
    const pos = (["ATA", "MEI", "ZAG", "LAT", "PON", "VOL"] as const)[k % 6];
    const r = criarJogador({ nome: `G${k}`, pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: pos, semente: `cb${k}` });
    const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: id }, id, `cb${k}`);
    let primeira = -1;
    for (let t = 0; t < 4; t++) {
      for (let w = 0; w < SEMANAS_TEMPORADA; w++) semanaAutomatica(pacote, s, false);
      const h = s.carreira.historico.at(-1)!;
      if (s.carreira.clubeId !== id) break;
      if (t === 1) jogos17 += h.jogos; if (t === 2) jogos18 += h.jogos; if (t === 3) jogos19 += h.jogos;
      if (primeira < 0 && h.jogos > 0) primeira = 16 + t;
    }
    estreia.push(primeira < 0 ? 20 : primeira);
  }
  console.log(`${id} (cultura ${culturaBase(id)}): jogos no profissional por temporada aos 17/18/19 = ${(jogos17 / N).toFixed(1)} / ${(jogos18 / N).toFixed(1)} / ${(jogos19 / N).toFixed(1)} · estreia média ${(estreia.reduce((a, b) => a + b, 0) / N).toFixed(1)} anos`);
}
