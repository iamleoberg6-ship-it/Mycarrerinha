import { carregarPacote } from "../src/pacote.js";
import { criarJogador } from "../src/dna.js";
import { novoJogo, semanaAutomatica } from "../src/jogo.js";
import { ATRIBUTOS } from "../src/atributos.js";
import { trocasDeTecnico, tecnicoDoClube, infoClube, sincronizarMundo, lesoesQueComecam, mundo } from "../src/mundo.js";
const pacote = carregarPacote(new URL("../data/pacote-brasil-serie-a-v0.3.json", import.meta.url).pathname);
for (let t = 0; t <= 4; t++) {
  sincronizarMundo(pacote, "viva", t);
  const tr = trocasDeTecnico(pacote);
  let les = 0; for (let r = 0; r < 38; r++) les += lesoesQueComecam(pacote, r).length;
  console.log(t, "trocas", tr.length, "lesões", les, tr.filter((x) => (mundo(pacote).clube[x.clubeId]?.forca ?? 0) >= 80).map((x) => `${infoClube(pacote, x.clubeId)?.nome}: ${x.saiu}→${x.entrou} ${x.motivo}${x.de ? " de " + x.de : ""}`).join("; "));
  console.log("  RMA", JSON.stringify(tecnicoDoClube(pacote, "ES-RMA")), "FLA", tecnicoDoClube(pacote, "FLA")?.nome);
}
const r = criarJogador({ nome: "Sim V", pais: "BRA", familia: "media", formacao: "escolinha", alturaCm: 180, pe: "direito", posicao: "ATA", semente: "viva" });
const s = novoJogo(pacote, { resultado: r, aparencia: {}, clube: null }, "VAS", "viva");
for (const k of ATRIBUTOS) s.jogador.at[k] = 74; s.jogador.idade = 22; s.carreira.formacao = false; s.carreira.anosContrato = 10;
const t0 = Date.now();
while (s.carreira.temporada < 4) semanaAutomatica(pacote, s, false);
console.log((Date.now() - t0) / 1000, "s", s.carreira.tecnico);
console.log(s.noticias.filter((n) => /técnico|Técnico|Dança|fora por|se machuca/.test(n.titulo)).slice(0, 10).map((n) => n.semana + " " + n.titulo + " — " + n.texto).join("\n"));
